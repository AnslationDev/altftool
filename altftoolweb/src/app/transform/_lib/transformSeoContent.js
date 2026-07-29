/**
 * Per-converter GEO/SEO content, generated from the manifest.
 *
 * Mirrors the established pattern in src/app/tools/toolSeoContent.js: a pure,
 * deterministic builder that turns registry metadata into answer-first prose,
 * a spec table, ordered steps and FAQs — never 64 hand-written blobs.
 *
 * Every fact here is derived from a field the app itself reads at runtime
 * (`from`/`to` drive the editor language and download filename, `engine`
 * decides browser-vs-API execution, `lib` names the actual dependency), so the
 * copy cannot drift away from what the converter really does.
 *
 * Pure module: imports only the manifest and format tables. No `server-only`,
 * no React, no network — safe to import from a server component or a test.
 */

import { TOOLS } from "./manifest.js";
import { extensionFor, labelFor, mimeFor } from "./formats.js";

/** @typedef {import("./manifest.js").ToolMeta} ToolMeta */

/**
 * Maximum input a server-engine converter accepts per request.
 * Mirrors MAX_TRANSFORM_INPUT_CHARS in ../api/[slug]/route.js.
 */
const SERVER_INPUT_LIMIT = 200_000;

/**
 * Imperative → third-person for the manifest description, so it can be folded
 * into the answer-first sentence instead of trailing behind it. Covers every
 * opening verb currently in the manifest; an unknown verb falls back to a
 * two-sentence intro rather than emitting broken grammar.
 */
const VERB_FORMS = {
  Build: "builds",
  Canonicalize: "canonicalizes",
  Compact: "compacts",
  Compile: "compiles",
  Convert: "converts",
  Create: "creates",
  Derive: "derives",
  Emit: "emits",
  Expand: "expands",
  Flatten: "flattens",
  Frame: "frames",
  Generate: "generates",
  Infer: "infers",
  Map: "maps",
  Parse: "parses",
  Produce: "produces",
  Render: "renders",
  Rewrite: "rewrites",
  Run: "runs",
  Serialize: "serializes",
  Strip: "strips",
  Transpile: "transpiles",
  Turn: "turns",
};

/**
 * One conservative, verifiable sentence of context per manifest category.
 * Deliberately states what the INPUT must be — the single most common reason a
 * conversion fails — rather than praising the tool.
 */
const CATEGORY_NOTES = {
  JSON:
    "The shape of the output is inferred from the JSON sample you paste, so the keys, types and nesting in your input decide the keys, types and nesting you get back.",
  "JSON Schema":
    "The input is a JSON Schema document rather than raw data — the converter reads the schema's declared types and constraints, not an example payload.",
  GraphQL:
    "The input is a GraphQL schema written in SDL, not a query or a response, so paste the type definitions your server exposes.",
  "JSON-LD":
    "These are the algorithmic JSON-LD transformations defined by the JSON-LD 1.1 specification, applied by the jsonld library — the result describes the same data in a different canonical form.",
  TypeScript:
    "The input is TypeScript source: the types, interfaces and declarations in what you paste are what the converter reads.",
  Flow:
    "Flow source is JavaScript carrying Flow type annotations, which is why the input is handled as JavaScript — paste the annotated file exactly as it appears in your project.",
  CSS:
    "This converter moves styles between the shapes a CSS-in-JS toolchain expects: plain CSS declarations, JavaScript style objects and template literals.",
  SVG:
    "The input is SVG markup — paste the contents of the .svg file, including the outer <svg> element.",
  HTML:
    "The input is HTML markup, either a fragment or a full document.",
  JavaScript:
    "The input is JavaScript source — an object literal or module, pasted exactly as it appears in your editor.",
};

/**
 * Server converters that touch the filesystem during a conversion. Called out
 * explicitly so the privacy copy stays literally true.
 * Evidence: transformers/typescript-to-json-schema.js writes the input to
 * os.tmpdir() because ts-json-schema-generator reads from a path, then removes
 * it in a `finally` block.
 */
const TEMP_FILE_SLUGS = new Set(["typescript-to-json-schema"]);

/** @param {string} value */
function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

/**
 * Split a manifest title into its source and target names. Every title in the
 * manifest is exactly "<source> to <target>", which gives a far better human
 * label than the raw `from`/`to` keys ("Flow", not "JavaScript").
 * @param {ToolMeta} tool
 */
function splitTitle(tool) {
  const parts = cleanText(tool.title).split(" to ");
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { source: parts[0], target: parts[1] };
  }
  return { source: labelFor(tool.from), target: labelFor(tool.to) };
}

/**
 * Human label plus the underlying syntax when the two differ — "Flow
 * (JavaScript syntax)", "N-Quads (plain text)". The syntax is not decorative:
 * it is the editor language and the download extension the app actually uses.
 * @param {string} name
 * @param {string} format
 */
function formatCell(name, format) {
  if (format === "text") {
    return name.toLowerCase() === "text" ? "Plain text" : `${name} (plain text)`;
  }
  const syntax = labelFor(format);
  if (syntax.toLowerCase() === name.toLowerCase()) return name;
  return `${name} (${syntax} syntax)`;
}

/**
 * @param {ToolMeta} tool
 * @returns {string|null} the description as a third-person verb phrase, or
 *   null when the opening verb is not in VERB_FORMS.
 */
function descriptionAsClause(tool) {
  const description = cleanText(tool.description);
  const [first, ...rest] = description.split(" ");
  const verb = VERB_FORMS[first];
  if (!verb || !rest.length) return null;
  return `${verb} ${rest.join(" ")}`.replace(/\.$/, "");
}

/**
 * Converters in the same manifest category, for the in-content "related
 * converters" links. The sidebar lists the whole section; this gives the page
 * real descriptive anchor text to its nearest siblings.
 * @param {ToolMeta} tool
 * @param {number} limit
 */
function siblingTools(tool, limit = 6) {
  return TOOLS.filter((item) => item.category === tool.category && item.slug !== tool.slug).slice(
    0,
    limit,
  );
}

/**
 * Build the full GEO content object for one converter.
 *
 * @param {ToolMeta} tool
 * @returns {{
 *   title: string,
 *   sourceName: string,
 *   targetName: string,
 *   answer: string,
 *   detail: string,
 *   categoryNote: string|null,
 *   spec: { label: string, value: string }[],
 *   howToName: string,
 *   steps: string[],
 *   faqs: { question: string, answer: string }[],
 *   siblings: ToolMeta[],
 *   extension: string,
 *   isBrowser: boolean,
 * }}
 */
export function buildTransformSeoContent(tool) {
  const { source: sourceName, target: targetName } = splitTitle(tool);
  const title = cleanText(tool.title);
  const extension = extensionFor(tool.to);
  const isBrowser = tool.engine === "browser";
  const usesTempFile = TEMP_FILE_SLUGS.has(tool.slug);

  const libIsCustom = tool.lib === "custom";
  const libPhrase = libIsCustom
    ? "a converter written specifically for AltFTool"
    : `the ${tool.lib} library`;
  const libTableValue = libIsCustom
    ? "Purpose-built for AltFTool (no third-party library)"
    : tool.lib;

  // --- answer-first intro -------------------------------------------------
  // The first sentence must stand on its own: read without the H1 it is still
  // a correct, attributable statement about what this page does.
  const clause = descriptionAsClause(tool);
  const answer = clause
    ? `${title} is a free online converter on AltFTool that ${clause} — no signup and nothing to install.`
    : `${title} is a free online converter on AltFTool that turns ${sourceName} into ${targetName}. ${cleanText(tool.description)}`;

  const runsSentence = isBrowser
    ? `The conversion runs entirely in your browser: the ${sourceName} you paste is converted on your own device and is never uploaded to AltFTool.`
    : usesTempFile
      ? `The conversion runs on AltFTool's server: your input is sent to the AltFTool API, written to a short-lived temporary file because ${tool.lib} reads from a path, and deleted as soon as the conversion finishes. It is not saved to an account or a database.`
      : `The conversion runs on AltFTool's server: your input is sent to the AltFTool API, converted, and returned to your browser. It is not stored.`;

  const detail = `${runsSentence} ${title} is powered by ${libPhrase}, and the ${targetName} result can be copied or downloaded as ${tool.slug}.${extension}.`;

  const categoryNote = CATEGORY_NOTES[tool.category] || null;

  // --- spec table ---------------------------------------------------------
  const runsCell = isBrowser
    ? "In your browser — the input is not uploaded."
    : usesTempFile
      ? "On AltFTool's server — the input is sent to our API, used for a short-lived temp file, then deleted. Not stored."
      : "On AltFTool's server — the input is sent to our API and not stored.";

  const spec = [
    { label: "Input format", value: formatCell(sourceName, tool.from) },
    { label: "Output format", value: formatCell(targetName, tool.to) },
    { label: "Output file", value: `${tool.slug}.${extension} (${mimeFor(tool.to)})` },
    { label: "Runs", value: runsCell },
    { label: "Library", value: libTableValue },
    { label: "Category", value: `${tool.category} converters on AltFTool` },
  ];

  // --- how-to -------------------------------------------------------------
  const howToName = `How to convert ${sourceName} to ${targetName}`;
  const conversionStep = isBrowser
    ? `The conversion runs automatically about 300ms after you stop typing — there is no Convert button, and nothing is uploaded while it works.`
    : `About 300ms after you stop typing, AltFTool posts your input to its conversion API and puts the ${targetName} output in the right-hand pane.`;

  const steps = [
    `Open ${title} on AltFTool — the converter loads straight away, with no account.`,
    `Paste your ${sourceName} into the left-hand input pane, or press Sample to load a working example.`,
    conversionStep,
    `If this converter exposes options, open Settings to change them — the output re-runs as you adjust.`,
    `Copy the ${targetName} output with the Copy button, or download it as ${tool.slug}.${extension}.`,
  ];

  // --- FAQs ---------------------------------------------------------------
  // Every answer is derived from a manifest field or from code in this
  // section, so each one is genuinely specific to this converter.
  const faqs = [
    {
      question: `Does ${title} upload my ${sourceName}?`,
      answer: isBrowser
        ? `No. ${title} runs entirely in your browser using ${libPhrase}, so the ${sourceName} you paste is converted on your own device and never reaches AltFTool's server.`
        : usesTempFile
          ? `Yes — this one runs on the server. Your ${sourceName} is sent to the AltFTool API, written to a short-lived temporary file because ${tool.lib} reads from a file path, and deleted as soon as the conversion finishes. It is not saved to an account or a database.`
          : `Yes — this one runs on the server, because ${tool.lib} is a Node library rather than a browser one. Your ${sourceName} is sent to the AltFTool API, converted, and returned. It is not stored.`,
    },
    {
      question: `What does ${title} use to convert ${sourceName} to ${targetName}?`,
      answer: libIsCustom
        ? `A converter written specifically for AltFTool, with no third-party conversion dependency. It runs ${isBrowser ? "in your browser" : "on AltFTool's server"}.`
        : `The ${tool.lib} library, running ${isBrowser ? "in your browser" : "on AltFTool's server"}. The ${targetName} you see is that library's output, not a hand-rolled approximation.`,
    },
    {
      question: `Is there a limit on how much ${sourceName} I can convert?`,
      answer: isBrowser
        ? `There is no server-side limit, because nothing is uploaded — ${title} converts in your browser, so the practical ceiling is your own device's memory.`
        : `Yes. Server-side converters accept up to ${SERVER_INPUT_LIMIT.toLocaleString("en-US")} characters of input per request; anything larger is rejected with a "too large" error instead of being truncated.`,
    },
    {
      question: `What file do I get from ${title}?`,
      answer: `The result is ${targetName}. Copy it from the output pane in one click, or download it as ${tool.slug}.${extension} — AltFTool names the file after the converter and serves it as ${mimeFor(tool.to)}.`,
    },
    {
      question: `Is ${title} free?`,
      answer: `Yes. ${title} is free to use on AltFTool, with no account and no sign-up.`,
    },
  ];

  return {
    title,
    sourceName,
    targetName,
    answer,
    detail,
    categoryNote,
    spec,
    howToName,
    steps,
    faqs,
    siblings: siblingTools(tool),
    extension,
    isBrowser,
  };
}

/**
 * Answer-first copy for the /transform hub. The counts are read from the
 * manifest so they can never go stale.
 *
 * @param {{ total: number, categoryCount: number, browserCount: number }} counts
 */
export function buildTransformHubContent({ total, categoryCount, browserCount }) {
  const serverCount = total - browserCount;
  return {
    answer: `AltFTool Transform is a free collection of ${total} format and code converters — JSON, GraphQL, TypeScript, JSON Schema, YAML, TOML, SVG and more — grouped into ${categoryCount} categories and usable without an account.`,
    detail: `${browserCount} of the ${total} converters run entirely in your browser, so the input you paste is never uploaded; the remaining ${serverCount} rely on Node-only libraries and run on AltFTool's server, where input is converted and returned without being stored. Every converter shares the same workspace: paste on the left, read the result on the right, then copy or download it.`,
  };
}
