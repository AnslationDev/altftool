/**
 * Prompt Markdown to Plain — strip CommonMark markup from a prompt.
 *
 * The constructs handled are the CommonMark block and inline types plus the
 * GitHub Flavored Markdown extensions in common use (strikethrough, tables,
 * footnote references):
 *   blocks  — ATX and setext headings, fenced and indented code, blockquotes,
 *             bullet and ordered lists, thematic breaks, tables, link
 *             reference definitions
 *   inline  — emphasis, strong emphasis, strikethrough, code spans, links,
 *             images, autolinks, raw HTML, backslash escapes
 *
 * Code spans and fenced blocks are lifted out before anything else runs, so
 * markup that only exists inside code is never stripped by mistake.
 */

/** Practical ceiling so the page stays responsive on a phone. */
export const MAX_INPUT_CHARS = 200000;

/** Characters CommonMark allows a backslash to escape. */
const ESCAPABLE = "\\\\`*_{}\\[\\]()#+\\-.!>~|";
const BACKSLASH_ESCAPE_RE = new RegExp(`\\\\([${ESCAPABLE}])`, "g");

export const BULLET_STYLES = [
  { id: "dash", label: "Keep as -", marker: "- " },
  { id: "bullet", label: "Convert to •", marker: "• " },
  { id: "none", label: "Remove the marker", marker: "" },
];

const PLACEHOLDER = "\u0000";

function makeStash() {
  const values = [];
  return {
    protect(value) {
      values.push(value);
      return `${PLACEHOLDER}${values.length - 1}${PLACEHOLDER}`;
    },
    restore(text) {
      return String(text).replace(
        new RegExp(`${PLACEHOLDER}(\\d+)${PLACEHOLDER}`, "g"),
        (match, index) => values[Number(index)] ?? "",
      );
    },
  };
}

/**
 * Strip Markdown to plain text.
 * Returns { error } for empty or oversized input rather than an empty string.
 */
export function stripMarkdown(
  input,
  {
    bulletStyle = "dash",
    keepLinkUrls = false,
    keepImageAlt = true,
    keepCodeContent = true,
    keepOrderedNumbers = true,
    collapseBlankLines = true,
  } = {},
) {
  const raw = String(input ?? "");
  if (!raw.trim()) return { error: "Paste the Markdown prompt you want flattened." };
  if (raw.length > MAX_INPUT_CHARS) {
    return {
      error: `That is ${raw.length.toLocaleString("en-US")} characters; this tool handles up to ${MAX_INPUT_CHARS.toLocaleString("en-US")}.`,
    };
  }

  const counts = {
    headings: 0,
    bold: 0,
    italic: 0,
    strikethrough: 0,
    inlineCode: 0,
    codeBlocks: 0,
    links: 0,
    images: 0,
    listItems: 0,
    blockquotes: 0,
    tableRows: 0,
    thematicBreaks: 0,
    htmlTags: 0,
    footnotes: 0,
    referenceDefinitions: 0,
  };

  const stash = makeStash();
  let text = raw.replace(/\r\n?/g, "\n").split(PLACEHOLDER).join("");

  // --- Step 1: lift out fenced code blocks before any other rule sees them.
  // The terminator is either the closing fence or the true end of input.
  // `$` cannot be used here: under the /m flag it matches every line ending,
  // which would close the block on its first line.
  text = text.replace(
    /^[ \t]*(`{3,}|~{3,})[^\n]*\n([\s\S]*?)(?:\n[ \t]*\1[ \t]*(?=\n|$)|(?![\s\S]))/gm,
    (match, fence, body) => {
      counts.codeBlocks += 1;
      return keepCodeContent ? stash.protect(body) : stash.protect("");
    },
  );

  // --- Step 2: lift out code spans, double backticks first.
  text = text.replace(/``([^`]+)``/g, (match, body) => {
    counts.inlineCode += 1;
    return stash.protect(keepCodeContent ? body.trim() : "");
  });
  text = text.replace(/`([^`\n]+)`/g, (match, body) => {
    counts.inlineCode += 1;
    return stash.protect(keepCodeContent ? body : "");
  });

  // --- Step 2b: resolve backslash escapes now and protect the results.
  // CommonMark resolves \* before emphasis, so doing this later would let the
  // emphasis pass consume an asterisk the author explicitly escaped.
  text = text.replace(BACKSLASH_ESCAPE_RE, (match, character) => stash.protect(character));

  // --- Step 3: block-level rules, line by line.
  const bullet = BULLET_STYLES.find((style) => style.id === bulletStyle) || BULLET_STYLES[0];
  const lines = text.split("\n");
  const outputLines = [];

  for (let index = 0; index < lines.length; index += 1) {
    let line = lines[index];

    // Link reference definitions: [1]: https://example.com "title"
    if (/^ {0,3}\[[^\]]+\]:\s*\S+/.test(line)) {
      counts.referenceDefinitions += 1;
      continue;
    }

    // Thematic break: ---, ***, ___ (three or more, optionally spaced).
    if (/^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(line)) {
      counts.thematicBreaks += 1;
      outputLines.push("");
      continue;
    }

    // Setext underline under a non-blank line.
    if (/^ {0,3}=+[ \t]*$/.test(line) && outputLines.length > 0 && outputLines.at(-1).trim()) {
      counts.headings += 1;
      continue;
    }

    // Table delimiter row: |---|:--:|
    if (/^ {0,3}\|?[ \t]*:?-{1,}:?[ \t]*(\|[ \t]*:?-{1,}:?[ \t]*)+\|?[ \t]*$/.test(line)) {
      continue;
    }

    // Blockquote markers, however deeply nested.
    let quoteDepth = 0;
    while (/^ {0,3}>[ \t]?/.test(line)) {
      line = line.replace(/^ {0,3}>[ \t]?/, "");
      quoteDepth += 1;
    }
    if (quoteDepth > 0) counts.blockquotes += 1;

    // ATX heading: # Heading, with optional closing hashes.
    const atx = /^ {0,3}(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/.exec(line);
    if (atx) {
      counts.headings += 1;
      line = atx[2];
      outputLines.push(line);
      continue;
    }

    // Table row: | a | b |
    if (/^ {0,3}\|.*\|[ \t]*$/.test(line)) {
      counts.tableRows += 1;
      line = line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim())
        .join(" | ");
      outputLines.push(line);
      continue;
    }

    // Ordered list item: 1. text or 1) text
    const ordered = /^([ \t]*)(\d{1,9})[.)][ \t]+(.*)$/.exec(line);
    if (ordered) {
      counts.listItems += 1;
      line = keepOrderedNumbers
        ? `${ordered[1]}${ordered[2]}. ${ordered[3]}`
        : `${ordered[1]}${ordered[3]}`;
      outputLines.push(line);
      continue;
    }

    // Bullet list item: -, * or + followed by a space.
    const unordered = /^([ \t]*)[-*+][ \t]+(.*)$/.exec(line);
    if (unordered) {
      counts.listItems += 1;
      line = `${unordered[1]}${bullet.marker}${unordered[2]}`;
      outputLines.push(line);
      continue;
    }

    outputLines.push(line);
  }

  text = outputLines.join("\n");

  // --- Step 4: inline rules. Images first so ![alt](url) is not read as a link.
  text = text.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (match, alt) => {
    counts.images += 1;
    return keepImageAlt ? alt : "";
  });
  text = text.replace(/!\[([^\]]*)\]\[[^\]]*\]/g, (match, alt) => {
    counts.images += 1;
    return keepImageAlt ? alt : "";
  });

  // Footnote references: [^1]
  text = text.replace(/\[\^([^\]]+)\]/g, () => {
    counts.footnotes += 1;
    return "";
  });

  // Inline links: [text](url "title")
  text = text.replace(/\[([^\]]*)\]\(([^)\s]*)(?:\s+"[^"]*")?\)/g, (match, label, url) => {
    counts.links += 1;
    if (!keepLinkUrls) return label;
    return url ? `${label} (${url})` : label;
  });

  // Reference links: [text][ref] and shortcut [text][]
  text = text.replace(/\[([^\]]*)\]\[[^\]]*\]/g, (match, label) => {
    counts.links += 1;
    return label;
  });

  // Autolinks: <https://example.com>
  text = text.replace(/<((?:https?|mailto|ftp):[^>\s]+)>/g, (match, url) => {
    counts.links += 1;
    return url;
  });

  // Raw HTML tags.
  text = text.replace(/<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/g, () => {
    counts.htmlTags += 1;
    return "";
  });

  // Strikethrough before emphasis so ~~ is not partly consumed.
  text = text.replace(/~~([\s\S]+?)~~/g, (match, body) => {
    counts.strikethrough += 1;
    return body;
  });

  // Bold+italic, then bold, then italic — longest delimiter first.
  text = text.replace(/(\*\*\*|___)(?=\S)([\s\S]*?\S)\1/g, (match, delimiter, body) => {
    counts.bold += 1;
    counts.italic += 1;
    return body;
  });
  text = text.replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, (match, delimiter, body) => {
    counts.bold += 1;
    return body;
  });
  text = text.replace(/(\*|_)(?=\S)([\s\S]*?\S)\1/g, (match, delimiter, body) => {
    counts.italic += 1;
    return body;
  });

  // --- Step 5: put the code and escaped characters back, then tidy whitespace.
  text = stash.restore(text);
  text = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n");
  if (collapseBlankLines) {
    text = text.replace(/\n{3,}/g, "\n\n");
  }
  text = text.replace(/^\n+/, "").replace(/\n+$/, "");

  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const words = text.split(/\s+/).filter(Boolean).length;

  return {
    text,
    counts,
    originalLength: raw.length,
    plainLength: text.length,
    removedCharacters: raw.length - text.length,
    reductionPercent: raw.length > 0 ? ((raw.length - text.length) / raw.length) * 100 : 0,
    wordCount: words,
    lineCount: text ? text.split("\n").length : 0,
  };
}

/** Labels for the counts object, in the order worth showing. */
export const COUNT_LABELS = [
  ["headings", "Headings"],
  ["bold", "Bold spans"],
  ["italic", "Italic spans"],
  ["strikethrough", "Strikethrough spans"],
  ["inlineCode", "Code spans"],
  ["codeBlocks", "Code blocks"],
  ["links", "Links"],
  ["images", "Images"],
  ["listItems", "List items"],
  ["blockquotes", "Quoted lines"],
  ["tableRows", "Table rows"],
  ["thematicBreaks", "Horizontal rules"],
  ["htmlTags", "HTML tags"],
  ["footnotes", "Footnote markers"],
  ["referenceDefinitions", "Reference definitions"],
];
