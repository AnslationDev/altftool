// Document structure analyzer: extracts headings, sections, tables, images, hyperlinks, footnotes

export function extractDocumentStructure(text, fileMeta = {}) {
  const lines = String(text || "").split("\n");
  const headings = [];
  const links = [];
  const footnotes = [];
  const lists = [];

  let tableCount = fileMeta.tableCount || 0;
  let imageCount = fileMeta.imageCount || 0;

  let currentHeading = null;
  let inCodeBlock = false;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) return;

    // Detect Markdown Headings (# H1, ## H2, etc.)
    const mdHead = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (mdHead) {
      const level = mdHead[1].length;
      const title = mdHead[2].trim();
      const node = {
        level,
        title,
        line: idx + 1,
        children: [],
      };
      headings.push(node);
      currentHeading = node;
      return;
    }

    // Heuristic Uppercase/Colon Headings
    if (
      trimmed.length <= 70 &&
      /^[A-Z0-9\s\-_:.,()]+$/.test(trimmed) &&
      trimmed.length > 3 &&
      !/[.!?]$/.test(trimmed)
    ) {
      headings.push({
        level: 2,
        title: trimmed,
        line: idx + 1,
        children: [],
      });
      return;
    }

    // Markdown / HTML Hyperlinks
    const linkMatches = trimmed.matchAll(/\[([^\]]+)\]\(([^)]+)\)|href=["']([^"']+)["']/g);
    for (const match of linkMatches) {
      links.push({
        label: match[1] || match[3],
        url: match[2] || match[3],
        line: idx + 1,
      });
    }

    // Footnotes / References
    const fnMatch = trimmed.match(/^\[\^(\d+)\]:\s*(.+)$/);
    if (fnMatch) {
      footnotes.push({
        id: fnMatch[1],
        content: fnMatch[2],
        line: idx + 1,
      });
    }

    // Detect Tables in plain text / markdown
    if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
      if (idx > 0 && lines[idx - 1].includes("---")) {
        // Table header line
        tableCount++;
      }
    }
  });

  return {
    headings,
    headingCount: headings.length,
    links,
    linkCount: links.length,
    footnotes,
    footnoteCount: footnotes.length,
    tableCount,
    imageCount,
  };
}

export function compareStructures(structA, structB) {
  const headingsA = structA.headings || [];
  const headingsB = structB.headings || [];

  const addedHeadings = [];
  const removedHeadings = [];
  const modifiedHeadings = [];

  const mapA = new Map(headingsA.map((h) => [h.title.toLowerCase(), h]));
  const mapB = new Map(headingsB.map((h) => [h.title.toLowerCase(), h]));

  headingsA.forEach((hA) => {
    const key = hA.title.toLowerCase();
    if (!mapB.has(key)) {
      removedHeadings.push(hA);
    } else {
      const hB = mapB.get(key);
      if (hA.level !== hB.level) {
        modifiedHeadings.push({ before: hA, after: hB, change: "level" });
      }
    }
  });

  headingsB.forEach((hB) => {
    const key = hB.title.toLowerCase();
    if (!mapA.has(key)) {
      addedHeadings.push(hB);
    }
  });

  const headingDelta = addedHeadings.length + removedHeadings.length + modifiedHeadings.length;
  const totalHeadings = Math.max(headingsA.length, headingsB.length) || 1;
  const structureSimilarity = Math.max(0, Math.round((1 - headingDelta / totalHeadings) * 100));

  return {
    addedHeadings,
    removedHeadings,
    modifiedHeadings,
    structureSimilarity,
    tableDelta: structB.tableCount - structA.tableCount,
    imageDelta: structB.imageCount - structA.imageCount,
    linkDelta: structB.linkCount - structA.linkCount,
  };
}
