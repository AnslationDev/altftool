"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Core Web Vitals RUM reporter (public site).
 *
 * Inert by default: only beacons when NEXT_PUBLIC_ALTFT_WEB_VITALS is enabled,
 * so there is zero overhead unless real-user monitoring is switched on. Uses
 * sendBeacon (falls back to keepalive fetch) so it never blocks navigation.
 */
const ENABLED = ["1", "true", "on"].includes(
  String(process.env.NEXT_PUBLIC_ALTFT_WEB_VITALS || "").toLowerCase(),
);

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!ENABLED || typeof window === "undefined") return;
    try {
      const body = JSON.stringify({
        name: metric.name,
        value: Math.round(metric.value * 1000) / 1000,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType || "",
        path: window.location.pathname,
        ts: Date.now(),
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/vitals", body);
      } else {
        fetch("/api/vitals", {
          method: "POST",
          body,
          keepalive: true,
          headers: { "Content-Type": "application/json" },
        }).catch(() => {});
      }
    } catch {
      /* never let telemetry break the page */
    }
  });

  return null;
}
