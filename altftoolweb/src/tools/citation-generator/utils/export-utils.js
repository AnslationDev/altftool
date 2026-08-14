"use client";

/**
 * Export Utilities
 * Handles exporting citations to different formats.
 */

export const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const exportToTxt = (citation, title = "citation") => {
  const element = document.createElement("a");
  const file = new Blob([citation], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = `${title}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const exportToWordDoc = (citation, title = "citation") => {
  // HTML document that Word can open; this is deliberately .doc, not DOCX.
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${escapeHtml(title)}</title></head>
    <body>
      <p style="font-family: 'Times New Roman', serif; font-size: 12pt;">${escapeHtml(citation)}</p>
    </body>
    </html>
  `;
  const file = new Blob(['\ufeff', html], { type: 'application/msword' });
  const element = document.createElement("a");
  element.href = URL.createObjectURL(file);
  element.download = `${title}.doc`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const populateCitationPrintDocument = (printWindow, citation, title = "citation") => {
  const document = printWindow?.document;
  if (!document?.body || typeof document.createElement !== "function") return false;

  document.title = String(title ?? "citation");
  const pre = document.createElement("pre");
  pre.textContent = String(citation ?? "");
  document.body.replaceChildren(pre);
  return true;
};

export const printCitation = (citation, title = "citation") => {
  // The browser print dialog may offer "Save as PDF"; no PDF is generated here.
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;
  try {
    printWindow.opener = null;
  } catch {
    // Some browsers expose opener as read-only; textContent still prevents injection.
  }
  if (!populateCitationPrintDocument(printWindow, citation, title)) {
    printWindow.close?.();
    return false;
  }
  printWindow.focus?.();
  printWindow.print();
  return true;
};
