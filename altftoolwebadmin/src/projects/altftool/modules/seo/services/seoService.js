// ALTF Engine — admin client service for the central SEO config.
// All writes go through the authenticated /api/seo/config route (Bearer token).

import { auth } from "@/lib/firebase";
import { readApiJson } from "@/lib/apiClient";

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function fetchSeoConfig() {
  const res = await fetch("/api/seo/config", {
    headers: await authHeaders(),
    cache: "no-store",
  });
  const data = await readApiJson(res, "Failed to load SEO config");
  return data.config;
}

export async function saveSeoConfig(config, { force = false } = {}) {
  const res = await fetch("/api/seo/config", {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify({ config, force }),
  });
  return readApiJson(res, "Failed to save SEO config");
}

export async function runHealthCheck(routes = []) {
  const res = await fetch("/api/seo/health", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ routes }),
  });
  return readApiJson(res, "Failed to run SEO health check");
}

export async function fetchHealthHistory() {
  const res = await fetch("/api/seo/health", {
    headers: await authHeaders(),
    cache: "no-store",
  });
  const data = await readApiJson(res, "Failed to load health history");
  return data.history || [];
}

export async function getRecommendation({ path, title, content, url } = {}) {
  const res = await fetch("/api/seo/recommendations", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ path, title, content, url }),
  });
  return readApiJson(res, "Failed to get SEO recommendation");
}

export async function runPageSearch(q, type = "all") {
  const params = new URLSearchParams({ q: q || "", type: type || "all" });
  const res = await fetch(`/api/seo/search?${params.toString()}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  return readApiJson(res, "Search failed");
}

export async function fetchRegistrySummary(refresh = false) {
  const res = await fetch(`/api/seo/registry${refresh ? "?refresh=1" : ""}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  return readApiJson(res, "Failed to load dashboard");
}

// ---- Google Search Console ----
export async function gscGet(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params });
  const res = await fetch(`/api/seo/gsc?${qs.toString()}`, { headers: await authHeaders(), cache: "no-store" });
  return readApiJson(res, "Search Console request failed");
}

export async function gscPost(body) {
  const res = await fetch("/api/seo/gsc", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  return readApiJson(res, "Search Console request failed");
}
