import { type Env, Hono } from "hono";
import { Octokit } from "@octokit/rest";
import { Base64 } from "js-base64";
import { CSS, errorPage } from "./page";
import { formatFrontmatter } from "./format";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

function generateId(length = 24) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

app.post("/comment", async (c) => {
  const formData = await c.req.formData();

  const name = formData.get("user[name]") as string;
  let email = formData.get("user[email]");
  let message = formData.get("message") as string;
  const captcha = formData.get("captcha") as string;
  console.info("captcha", captcha);
  console.info("email", email);
  console.info("message", message);
  console.info("name", name);

  const slug = formData.get("slug") as string;
  console.info("slug", slug);
  message = message.trim();
  const reasons = [];
  if (!message || typeof message !== "string") {
    reasons.push("评论不能为空");
  }
  const url = formData.get("user[url]");
  if (!url || typeof url !== "string") {
    reasons.push("URL 不能为空");
  }
  if (slug === "test" || slug === "false" || !slug) {
    reasons.push("这个页面不提供评论");
  }
  if (reasons.length > 0) {
    return c.html(errorPage(reasons.join("<br />")));
  }
  if (
    typeof url !== "string" ||
    typeof message !== "string" ||
    (email && typeof email !== "string") ||
    typeof name !== "string"
  ) {
    return c.html(errorPage("数据格式错误"));
  }

  const timestamp = Date.now();
  const date = new Date(timestamp).toISOString();

  const data: Record<string, string> = {
    id: generateId(),
    name,
    url,
    date,
  };
  if (typeof email === "string" && email.length > 0) data.email = email;

  const filePath = `src/comments/${slug}/entry${timestamp}.md`;
  const branch = `comment/${timestamp}`;

  const octokit = new Octokit({
    // @ts-ignore
    auth: c.env.GITHUB_TOKEN,
  });

  // SQL
  const db = c.env.DB;

  // Create a new branch
  try {
    const comments = db.prepare(
      "INSERT INTO comments (name, url, email, message, slug, timestamp, pr_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'));",
    );
    const resp1 = comments
      .bind(name, url, email, message, slug, timestamp, 0)
      .run();
    console.info("INSERT resp", resp1);

    if (email) email = await sha256(email.trim());

    const content = `---
  ${formatFrontmatter(data)}
  ---
  ${message}`;
    const srcRef = await octokit.git.getRef({
      owner: "OverflowCat",
      repo: "blog",
      ref: "heads/src",
    });
    await octokit.git.createRef({
      owner: "OverflowCat",
      repo: "blog",
      ref: `refs/heads/${branch}`,
      sha: srcRef.data.object.sha,
    });

    // Create file in the new branch
    await octokit.repos.createOrUpdateFileContents({
      owner: "OverflowCat",
      repo: "blog",
      path: filePath,
      message: `comment: on \`${slug}\` by ${name}`,
      content: Base64.encode(content),
      branch,
    });

    // Create PR
    const pullRequest = await octokit.pulls.create({
      owner: "OverflowCat",
      repo: "blog",
      title: `Comment from ${name}`,
      head: branch,
      base: "src",
      body: `New comment on ${slug}`,
    });

    const pr_number = pullRequest.data.number;
    // Update comments table
    const comments2 = db.prepare(
      "UPDATE comments SET pr_number = ? WHERE id = ?",
    );
    const resp = await comments2.bind(pr_number, data.id).run();
    console.info("UPDATE resp", resp);

    return c.html(`
    <html>
      <head>
        <meta http-equiv="refresh" content="5;url=${pullRequest.data.html_url}">
        <title>成功</title>
        <style>${CSS}</style>
      </head>
      <body>
        <main>
          <h1>提交成功！</h1>
          <p>您的评论已成功提交，并将在审核后显示。</p>
          <p>您将被重定向到生成的 Pull Request 页面。</p>
          <p><a href="${pullRequest.data.html_url}">如果没有自动重定向，请点击这里。</a></p>
        </main>
      </body>
    </html>
  `);
  } catch (error) {
    return c.html(errorPage(error));
  }
});

export default app;
