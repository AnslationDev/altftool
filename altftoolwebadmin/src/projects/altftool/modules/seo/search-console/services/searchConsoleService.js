// Admin client service for the OAuth-based Search Console SEO Center.
// All calls are Bearer-authenticated against the secure /api/seo/gsc/* routes.

import { auth } from "@/lib/firebase";
import { readApiJson } from "@/lib/apiClient";

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

/** Begin OAuth — returns { configured, authUrl }. */
export async function startConnect() {
  const res = await fetch("/api/seo/gsc/connect", { method: "POST", headers: await authHeaders() });
  return readApiJson(res, "Could not start Google connection");
}

export async function fetchConnection() {
  const res = await fetch("/api/seo/gsc/oauth?action=connection", {
    headers: await authHeaders(),
    cache: "no-store",
  });
  return readApiJson(res, "Could not load connection status");
}

export async function fetchProperties() {
  const res = await fetch("/api/seo/gsc/oauth?action=properties", {
    headers: await authHeaders(),
    cache: "no-store",
  });
  return readApiJson(res, "Could not load properties");
}

export async function selectProperty(siteUrl) {
  const res = await fetch("/api/seo/gsc/oauth", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "select-property", siteUrl }),
  });
  return readApiJson(res, "Could not select property");
}

export async function disconnect() {
  const res = await fetch("/api/seo/gsc/oauth", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "disconnect" }),
  });
  return readApiJson(res, "Could not disconnect");
}

export async function fetchReport({ dimension = "query", days = 28 } = {}) {
  const params = new URLSearchParams({ dimension, days: String(days) });
  const res = await fetch(`/api/seo/gsc/report?${params.toString()}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  return readApiJson(res, "Could not load Search Analytics");
}

export async function inspectUrl(url) {
  const res = await fetch("/api/seo/gsc/inspect", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ url }),
  });
  return readApiJson(res, "URL inspection failed");
}

export async function requestIndexing(url) {
  const res = await fetch("/api/seo/gsc/index-request", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ url }),
  });
  return readApiJson(res, "Index request failed");
}

export async function fetchSitemaps() {
  const res = await fetch("/api/seo/gsc/sitemaps", { headers: await authHeaders(), cache: "no-store" });
  return readApiJson(res, "Could not load sitemaps");
}

export async function submitSitemap(feedpath) {
  const res = await fetch("/api/seo/gsc/sitemaps", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(feedpath ? { feedpath } : {}),
  });
  return readApiJson(res, "Could not submit sitemap");
}
