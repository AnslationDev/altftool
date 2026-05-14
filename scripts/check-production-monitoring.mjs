import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const webUrls = parseUrlList(
  process.env.ALTFT_MONITOR_WEB_URLS ||
    process.env.ALTFT_MONITOR_WEB_URL ||
    "https://altftool.com",
);
const adminUrl = normalizeUrl(process.env.ALTFT_MONITOR_ADMIN_URL || "");
const adminToken = process.env.ALTFT_MONITOR_ADMIN_TOKEN || "";
const requireAdmin = process.env.ALTFT_MONITOR_REQUIRE_ADMIN === "true";
const requireAdminAuth = process.env.ALTFT_MONITOR_REQUIRE_ADMIN_AUTH === "true";
const timeoutMs = Number(process.env.ALTFT_MONITOR_TIMEOUT_MS || 15000);
const outputPath = process.env.ALTFT_MONITOR_OUTPUT_PATH || "";

const WEB_PAGE_CHECKS = [
  {
    name: "web-root",
    path: "/",
    expectedText: ["AltFTool"],
  },
  {
    name: "tools-directory",
    path: "/tools",
    expectedText: ["Explore Tools"],
  },
  {
    name: "priority-tool-route",
    path: "/tools/all/api-stress-estimator",
    expectedText: ["API Stress Estimator", "Tools"],
  },
  {
    name: "blogs-page",
    path: "/blogs",
    expectedText: ["AltFTool Blog"],
  },
  {
    name: "extensions-page",
    path: "/extensions",
    expectedText: ["Browser with Smart Extensions"],
  },
  {
    name: "academy-page",
    path: "/academy",
    expectedText: ["Academy"],
  },
  {
    name: "trending-videos-page",
    path: "/trendingvids",
    expectedText: ["Discover Trending Videos"],
  },
  {
    name: "buysmart-page",
    path: "/buysmart",
    expectedText: ["BuySmart"],
  },
];

const WEB_ENDPOINT_CHECKS = [
  {
    name: "sitemap",
    path: "/sitemap.xml",
    expectedText: ["<urlset", "/tools/all/api-stress-estimator"],
  },
  {
    name: "robots",
    path: "/robots.txt",
    expectedText: ["Sitemap:"],
  },
  {
    name: "rss",
    path: "/rss.xml",
    expectedText: ["<rss"],
  },
  {
    name: "blogs-api",
    path: "/api/blogs?offset=0&limit=3",
    parseJson: true,
    validate: (payload) =>
      Array.isArray(payload?.posts) &&
      payload.posts.length > 0 &&
      payload.posts.every((post) => post.heading && post.slug),
    summarize: (payload) => ({
      posts: payload?.posts?.length || 0,
      firstSlug: payload?.posts?.[0]?.slug || null,
    }),
  },
  {
    name: "web-health-api",
    path: "/api/health",
    parseJson: true,
    validate: (payload) =>
      payload?.service === "altftool-web" &&
      Boolean(payload?.overall?.status) &&
      Number(payload?.tools?.priorityRegistered) >= 40,
    summarize: (payload) => ({
      status: payload?.overall?.status || null,
      score: payload?.overall?.score || null,
      commit: payload?.release?.commitSha?.slice?.(0, 8) || null,
      priorityRegistered: payload?.tools?.priorityRegistered || null,
    }),
  },
  {
    name: "currency-history-api",
    path: "/api/tools/currency-converter/2024-01-02?from=USD&to=EUR",
    parseJson: true,
    validate: (payload) => Number(payload?.rates?.EUR) > 0,
    summarize: (payload) => ({
      date: payload?.date || null,
      eur: payload?.rates?.EUR || null,
    }),
  },
  {
    name: "metal-prices-api",
    path: "/api/tools/metal-prices?currency=USD&metals=XAU",
    parseJson: true,
    validate: (payload) => payload?.success === true && Number(payload?.rates?.XAU) > 0,
    summarize: (payload) => ({
      fallback: Boolean(payload?.fallback),
      hasGoldRate: Number(payload?.rates?.XAU) > 0,
    }),
  },
];

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function parseUrlList(value) {
  return [
    ...new Set(
      String(value || "")
        .split(",")
        .map(normalizeUrl)
        .filter(Boolean),
    ),
  ];
}

function appendPath(baseUrl, suffix) {
  if (!baseUrl) return "";
  return `${baseUrl}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
}

function routeError(text = "") {
  return /Application error|NEXT_HTTP_ERROR_FALLBACK|This page could not be found|Tool workspace could not load/i.test(
    text,
  );
}

function toFailureReason({ status, expectedText = [], text = "", body, validate }) {
  if (status < 200 || status >= 400) return `HTTP ${status}`;
  if (routeError(text)) return "rendered route error";

  for (const expected of expectedText) {
    if (!text.includes(expected)) return `missing text: ${expected}`;
  }

  if (validate && !validate(body)) return "response validation failed";
  return "";
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startedAt = performance.now();
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      ...options,
      signal: controller.signal,
    });
    const durationMs = Math.round(performance.now() - startedAt);
    return { response, durationMs };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkHttp(checks, config) {
  const {
    name,
    url,
    headers,
    parseJson = false,
    expectedText = [],
    validate,
    summarize,
  } = config;

  try {
    const { response, durationMs } = await fetchWithTimeout(url, { headers });
    const text = await response.text();
    const body = parseJson ? safeJsonParse(text) : null;
    const error = toFailureReason({
      status: response.status,
      expectedText,
      text,
      body,
      validate,
    });

    checks.push({
      name,
      url,
      ok: !error,
      status: response.status,
      durationMs,
      details: parseJson
        ? summarize?.(body) || sanitizeHealthPayload(body)
        : {
            contentLength: text.length,
          },
      error: error || undefined,
    });
  } catch (error) {
    checks.push({
      name,
      url,
      ok: false,
      error:
        error?.name === "AbortError"
          ? `Timed out after ${timeoutMs}ms`
          : error?.message || String(error),
    });
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function sanitizeHealthPayload(payload) {
  if (!payload || typeof payload !== "object") return null;

  return {
    overall: payload.overall ?? null,
    firebaseAdmin: payload.firebaseAdmin
      ? {
          status: payload.firebaseAdmin.status,
          score: payload.firebaseAdmin.score,
          missing: payload.firebaseAdmin.missing,
          invalid: payload.firebaseAdmin.invalid,
        }
      : null,
  };
}

function parseJsonBlock(stdout = "") {
  const firstBrace = stdout.indexOf("{");
  const lastBrace = stdout.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return safeJsonParse(stdout.slice(firstBrace, lastBrace + 1));
}

function summarizeFirebaseLiveData(summary) {
  if (!summary) return null;

  return {
    projectId: summary.projectId,
    buySmartHero: summary.buySmart?.hero?.itemCount ?? null,
    buySmartCategories: summary.buySmart?.categories?.itemCount ?? null,
    blogs: summary.blogs?.firstPageCount ?? null,
    extensions: summary.extensions?.displayableCount ?? null,
    academy: summary.academy?.displayableCount ?? null,
    trendingVideos: summary.trendingVideos?.displayableCount ?? null,
    consumerRatingBrands: summary.consumerRating?.brands?.activeCount ?? null,
  };
}

function validateFirebaseLiveSummary(summary) {
  const details = summarizeFirebaseLiveData(summary);
  if (!details) return false;

  return [
    details.buySmartHero,
    details.buySmartCategories,
    details.blogs,
    details.extensions,
    details.academy,
    details.trendingVideos,
    details.consumerRatingBrands,
  ].every((value) => Number(value) > 0);
}

function runFirebaseLiveDataCheck(checks) {
  const result = spawnSync(process.execPath, ["scripts/check-firebase-live-data.mjs"], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
  });
  const summary = parseJsonBlock(result.stdout);
  const ok = result.status === 0 && validateFirebaseLiveSummary(summary);

  checks.push({
    name: "firebase-live-data",
    ok,
    status: result.status,
    details: summarizeFirebaseLiveData(summary),
    output: result.stdout.split("\n").slice(0, 2).join("\n"),
    error: ok ? undefined : result.stderr.trim() || "Firebase live data summary failed validation.",
  });
}

async function runWebChecks(checks) {
  if (!webUrls.length) {
    checks.push({
      name: "web-url-configured",
      ok: false,
      error: "ALTFT_MONITOR_WEB_URL or ALTFT_MONITOR_WEB_URLS is required.",
    });
    return;
  }

  for (const baseUrl of webUrls) {
    const origin = new URL(baseUrl).hostname;

    for (const check of WEB_PAGE_CHECKS) {
      await checkHttp(checks, {
        ...check,
        name: `${origin}:${check.name}`,
        url: appendPath(baseUrl, check.path),
      });
    }

    for (const check of WEB_ENDPOINT_CHECKS) {
      await checkHttp(checks, {
        ...check,
        name: `${origin}:${check.name}`,
        url: appendPath(baseUrl, check.path),
      });
    }
  }
}

async function runAdminChecks(checks) {
  if (adminUrl && adminToken) {
    await checkHttp(checks, {
      name: "admin-health",
      url: appendPath(adminUrl, "/api/health"),
      headers: { authorization: `Bearer ${adminToken}` },
      parseJson: true,
      validate: (payload) =>
        Boolean(payload?.overall?.status && payload?.firebaseAdmin?.checks) &&
        !["attention", "critical"].includes(payload?.overall?.status),
    });
    return;
  }

  checks.push({
    name: "admin-health",
    ok: !requireAdmin && !requireAdminAuth,
    skipped: true,
    error: adminUrl
      ? "ALTFT_MONITOR_ADMIN_TOKEN is not configured."
      : "ALTFT_MONITOR_ADMIN_URL is not configured.",
  });
}

const checks = [];

await runWebChecks(checks);
await runAdminChecks(checks);
runFirebaseLiveDataCheck(checks);

const failures = checks.filter((check) => !check.ok);
const report = {
  generatedAt: new Date().toISOString(),
  webUrls,
  adminUrl: adminUrl || null,
  timeoutMs,
  summary: {
    total: checks.length,
    passed: checks.filter((check) => check.ok && !check.skipped).length,
    skipped: checks.filter((check) => check.skipped).length,
    failed: failures.length,
  },
  checks,
};

if (outputPath) {
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log("Production monitoring check:");
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.error("Production monitoring check failed:");
  for (const failure of failures) {
    console.error(`- ${failure.name}: ${failure.error || failure.status || "failed"}`);
  }
  process.exit(1);
}

console.log("Production monitoring check passed.");
