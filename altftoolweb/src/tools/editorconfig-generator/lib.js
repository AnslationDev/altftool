/**
 * EditorConfig file generator.
 *
 * Property names and allowed values follow the EditorConfig specification
 * (https://editorconfig.org and the file-format spec at
 * https://spec.editorconfig.org). Universal properties:
 *   indent_style              tab | space
 *   indent_size               positive integer (or "tab" to follow tab_width)
 *   tab_width                 positive integer, defaults to indent_size
 *   end_of_line               lf | cr | crlf
 *   charset                   latin1 | utf-8 | utf-8-bom | utf-16be | utf-16le
 *   trim_trailing_whitespace  true | false
 *   insert_final_newline      true | false
 *   root                      true — only in the preamble of the top-most file
 * max_line_length is widely supported (a positive integer or "off") but is
 * not part of the universal core, so it is emitted only when set.
 */

export const INDENT_STYLES = ["space", "tab"];
export const END_OF_LINE_VALUES = ["lf", "crlf", "cr"];
export const CHARSETS = ["utf-8", "utf-8-bom", "utf-16be", "utf-16le", "latin1"];

/** Spec allows any positive integer; editors rarely honour more than this. */
export const MAX_INDENT_SIZE = 16;
export const MAX_LINE_LENGTH_CAP = 400;

/**
 * Conventional per-file-type sections. Sources for each convention:
 *  - Makefiles require hard tabs (POSIX make syntax).
 *  - Markdown uses two trailing spaces as a hard line break, so trimming
 *    trailing whitespace corrupts content.
 *  - YAML forbids tabs for indentation (YAML 1.2 spec) and is 2-space by custom.
 *  - PEP 8 prescribes 4-space indentation for Python.
 *  - gofmt formats Go with tabs.
 *  - Windows batch files traditionally need CRLF line endings.
 */
export const SECTION_PRESETS = [
  { id: "makefile", glob: "Makefile", label: "Makefile — hard tabs", props: { indent_style: "tab" } },
  { id: "markdown", glob: "*.md", label: "Markdown — keep trailing spaces", props: { trim_trailing_whitespace: false } },
  { id: "yaml", glob: "*.{yml,yaml}", label: "YAML — 2 spaces", props: { indent_style: "space", indent_size: 2 } },
  { id: "python", glob: "*.py", label: "Python — 4 spaces (PEP 8)", props: { indent_style: "space", indent_size: 4 } },
  { id: "go", glob: "*.go", label: "Go — tabs (gofmt)", props: { indent_style: "tab" } },
  { id: "json", glob: "*.json", label: "JSON — 2 spaces", props: { indent_style: "space", indent_size: 2 } },
  { id: "bat", glob: "*.{bat,cmd}", label: "Windows batch — CRLF", props: { end_of_line: "crlf" } },
];

function formatValue(value) {
  return typeof value === "boolean" ? String(value) : String(value);
}

function validateProps(props, where) {
  if (props.indent_style !== undefined && !INDENT_STYLES.includes(props.indent_style)) {
    return `${where}: indent_style must be "space" or "tab".`;
  }
  if (props.indent_size !== undefined) {
    const size = Number(props.indent_size);
    if (!Number.isInteger(size) || size < 1 || size > MAX_INDENT_SIZE) {
      return `${where}: indent_size must be a whole number from 1 to ${MAX_INDENT_SIZE}.`;
    }
  }
  if (props.end_of_line !== undefined && !END_OF_LINE_VALUES.includes(props.end_of_line)) {
    return `${where}: end_of_line must be lf, crlf or cr.`;
  }
  if (props.charset !== undefined && !CHARSETS.includes(props.charset)) {
    return `${where}: charset must be one of ${CHARSETS.join(", ")}.`;
  }
  if (props.max_line_length !== undefined && props.max_line_length !== "" && props.max_line_length !== "off") {
    const length = Number(props.max_line_length);
    if (!Number.isInteger(length) || length < 1 || length > MAX_LINE_LENGTH_CAP) {
      return `${where}: max_line_length must be "off" or a whole number from 1 to ${MAX_LINE_LENGTH_CAP}.`;
    }
  }
  return null;
}

/** Order properties the way the EditorConfig docs list them. */
const PROP_ORDER = [
  "indent_style",
  "indent_size",
  "tab_width",
  "end_of_line",
  "charset",
  "trim_trailing_whitespace",
  "insert_final_newline",
  "max_line_length",
];

function sectionLines(glob, props) {
  const lines = [`[${glob}]`];
  for (const key of PROP_ORDER) {
    const value = props[key];
    if (value === undefined || value === "") continue;
    lines.push(`${key} = ${formatValue(value)}`);
  }
  return lines;
}

/**
 * Build the .editorconfig text.
 *
 * @param {object} input
 * @param {boolean} [input.root=true]  emit "root = true" preamble
 * @param {object} input.global        properties for the [*] section
 * @param {Array<{glob:string, props:object}>} [input.sections]
 * @returns {{text:string, sectionCount:number}|{error:string}}
 */
export function buildEditorConfig({ root = true, global = {}, sections = [] } = {}) {
  const globalProblem = validateProps(global, "Global settings");
  if (globalProblem) return { error: globalProblem };

  const globalBody = sectionLines("*", global);
  if (globalBody.length === 1) {
    return { error: "Set at least one property in the global [*] section." };
  }

  const seen = new Set();
  const blocks = [];
  for (let index = 0; index < sections.length; index += 1) {
    const { glob, props } = sections[index];
    const cleanGlob = String(glob ?? "").trim();
    if (cleanGlob === "") return { error: `Section ${index + 1}: enter a file glob such as *.md.` };
    if (seen.has(cleanGlob)) {
      return { error: `Section ${index + 1}: the glob "${cleanGlob}" appears twice.` };
    }
    seen.add(cleanGlob);
    const problem = validateProps(props ?? {}, `Section [${cleanGlob}]`);
    if (problem) return { error: problem };
    const body = sectionLines(cleanGlob, props ?? {});
    if (body.length === 1) {
      return { error: `Section [${cleanGlob}] has no properties — remove it or set one.` };
    }
    blocks.push(body);
  }

  const parts = [];
  parts.push("# EditorConfig — https://editorconfig.org");
  if (root) parts.push("root = true");
  parts.push("");
  parts.push(globalBody.join("\n"));
  for (const block of blocks) {
    parts.push("");
    parts.push(block.join("\n"));
  }

  return { text: `${parts.join("\n")}\n`, sectionCount: 1 + blocks.length };
}
