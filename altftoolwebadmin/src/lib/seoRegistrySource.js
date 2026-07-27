// altftoolwebadmin/src/lib/seoRegistrySource.js
//
// Provides the page registry used by the SEO Dashboard, Search and Bulk tools.
// Primary source: the public web app's page inventory endpoint (richest, exact).
// Fallback: build the registry LOCALLY from data the admin already has
// (tool slugs, Firestore blogs, and existing SEO overrides) so these screens
// keep working even when the cross-app inventory env vars are not configured.

import { buildPageIndexEntry } from "@altftool/core/seo";
import { TOOL_SLUGS } from "@/config/toolSlugs.generated";
import { adminDb } from "@/lib/firebaseAdmin";
import { DEFAULT_SEO_PROJECT, resolveSeoProjectId } from "@/lib/seoProject";

const TTL_MS = Number(process.env.ALTFT_REGISTRY_TTL_MS || 120_000);
// Per-project cache so switching projects never serves another project's pages.
const caches = new Map();

function getCache(projectId) {
  if (!caches.has(projectId)) caches.set(projectId, { at: 0, entries: [] });
  return caches.get(projectId);
}

function inventoryUrl() {
  return (
    process.env.ALTFT_WEB_INVENTORY_URL ||
    (process.env.ALTFT_WEB_REVALIDATE_URL || "").replace(/\/api\/revalidate\/?$/, "/api/pages/inventory")
  );
}

function titleFromSlug(slug) {
  return String(slug || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// Fetch the public web app inventory (cross-app, secret-gated). Returns [] when
// not configured or on failure.
async function fetchWebInventory() {
  const url = inventoryUrl();
  const secret = process.env.ALTFT_REVALIDATE_SECRET;
  if (!url || !secret) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, {
      headers: { "x-inventory-secret": secret },
      cache: "no-store",
      signal: controller.signal,
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data?.entries)) return data.entries;
    }
  } catch {
    /* fall through to local build */
  } finally {
    clearTimeout(timeout);
  }
  return [];
}

// Build a registry from data the admin can read directly. No cross-app call.
async function buildLocalRegistry(projectId = DEFAULT_SEO_PROJECT) {
  const isAltftool = projectId === DEFAULT_SEO_PROJECT;
  const entries = [];
  const seen = new Set();
  const push = (input) => {
    const path = input.path;
    if (!path || seen.has(path)) return;
    seen.add(path);
    entries.push(buildPageIndexEntry(input));
  };

  // Existing per-page overrides (so any custom path is manageable).
  let overrideKeys = new Set();
  try {
    const snap = await adminDb.doc(`projects/${projectId}/seo/runtime`).get();
    const pages = snap.exists ? snap.data()?.pages : null;
    if (pages && typeof pages === "object") {
      for (const [path, entry] of Object.entries(pages)) {
        if (!path.startsWith("/")) continue;
        overrideKeys.add(path);
        push({
          path,
          pageType: "page",
          source: "override",
          title: entry?.title || titleFromSlug(path.split("/").pop()),
          description: entry?.description || "",
          noindex: entry?.noindex === true || entry?.robots?.index === false,
          hasOverride: true,
        });
      }
    }
  } catch {
    /* ignore — overrides are optional */
  }

  // Static hubs + the shared tool catalogue are altftool.com's site map; only
  // seed them for the altftool project. Other projects derive their registry
  // from their own overrides + blogs until a per-project inventory URL is set.
  if (isAltftool) {
    for (const [path, title] of [
      ["/", "AltFTool — Home"],
      ["/tools", "All Tools"],
      ["/blogs", "Blog"],
      ["/news", "News"],
      ["/extensions", "Extensions"],
    ]) {
      push({ path, title, pageType: "static", source: "static", hasOverride: overrideKeys.has(path) });
    }

    // Tools (from the static slug list shared with the Ads module).
    for (const slug of TOOL_SLUGS) {
      const path = `/tools/all/${slug}`;
      push({ path, title: titleFromSlug(slug), pageType: "tools", source: "tool", hasOverride: overrideKeys.has(path) });
    }
  }

  // Blogs (Firestore — admin has direct access).
  try {
    const blogSnap = await adminDb.collection("projects").doc(projectId).collection("blogs").get();
    blogSnap.forEach((d) => {
      const b = d.data() || {};
      const slug = b.slug || d.id;
      if (!slug) return;
      const path = `/blogs/${slug}`;
      push({
        path,
        title: b.seoTitle || b.heading || titleFromSlug(slug),
        description: b.seoDescription || b.excerpt || "",
        pageType: "blogs",
        source: "blog",
        hasOverride: overrideKeys.has(path),
      });
    });
  } catch {
    /* ignore — blogs are optional for the registry */
  }

  return entries;
}

/**
 * @param {{ force?: boolean, projectId?: string }} [opts]
 * @returns {Promise<object[]>} normalized PageIndexEntry records
 */
export async function getRegistryEntries({ force = false, projectId } = {}) {
  const id = resolveSeoProjectId(projectId);
  const cache = getCache(id);
  if (!force && cache.at + TTL_MS > Date.now() && cache.entries.length) return cache.entries;

  // The cross-app inventory endpoint is altftool.com's; only use it for the
  // altftool project. Every project falls back to a locally-built registry.
  let entries = id === DEFAULT_SEO_PROJECT ? await fetchWebInventory() : [];
  if (!entries.length) entries = await buildLocalRegistry(id);

  if (entries.length) {
    cache.at = Date.now();
    cache.entries = entries;
  }
  return entries.length ? entries : cache.entries;
}
