/**
 * Text Diff Viewer — side-by-side alignment with word-level highlighting.
 *
 * Two passes:
 *   1. A line-level longest common subsequence (the Hunt-McIlroy dynamic
 *      program used by diff(1)) aligns the two versions into rows.
 *   2. Rows where one line was replaced by another are diffed again at word
 *      level, so the viewer can highlight the words that actually moved rather
 *      than repainting the whole line.
 *
 * Similarity is reported as the Dice coefficient over words — twice the shared
 * word count divided by the total word count of both versions.
 *
 * Pure functions. No DOM, no React, no clock reads.
 */

/** Line cap. The LCS table is (m+1)×(n+1) Int32 cells; 1500² stays under 9 MB. */
export const MAX_LINES = 1500;

/**
 * Shared memory budget for every exact LCS pass. MAX_LINES bounds how many
 * lines there are, not how many words sit on any one of them, so a single very
 * long unwrapped line can blow up the word-level passes on its own. The table
 * stores one Int32 per cell, so budgeting by cells keeps every pass near the
 * same ~9 MiB ceiling as the 1500-line comparison — a one-dimensional word cap
 * cannot, because the token arrays also carry the whitespace runs between the
 * words (roughly 2x the tokens, so 4x the cells).
 */
export const MAX_LCS_CELLS = (MAX_LINES + 1) * (MAX_LINES + 1);

/** Row kinds the viewer renders. */
export const ROW_EQUAL = "equal";
export const ROW_CHANGED = "changed";
export const ROW_ADDED = "added";
export const ROW_REMOVED = "removed";

/** Segment kinds inside a changed row. */
export const SEG_SAME = "same";
export const SEG_ADD = "add";
export const SEG_REMOVE = "remove";

/**
 * A replaced line is only word-diffed when the two lines still share at least
 * this fraction of their words; below it the line was rewritten, and
 * highlighting every word as changed is noise.
 */
export const WORD_DIFF_MIN_SIMILARITY = 0.3;

const asText = (value) => String(value == null ? "" : value);

/** Split into lines, tolerating CRLF and CR endings. */
export function splitLines(value) {
  const text = asText(value);
  if (text === "") return [];
  return text.replace(/\r\n?/g, "\n").split("\n");
}

/** Split a line into words and the whitespace between them, keeping both. */
export function tokenizeWords(line) {
  const text = asText(line);
  if (text === "") return [];
  return text.match(/\s+|[^\s]+/g) || [];
}

/** Count real words (whitespace runs excluded). */
export function countWords(value) {
  return asText(value).split(/\s+/).filter(Boolean).length;
}

function sharedBoundaryCount(a, b) {
  const limit = Math.min(a.length, b.length);
  let prefix = 0;
  while (prefix < limit && a[prefix] === b[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < limit - prefix &&
    a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  return prefix + suffix;
}

/**
 * Generic longest common subsequence over two arrays of strings.
 * @returns {{ ops: Array<{type:string,aIndex:number|null,bIndex:number|null}>, lcs:number }}
 */
export function lcsOps(a, b) {
  const m = a.length;
  const n = b.length;
  const width = n + 1;
  const cellCount = (m + 1) * width;
  if (!Number.isSafeInteger(cellCount) || cellCount > MAX_LCS_CELLS) {
    return {
      ops: [
        ...a.map((_, aIndex) => ({ type: "delete", aIndex, bIndex: null })),
        ...b.map((_, bIndex) => ({ type: "insert", aIndex: null, bIndex })),
      ],
      lcs: sharedBoundaryCount(a, b),
      exact: false,
    };
  }
  const table = new Int32Array((m + 1) * width);
  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      table[i * width + j] =
        a[i] === b[j]
          ? table[(i + 1) * width + (j + 1)] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + (j + 1)]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", aIndex: i, bIndex: j });
      i += 1;
      j += 1;
    } else if (table[(i + 1) * width + j] >= table[i * width + (j + 1)]) {
      ops.push({ type: "delete", aIndex: i, bIndex: null });
      i += 1;
    } else {
      ops.push({ type: "insert", aIndex: null, bIndex: j });
      j += 1;
    }
  }
  while (i < m) {
    ops.push({ type: "delete", aIndex: i, bIndex: null });
    i += 1;
  }
  while (j < n) {
    ops.push({ type: "insert", aIndex: null, bIndex: j });
    j += 1;
  }
  return { ops, lcs: table[0], exact: true };
}

/**
 * Word-level diff of two lines.
 * @returns {{ left: Array<{type:string,text:string}>, right: Array, shared:number,
 *   added:number, removed:number }}
 */
export function diffWords(leftLine, rightLine) {
  const a = tokenizeWords(leftLine);
  const b = tokenizeWords(rightLine);
  const { ops, exact } = lcsOps(a, b);

  if (!exact) {
    const leftWordTokens = a.filter((token) => token.trim() !== "");
    const rightWordTokens = b.filter((token) => token.trim() !== "");
    const leftWords = leftWordTokens.length;
    const rightWords = rightWordTokens.length;
    // Use a conservative, linear common prefix/suffix estimate for stats,
    // while deliberately rendering the visual row as a full replacement.
    const sharedWords = sharedBoundaryCount(leftWordTokens, rightWordTokens);
    return {
      left: asText(leftLine) === "" ? [] : [{ type: SEG_REMOVE, text: asText(leftLine) }],
      right: asText(rightLine) === "" ? [] : [{ type: SEG_ADD, text: asText(rightLine) }],
      shared: sharedWords,
      added: Math.max(0, rightWords - sharedWords),
      removed: Math.max(0, leftWords - sharedWords),
      exact: false,
    };
  }

  const left = [];
  const right = [];
  let shared = 0;
  let added = 0;
  let removed = 0;

  const push = (list, type, text) => {
    const last = list[list.length - 1];
    if (last && last.type === type) last.text += text;
    else list.push({ type, text });
  };

  for (const op of ops) {
    if (op.type === "equal") {
      push(left, SEG_SAME, a[op.aIndex]);
      push(right, SEG_SAME, b[op.bIndex]);
      if (a[op.aIndex].trim() !== "") shared += 1;
    } else if (op.type === "delete") {
      push(left, SEG_REMOVE, a[op.aIndex]);
      if (a[op.aIndex].trim() !== "") removed += 1;
    } else {
      push(right, SEG_ADD, b[op.bIndex]);
      if (b[op.bIndex].trim() !== "") added += 1;
    }
  }

  return { left, right, shared, added, removed, exact };
}

const wholeLineSegments = (line, type) =>
  asText(line) === "" ? [] : [{ type, text: asText(line) }];

/**
 * Build the side-by-side view.
 *
 * @param {string} leftText  The older version.
 * @param {string} rightText The newer version.
 * @param {{ ignoreCase?: boolean, ignoreWhitespace?: boolean }} options
 * @returns {object|{ error: string }}
 */
export function buildSideBySide(leftText, rightText, options = {}) {
  const leftRaw = asText(leftText);
  const rightRaw = asText(rightText);

  if (leftRaw.trim() === "" && rightRaw.trim() === "") {
    return { error: "Paste both versions to compare them." };
  }

  const leftLines = splitLines(leftRaw);
  const rightLines = splitLines(rightRaw);

  if (leftLines.length > MAX_LINES || rightLines.length > MAX_LINES) {
    return {
      error: `Each version is limited to ${MAX_LINES} lines — this comparison has ${Math.max(leftLines.length, rightLines.length)}.`,
    };
  }

  const normalise = (line) => {
    let out = asText(line);
    if (options.ignoreWhitespace) out = out.replace(/\s+/g, " ").trim();
    if (options.ignoreCase) out = out.toLowerCase();
    return out;
  };

  const { ops, lcs: lineLcs } = lcsOps(leftLines.map(normalise), rightLines.map(normalise));

  // Group runs of deletes and inserts so a replacement becomes one aligned row.
  const rows = [];
  let wordHighlightsExact = true;
  let cursor = 0;
  while (cursor < ops.length) {
    const op = ops[cursor];
    if (op.type === "equal") {
      rows.push({
        type: ROW_EQUAL,
        leftNo: op.aIndex + 1,
        rightNo: op.bIndex + 1,
        leftSegments: wholeLineSegments(leftLines[op.aIndex], SEG_SAME),
        rightSegments: wholeLineSegments(rightLines[op.bIndex], SEG_SAME),
      });
      cursor += 1;
      continue;
    }

    const deletes = [];
    while (cursor < ops.length && ops[cursor].type === "delete") {
      deletes.push(ops[cursor].aIndex);
      cursor += 1;
    }
    const inserts = [];
    while (cursor < ops.length && ops[cursor].type === "insert") {
      inserts.push(ops[cursor].bIndex);
      cursor += 1;
    }

    const pairs = Math.min(deletes.length, inserts.length);
    for (let k = 0; k < pairs; k += 1) {
      const leftLine = leftLines[deletes[k]];
      const rightLine = rightLines[inserts[k]];
      const leftLineWords = countWords(leftLine);
      const rightLineWords = countWords(rightLine);
      // Word-diffing a replaced line is itself an O(wordsA x wordsB) LCS, so a
      // single very long replaced line (e.g. an unwrapped paragraph) is just as
      // expensive as the whole-document stats pass below. diffWords applies the
      // same cell budget as every other LCS pass and reports whether it stayed
      // exact; past the budget it falls back to marking the line fully
      // replaced, exactly as already happens below that threshold when the two
      // lines are too dissimilar to bother aligning.
      const words = diffWords(leftLine, rightLine);
      if (!words.exact) wordHighlightsExact = false;
      const totalWords = leftLineWords + rightLineWords;
      const similar = !words.exact
        ? 0
        : totalWords === 0
          ? 1
          : (2 * words.shared) / Math.max(1, totalWords);
      const worthWordDiff = similar >= WORD_DIFF_MIN_SIMILARITY;
      rows.push({
        type: ROW_CHANGED,
        leftNo: deletes[k] + 1,
        rightNo: inserts[k] + 1,
        leftSegments: worthWordDiff ? words.left : wholeLineSegments(leftLine, SEG_REMOVE),
        rightSegments: worthWordDiff ? words.right : wholeLineSegments(rightLine, SEG_ADD),
        wordsAdded: worthWordDiff ? words.added : rightLineWords,
        wordsRemoved: worthWordDiff ? words.removed : leftLineWords,
      });
    }
    for (let k = pairs; k < deletes.length; k += 1) {
      rows.push({
        type: ROW_REMOVED,
        leftNo: deletes[k] + 1,
        rightNo: null,
        leftSegments: wholeLineSegments(leftLines[deletes[k]], SEG_REMOVE),
        rightSegments: [],
        wordsRemoved: countWords(leftLines[deletes[k]]),
        wordsAdded: 0,
      });
    }
    for (let k = pairs; k < inserts.length; k += 1) {
      rows.push({
        type: ROW_ADDED,
        leftNo: null,
        rightNo: inserts[k] + 1,
        leftSegments: [],
        rightSegments: wholeLineSegments(rightLines[inserts[k]], SEG_ADD),
        wordsAdded: countWords(rightLines[inserts[k]]),
        wordsRemoved: 0,
      });
    }
  }

  const leftWordList = leftRaw.split(/\s+/).filter(Boolean);
  const rightWordList = rightRaw.split(/\s+/).filter(Boolean);
  const leftWords = leftWordList.length;
  const rightWords = rightWordList.length;

  // The headline Similarity/Churn stats need a whole-document word-level LCS.
  // lcsOps enforces the shared cell budget and reports whether the answer is
  // exact; beyond it, estimate rather than freezing the tab on every keystroke.
  const normaliseWord = options.ignoreCase ? (word) => word.toLowerCase() : (word) => word;
  const wholeDocumentWords = lcsOps(
    leftWordList.map(normaliseWord),
    rightWordList.map(normaliseWord),
  );
  let sharedWords = wholeDocumentWords.lcs;
  if (!wholeDocumentWords.exact) {
    // Two independent estimates, each a *lower bound* on the true LCS, so the
    // larger one is the tighter answer and neither can overstate similarity:
    //   1. wholeDocumentWords.lcs — the common prefix plus suffix. Sharp for a
    //      single oversized line edited at one end, but it collapses to almost
    //      nothing once a document changes near both ends.
    //   2. The bounded row pass above. Every left word a row did not mark
    //      removed was matched in document order, so those matches form a
    //      genuine common subsequence; it is blind only to words that matched
    //      across a row boundary, and to rows rendered as full replacements.
    // Case 2 is far sharper for many short lines (where the rows word-diff
    // exactly); case 1 is far sharper for one huge line (where they do not).
    const rowWordsRemoved = rows.reduce((sum, row) => sum + (row.wordsRemoved || 0), 0);
    sharedWords = Math.max(sharedWords, Math.max(0, leftWords - rowWordsRemoved));
  }

  const totalWords = leftWords + rightWords;
  const similarityPct =
    totalWords === 0 ? 100 : Math.round(((2 * sharedWords) / totalWords) * 1000) / 10;

  const wordsAdded = rightWords - sharedWords;
  const wordsRemoved = leftWords - sharedWords;
  const churnPct =
    totalWords === 0 ? 0 : Math.round(((wordsAdded + wordsRemoved) / totalWords) * 1000) / 10;

  const counts = rows.reduce(
    (acc, row) => {
      acc[row.type] += 1;
      return acc;
    },
    { [ROW_EQUAL]: 0, [ROW_CHANGED]: 0, [ROW_ADDED]: 0, [ROW_REMOVED]: 0 },
  );

  return {
    rows,
    equalRows: counts[ROW_EQUAL],
    changedRows: counts[ROW_CHANGED],
    addedRows: counts[ROW_ADDED],
    removedRows: counts[ROW_REMOVED],
    lineLcs,
    leftLineCount: leftLines.length,
    rightLineCount: rightLines.length,
    leftWords,
    rightWords,
    sharedWords,
    wordsAdded,
    wordsRemoved,
    churnPct,
    similarityPct,
    statsExact: wholeDocumentWords.exact,
    wordHighlightsExact,
    identical: counts[ROW_CHANGED] + counts[ROW_ADDED] + counts[ROW_REMOVED] === 0,
    leftChars: leftRaw.length,
    rightChars: rightRaw.length,
  };
}

/** Line, word and character counts for one saved version. */
export function versionStats(text) {
  const raw = asText(text);
  return {
    lines: raw === "" ? 0 : splitLines(raw).length,
    words: countWords(raw),
    characters: raw.length,
  };
}

/** Markdown export of the side-by-side view. */
export function toMarkdownTable(result, { leftLabel = "Before", rightLabel = "After" } = {}) {
  if (!result || result.error || !Array.isArray(result.rows)) return "";
  const escape = (value) => String(value).replace(/\|/g, "\\|");
  const flatten = (segments) => escape(segments.map((segment) => segment.text).join(""));
  const marks = {
    [ROW_EQUAL]: " ",
    [ROW_CHANGED]: "~",
    [ROW_ADDED]: "+",
    [ROW_REMOVED]: "-",
  };
  const lines = [
    `| | # | ${escape(leftLabel)} | # | ${escape(rightLabel)} |`,
    "| --- | --- | --- | --- | --- |",
    ...result.rows.map(
      (row) =>
        `| ${marks[row.type]} | ${row.leftNo ?? ""} | ${flatten(row.leftSegments)} | ${row.rightNo ?? ""} | ${flatten(row.rightSegments)} |`,
    ),
    "",
    `${result.statsExact ? "Similarity" : "Approximate similarity"} ${result.similarityPct}% · ${result.statsExact ? "churn" : "approximate churn"} ${result.churnPct}% · +${result.wordsAdded} / -${result.wordsRemoved} words`,
    ...(!result.statsExact || !result.wordHighlightsExact
      ? [
          "Bounded mode: headline word statistics are estimates and oversized changed lines are shown as full-line replacements.",
        ]
      : []),
    "",
  ];
  return lines.join("\n");
}
