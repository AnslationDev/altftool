import { load } from "js-yaml";

/**
 * YAML 1.2 spec §9.1.2 — a line that is exactly "---" (optionally followed by
 * content on the same line) at column 0 starts a new document.
 */
export const DOC_START_RE = /^---(\s|$)/;

/**
 * YAML 1.2 spec §9.1.3 — a line that is exactly "..." at column 0 ends the
 * current document without starting a new one.
 */
export const DOC_END_RE = /^\.\.\.(\s|$)/;

/**
 * YAML 1.2 spec §6.8 — directives ("%YAML 1.2", "%TAG !e! tag:example.com,2000:")
 * sit immediately before the "---" of the document they belong to.
 */
export const DIRECTIVE_RE = /^%\S/;

/**
 * YAML 1.2 spec §8.1 — a block scalar header is "|" or ">" optionally followed
 * by a chomping indicator (+/-) and an explicit indentation digit (1-9).
 * Inside such a scalar, "---" is literal text and must NOT split the document.
 */
export const BLOCK_SCALAR_HEADER_RE = /(?:^|[\s:])[|>][+-]?[1-9]?[+-]?\s*(?:#.*)?$/;

/** Default padding width for generated file names (doc-01.yaml, doc-02.yaml). */
export const DEFAULT_NAME_PADDING = 2;

/** Keys checked, in order, when naming a document from its own content. */
export const NAME_KEYS = ["name", "id", "title", "key"];

const isBlank = (line) => line.trim() === "";
const isComment = (line) => line.trimStart().startsWith("#");

function trimBlankEdges(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && isBlank(lines[start])) start += 1;
  while (end > start && isBlank(lines[end - 1])) end -= 1;
  return lines.slice(start, end);
}

/**
 * Slugify a value into a safe file-name stem: lowercase, ASCII word chars and
 * dashes only, collapsed, trimmed to 60 characters.
 */
export function slugifyName(value) {
  const text = String(value == null ? "" : value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return text.slice(0, 60);
}

/** Read a nested key path such as "metadata.name" without throwing. */
function readPath(value, path) {
  let node = value;
  for (const key of path) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return undefined;
    node = node[key];
  }
  return typeof node === "string" || typeof node === "number" ? String(node) : undefined;
}

/**
 * Kubernetes manifests are the most common multi-document YAML, so a document
 * that has both `kind` and `metadata.name` is named "<kind>-<name>".
 */
export function describeDocument(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const kind = readPath(parsed, ["kind"]);
  const metaName = readPath(parsed, ["metadata", "name"]);
  if (kind && metaName) return `${kind}-${metaName}`;
  if (metaName) return metaName;
  if (kind) return kind;
  for (const key of NAME_KEYS) {
    const direct = readPath(parsed, [key]);
    if (direct) return direct;
  }
  return null;
}

/**
 * Locate document boundaries. Returns marks in line order.
 * Skips "---" that appears inside a block scalar (| or >) because there it is
 * literal text, not a document separator.
 */
function scanMarks(lines) {
  const marks = [];
  let blockIndent = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const firstChar = line.search(/\S/);

    if (blockIndent >= 0) {
      if (firstChar === -1) continue; // blank lines stay inside the scalar
      if (firstChar > blockIndent) continue; // still indented inside the scalar
      blockIndent = -1; // dedented: the block scalar ended on the previous line
    }

    if (DOC_START_RE.test(line)) {
      marks.push({ line: i, type: "start" });
      continue;
    }
    if (DOC_END_RE.test(line)) {
      marks.push({ line: i, type: "end" });
      continue;
    }
    if (firstChar !== -1 && !isComment(line) && BLOCK_SCALAR_HEADER_RE.test(line)) {
      blockIndent = firstChar;
    }
  }

  return marks;
}

/**
 * Split a multi-document YAML string into its individual documents.
 *
 * @param {string} text raw YAML source
 * @param {{ validate?: boolean, keepComments?: boolean }} options
 * @returns {{ documents: Array, count: number, totalLines: number, validCount: number,
 *   invalidCount: number } | { error: string }}
 */
export function splitYamlDocuments(text, options = {}) {
  const { validate = true } = options;
  if (typeof text !== "string") return { error: "Input must be text." };
  if (text.trim() === "") return { error: "Paste some YAML to split." };

  const lines = text.split(/\r?\n/);
  const marks = scanMarks(lines);
  const markAt = new Map(marks.map((mark) => [mark.line, mark.type]));

  const documents = [];
  let buffer = [];
  let bufferStart = 0;
  let pendingDirectives = [];
  let explicitStart = false;

  const flush = (endLine) => {
    const body = trimBlankEdges(buffer);
    const meaningful = body.filter((line) => !isBlank(line) && !isComment(line));

    if (meaningful.length > 0 && meaningful.every((line) => DIRECTIVE_RE.test(line.trim()))) {
      // Directives only: hold them for the document that follows.
      pendingDirectives = pendingDirectives.concat(body);
      buffer = [];
      return;
    }

    if (body.length === 0 && pendingDirectives.length === 0) {
      buffer = [];
      return;
    }

    const directives = pendingDirectives.slice();
    pendingDirectives = [];

    documents.push({
      index: documents.length,
      startLine: bufferStart + 1,
      endLine: Math.max(bufferStart + 1, endLine),
      directives,
      body: body.join("\n"),
      explicitStart,
      lineCount: body.length,
    });
    buffer = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const type = markAt.get(i);
    if (type === "start") {
      flush(i);
      bufferStart = i;
      explicitStart = true;
      const inline = lines[i].replace(DOC_START_RE, "").trim();
      // A node property on the "---" line (a "!tag" or "&anchor") only has
      // meaning while the marker is present, so that line is kept verbatim.
      if (/^[!&]/.test(inline)) buffer.push(`--- ${inline}`);
      else if (inline !== "") buffer.push(inline);
      continue;
    }
    if (type === "end") {
      flush(i + 1);
      bufferStart = i + 1;
      explicitStart = false;
      continue;
    }
    if (buffer.length === 0 && isBlank(lines[i])) {
      bufferStart = i;
      continue;
    }
    buffer.push(lines[i]);
  }
  flush(lines.length);

  if (documents.length === 0) {
    return { error: "No YAML documents found — the input is only comments or blank lines." };
  }

  let validCount = 0;
  let invalidCount = 0;

  const enriched = documents.map((doc) => {
    const content = doc.directives.length > 0
      ? `${doc.directives.join("\n")}\n---\n${doc.body}\n`
      : `${doc.body}\n`;

    let parsed;
    let error = null;
    if (validate) {
      try {
        parsed = load(content);
        validCount += 1;
      } catch (loadError) {
        error = loadError && loadError.reason
          ? `${loadError.reason} (line ${(loadError.mark && loadError.mark.line + 1) || "?"})`
          : "Document is not valid YAML.";
        invalidCount += 1;
      }
    }

    const label = validate && !error ? describeDocument(parsed) : null;

    return {
      index: doc.index,
      startLine: doc.startLine,
      endLine: doc.endLine,
      lineCount: doc.lineCount,
      content,
      label,
      error,
      isEmptyDocument: doc.body.trim() === "",
    };
  });

  return {
    documents: enriched,
    count: enriched.length,
    totalLines: lines.length,
    validCount,
    invalidCount,
  };
}

/**
 * Suggest a unique file name per document. Falls back to "<prefix>-NN" and
 * appends "-2", "-3"… when two documents would collide.
 */
export function suggestFileNames(documents, options = {}) {
  const {
    prefix = "doc",
    extension = "yaml",
    padding = DEFAULT_NAME_PADDING,
    useLabels = true,
  } = options;
  if (!Array.isArray(documents) || documents.length === 0) return [];

  const ext = String(extension).replace(/^\.+/, "") || "yaml";
  const used = new Map();

  return documents.map((doc, position) => {
    const number = String(position + 1).padStart(Math.max(1, padding), "0");
    const labelSlug = useLabels && doc && doc.label ? slugifyName(doc.label) : "";
    const stem = labelSlug || `${slugifyName(prefix) || "doc"}-${number}`;
    const seen = used.get(stem) || 0;
    used.set(stem, seen + 1);
    const unique = seen === 0 ? stem : `${stem}-${seen + 1}`;
    return `${unique}.${ext}`;
  });
}

/**
 * Recombine documents into one multi-document YAML stream.
 * Every document after the first is preceded by "---" on its own line.
 */
export function joinYamlDocuments(contents, options = {}) {
  const { leadingSeparator = false, endMarker = false } = options;
  if (!Array.isArray(contents)) return { error: "Provide a list of documents to join." };

  const parts = contents
    .map((item) => String(item == null ? "" : item).replace(/^﻿/, "").trim())
    .filter((item) => item !== "");

  if (parts.length === 0) return { error: "There is nothing to join — every document is empty." };

  const normalised = parts.map((part) => part.replace(/^---\s*\n?/, "").trim());
  let output = normalised.join("\n---\n");
  if (leadingSeparator) output = `---\n${output}`;
  if (endMarker) output = `${output}\n...`;
  return { output: `${output}\n`, count: normalised.length };
}
