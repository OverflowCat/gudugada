const escapeStringInYmlDoubleQuoted = (str: string) => {
  return str.replace(/"/g, '\\"');
};

export function formatFrontmatter(data: Record<string, string>) {
  return Object.entries(data)
    .map(([key, value]) =>
      key === "name" || key === "url"
        ? `${key}: "${escapeStringInYmlDoubleQuoted(value)}"`
        : `${key}: ${value}`,
    )
    .join("\n");
}
