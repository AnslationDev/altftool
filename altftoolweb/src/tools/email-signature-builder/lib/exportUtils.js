// Export + persistence helpers. Copy uses the async Clipboard API with a
// text/html flavor so pasting into Gmail/Outlook keeps formatting; PNG uses
// html2canvas and PDF uses jsPDF via the same lazy-import pattern as other
// tools in this repo. Recents/favorites follow the safeGet/safeSet
// localStorage convention (prefix "esb_").

const RECENTS_KEY = "esb_recents";
const FAVORITES_KEY = "esb_favorites";
const MAX_RECENTS = 10;

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
    // storage full or unavailable — fail silently
  }
}

function makeEntry(state) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    label: state.personal.fullName || "Untitled signature",
    company: state.personal.company || "",
    templateId: state.templateId,
    state,
  };
}

export function getRecents() {
  return safeGet(RECENTS_KEY, []);
}

export function pushRecent(state) {
  const deduped = getRecents().filter(
    (e) => !(e.label === (state.personal.fullName || "Untitled signature") && e.templateId === state.templateId),
  );
  const next = [makeEntry(state), ...deduped].slice(0, MAX_RECENTS);
  safeSet(RECENTS_KEY, next);
  return next;
}

export function clearRecents() {
  safeSet(RECENTS_KEY, []);
  return [];
}

export function getFavorites() {
  return safeGet(FAVORITES_KEY, []);
}

export function saveFavorite(state) {
  const next = [makeEntry(state), ...getFavorites()];
  safeSet(FAVORITES_KEY, next);
  return next;
}

export function removeFavorite(id) {
  const next = getFavorites().filter((e) => e.id !== id);
  safeSet(FAVORITES_KEY, next);
  return next;
}

function downloadBlob(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Copies with a text/html clipboard flavor so pasting into a mail client's
// signature editor keeps the rendered signature (not raw code).
export async function copyRenderedSignature(html) {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([html], { type: "text/plain" }),
        }),
      ]);
      return true;
    }
  } catch {
    // fall through to plain text
  }
  try {
    await navigator.clipboard.writeText(html);
    return true;
  } catch {
    return false;
  }
}

export async function copyHtmlSource(html) {
  try {
    await navigator.clipboard.writeText(html);
    return true;
  } catch {
    return false;
  }
}

export function downloadHtml(html, name = "email-signature") {
  const doc = `<!DOCTYPE html>\n<html><head><meta charset="utf-8" /><title>Email Signature</title></head><body>\n${html}\n</body></html>`;
  downloadBlob(doc, `${name}.html`, "text/html;charset=utf-8");
}

export function downloadVCard(vcf, name = "contact") {
  downloadBlob(vcf, `${name}.vcf`, "text/vcard;charset=utf-8");
}

let html2canvasPromise;
function loadHtml2Canvas() {
  html2canvasPromise ||= import("html2canvas").then((m) => m.default || m);
  return html2canvasPromise;
}

let jsPdfPromise;
function loadJsPdf() {
  jsPdfPromise ||= import("jspdf").then((m) => m.default || m.jsPDF);
  return jsPdfPromise;
}

export async function downloadPng(node, name = "email-signature") {
  const html2canvas = await loadHtml2Canvas();
  const canvas = await html2canvas(node, { backgroundColor: null, scale: 2, useCORS: true });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (blob) downloadBlob(blob, `${name}.png`, "image/png");
}

export async function downloadPdf(node, name = "email-signature") {
  const [html2canvas, jsPDF] = await Promise.all([loadHtml2Canvas(), loadJsPdf()]);
  const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const drawWidth = Math.min(pageWidth - margin * 2, canvas.width / 2);
  const drawHeight = (canvas.height / canvas.width) * drawWidth;
  doc.setFontSize(14);
  doc.text("Email Signature", margin, 44);
  doc.addImage(imgData, "PNG", margin, 64, drawWidth, drawHeight);
  doc.save(`${name}.pdf`);
}
