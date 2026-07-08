export function markerStart(prefix, id) {
  return `<!-- ${prefix}:${id} START -->`;
}

export function markerEnd(prefix, id) {
  return `<!-- ${prefix}:${id} END -->`;
}

export function wrapMarkedBlock(prefix, id, html) {
  return `${markerStart(prefix, id)}\n${html}\n${markerEnd(prefix, id)}`;
}

export function hasMarkedBlock(description = "", prefix, id) {
  return String(description || "").includes(markerStart(prefix, id));
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function removeMarkedBlock(description = "", prefix, id) {
  const pattern = new RegExp(
    `[ \\t]*${escapeRegExp(markerStart(prefix, id))}[\\s\\S]*?${escapeRegExp(markerEnd(prefix, id))}[ \\t]*`,
    "g",
  );
  return String(description || "").replace(pattern, "").replace(/\n{3,}/g, "\n\n").trim();
}

export function appendHtmlBlock(description = "", html = "") {
  const current = String(description || "");
  return `${current}${current.trim() ? "\n\n" : ""}${html}`;
}

export const normalizeFieldValue = (value = "") => String(value ?? "").replace(/\s+/g, " ").trim();

export function fieldsMatch(formData = {}, fields = {}) {
  const entries = Object.entries(fields || {});
  if (!entries.length) return false;
  return entries.every(([key, suggested]) => {
    const current = normalizeFieldValue(formData[key]);
    return current !== "" && current === normalizeFieldValue(suggested);
  });
}

export function clearedFields(fields = {}) {
  return Object.fromEntries(Object.keys(fields || {}).map((key) => [key, ""]));
}
