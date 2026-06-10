"use client";

import { auth } from "@/lib/firebase";
import { createLocalAdminUser, hasLocalAdminSession } from "@/lib/localAdminSession";

const MAX_RUNTIME_QA_SLUGS = 8;

async function getAdminToken() {
  if (hasLocalAdminSession()) {
    return createLocalAdminUser().getIdToken();
  }

  return auth.currentUser?.getIdToken?.(true) || "";
}

export function summarizeBlogRuntimeQaResults(results = []) {
  return results.reduce(
    (summary, result) => {
      const state = result?.state || "warning";
      summary[state] = (summary[state] || 0) + 1;
      summary.issueCount += result?.issueCount || 0;
      summary.total += 1;
      if (state !== "ok") summary.issueResults.push(result);
      return summary;
    },
    { broken: 0, issueCount: 0, issueResults: [], ok: 0, total: 0, warning: 0 },
  );
}

function normalizeSlug(value = "") {
  return String(value || "")
    .split(/[?#]/)[0]
    .replace(/^https?:\/\/[^/]+\/blogs\//i, "")
    .replace(/^\/?blogs\//i, "")
    .replace(/^\/+|\/+$/g, "")
    .trim();
}

export async function runBlogRuntimeQa({ baseUrl = "", slugs = [] } = {}) {
  const uniqueSlugs = [...new Set(slugs.map(normalizeSlug).filter(Boolean))].slice(0, MAX_RUNTIME_QA_SLUGS);

  if (!uniqueSlugs.length) {
    return {
      checkedAt: new Date().toISOString(),
      maxSlugs: MAX_RUNTIME_QA_SLUGS,
      results: [],
      summary: summarizeBlogRuntimeQaResults([]),
    };
  }

  const token = await getAdminToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch("/api/blogs/runtime-qa", {
    body: JSON.stringify({ baseUrl, slugs: uniqueSlugs }),
    headers,
    method: "POST",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || "Blog runtime QA failed.");
  }

  return {
    ...payload,
    summary: payload.summary || summarizeBlogRuntimeQaResults(payload.results || []),
  };
}
