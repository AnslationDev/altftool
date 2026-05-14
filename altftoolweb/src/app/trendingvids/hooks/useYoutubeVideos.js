import { useEffect, useState } from "react";
import {
  extractYouTubeId,
  getFirebaseVideoPage,
  matchesExploreCategory,
} from "../services/firebaseTrendingVideos";
import { videos as fallbackVideos } from "../data/content";

const PAGE_SIZE = 6;

function sortFallbackVideos(items, sortBy) {
  if (sortBy === "Popular") return items;

  return [...items].sort((a, b) => {
    const aTime = Date.parse(a.date || "") || 0;
    const bTime = Date.parse(b.date || "") || 0;
    return bTime - aTime;
  });
}

function mapFallbackVideo(item) {
  const videoId = extractYouTubeId(item.videoUrl);

  return {
    id: item.id,
    firestoreId: item.id,
    videoId,
    videoUrl: item.videoUrl || "",
    source: videoId ? "youtube" : "file",
    image: item.thumbnail || "",
    thumbnail: item.thumbnail || "",
    title: item.title || "",
    desc: item.description || "",
    description: item.description || "",
    category: item.category || "Curated",
    time: item.duration || "",
    duration: item.duration || "",
    date: item.date || "Curated",
    channelName: "AltFTool",
  };
}

function getFallbackPage({ category = "All", sortBy = "Latest", page = 1 } = {}) {
  const filtered = sortFallbackVideos(
    fallbackVideos.filter((item) => matchesExploreCategory(item, category)),
    sortBy,
  );

  return {
    videos: filtered.slice(0, page * PAGE_SIZE).map(mapFallbackVideo),
    total: filtered.length,
  };
}

export const useYoutubeVideos = (query, tab, sortBy) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("firebase");

  const loadMore = async () => {
    if (loadingMore || videos.length >= total) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const data = source === "fallback"
        ? getFallbackPage({ category: query, sortBy, page: nextPage })
        : await getFirebaseVideoPage({
            category: query,
            sortBy,
            page: nextPage,
          });

      setVideos(data.videos || []);
      setTotal(data.total || 0);
      setPage(nextPage);
    } catch (error) {
      console.error("loadMore failed:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      setPage(1);
      setError(null);
      setSource("firebase");

      try {
        const data = await getFirebaseVideoPage({
          category: query,
          sortBy,
        });

        if (data.videos?.length) {
          setVideos(data.videos || []);
          setTotal(data.total || 0);
          return;
        }

        const fallbackData = getFallbackPage({ category: query, sortBy });
        setVideos(fallbackData.videos);
        setTotal(fallbackData.total);
        setSource("fallback");
      } catch (error) {
        console.error("Failed to fetch firebase videos:", error);
        const fallbackData = getFallbackPage({ category: query, sortBy });
        setVideos(fallbackData.videos);
        setTotal(fallbackData.total);
        setError(error);
        setSource("fallback");
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [query, tab, sortBy]);

  const hasMore = videos.length < total;

  return {
    videos,
    loading,
    loadingMore,
    error,
    source,
    loadMore,
    hasMore,
  };
};
