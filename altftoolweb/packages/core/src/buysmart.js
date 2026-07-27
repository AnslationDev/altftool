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

export function normalizeVerificationStatus(value, fallback = "pending") {
  const normalized = cleanText(value).toLowerCase().replace(/[\s_]+/g, "-");

  if (["draft", "pending", "verified", "expired", "rejected"].includes(normalized)) {
    return normalized;
  }

  return fallback;
}

export function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizePercent(value, fallback = 0) {
  const parsed = normalizeNumber(value, fallback);
  return Math.max(0, Math.min(100, parsed));
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

export function normalizeMerchantUrl(value) {
  const rawValue = cleanText(value);
  if (!rawValue || rawValue === "#") return "#";
  if (rawValue.startsWith("/") || rawValue.startsWith("#")) return rawValue;
  if (/^(mailto|tel):/i.test(rawValue)) return rawValue;
  return /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;
}

export function isExternalMerchantUrl(value) {
  return /^https?:\/\//i.test(cleanText(value));
}

export function getBrandLogoUrl(item = {}) {
  const domain = getDomainFromUrl(
    item.link || item.url || item.domain || item.website || item.slug,
  );

  if (!domain) return "";

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
}

export function slugifyBuySmartBrand(value) {
  const slug = cleanText(value)
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "brand";
}

export function getBuySmartBrandSlug(item = {}) {
  const domain = getDomainFromUrl(
    item.link || item.url || item.domain || item.website,
  );

  return slugifyBuySmartBrand(
    item.storeSlug ||
      item.brandSlug ||
      item.slug ||
      domain ||
      item.title ||
      item.name ||
      item.brand,
  );
}

export function getBuySmartStorePath(item = {}) {
  return `/buysmart/stores/${getBuySmartBrandSlug(item)}`;
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
  const link = normalizeMerchantUrl(cleanText(item.link) || cleanText(item.url) || "#");
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
  const hasExplicitVerificationStatus = Boolean(
    cleanText(item.verificationStatus || item.verificationState || item.verification),
  );
  const verificationStatus = normalizeVerificationStatus(
    item.verificationStatus ||
      item.verificationState ||
      item.verification ||
      (verified ? "verified" : ""),
  );
  const activeVerified = verificationStatus === "verified" || (!hasExplicitVerificationStatus && verified);
  const storeSlug = getBuySmartBrandSlug({ ...item, link, title });
  const workingVotes = normalizeInteger(item.workingVotes || item.worksVotes || item.upVotes, 0);
  const failedVotes = normalizeInteger(item.failedVotes || item.failVotes || item.downVotes, 0);

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
    failedVotes,
    image,
    img: image,
    lastVerifiedAt: cleanText(item.lastVerifiedAt || item.verifiedAt || item.checkedAt),
    link,
    offerType,
    points,
    priority: normalizeInteger(item.priority, 0),
    reviewNote: cleanText(item.reviewNote || item.verificationNote || item.notes),
    status: normalizeStatus(item.status),
    storePath: getBuySmartStorePath({ ...item, link, title }),
    storeSlug,
    successRate: normalizePercent(item.successRate || item.workingRate, activeVerified ? 100 : 0),
    terms: cleanText(item.terms),
    title,
    url: cleanText(item.url) || link,
    verificationStatus,
    verified: activeVerified,
    workingVotes,
  };
}

export function getBuySmartExpiryState(value, now = Date.now()) {
  const rawValue = cleanText(value);
  if (!rawValue) return { label: "No expiry", status: "unknown" };

  const time = new Date(rawValue).getTime();
  if (!Number.isFinite(time)) return { label: "Expiry unclear", status: "unknown" };

  const diff = time - now;
  if (diff < 0) return { label: "Expired", status: "expired", time };
  if (diff <= 1000 * 60 * 60 * 24 * 7) return { label: "Expires soon", status: "soon", time };
  return { label: "Active expiry", status: "active", time };
}

function qualityIssue(key, label, severity = "warning", help = "") {
  return { help, key, label, severity };
}

export function getBuySmartQualityIssues(item = {}, allItems = []) {
  const normalized = normalizeBuySmartCategory(item);
  const issues = [];
  const rawTitle = cleanText(item.title || item.name || item.brand || item.slug);
  const savings = getPrimarySavingsText(normalized);
  const expiry = getBuySmartExpiryState(normalized.expiresAt);
  const comparableItems = Array.isArray(allItems) ? allItems : [];
  const duplicateCount = comparableItems
    .map((candidate) => normalizeBuySmartCategory(candidate).storeSlug)
    .filter((slug) => slug === normalized.storeSlug).length;

  if (!rawTitle) {
    issues.push(qualityIssue("missing-title", "Missing title", "critical", "Add a readable brand or store title."));
  }

  if (!isExternalMerchantUrl(normalized.link)) {
    issues.push(qualityIssue("missing-link", "Missing merchant URL", "critical", "Add a live https merchant or affiliate URL."));
  }

  if (savings === "View deal" && !normalized.code) {
    issues.push(qualityIssue("missing-saving", "Missing saving copy", "warning", "Add discount, cashback, points, or coupon code."));
  }

  if (!normalized.img) {
    issues.push(qualityIssue("missing-image", "Missing image/logo", "info", "Add a logo or image for stronger cards."));
  }

  if (expiry.status === "expired") {
    issues.push(qualityIssue("expired", "Expired offer", "critical", "Pause or update the offer expiry before publishing."));
  } else if (expiry.status === "soon") {
    issues.push(qualityIssue("expires-soon", "Expires soon", "warning", "Confirm the offer is still usable."));
  }

  if (normalized.verificationStatus !== "verified") {
    issues.push(qualityIssue("needs-verification", "Needs verification", "warning", "Review terms and mark verified when checked."));
  }

  if (normalized.workingVotes + normalized.failedVotes >= 3 && normalized.successRate < 70) {
    issues.push(qualityIssue("low-success", "Low success rate", "warning", "Review recent user feedback before featuring."));
  }

  if (normalized.failedVotes > normalized.workingVotes) {
    issues.push(qualityIssue("failed-votes", "More failed than working votes", "warning", "Check whether the offer still works."));
  }

  if (duplicateCount > 1) {
    issues.push(qualityIssue("duplicate-store", "Duplicate store", "warning", "Merge duplicate rows with the same store slug."));
  }

  return issues;
}

export function getBuySmartQualitySummary(item = {}, allItems = []) {
  const issues = getBuySmartQualityIssues(item, allItems);
  const criticalCount = issues.filter((issue) => issue.severity === "critical").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const infoCount = issues.filter((issue) => issue.severity === "info").length;
  const score = Math.max(0, 100 - criticalCount * 35 - warningCount * 18 - infoCount * 6);

  return {
    criticalCount,
    infoCount,
    issueCount: issues.length,
    issues,
    score,
    status: criticalCount ? "fix" : warningCount ? "review" : "ready",
    warningCount,
  };
}

export function summarizeBuySmartQuality(items = []) {
  const rows = (Array.isArray(items) ? items : []).map((item) => ({
    item,
    quality: getBuySmartQualitySummary(item, items),
  }));

  return {
    fix: rows.filter((row) => row.quality.status === "fix").length,
    ready: rows.filter((row) => row.quality.status === "ready").length,
    review: rows.filter((row) => row.quality.status === "review").length,
    rows,
    total: rows.length,
  };
}

export function normalizeBuySmartCounter(counter = {}) {
  return {
    copy: normalizeInteger(counter.copy, 0),
    failed: normalizeInteger(counter.failed, 0),
    outbound: normalizeInteger(counter.outbound, 0),
    reveal: normalizeInteger(counter.reveal, 0),
    worked: normalizeInteger(counter.worked, 0),
  };
}

export function getBuySmartCounterForItem(item = {}, counters = {}) {
  const normalized = normalizeBuySmartCategory(item);
  const counter = counters?.[normalized.storeSlug] || counters?.[getBuySmartBrandSlug(normalized)] || {};
  return normalizeBuySmartCounter(counter);
}

export function getBuySmartTrustSignals(item = {}, counters = {}) {
  const normalized = normalizeBuySmartCategory(item);
  const counter = getBuySmartCounterForItem(normalized, counters);
  const workingVotes = normalizeInteger(normalized.workingVotes, 0) + counter.worked;
  const failedVotes = normalizeInteger(normalized.failedVotes, 0) + counter.failed;
  const voteTotal = workingVotes + failedVotes;
  const shopperActions = counter.reveal + counter.copy + counter.outbound + counter.worked + counter.failed;
  const shopperUsed = Math.max(counter.copy + counter.outbound + counter.worked, workingVotes);
  const workedRate = voteTotal
    ? Math.round((workingVotes / voteTotal) * 100)
    : normalizePercent(normalized.successRate, normalized.verified ? 100 : 0);
  const isRecentlyVerified = Boolean(cleanText(normalized.lastVerifiedAt));
  const needsRecheck = failedVotes > workingVotes && failedVotes >= 2;
  const hasLiveActivity = shopperActions > 0;

  let label = normalized.verified ? "Verified" : "Needs check";
  let tone = normalized.verified ? "strong" : "warning";

  if (needsRecheck) {
    label = "Needs recheck";
    tone = "warning";
  } else if (voteTotal > 0 || workedRate > 0) {
    label = `${workedRate}% worked`;
    tone = workedRate >= 80 ? "strong" : "warning";
  } else if (isRecentlyVerified) {
    label = "Recently verified";
    tone = "strong";
  } else if (hasLiveActivity) {
    label = `${shopperActions} actions`;
    tone = "soft";
  }

  return {
    counter,
    failedVotes,
    hasLiveActivity,
    isRecentlyVerified,
    label,
    needsRecheck,
    shopperActions,
    shopperUsed,
    tone,
    workedRate,
    workedRateLabel: `${workedRate}%`,
    workingVotes,
  };
}

export function getBuySmartRankingScore(item = {}, counters = {}, allItems = []) {
  const normalized = normalizeBuySmartCategory(item);
  const trust = getBuySmartTrustSignals(normalized, counters);
  const quality = getBuySmartQualitySummary(normalized, allItems);
  let score = normalizeInteger(normalized.priority, 0);

  if (normalized.featured) score += 40;
  if (normalized.verified) score += 32;
  if (normalized.exclusive) score += 12;
  if (normalized.code) score += 8;

  score += Math.round(quality.score / 4);
  score += Math.min(35, trust.shopperActions * 3);
  score += Math.min(24, trust.shopperUsed * 2);
  score += Math.round(trust.workedRate / 5);

  if (trust.needsRecheck) score -= 45;
  if (!isExternalMerchantUrl(normalized.link)) score -= 55;
  if (quality.status === "fix") score -= 50;
  if (quality.status === "review") score -= 18;
  if (getBuySmartExpiryState(normalized.expiresAt).status === "expired") score -= 60;

  return score;
}

export function sortBuySmartByTrust(items = [], counters = {}) {
  const normalizedItems = (Array.isArray(items) ? items : []).map(normalizeBuySmartCategory);

  return normalizedItems.sort((a, b) => {
    const scoreDiff =
      getBuySmartRankingScore(b, counters, normalizedItems) -
      getBuySmartRankingScore(a, counters, normalizedItems);

    if (scoreDiff !== 0) return scoreDiff;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}
