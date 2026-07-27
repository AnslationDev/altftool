/**
 * Text Diff Tool — line-level diff over the longest common subsequence.
 *
 * The algorithm is the classic LCS dynamic program (Hunt-McIlroy, the basis of
 * diff(1)): build the LCS table over the two line arrays, then walk it back to
 * produce a minimal edit script of keep / delete / insert operations. Output can
 * be rendered as a unified diff, which is the format `diff -u`, `git diff` and
 * `patch` all speak.
 *
 * Pure functions. No DOM, no React.
 */

/**
 * Cap on the LCS table. The dynamic program allocates (m+1)×(n+1) cells, so
 * 2000×2000 lines is 4 million Int32 cells — about 16 MB, the largest table
 * that stays responsive in a browser tab.
 */
export const MAX_LINES = 2000;

/** Lines of unchanged context kept around each hunk in a unified diff. */
export const DEFAULT_CONTEXT_LINES = 3;

/** Operation kinds in the edit script. */
export const OP_EQUAL = "equal";
export const OP_INSERT = "insert";
export const OP_DELETE = "delete";

/** Split text into lines, tolerating CRLF and CR endings. */
export function splitLines(value) {
  const text = String(value == null ? "" : value);
  if (text === "") return [];
  return text.replace(/\r\n?/g, "\n").split("\n");
}

/** Apply the comparison options to one line before matching it. */
export function normaliseLine(line, { ignoreCase = false, ignoreWhitespace = false } = {}) {
  let out = String(line == null ? "" : line);
  if (ignoreWhitespace) out = out.replace(/\s+/g, " ").trim();
  if (ignoreCase) out = out.toLowerCase();
  return out;
}

/**
 * Longest common subsequence length table, walked back into an edit script.
 * @returns {{ ops: Array, lcsLength: number }|{ error: string }}
 */
export function diffLines(leftText, rightText, options = {}) {
  const left = splitLines(leftText);
  const right = splitLines(rightText);

  if (left.length > MAX_LINES || right.length > MAX_LINES) {
    return {
      error: `Each side is limited to ${MAX_LINES} lines — this comparison has ${Math.max(left.length, right.length)}.`,
    };
  }

  const a = left.map((line) => normaliseLine(line, options));
  const b = right.map((line) => normaliseLine(line, options));

  const m = a.length;
  const n = b.length;
  const width = n + 1;
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
      ops.push({ type: OP_EQUAL, left: left[i], right: right[j], leftNo: i + 1, rightNo: j + 1 });
      i += 1;
      j += 1;
    } else if (table[(i + 1) * width + j] >= table[i * width + (j + 1)]) {
      ops.push({ type: OP_DELETE, left: left[i], right: null, leftNo: i + 1, rightNo: null });
      i += 1;
    } else {
      ops.push({ type: OP_INSERT, left: null, right: right[j], leftNo: null, rightNo: j + 1 });
      j += 1;
    }
  }
  while (i < m) {
    ops.push({ type: OP_DELETE, left: left[i], right: null, leftNo: i + 1, rightNo: null });
    i += 1;
  }
  while (j < n) {
    ops.push({ type: OP_INSERT, left: null, right: right[j], leftNo: null, rightNo: j + 1 });
    j += 1;
  }

  return { ops, lcsLength: table[0], leftLineCount: m, rightLineCount: n };
}

/**
 * Render an edit script as a unified diff with @@ hunk headers.
 * @returns {string}
 */
export function toUnifiedDiff(ops, { context = DEFAULT_CONTEXT_LINES, leftLabel = "a", rightLabel = "b" } = {}) {
  const keep = Math.max(0, Math.trunc(Number(context) || 0));
  const changedIndexes = [];
  ops.forEach((op, index) => {
    if (op.type !== OP_EQUAL) changedIndexes.push(index);
  });
  if (changedIndexes.length === 0) return "";

  const hunks = [];
  let start = Math.max(0, changedIndexes[0] - keep);
  let end = Math.min(ops.length - 1, changedIndexes[0] + keep);
  for (let k = 1; k < changedIndexes.length; k += 1) {
    const index = changedIndexes[k];
    if (index - keep <= end + 1) {
      end = Math.min(ops.length - 1, index + keep);
    } else {
      hunks.push([start, end]);
      start = Math.max(0, index - keep);
      end = Math.min(ops.length - 1, index + keep);
    }
  }
  hunks.push([start, end]);

  const lines = [`--- ${leftLabel}`, `+++ ${rightLabel}`];
  for (const [from, to] of hunks) {
    const slice = ops.slice(from, to + 1);
    const leftNos = slice.map((op) => op.leftNo).filter((no) => no !== null);
    const rightNos = slice.map((op) => op.rightNo).filter((no) => no !== null);
    const leftStart = leftNos.length ? leftNos[0] : 0;
    const rightStart = rightNos.length ? rightNos[0] : 0;
    lines.push(`@@ -${leftStart},${leftNos.length} +${rightStart},${rightNos.length} @@`);
    for (const op of slice) {
      if (op.type === OP_EQUAL) lines.push(` ${op.left}`);
      else if (op.type === OP_DELETE) lines.push(`-${op.left}`);
      else lines.push(`+${op.right}`);
    }
  }
  return lines.join("\n");
}

/**
 * Compare two blocks of text and return the diff plus summary statistics.
 *
 * @param {string} leftText
 * @param {string} rightText
 * @param {{ ignoreCase?: boolean, ignoreWhitespace?: boolean, context?: number,
 *   leftLabel?: string, rightLabel?: string }} options
 * @returns {object|{ error: string }}
 */
export function compareText(leftText, rightText, options = {}) {
  const leftRaw = String(leftText == null ? "" : leftText);
  const rightRaw = String(rightText == null ? "" : rightText);

  if (leftRaw.trim() === "" && rightRaw.trim() === "") {
    return { error: "Paste text into both sides to compare them." };
  }

  const diff = diffLines(leftRaw, rightRaw, options);
  if (diff.error) return { error: diff.error };

  const added = diff.ops.filter((op) => op.type === OP_INSERT).length;
  const removed = diff.ops.filter((op) => op.type === OP_DELETE).length;
  const unchanged = diff.ops.filter((op) => op.type === OP_EQUAL).length;

  const totalLines = diff.leftLineCount + diff.rightLineCount;
  /** Dice coefficient over lines: two identical files score 100. */
  const similarityPct =
    totalLines === 0 ? 100 : Math.round(((2 * diff.lcsLength) / totalLines) * 1000) / 10;

  const unified = toUnifiedDiff(diff.ops, {
    context: options.context ?? DEFAULT_CONTEXT_LINES,
    leftLabel: options.leftLabel || "original",
    rightLabel: options.rightLabel || "changed",
  });

  const leftChars = leftRaw.length;
  const rightChars = rightRaw.length;

  return {
    ops: diff.ops,
    added,
    removed,
    unchanged,
    changedLines: added + removed,
    leftLineCount: diff.leftLineCount,
    rightLineCount: diff.rightLineCount,
    lineDelta: diff.rightLineCount - diff.leftLineCount,
    leftChars,
    rightChars,
    charDelta: rightChars - leftChars,
    similarityPct,
    identical: added === 0 && removed === 0,
    unified,
  };
}
