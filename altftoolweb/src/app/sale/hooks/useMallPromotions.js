"use client";

import { useCallback, useRef, useState } from "react";

const DEBOUNCE_MS = 300;
// Module-level cache mirrors useNearbySearch's pattern — survives remounts
// within the same page session, avoiding a re-scrape when a user re-opens
// a mall they already viewed.
const promotionsCache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Fetch real, currently-live promotions/offers/events for a mall from its
 * own official website (GET /api/malls/events) — debounced, cached, and
 * streamed: each promotion page's results appear as soon as THAT page
 * finishes scraping, rather than waiting for every page to complete.
 *
 * @returns {{
 *   status: "idle" | "loading" | "ok" | "no_website" | "no_promotions" | "error",
 *   events: Array<object>,
 *   message: string | null,
 *   fetchFor: (mall: { website: string|null, name: string }) => void,
 *   reset: () => void,
 * }}
 */
export function useMallPromotions() {
  const [status, setStatus] = useState("idle");
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState(null);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const latestRequestIdRef = useRef(0);

  const runFetch = useCallback(async (mall) => {
    if (!mall?.website) {
      setStatus("no_website");
      setEvents([]);
      setMessage(null);
      return;
    }

    const cacheKey = mall.website;
    const cached = promotionsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setStatus(cached.data.status);
      setEvents(cached.data.events || []);
      setMessage(cached.data.message || null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++latestRequestIdRef.current;

    setStatus("loading");
    setEvents([]);
    setMessage(null);

    const isCurrent = () => requestId === latestRequestIdRef.current;
    let accumulatedEvents = [];
    let finalStatus = "no_promotions";
    let finalMessage = null;

    try {
      const params = new URLSearchParams({ website: mall.website, name: mall.name || "" });
      const response = await fetch(`/api/malls/events?${params.toString()}`, { signal: controller.signal });

      if (!response.ok || !response.body) {
        if (isCurrent()) {
          setStatus("error");
          setMessage("Couldn't load promotions right now. Please try again.");
        }
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!isCurrent()) return; // superseded by a newer selection

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep the last, possibly-incomplete line for next read

        for (const line of lines) {
          if (!line.trim()) continue;
          let chunk;
          try {
            chunk = JSON.parse(line);
          } catch {
            continue;
          }

          if (chunk.events?.length) {
            accumulatedEvents = accumulatedEvents.concat(chunk.events);
            // Render this page's results the moment they arrive — don't
            // wait for the remaining, slower pages.
            setStatus("ok");
            setEvents([...accumulatedEvents]);
          }

          if (chunk.done) {
            finalStatus = accumulatedEvents.length > 0 ? "ok" : chunk.status;
            finalMessage = chunk.message || null;
          }
        }
      }

      if (!isCurrent()) return;
      setStatus(finalStatus);
      setMessage(finalMessage);
      promotionsCache.set(cacheKey, {
        data: { status: finalStatus, events: accumulatedEvents, message: finalMessage },
        timestamp: Date.now(),
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      if (!isCurrent()) return;
      setStatus(accumulatedEvents.length > 0 ? "ok" : "error");
      setMessage(accumulatedEvents.length > 0 ? null : "Couldn't load promotions right now. Please try again.");
    }
  }, []);

  const fetchFor = useCallback(
    (mall) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runFetch(mall), DEBOUNCE_MS);
    },
    [runFetch],
  );

  const reset = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    setStatus("idle");
    setEvents([]);
    setMessage(null);
  }, []);

  return { status, events, message, fetchFor, reset };
}
