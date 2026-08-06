"use client";

import { useEffect, useRef, useState } from "react";

// ============================================================================
// Minimal path router (base: /top3)
// ----------------------------------------------------------------------------
// Was a hash router in the standalone build (#/r/slug). Inside AltFTool the
// section owns real paths — /top3/catalog, /top3/c/:slug, /top3/r/:slug —
// served by page.jsx + [...slug]/page.jsx. Navigation is history.pushState;
// plain <a> clicks are intercepted once in Top3Client, so components keep
// their ordinary anchors. Legacy #/… links still resolve and are rewritten
// to the canonical path on load.
// ============================================================================

const BASE = "/top3";

export function toHome() {
  return BASE;
}
export function toCatalog() {
  return `${BASE}/catalog`;
}
export function toCategory(slug) {
  return `${BASE}/c/${slug}`;
}
export function toRanking(slug) {
  return `${BASE}/r/${slug}`;
}

/** Parses "/r/slug"-style route strings shared by paths and legacy hashes. */
function parseRoute(rel) {
  if (rel.startsWith("/r/")) return { name: "ranking", slug: rel.slice(3) };
  if (rel.startsWith("/c/")) return { name: "category", slug: rel.slice(3) };
  if (rel === "/catalog") return { name: "catalog" };
  return null;
}

export function parseLocation(pathname, hash = "") {
  let p = decodeURIComponent(pathname || BASE);
  if (p.length > 1) p = p.replace(/\/+$/, "");
  let rel = p.startsWith(BASE) ? p.slice(BASE.length) : p;
  if (rel === "") rel = "/";

  const h = decodeURIComponent((hash || "").replace(/^#/, ""));

  // Legacy hash routes from the standalone build: /top3#/r/slug etc.
  if (h.startsWith("/")) {
    const legacy = parseRoute(h);
    if (legacy) return { ...legacy, legacyHash: true };
    return { name: "home", legacyHash: true };
  }

  const route = parseRoute(rel);
  if (route) return route;
  // A plain #section hash still renders home + scrolls, but is marked for
  // URL normalization — the address bar never keeps a hash.
  if (rel === "/") return h ? { name: "home", anchor: h, legacyHash: true } : { name: "home" };
  return { name: "home", anchor: rel.replace(/^\//, "") };
}

export function routeKey(route) {
  switch (route.name) {
    case "ranking":
      return `ranking:${route.slug}`;
    case "category":
      return `category:${route.slug}`;
    case "catalog":
      return "catalog";
    default:
      return "home";
  }
}

/** Canonical URL for a parsed route (used to normalize legacy hash links). */
function routeToPath(route) {
  switch (route.name) {
    case "ranking":
      return toRanking(route.slug);
    case "category":
      return toCategory(route.slug);
    case "catalog":
      return toCatalog();
    default:
      return BASE;
  }
}

// Section jump requested from another page: carried in memory, never in the
// URL, and consumed by the next home render.
let pendingAnchor = null;

export function useRoute(initialPath = BASE) {
  const [route, setRoute] = useState(() =>
    typeof window === "undefined"
      ? parseLocation(initialPath, "")
      : parseLocation(window.location.pathname, window.location.hash)
  );

  const routeRef = useRef(route);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  useEffect(() => {
    // The address bar must never keep a hash. Whenever the URL disagrees with
    // the rendered route — a legacy #/… link, a #section fragment, or Next's
    // hydration replaceState restoring/rewriting the original URL at its own
    // pace — assert the canonical clean path. A few settle passes cover the
    // hydration race; asserting from routeRef can never fight a real
    // navigation, because navigations update the ref first.
    let timers = [];
    const assertUrl = () => {
      const want = routeRef.current;
      const canonical = routeToPath(want);
      const actual = parseLocation(window.location.pathname, window.location.hash);
      const dirty =
        window.location.hash ||
        actual.legacyHash ||
        routeKey(actual) !== routeKey(want) ||
        (routeKey(want) !== "home" && window.location.pathname !== canonical);
      if (dirty) window.history.replaceState({}, "", canonical);
    };
    const scheduleAssert = () => {
      timers.forEach(clearTimeout);
      timers = [0, 300, 1000].map((ms) => setTimeout(assertUrl, ms));
    };
    const sync = () => {
      const r = parseLocation(window.location.pathname, window.location.hash);
      if (r.name === "home" && pendingAnchor) {
        r.anchor = pendingAnchor;
        pendingAnchor = null;
      }
      routeRef.current = r;
      setRoute(r);
      if (r.legacyHash || window.location.hash) scheduleAssert();
    };
    sync();
    scheduleAssert();
    window.addEventListener("popstate", sync);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return route;
}

function getLenis() {
  return window.__lenis;
}

/** Scrolls to top on page change, or to the anchor when linking into the home page. */
export function useRouteScroll(route) {
  const key = routeKey(route);
  const anchor = route.name === "home" ? route.anchor : undefined;

  useEffect(() => {
    const lenis = getLenis();

    if (anchor) {
      let frame = 0;
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(anchor);
        if (el) {
          if (lenis) lenis.scrollTo(el, { offset: -72 });
          else el.scrollIntoView({ behavior: "smooth" });
          return;
        }
        if (attempts++ < 30) frame = requestAnimationFrame(tryScroll);
      };
      frame = requestAnimationFrame(tryScroll);
      return () => cancelAnimationFrame(frame);
    }

    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: "auto" });
  }, [key, anchor]);
}

export function navigate(to) {
  if (typeof window === "undefined") return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/**
 * Jump to a home-page section without ever putting a hash in the URL:
 * already on home → smooth-scroll in place; elsewhere → go home (clean
 * path) and scroll once the section exists.
 */
export function navigateToSection(id) {
  if (typeof window === "undefined") return;
  const current = parseLocation(window.location.pathname, "");
  if (current.name === "home") {
    scrollToId(id, -72);
    return;
  }
  pendingAnchor = id;
  navigate(BASE);
}

/**
 * Scrolls to an element within the current page without touching the URL,
 * so deep links inside a detail page never trigger a route change.
 */
export function scrollToId(id, offset = -90) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}
