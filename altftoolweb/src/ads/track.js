"use client";

// Lightweight, default-inert ad performance tracking.
//
// Impressions fire once per (placement, ad, path) after the slot has been
// ≥50% visible for 1s (IAB-style viewability). Clicks fire on activation.
// Events are posted via sendBeacon to /api/ad-events, which — following the
// same pattern as /api/vitals — accepts and drops them unless a sink is
// configured. No behaviour change for existing pages that don't opt in.

import { useEffect, useRef } from "react";

const seenImpressions = new Set();

export function trackAdEvent(type, { placement, adId, toolSlug } = {}) {
  if (typeof window === "undefined" || !placement) return;
  try {
    const payload = JSON.stringify({
      type,
      placement,
      adId: adId ?? null,
      toolSlug: toolSlug ?? null,
      path: window.location.pathname,
      ts: Date.now(),
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/ad-events", payload);
    } else {
      fetch("/api/ad-events", { method: "POST", body: payload, keepalive: true }).catch(() => {});
    }
  } catch {
    /* tracking must never break the page */
  }
}

/**
 * Returns a ref to attach to the ad slot's root element. Records a single
 * viewable impression per placement+ad+path.
 */
export function useAdImpression({ placement, adId, toolSlug, enabled = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled || !placement) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    const key = `${placement}:${adId ?? "unknown"}:${window.location.pathname}`;
    if (seenImpressions.has(key)) return undefined;

    const record = () => {
      if (seenImpressions.has(key)) return;
      seenImpressions.add(key);
      trackAdEvent("impression", { placement, adId, toolSlug });
    };

    if (!("IntersectionObserver" in window)) {
      record();
      return undefined;
    }

    let timer = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (timer === null) {
            timer = window.setTimeout(() => {
              record();
              observer.disconnect();
            }, 1000);
          }
        } else if (timer !== null) {
          window.clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, 0.5, 1] },
    );

    observer.observe(node);
    return () => {
      if (timer !== null) window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [enabled, placement, adId, toolSlug]);

  return ref;
}
