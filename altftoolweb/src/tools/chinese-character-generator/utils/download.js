// Export helpers: PNG (via html-to-image), SVG (inline build), and JSON blobs.
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";

// Download a rendered card DOM node as a PNG.
export async function downloadCardPng(node, fileName = "character.png") {
  const dataUrl = await toPng(node, {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: null,
  });
  saveAs(dataUrl, fileName);
}

// Build a standalone SVG string containing the glyph and its metadata.
export function buildCharacterSvg(item) {
  const label = item.pinyin || "";
  const lines = [
    `Glyph: ${item.char}`,
    `Pinyin: ${label}`,
    `Meaning: ${item.meaning}`,
    `Strokes: ${item.strokes}`,
    `Unicode: ${item.unicode}`,
    `Category: ${item.category}`,
  ];
  const metaStart = 200;
  const metaStep = 26;
  const meta = lines
    .map(
      (line, i) =>
        `<text x="40" y="${metaStart + i * metaStep}" font-family="sans-serif" font-size="20" fill="#1f2937">${escapeXml(
          line
        )}</text>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="${
    metaStart + lines.length * metaStep + 40
  }" viewBox="0 0 420 ${metaStart + lines.length * metaStep + 40}">
  <rect x="0" y="0" width="420" height="${
    metaStart + lines.length * metaStep + 40
  }" fill="#ffffff"/>
  <text x="210" y="160" text-anchor="middle" font-family="Noto Serif SC, Songti SC, STSong, serif" font-size="150" fill="#14B8A6">${escapeXml(
    item.char
  )}</text>
  ${meta}
</svg>`;
}

export function downloadCharacterSvg(item, fileName) {
  const name = fileName || `character-${item.char}-${item.unicode}.svg`;
  const blob = new Blob([buildCharacterSvg(item)], {
    type: "image/svg+xml;charset=utf-8",
  });
  saveAs(blob, name);
}

// Download arbitrary JSON (e.g. history export).
export function downloadJson(data, fileName = "data.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  saveAs(blob, fileName);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
