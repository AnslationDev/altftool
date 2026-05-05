import { useEffect, useState } from "react";
import { getFirebaseVideoPage } from "../services/firebaseTrendingVideos";

export const useYoutubeVideos = (query, tab, sortBy) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadMore = async () => {
    if (loadingMore || videos.length >= total) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const data = await getFirebaseVideoPage({
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

      try {
        const data = await getFirebaseVideoPage({
          category: query,
          sortBy,
        });

        setVideos(data.videos || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Failed to fetch firebase videos:", error);
        setVideos([]);
        setTotal(0);
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
    loadMore,
    hasMore,
  };
};
