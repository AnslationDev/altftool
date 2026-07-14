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

// The SEO Engine is mounted per-project at /<project>/seo/... — derive the
// active project from the URL so every control-plane call is scoped to it. The
// server re-validates this against the caller's RBAC access (an admin can never
// reach another project's SEO data), so a missing/unknown segment is always safe.
function currentSeoProjectId() {
  if (typeof window === "undefined") return "altftool";
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  return seg || "altftool";
}

// Append the active project to a request URL (works for GET and POST alike).
function withProject(path) {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}project=${encodeURIComponent(currentSeoProjectId())}`;
}

export async function fetchSeoConfig() {
  const res = await fetch(withProject("/api/seo/config"), {
    headers: await authHeaders(),
    cache: "no-store",
  });
  const data = await readApiJson(res, "Failed to load SEO config");
  return data.config;
}

export async function saveSeoConfig(config, { force = false, paths = [] } = {}) {
  const res = await fetch(withProject("/api/seo/config"), {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify({ config, force, paths }),
  });
  return readApiJson(res, "Failed to save SEO config");
}

export async function runHealthCheck(routes = []) {
  const res = await fetch(withProject("/api/seo/health"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ routes }),
  });
  return readApiJson(res, "Failed to run SEO health check");
}

export async function fetchHealthHistory() {
  const res = await fetch(withProject("/api/seo/health"), {
    headers: await authHeaders(),
    cache: "no-store",
  });
  const data = await readApiJson(res, "Failed to load health history");
  return data.history || [];
}

export async function getRecommendation({ path, title, content, url } = {}) {
  const res = await fetch(withProject("/api/seo/recommendations"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ path, title, content, url }),
  });
  return readApiJson(res, "Failed to get SEO recommendation");
}

export async function runPageSearch(q, type = "all") {
  const params = new URLSearchParams({ q: q || "", type: type || "all" });
  const res = await fetch(withProject(`/api/seo/search?${params.toString()}`), {
    headers: await authHeaders(),
    cache: "no-store",
  });
  return readApiJson(res, "Search failed");
}

export async function fetchRegistrySummary(refresh = false) {
  const res = await fetch(withProject(`/api/seo/registry${refresh ? "?refresh=1" : ""}`), {
    headers: await authHeaders(),
    cache: "no-store",
  });
  return readApiJson(res, "Failed to load dashboard");
}

// ---- Broken URL / link checker ----
export async function checkLinks(urls = []) {
  const res = await fetch(withProject("/api/seo/links/check"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ urls }),
  });
  return readApiJson(res, "Link check failed");
}

// ---- Google Search Console ----
export async function gscGet(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params });
  const res = await fetch(withProject(`/api/seo/gsc?${qs.toString()}`), { headers: await authHeaders(), cache: "no-store" });
  return readApiJson(res, "Search Console request failed");
}

export async function gscPost(body) {
  const res = await fetch(withProject("/api/seo/gsc"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  return readApiJson(res, "Search Console request failed");
}

// ---- AI page-entry generation (Pages editor "Generate with AI") ----
// Returns a full proposed entry (title/description/keywords/og/twitter/schema)
// built from the page registry + live Search Console queries. Nothing is
// persisted server-side — the caller fills the form for admin review.
export async function generateSeoPageEntry(path) {
  const res = await fetch(withProject("/api/seo/generate"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ preview: true, path }),
  });
  const data = await readApiJson(res, "AI generation failed");
  return data.preview;
}
