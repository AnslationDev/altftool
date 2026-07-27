/**
 * Prompt Markdown Cleaner — normalises text copied from word processors, chat apps
 * and rendered markdown before it is pasted into an AI model.
 *
 * Character mappings follow the Unicode code charts:
 *  - "Smart" punctuation (U+2018/2019/201C/201D etc.) is what word processors
 *    substitute for straight ASCII quotes via autocorrect.
 *  - Invisible characters (zero-width space U+200B, BOM U+FEFF, soft hyphen U+00AD…)
 *    are frequently carried along in copy-paste and can corrupt prompts, code and
 *    exact-match instructions without being visible.
 */

/** Typographic punctuation → ASCII equivalent (Unicode General Punctuation block, U+2000-206F). */
export const SMART_CHAR_MAP = [
  [/[‘’‚‛′]/g, "'"], // left/right single quote, low-9, reversed-9, prime
  [/[“”„‟″]/g, '"'], // left/right double quote, low double, double prime
  [/[–—―]/g, "-"], // en dash, em dash, horizontal bar
  [/…/g, "..."], // horizontal ellipsis
  [/[  -   　]/g, " "], // no-break and fixed-width spaces
  [/[«»]/g, '"'], // guillemets
];

/**
 * Characters with zero visible width (Unicode format characters, category Cf, plus
 * the soft hyphen). They are deleted outright.
 */
export const INVISIBLE_CHARS_RE =
  /[​‌‍‎‏­⁠⁡⁢⁣⁤﻿᠎]/g;

/** Options the cleaner supports, in the order the passes run. */
export const CLEAN_OPTIONS = [
  { id: "invisible", label: "Remove invisible characters", hint: "zero-width spaces, BOM, soft hyphens, direction marks" },
  { id: "quotes", label: "Straighten smart punctuation", hint: "curly quotes, em dashes, ellipsis, non-breaking spaces" },
  { id: "markdown", label: "Strip markdown formatting", hint: "**bold**, _italic_, # headings, links, inline code" },
  { id: "whitespace", label: "Tidy whitespace", hint: "trailing spaces, 3+ blank lines collapsed to one" },
];

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

/** Strips markdown syntax while keeping the readable text. Pure string transform. */
export function stripMarkdown(text) {
  let out = String(text);
  // fenced code blocks: keep the inner code, drop the fences and language tag
  out = out.replace(/```[^\n]*\n([\s\S]*?)```/g, "$1");
  out = out.replace(/```[^\n]*/g, "");
  // images before links: ![alt](url) -> alt
  out = out.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, "$1");
  // links: [text](url) -> text (url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
  // headings: leading #'s
  out = out.replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, "");
  // blockquote markers
  out = out.replace(/^[ \t]*>[ \t]?/gm, "");
  // bold/italic/strikethrough delimiters
  out = out.replace(/(\*\*\*|___)(\S(?:[\s\S]*?\S)?)\1/g, "$2");
  out = out.replace(/(\*\*|__)(\S(?:[\s\S]*?\S)?)\1/g, "$2");
  out = out.replace(/(\*|_)(\S(?:[\s\S]*?\S)?)\1/g, "$2");
  out = out.replace(/~~(\S(?:[\s\S]*?\S)?)~~/g, "$1");
  // inline code
  out = out.replace(/`([^`\n]+)`/g, "$1");
  // horizontal rules on their own line
  out = out.replace(/^[ \t]*([-*_])[ \t]*(?:\1[ \t]*){2,}$/gm, "");
  return out;
}

/**
 * Cleans pasted text. `options` is an array of option ids from CLEAN_OPTIONS.
 * Returns { cleaned, stats: {...}, inputChars, outputChars } or { error }.
 */
export function cleanPromptText(text, options = ["invisible", "quotes", "markdown", "whitespace"]) {
  const input = String(text ?? "");
  if (input.length === 0) {
    return { error: "Paste some text to clean." };
  }

  let out = input;
  const stats = { invisibleRemoved: 0, smartCharsReplaced: 0, markdownCharsRemoved: 0, whitespaceTrimmed: 0 };

  if (options.includes("invisible")) {
    stats.invisibleRemoved = countMatches(out, INVISIBLE_CHARS_RE);
    out = out.replace(INVISIBLE_CHARS_RE, "");
  }

  if (options.includes("quotes")) {
    for (const [re, replacement] of SMART_CHAR_MAP) {
      stats.smartCharsReplaced += countMatches(out, re);
      out = out.replace(re, replacement);
    }
  }

  if (options.includes("markdown")) {
    const before = out.length;
    out = stripMarkdown(out);
    stats.markdownCharsRemoved = Math.max(0, before - out.length);
  }

  if (options.includes("whitespace")) {
    const before = out.length;
    out = out
      .replace(/[ \t]+$/gm, "") // trailing spaces
      .replace(/\n{3,}/g, "\n\n") // 3+ blank lines -> one blank line
      .replace(/^\n+/, "")
      .replace(/\n+$/, "\n")
      .replace(/^\s+$/gm, "");
    if (!input.endsWith("\n")) out = out.replace(/\n$/, "");
    stats.whitespaceTrimmed = Math.max(0, before - out.length);
  }

  return {
    cleaned: out,
    stats,
    inputChars: input.length,
    outputChars: out.length,
    totalChanges:
      stats.invisibleRemoved +
      stats.smartCharsReplaced +
      stats.markdownCharsRemoved +
      stats.whitespaceTrimmed,
  };
}
