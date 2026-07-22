// Export helpers. PDF uses jsPDF direct drawing calls (same lazy-import
// pattern as src/tools/household-electricity-bill/components/PDFButton.jsx);
// JSON/TXT use the plain Blob + anchor-download pattern used across the repo
// (e.g. src/tools/privacy-policy-generator/utils/downloadTXT.js) — no new
// dependency needed for either.

let jsPdfPromise;
function loadJsPdf() {
  jsPdfPromise ||= import("jspdf").then((m) => m.default || m.jsPDF);
  return jsPdfPromise;
}

const METRIC_ROWS = [
  ["Length", "length"],
  ["Spam Risk", "spamRisk"],
  ["Readability", "readability"],
  ["Personalization", "personalization"],
  ["Urgency", "urgency"],
  ["Power Words", "powerWords"],
  ["Capitalization", "capitalization"],
  ["Numbers", "numbers"],
  ["Emoji Usage", "emoji"],
  ["Clickability", "clickability"],
];

function buildFilename(subject, ext) {
  const slug =
    (subject || "subject-line")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "subject-line";
  return `email-subject-analysis-${slug}.${ext}`;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportJSON(analysis, extra = {}) {
  const payload = {
    subject: analysis.subject,
    analyzedAt: new Date().toISOString(),
    ...extra,
    analysis,
  };
  downloadBlob(JSON.stringify(payload, null, 2), buildFilename(analysis.subject, "json"), "application/json;charset=utf-8");
}

export function exportTXT(analysis, { suggestions = [], variations = [] } = {}) {
  const lines = [
    "EMAIL SUBJECT LINE ANALYSIS",
    "=".repeat(40),
    `Subject: ${analysis.subject}`,
    `Overall Score: ${analysis.scores.overall}/100 (Grade ${analysis.scores.grade})`,
    "",
    "METRIC BREAKDOWN",
    "-".repeat(40),
    ...METRIC_ROWS.map(([label, key]) => `${label}: ${analysis.scores[key]}/100`),
    "",
  ];

  if (suggestions.length) {
    lines.push("SUGGESTIONS", "-".repeat(40), ...suggestions.map((s, i) => `${i + 1}. ${s}`), "");
  }

  if (variations.length) {
    lines.push(
      "SUGGESTED VARIATIONS",
      "-".repeat(40),
      ...variations.map((v, i) => `${i + 1}. ${v.text} (projected ${v.projectedScore}/100)`),
    );
  }

  downloadBlob(lines.join("\n"), buildFilename(analysis.subject, "txt"), "text/plain;charset=utf-8");
}

export async function exportPDF(analysis, { suggestions = [], variations = [] } = {}) {
  const jsPDF = await loadJsPdf();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  let y = 96;

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage();
      y = 56;
    }
  };

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Email Subject Line Analysis", marginX, 40);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.text("Subject:", marginX, y);
  const subjectLines = doc.splitTextToSize(analysis.subject || "(empty)", pageWidth - marginX * 2 - 70);
  doc.text(subjectLines, marginX + 60, y);
  y += subjectLines.length * 16 + 16;

  ensureSpace(28);
  doc.setFontSize(14);
  doc.text(`Overall Score: ${analysis.scores.overall}/100  (Grade ${analysis.scores.grade})`, marginX, y);
  y += 28;

  ensureSpace(24);
  doc.setFontSize(13);
  doc.text("Metric Breakdown", marginX, y);
  y += 18;
  doc.setFontSize(11);
  METRIC_ROWS.forEach(([label, key]) => {
    ensureSpace(18);
    doc.text(label, marginX, y);
    doc.text(`${analysis.scores[key]}/100`, marginX + 220, y);
    y += 16;
  });
  y += 10;

  if (suggestions.length) {
    ensureSpace(24);
    doc.setFontSize(13);
    doc.text("Suggestions", marginX, y);
    y += 18;
    doc.setFontSize(11);
    suggestions.forEach((s, i) => {
      const wrapped = doc.splitTextToSize(`${i + 1}. ${s}`, pageWidth - marginX * 2);
      ensureSpace(wrapped.length * 14 + 4);
      doc.text(wrapped, marginX, y);
      y += wrapped.length * 14 + 4;
    });
    y += 10;
  }

  if (variations.length) {
    ensureSpace(24);
    doc.setFontSize(13);
    doc.text("Suggested Variations", marginX, y);
    y += 18;
    doc.setFontSize(11);
    variations.forEach((v, i) => {
      const wrapped = doc.splitTextToSize(`${i + 1}. ${v.text}  (projected ${v.projectedScore}/100)`, pageWidth - marginX * 2);
      ensureSpace(wrapped.length * 14 + 4);
      doc.text(wrapped, marginX, y);
      y += wrapped.length * 14 + 4;
    });
  }

  doc.save(buildFilename(analysis.subject, "pdf"));
}
