// URL + favicon helpers.

export function isValidUrl(value) {
  if (!value) return false;
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function normalizeUrl(value) {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getDomain(value) {
  try {
    return new URL(normalizeUrl(value)).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function getFaviconUrl(value) {
  const domain = getDomain(value);
  if (!domain) return "";
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
