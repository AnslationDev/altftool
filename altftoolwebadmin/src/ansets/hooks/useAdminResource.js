"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAdminIdToken } from "@/lib/adminIdToken";

/** Timeout for a single admin API call. Without one, a hung server spins forever. */
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Translate a failed response into something an operator can act on.
 * Raw Firestore/Firebase strings (index URLs, collection paths, stack text)
 * must never reach the screen.
 */
function describe(status) {
  if (status === 401) return "Your session isn’t valid any more. Sign out and sign back in.";
  if (status === 403) return "You don’t have permission to view this.";
  if (status === 404) return "That resource no longer exists.";
  if (status >= 500) return "The server had a problem. This is usually temporary.";
  return "That request couldn’t be completed.";
}

/**
 * Fetch an admin API resource with the loading / error / retry ladder every
 * screen was re-deriving by hand — usually incompletely (no timeout, no retry
 * affordance, failures collapsing into an empty state).
 *
 * Always sends the token from getAdminIdToken(), so screens work under both a
 * real Firebase session and the local-admin dev session.
 *
 * @param {string|null} path   API path, e.g. "/api/admin/list". Pass null to skip.
 * @param {object}      [opts]
 * @param {Function}    [opts.select]   Map the parsed JSON into the shape you want.
 * @param {any}         [opts.initial]  Value before the first successful load.
 * @param {Array}       [opts.deps]     Re-fetch when these change.
 * @returns {{data:any, loading:boolean, error:string|null, refresh:Function, refreshing:boolean}}
 */
export function useAdminResource(path, { select, initial = null, deps = [] } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(Boolean(path));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Guards a late response from overwriting newer state after unmount or after
  // a newer request has already been issued.
  const generationRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (isRefresh) => {
      if (!path) return;
      const generation = ++generationRef.current;
      const stale = () => !mountedRef.current || generation !== generationRef.current;

      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

      try {
        const token = await getAdminIdToken();
        const res = await fetch(path, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (stale()) return;

        if (!res.ok) {
          setError(describe(res.status));
          return;
        }

        const json = await res.json();
        if (stale()) return;
        setData(select ? select(json) : json);
      } catch (err) {
        if (stale()) return;
        setError(
          err?.name === "AbortError"
            ? "That took too long to load. Try again."
            : "Couldn’t reach the server. Check your connection and try again.",
        );
      } finally {
        clearTimeout(timer);
        if (!stale()) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // `select` is intentionally excluded: callers usually pass an inline arrow,
    // which would change identity every render and re-fetch forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path],
  );

  useEffect(() => {
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, reloadKey, ...deps]);

  const refresh = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  return { data, loading, refreshing, error, refresh };
}

export default useAdminResource;
