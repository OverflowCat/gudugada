import { Hono } from 'hono';
import { Octokit } from '@octokit/rest';
import { Base64 } from 'js-base64';
import { CSS, errorPage } from './page';


const app = new Hono();

function generateId(length = 24) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length },
    () => chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

app.post('/comment', async (c) => {
  const formData = await c.req.formData();
  const name = formData.get('fields[name]') as string;
  let email = formData.get('fields[email]') as string;
  email = await sha256(email.trim());
  let message = formData.get('fields[message]') as string;
  const slug = formData.get('options[slug]') as string;
  message = message.trim();
  if (!message) {
    return c.html(errorPage('评论不能为空'));
  }
  if (slug == "test" || slug == "false" || !slug) {
    return c.html(errorPage('评论失败'));
  }

  const timestamp = Date.now();
  const date = new Date(timestamp).toISOString();

  const content = `---
id: ${generateId()}
name: ${name}
email: ${email}
date: ${date}
---
${message}`;

  const filePath = `src/comments/${slug}/entry${timestamp}.md`;
  const branch = `comment/${timestamp}`;

  const octokit = new Octokit({
    auth: c.env.GITHUB_TOKEN
  });

  // Create a new branch
  try {
    const srcRef = await octokit.git.getRef({
      owner: 'OverflowCat',
      repo: 'blog',
      ref: 'heads/src'
    });
    await octokit.git.createRef({
      owner: 'OverflowCat',
      repo: 'blog',
      ref: `refs/heads/${branch}`,
      sha: srcRef.data.object.sha
    });

    // Create file in the new branch
    await octokit.repos.createOrUpdateFileContents({
      owner: 'OverflowCat',
      repo: 'blog',
      path: filePath,
      message: `Add comment from ${name}`,
      content: Base64.encode(content),
      branch,
    });

    // Create PR
    const pullRequest = await octokit.pulls.create({
      owner: 'OverflowCat',
      repo: 'blog',
      title: `Comment from ${name}`,
      head: branch,
      base: 'src',
      body: `New comment on ${slug}`
    });

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
