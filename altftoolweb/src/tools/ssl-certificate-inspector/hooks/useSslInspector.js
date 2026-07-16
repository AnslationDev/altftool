"use client";

import { useMemo, useRef, useState } from "react";

const SAMPLE_DOMAINS = "google.com\ngithub.com\nopenai.com";

function parseDomains(value) {
  return String(value || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function useSslInspector() {
  const activeRequestRef = useRef(0);
  const abortRef = useRef(null);
  const [domainInput, setDomainInput] = useState("github.com");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState("");

  const domains = useMemo(() => parseDomains(domainInput), [domainInput]);
  const primaryResult = results[0] || null;
  const hasResults = results.length > 0;

  const inspect = async () => {
    const nextDomains = parseDomains(domainInput);
    if (!nextDomains.length) {
      setError("Enter at least one public domain or URL.");
      return;
    }

    abortRef.current?.abort();
    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tools/ssl-certificate-inspector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domains: nextDomains }),
        signal: controller.signal,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "SSL lookup failed.");
      }

      if (activeRequestRef.current !== requestId) return;
      setResults(payload.results || []);
      setLastCheckedAt(payload.inspectedAt || new Date().toISOString());
    } catch (err) {
      if (err.name === "AbortError" || activeRequestRef.current !== requestId) return;
      setError(err.message || "Unable to inspect SSL certificate.");
    } finally {
      if (activeRequestRef.current === requestId) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  };

  const loadSamples = () => {
    setDomainInput(SAMPLE_DOMAINS);
    setError("");
  };

  return {
    copied,
    domains,
    domainInput,
    error,
    hasResults,
    lastCheckedAt,
    loading,
    primaryResult,
    results,
    inspect,
    loadSamples,
    setCopied,
    setDomainInput,
  };
}
