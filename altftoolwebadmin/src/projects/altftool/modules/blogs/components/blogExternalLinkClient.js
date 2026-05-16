"use client";

import { auth } from "@/lib/firebase";
import { createLocalAdminUser, hasLocalAdminSession } from "@/lib/localAdminSession";

const MAX_CLIENT_URLS = 20;

async function getAdminToken() {
  if (hasLocalAdminSession()) {
    return createLocalAdminUser().getIdToken();
  }

  return auth.currentUser?.getIdToken?.(true) || "";
}

export function summarizeExternalLinkResults(results = []) {
  return results.reduce(
    (summary, result) => {
      const state = result?.state || "warning";
      summary[state] = (summary[state] || 0) + 1;
      summary.total += 1;
      if (state !== "ok") summary.issueResults.push(result);
      return summary;
    },
    { blocked: 0, broken: 0, issueResults: [], ok: 0, total: 0, warning: 0 },
  );
}

export async function checkExternalLinks(urls = []) {
  const uniqueUrls = [...new Set(urls.map((url) => String(url || "").trim()).filter(Boolean))].slice(0, MAX_CLIENT_URLS);
  if (!uniqueUrls.length) {
    return {
      checkedAt: new Date().toISOString(),
      maxUrls: MAX_CLIENT_URLS,
      results: [],
      summary: summarizeExternalLinkResults([]),
    };
  }

  const token = await getAdminToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch("/api/blogs/link-check", {
    body: JSON.stringify({ urls: uniqueUrls }),
    headers,
    method: "POST",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || "External link check failed.");
  }

  return {
    ...payload,
    summary: payload.summary || summarizeExternalLinkResults(payload.results || []),
  };
}
