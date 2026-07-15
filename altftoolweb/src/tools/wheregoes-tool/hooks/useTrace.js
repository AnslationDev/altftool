"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { checkUrl } from "../services/api";
import { getDemoResult, normalizeResult } from "../utils/trace";

/**
 * Visible pipeline stages while the backend follows the redirect chain.
 * `after` = elapsed ms at which the stage becomes "current".
 */
export const TRACE_STAGES = [
  { id: "validate", label: "Validating URL", after: 0 },
  { id: "dns", label: "Resolving DNS", after: 500 },
  { id: "follow", label: "Following redirects", after: 1800 },
  { id: "headers", label: "Reading response headers", after: 4500 },
  { id: "report", label: "Building your report", after: 9000 },
];

function demoParam() {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get("demo");
  } catch {
    return null;
  }
}

function normalizeInput(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function isTraceableUrl(raw) {
  const url = normalizeInput(raw);
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return Boolean(parsed.hostname) && parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

export default function useTrace() {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [tracedUrl, setTracedUrl] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const runId = useRef(0);
  const tickTimer = useRef(null);
  const startedAt = useRef(0);

  const stopTicker = useCallback(() => {
    window.clearInterval(tickTimer.current);
    tickTimer.current = null;
  }, []);

  useEffect(() => {
    const demo = demoParam();
    if (demo === "1") {
      setResult(getDemoResult());
      setStatus("done");
    } else if (demo === "loading") {
      // Frozen loading state for previews/screenshots.
      startedAt.current = performance.now() - 5200;
      setTracedUrl("https://example.com");
      setStatus("loading");
      tickTimer.current = window.setInterval(() => {
        setElapsedMs(performance.now() - startedAt.current);
      }, 100);
    }
    return () => window.clearInterval(tickTimer.current);
  }, []);

  const trace = useCallback(
    async (rawUrl) => {
      const url = normalizeInput(rawUrl);
      if (!url) return;

      if (!isTraceableUrl(url)) {
        setError("That doesn't look like a valid URL. Try something like https://example.com");
        setStatus("error");
        return;
      }

      const id = ++runId.current;
      setError("");
      setTracedUrl(url);
      setStatus("loading");
      setElapsedMs(0);

      startedAt.current = performance.now();
      stopTicker();
      tickTimer.current = window.setInterval(() => {
        setElapsedMs(performance.now() - startedAt.current);
      }, 100);

      const { data, error: apiError } = await checkUrl(url);

      if (runId.current !== id) return;
      stopTicker();

      if (apiError || !data?.chain?.length) {
        setError(apiError || "The tracer returned no data for that URL. Please try again.");
        setStatus("error");
        return;
      }

      setResult(normalizeResult(data, url));
      setStatus("done");
    },
    [stopTicker],
  );

  const cancel = useCallback(() => {
    runId.current += 1;
    stopTicker();
    setStatus("idle");
    setElapsedMs(0);
  }, [stopTicker]);

  const reset = useCallback(() => {
    runId.current += 1;
    stopTicker();
    setStatus("idle");
    setResult(null);
    setError("");
    setElapsedMs(0);
  }, [stopTicker]);

  return { status, result, error, tracedUrl, elapsedMs, trace, cancel, reset };
}
