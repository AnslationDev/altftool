/**
 * Split PDF — pure page-selection and split-planning logic.
 *
 * The UI loads the PDF with pdf-lib and writes the output documents; every
 * decision about which 1-based source page lands in which output file is made
 * here so it can be tested without a browser.
 *
 * Rules implemented:
 *  - Page numbers shown to the user are 1-based (page 1 is the first page),
 *    matching every PDF reader. pdf-lib's copyPages() is 0-based, so parts also
 *    carry a zeroBased array ready to hand straight to it.
 *  - A range expression accepts comma or space separated items:
 *      "5"      a single page
 *      "2-7"    an inclusive range
 *      "9-"     page 9 to the last page
 *      "-4"     page 1 to page 4
 *      "last"   the final page
 *    Reversed ranges such as "7-2" are read in descending order, which lets a
 *    range double as a page-reordering instruction.
 *  - Extract keeps the listed pages in the order given; Remove keeps every page
 *    NOT listed, in original order.
 */

/** Cap on generated files so a browser tab cannot be flooded. */
export const MAX_PARTS = 500;

export const SPLIT_MODES = [
  { id: "each", label: "One PDF per page" },
  { id: "every", label: "Fixed batches of N pages" },
  { id: "ranges", label: "Custom ranges — one PDF per range" },
  { id: "extract", label: "Extract selected pages into one PDF" },
  { id: "remove", label: "Remove selected pages, keep the rest" },
];

function pad(value, width) {
  return String(value).padStart(width, "0");
}

/** File-name-safe stem. */
export function safeFileName(value) {
  const cleaned = String(value ?? "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned === "" ? "document" : cleaned.slice(0, 60);
}

/**
 * Parse a page-range expression into groups of 1-based page numbers.
 *
 * @param {string} spec       e.g. "1-3, 5, 9-"
 * @param {number} pageCount  Total pages in the source PDF.
 * @returns {{groups: number[][], pages: number[], labels: string[]}|{error: string}}
 */
export function parsePageRanges(spec, pageCount) {
  const total = Math.trunc(Number(pageCount));
  if (!Number.isFinite(total) || total < 1) {
    return { error: "Load a PDF with at least one page first." };
  }
  const text = String(spec ?? "").trim();
  if (text === "") return { error: "Enter at least one page or range, for example 1-3, 5." };

  const items = text
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter((part) => part !== "");
  if (items.length === 0) return { error: "Enter at least one page or range, for example 1-3, 5." };

  const groups = [];
  const labels = [];

  const readEndpoint = (token, fallback) => {
    const t = token.trim().toLowerCase();
    if (t === "") return fallback;
    if (t === "last" || t === "end" || t === "n") return total;
    if (!/^\d+$/.test(t)) return null;
    return Number(t);
  };

  for (const item of items) {
    const dashMatch = item.match(/^(.*?)\s*[-–:]\s*(.*)$/);
    let start;
    let end;
    if (dashMatch) {
      start = readEndpoint(dashMatch[1], 1);
      end = readEndpoint(dashMatch[2], total);
    } else {
      start = readEndpoint(item, null);
      end = start;
    }
    if (start === null || end === null) {
      return { error: `"${item}" is not a page number or range. Use forms like 3, 2-7, 9- or last.` };
    }
    if (start < 1 || end < 1 || start > total || end > total) {
      return { error: `"${item}" is outside this document, which has ${total} page${total === 1 ? "" : "s"}.` };
    }
    const step = end >= start ? 1 : -1;
    const pages = [];
    for (let p = start; step > 0 ? p <= end : p >= end; p += step) pages.push(p);
    groups.push(pages);
    labels.push(start === end ? `p${start}` : `p${start}-${end}`);
  }

  const pages = groups.flat();
  return { groups, pages, labels };
}

/**
 * Build the split plan.
 *
 * @param {object} input
 * @param {number} input.pageCount    Pages in the source PDF.
 * @param {string} [input.mode]       SPLIT_MODES[].id.
 * @param {number} [input.everyN]     Pages per file when mode === "every".
 * @param {string} [input.rangeSpec]  Range expression for ranges/extract/remove.
 * @param {string} [input.baseName]   Output file-name stem.
 * @returns {{parts: Array, partCount: number, pageCount: number, pagesUsed: number}|{error: string}}
 */
export function planPdfSplit({ pageCount, mode = "each", everyN = 1, rangeSpec = "", baseName = "document" }) {
  const total = Math.trunc(Number(pageCount));
  if (!Number.isFinite(total) || total < 1) {
    return { error: "Load a PDF with at least one page first." };
  }
  const stem = safeFileName(baseName);
  const width = String(total).length;

  let groups;
  let labels;

  if (mode === "each") {
    if (total > MAX_PARTS) {
      return {
        error: `This PDF has ${total} pages, which would create ${total} files. Use fixed batches instead of one file per page (limit ${MAX_PARTS}).`,
      };
    }
    groups = Array.from({ length: total }, (_, i) => [i + 1]);
    labels = groups.map((g) => `page-${pad(g[0], width)}`);
  } else if (mode === "every") {
    const size = Math.trunc(Number(everyN));
    if (!Number.isFinite(size) || size < 1) {
      return { error: "Pages per file must be a whole number of 1 or more." };
    }
    const partCount = Math.ceil(total / size);
    if (partCount > MAX_PARTS) {
      return { error: `That would create ${partCount} files. Raise pages per file to stay under ${MAX_PARTS}.` };
    }
    groups = [];
    labels = [];
    for (let start = 1; start <= total; start += size) {
      const end = Math.min(start + size - 1, total);
      const pages = [];
      for (let p = start; p <= end; p += 1) pages.push(p);
      groups.push(pages);
      labels.push(start === end ? `p${pad(start, width)}` : `p${pad(start, width)}-${pad(end, width)}`);
    }
  } else if (mode === "ranges") {
    const parsed = parsePageRanges(rangeSpec, total);
    if (parsed.error) return parsed;
    if (parsed.groups.length > MAX_PARTS) {
      return { error: `That is ${parsed.groups.length} ranges — the limit is ${MAX_PARTS} output files.` };
    }
    groups = parsed.groups;
    labels = parsed.labels;
  } else if (mode === "extract") {
    const parsed = parsePageRanges(rangeSpec, total);
    if (parsed.error) return parsed;
    groups = [parsed.pages];
    labels = ["extracted"];
  } else if (mode === "remove") {
    const parsed = parsePageRanges(rangeSpec, total);
    if (parsed.error) return parsed;
    const drop = new Set(parsed.pages);
    const kept = [];
    for (let p = 1; p <= total; p += 1) if (!drop.has(p)) kept.push(p);
    if (kept.length === 0) {
      return { error: "That removes every page — a PDF must keep at least one page." };
    }
    groups = [kept];
    labels = ["trimmed"];
  } else {
    return { error: "Choose a split mode." };
  }

  if (!groups || groups.length === 0) return { error: "Nothing to split — no pages were selected." };

  const parts = groups.map((pages, index) => ({
    index: index + 1,
    label: labels[index],
    filename: `${stem}-${labels[index]}.pdf`,
    pages,
    zeroBased: pages.map((p) => p - 1),
    pageCount: pages.length,
  }));

  return {
    parts,
    partCount: parts.length,
    pageCount: total,
    pagesUsed: parts.reduce((sum, p) => sum + p.pageCount, 0),
    largestPart: parts.reduce((max, p) => Math.max(max, p.pageCount), 0),
    smallestPart: parts.reduce((min, p) => Math.min(min, p.pageCount), parts[0].pageCount),
    mode,
  };
}
