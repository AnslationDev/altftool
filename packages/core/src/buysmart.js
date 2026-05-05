export function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeStatus(value, fallback = "active") {
  const status = cleanText(value).toLowerCase();
  if (["active", "paused", "draft", "inactive"].includes(status)) return status;
  return fallback;
}

export function isActiveStatus(value) {
  return normalizeStatus(value) === "active";
}

export function isLoadableImageUrl(value) {
  const url = cleanText(value);
  if (!url || url.startsWith("blob:")) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  return /^https?:\/\//i.test(url);
}

export function getDomainFromUrl(value) {
  const rawValue = cleanText(value);
  if (!rawValue) return "";

  const candidate = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;

  try {
    return new URL(candidate).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

export function getBrandLogoUrl(item = {}) {
  const domain = getDomainFromUrl(
    item.link || item.url || item.domain || item.website || item.slug,
  );

  if (!domain) return "";

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
}

export function getBuySmartImageUrl(item = {}) {
  const directImage = [
    item.img,
    item.image,
    item.logo,
    item.imageUrl,
    item.thumbnail,
    item.photoURL,
  ].find(isLoadableImageUrl);

  return cleanText(directImage) || getBrandLogoUrl(item);
}

export function normalizeBuySmartCategory(item = {}) {
  const link = cleanText(item.link) || cleanText(item.url) || "#";
  const title =
    cleanText(item.title) ||
    cleanText(item.name) ||
    cleanText(item.brand) ||
    cleanText(item.slug) ||
    "Brand";
  const image = getBuySmartImageUrl({ ...item, link });

  return {
    ...item,
    category: cleanText(item.category) || "Popular",
    image,
    img: image,
    link,
    status: normalizeStatus(item.status),
    title,
    url: cleanText(item.url) || link,
  };
}
