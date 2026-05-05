import { useState, useEffect, useCallback, useRef } from "react";

const PAGE_SIZE = 10;

export function useNewsApi(type, sort, refreshKey) {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const controllerRef = useRef(null);
  const requestIdRef = useRef(0); // prevents stale updates

  const fetchPage = useCallback(async (pageNum, replace) => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    const requestId = ++requestIdRef.current;

    replace ? setLoading(true) : setLoadingMore(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type,
        page: String(pageNum),
        pageSize: String(PAGE_SIZE),
        sort,
      });

      const res = await fetch(`/news/api?${params}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();

      // ignore stale responses
      if (requestId !== requestIdRef.current) return;

      setArticles(prev => {
        const incoming = data.news || [];

        if (replace) return incoming;

        // dedupe by url (or id if you have)
        const existingUrls = new Set(prev.map(a => a.url));
        const filtered = incoming.filter(a => !existingUrls.has(a.url));

        return [...prev, ...filtered];
      });

      setTotal(data.totalResults ?? 0);
      setPage(pageNum);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message ?? "Something went wrong.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [type, sort]);

  useEffect(() => {
    fetchPage(1, true);

    return () => {
      controllerRef.current?.abort();
    };
  }, [type, sort, refreshKey, fetchPage]);

  const fetchNextPage = useCallback(() => {
    if (loading || loadingMore) return;
    if (articles.length >= totalResults) return;

    fetchPage(page + 1, false);
  }, [fetchPage, loading, loadingMore, articles.length, totalResults, page]);

  return {
    articles,
    loading,
    loadingMore,
    error,
    hasMore: articles.length < totalResults,
    fetchNextPage,
  };
}