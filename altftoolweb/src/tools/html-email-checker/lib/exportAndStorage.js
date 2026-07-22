// Export (PDF/JSON/cleaned HTML) + localStorage recent-analyses, combined in
// one file since neither is large enough to justify a separate module.
// PDF uses jsPDF direct drawing (same lazy-import pattern as
// src/tools/household-electricity-bill/components/PDFButton.jsx); JSON and
// the cleaned-HTML download use the plain Blob + anchor pattern used
// elsewhere in this repo — no new dependency needed for either.

const HISTORY_KEY = "hec_history";
const MAX_HISTORY = 15;

function safeGet(key, fallback) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full, disabled, or private-mode browsing — fail silently
  }
}

export function getRecentAnalyses() {
  return safeGet(HISTORY_KEY, []);
}

export function pushRecentAnalysis(entry) {
  const next = [
    { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ts: Date.now() },
    ...getRecentAnalyses(),
  ].slice(0, MAX_HISTORY);
  safeSet(HISTORY_KEY, next);
  return next;
}

export function clearRecentAnalyses() {
  safeSet(HISTORY_KEY, []);
  return [];
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

export function downloadCleanedHtml(html) {
  downloadBlob(html, "cleaned-email.html", "text/html;charset=utf-8");
}

export function exportJSON(audit) {
  const payload = { generatedAt: new Date().toISOString(), ...audit };
  downloadBlob(JSON.stringify(payload, null, 2), "html-email-audit.json", "application/json;charset=utf-8");
}

let jsPdfPromise;
function loadJsPdf() {
  jsPdfPromise ||= import("jspdf").then((m) => m.default || m.jsPDF);
  return jsPdfPromise;
}

export async function exportPDF(audit) {
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

  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("HTML Email Audit Report", marginX, 40);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(14);
  doc.text(`Overall Score: ${audit.overallScore}/100  (Grade ${audit.grade})`, marginX, y);
  y += 24;
  doc.setFontSize(11);
  doc.text(`Size: ${audit.stats.sizeKb}KB · Images: ${audit.stats.imageCount} · Links: ${audit.stats.linkCount} · Tables: ${audit.stats.tableCount}`, marginX, y);
  y += 28;

  ensureSpace(20);
  doc.setFontSize(13);
  doc.text("Category scores", marginX, y);
  y += 18;
  doc.setFontSize(11);
  Object.entries(audit.categoryScores).forEach(([key, value]) => {
    ensureSpace(16);
    doc.text(key, marginX, y);
    doc.text(`${value}/100`, marginX + 220, y);
    y += 16;
  });
  y += 12;

  ensureSpace(20);
  doc.setFontSize(13);
  doc.text("Client compatibility", marginX, y);
  y += 18;
  doc.setFontSize(11);
  Object.entries(audit.clientScores).forEach(([key, value]) => {
    ensureSpace(16);
    doc.text(key, marginX, y);
    doc.text(`${value}/100`, marginX + 220, y);
    y += 16;
  });
  y += 14;

  ensureSpace(20);
  doc.setFontSize(13);
  doc.text(`Issues (${audit.issues.length})`, marginX, y);
  y += 18;
  doc.setFontSize(10);
  audit.issues.forEach((issue, i) => {
    const wrapped = doc.splitTextToSize(`${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title} — ${issue.explanation || issue.why}`, pageWidth - marginX * 2);
    ensureSpace(wrapped.length * 12 + 6);
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 12 + 6;
  });

  doc.save("html-email-audit.pdf");
}
