import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const webUrl = normalizeUrl(process.env.ALTFT_MONITOR_WEB_URL || "https://altftool.com");
const adminUrl = normalizeUrl(process.env.ALTFT_MONITOR_ADMIN_URL || "");
const adminToken = process.env.ALTFT_MONITOR_ADMIN_TOKEN || "";
const requireAdmin = process.env.ALTFT_MONITOR_REQUIRE_ADMIN === "true";
const requireAdminAuth = process.env.ALTFT_MONITOR_REQUIRE_ADMIN_AUTH === "true";
const timeoutMs = Number(process.env.ALTFT_MONITOR_TIMEOUT_MS || 10000);

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function appendPath(baseUrl, suffix) {
  if (!baseUrl) return "";
  return `${baseUrl}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
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

async function checkHttp(checks, { name, url, headers, parseJson = false, validate }) {
  try {
    const { response, durationMs } = await fetchWithTimeout(url, { headers });
    const body = parseJson ? await response.json().catch(() => null) : null;
    const ok = response.ok && (!validate || validate(body, response));

    checks.push({
      name,
      url,
      ok,
      status: response.status,
      durationMs,
      details: parseJson ? sanitizeHealthPayload(body) : undefined,
    });
  } catch (error) {
    checks.push({
      name,
      url,
      ok: false,
      error: error?.name === "AbortError" ? `Timed out after ${timeoutMs}ms` : error?.message || String(error),
    });
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

function runFirebaseLiveDataCheck(checks) {
  const result = spawnSync(process.execPath, ["scripts/check-firebase-live-data.mjs"], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
  });

  checks.push({
    name: "firebase-live-data",
    ok: result.status === 0,
    status: result.status,
    output: result.stdout.split("\n").slice(0, 2).join("\n"),
    error: result.stderr.trim() || undefined,
  });
}

const checks = [];

if (!webUrl) {
  checks.push({ name: "web-url-configured", ok: false, error: "ALTFT_MONITOR_WEB_URL is required." });
} else {
  await checkHttp(checks, { name: "web-root", url: webUrl });
  await checkHttp(checks, { name: "web-sitemap", url: appendPath(webUrl, "/sitemap.xml") });
}

if (adminUrl && adminToken) {
  await checkHttp(checks, {
    name: "admin-health",
    url: appendPath(adminUrl, "/api/health"),
    headers: { authorization: `Bearer ${adminToken}` },
    parseJson: true,
    validate: (payload) => Boolean(payload?.overall?.status && payload?.firebaseAdmin?.checks),
  });
} else {
  checks.push({
    name: "admin-health",
    ok: !requireAdmin && !requireAdminAuth,
    skipped: true,
    error: adminUrl
      ? "ALTFT_MONITOR_ADMIN_TOKEN is not configured."
      : "ALTFT_MONITOR_ADMIN_URL is not configured.",
  });
}

runFirebaseLiveDataCheck(checks);

const failures = checks.filter((check) => !check.ok);

console.log("Production monitoring check:");
console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  checks,
}, null, 2));

if (failures.length) {
  console.error("Production monitoring check failed:");
  for (const failure of failures) console.error(`- ${failure.name}: ${failure.error || failure.status || "failed"}`);
  process.exit(1);
}

console.log("Production monitoring check passed.");
