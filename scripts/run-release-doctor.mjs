import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { createFirebaseDataIntegrityReport } from "@altftool/core/firebaseDataIntegrity";
import { createFirebaseLiveDataReport } from "@altftool/core/firebaseLiveData";
import { createVercelDeployReadinessReport } from "@altftool/core/deployReadiness";
import { getAdminDb, getFirebaseAdminConfigStatus } from "../altftoolwebadmin/src/lib/firebaseAdmin.js";
import { buildProductionSurfaceLinkReport } from "./check-production-surface-links.mjs";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const startedAt = performance.now();
const RELEASE_DOCTOR_FIX_COMMANDS = {
  "health-manifest": "npm run health:manifest",
  "route-qa": "npm run qa:routes:report",
  "blog-content": "npm run content:blogs:report",
  "firebase-admin": "npm run firebase:admin-write-check",
  "firebase-live-data": "npm run firebase:live-check",
  "firebase-data-integrity": "npm run firebase:integrity:strict",
  "performance-budget": "npm run performance:budget:strict",
  "production-links": "npm run monitor:links:strict",
  "vercel-readiness": "npm run deploy:readiness -- --target=all",
  "production-freshness": "npm run monitor:production",
};

function hasFlag(name) {
  return args.includes(name);
}

function envFlag(name) {
  return ["1", "true", "yes", "on"].includes(String(process.env[name] || "").trim().toLowerCase());
}

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) return args[index + 1];

  return fallback;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.replace(/^export\s+/, "").match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value.replace(/\\n/g, "\n");
  }
}

function loadLocalEnv() {
  [
    ".env.local",
    "altftoolweb/.env.local",
    "altftoolwebadmin/.env.local",
  ].forEach((relativePath) => loadEnvFile(path.join(root, relativePath)));
}

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function statusFromScore(score, passAt = 90, warnAt = 70) {
  if (score >= passAt) return "pass";
  if (score >= warnAt) return "warn";
  return "block";
}

function finalStatus(checks, strict = false) {
  const blocks = checks.filter((check) => check.status === "block").length;
  const warnings = checks.filter((check) => check.status === "warn").length;

  if (blocks > 0) return "blocked";
  if (strict && warnings > 0) return "blocked";
  if (warnings > 0) return "ready-with-warnings";
  return "ready";
}

function summarizeCounts(checks) {
  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { pass: 0, warn: 0, block: 0 },
  );
}

function createCheck({ key, label, status, score, detail, nextAction = "", command = "", durationMs = 0, meta = {} }) {
  return {
    key,
    label,
    status,
    score: clampScore(score),
    detail,
    nextAction,
    command: command || RELEASE_DOCTOR_FIX_COMMANDS[key] || "",
    durationMs: Math.round(durationMs),
    meta,
  };
}

async function readJson(relativePath) {
  return JSON.parse(await fsp.readFile(path.join(root, relativePath), "utf8"));
}

async function timed(fn) {
  const started = performance.now();
  try {
    return {
      ok: true,
      value: await fn(),
      durationMs: performance.now() - started,
    };
  } catch (error) {
    return {
      ok: false,
      error,
      durationMs: performance.now() - started,
    };
  }
}

function withTimeout(promise, timeoutMs, label) {
  let timeout;
  const timer = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)), timeoutMs);
  });

  return Promise.race([promise, timer]).finally(() => clearTimeout(timeout));
}

async function checkSavedHealthManifest() {
  const result = await timed(() => readJson("altftoolwebadmin/src/data/healthManifest.json"));

  if (!result.ok) {
    return createCheck({
      key: "health-manifest",
      label: "Tool, SEO, content, and automation manifest",
      status: "block",
      score: 0,
      detail: result.error?.message || "Health manifest could not be read.",
      nextAction: "Run npm run health:manifest.",
      durationMs: result.durationMs,
    });
  }

  const manifest = result.value;
  const score = clampScore(
    Number(manifest.tools?.averageScore || 0) * 0.32 +
      Number(manifest.qa?.score || 0) * 0.28 +
      Number(manifest.seo?.score || 0) * 0.14 +
      Number(manifest.content?.score || 0) * 0.14 +
      Number(manifest.automation?.score || 0) * 0.12,
  );
  const status = statusFromScore(score);

  return createCheck({
    key: "health-manifest",
    label: "Tool, SEO, content, and automation manifest",
    status,
    score,
    detail: `${manifest.tools?.healthy || 0}/${manifest.tools?.total || 0} tools healthy, ${manifest.qa?.routeCovered || 0}/${manifest.qa?.total || 0} priority routes covered.`,
    nextAction: status === "pass" ? "" : "Run npm run health:manifest and fix the listed manifest gaps.",
    durationMs: result.durationMs,
    meta: {
      generatedAt: manifest.generatedAt,
      tools: manifest.tools?.total || 0,
      priorityTools: manifest.qa?.total || 0,
    },
  });
}

async function checkRouteQaReport() {
  const result = await timed(() => readJson("altftoolwebadmin/src/data/routeQaReport.json"));

  if (!result.ok) {
    return createCheck({
      key: "route-qa",
      label: "Saved route QA report",
      status: "block",
      score: 0,
      detail: result.error?.message || "Route QA report could not be read.",
      nextAction: "Run npm run qa:routes:report.",
      durationMs: result.durationMs,
    });
  }

  const report = result.value;
  const failures = Number(report.totals?.failures || 0);
  const warnings = Number(report.totals?.warnings || 0);
  const slowRoutes = Number(report.totals?.slowRoutes || 0);
  const status = !report.checkedAt || failures > 0 ? "block" : warnings > 0 || slowRoutes > 0 ? "warn" : "pass";

  return createCheck({
    key: "route-qa",
    label: "Saved route QA report",
    status,
    score: report.score || 0,
    detail: report.checkedAt
      ? `${report.totals?.routes || 0} routes, ${failures} failures, ${warnings} warnings, ${slowRoutes} slow routes.`
      : "No saved route QA timestamp found.",
    nextAction: status === "pass" ? "" : "Run npm run qa:routes:report and fix route failures or slow probes.",
    durationMs: result.durationMs,
    meta: {
      checkedAt: report.checkedAt || null,
      browserProbes: report.totals?.browserProbes || 0,
      p95Ms: report.performance?.p95Ms || 0,
    },
  });
}

async function checkBlogContentReport() {
  const result = await timed(() => readJson("altftoolwebadmin/src/data/blogContentHealthReport.json"));

  if (!result.ok) {
    return createCheck({
      key: "blog-content",
      label: "Blog content health",
      status: "block",
      score: 0,
      detail: result.error?.message || "Blog content report could not be read.",
      nextAction: "Run npm run content:blogs:report.",
      durationMs: result.durationMs,
    });
  }

  const report = result.value;
  const score = Number(report.score || 0);
  const status = report.ok && score >= 86 ? "pass" : score >= 72 ? "warn" : "block";

  return createCheck({
    key: "blog-content",
    label: "Blog content health",
    status,
    score,
    detail: `${report.totals?.ready || 0}/${report.totals?.total || 0} blogs ready; sources ${report.totals?.withSources || 0}, FAQ ${report.totals?.withFaq || 0}, links ${report.totals?.withLinks || 0}.`,
    nextAction: status === "pass" ? "" : "Run npm run content:blogs:report after fixing source, FAQ, and internal-link gaps.",
    durationMs: result.durationMs,
    meta: {
      generatedAt: report.generatedAt,
      source: report.source,
    },
  });
}

async function checkFirebaseAdmin({ offline = false, timeoutMs = 6000 } = {}) {
  const status = getFirebaseAdminConfigStatus();

  if (!status.ok) {
    const issues = [...(status.missing || []), ...(status.invalid || [])];
    return createCheck({
      key: "firebase-admin",
      label: "Firebase Admin SDK",
      status: "block",
      score: 0,
      detail: `Credentials are not ready: ${issues.join("; ") || "unknown config issue"}.`,
      nextAction: "Set FIREBASE_SERVICE_ACCOUNT_FILE or a complete FIREBASE_SERVICE_ACCOUNT/FIREBASE_PRIVATE_KEY config.",
    });
  }

  if (offline) {
    return createCheck({
      key: "firebase-admin",
      label: "Firebase Admin SDK",
      status: "warn",
      score: 90,
      detail: "Credentials look ready; live Firestore read skipped in offline mode.",
      nextAction: "Run npm run release:doctor without --offline before release.",
    });
  }

  const result = await timed(() =>
    withTimeout(getAdminDb().collection("admins").limit(1).get(), timeoutMs, "Firebase Admin read"),
  );

  return createCheck({
    key: "firebase-admin",
    label: "Firebase Admin SDK",
    status: result.ok ? "pass" : "block",
    score: result.ok ? 100 : 25,
    detail: result.ok
      ? "Admin SDK credentials can read Firestore."
      : result.error?.message || "Admin SDK Firestore read failed.",
    nextAction: result.ok ? "" : "Fix Admin SDK credentials or Firestore access, then rerun npm run release:doctor.",
    durationMs: result.durationMs,
  });
}

async function checkFirebaseLiveData({ offline = false, timeoutMs = 8000 } = {}) {
  if (offline) {
    return createCheck({
      key: "firebase-live-data",
      label: "Firebase public live data",
      status: "warn",
      score: 90,
      detail: "Live Firestore content probe skipped in offline mode.",
      nextAction: "Run npm run release:doctor without --offline before release.",
    });
  }

  const result = await timed(() =>
    createFirebaseLiveDataReport({
      env: process.env,
      timeoutMs,
    }),
  );

  if (!result.ok) {
    return createCheck({
      key: "firebase-live-data",
      label: "Firebase public live data",
      status: "block",
      score: 0,
      detail: result.error?.message || "Firebase live data report failed.",
      nextAction: "Run npm run firebase:live-check and fix blocked public collections.",
      durationMs: result.durationMs,
    });
  }

  const report = result.value;
  const score = Number(report.score || 0);
  const status = report.ok && score >= 90 ? "pass" : score >= 60 ? "warn" : "block";
  const passingChecks = Array.isArray(report.checks)
    ? report.checks.filter((check) => check.ok).length
    : Number(report.passingChecks || 0);
  const totalChecks = Array.isArray(report.checks)
    ? report.checks.length
    : Number(report.totalChecks || 0);

  return createCheck({
    key: "firebase-live-data",
    label: "Firebase public live data",
    status,
    score,
    detail: `${passingChecks}/${totalChecks} live Firestore checks passing.`,
    nextAction: status === "pass" ? "" : "Run npm run firebase:live-check and fix failed Firebase sections.",
    durationMs: result.durationMs,
    meta: {
      projectId: report.projectId,
      failures: report.failures || [],
    },
  });
}

async function checkFirebaseDataIntegrity({ offline = false, timeoutMs = 8000 } = {}) {
  if (offline) {
    return createCheck({
      key: "firebase-data-integrity",
      label: "Firebase data integrity",
      status: "warn",
      score: 90,
      detail: "Live Firebase content integrity probe skipped in offline mode.",
      nextAction: "Run npm run firebase:integrity:strict before release.",
    });
  }

  const result = await timed(() =>
    createFirebaseDataIntegrityReport({
      env: process.env,
      sampleLimit: Number(process.env.ALTFT_RELEASE_DOCTOR_FIREBASE_INTEGRITY_LIMIT || 10),
      strict: true,
      timeoutMs,
    }),
  );

  if (!result.ok) {
    return createCheck({
      key: "firebase-data-integrity",
      label: "Firebase data integrity",
      status: "block",
      score: 0,
      detail: result.error?.message || "Firebase data integrity report failed.",
      nextAction: "Run npm run firebase:integrity:strict and fix invalid public content fields.",
      durationMs: result.durationMs,
    });
  }

  const report = result.value;
  const score = Number(report.score || 0);
  const failures = report.failures || [];
  const warnings = report.warnings || [];
  const status = failures.length ? "block" : warnings.length || score < 100 ? "warn" : "pass";
  const passingChecks = Array.isArray(report.checks)
    ? report.checks.filter((check) => check.ok).length
    : Number(report.passingChecks || 0);
  const totalChecks = Array.isArray(report.checks)
    ? report.checks.length
    : Number(report.totalChecks || 0);

  return createCheck({
    key: "firebase-data-integrity",
    label: "Firebase data integrity",
    status,
    score,
    detail: `${passingChecks}/${totalChecks} sampled content checks passing; ${failures.length} failures, ${warnings.length} warnings.`,
    nextAction: status === "pass" ? "" : "Run npm run firebase:integrity:strict and clean sampled content warnings.",
    durationMs: result.durationMs,
    meta: {
      projectId: report.projectId,
      sampleLimit: report.sampleLimit,
      failures,
      warnings,
    },
  });
}

async function checkPerformanceBudgetReport() {
  const result = await timed(() => readJson("altftoolwebadmin/src/data/performanceBudgetReport.json"));

  if (!result.ok) {
    return createCheck({
      key: "performance-budget",
      label: "Performance budget",
      status: "block",
      score: 0,
      detail: result.error?.message || "Performance budget report could not be read.",
      nextAction: "Run npm run build && npm run performance:budget:report.",
      durationMs: result.durationMs,
    });
  }

  const report = result.value;
  const failures = report.failures || [];
  const warnings = report.warnings || [];
  const score = Number(report.score || 0);
  const status = failures.length ? "block" : warnings.length || score < 100 ? "warn" : "pass";

  return createCheck({
    key: "performance-budget",
    label: "Performance budget",
    status,
    score,
    detail: `${report.totals?.publicImages || 0} public images, ${report.totals?.dynamicToolImports || 0} lazy tool imports, ${report.totals?.directToolImportFiles || 0} eager tool imports.`,
    nextAction: status === "pass" ? "" : "Run npm run build && npm run performance:budget:report, then fix bundle/media budget warnings.",
    durationMs: result.durationMs,
    meta: {
      generatedAt: report.generatedAt,
      failures,
      warnings,
      totals: report.totals || {},
    },
  });
}

function checkVercelReadiness({ requireToken = false } = {}) {
  const report = createVercelDeployReadinessReport({
    env: process.env,
    cwd: root,
  });
  const present = report.results.reduce((sum, result) => sum + result.present.length, 0);
  const missing = report.results.reduce((sum, result) => sum + result.missing.length, 0);
  const total = present + missing;
  const missingSecrets = report.results.flatMap((result) =>
    result.missing.map((item) => ({
      target: result.name,
      displayName: item.displayName,
      names: item.names,
    })),
  );
  const linkedProjects = report.results.filter((result) => result.projectLink).length;
  const onlyTokenMissing =
    missingSecrets.length > 0 &&
    missingSecrets.every((secret) => (secret.names || []).some((name) => name === "VERCEL_TOKEN" || name === "VERCEL_TOKEN_FILE"));
  const tokenOnlyWarning = linkedProjects === report.results.length && onlyTokenMissing && !requireToken;
  const status = report.ok ? "pass" : tokenOnlyWarning ? "warn" : "block";

  return createCheck({
    key: "vercel-readiness",
    label: "Vercel web/admin readiness",
    status,
    score: total ? (present / total) * 100 : 0,
    detail: report.ok
      ? "Web and admin Vercel deploy values are configured."
      : tokenOnlyWarning
        ? "Web and admin projects are linked; secure VERCEL_TOKEN is still needed for CLI/CI deploys."
        : requireToken && onlyTokenMissing
          ? "Web and admin projects are linked, but this release gate requires VERCEL_TOKEN or VERCEL_TOKEN_FILE."
        : `${missingSecrets.length} Vercel deploy value(s) missing.`,
    nextAction: report.ok
      ? ""
      : requireToken && onlyTokenMissing
        ? "Set VERCEL_TOKEN or VERCEL_TOKEN_FILE in the secure CI/deploy environment, then rerun release doctor."
        : "Set VERCEL_TOKEN or VERCEL_TOKEN_FILE in a secure shell/CI secret before manual deploy commands.",
    meta: {
      linkedProjects,
      requireToken,
      missing: [...new Set(missingSecrets.map((secret) => secret.displayName))],
      projects: report.results.map((result) => result.projectLink?.projectName).filter(Boolean),
    },
  });
}

async function checkProductionLinks({ offline = false, timeoutMs = 10000 } = {}) {
  const baseUrl = String(
    process.env.ALTFT_LINK_CHECK_URL ||
      process.env.ALTFT_MONITOR_WEB_URL ||
      process.env.ALTFT_RELEASE_DOCTOR_WEB_URL ||
      "https://altftool.com",
  ).replace(/\/+$/, "");

  if (offline) {
    return createCheck({
      key: "production-links",
      label: "Production links and images",
      status: "warn",
      score: 90,
      detail: `Production surface link probe skipped for ${baseUrl}.`,
      nextAction: "Run npm run monitor:links:strict before release.",
      meta: { baseUrl },
    });
  }

  const result = await timed(() =>
    buildProductionSurfaceLinkReport({
      baseUrl,
      imageLimitPerPage: Number(process.env.ALTFT_RELEASE_DOCTOR_LINK_IMAGE_LIMIT || 8),
      limit: Number(process.env.ALTFT_RELEASE_DOCTOR_LINK_PAGE_LIMIT || 12),
      linkLimitPerPage: Number(process.env.ALTFT_RELEASE_DOCTOR_LINK_LIMIT || 16),
      pageConcurrency: 3,
      strict: true,
      targetConcurrency: 4,
      timeoutMs,
    }),
  );

  if (!result.ok) {
    return createCheck({
      key: "production-links",
      label: "Production links and images",
      status: "block",
      score: 0,
      detail: result.error?.message || "Production surface link report failed.",
      nextAction: "Run npm run monitor:links:strict and fix broken production routes, links, or images.",
      durationMs: result.durationMs,
      meta: { baseUrl },
    });
  }

  const report = result.value;
  const failures = report.failures || [];
  const warnings = report.warnings || [];
  const status = failures.length ? "block" : warnings.length ? "warn" : "pass";

  return createCheck({
    key: "production-links",
    label: "Production links and images",
    status,
    score: report.score || 0,
    detail: `${report.totals?.pages || 0} pages, ${report.totals?.linksChecked || 0} links, ${report.totals?.imagesChecked || 0} images checked.`,
    nextAction: status === "pass" ? "" : "Run npm run monitor:links:strict and fix broken links/images or metadata warnings.",
    durationMs: result.durationMs,
    meta: {
      baseUrl,
      failures: failures.slice(0, 10),
      warnings: warnings.slice(0, 10),
      notices: report.totals?.notices || 0,
    },
  });
}

async function checkProductionFreshness({ offline = false, timeoutMs = 5000 } = {}) {
  const baseUrl = String(
    process.env.ALTFT_MONITOR_WEB_URL ||
      process.env.ALTFT_RELEASE_DOCTOR_WEB_URL ||
      "https://altftool.com",
  ).replace(/\/+$/, "");
  const healthUrl = `${baseUrl}/api/health`;

  if (offline) {
    return createCheck({
      key: "production-freshness",
      label: "Production freshness",
      status: "warn",
      score: 90,
      detail: `Production health probe skipped for ${healthUrl}.`,
      nextAction: "Run npm run release:doctor without --offline before release.",
      meta: { healthUrl },
    });
  }

  const result = await timed(async () => {
    const response = await withTimeout(fetch(healthUrl, { cache: "no-store" }), timeoutMs, "Production health");
    const payload = await response.json();
    return { response, payload };
  });

  if (!result.ok) {
    return createCheck({
      key: "production-freshness",
      label: "Production freshness",
      status: "block",
      score: 0,
      detail: result.error?.message || "Production /api/health could not be read.",
      nextAction: "Deploy or fix the public /api/health endpoint, then rerun release doctor.",
      durationMs: result.durationMs,
      meta: { healthUrl },
    });
  }

  const { response, payload } = result.value;
  const score = Number(payload?.overall?.score || 0);
  const healthyStatus = ["healthy", "watch"].includes(payload?.overall?.status);
  const status = response.ok && healthyStatus && score >= 80 ? "pass" : response.ok && score >= 60 ? "warn" : "block";

  return createCheck({
    key: "production-freshness",
    label: "Production freshness",
    status,
    score,
    detail: `Public health ${response.status}; status ${payload?.overall?.status || "unknown"}; score ${score}.`,
    nextAction: status === "pass" ? "" : "Deploy the latest web build and confirm public /api/health is fresh.",
    durationMs: result.durationMs,
    meta: {
      healthUrl,
      commit: payload?.release?.commitSha?.slice?.(0, 8) || null,
    },
  });
}

function printHuman(report) {
  const counts = report.summary.counts;
  const statusLabel = report.status.replace(/-/g, " ").toUpperCase();

  console.log("AltFTool release doctor");
  console.log(`Status: ${statusLabel}`);
  console.log(`Summary: ${counts.pass} pass, ${counts.warn} warn, ${counts.block} block`);
  console.log(`Duration: ${(report.durationMs / 1000).toFixed(1)}s`);

  for (const check of report.checks) {
    const label = check.status.toUpperCase().padEnd(5, " ");
    console.log(`\n[${label}] ${check.label} (${check.score}/100)`);
    console.log(`  ${check.detail}`);
    if (check.nextAction) console.log(`  Next: ${check.nextAction}`);
  }
}

function statusIcon(status) {
  if (status === "pass") return "PASS";
  if (status === "warn") return "WARN";
  return "BLOCK";
}

function escapeMarkdownCell(value = "") {
  return String(value || "")
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function renderMarkdownReport(report) {
  const counts = report.summary.counts;
  const actionChecks = report.checks.filter((check) => check.status !== "pass");
  const blockingChecks = report.summary.blockingChecks || [];
  const warningChecks = report.summary.warningChecks || [];
  const mode = [
    report.strict ? "strict" : "standard",
    report.offline ? "offline" : "live",
  ].join(" / ");

  const lines = [
    "## AltFTool Release Doctor",
    "",
    `**Status:** ${report.status}`,
    `**Mode:** ${mode}`,
    `**Generated:** ${report.generatedAt}`,
    `**Duration:** ${(report.durationMs / 1000).toFixed(1)}s`,
    "",
    `**Summary:** ${counts.pass} pass, ${counts.warn} warn, ${counts.block} block`,
    "",
    "| Check | Status | Score | Detail | Next command |",
    "| --- | --- | ---: | --- | --- |",
    ...report.checks.map((check) =>
      `| ${escapeMarkdownCell(check.label)} | ${statusIcon(check.status)} | ${check.score}/100 | ${escapeMarkdownCell(check.detail)} | ${check.command ? `\`${escapeMarkdownCell(check.command)}\`` : ""} |`,
    ),
    "",
  ];

  if (blockingChecks.length || warningChecks.length) {
    lines.push("### Attention Needed", "");

    if (blockingChecks.length) {
      lines.push(`**Blocking:** ${blockingChecks.map((label) => `\`${escapeMarkdownCell(label)}\``).join(", ")}`, "");
    }

    if (warningChecks.length) {
      lines.push(`**Warnings:** ${warningChecks.map((label) => `\`${escapeMarkdownCell(label)}\``).join(", ")}`, "");
    }

    if (actionChecks.length) {
      lines.push("| Check | Next action | Command |", "| --- | --- | --- |");
      for (const check of actionChecks) {
        lines.push(
          `| ${escapeMarkdownCell(check.label)} | ${escapeMarkdownCell(check.nextAction || check.detail)} | ${check.command ? `\`${escapeMarkdownCell(check.command)}\`` : ""} |`,
        );
      }
      lines.push("");
    }
  } else {
    lines.push("### Attention Needed", "", "No release doctor actions are open.", "");
  }

  return `${lines.join("\n")}\n`;
}

function writeStepSummary(report) {
  const target = process.env.GITHUB_STEP_SUMMARY;
  if (!target) return;
  fs.writeFileSync(target, renderMarkdownReport(report), { flag: "a" });
}

async function main() {
  loadLocalEnv();

  const offline = hasFlag("--offline");
  const strict = hasFlag("--strict");
  const json = hasFlag("--json");
  const outputPath = argValue("--output", "");
  const markdownOutputPath = argValue(
    "--output-md",
    argValue("--output-markdown", process.env.ALTFT_RELEASE_DOCTOR_MARKDOWN_PATH || ""),
  );
  const timeoutMs = Number(argValue("--timeout-ms", process.env.ALTFT_RELEASE_DOCTOR_TIMEOUT_MS || "8000"));
  const skipFirebaseAdmin = hasFlag("--no-firebase-admin");
  const skipFirebaseLive = hasFlag("--no-firebase-live");
  const skipFirebaseIntegrity = hasFlag("--no-firebase-integrity");
  const skipPerformance = hasFlag("--no-performance");
  const skipProductionLinks = hasFlag("--no-links");
  const skipProduction = hasFlag("--no-production");
  const requireVercelToken =
    hasFlag("--require-vercel-token") ||
    hasFlag("--require-ci-secrets") ||
    envFlag("ALTFT_RELEASE_DOCTOR_REQUIRE_VERCEL_TOKEN");

  const checks = [
    await checkSavedHealthManifest(),
    await checkRouteQaReport(),
    await checkBlogContentReport(),
    skipFirebaseAdmin
      ? createCheck({
          key: "firebase-admin",
          label: "Firebase Admin SDK",
          status: "warn",
          score: 90,
          detail: "Firebase Admin probe skipped by --no-firebase-admin.",
          nextAction: "Run without --no-firebase-admin before release.",
        })
      : await checkFirebaseAdmin({ offline, timeoutMs }),
    skipFirebaseLive
      ? createCheck({
          key: "firebase-live-data",
          label: "Firebase public live data",
          status: "warn",
          score: 90,
          detail: "Firebase live-data probe skipped by --no-firebase-live.",
          nextAction: "Run without --no-firebase-live before release.",
      })
      : await checkFirebaseLiveData({ offline, timeoutMs }),
    skipFirebaseIntegrity
      ? createCheck({
          key: "firebase-data-integrity",
          label: "Firebase data integrity",
          status: "warn",
          score: 90,
          detail: "Firebase data-integrity probe skipped by --no-firebase-integrity.",
          nextAction: "Run without --no-firebase-integrity before release.",
        })
      : await checkFirebaseDataIntegrity({ offline, timeoutMs }),
    skipPerformance
      ? createCheck({
          key: "performance-budget",
          label: "Performance budget",
          status: "warn",
          score: 90,
          detail: "Performance budget report skipped by --no-performance.",
          nextAction: "Run without --no-performance before release.",
        })
      : await checkPerformanceBudgetReport(),
    checkVercelReadiness({ requireToken: requireVercelToken }),
    skipProductionLinks
      ? createCheck({
          key: "production-links",
          label: "Production links and images",
          status: "warn",
          score: 90,
          detail: "Production link/image probe skipped by --no-links.",
          nextAction: "Run without --no-links before release.",
        })
      : await checkProductionLinks({ offline, timeoutMs }),
    skipProduction
      ? createCheck({
          key: "production-freshness",
          label: "Production freshness",
          status: "warn",
          score: 90,
          detail: "Production health probe skipped by --no-production.",
          nextAction: "Run without --no-production before release.",
        })
      : await checkProductionFreshness({ offline, timeoutMs }),
  ];
  const status = finalStatus(checks, strict);
  const report = {
    generatedAt: new Date().toISOString(),
    status,
    strict,
    offline,
    durationMs: Math.round(performance.now() - startedAt),
    summary: {
      counts: summarizeCounts(checks),
      blockingChecks: checks.filter((check) => check.status === "block").map((check) => check.label),
      warningChecks: checks.filter((check) => check.status === "warn").map((check) => check.label),
    },
    checks,
  };

  if (outputPath) {
    const absoluteOutputPath = path.resolve(root, outputPath);
    await fsp.mkdir(path.dirname(absoluteOutputPath), { recursive: true });
    await fsp.writeFile(absoluteOutputPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  if (markdownOutputPath) {
    const absoluteMarkdownOutputPath = path.resolve(root, markdownOutputPath);
    await fsp.mkdir(path.dirname(absoluteMarkdownOutputPath), { recursive: true });
    await fsp.writeFile(absoluteMarkdownOutputPath, renderMarkdownReport(report));
  }

  if (json) console.log(JSON.stringify(report, null, 2));
  else printHuman(report);

  writeStepSummary(report);

  if (status === "blocked") process.exit(1);
}

main().catch((error) => {
  console.error(`Release doctor failed: ${error?.message || error}`);
  process.exit(1);
});
