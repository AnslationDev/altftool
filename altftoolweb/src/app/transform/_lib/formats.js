/**
 * Format metadata shared by the shell (download filenames, MIME types, labels
 * and language badges). Keyed by the `from`/`to` values used in the manifest.
 */

const EXTENSION = {
  json: "json",
  yaml: "yaml",
  toml: "toml",
  typescript: "ts",
  javascript: "js",
  go: "go",
  java: "java",
  kotlin: "kt",
  rust: "rs",
  scala: "scala",
  graphql: "graphql",
  protobuf: "proto",
  sql: "sql",
  jsx: "jsx",
  pug: "pug",
  html: "html",
  css: "css",
  markdown: "md",
  xml: "xml",
  svg: "svg",
  text: "txt",
};

const LABEL = {
  json: "JSON",
  yaml: "YAML",
  toml: "TOML",
  typescript: "TypeScript",
  javascript: "JavaScript",
  go: "Go",
  java: "Java",
  kotlin: "Kotlin",
  rust: "Rust",
  scala: "Scala",
  graphql: "GraphQL",
  protobuf: "Protobuf",
  sql: "SQL",
  jsx: "JSX",
  pug: "Pug",
  html: "HTML",
  css: "CSS",
  markdown: "Markdown",
  xml: "XML",
  svg: "SVG",
  text: "Text",
};

const MIME = {
  json: "application/json",
  xml: "application/xml",
  html: "text/html",
  css: "text/css",
  svg: "image/svg+xml",
  markdown: "text/markdown",
};

/** @param {string} fmt */
export function extensionFor(fmt) {
  return EXTENSION[fmt] || "txt";
}

/** @param {string} fmt */
export function labelFor(fmt) {
  return LABEL[fmt] || (fmt ? fmt.toUpperCase() : "Text");
}

/** @param {string} fmt */
export function mimeFor(fmt) {
  return MIME[fmt] || "text/plain";
}
