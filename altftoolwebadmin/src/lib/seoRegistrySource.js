// altftoolwebadmin/src/lib/seoRegistrySource.js
//
// Provides the page registry used by the SEO Dashboard, Search and Bulk tools.
// Primary source: the public web app's page inventory endpoint (richest, exact).
// Fallback: build the registry LOCALLY from data the admin already has
// (tool slugs, Firestore blogs, and existing SEO overrides) so these screens
// keep working even when the cross-app inventory env vars are not configured.

import { buildPageIndexEntry } from "@altftool/core/seo";
import { TOOL_SLUGS } from "@/config/placements";
import { adminDb } from "@/lib/firebaseAdmin";

const TTL_MS = Number(process.env.ALTFT_REGISTRY_TTL_MS || 120_000);
let cache = { at: 0, entries: [] };

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
async function buildLocalRegistry() {
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
    const snap = await adminDb.doc("projects/altftool/seo/runtime").get();
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

  // Static hubs.
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

  // Blogs (Firestore — admin has direct access).
  try {
    const blogSnap = await adminDb.collection("projects").doc("altftool").collection("blogs").get();
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
 * @param {{ force?: boolean }} [opts]
 * @returns {Promise<object[]>} normalized PageIndexEntry records
 */
export async function getRegistryEntries({ force = false } = {}) {
  if (!force && cache.at + TTL_MS > Date.now() && cache.entries.length) return cache.entries;

  // Prefer the richer cross-app inventory; fall back to a locally-built registry.
  let entries = await fetchWebInventory();
  if (!entries.length) entries = await buildLocalRegistry();

  if (entries.length) cache = { at: Date.now(), entries };
  return entries.length ? entries : cache.entries;
}
