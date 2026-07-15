import * as Diff from "diff";

export function computeDiff(textA, textB, options = {}) {
  const { ignoreSpaces = false, ignoreCase = false, mode = "word" } = options;

  let a = textA || "";
  let b = textB || "";

  if (ignoreSpaces) {
    a = a.replace(/\s+/g, " ").trim();
    b = b.replace(/\s+/g, " ").trim();
  }
  if (ignoreCase) {
    a = a.toLowerCase();
    b = b.toLowerCase();
  }

  switch (mode) {
    case "word":
      return Diff.diffWords(a, b);
    case "line":
      return Diff.diffLines(a, b);
    case "character":
      return Diff.diffChars(a, b);
    default:
      return Diff.diffWords(a, b);
  }
}

export function computeStats(textA, textB) {
  const a = textA || "";
  const b = textB || "";
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const wordDiff = Diff.diffWords(a, b);
  const lineDiff = Diff.diffLines(a, b);

  let added = 0, removed = 0;
  lineDiff.forEach((part) => {
    if (part.added) added += part.count;
    else if (part.removed) removed += part.count;
  });

  let charsAdded = 0, charsRemoved = 0;
  wordDiff.forEach((part) => {
    if (part.added) charsAdded += part.value.length;
    else if (part.removed) charsRemoved += part.value.length;
  });

  const similarity = computeSimilarity(a, b);
  const wordCountA = a.split(/\s+/).filter(Boolean).length;
  const wordCountB = b.split(/\s+/).filter(Boolean).length;
  const readingTimeA = Math.ceil(wordCountA / 200);
  const readingTimeB = Math.ceil(wordCountB / 200);
  const changePercent = a.length > 0 ? Math.round(((charsAdded + charsRemoved) / Math.max(a.length, 1)) * 100) : b.length > 0 ? 100 : 0;

  return {
    linesA: linesA.length,
    linesB: linesB.length,
    charsA: a.length,
    charsB: b.length,
    wordsA: wordCountA,
    wordsB: wordCountB,
    linesAdded: added,
    linesRemoved: removed,
    charsAdded,
    charsRemoved,
    wordDiff: wordCountB - wordCountA,
    readingTimeA,
    readingTimeB,
    similarity: Math.round(similarity * 100),
    changePercent: Math.min(changePercent, 100),
    complexity: a.length + b.length > 1000 ? "High" : a.length + b.length > 200 ? "Medium" : "Low",
  };
}

function computeSimilarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance / maxLen;
}

export function generateDiffHtml(textA, textB, options = {}) {
  const diff = computeDiff(textA, textB, options);
  let html = "";
  diff.forEach((part) => {
    const cls = part.added ? "diff-added" : part.removed ? "diff-removed" : "";
    html += `<span class="${cls}">${escapeHtml(part.value)}</span>`;
  });
  return html;
}

export function generateDiffMarkdown(textA, textB, options = {}) {
  const diff = computeDiff(textA, textB, { ...options, mode: "line" });
  let md = "";
  diff.forEach((part) => {
    if (part.added) md += `+ ${part.value}\n`;
    else if (part.removed) md += `- ${part.value}\n`;
    else md += `  ${part.value}\n`;
  });
  return md;
}

export function generateDiffJson(textA, textB, options = {}) {
  const diff = computeDiff(textA, textB, options);
  return JSON.stringify(diff.map((part) => ({
    type: part.added ? "added" : part.removed ? "removed" : "unchanged",
    value: part.value,
  })), null, 2);
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
