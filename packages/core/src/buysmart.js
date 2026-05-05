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

export function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;

  const normalized = cleanText(value).toLowerCase();
  if (["true", "yes", "y", "1", "active", "verified", "featured"].includes(normalized)) {
    return true;
  }
  if (["false", "no", "n", "0", "paused", "inactive"].includes(normalized)) {
    return false;
  }

  return fallback;
}

export function normalizeOfferType(value) {
  const normalized = cleanText(value).toLowerCase();

  if (["coupon", "code", "promo", "voucher"].includes(normalized)) return "coupon";
  if (["cashback", "cash back", "cash-back"].includes(normalized)) return "cashback";
  if (["reward", "points", "loyalty"].includes(normalized)) return "reward";
  if (["student", "student-discount", "student discount"].includes(normalized)) return "student";
  if (["creator", "publisher", "affiliate"].includes(normalized)) return "creator";
  if (["sale", "deal", "offer"].includes(normalized)) return "deal";

  return "deal";
}

export function getPrimarySavingsText(item = {}) {
  return (
    cleanText(item.discount) ||
    cleanText(item.cashback) ||
    cleanText(item.cashBack) ||
    cleanText(item.points) ||
    cleanText(item.reward) ||
    cleanText(item.highlight) ||
    cleanText(item.offer) ||
    "View deal"
  );
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
  const code = cleanText(item.code) || cleanText(item.couponCode) || cleanText(item.promoCode);
  const cashback = cleanText(item.cashback) || cleanText(item.cashBack);
  const points = cleanText(item.points) || cleanText(item.reward);
  const discount =
    cleanText(item.discount) ||
    cleanText(item.offer) ||
    cleanText(item.highlight);
  const offerType = normalizeOfferType(item.offerType || (code ? "coupon" : cashback ? "cashback" : points ? "reward" : ""));
  const verified = toBoolean(item.verified, false);
  const featured = toBoolean(item.featured || item.isFeatured, false);
  const exclusive = toBoolean(item.exclusive || item.isExclusive, false);
  const priority = Number.parseInt(item.priority, 10);

  return {
    ...item,
    audience: cleanText(item.audience) || "All shoppers",
    cashback,
    category: cleanText(item.category) || "Popular",
    code,
    couponCode: code,
    disc: cleanText(item.disc) || cleanText(item.description),
    discount,
    exclusive,
    expiresAt: cleanText(item.expiresAt) || cleanText(item.expiry) || cleanText(item.expires),
    featured,
    image,
    img: image,
    link,
    offerType,
    points,
    priority: Number.isFinite(priority) ? priority : 0,
    status: normalizeStatus(item.status),
    terms: cleanText(item.terms),
    title,
    url: cleanText(item.url) || link,
    verified,
  };
}
