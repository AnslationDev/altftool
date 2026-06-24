// @altftool/core/seo/health
//
// Pure SEO health analyzer for the ALTF Engine (Phase 4).
//
// Given the central config (and optionally a route inventory), it produces a
// snapshot of metrics + findings. No I/O, no dependencies beyond the resolver's
// glob helper — trivially unit-testable and safe to run server-side.
//
// Findings: { code, severity: "error"|"warn"|"info", message, ref? }

import { globToRegExp } from "./resolver.js";

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Analyze the central SEO config for issues.
 * @param {object} config                 The decoded seo/runtime config.
 * @param {object} [options]
 * @param {string[]} [options.routes]      Optional live route inventory (paths).
 * @param {string} [options.generatedAt]   ISO timestamp (injectable for tests).
 * @returns {{ generatedAt: string, metrics: object, findings: Array }}
 */
export function analyzeSeoHealth(config, options = {}) {
  const findings = [];
  const add = (severity, code, message, ref) =>
    findings.push(ref ? { severity, code, message, ref } : { severity, code, message });

  const cfg = isPlainObject(config) ? config : {};
  const routes = Array.isArray(options.routes) ? options.routes : [];
  const routeSet = new Set(routes);

  const global = isPlainObject(cfg.global) ? cfg.global : {};
  const pages = isPlainObject(cfg.pages) ? cfg.pages : {};
  const rules = Array.isArray(cfg.rules) ? cfg.rules : [];
  const redirects = Array.isArray(cfg.redirects) ? cfg.redirects : [];
  const brands = isPlainObject(cfg.brands) ? cfg.brands : {};
  const crawl = isPlainObject(cfg.crawl) ? cfg.crawl : {};

  if (cfg.enabled === false) {
    add("info", "ENGINE_DISABLED", "SEO Engine is disabled; central config is not applied.");
  }

  // --- Global ---
  if (global?.robots?.index === false) {
    add("error", "GLOBAL_NOINDEX", "Global robots.index=false would noindex the ENTIRE site.");
  }
  if (global.defaultBrandId && !brands[global.defaultBrandId]) {
    add("warn", "MISSING_DEFAULT_BRAND", `global.defaultBrandId "${global.defaultBrandId}" has no matching brand profile.`, global.defaultBrandId);
  }

  // --- Pages overrides ---
  let noindexPages = 0;
  const canonicalSeen = new Map();
  for (const [path, entry] of Object.entries(pages)) {
    const e = isPlainObject(entry) ? entry : {};
    const noindex = e.noindex === true || e?.robots?.index === false;
    if (noindex) noindexPages += 1;

    // partial metadata: title without description (or vice-versa) on an indexable page
    if (!noindex) {
      if (e.title && !e.description) add("info", "PAGE_MISSING_DESCRIPTION", `Page override "${path}" sets a title but no description.`, path);
      if (e.description && !e.title) add("info", "PAGE_MISSING_TITLE", `Page override "${path}" sets a description but no title.`, path);
    }

    // duplicate canonical detection
    if (e.canonical) {
      const prev = canonicalSeen.get(e.canonical);
      if (prev) add("warn", "DUPLICATE_CANONICAL", `Pages "${prev}" and "${path}" both set canonical "${e.canonical}".`, path);
      else canonicalSeen.set(e.canonical, path);
    }

    // override for a route that doesn't exist (only when an inventory is supplied)
    if (routes.length && !routeSet.has(path) && !routeSet.has(path.replace(/\/+$/, ""))) {
      add("info", "PAGE_OVERRIDE_UNKNOWN_ROUTE", `Page override "${path}" has no matching live route.`, path);
    }
  }

  // --- Rules ---
  for (const rule of rules) {
    if (!isPlainObject(rule) || rule.enabled === false) continue;
    const glob = typeof rule.pathGlob === "string" ? rule.pathGlob : "";
    if (!glob || !globToRegExp(glob)) {
      add("warn", "INVALID_RULE_GLOB", `Rule has an invalid or empty pathGlob: "${glob}".`, glob);
      continue;
    }
    const broad = glob === "/*" || glob === "/**" || glob === "*";
    if (broad && rule?.set?.noindex === true) {
      add("error", "BROAD_NOINDEX_RULE", `Rule "${glob}" applies noindex very broadly — verify this is intended.`, glob);
    }
  }

  // --- Redirects ---
  const bySource = new Map();
  const seenSources = new Set();
  let activeRedirects = 0;
  for (const r of redirects) {
    if (!isPlainObject(r) || !r.source) continue;
    if (r.enabled !== false) activeRedirects += 1;
    if (seenSources.has(r.source)) {
      add("warn", "DUPLICATE_REDIRECT", `Duplicate redirect source "${r.source}".`, r.source);
    }
    seenSources.add(r.source);
    if (r.source === r.destination) {
      add("error", "SELF_REDIRECT", `Redirect "${r.source}" points to itself.`, r.source);
    }
    bySource.set(r.source, r.destination);
    // redirecting a known live route
    if (routes.length && routeSet.has(r.source)) {
      add("warn", "REDIRECT_OVER_LIVE_ROUTE", `Redirect source "${r.source}" matches a live route; it will shadow that page.`, r.source);
    }
    // redirect source also has a page override
    if (pages[r.source]) {
      add("warn", "REDIRECT_PAGE_CONFLICT", `"${r.source}" has both a redirect and a page SEO override.`, r.source);
    }
  }
  // loops + chains
  for (const [source, dest] of bySource) {
    if (bySource.get(dest) === source) {
      add("error", "REDIRECT_LOOP", `Redirect loop between "${source}" and "${dest}".`, source);
    } else if (typeof dest === "string" && dest.startsWith("/") && bySource.has(dest)) {
      add("warn", "REDIRECT_CHAIN", `Redirect chain: "${source}" -> "${dest}" -> "${bySource.get(dest)}".`, source);
    }
  }

  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warn").length;
  const infos = findings.filter((f) => f.severity === "info").length;

  const metrics = {
    enabled: cfg.enabled === true,
    pages: Object.keys(pages).length,
    noindexPages,
    rules: rules.length,
    redirects: redirects.length,
    activeRedirects,
    disallow: Array.isArray(crawl.disallow) ? crawl.disallow.length : 0,
    brands: Object.keys(brands).length,
    errors,
    warnings,
    infos,
    score: scoreFromFindings(errors, warnings),
  };

  return {
    generatedAt: options.generatedAt || new Date().toISOString(),
    metrics,
    findings,
  };
}

/** Simple 0–100 health score: errors cost more than warnings. */
function scoreFromFindings(errors, warnings) {
  return Math.max(0, 100 - errors * 20 - warnings * 5);
}
