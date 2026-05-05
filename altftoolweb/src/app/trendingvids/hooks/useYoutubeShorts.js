import { useEffect, useState, useCallback } from "react";
import { getFirebaseShortsPage } from "../services/firebaseTrendingVideos";

export const useYoutubeShorts = (active) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadShorts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getFirebaseShortsPage({ page });

      if (!res.videos.length) {
        setHasMore(false);
      } else {
        setVideos(res.videos);
        setHasMore(res.videos.length < res.total);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    }

    setLoading(false);
  }, [loading, hasMore, page]);

  useEffect(() => {
    if (active && videos.length === 0) {
      const timer = window.setTimeout(() => {
        loadShorts();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [active, loadShorts, videos.length]);

  return {
    videos,
    loading,
    error,
    hasMore,
    loadMore: loadShorts,
  };
};
