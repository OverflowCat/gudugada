const escapeStringInYmlDoubleQuoted = (str: string) => {
	return str.replace(/"/g, '\\"');
};

export function formatFrontmatter(data: Record<string, string>) {
	return Object.entries(data)
		.map(([key, value]) => `${key}: "${escapeStringInYmlDoubleQuoted(value)}"`)
		.join("\n");
}
