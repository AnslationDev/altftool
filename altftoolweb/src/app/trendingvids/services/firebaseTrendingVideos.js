import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";
import { collection, getDocs } from "firebase/firestore";
import {
  isDisplayableTrendingVideo,
  normalizeTrendingVideo,
} from "@altftool/core/firebaseContent";
import { ALTFT_TRENDING_VIDEOS_COLLECTION_PATH } from "@altftool/core/firebasePaths";

const TRENDING_VIDEOS_COLLECTION = collection(
  db,
  ...ALTFT_TRENDING_VIDEOS_COLLECTION_PATH,
);

const CATEGORY_ALIASES = {
  all: "All",
  ai: "Artificial Intelligence",
  "artificial intelligence": "Artificial Intelligence",
  "ai tools": "Artificial Intelligence",
  productivity: "Productivity",
  automation: "Automation",
  business: "Business Strategy",
  "business strategy": "Business Strategy",
  education: "Education",
  technology: "Technology",
  "browser extension": "Technology",
};

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function toDateObject(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = toDateObject(value);
  if (!date) return typeof value === "string" ? value : "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getSortDate(value) {
  return toDateObject(value)?.getTime() || 0;
}

function getPopularityScore(item) {
  return Number(
    item.viewCount ??
      item.views ??
      item.likeCount ??
      item.likes ??
      item.rating ??
      0,
  );
}

export function extractYouTubeId(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace("www.", "");

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v");
      }

      if (
        parsedUrl.pathname.startsWith("/embed/") ||
        parsedUrl.pathname.startsWith("/shorts/")
      ) {
        return parsedUrl.pathname.split("/")[2] || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeCategoryLabel(category) {
  const normalized = normalizeText(category);
  return CATEGORY_ALIASES[normalized] || String(category || "").trim() || "Uncategorized";
}

export function matchesExploreCategory(item, selectedCategory) {
  if (!selectedCategory || selectedCategory === "All") return true;
  return normalizeCategoryLabel(item.category) === selectedCategory;
}

function matchesSearch(item, query) {
  const q = normalizeText(query);
  if (!q) return true;

  return [item.name, item.description, item.category, item.channelName].some(
    (value) => normalizeText(value).includes(q),
  );
}

function mapFirebaseDoc(doc) {
  return normalizeTrendingVideo(doc.data(), doc.id);
}

function sortItems(items, sortBy = "Latest") {
  return [...items].sort((a, b) => {
    if (sortBy === "Popular") {
      return getPopularityScore(b) - getPopularityScore(a);
    }

    return getSortDate(b.date) - getSortDate(a.date);
  });
}

function mapVideoCard(item) {
  const youtubeId = extractYouTubeId(item.videoUrl);

const fallbackThumbnail = youtubeId
  ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
  : item.thumbnail || "";

  return {
    id: item.firestoreId,
    firestoreId: item.firestoreId,
   videoId: youtubeId,           // only if youtube
  videoUrl: item.videoUrl || "",

  source: youtubeId ? "youtube" : "file",
    image: item.thumbnail || fallbackThumbnail,
    thumbnail: item.thumbnail || fallbackThumbnail,
    title: item.name || "",
    desc: item.description || "",
    description: item.description || "",
    category: normalizeCategoryLabel(item.category),
    time: item.duration || "",
    duration: item.duration || "",
    date: formatDate(item.date),
    channelName: item.channelName || "",
    type: item.type,
  };
}

function mapShortCard(item) {
  const videoId = extractYouTubeId(item.videoUrl) || item.firestoreId;
  const fallbackThumbnail = extractYouTubeId(item.videoUrl)
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "";

  return {
    id: videoId,
    firestoreId: item.firestoreId,
    videoId,
    videoUrl: item.videoUrl || "",
    thumbnail: item.thumbnail || fallbackThumbnail,
    image: item.thumbnail || fallbackThumbnail,
    title: item.name || "",
    category: normalizeCategoryLabel(item.category),
    channelTitle: item.channelName || "AltFTool",
    channelDescription: item.description || "",
    description: item.description || "",
    likeCount: getPopularityScore(item),
    type: item.type,
  };
}

export async function getTrendingVideosFromFirebase() {
  try {
    return await getCachedFirebaseRead("trending-videos:list", async () => {
      const snapshot = await getDocs(TRENDING_VIDEOS_COLLECTION);
      return snapshot.docs.map(mapFirebaseDoc).filter(isDisplayableTrendingVideo);
    }, 120000);
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    return [];
  }
}

export async function getFirebaseVideoPage({
  category = "All",
  sortBy = "Latest",
  page = 1,
  pageSize = 6,
} = {}) {
  const items = await getTrendingVideosFromFirebase();
  const filtered = sortItems(
    items.filter(
      (item) => item.type === "video" && matchesExploreCategory(item, category),
    ),
    sortBy,
  );

  return {
    videos: filtered.slice(0, page * pageSize).map(mapVideoCard),
    total: filtered.length,
  };
}

export async function getFirebaseShortsPage({
  page = 1,
  pageSize = 8,
} = {}) {
  const items = await getTrendingVideosFromFirebase();
  const filtered = sortItems(
    items.filter((item) => item.type === "shorts"),
    "Latest",
  );

  return {
    videos: filtered.slice(0, page * pageSize).map(mapShortCard),
    total: filtered.length,
  };
}

export async function searchFirebaseTrendingVideos(query, limit = 6) {
  const items = await getTrendingVideosFromFirebase();

  return sortItems(
    items.filter((item) => item.type === "video" && matchesSearch(item, query)),
    "Latest",
  )
    .slice(0, limit)
    .map(mapVideoCard);
}

export async function getFirebaseVideoCategories(limit) {
  const items = await getTrendingVideosFromFirebase();
  const uniqueCategories = [];
  const seen = new Set();

  for (const item of items) {
    if (item.type !== "video") continue;

    const label = normalizeCategoryLabel(item.category);
    const key = normalizeText(label);
    if (!key || seen.has(key) || label === "Uncategorized") continue;

    seen.add(key);
    uniqueCategories.push(label);
  }

  uniqueCategories.sort((a, b) => a.localeCompare(b));

  return typeof limit === "number"
    ? uniqueCategories.slice(0, limit)
    : uniqueCategories;
}
