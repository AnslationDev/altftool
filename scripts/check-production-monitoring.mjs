import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const webUrls = parseUrlList(
  process.env.ALTFT_MONITOR_WEB_URLS ||
    process.env.ALTFT_MONITOR_WEB_URL ||
    "https://altftool.com",
);
const adminUrl = normalizeUrl(process.env.ALTFT_MONITOR_ADMIN_URL || "https://adsmanager.altftool.com");
const adminToken = process.env.ALTFT_MONITOR_ADMIN_TOKEN || "";
const adminEmail = process.env.ALTFT_MONITOR_ADMIN_EMAIL || "";
const adminPassword = process.env.ALTFT_MONITOR_ADMIN_PASSWORD || "";
const adminFirebaseApiKey =
  process.env.ALTFT_MONITOR_FIREBASE_API_KEY ||
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "";
const requireAdmin = process.env.ALTFT_MONITOR_REQUIRE_ADMIN === "true";
const requireAdminAuth = process.env.ALTFT_MONITOR_REQUIRE_ADMIN_AUTH === "true";
const skipWeb = process.env.ALTFT_MONITOR_SKIP_WEB === "true";
const skipAdmin = process.env.ALTFT_MONITOR_SKIP_ADMIN === "true";
const skipFirebaseLiveData = process.env.ALTFT_MONITOR_SKIP_FIREBASE_LIVE_DATA === "true";
const timeoutMs = Number(process.env.ALTFT_MONITOR_TIMEOUT_MS || 15000);
const outputPath = process.env.ALTFT_MONITOR_OUTPUT_PATH || "";
const alertWebhookUrl = process.env.ALTFT_MONITOR_ALERT_WEBHOOK_URL || "";
const alertWebhookFormat = (process.env.ALTFT_MONITOR_ALERT_FORMAT || "generic").toLowerCase();
const alertDryRun = process.env.ALTFT_MONITOR_ALERT_DRY_RUN === "true";

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
    name: "status-page",
    path: "/status",
    expectedText: ["AltFTool Status", "Public web readiness"],
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

const ADMIN_PUBLIC_CHECKS = [
  {
    name: "admin-login-page",
    path: "/login",
    expectedText: ["AltFTools Admin", "/_next/static/"],
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

async function resolveAdminBearerToken(checks) {
  if (adminToken) {
    checks.push({
      name: "admin-auth-token",
      ok: true,
      details: { source: "ALTFT_MONITOR_ADMIN_TOKEN" },
    });
    return adminToken;
  }

  const hasLoginCredentials = Boolean(adminEmail && adminPassword && adminFirebaseApiKey);
  if (!hasLoginCredentials) return "";

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(
    adminFirebaseApiKey,
  )}`;

  try {
    const { response, durationMs } = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        returnSecureToken: true,
      }),
    });
    const payload = safeJsonParse(await response.text());
    const token = payload?.idToken || "";
    const ok = response.ok && Boolean(token);

    checks.push({
      name: "admin-auth-login",
      ok,
      status: response.status,
      durationMs,
      details: {
        email: maskEmail(payload?.email || adminEmail),
        localId: payload?.localId || null,
      },
      error: ok ? undefined : payload?.error?.message || "Firebase admin login failed.",
    });

    return ok ? token : "";
  } catch (error) {
    checks.push({
      name: "admin-auth-login",
      ok: false,
      error:
        error?.name === "AbortError"
          ? `Timed out after ${timeoutMs}ms`
          : error?.message || String(error),
    });
    return "";
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

function maskEmail(value = "") {
  const [name, domain] = String(value).split("@");
  if (!name || !domain) return value ? "configured" : "";
  return `${name.slice(0, 2)}***@${domain}`;
}

function buildAlertText(report, failures) {
  const failedLines = failures
    .slice(0, 8)
    .map((failure) => `- ${failure.name}: ${failure.error || failure.status || "failed"}`)
    .join("\n");

  return [
    "AltFTool production monitor failed.",
    `Checked: ${report.generatedAt}`,
    `Web: ${report.webUrls.join(", ") || "not configured"}`,
    `Admin: ${report.adminUrl || "not configured"}`,
    `Summary: ${report.summary.passed} passed, ${report.summary.skipped} skipped, ${report.summary.failed} failed`,
    failedLines,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildAlertPayload(report, failures) {
  const text = buildAlertText(report, failures);
  const fields = failures.slice(0, 8).map((failure) => ({
    name: failure.name,
    value: failure.error || String(failure.status || "failed"),
  }));

  if (alertWebhookFormat === "slack") {
    return {
      text,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*AltFTool production monitor failed*\n${report.summary.failed} failing check(s).`,
          },
        },
        {
          type: "section",
          fields: fields.map((field) => ({
            type: "mrkdwn",
            text: `*${field.name}*\n${field.value}`,
          })),
        },
      ],
    };
  }

  if (alertWebhookFormat === "discord") {
    return {
      content: text,
      embeds: [
        {
          title: "AltFTool production monitor failed",
          description: `${report.summary.failed} failing check(s).`,
          color: 15158332,
          fields,
          timestamp: report.generatedAt,
        },
      ],
    };
  }

  return {
    text,
    content: text,
    summary: report.summary,
    failures: failures.map(({ name, url, status, error }) => ({ name, url, status, error })),
    generatedAt: report.generatedAt,
  };
}

async function sendFailureAlert(report, failures) {
  if (!failures.length || !alertWebhookUrl) return;

  const payload = buildAlertPayload(report, failures);

  if (alertDryRun) {
    console.log("Production monitoring alert dry-run:");
    console.log(JSON.stringify({
      configured: true,
      format: alertWebhookFormat,
      failureCount: failures.length,
      payloadPreview: {
        text: payload.text || payload.content || "",
        summary: payload.summary || report.summary,
      },
    }, null, 2));
    return;
  }

  try {
    const { response, durationMs } = await fetchWithTimeout(alertWebhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Production monitoring alert webhook failed: HTTP ${response.status}`);
      return;
    }

    console.log(`Production monitoring alert sent in ${durationMs}ms.`);
  } catch (error) {
    console.error(
      `Production monitoring alert failed: ${
        error?.name === "AbortError" ? `Timed out after ${timeoutMs}ms` : error?.message || String(error)
      }`,
    );
  }
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
  if (skipWeb) {
    checks.push({
      name: "web-checks",
      ok: true,
      skipped: true,
      details: { reason: "ALTFT_MONITOR_SKIP_WEB=true" },
    });
    return;
  }

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
  if (skipAdmin) {
    checks.push({
      name: "admin-checks",
      ok: true,
      skipped: true,
      details: { reason: "ALTFT_MONITOR_SKIP_ADMIN=true" },
    });
    return;
  }

  if (!adminUrl) {
    checks.push({
      name: "admin-url-configured",
      ok: !requireAdmin && !requireAdminAuth,
      skipped: true,
      error: "ALTFT_MONITOR_ADMIN_URL is not configured.",
    });
    return;
  }

  for (const check of ADMIN_PUBLIC_CHECKS) {
    await checkHttp(checks, {
      ...check,
      url: appendPath(adminUrl, check.path),
    });
  }

  const bearerToken = await resolveAdminBearerToken(checks);

  if (!bearerToken) {
    checks.push({
      name: "admin-authenticated-health",
      ok: !requireAdminAuth,
      skipped: true,
      error:
        "Configure ALTFT_MONITOR_ADMIN_TOKEN or ALTFT_MONITOR_ADMIN_EMAIL, ALTFT_MONITOR_ADMIN_PASSWORD, and ALTFT_MONITOR_FIREBASE_API_KEY.",
    });
    return;
  }

  await checkHttp(checks, {
    name: "admin-me",
    url: appendPath(adminUrl, "/api/admin/me"),
    headers: { authorization: `Bearer ${bearerToken}` },
    parseJson: true,
    validate: (payload) => payload?.roleType === "superadmin" && Boolean(payload?.email),
    summarize: (payload) => ({
      email: maskEmail(payload?.email || ""),
      roleType: payload?.roleType || null,
    }),
  });

  await checkHttp(checks, {
    name: "admin-health",
    url: appendPath(adminUrl, "/api/health?fresh=1"),
    headers: { authorization: `Bearer ${bearerToken}` },
    parseJson: true,
    validate: (payload) =>
      Boolean(payload?.overall?.status && payload?.firebaseAdmin?.checks) &&
      ["healthy", "watch"].includes(payload?.overall?.status) &&
      payload?.firebaseAdmin?.status === "ready" &&
      payload?.firebaseLiveData?.status === "live",
  });
}

const checks = [];

await runWebChecks(checks);
await runAdminChecks(checks);
if (skipFirebaseLiveData) {
  checks.push({
    name: "firebase-live-data",
    ok: true,
    skipped: true,
    details: { reason: "ALTFT_MONITOR_SKIP_FIREBASE_LIVE_DATA=true" },
  });
} else {
  runFirebaseLiveDataCheck(checks);
}

const failures = checks.filter((check) => !check.ok);
const report = {
  generatedAt: new Date().toISOString(),
  webUrls,
  adminUrl: adminUrl || null,
  skipped: {
    web: skipWeb,
    admin: skipAdmin,
    firebaseLiveData: skipFirebaseLiveData,
  },
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
  await sendFailureAlert(report, failures);
  process.exit(1);
}

console.log("Production monitoring check passed.");
