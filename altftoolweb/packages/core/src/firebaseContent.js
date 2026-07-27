const DEFAULT_EXTENSION_CATEGORY = "Utilities & Calculators";
const DEFAULT_ACADEMY_CATEGORY = "Online Learning";
const DEFAULT_VIDEO_CATEGORY = "Technology";

export function cleanText(value, fallback = "") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

export function slugifyContent(value, fallback = "item") {
  const slug = cleanText(value)
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function normalizeNumber(value, fallback = 0, options = {}) {
  const parsed = Number(value);
  const base = Number.isFinite(parsed) ? parsed : fallback;
  const min = Number.isFinite(options.min) ? options.min : -Infinity;
  const max = Number.isFinite(options.max) ? options.max : Infinity;
  return Math.min(max, Math.max(min, base));
}

export function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;

  const normalized = cleanText(value).toLowerCase();
  if (["true", "yes", "y", "1", "active", "published", "enabled"].includes(normalized)) {
    return true;
  }
  if (["false", "no", "n", "0", "paused", "draft", "inactive", "disabled"].includes(normalized)) {
    return false;
  }

  return fallback;
}

export function normalizeStringArray(value) {
  const source = Array.isArray(value)
    ? value
    : cleanText(value)
      ? cleanText(value).split(",")
      : [];

  return source.map((item) => cleanText(item)).filter(Boolean);
}

export function normalizeHttpUrl(value) {
  const url = cleanText(value);
  return /^https?:\/\//i.test(url) ? url : "";
}

export function normalizeAssetUrl(value) {
  const url = cleanText(value);
  if (!url || url.startsWith("blob:")) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^data:image\//i.test(url)) return url;
  return "";
}

export function normalizeVideoType(value) {
  const normalized = cleanText(value).toLowerCase();
  if (["short", "shorts", "reel", "reels"].includes(normalized)) return "shorts";
  return "video";
}

export function compactFirestoreData(value) {
  if (Array.isArray(value)) return value.map(compactFirestoreData);
  if (!value || typeof value !== "object") return value;
  const prototype = Object.getPrototypeOf(value);
  if (prototype && prototype !== Object.prototype) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, compactFirestoreData(entryValue)]),
  );
}

export function normalizeExtension(data = {}, fallbackId = "") {
  const baseId = cleanText(fallbackId || data.id || data.slug);
  const name = cleanText(data.name || data.title || baseId, "Untitled Extension");
  const slug = slugifyContent(data.slug || baseId || name, slugifyContent(name, "extension"));
  const chromeUrl = normalizeHttpUrl(data.chromeUrl || data.chromeStoreUrl || data.url || data.link);

  return compactFirestoreData({
    ...data,
    id: cleanText(data.id || baseId || slug, slug),
    slug,
    name,
    category: cleanText(data.category, DEFAULT_EXTENSION_CATEGORY),
    description: cleanText(
      data.description || data.shortDescription,
      "Explore this extension on AltFTool.",
    ),
    icon: cleanText(data.icon, "Puzzle"),
    chromeUrl,
    image: normalizeAssetUrl(data.image || data.thumbnail || data.imageUrl || data.logo),
    rating: normalizeNumber(data.rating, 0, { min: 0, max: 5 }),
    features: normalizeStringArray(data.features),
    hasChromeStore: toBoolean(data.hasChromeStore, Boolean(chromeUrl)),
    users: cleanText(data.users || data.userCount || data.installs),
  });
}

export function isDisplayableExtension(data = {}) {
  return Boolean(cleanText(data.slug || data.id) && cleanText(data.name));
}

export function normalizeAcademy(data = {}, fallbackId = "") {
  const baseId = cleanText(fallbackId || data.id);
  const name = cleanText(data.name || data.title || baseId, "Learning Platform");

  return compactFirestoreData({
    ...data,
    id: cleanText(data.id || baseId || slugifyContent(name, "academy")),
    name,
    category: cleanText(data.category, DEFAULT_ACADEMY_CATEGORY),
    subCategory: cleanText(data.subCategory || data.subcategory || data.level, "Featured"),
    price: normalizeNumber(data.price, 0, { min: 0 }),
    description: cleanText(
      data.description || data.summary,
      "Discover courses, mentors, and practical learning paths.",
    ),
    rating: normalizeNumber(data.rating, 0, { min: 0, max: 5 }),
    features: normalizeStringArray(data.features),
    image: normalizeAssetUrl(data.image || data.logo || data.imageUrl),
    academyUrl: normalizeHttpUrl(data.academyUrl || data.url || data.website),
  });
}

export function isDisplayableAcademy(data = {}) {
  return Boolean(cleanText(data.id) && cleanText(data.name));
}

export function normalizeTrendingVideo(data = {}, fallbackId = "") {
  const baseId = cleanText(fallbackId || data.firestoreId || data.id);
  const title = cleanText(data.name || data.title || baseId, "AltFTool Video");

  return compactFirestoreData({
    ...data,
    id: cleanText(data.id || baseId),
    firestoreId: cleanText(data.firestoreId || baseId),
    name: title,
    title,
    category: cleanText(data.category, DEFAULT_VIDEO_CATEGORY),
    subCategory: cleanText(data.subCategory || data.subcategory),
    description: cleanText(data.description || data.desc),
    rating: normalizeNumber(data.rating, 0, { min: 0, max: 5 }),
    thumbnail: normalizeAssetUrl(data.thumbnail || data.image || data.imageUrl),
    videoUrl: normalizeHttpUrl(data.videoUrl || data.url || data.link),
    channelName: cleanText(data.channelName || data.channelTitle, "AltFTool"),
    duration: cleanText(data.duration || data.time),
    type: normalizeVideoType(data.type),
    viewCount: normalizeNumber(data.viewCount || data.views, 0, { min: 0 }),
    likeCount: normalizeNumber(data.likeCount || data.likes, 0, { min: 0 }),
  });
}

export function isDisplayableTrendingVideo(data = {}) {
  return Boolean(cleanText(data.firestoreId || data.id) && cleanText(data.name) && cleanText(data.videoUrl));
}
