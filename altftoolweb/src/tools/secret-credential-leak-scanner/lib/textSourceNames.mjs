const TEXT_EXTENSIONS = new Set([
  "c",
  "conf",
  "config",
  "cpp",
  "cs",
  "css",
  "env",
  "go",
  "h",
  "html",
  "ini",
  "java",
  "js",
  "json",
  "jsx",
  "kt",
  "log",
  "md",
  "mjs",
  "php",
  "properties",
  "py",
  "rb",
  "rs",
  "sh",
  "sql",
  "toml",
  "ts",
  "tsx",
  "txt",
  "xml",
  "yaml",
  "yml",
]);

const TEXT_BASENAMES = new Set([
  ".env",
  ".npmrc",
  ".pypirc",
  ".netrc",
  "authorized_keys",
  "credentials",
  "dockerfile",
  "gemfile",
  "known_hosts",
  "makefile",
  "procfile",
  "rakefile",
]);

export function extensionOfTextSource(name) {
  const basename = String(name || "")
    .replaceAll("\\", "/")
    .split("/")
    .at(-1)
    ?.toLowerCase();
  if (!basename) return "";
  const dotIndex = basename.lastIndexOf(".");
  return dotIndex >= 0 && dotIndex < basename.length - 1
    ? basename.slice(dotIndex + 1)
    : "";
}

export function isSupportedSecretTextName(name) {
  const basename = String(name || "")
    .replaceAll("\\", "/")
    .split("/")
    .at(-1)
    ?.toLowerCase();
  if (!basename) return false;
  return (
    TEXT_BASENAMES.has(basename) ||
    TEXT_EXTENSIONS.has(extensionOfTextSource(basename))
  );
}
