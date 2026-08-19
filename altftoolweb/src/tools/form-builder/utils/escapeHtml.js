// Escapes HTML special characters so untrusted field text (which can come
// from a decoded share link, see utils/shareForm.js's decodeForm) can never
// break out of an HTML attribute/text position when interpolated into
// generated/downloaded markup (download/download.js, component/ExportPanel.jsx).
export const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};
