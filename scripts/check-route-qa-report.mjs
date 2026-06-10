import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const webRoot = path.join(workspaceRoot, "altftoolweb");

const args = new Set(process.argv.slice(2));
const argValue = (name, fallback) => {
  const prefix = `${name}=`;
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
};

const scope = argValue("--scope", process.env.ALTFT_ROUTE_QA_SCOPE || "standard");
const dryRun = args.has("--dry-run") || process.env.ALTFT_ROUTE_QA_DRY_RUN === "true";
const jsonOnly = args.has("--json");
const outputPath = argValue("--output", process.env.ALTFT_ROUTE_QA_OUTPUT || "");
const markdownOutputPath = argValue(
  "--output-md",
  argValue("--output-markdown", process.env.ALTFT_ROUTE_QA_MARKDOWN_OUTPUT || ""),
);
const includeWarmPass = args.has("--warm") || process.env.ALTFT_ROUTE_QA_WARM_PASS === "true";
const includeBrowser = !args.has("--no-browser") && process.env.ALTFT_ROUTE_QA_BROWSER !== "false";
const includeMobileBrowser = !args.has("--no-mobile") && process.env.ALTFT_ROUTE_QA_MOBILE !== "false";
const includeAdmin = !args.has("--no-admin") && process.env.ALTFT_ROUTE_QA_ADMIN !== "false";
const strictMode = args.has("--strict") || process.env.ALTFT_ROUTE_QA_STRICT === "true";
const failOnWarnings =
  strictMode || args.has("--fail-on-warnings") || process.env.ALTFT_ROUTE_QA_FAIL_ON_WARNINGS === "true";
const failOnSlowRoutes =
  strictMode || args.has("--fail-on-slow") || process.env.ALTFT_ROUTE_QA_FAIL_ON_SLOW === "true";
const warningBudget = Number(
  argValue("--warning-budget", process.env.ALTFT_ROUTE_QA_WARNING_BUDGET || (strictMode ? "0" : "Infinity")),
);
const slowRouteBudget = Number(
  argValue("--slow-route-budget", process.env.ALTFT_ROUTE_QA_SLOW_ROUTE_BUDGET || (strictMode ? "0" : "Infinity")),
);
const webUrl = (
  process.env.ALTFT_WEB_URL ||
  process.env.ALTFT_ROUTE_QA_WEB_URL ||
  "http://localhost:3002"
).replace(/\/$/, "");
const adminUrl = (
  process.env.ALTFT_ADMIN_URL ||
  process.env.ALTFT_ROUTE_QA_ADMIN_URL ||
  "http://localhost:3001"
).replace(/\/$/, "");
const adminRouteQaToken = process.env.ALTFT_ROUTE_QA_ADMIN_TOKEN || "";
const allowLocalAdminToken = process.env.ALTFT_ROUTE_QA_ALLOW_LOCAL_ADMIN_TOKEN === "true";
const requestTimeoutMs = Number(process.env.ALTFT_ROUTE_QA_REQUEST_TIMEOUT_MS || 30_000);
const browserTimeoutMs = Number(process.env.ALTFT_ROUTE_QA_BROWSER_TIMEOUT_MS || 35_000);
const browserNetworkIdleTimeoutMs = Number(process.env.ALTFT_ROUTE_QA_BROWSER_IDLE_TIMEOUT_MS || 1_200);
const slowRouteThresholdMs = Number(process.env.ALTFT_ROUTE_QA_SLOW_MS || 2_500);
const routeConcurrency = Math.max(1, Number(process.env.ALTFT_ROUTE_QA_CONCURRENCY || 3));
const browserConcurrency = Math.max(1, Number(process.env.ALTFT_ROUTE_QA_BROWSER_CONCURRENCY || 2));
const mobileOverflowBudgetPx = Number(process.env.ALTFT_ROUTE_QA_MOBILE_OVERFLOW_PX || 8);
const LOCAL_ADMIN_STORAGE_KEY = "ALTFT_LOCAL_ADMIN_SESSION_V1";
const LOCAL_ADMIN_TOKEN = "local-dev-admin-token";

const STATIC_WEB_ROUTES = [
  "/",
  "/tools",
  "/tools/all",
  "/blogs",
  "/buysmart",
  "/extensions",
  "/academy",
  "/trendingvids",
  "/brandrating",
  "/exclusivedeals",
  "/search",
  "/policypages/privacy",
  "/policypages/termsandconditions",
  "/api/health",
  "/robots.txt",
  "/sitemap.xml",
  "/rss.xml",
];

const ADMIN_PUBLIC_ROUTES = [
  "/login",
  "/access-denied",
  "/access-requested",
];

const ADMIN_EXPECTED_PROTECTED_API_ROUTES = [
  {
    route: "/api/health",
    expectedStatuses: [401],
    expectedDetail: "protected admin API rejects unauthenticated requests",
  },
];

const ADMIN_AUTHENTICATED_API_ROUTES = [
  "/api/health",
];

const ADMIN_PROTECTED_ROUTES = [
  "/admin-management",
  "/analytics",
  "/health",
  "/altftool/blogs",
  "/altftool/blogs/add-blogs",
  "/altftool/extensions",
  "/tickets",
  "/support",
];

const DANGEROUS_TEXT_PATTERNS = [
  /Application error/i,
  /Unhandled Runtime Error/i,
  /NEXT_HTTP_ERROR_FALLBACK/i,
  /This page could not be found/i,
];

const IGNORED_CONSOLE_PATTERNS = [
  /Download the React DevTools/i,
  /The resource .* was preloaded using link preload/i,
];

function slugify(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, "-");
}

function uniqueRoutes(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${entry.app}:${entry.route}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueProbeRoutes(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${entry.app}:${entry.group}:${entry.route}:${entry.viewportName || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function routeUrl(baseUrl, route) {
  return `${baseUrl}${route}`;
}

function isLocalAdminBaseUrl() {
  try {
    const hostname = new URL(adminUrl).hostname;
    return ["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

function hasDangerousText(text = "") {
  return DANGEROUS_TEXT_PATTERNS.some((pattern) => pattern.test(text));
}

function shouldKeepConsoleIssue(message) {
  if (message.type !== "error" && message.type !== "warning") return false;
  return !IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(message.text));
}

async function readText(relativePath, fallback = "") {
  try {
    return await readFile(path.join(workspaceRoot, relativePath), "utf8");
  } catch {
    return fallback;
  }
}

async function readJson(relativePath, fallback) {
  try {
    return JSON.parse(await readText(relativePath, ""));
  } catch {
    return fallback;
  }
}

async function readToolMetaMap() {
  const source = await readFile(path.join(webRoot, "src/platform/registry/toolMetaMap.js"), "utf8");
  const match = source.match(/export const toolMetaMap = (\{[\s\S]*\});?\s*$/);

  if (!match) {
    throw new Error("Unable to parse altftoolweb/src/platform/registry/toolMetaMap.js");
  }

  return JSON.parse(match[1]);
}

function getToolCategories(tool) {
  if (!tool?.category) return [];
  return Array.isArray(tool.category) ? tool.category : [tool.category];
}

async function buildRouteInventory() {
  const toolMetaMap = await readToolMetaMap();
  const blogsData = await readJson("altftoolweb/src/app/blogs/data/blogs.json", {});
  const routes = STATIC_WEB_ROUTES.map((route) => ({
    app: "web",
    group: route.startsWith("/api/") ? "web api" : "web core",
    route,
  }));

  const categorySlugs = new Set(["all"]);
  for (const tool of Object.values(toolMetaMap)) {
    for (const category of getToolCategories(tool)) {
      const categorySlug = slugify(category);
      if (categorySlug) categorySlugs.add(categorySlug);
    }
  }

  const selectedToolSlugs =
    scope === "full"
      ? Object.keys(toolMetaMap).sort()
      : TOP_PRIORITY_TOOL_SLUGS.filter((slug) => toolMetaMap[slug]);

  for (const category of [...categorySlugs].sort()) {
    routes.push({ app: "web", group: "tool category", route: `/tools/${category}` });
  }

  for (const slug of selectedToolSlugs) {
    const tool = toolMetaMap[slug];
    routes.push({ app: "web", group: "tool detail", route: `/tools/all/${slug}` });

    const primaryCategory = slugify(getToolCategories(tool)[0] || "");
    if (primaryCategory && primaryCategory !== "all") {
      routes.push({ app: "web", group: "tool detail", route: `/tools/${primaryCategory}/${slug}` });
    }
  }

  const blogSamples = scope === "full"
    ? blogsData.blogs || []
    : [
        ...(blogsData.blogs || []).slice(0, 6),
        ...(blogsData.blogs || []).slice(-2),
      ];

  for (const blog of blogSamples) {
    if (blog?.slug) routes.push({ app: "web", group: "blog detail", route: `/blogs/${blog.slug}` });
  }

  if (includeAdmin) {
    for (const route of ADMIN_PUBLIC_ROUTES) {
      routes.push({ app: "admin", group: route.startsWith("/api/") ? "admin api" : "admin public", route });
    }
    const adminToken = adminRouteQaToken || (allowLocalAdminToken && isLocalAdminBaseUrl() ? LOCAL_ADMIN_TOKEN : "");

    if (adminToken) {
      for (const route of ADMIN_AUTHENTICATED_API_ROUTES) {
        routes.push({
          app: "admin",
          group: "admin authenticated api",
          route,
          headers: { authorization: `Bearer ${adminToken}` },
        });
      }
    } else {
      for (const route of ADMIN_EXPECTED_PROTECTED_API_ROUTES) {
        routes.push({ app: "admin", group: "admin protected api", ...route });
      }
    }
  }

  return uniqueRoutes(routes);
}

function summarizeByGroup(results) {
  return results.reduce((summary, result) => {
    const key = `${result.app}:${result.group}`;
    summary[key] = (summary[key] || 0) + 1;
    return summary;
  }, {});
}

function percentile(values, ratio) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1);
  return sorted[index];
}

function pickResultSummary(result) {
  return {
    app: result.app,
    group: result.group,
    route: result.route,
    status: result.status,
    durationMs: result.durationMs || 0,
    ok: result.ok,
    issues: result.issues || [],
    warnings: result.warnings || [],
  };
}

function scoreForPass(pass) {
  const checked = pass.totals.routes + pass.totals.browserProbes;
  const passRate = checked
    ? ((checked - pass.totals.failures) / checked) * 100
    : 0;
  const slowPenalty = Math.min(20, pass.totals.slowRoutes * 2);
  return Math.max(0, Math.round(passRate - slowPenalty));
}

async function fetchWithTimeout(url, extraHeaders = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    return await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml,application/json,text/plain,*/*",
        ...extraHeaders,
      },
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkRoute(entry) {
  const baseUrl = entry.app === "admin" ? adminUrl : webUrl;
  const url = routeUrl(baseUrl, entry.route);
  const startedAt = performance.now();

  try {
    const response = await fetchWithTimeout(url, entry.headers);
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    const issues = [];
    const warnings = [];

    const statusIsExpected = entry.expectedStatuses?.includes(response.status);

    if (response.status >= 400 && !statusIsExpected) {
      issues.push(`HTTP ${response.status}`);
    }

    if (!text.trim()) {
      issues.push("empty response body");
    }

    if (hasDangerousText(text)) {
      issues.push("route error markup rendered");
    }

    if (contentType.includes("text/html")) {
      if (!/<title[^>]*>[^<]{3,}<\/title>/i.test(text)) {
        warnings.push("missing or very short title tag");
      }
      if (!/<meta\s+name=["']description["'][^>]+content=["'][^"']{20,}["']/i.test(text)) {
        warnings.push("missing or very short meta description");
      }
    }

    return {
      ...entry,
      url,
      status: response.status,
      durationMs: Math.round(performance.now() - startedAt),
      ok: issues.length === 0,
      issues,
      warnings,
      expectedDetail: statusIsExpected ? entry.expectedDetail : undefined,
    };
  } catch (error) {
    return {
      ...entry,
      url,
      status: "request failed",
      durationMs: Math.round(performance.now() - startedAt),
      ok: false,
      issues: [error.name === "AbortError" ? "request timed out" : error.message],
      warnings: [],
    };
  }
}

async function mapWithConcurrency(items, limit, handler) {
  const results = [];
  let index = 0;

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (index < items.length) {
        const currentIndex = index;
        index += 1;
        results[currentIndex] = await handler(items[currentIndex], currentIndex);
      }
    }),
  );

  return results;
}

function browserProbeRoutes(inventory) {
  const webRoutes = [
    "/",
    "/tools/all",
    "/tools/all/api-stress-estimator",
    "/blogs",
    inventory.find((entry) => entry.app === "web" && entry.group === "blog detail")?.route,
    "/buysmart",
  ].filter(Boolean);

  const probes = webRoutes.map((route) => ({ app: "web", group: "browser probe", route }));
  if (includeMobileBrowser) {
    for (const route of webRoutes.slice(0, 5)) {
      probes.push({
        app: "web",
        group: "mobile browser probe",
        route,
        viewport: { width: 390, height: 844 },
        viewportName: "mobile",
      });
    }
  }
  if (includeAdmin) probes.push({ app: "admin", group: "browser probe", route: "/login" });
  return uniqueProbeRoutes(probes);
}

async function collectPageState(page) {
  return page.evaluate(() => {
    const bodyText = document.body?.innerText || "";
    const h1 = document.querySelector("h1")?.textContent?.trim() || "";
    const title = document.title || "";
    const description =
      document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
    const brokenImages = [...document.images]
      .filter((image) => image.complete && image.currentSrc && image.naturalWidth === 0)
      .map((image) => image.alt || image.currentSrc)
      .slice(0, 8);
    const documentWidth = Math.max(
      document.documentElement?.scrollWidth || 0,
      document.body?.scrollWidth || 0,
    );
    const viewportWidth = window.innerWidth || document.documentElement?.clientWidth || 0;
    const horizontalOverflowPx = Math.max(0, documentWidth - viewportWidth);

    return {
      bodyLength: bodyText.trim().length,
      h1,
      title,
      descriptionLength: description.trim().length,
      canonical,
      brokenImages,
      horizontalOverflowPx,
      routeError: /Application error|Unhandled Runtime Error|This page could not be found/i.test(bodyText),
    };
  });
}

async function checkBrowserProbe(pageFactory, probe) {
  const page = await pageFactory();
  const consoleIssues = [];
  const baseUrl = probe.app === "admin" ? adminUrl : webUrl;
  const url = routeUrl(baseUrl, probe.route);
  const startedAt = performance.now();

  page.on("console", (message) => {
    const issue = {
      type: message.type(),
      text: message.text(),
    };
    if (shouldKeepConsoleIssue(issue)) {
      consoleIssues.push(`${issue.type}: ${issue.text}`);
    }
  });

  page.on("pageerror", (error) => {
    consoleIssues.push(`pageerror: ${error.message}`);
  });

  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: browserTimeoutMs,
    });
    await page.waitForLoadState("load", { timeout: Math.min(browserTimeoutMs, 5_000) }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: browserNetworkIdleTimeoutMs }).catch(() => {});
    const state = await collectPageState(page);
    const issues = [];
    const warnings = [];

    if ((response?.status() || 0) >= 400) issues.push(`HTTP ${response.status()}`);
    if (state.bodyLength === 0) issues.push("empty rendered body");
    if (state.routeError) issues.push("rendered route error");
    if (consoleIssues.length) issues.push(...consoleIssues);
    if (state.brokenImages.length) {
      issues.push(...state.brokenImages.map((image) => `broken image: ${image}`));
    }
    if (probe.app === "web" && state.descriptionLength < 20) warnings.push("short meta description");
    if (probe.app === "web" && !state.canonical) warnings.push("missing canonical link");
    if (probe.viewportName === "mobile" && state.horizontalOverflowPx > mobileOverflowBudgetPx) {
      issues.push(`mobile horizontal overflow ${state.horizontalOverflowPx}px`);
    }

    return {
      ...probe,
      url,
      status: response?.status() || 0,
      durationMs: Math.round(performance.now() - startedAt),
      ok: issues.length === 0,
      h1: state.h1,
      title: state.title,
      viewportName: probe.viewportName || "desktop",
      issues,
      warnings,
    };
  } catch (error) {
    return {
      ...probe,
      url,
      status: "browser failed",
      durationMs: Math.round(performance.now() - startedAt),
      ok: false,
      issues: [error.message],
      warnings: [],
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function checkAdminProtectedProbes(browser) {
  if (!includeAdmin) return [];

  if (!isLocalAdminBaseUrl()) {
    return ADMIN_PROTECTED_ROUTES.map((route) => ({
      app: "admin",
      group: "admin protected browser probe",
      route,
      url: routeUrl(adminUrl, route),
      status: "skipped",
      ok: true,
      issues: [],
      warnings: ["set ALTFT_ROUTE_QA_ADMIN_TOKEN or run against localhost to probe protected admin pages"],
    }));
  }

  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const results = [];

  try {
    const page = await context.newPage();
    await page.goto(routeUrl(adminUrl, "/login"), {
      waitUntil: "domcontentloaded",
      timeout: browserTimeoutMs,
    });
    await page.evaluate((storageKey) => {
      localStorage.setItem(storageKey, "active");
    }, LOCAL_ADMIN_STORAGE_KEY);
    await page.close();
  } catch (error) {
    await context.close().catch(() => {});
    return ADMIN_PROTECTED_ROUTES.map((route) => ({
      app: "admin",
      group: "admin protected browser probe",
      route,
      url: routeUrl(adminUrl, route),
      status: "skipped",
      ok: true,
      issues: [],
      warnings: [`admin login setup failed; protected route skipped: ${error.message}`],
    }));
  }

  try {
    for (const route of ADMIN_PROTECTED_ROUTES) {
      results.push(await checkBrowserProbe(() => context.newPage(), {
        app: "admin",
        group: "admin protected browser probe",
        route,
      }));
    }
  } finally {
    await context.close().catch(() => {});
  }

  return results;
}

function buildPassReport(label, routeResults, browserResults) {
  const allResults = [...routeResults, ...browserResults];
  const failures = allResults.filter((result) => !result.ok);
  const durations = allResults.map((result) => result.durationMs || 0);
  const matrix = buildRouteMatrix(allResults);
  const groupMatrix = buildGroupMatrix(matrix);
  const slowest = [...allResults]
    .filter((result) => Number.isFinite(result.durationMs))
    .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))
    .slice(0, 15)
    .map(pickResultSummary);
  const slowRoutes = allResults
    .filter((result) => (result.durationMs || 0) >= slowRouteThresholdMs)
    .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))
    .map(pickResultSummary);
  const warnings = allResults.flatMap((result) =>
    (result.warnings || []).map((warning) => ({
      app: result.app,
      group: result.group,
      route: result.route,
      warning,
    })),
  );

  return {
    label,
    ok: failures.length === 0,
    totals: {
      routes: routeResults.length,
      browserProbes: browserResults.length,
      failures: failures.length,
      warnings: warnings.length,
      slowRoutes: slowRoutes.length,
    },
    performance: {
      thresholdMs: slowRouteThresholdMs,
      mobileOverflowBudgetPx,
      averageMs: durations.length
        ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
        : 0,
      p95Ms: percentile(durations, 0.95),
      maxMs: Math.max(0, ...durations),
      slowRoutes,
      slowest,
    },
    routeGroups: summarizeByGroup(routeResults),
    groupMatrix,
    matrix,
    failures: failures.map(pickResultSummary),
    warnings,
  };
}

function routeQuality(result) {
  if (!result.ok || result.issues?.length) return "fail";
  if (result.warnings?.length) return "warn";
  if ((result.durationMs || 0) >= slowRouteThresholdMs) return "slow";
  return "pass";
}

function buildRouteMatrix(results) {
  return results
    .map((result) => ({
      app: result.app,
      group: result.group,
      route: result.route,
      probe: result.group?.includes("browser") ? "browser" : "http",
      status: result.status,
      durationMs: result.durationMs || 0,
      quality: routeQuality(result),
      ok: Boolean(result.ok),
      issues: result.issues || [],
      warnings: result.warnings || [],
    }))
    .sort((a, b) => {
      const appCompare = String(a.app).localeCompare(String(b.app));
      if (appCompare) return appCompare;
      const groupCompare = String(a.group).localeCompare(String(b.group));
      if (groupCompare) return groupCompare;
      return String(a.route).localeCompare(String(b.route));
    });
}

function buildGroupMatrix(matrix) {
  const groups = new Map();

  for (const row of matrix) {
    const key = `${row.app}:${row.group}`;
    const group = groups.get(key) || {
      app: row.app,
      group: row.group,
      routes: 0,
      failures: 0,
      warnings: 0,
      slowRoutes: 0,
      durationTotalMs: 0,
      durations: [],
      statusCounts: {
        pass: 0,
        slow: 0,
        warn: 0,
        fail: 0,
      },
    };

    group.routes += 1;
    group.durationTotalMs += row.durationMs || 0;
    group.durations.push(row.durationMs || 0);
    group.statusCounts[row.quality] = (group.statusCounts[row.quality] || 0) + 1;
    if (row.quality === "fail") group.failures += 1;
    if (row.quality === "warn") group.warnings += 1;
    if (row.quality === "slow") group.slowRoutes += 1;
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((group) => {
      const failuresPenalty = group.failures * 18;
      const warningsPenalty = group.warnings * 6;
      const slowPenalty = group.slowRoutes * 4;
      const score = Math.max(0, Math.round(100 - failuresPenalty - warningsPenalty - slowPenalty));

      return {
        app: group.app,
        group: group.group,
        routes: group.routes,
        score,
        failures: group.failures,
        warnings: group.warnings,
        slowRoutes: group.slowRoutes,
        averageMs: group.routes ? Math.round(group.durationTotalMs / group.routes) : 0,
        p95Ms: percentile(group.durations, 0.95),
        maxMs: Math.max(0, ...group.durations),
        statusCounts: group.statusCounts,
      };
    })
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      if (b.failures !== a.failures) return b.failures - a.failures;
      if (b.slowRoutes !== a.slowRoutes) return b.slowRoutes - a.slowRoutes;
      return b.p95Ms - a.p95Ms;
    });
}

function buildSummary(routeResults, browserResults, { warmRouteResults = null, warmBrowserResults = null } = {}) {
  const coldPass = buildPassReport("cold", routeResults, browserResults);
  coldPass.score = scoreForPass(coldPass);

  const warmPass = warmRouteResults && warmBrowserResults
    ? buildPassReport("warm", warmRouteResults, warmBrowserResults)
    : null;
  if (warmPass) {
    warmPass.score = scoreForPass(warmPass);
  }

  const activePass = warmPass || coldPass;

  return {
    ok: activePass.ok,
    score: activePass.score,
    scope,
    webUrl,
    adminUrl: includeAdmin ? adminUrl : null,
    dryRun,
    checkedAt: new Date().toISOString(),
    activePass: activePass.label,
    profileMode: warmPass ? "cold-warm" : "single",
    totals: activePass.totals,
    performance: activePass.performance,
    routeGroups: activePass.routeGroups,
    groupMatrix: activePass.groupMatrix,
    matrix: activePass.matrix,
    failures: activePass.failures,
    warnings: activePass.warnings,
    passes: {
      cold: coldPass,
      warm: warmPass,
    },
  };
}

function finiteBudget(value) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null;
}

function applyQualityGates(summary) {
  const gateFailures = [];
  const warningLimit = finiteBudget(warningBudget);
  const slowRouteLimit = finiteBudget(slowRouteBudget);

  if (failOnWarnings && warningLimit !== null && summary.totals.warnings > warningLimit) {
    gateFailures.push(`Warnings ${summary.totals.warnings} exceed budget ${warningLimit}.`);
  }

  if (failOnSlowRoutes && slowRouteLimit !== null && summary.totals.slowRoutes > slowRouteLimit) {
    gateFailures.push(`Slow routes ${summary.totals.slowRoutes} exceed budget ${slowRouteLimit}.`);
  }

  return {
    ...summary,
    ok: summary.ok && gateFailures.length === 0,
    qualityGates: {
      strict: strictMode,
      failOnWarnings,
      failOnSlowRoutes,
      warningBudget: warningLimit,
      slowRouteBudget: slowRouteLimit,
      pass: gateFailures.length === 0,
      failures: gateFailures,
    },
  };
}

async function writeReport(summary) {
  if (!outputPath) return;

  const absolutePath = path.isAbsolute(outputPath)
    ? outputPath
    : path.join(workspaceRoot, outputPath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

async function writeMarkdownReport(summary) {
  if (!markdownOutputPath) return;

  const absolutePath = path.isAbsolute(markdownOutputPath)
    ? markdownOutputPath
    : path.join(workspaceRoot, markdownOutputPath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, renderMarkdownReport(summary), "utf8");
}

function renderMarkdownReport(summary) {
  const lines = [
    "# Route QA Report",
    "",
    `- Scope: ${summary.scope}`,
    `- Profile: ${summary.profileMode}`,
    `- Active pass: ${summary.activePass}`,
    `- Score: ${summary.score}/100`,
    `- Gate: ${summary.qualityGates?.pass ? "PASS" : "FAIL"}`,
    `- HTTP routes: ${summary.totals.routes}`,
    `- Browser probes: ${summary.totals.browserProbes}`,
    `- Failures: ${summary.totals.failures}`,
    `- Warnings: ${summary.totals.warnings}`,
    `- Slow routes: ${summary.totals.slowRoutes}`,
    `- P95: ${summary.performance.p95Ms}ms`,
    `- Mobile overflow budget: ${summary.performance.mobileOverflowBudgetPx}px`,
    "",
    "## Group Matrix",
    "",
    "| App | Group | Score | Routes | Failures | Warnings | Slow | P95 |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];

  for (const group of summary.groupMatrix.slice(0, 30)) {
    lines.push(
      `| ${group.app} | ${group.group} | ${group.score} | ${group.routes} | ${group.failures} | ${group.warnings} | ${group.slowRoutes} | ${group.p95Ms}ms |`,
    );
  }

  if (summary.failures.length) {
    lines.push("", "## Failures", "");
    for (const failure of summary.failures.slice(0, 40)) {
      lines.push(`- ${failure.app} ${failure.route}: ${(failure.issues || []).join("; ")}`);
    }
  }

  if (summary.qualityGates?.failures?.length) {
    lines.push("", "## Quality Gate Failures", "");
    for (const failure of summary.qualityGates.failures) lines.push(`- ${failure}`);
  }

  if (summary.performance.slowest.length) {
    lines.push("", "## Slowest Routes", "");
    for (const route of summary.performance.slowest.slice(0, 10)) {
      lines.push(`- ${route.app} ${route.route}: ${route.durationMs}ms`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function printReport(summary) {
  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log("Route QA report");
  console.log(`Scope: ${summary.scope}`);
  console.log(`Profile: ${summary.profileMode}${summary.activePass ? ` (${summary.activePass} active)` : ""}`);
  console.log(`Web: ${summary.webUrl}`);
  if (summary.adminUrl) console.log(`Admin: ${summary.adminUrl}`);
  console.log(`HTTP routes checked: ${summary.totals.routes}`);
  console.log(`Browser probes checked: ${summary.totals.browserProbes}`);
  console.log(`Failures: ${summary.totals.failures}`);
  console.log(`Warnings: ${summary.totals.warnings}`);
  if (summary.qualityGates) {
    console.log(`Quality gate: ${summary.qualityGates.pass ? "pass" : "fail"}`);
  }
  if (summary.dryRun) {
    console.log("Dry-run inventory preview; runtime timings were not collected.");
  } else {
    console.log(`Slow routes: ${summary.totals.slowRoutes} over ${summary.performance.thresholdMs}ms`);
    console.log(`P95 duration: ${summary.performance.p95Ms}ms`);
  }

  if (summary.passes?.warm) {
    console.log(
      `Cold P95: ${summary.passes.cold.performance.p95Ms}ms, warm P95: ${summary.passes.warm.performance.p95Ms}ms`,
    );
    console.log(
      `Cold slow: ${summary.passes.cold.totals.slowRoutes}, warm slow: ${summary.passes.warm.totals.slowRoutes}`,
    );
  }

  if (summary.failures.length) {
    console.log("\nFailures");
    for (const failure of summary.failures.slice(0, 40)) {
      console.log(`- ${failure.app} ${failure.route}: ${(failure.issues || []).join("; ")}`);
    }
  }

  if (summary.qualityGates?.failures?.length) {
    console.log("\nQuality gate failures");
    for (const failure of summary.qualityGates.failures) {
      console.log(`- ${failure}`);
    }
  }

  if (summary.warnings.length) {
    console.log("\nWarnings");
    for (const warning of summary.warnings.slice(0, 40)) {
      console.log(`- ${warning.app} ${warning.route}: ${warning.warning}`);
    }
  }

  if (!summary.dryRun && summary.performance.slowest.length) {
    console.log("\nSlowest routes");
    for (const route of summary.performance.slowest.slice(0, 10)) {
      console.log(`- ${route.app} ${route.route}: ${route.durationMs}ms`);
    }
  }

  if (!summary.failures.length) {
    console.log("\nRoute QA passed.");
  }
}

const inventory = await buildRouteInventory();

if (dryRun) {
  const summary = applyQualityGates(
    buildSummary(
      inventory.map((entry) => ({
        ...entry,
        status: "dry-run",
        durationMs: 0,
        ok: true,
        issues: [],
        warnings: [],
      })),
      [],
    ),
  );
  await writeReport(summary);
  await writeMarkdownReport(summary);
  printReport(summary);
  process.exit(0);
}

async function runBrowserPass() {
  if (!includeBrowser) return [];

  const browser = await chromium.launch({ headless: true });
  try {
    const probes = browserProbeRoutes(inventory);
    const results = await mapWithConcurrency(probes, browserConcurrency, (probe) =>
      checkBrowserProbe(
        () => browser.newPage({ viewport: probe.viewport || { width: 1366, height: 900 } }),
        probe,
      )
    );
    results.push(...(await checkAdminProtectedProbes(browser)));
    return results;
  } finally {
    await browser.close();
  }
}

const routeResults = await mapWithConcurrency(inventory, routeConcurrency, checkRoute);
const browserResults = await runBrowserPass();
const warmRouteResults = includeWarmPass
  ? await mapWithConcurrency(inventory, routeConcurrency, checkRoute)
  : null;
const warmBrowserResults = includeWarmPass ? await runBrowserPass() : null;

const summary = applyQualityGates(
  buildSummary(routeResults, browserResults, {
    warmRouteResults,
    warmBrowserResults,
  }),
);
await writeReport(summary);
await writeMarkdownReport(summary);
printReport(summary);

if (!summary.ok) {
  process.exit(1);
}
