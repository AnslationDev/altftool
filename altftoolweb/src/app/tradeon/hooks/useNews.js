// src/app/tradeon/hooks/useNews.js
// Client hook for the aggregated news feed. Fetches /tradeon/api/news and
// auto-refreshes on an interval so the UI always shows the latest articles.
"use client";

import { useEffect, useRef, useState } from "react";

export function useNews({ refreshMs = 180000 } = {}) {
  const [state, setState] = useState({ articles: [], updatedAt: null, loading: true, error: false });
  const timer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/tradeon/api/news")
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j) => {
          if (cancelled) return;
          setState({ articles: Array.isArray(j.articles) ? j.articles : [], updatedAt: j.updatedAt || null, loading: false, error: false });
        })
        .catch(() => { if (!cancelled) setState((s) => ({ ...s, loading: false, error: true })); });

    load();
    timer.current = setInterval(load, refreshMs);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; clearInterval(timer.current); window.removeEventListener("focus", onFocus); };
  }, [refreshMs]);

  return state;
}
