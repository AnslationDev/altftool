import { normalizeLine } from "./textMetrics";

export function compareTexts(leftText, rightText, options) {
  const leftLines = leftText.split(/\r?\n/);
  const rightLines = rightText.split(/\r?\n/);
  const maxLength = Math.max(leftLines.length, rightLines.length);
  const rows = [];
  let added = 0;
  let removed = 0;
  let modified = 0;
  let unchanged = 0;

  for (let index = 0; index < maxLength; index += 1) {
    const left = leftLines[index] ?? "";
    const right = rightLines[index] ?? "";
    const leftExists = index < leftLines.length;
    const rightExists = index < rightLines.length;
    const normalizedLeft = normalizeLine(left, options);
    const normalizedRight = normalizeLine(right, options);
    let type = "unchanged";

    if (!leftExists && rightExists) {
      type = "added";
      added += 1;
    } else if (leftExists && !rightExists) {
      type = "removed";
      removed += 1;
    } else if (normalizedLeft !== normalizedRight) {
      type = "modified";
      modified += 1;
    } else {
      unchanged += 1;
    }

    rows.push({ index: index + 1, left, right, type });
  }

  const comparable = Math.max(maxLength, 1);
  const similarity = Math.round((unchanged / comparable) * 100);

  return {
    rows,
    stats: {
      added,
      removed,
      modified,
      unchanged,
      similarity,
      total: maxLength,
    },
  };
}

export function buildDiffReport(result) {
  const lines = [
    "Text Compare Report",
    `Similarity: ${result.stats.similarity}%`,
    `Added lines: ${result.stats.added}`,
    `Removed lines: ${result.stats.removed}`,
    `Modified lines: ${result.stats.modified}`,
    "",
  ];

  result.rows.forEach((row) => {
    if (row.type === "unchanged") return;
    lines.push(`Line ${row.index} [${row.type}]`);
    lines.push(`- ${row.left}`);
    lines.push(`+ ${row.right}`);
  });

  return lines.join("\n");
}
