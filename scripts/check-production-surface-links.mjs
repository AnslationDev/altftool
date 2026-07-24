import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);

const DEFAULT_BASE_URL = "https://www.altftool.com";
const DEFAULT_CRITICAL_PATHS = [
  "/",
  "/tools/all",
  "/tools/all/api-stress-estimator",
  "/blogs",
  "/status",
  "/extensions",
  "/academy",
  "/buysmart",
  "/policypages/privacy",
];
const IGNORED_PROTOCOLS = /^(?:mailto|tel|sms|javascript|data|blob):/i;
const NON_PAGE_EXTENSIONS = /\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|mp3|mp4|pdf|png|svg|txt|webmanifest|webp|woff2?|xml)$/i;
const ROUTE_ERROR_PATTERN = /Application error|Unhandled Runtime Error|NEXT_HTTP_ERROR_FALLBACK|This page could not be found/i;

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const index = rawArgs.indexOf(name);
  if (index >= 0 && rawArgs[index + 1] && !rawArgs[index + 1].startsWith("--")) {
    return rawArgs[index + 1];
  }

  const match = rawArgs.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function envFlag(name) {
  return process.env[name] === "true" || process.env[name] === "1";
}

function normalizeBaseUrl(value = DEFAULT_BASE_URL) {
  const normalized = String(value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  return normalized || DEFAULT_BASE_URL;
}

function isEquivalentProductionOrigin(candidateUrl, baseUrl) {
  const candidate = candidateUrl instanceof URL ? candidateUrl : new URL(candidateUrl);
  const base = baseUrl instanceof URL ? baseUrl : new URL(baseUrl);
  const normalizeHostname = (hostname) => hostname.toLowerCase().replace(/^www\./, "");

  return (
    candidate.protocol === base.protocol &&
    candidate.port === base.port &&
    normalizeHostname(candidate.hostname) === normalizeHostname(base.hostname)
  );
}

function resolveOutputPath(value) {
  if (!value) return "";
  return path.isAbsolute(value) ? value : path.join(workspaceRoot, value);
}

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function decodeBasicHtmlEntities(value = "") {
  return String(value)
    .replace(/&quot;/gi, "\"")
    .replace(/&#34;/g, "\"")
    .replace(/&#x22;/gi, "\"")
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ");
}

function stripHtml(value = "") {
  return decodeBasicHtmlEntities(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTagAttributes(tag = "") {
  const attrs = {};
  const attrPattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match;

  while ((match = attrPattern.exec(tag))) {
    attrs[match[1].toLowerCase()] = decodeBasicHtmlEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }

  return attrs;
}

function extractTags(html = "", tagName) {
  return [...String(html).matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function extractTextBetween(html = "", tagName) {
  const match = String(html).match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return stripHtml(match?.[1] || "");
}

function getMetaContent(html = "", key, attrNames = ["name", "property"]) {
  const wanted = String(key).toLowerCase();

  for (const tag of extractTags(html, "meta")) {
    const attrs = extractTagAttributes(tag);
    const matches = attrNames.some((attrName) => String(attrs[attrName] || "").toLowerCase() === wanted);
    if (matches && attrs.content) return attrs.content.trim();
  }

  return "";
}

function getCanonicalHref(html = "") {
  for (const tag of extractTags(html, "link")) {
    const attrs = extractTagAttributes(tag);
    const rel = String(attrs.rel || "").toLowerCase().split(/\s+/);
    if (rel.includes("canonical") && attrs.href) return attrs.href.trim();
  }

  return "";
}

function normalizeDiscoveredUrl(rawValue, pageUrl) {
  const raw = decodeBasicHtmlEntities(String(rawValue || "").trim());
  if (!raw || raw === "#" || raw.startsWith("#") || IGNORED_PROTOCOLS.test(raw)) return null;

  try {
    const url = new URL(raw, pageUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

function uniqueByUrl(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = entry.url.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractAnchors(html = "", pageUrl) {
  return uniqueByUrl(
    extractTags(html, "a")
      .map((tag) => {
        const attrs = extractTagAttributes(tag);
        const url = normalizeDiscoveredUrl(attrs.href, pageUrl);
        if (!url) return null;

        return {
          raw: attrs.href || "",
          text: stripHtml(tag.replace(/^<a\b[^>]*>/i, "").replace(/<\/a>$/i, "")),
          url,
        };
      })
      .filter(Boolean),
  );
}

function splitSrcset(value = "") {
  return String(value)
    .split(",")
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function extractImages(html = "", pageUrl) {
  const candidates = [];

  for (const tag of [...extractTags(html, "img"), ...extractTags(html, "source")]) {
    const attrs = extractTagAttributes(tag);
    const values = [
      attrs.src,
      attrs["data-src"],
      attrs["data-lazy-src"],
      ...splitSrcset(attrs.srcset),
      ...splitSrcset(attrs["data-srcset"]),
    ].filter(Boolean);

    for (const value of values) {
      const url = normalizeDiscoveredUrl(value, pageUrl);
      if (url) {
        candidates.push({
          raw: value,
          alt: attrs.alt || "",
          url,
        });
      }
    }
  }

  return uniqueByUrl(candidates);
}

function extractSitemapUrls(xml = "", baseUrl = DEFAULT_BASE_URL) {
  const urls = [...String(xml).matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => normalizeDiscoveredUrl(match[1], baseUrl))
    .filter(Boolean);

  return uniqueByUrl(urls.map((url) => ({ url }))).map((entry) => entry.url);
}

function isPageLikeUrl(url) {
  if (NON_PAGE_EXTENSIONS.test(url.pathname)) return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname.startsWith("/_next/")) return false;
  return true;
}

function scoreSampleUrl(url) {
  const pathName = url.pathname;
  if (pathName === "/") return 1000;
  if (pathName === "/tools/all") return 990;
  if (pathName === "/tools/all/api-stress-estimator") return 985;
  if (pathName === "/blogs") return 980;
  if (pathName.startsWith("/tools/all/")) return 900;
  if (pathName.startsWith("/blogs/") && !pathName.includes("/tag/") && !pathName.includes("/category/")) return 870;
  if (pathName.startsWith("/tools/")) return 820;
  if (pathName.startsWith("/policypages/")) return 720;
  return 500;
}

function selectSampleUrls({ baseUrl, sitemapUrls = [], limit = 24, criticalPaths = DEFAULT_CRITICAL_PATHS }) {
  const base = new URL(baseUrl);
  const criticalUrls = criticalPaths
    .map((pathName) => normalizeDiscoveredUrl(pathName, baseUrl))
    .filter(Boolean);
  const sameOriginSitemapUrls = sitemapUrls
    .filter((url) => url.origin === base.origin)
    .filter(isPageLikeUrl);
  const candidates = uniqueByUrl([...criticalUrls, ...sameOriginSitemapUrls].map((url) => ({ url })))
    .map((entry, index) => ({
      url: entry.url,
      score: scoreSampleUrl(entry.url),
      index,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return candidates.slice(0, limit).map((entry) => entry.url);
}

async function fetchWithTimeout(url, { fetchImpl, timeoutMs, method = "GET", headers = {} }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startedAt = performance.now();
    const response = await fetchImpl(url, {
      cache: "no-store",
      headers,
      method,
      redirect: "follow",
      signal: controller.signal,
    });

    return {
      response,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithTimeoutRetry(url, options) {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      lastError = error;
      if (error?.name !== "AbortError" || attempt === 1) throw error;
    }
  }

  throw lastError;
}

async function fetchText(url, context, headers = {}) {
  const { response, durationMs } = await fetchWithTimeoutRetry(url, {
    ...context,
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml,text/xml,text/plain,*/*",
      ...headers,
    },
  });
  const text = await response.text();

  return {
    response,
    status: response.status,
    url: response.url || url,
    durationMs,
    headers: response.headers,
    text,
  };
}

async function probeTargetUrl(url, context, { kind = "link", sourcePage = "" } = {}) {
  const headers = kind === "image"
    ? { accept: "image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*" }
    : { accept: "text/html,application/xhtml+xml,text/plain,*/*" };
  const base = {
    kind,
    sourcePage,
    targetUrl: url.toString(),
  };

  try {
    const headResult = await fetchWithTimeoutRetry(url, {
      ...context,
      method: "HEAD",
      headers,
    });
    let response = headResult.response;
    let durationMs = headResult.durationMs;
    let text = "";

    if ([403, 405, 501].includes(response.status) || (kind === "link" && response.status < 400)) {
      const getResult = await fetchWithTimeoutRetry(url, {
        ...context,
        method: "GET",
        headers,
      });
      response = getResult.response;
      durationMs += getResult.durationMs;

      const contentType = response.headers.get("content-type") || "";
      if (kind === "link" && contentType.includes("text/html")) {
        text = await response.text();
      } else {
        await response.body?.cancel?.();
      }
    }

    const contentType = response.headers.get("content-type") || "";
    const isBroken = response.status >= 400;
    const routeError = kind === "link" && text && ROUTE_ERROR_PATTERN.test(text);

    return {
      ...base,
      ok: !isBroken && !routeError,
      status: response.status,
      durationMs,
      contentType,
      error: isBroken ? `HTTP ${response.status}` : routeError ? "rendered route error" : undefined,
    };
  } catch (error) {
    return {
      ...base,
      ok: false,
      error: error?.name === "AbortError" ? `Timed out after ${context.timeoutMs}ms` : error?.message || String(error),
    };
  }
}

async function mapWithConcurrency(items, limit, handler) {
  const results = [];
  let index = 0;

  await Promise.all(
    Array.from({ length: Math.max(1, limit) }, async () => {
      while (index < items.length) {
        const currentIndex = index;
        index += 1;
        results[currentIndex] = await handler(items[currentIndex], currentIndex);
      }
    }),
  );

  return results;
}

function buildSeoWarnings({ html, pageUrl, baseUrl }) {
  const title = extractTextBetween(html, "title");
  const description = getMetaContent(html, "description", ["name"]);
  const canonical = getCanonicalHref(html);
  const ogTitle = getMetaContent(html, "og:title");
  const ogDescription = getMetaContent(html, "og:description");
  const ogUrl = getMetaContent(html, "og:url");
  const warnings = [];

  if (title.length < 8) warnings.push({ type: "seo", pageUrl, message: "missing or short title" });
  if (description.length < 30) warnings.push({ type: "seo", pageUrl, message: "missing or short meta description" });
  if (!canonical) {
    warnings.push({ type: "seo", pageUrl, message: "missing canonical link" });
  } else {
    const canonicalUrl = normalizeDiscoveredUrl(canonical, pageUrl);
    if (!canonicalUrl) {
      warnings.push({ type: "seo", pageUrl, message: "invalid canonical link" });
    } else if (!isEquivalentProductionOrigin(canonicalUrl, baseUrl)) {
      warnings.push({ type: "seo", pageUrl, message: "canonical points outside production origin", targetUrl: canonicalUrl.toString() });
    }
  }
  if (!ogTitle) warnings.push({ type: "seo", pageUrl, message: "missing og:title" });
  if (!ogDescription) warnings.push({ type: "seo", pageUrl, message: "missing og:description" });
  if (!ogUrl) warnings.push({ type: "seo", pageUrl, message: "missing og:url" });

  return {
    title,
    descriptionLength: description.length,
    canonical,
    ogTitle,
    warnings,
  };
}

function isSameOrigin(url, baseUrl) {
  return url.origin === new URL(baseUrl).origin;
}

async function checkPage(url, context) {
  const pageUrl = url.toString();
  const failures = [];
  const notices = [];
  const warnings = [];

  try {
    const result = await fetchText(pageUrl, context);
    const contentType = result.headers.get("content-type") || "";

    if (result.status >= 400) {
      failures.push({ type: "page", pageUrl, status: result.status, message: `HTTP ${result.status}` });
    }
    if (!result.text.trim()) {
      failures.push({ type: "page", pageUrl, status: result.status, message: "empty page body" });
    }
    if (ROUTE_ERROR_PATTERN.test(result.text)) {
      failures.push({ type: "page", pageUrl, status: result.status, message: "rendered route error" });
    }
    if (!contentType.includes("text/html")) {
      warnings.push({ type: "page", pageUrl, message: `non-HTML content type: ${contentType || "unknown"}` });
    }

    const seo = buildSeoWarnings({ html: result.text, pageUrl, baseUrl: context.baseUrl });
    warnings.push(...seo.warnings);

    const allAnchors = extractAnchors(result.text, pageUrl);
    const allImages = extractImages(result.text, pageUrl);
    const internalAnchors = allAnchors.filter((anchor) => isSameOrigin(anchor.url, context.baseUrl));
    const internalImages = allImages.filter((image) => isSameOrigin(image.url, context.baseUrl));
    const skippedExternalLinks = allAnchors.length - internalAnchors.length;
    const skippedExternalImages = allImages.length - internalImages.length;
    const anchorsToCheck = internalAnchors.slice(0, context.linkLimitPerPage);
    const imagesToCheck = internalImages.slice(0, context.imageLimitPerPage);

    const targetChecks = await mapWithConcurrency(
      [
        ...anchorsToCheck.map((anchor) => ({ url: anchor.url, kind: "link" })),
        ...imagesToCheck.map((image) => ({ url: image.url, kind: "image" })),
      ],
      context.targetConcurrency,
      (target) => context.targetProbeCache.getOrSet(target.url, target.kind, pageUrl),
    );

    for (const target of targetChecks) {
      if (!target.ok) {
        failures.push({
          type: target.kind,
          pageUrl,
          targetUrl: target.targetUrl,
          status: target.status,
          message: target.error || "target failed",
        });
      }
    }

    if (internalAnchors.length > anchorsToCheck.length) {
      notices.push({
        type: "coverage",
        pageUrl,
        message: `${internalAnchors.length - anchorsToCheck.length} internal links skipped by per-page limit`,
      });
    }
    if (internalImages.length > imagesToCheck.length) {
      notices.push({
        type: "coverage",
        pageUrl,
        message: `${internalImages.length - imagesToCheck.length} internal images skipped by per-page limit`,
      });
    }
    if (skippedExternalLinks > 0) {
      notices.push({ type: "coverage", pageUrl, message: `${skippedExternalLinks} external links skipped` });
    }
    if (skippedExternalImages > 0) {
      notices.push({ type: "coverage", pageUrl, message: `${skippedExternalImages} external images skipped` });
    }

    return {
      ok: failures.length === 0,
      pageUrl,
      status: result.status,
      durationMs: result.durationMs,
      title: seo.title,
      canonical: seo.canonical,
      counts: {
        anchors: allAnchors.length,
        internalAnchors: internalAnchors.length,
        checkedLinks: anchorsToCheck.length,
        images: allImages.length,
        internalImages: internalImages.length,
        checkedImages: imagesToCheck.length,
        skippedExternalLinks,
        skippedExternalImages,
      },
      failures,
      notices,
      warnings,
    };
  } catch (error) {
    return {
      ok: false,
      pageUrl,
      status: "request failed",
      durationMs: 0,
      title: "",
      canonical: "",
      counts: {
        anchors: 0,
        internalAnchors: 0,
        checkedLinks: 0,
        images: 0,
        internalImages: 0,
        checkedImages: 0,
        skippedExternalLinks: 0,
        skippedExternalImages: 0,
      },
      failures: [
        {
          type: "page",
          pageUrl,
          message: error?.name === "AbortError" ? `Timed out after ${context.timeoutMs}ms` : error?.message || String(error),
        },
      ],
      notices,
      warnings,
    };
  }
}

function createTargetProbeCache(context) {
  const cache = new Map();

  return {
    async getOrSet(url, kind, sourcePage) {
      const key = `${kind}:${url.toString()}`;
      if (!cache.has(key)) {
        cache.set(key, probeTargetUrl(url, context, { kind, sourcePage }));
      }

      return cache.get(key);
    },
    size: () => cache.size,
  };
}

export async function buildProductionSurfaceLinkReport(options = {}) {
  const baseUrl = normalizeBaseUrl(options.baseUrl || DEFAULT_BASE_URL);
  const strict = Boolean(options.strict);
  const context = {
    baseUrl,
    fetchImpl: options.fetchImpl || fetch,
    imageLimitPerPage: Math.max(0, Number(options.imageLimitPerPage ?? 16)),
    linkLimitPerPage: Math.max(0, Number(options.linkLimitPerPage ?? 32)),
    targetConcurrency: Math.max(1, Number(options.targetConcurrency ?? 4)),
    timeoutMs: Math.max(500, Number(options.timeoutMs ?? 10000)),
  };
  context.targetProbeCache = createTargetProbeCache(context);

  const sitemapUrl = new URL("/sitemap.xml", baseUrl).toString();
  let sitemapUrls = [];
  let sitemapError = "";

  try {
    const sitemapResult = await fetchText(sitemapUrl, context, {
      accept: "application/xml,text/xml,*/*",
    });
    if (sitemapResult.status >= 400) {
      sitemapError = `Sitemap HTTP ${sitemapResult.status}`;
    } else {
      sitemapUrls = extractSitemapUrls(sitemapResult.text, baseUrl);
    }
  } catch (error) {
    sitemapError = error?.name === "AbortError" ? `Sitemap timed out after ${context.timeoutMs}ms` : error?.message || String(error);
  }

  const sampledUrls = selectSampleUrls({
    baseUrl,
    criticalPaths: options.criticalPaths || DEFAULT_CRITICAL_PATHS,
    limit: Math.max(1, Number(options.limit ?? 24)),
    sitemapUrls,
  });
  const pageResults = await mapWithConcurrency(
    sampledUrls,
    Math.max(1, Number(options.pageConcurrency ?? 3)),
    (url) => checkPage(url, context),
  );
  const failures = pageResults.flatMap((page) => page.failures || []);
  const warnings = [
    ...(sitemapError ? [{ type: "sitemap", pageUrl: sitemapUrl, message: sitemapError }] : []),
    ...pageResults.flatMap((page) => page.warnings || []),
  ];
  const notices = pageResults.flatMap((page) => page.notices || []);
  const totals = pageResults.reduce(
    (summary, page) => {
      summary.pages += 1;
      summary.linksChecked += page.counts?.checkedLinks || 0;
      summary.imagesChecked += page.counts?.checkedImages || 0;
      summary.skippedExternalLinks += page.counts?.skippedExternalLinks || 0;
      summary.skippedExternalImages += page.counts?.skippedExternalImages || 0;
      if (!page.ok) summary.pagesWithFailures += 1;
      return summary;
    },
    {
      pages: 0,
      pagesWithFailures: 0,
      linksChecked: 0,
      imagesChecked: 0,
      skippedExternalLinks: 0,
      skippedExternalImages: 0,
    },
  );
  totals.failures = failures.length;
  totals.notices = notices.length;
  totals.warnings = warnings.length;

  const ok = failures.length === 0 && (!strict || warnings.length === 0);
  const score = clampScore(100 - failures.length * 15 - warnings.length * (strict ? 5 : 2));

  return {
    generatedAt: new Date().toISOString(),
    ok,
    status: failures.length ? "blocked" : warnings.length ? "watch" : "clean",
    strict,
    score,
    baseUrl,
    sitemap: {
      url: sitemapUrl,
      urlCount: sitemapUrls.length,
      error: sitemapError || null,
      sampled: sampledUrls.map((url) => url.toString()),
    },
    limits: {
      pages: sampledUrls.length,
      linkLimitPerPage: context.linkLimitPerPage,
      imageLimitPerPage: context.imageLimitPerPage,
      timeoutMs: context.timeoutMs,
    },
    totals,
    pages: pageResults,
    failures,
    notices,
    warnings,
  };
}

export function renderProductionSurfaceLinkMarkdown(report) {
  const lines = [
    "# Production Surface Link Report",
    "",
    `- Status: ${report.status}`,
    `- Score: ${report.score}/100`,
    `- Base URL: ${report.baseUrl}`,
    `- Pages sampled: ${report.totals.pages}`,
    `- Links checked: ${report.totals.linksChecked}`,
    `- Images checked: ${report.totals.imagesChecked}`,
    `- Failures: ${report.totals.failures}`,
    `- Warnings: ${report.totals.warnings}`,
    `- Notices: ${report.totals.notices}`,
    "",
    "## Page Summary",
    "",
    "| Page | Status | Links | Images | Issues |",
    "| --- | ---: | ---: | ---: | ---: |",
  ];

  for (const page of report.pages) {
    lines.push(
      `| ${page.pageUrl} | ${page.status} | ${page.counts.checkedLinks} | ${page.counts.checkedImages} | ${(page.failures?.length || 0) + (page.warnings?.length || 0)} |`,
    );
  }

  if (report.failures.length) {
    lines.push("", "## Failures", "");
    for (const failure of report.failures.slice(0, 60)) {
      lines.push(`- ${failure.type}: ${failure.pageUrl}${failure.targetUrl ? ` -> ${failure.targetUrl}` : ""}: ${failure.message}`);
    }
  }

  if (report.warnings.length) {
    lines.push("", "## Warnings", "");
    for (const warning of report.warnings.slice(0, 60)) {
      lines.push(`- ${warning.type}: ${warning.pageUrl}: ${warning.message}${warning.targetUrl ? ` (${warning.targetUrl})` : ""}`);
    }
  }

  if (report.notices.length) {
    lines.push("", "## Notices", "");
    for (const notice of report.notices.slice(0, 60)) {
      lines.push(`- ${notice.type}: ${notice.pageUrl}: ${notice.message}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

async function writeArtifact(filePath, content) {
  if (!filePath) return;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

function printReport(report, jsonOnly = false) {
  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("Production surface link check");
  console.log(`Base: ${report.baseUrl}`);
  console.log(`Status: ${report.status}`);
  console.log(`Score: ${report.score}/100`);
  console.log(`Pages: ${report.totals.pages}`);
  console.log(`Links checked: ${report.totals.linksChecked}`);
  console.log(`Images checked: ${report.totals.imagesChecked}`);
  console.log(`Failures: ${report.totals.failures}`);
  console.log(`Warnings: ${report.totals.warnings}`);
  console.log(`Notices: ${report.totals.notices}`);

  if (report.failures.length) {
    console.log("\nFailures");
    for (const failure of report.failures.slice(0, 30)) {
      console.log(`- ${failure.type}: ${failure.pageUrl}${failure.targetUrl ? ` -> ${failure.targetUrl}` : ""}: ${failure.message}`);
    }
  }

  if (report.warnings.length) {
    console.log("\nWarnings");
    for (const warning of report.warnings.slice(0, 30)) {
      console.log(`- ${warning.type}: ${warning.pageUrl}: ${warning.message}`);
    }
  }

  if (report.notices.length) {
    console.log("\nNotices");
    for (const notice of report.notices.slice(0, 20)) {
      console.log(`- ${notice.type}: ${notice.pageUrl}: ${notice.message}`);
    }
  }

  if (!report.failures.length) {
    console.log("\nProduction surface link check passed.");
  }
}

async function main() {
  const baseUrl = normalizeBaseUrl(
    argValue(
      "--url",
      process.env.ALTFT_LINK_CHECK_URL ||
        process.env.ALTFT_MONITOR_WEB_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        DEFAULT_BASE_URL,
    ),
  );
  const report = await buildProductionSurfaceLinkReport({
    baseUrl,
    imageLimitPerPage: Number(argValue("--image-limit", process.env.ALTFT_LINK_CHECK_IMAGE_LIMIT || "16")),
    limit: Number(argValue("--limit", process.env.ALTFT_LINK_CHECK_PAGE_LIMIT || "24")),
    linkLimitPerPage: Number(argValue("--link-limit", process.env.ALTFT_LINK_CHECK_LINK_LIMIT || "32")),
    pageConcurrency: Number(argValue("--page-concurrency", process.env.ALTFT_LINK_CHECK_PAGE_CONCURRENCY || "3")),
    strict: args.has("--strict") || envFlag("ALTFT_LINK_CHECK_STRICT"),
    targetConcurrency: Number(argValue("--target-concurrency", process.env.ALTFT_LINK_CHECK_TARGET_CONCURRENCY || "4")),
    timeoutMs: Number(argValue("--timeout-ms", process.env.ALTFT_LINK_CHECK_TIMEOUT_MS || "10000")),
  });
  const outputPath = resolveOutputPath(argValue("--output", process.env.ALTFT_LINK_CHECK_OUTPUT || ""));
  const markdownPath = resolveOutputPath(
    argValue("--output-md", argValue("--output-markdown", process.env.ALTFT_LINK_CHECK_MARKDOWN_OUTPUT || "")),
  );

  await writeArtifact(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeArtifact(markdownPath, renderProductionSurfaceLinkMarkdown(report));
  printReport(report, args.has("--json"));

  if (!report.ok) {
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
