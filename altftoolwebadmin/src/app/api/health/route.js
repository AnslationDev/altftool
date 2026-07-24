import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { getAdminDb, getFirebaseAdminConfigStatus } from "@/lib/firebaseAdmin";
import { createFirebaseDataIntegrityReport } from "@altftool/core/firebaseDataIntegrity";
import { createFirebaseLiveDataReport } from "@altftool/core/firebaseLiveData";
import { createVercelDeployReadinessReport } from "@altftool/core/deployReadiness";
import healthManifest from "@/data/healthManifest.json";
import routeQaReport from "@/data/routeQaReport.json";
import routeQualityReport from "@/data/routeQualityReport.json";
import blogContentHealthReport from "@/data/blogContentHealthReport.json";
import performanceBudgetReport from "@/data/performanceBudgetReport.json";
import productionLinksReport from "@/data/productionLinksReport.json";
import releaseDoctorReport from "@/data/releaseDoctorReport.json";
import releaseHistoryReport from "@/data/releaseHistoryReport.json";

export const dynamic = "force-dynamic";

const HEALTH_CACHE_MS = Number(process.env.ALTFT_ADMIN_HEALTH_CACHE_MS || 30_000);
const HEALTH_RATE_LIMIT = Number(
  process.env.ALTFT_ADMIN_HEALTH_RATE_LIMIT || 30,
);
const cachedHealthSnapshots = {
  lite: null,
  live: null,
};
const pendingHealthSnapshots = {
  lite: null,
  live: null,
};
const PRODUCTION_MONITOR_TIMEOUT_MS = Number(
  process.env.ALTFT_PRODUCTION_MONITOR_TIMEOUT_MS || 6000,
);
const PRODUCTION_MONITOR_SLOW_MS = Number(
  process.env.ALTFT_PRODUCTION_MONITOR_SLOW_MS || 2500,
);
const PRODUCTION_ROUTE_PROBES = [
  { key: "home", label: "Home", path: "/", type: "html" },
  { key: "tools", label: "Tools catalog", path: "/tools/all", type: "html" },
  { key: "blogs", label: "Blog catalog", path: "/blogs", type: "html" },
  { key: "automation", label: "Automation library", path: "/n8n", type: "html" },
  { key: "docs", label: "Documentation", path: "/docs", type: "html" },
  { key: "sitemap", label: "XML sitemap", path: "/sitemap.xml", type: "xml" },
  { key: "robots", label: "Robots policy", path: "/robots.txt", type: "text" },
  { key: "health", label: "Public health API", path: "/api/health", type: "health" },
];
const PRODUCTION_ERROR_PATTERNS = [
  /Application error/i,
  /Unhandled Runtime Error/i,
  /NEXT_HTTP_ERROR_FALLBACK/i,
  /This page could not be found/i,
];

function healthJson(payload, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Vary", "Authorization");
  return NextResponse.json(payload, { ...init, headers });
}

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function weightedScore(signals = []) {
  const active = signals.filter(
    ([score, weight]) => Number.isFinite(Number(score)) && Number(weight) > 0,
  );
  const totalWeight = active.reduce(
    (sum, [, weight]) => sum + Number(weight),
    0,
  );
  if (!totalWeight) return 0;
  return clampScore(
    active.reduce(
      (sum, [score, weight]) => sum + Number(score) * Number(weight),
      0,
    ) / totalWeight,
  );
}

function normalizeUrl(value = "") {
  return String(value || "").trim().replace(/\/+$/, "");
}

function appendPath(baseUrl, suffix) {
  if (!baseUrl) return "";
  return `${baseUrl}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
}

function currentCommitSha() {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    null
  );
}

function getReleaseDoctorCheck(key) {
  return (releaseDoctorReport?.checks || []).find((check) => check.key === key) || null;
}

function createLiteCheck({ key, label, detail, ok, source = "releaseDoctorReport" }) {
  return {
    key,
    label,
    detail,
    ok: Boolean(ok),
    skipped: true,
    source,
  };
}

async function buildFirebaseAdminReadiness({ lite = false } = {}) {
  const config = getFirebaseAdminConfigStatus();
  const checks = [
    {
      key: "projectId",
      label: "Project ID",
      detail: config.projectId || "FIREBASE_PROJECT_ID is not configured.",
      ok: !config.missing.includes("FIREBASE_PROJECT_ID"),
    },
    {
      key: "clientEmail",
      label: "Service-account email",
      detail: config.clientEmailConfigured
        ? "Service-account email is configured."
        : "FIREBASE_CLIENT_EMAIL is not configured.",
      ok:
        config.clientEmailConfigured &&
        !config.invalid.some((message) => message.includes("FIREBASE_CLIENT_EMAIL")),
    },
    {
      key: "privateKey",
      label: "Private key",
      detail: config.privateKeyConfigured
        ? "Private key is configured and never returned by this endpoint."
        : "FIREBASE_PRIVATE_KEY is not configured.",
      ok:
        config.privateKeyConfigured &&
        config.privateKeyLooksComplete &&
        !config.invalid.some((message) => message.includes("FIREBASE_PRIVATE_KEY")),
    },
  ];
  const firestoreProbe = {
    key: "firestoreRead",
    label: "Firestore Admin SDK read",
    detail: config.ok ? "Reading admins collection." : "Skipped until Admin SDK credentials are ready.",
    ok: false,
    skipped: !config.ok,
  };

  if (config.ok && lite) {
    firestoreProbe.ok = true;
    firestoreProbe.skipped = true;
    firestoreProbe.detail = "Skipped in lite mode; Admin SDK config shape looks ready.";
  } else if (config.ok) {
    try {
      await getAdminDb().collection("admins").limit(1).get();
      firestoreProbe.ok = true;
      firestoreProbe.skipped = false;
      firestoreProbe.detail = "Admin SDK can read Firestore.";
    } catch (error) {
      firestoreProbe.error = error?.message || "Firestore read failed.";
      firestoreProbe.detail = firestoreProbe.error;
      firestoreProbe.skipped = false;
    }
  }

  const allChecks = [...checks, firestoreProbe];
  const score = clampScore((allChecks.filter((check) => check.ok).length / allChecks.length) * 100);

  return {
    score,
    status: lite && config.ok ? "lite-ready" : config.ok && firestoreProbe.ok ? "ready" : config.ok ? "read-failed" : "needs-config",
    lite,
    skipped: lite,
    projectId: config.projectId,
    adminSdkReady: config.ok,
    firestoreReadable: firestoreProbe.ok,
    missing: config.missing,
    invalid: config.invalid,
    checks: allChecks,
  };
}

async function buildFirebaseLiveDataReadiness({ lite = false } = {}) {
  if (lite) {
    const savedCheck = getReleaseDoctorCheck("firebase-live-data");
    const ok = savedCheck?.status === "pass";

    return {
      generatedAt: releaseDoctorReport?.generatedAt || new Date().toISOString(),
      ok,
      status: ok ? "lite-ready" : "lite-watch",
      score: clampScore(savedCheck?.score || (ok ? 100 : 75)),
      lite: true,
      skipped: true,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36",
      checks: [
        createLiteCheck({
          key: "firebaseLiveDataLite",
          label: "Saved Firebase live-data gate",
          detail: savedCheck?.detail || "Live Firestore content probe skipped in lite mode.",
          ok,
        }),
      ],
      sections: {},
      failures: ok ? [] : [savedCheck?.detail || "Live Firestore content probe needs a live refresh."],
      passingChecks: ok ? 1 : 0,
      totalChecks: 1,
    };
  }

  try {
    const report = await createFirebaseLiveDataReport({
      env: process.env,
      timeoutMs: 4500,
    });

    return {
      ...report,
      passingChecks: report.checks.filter((check) => check.ok).length,
      totalChecks: report.checks.length,
    };
  } catch (error) {
    const message = error?.name === "AbortError" ? "Timed out." : error?.message || "Firebase live data check failed.";

    return {
      generatedAt: new Date().toISOString(),
      ok: false,
      status: "unavailable",
      score: 0,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36",
      checks: [
        {
          key: "firebaseLiveData",
          label: "Firebase live data",
          detail: message,
          error: message,
          ok: false,
        },
      ],
      sections: {},
      failures: [message],
      passingChecks: 0,
      totalChecks: 1,
    };
  }
}

async function buildFirebaseDataIntegrityReadiness({ lite = false } = {}) {
  if (lite) {
    const savedCheck = getReleaseDoctorCheck("firebase-data-integrity");
    const ok = savedCheck?.status === "pass";

    return {
      generatedAt: releaseDoctorReport?.generatedAt || new Date().toISOString(),
      ok,
      status: ok ? "lite-ready" : "lite-watch",
      score: clampScore(savedCheck?.score || (ok ? 100 : 75)),
      strict: true,
      lite: true,
      skipped: true,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36",
      sampleLimit: Number(process.env.ALTFT_ADMIN_FIREBASE_INTEGRITY_SAMPLE_LIMIT || 10),
      checks: [
        createLiteCheck({
          key: "firebaseDataIntegrityLite",
          label: "Saved Firebase integrity gate",
          detail: savedCheck?.detail || "Live Firebase integrity probe skipped in lite mode.",
          ok,
        }),
      ],
      sections: {},
      failures: ok ? [] : [{ section: "firebaseDataIntegrity", message: savedCheck?.detail || "Firebase integrity needs a live refresh." }],
      warnings: [],
      passingChecks: ok ? 1 : 0,
      totalChecks: 1,
      warningCount: 0,
      failureCount: ok ? 0 : 1,
    };
  }

  try {
    const report = await createFirebaseDataIntegrityReport({
      env: process.env,
      sampleLimit: Number(process.env.ALTFT_ADMIN_FIREBASE_INTEGRITY_SAMPLE_LIMIT || 10),
      strict: true,
      timeoutMs: 4500,
    });

    return {
      ...report,
      passingChecks: report.checks.filter((check) => check.ok).length,
      totalChecks: report.checks.length,
      warningCount: report.warnings.length,
      failureCount: report.failures.length,
    };
  } catch (error) {
    const message = error?.name === "AbortError" ? "Timed out." : error?.message || "Firebase data integrity check failed.";

    return {
      generatedAt: new Date().toISOString(),
      ok: false,
      status: "unavailable",
      score: 0,
      strict: true,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36",
      sampleLimit: Number(process.env.ALTFT_ADMIN_FIREBASE_INTEGRITY_SAMPLE_LIMIT || 10),
      checks: [
        {
          key: "firebaseDataIntegrity",
          label: "Firebase data integrity",
          detail: message,
          error: message,
          ok: false,
        },
      ],
      sections: {},
      failures: [{ section: "firebaseDataIntegrity", message }],
      warnings: [],
      passingChecks: 0,
      totalChecks: 1,
      warningCount: 0,
      failureCount: 1,
    };
  }
}

function buildPerformanceBudgetReadiness() {
  const report = performanceBudgetReport || {};
  const failures = report.failures || [];
  const warnings = report.warnings || [];
  const totals = report.totals || {};
  const apps = report.apps || [];
  const checks = [
    {
      key: "saved-report",
      label: "Saved performance report",
      ok: Boolean(report.generatedAt),
      detail: report.generatedAt ? `Generated ${report.generatedAt}.` : "Run npm run performance:budget:strict.",
    },
    {
      key: "build-output",
      label: "Web and admin build output",
      ok: apps.length > 0 && apps.every((app) => app.buildPresent),
      detail: `${apps.filter((app) => app.buildPresent).length}/${apps.length || 2} build outputs available.`,
    },
    {
      key: "bundle-budget",
      label: "JS/CSS bundle budgets",
      ok: failures.length === 0,
      detail: `${failures.length} failure${failures.length === 1 ? "" : "s"}, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}.`,
    },
    {
      key: "tool-lazy-boundary",
      label: "Tool lazy-load boundary",
      ok: Number(totals.directToolImportFiles || 0) === 0,
      detail: `${totals.dynamicToolImports || 0} dynamic tool imports, ${totals.directToolImportFiles || 0} eager app imports.`,
    },
  ];

  return {
    ...report,
    ok: Boolean(report.ok) && failures.length === 0 && warnings.length === 0,
    status: failures.length ? "blocked" : warnings.length ? "watch" : report.status || "unknown",
    score: clampScore(report.score || 0),
    checks,
    command: "npm run performance:budget:strict",
    artifactCommand: "npm run performance:budget:strict -- --output performance-budget.json --output-md performance-budget.md",
  };
}

function buildRouteQualityReadiness() {
  const report = routeQualityReport || {};
  const totals = report.totals || {};
  const hasReport = Boolean(report.generatedAt);
  const checks = [
    {
      key: "savedReport",
      label: "Rendered route-quality report",
      detail: hasReport
        ? `Generated ${report.generatedAt}.`
        : "Run npm run seo:route-quality:report after the web build.",
      ok: hasReport,
    },
    {
      key: "indexConflicts",
      label: "Noindex and sitemap alignment",
      detail: `${totals.indexConflicts || 0} noindex route${totals.indexConflicts === 1 ? "" : "s"} listed in sitemap.`,
      ok: Number(totals.indexConflicts || 0) === 0,
    },
    {
      key: "canonicalCoverage",
      label: "Canonical sitemap coverage",
      detail: `${totals.sitemapCovered || 0}/${totals.indexable || 0} indexable canonical targets covered.`,
      ok: Number(totals.missingCanonicalTargets || 0) === 0,
    },
    {
      key: "routeMetadata",
      label: "Rendered metadata quality",
      detail: `${totals.routesWithIssues || 0} routes with blocking metadata or index-control issues.`,
      ok: Number(totals.routesWithIssues || 0) === 0,
    },
    {
      key: "routeAdvisories",
      label: "Rendered content quality",
      detail: `${totals.routesWithAdvisories || 0} route${totals.routesWithAdvisories === 1 ? "" : "s"} with title, description, H1, or structured-data advisories.`,
      ok: Number(totals.routesWithAdvisories || 0) === 0,
    },
  ];
  const score = hasReport
    ? clampScore(report.score || 0)
    : 0;

  return {
    ...report,
    ok: hasReport && checks.every((check) => check.ok),
    status: !hasReport
      ? "not-run"
      : checks.some((check) => !check.ok)
        ? "attention"
        : Number(totals.routesWithAdvisories || 0) > 0
          ? "watch"
          : "healthy",
    score,
    checks,
    command: "npm run seo:route-quality:report",
    strictCommand: "npm run seo:route-quality:strict",
    indexControlCommand: "npm run seo:index-control",
  };
}

function buildProductionLinksReadiness() {
  const report = productionLinksReport || {};
  const totals = report.totals || {};
  const pages = Array.isArray(report.pages) ? report.pages : [];
  const failures = Array.isArray(report.failures) ? report.failures : [];
  const warnings = Array.isArray(report.warnings) ? report.warnings : [];
  const notices = Array.isArray(report.notices) ? report.notices : [];
  const checks = [
    {
      key: "saved-report",
      label: "Saved production link report",
      ok: Boolean(report.generatedAt),
      detail: report.generatedAt ? `Generated ${report.generatedAt}.` : "Run npm run monitor:links:report.",
    },
    {
      key: "page-sample",
      label: "Production pages sampled",
      ok: Number(totals.pages || pages.length || 0) > 0,
      detail: `${totals.pages || pages.length || 0} production pages checked from ${report.baseUrl || "production"}.`,
    },
    {
      key: "links-images",
      label: "Links and images checked",
      ok: Number(totals.linksChecked || 0) > 0 || Number(totals.imagesChecked || 0) > 0,
      detail: `${totals.linksChecked || 0} links and ${totals.imagesChecked || 0} images probed.`,
    },
    {
      key: "broken-surface",
      label: "Broken production surface",
      ok: failures.length === 0,
      detail: `${failures.length} broken page, link, or image issue${failures.length === 1 ? "" : "s"}.`,
    },
    {
      key: "strict-warnings",
      label: "Strict SEO warnings",
      ok: warnings.length === 0,
      detail: `${warnings.length} warning${warnings.length === 1 ? "" : "s"} from metadata, sitemap, or page probes.`,
    },
  ];
  const ok = Boolean(report.generatedAt) && failures.length === 0 && warnings.length === 0;

  return {
    ...report,
    ok,
    status: failures.length ? "blocked" : warnings.length ? "watch" : report.status || "unknown",
    score: clampScore(report.score || (ok ? 100 : 0)),
    checks,
    totals,
    pages,
    failures,
    warnings,
    notices,
    command: "npm run monitor:links:strict",
    artifactCommand: "npm run monitor:links:report -- --output-md production-links-report.md",
  };
}

function buildReleaseDoctorArtifactReadiness() {
  const report = releaseDoctorReport || {};
  const checks = Array.isArray(report.checks) ? report.checks : [];
  const counts = report.summary?.counts || checks.reduce(
    (summary, check) => {
      if (check.status === "pass") summary.pass += 1;
      if (check.status === "warn") summary.warn += 1;
      if (check.status === "block") summary.block += 1;
      return summary;
    },
    { pass: 0, warn: 0, block: 0 },
  );
  const blockingChecks = report.summary?.blockingChecks || checks.filter((check) => check.status === "block").map((check) => check.label);
  const warningChecks = report.summary?.warningChecks || checks.filter((check) => check.status === "warn").map((check) => check.label);
  const score = checks.length
    ? clampScore(checks.reduce((sum, check) => sum + Number(check.score || 0), 0) / checks.length)
    : 0;
  const qualityChecks = [
    {
      key: "saved-report",
      label: "Saved release doctor report",
      ok: Boolean(report.generatedAt),
      detail: report.generatedAt ? `Generated ${report.generatedAt}.` : "Run npm run release:doctor:report.",
    },
    {
      key: "blocking-checks",
      label: "Blocking release checks",
      ok: Number(counts.block || 0) === 0,
      detail: `${counts.block || 0} blocking check${counts.block === 1 ? "" : "s"}.`,
    },
    {
      key: "warning-checks",
      label: "Warning release checks",
      ok: Number(counts.warn || 0) === 0,
      detail: `${counts.warn || 0} warning check${counts.warn === 1 ? "" : "s"}.`,
    },
    {
      key: "production-links",
      label: "Production link gate included",
      ok: checks.some((check) => check.key === "production-links"),
      detail: "Release doctor should include production links and images.",
    },
  ];
  const status = report.status || (counts.block ? "blocked" : counts.warn ? "ready-with-warnings" : report.generatedAt ? "ready" : "unknown");
  const ok = Boolean(report.generatedAt) && status === "ready";

  return {
    generatedAt: report.generatedAt || null,
    status,
    ok,
    strict: Boolean(report.strict),
    offline: Boolean(report.offline),
    score,
    durationMs: Number(report.durationMs || 0),
    summary: {
      counts,
      blockingChecks,
      warningChecks,
    },
    checks,
    qualityChecks,
    command: "npm run release:doctor",
    strictCommand: "npm run release:doctor:strict",
    artifactCommand: "npm run release:doctor:report",
  };
}

const RELEASE_HISTORY_METRICS = [
  { key: "overall", label: "Overall Health" },
  { key: "release-doctor", label: "Release Doctor" },
  { key: "runtime-quality", label: "Runtime Quality" },
  { key: "production-links", label: "Production Links" },
  { key: "performance-budget", label: "Performance Budget" },
  { key: "route-qa", label: "Route QA" },
  { key: "firebase-live", label: "Firebase Live Data" },
  { key: "firebase-integrity", label: "Firebase Integrity" },
  { key: "vercel-readiness", label: "Vercel Readiness" },
  { key: "production-freshness", label: "Production Freshness" },
];

function normalizeReleaseHistoryStatus(status, score = 0) {
  const value = String(status || "").toLowerCase();
  if (["blocked", "block", "failed", "error", "attention"].includes(value)) return "blocked";
  if (["ready-with-warnings", "watch", "warn", "warning", "linked-needs-token"].includes(value)) return "watch";
  if (["ready", "clean", "fresh", "pass", "healthy"].includes(value)) return "ready";
  return score >= 90 ? "ready" : score >= 75 ? "watch" : "blocked";
}

function createReleaseHistoryMetric({ key, label, score, status, generatedAt, detail = "" }) {
  const safeScore = clampScore(Number(score || 0));

  return {
    key,
    label,
    score: safeScore,
    status: normalizeReleaseHistoryStatus(status, safeScore),
    generatedAt: generatedAt || null,
    detail,
  };
}

function createCurrentReleaseHistoryEntry({
  generatedAt,
  overallScore,
  overallStatus,
  releaseDoctor,
  runtimeQuality,
  productionLinks,
  performanceBudget,
  routeQa,
  firebaseLiveData,
  firebaseDataIntegrity,
  deploy,
  production,
}) {
  const releaseCounts = releaseDoctor?.summary?.counts || { pass: 0, warn: 0, block: 0 };
  const deployStatus = deploy?.status || (deploy?.ok ? "ready" : "watch");

  return {
    id: `current-${generatedAt}`,
    generatedAt,
    status: normalizeReleaseHistoryStatus(overallStatus, overallScore),
    score: clampScore(overallScore),
    summary: {
      releaseDoctorStatus: releaseDoctor?.status || "unknown",
      releaseDoctorCounts: releaseCounts,
      productionLinkStatus: productionLinks?.status || "unknown",
      performanceStatus: performanceBudget?.status || "unknown",
    },
    metrics: [
      createReleaseHistoryMetric({
        key: "overall",
        label: "Overall Health",
        score: overallScore,
        status: overallStatus,
        generatedAt,
        detail: "Live admin health score from the current snapshot.",
      }),
      createReleaseHistoryMetric({
        key: "release-doctor",
        label: "Release Doctor",
        score: releaseDoctor?.score,
        status: releaseDoctor?.status,
        generatedAt: releaseDoctor?.sources?.routeQaCheckedAt || generatedAt,
        detail: `${releaseCounts.pass || 0} pass, ${releaseCounts.warn || 0} warn, ${releaseCounts.block || 0} block.`,
      }),
      createReleaseHistoryMetric({
        key: "runtime-quality",
        label: "Runtime Quality",
        score: runtimeQuality?.score,
        status: runtimeQuality?.status,
        generatedAt: runtimeQuality?.generatedAt || generatedAt,
        detail: `${runtimeQuality?.summary?.pass || 0}/${runtimeQuality?.summary?.total || 0} strict runtime gates passing.`,
      }),
      createReleaseHistoryMetric({
        key: "production-links",
        label: "Production Links",
        score: productionLinks?.score,
        status: productionLinks?.status,
        generatedAt: productionLinks?.generatedAt,
        detail: `${productionLinks?.totals?.pages || 0} pages, ${productionLinks?.totals?.linksChecked || 0} links, ${productionLinks?.totals?.imagesChecked || 0} images.`,
      }),
      createReleaseHistoryMetric({
        key: "performance-budget",
        label: "Performance Budget",
        score: performanceBudget?.score,
        status: performanceBudget?.status,
        generatedAt: performanceBudget?.generatedAt,
        detail: `${performanceBudget?.totals?.publicImages || 0} public images, ${performanceBudget?.totals?.dynamicToolImports || 0} lazy tool imports.`,
      }),
      createReleaseHistoryMetric({
        key: "route-qa",
        label: "Route QA",
        score: routeQa?.score,
        status: routeQa?.ok ? "ready" : routeQa?.totals?.failures ? "blocked" : "watch",
        generatedAt: routeQa?.checkedAt,
        detail: `${routeQa?.totals?.routes || 0} routes, ${routeQa?.totals?.failures || 0} failures, ${routeQa?.totals?.warnings || 0} warnings.`,
      }),
      createReleaseHistoryMetric({
        key: "firebase-live",
        label: "Firebase Live Data",
        score: firebaseLiveData?.score,
        status: firebaseLiveData?.status,
        generatedAt: firebaseLiveData?.generatedAt,
        detail: `${firebaseLiveData?.passingChecks || 0}/${firebaseLiveData?.totalChecks || 0} live-data checks passing.`,
      }),
      createReleaseHistoryMetric({
        key: "firebase-integrity",
        label: "Firebase Integrity",
        score: firebaseDataIntegrity?.score,
        status: firebaseDataIntegrity?.status,
        generatedAt: firebaseDataIntegrity?.generatedAt,
        detail: `${firebaseDataIntegrity?.passingChecks || 0}/${firebaseDataIntegrity?.totalChecks || 0} sampled checks passing.`,
      }),
      createReleaseHistoryMetric({
        key: "vercel-readiness",
        label: "Vercel Readiness",
        score: deploy?.score,
        status: deployStatus,
        generatedAt,
        detail: deploy?.ok ? "Web and admin deploy values are configured." : `${deploy?.missingSecrets?.length || 0} deploy value gap(s).`,
      }),
      createReleaseHistoryMetric({
        key: "production-freshness",
        label: "Production Freshness",
        score: production?.score,
        status: production?.status,
        generatedAt: production?.checkedAt || generatedAt,
        detail: production?.error || `Public health status: ${production?.status || "unknown"}.`,
      }),
    ],
  };
}

function metricFromEntry(entry, key) {
  return (entry?.metrics || []).find((metric) => metric.key === key) || null;
}

function mergeHistoryWithCurrent(entries, current) {
  const byId = new Map();

  for (const entry of entries || []) {
    if (entry?.id || entry?.generatedAt) {
      byId.set(entry.id || entry.generatedAt, entry);
    }
  }
  byId.set(current.id || current.generatedAt, current);

  return [...byId.values()]
    .sort((a, b) => new Date(a.generatedAt || 0).getTime() - new Date(b.generatedAt || 0).getTime())
    .slice(-12);
}

function buildReleaseHistoryReadiness(currentEntry) {
  const savedEntries = Array.isArray(releaseHistoryReport?.entries) ? releaseHistoryReport.entries : [];
  const timeline = mergeHistoryWithCurrent(savedEntries, currentEntry);
  const metrics = RELEASE_HISTORY_METRICS.map((definition) => {
    const points = timeline
      .map((entry) => {
        const metric = metricFromEntry(entry, definition.key);
        if (!metric) return null;
        return {
          generatedAt: entry.generatedAt,
          score: clampScore(metric.score || 0),
          status: metric.status || "unknown",
        };
      })
      .filter(Boolean);
    const current = points[points.length - 1] || {
      generatedAt: currentEntry.generatedAt,
      score: 0,
      status: "unknown",
    };
    const previous = points.length > 1 ? points[points.length - 2] : null;
    const delta = previous ? current.score - previous.score : 0;

    return {
      ...definition,
      current,
      previous,
      delta,
      trend: !previous ? "new" : delta > 0 ? "up" : delta < 0 ? "down" : "flat",
      points,
    };
  });
  const regressions = metrics.filter((metric) => metric.delta < 0);
  const warnings = metrics.filter((metric) => metric.current.status === "watch").length;
  const blockers = metrics.filter((metric) => metric.current.status === "blocked").length;
  const score = clampScore(metrics.reduce((sum, metric) => sum + metric.current.score, 0) / Math.max(metrics.length, 1));

  return {
    generatedAt: releaseHistoryReport?.generatedAt || null,
    savedEntryCount: savedEntries.length,
    timeline,
    latest: currentEntry,
    metrics,
    score,
    status: blockers ? "blocked" : regressions.length || warnings ? "watch" : "ready",
    checks: [
      {
        key: "saved-history",
        label: "Saved release history",
        ok: savedEntries.length > 0,
        detail: savedEntries.length
          ? `${savedEntries.length} saved release history point${savedEntries.length === 1 ? "" : "s"}.`
          : "Run npm run release:history:report to save the first trend point.",
      },
      {
        key: "regressions",
        label: "Score regressions",
        ok: regressions.length === 0,
        detail: `${regressions.length} metric regression${regressions.length === 1 ? "" : "s"} against the previous point.`,
      },
      {
        key: "watch-metrics",
        label: "Watch metrics",
        ok: warnings === 0 && blockers === 0,
        detail: `${warnings} watch metric${warnings === 1 ? "" : "s"}, ${blockers} blocked metric${blockers === 1 ? "" : "s"}.`,
      },
    ],
    command: "npm run release:history:report",
  };
}

function buildVercelDeployReadiness() {
  const report = createVercelDeployReadinessReport({
    env: process.env,
  });
  const totals = report.results.reduce(
    (summary, result) => {
      summary.present += result.present.length;
      summary.missing += result.missing.length;
      return summary;
    },
    { present: 0, missing: 0 },
  );
  const total = totals.present + totals.missing;
  const missingSecrets = report.results.flatMap((result) =>
    result.missing.map((item) => ({
      target: result.name,
      label: item.label,
      names: item.names,
      displayName: item.displayName,
    })),
  );
  const linkedProjects = report.results.filter((result) => result.projectLink).length;
  const onlyTokenMissing =
    missingSecrets.length > 0 &&
    missingSecrets.every((secret) => (secret.names || []).some((name) => name === "VERCEL_TOKEN" || name === "VERCEL_TOKEN_FILE"));

  return {
    ...report,
    status: report.ok ? "ready" : linkedProjects === report.results.length && onlyTokenMissing ? "linked-needs-token" : "blocked",
    score: clampScore(total ? (totals.present / total) * 100 : 0),
    linkedProjects,
    missingSecrets,
  };
}

async function fetchJsonWithTimeout(url, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startedAt = performance.now();
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await response.text();
    let payload;

    try {
      payload = JSON.parse(text);
    } catch {
      const contentType = response.headers.get("content-type") || "unknown content type";
      throw new Error(`Health endpoint returned non-JSON (${response.status}, ${contentType}).`);
    }

    return {
      response,
      payload,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function buildProductionFreshness({ lite = false } = {}) {
  const webUrl = normalizeUrl(
    process.env.ALTFT_MONITOR_WEB_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://altftool.com",
  );
  const healthUrl = appendPath(webUrl, "/api/health");
  const expectedCommit = currentCommitSha();
  const savedCheck = getReleaseDoctorCheck("production-freshness");

  if (!webUrl) {
    return {
      score: 0,
      status: "not-configured",
      url: null,
      healthUrl: null,
      expectedCommit,
      productionCommit: null,
      checks: [
        {
          key: "webUrl",
          label: "Production web URL",
          detail: "ALTFT_MONITOR_WEB_URL or NEXT_PUBLIC_SITE_URL",
          ok: false,
        },
      ],
    };
  }

  if (lite) {
    const ok = savedCheck?.status === "pass";

    return {
      score: clampScore(savedCheck?.score || (ok ? 100 : 75)),
      status: ok ? "lite-ready" : "lite-watch",
      lite: true,
      skipped: true,
      url: webUrl,
      healthUrl,
      expectedCommit,
      productionCommit: savedCheck?.meta?.commit || null,
      checkedAt: releaseDoctorReport?.generatedAt || null,
      publicHealth: {
        status: ok ? "saved-pass" : "saved-watch",
        label: ok ? "Saved release doctor pass" : "Saved release doctor warning",
      },
      checks: [
        {
          key: "webUrl",
          label: "Production web URL",
          detail: webUrl,
          ok: true,
        },
        createLiteCheck({
          key: "productionFreshnessLite",
          label: "Saved production freshness gate",
          detail: savedCheck?.detail || "Production /api/health probe skipped in lite mode.",
          ok,
        }),
      ],
    };
  }

  const checks = [
    {
      key: "webUrl",
      label: "Production web URL",
      detail: webUrl,
      ok: true,
    },
  ];

  try {
    const { response, payload, durationMs } = await fetchJsonWithTimeout(healthUrl);
    const productionCommit = payload?.release?.commitSha || null;
    const commitMatches = !expectedCommit || !productionCommit || expectedCommit === productionCommit;
    const healthOk = response.ok && ["healthy", "watch"].includes(payload?.overall?.status);

    checks.push(
      {
        key: "healthEndpoint",
        label: "Public health endpoint",
        detail: `${response.status} in ${durationMs}ms`,
        ok: response.ok,
      },
      {
        key: "publicHealth",
        label: "Public web health",
        detail: payload?.overall?.label || payload?.overall?.status || "Unknown",
        ok: healthOk,
      },
      {
        key: "commitFreshness",
        label: "Deployment freshness",
        detail: productionCommit
          ? `production ${productionCommit.slice(0, 8)}${expectedCommit ? `, expected ${expectedCommit.slice(0, 8)}` : ""}`
          : "Production commit is not exposed yet.",
        ok: commitMatches && Boolean(productionCommit || !expectedCommit),
      },
    );

    const score = clampScore((checks.filter((check) => check.ok).length / checks.length) * 100);

    return {
      score,
      status: score >= 90 ? "fresh" : score >= 60 ? "watch" : "stale",
      url: webUrl,
      healthUrl,
      expectedCommit,
      productionCommit,
      durationMs,
      publicHealth: payload?.overall || null,
      checks,
    };
  } catch (error) {
    checks.push({
      key: "healthEndpoint",
      label: "Public health endpoint",
      detail: healthUrl,
      ok: false,
      error: error?.name === "AbortError" ? "Timed out." : error?.message || "Request failed.",
    });

    return {
      score: clampScore((checks.filter((check) => check.ok).length / checks.length) * 100),
      status: "stale-or-unavailable",
      url: webUrl,
      healthUrl,
      expectedCommit,
      productionCommit: null,
      checks,
      error: error?.name === "AbortError" ? "Timed out." : error?.message || "Production health check failed.",
    };
  }
}

function productionProbeBodyOk(probe, body, contentType) {
  if (probe.type === "html") {
    return (
      contentType.includes("text/html") &&
      /<html[\s>]/i.test(body) &&
      !PRODUCTION_ERROR_PATTERNS.some((pattern) => pattern.test(body))
    );
  }
  if (probe.type === "xml") {
    return (
      /(?:application|text)\/xml/i.test(contentType) &&
      /<(?:urlset|sitemapindex)\b/i.test(body)
    );
  }
  if (probe.type === "text") {
    return contentType.includes("text/plain") && /user-agent:/i.test(body);
  }
  if (probe.type === "health") {
    try {
      const payload = JSON.parse(body);
      return ["healthy", "watch"].includes(payload?.overall?.status);
    } catch {
      return false;
    }
  }
  return body.length > 0;
}

async function probeProductionRoute(baseUrl, probe) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    PRODUCTION_MONITOR_TIMEOUT_MS,
  );
  const startedAt = performance.now();
  const url = appendPath(baseUrl, probe.path);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    const body = await response.text();
    const durationMs = Math.round(performance.now() - startedAt);
    const contentType = response.headers.get("content-type") || "";
    const contentOk = productionProbeBodyOk(
      probe,
      body,
      contentType.toLowerCase(),
    );
    const state = !response.ok || !contentOk
      ? "fail"
      : durationMs > PRODUCTION_MONITOR_SLOW_MS
        ? "slow"
        : "pass";

    return {
      ...probe,
      url,
      finalUrl: response.url,
      status: response.status,
      durationMs,
      contentType: contentType.split(";")[0],
      state,
      ok: state !== "fail",
      detail: !response.ok
        ? `HTTP ${response.status}`
        : !contentOk
          ? `Unexpected ${contentType || "response"}`
          : durationMs > PRODUCTION_MONITOR_SLOW_MS
            ? `Slower than ${PRODUCTION_MONITOR_SLOW_MS}ms`
            : "Healthy",
    };
  } catch (error) {
    return {
      ...probe,
      url,
      finalUrl: null,
      status: 0,
      durationMs: Math.round(performance.now() - startedAt),
      contentType: "",
      state: "fail",
      ok: false,
      detail:
        error?.name === "AbortError"
          ? `Timed out after ${PRODUCTION_MONITOR_TIMEOUT_MS}ms`
          : error?.message || "Request failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function buildProductionMonitoring({ lite = false } = {}) {
  const baseUrl = normalizeUrl(
    process.env.ALTFT_MONITOR_WEB_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://altftool.com",
  );

  if (!baseUrl) {
    return {
      ok: false,
      score: 0,
      status: "not-configured",
      baseUrl: null,
      checkedAt: new Date().toISOString(),
      probes: [],
      totals: { probes: 0, passing: 0, slow: 0, failing: 0 },
    };
  }

  if (lite) {
    const savedPages = Array.isArray(productionLinksReport?.pages)
      ? productionLinksReport.pages
      : [];
    const savedFailures = Array.isArray(productionLinksReport?.failures)
      ? productionLinksReport.failures
      : [];
    const savedWarnings = Array.isArray(productionLinksReport?.warnings)
      ? productionLinksReport.warnings
      : [];
    const hasSnapshot = Boolean(productionLinksReport?.generatedAt);

    return {
      ok: hasSnapshot && savedFailures.length === 0,
      score: hasSnapshot
        ? clampScore(productionLinksReport?.score || 0)
        : 0,
      status: !hasSnapshot
        ? "not-run"
        : savedFailures.length
          ? "attention"
          : savedWarnings.length
            ? "watch"
            : "healthy",
      lite: true,
      skipped: true,
      baseUrl,
      checkedAt: productionLinksReport?.generatedAt || null,
      probes: [],
      totals: {
        probes: savedPages.length,
        passing: Math.max(0, savedPages.length - savedFailures.length),
        slow: 0,
        failing: savedFailures.length,
      },
      detail: hasSnapshot
        ? "Using the saved production surface report. Refresh live to probe current routes."
        : "No saved production surface report is available.",
    };
  }

  const probes = await Promise.all(
    PRODUCTION_ROUTE_PROBES.map((probe) =>
      probeProductionRoute(baseUrl, probe),
    ),
  );
  const passing = probes.filter((probe) => probe.state === "pass").length;
  const slow = probes.filter((probe) => probe.state === "slow").length;
  const failing = probes.filter((probe) => probe.state === "fail").length;
  const durations = probes
    .filter((probe) => probe.status > 0)
    .map((probe) => probe.durationMs)
    .sort((a, b) => a - b);
  const p95Index = durations.length
    ? Math.min(durations.length - 1, Math.ceil(durations.length * 0.95) - 1)
    : 0;
  const score = clampScore(
    ((passing + slow * 0.7) / Math.max(1, probes.length)) * 100,
  );

  return {
    ok: failing === 0,
    score,
    status: failing
      ? "attention"
      : slow
        ? "watch"
        : "healthy",
    lite: false,
    skipped: false,
    baseUrl,
    checkedAt: new Date().toISOString(),
    thresholds: {
      timeoutMs: PRODUCTION_MONITOR_TIMEOUT_MS,
      slowMs: PRODUCTION_MONITOR_SLOW_MS,
    },
    performance: {
      averageMs: durations.length
        ? Math.round(
            durations.reduce((sum, value) => sum + value, 0) /
              durations.length,
          )
        : 0,
      p95Ms: durations[p95Index] || 0,
      maxMs: durations.at(-1) || 0,
    },
    totals: {
      probes: probes.length,
      passing,
      slow,
      failing,
    },
    probes,
  };
}

function createReleaseGate({ key, label, status, score, detail, action, source }) {
  return {
    key,
    label,
    status,
    score: clampScore(score),
    detail,
    action,
    source,
  };
}

function getDeployGateStatus(deploy) {
  if (deploy?.ok) return "pass";

  const missingSecrets = deploy?.missingSecrets || [];
  const hasProjectLinks = (deploy?.results || []).every((result) => Boolean(result.projectLink));
  const onlyTokenMissing =
    missingSecrets.length > 0 &&
    missingSecrets.every((secret) => (secret.names || []).some((name) => name === "VERCEL_TOKEN" || name === "VERCEL_TOKEN_FILE"));

  return hasProjectLinks && onlyTokenMissing ? "warn" : "block";
}

function getActiveRouteQaPass(routeQa) {
  return routeQa?.passes?.warm || routeQa?.passes?.cold || routeQa || {};
}

function buildStrictRouteQaReadiness(routeQa) {
  const activePass = getActiveRouteQaPass(routeQa);
  const totals = activePass?.totals || routeQa?.totals || {};
  const performance = activePass?.performance || routeQa?.performance || {};
  const savedGate = routeQa?.qualityGates || activePass?.qualityGates || null;
  const hasReport = Boolean(routeQa?.checkedAt);
  const failures = Number(totals.failures || 0);
  const warnings = Number(totals.warnings || 0);
  const slowRoutes = Number(totals.slowRoutes || 0);
  const browserProbes = Number(totals.browserProbes || 0);
  const routeCount = Number(totals.routes || 0);
  const gateFailures = [];

  if (!hasReport) gateFailures.push("No saved route QA report is available.");
  if (hasReport && !routeQa?.ok) gateFailures.push("Route QA report is not passing.");
  if (failures > 0) gateFailures.push(`${failures} route failure${failures === 1 ? "" : "s"} found.`);
  if (warnings > 0) gateFailures.push(`${warnings} route warning${warnings === 1 ? "" : "s"} found.`);
  if (slowRoutes > 0) gateFailures.push(`${slowRoutes} slow route${slowRoutes === 1 ? "" : "s"} found.`);
  if (savedGate?.pass === false) {
    gateFailures.push(...(savedGate.failures || ["Saved strict quality gate is failing."]));
  }

  const checks = [
    {
      key: "saved-report",
      label: "Saved route report",
      ok: hasReport,
      detail: hasReport ? `Generated ${routeQa.checkedAt}.` : "Run npm run qa:routes:report.",
    },
    {
      key: "http-browser-routes",
      label: "HTTP and browser routes",
      ok: failures === 0,
      detail: `${routeCount} HTTP routes and ${browserProbes} browser probes checked.`,
    },
    {
      key: "warning-budget",
      label: "Warning budget",
      ok: warnings === 0,
      detail: `${warnings} warning${warnings === 1 ? "" : "s"} in the active route pass.`,
    },
    {
      key: "slow-route-budget",
      label: "Slow-route budget",
      ok: slowRoutes === 0,
      detail: `${slowRoutes} route${slowRoutes === 1 ? "" : "s"} over ${performance.thresholdMs || 2500}ms.`,
    },
    {
      key: "strict-quality-gate",
      label: "Strict quality gate",
      ok: gateFailures.length === 0,
      detail: savedGate
        ? `Strict saved gate ${savedGate.pass ? "passed" : "failed"}.`
        : "Strict mode treats warnings and slow routes as blockers.",
    },
  ];
  const ok = gateFailures.length === 0;

  return {
    key: "route-qa-strict",
    label: "Strict route QA",
    ok,
    status: ok ? "pass" : "block",
    score: clampScore((checks.filter((check) => check.ok).length / checks.length) * 100),
    checkedAt: routeQa?.checkedAt || null,
    activePass: routeQa?.activePass || activePass?.label || "single",
    command: "npm run qa:routes:strict",
    reportCommand: "npm run qa:routes:report",
    artifactCommand: "npm run qa:routes:strict -- --output route-qa-report.json --output-md route-qa-report.md",
    detail: hasReport
      ? `${routeCount} routes, ${browserProbes} browser probes, ${warnings} warnings, ${slowRoutes} slow routes.`
      : "No saved route QA report is available.",
    totals: {
      routes: routeCount,
      browserProbes,
      failures,
      warnings,
      slowRoutes,
    },
    performance: {
      p95Ms: performance.p95Ms || 0,
      maxMs: performance.maxMs || 0,
      thresholdMs: performance.thresholdMs || 2500,
    },
    checks,
    failures: gateFailures,
  };
}

function buildStrictFirebaseLiveReadiness(firebaseLiveData) {
  const checks = firebaseLiveData?.checks || [];
  const totalChecks = Number(firebaseLiveData?.totalChecks || checks.length || 0);
  const passingChecks = Number(
    firebaseLiveData?.passingChecks ?? checks.filter((check) => check.ok).length,
  );
  const score = Number(firebaseLiveData?.score || 0);
  const gateFailures = [...(firebaseLiveData?.failures || []), ...(firebaseLiveData?.gate?.failures || [])];

  if (!firebaseLiveData?.ok) {
    gateFailures.push("Firebase live data report is not passing.");
  }
  if (score < 100) {
    gateFailures.push(`Firebase live data score ${score} is below required 100.`);
  }
  if (totalChecks && passingChecks < totalChecks) {
    gateFailures.push(`${totalChecks - passingChecks} Firebase live-data check${totalChecks - passingChecks === 1 ? "" : "s"} failed.`);
  }

  const uniqueFailures = [...new Set(gateFailures)];
  const qualityChecks = [
    {
      key: "live-report",
      label: "Live Firestore report",
      ok: Boolean(firebaseLiveData?.generatedAt),
      detail: firebaseLiveData?.generatedAt ? `Generated ${firebaseLiveData.generatedAt}.` : "No live report generated.",
    },
    {
      key: "score",
      label: "Minimum score",
      ok: score >= 100,
      detail: `${score}/100 live data score.`,
    },
    {
      key: "read-checks",
      label: "Read checks",
      ok: totalChecks > 0 && passingChecks === totalChecks,
      detail: `${passingChecks}/${totalChecks} Firestore live reads passing.`,
    },
    {
      key: "strict-quality-gate",
      label: "Strict quality gate",
      ok: uniqueFailures.length === 0,
      detail: "Strict mode requires every sampled public collection to pass.",
    },
  ];
  const ok = uniqueFailures.length === 0;

  return {
    key: "firebase-live-strict",
    label: "Strict Firebase live data",
    ok,
    status: ok ? "pass" : "block",
    score: clampScore((qualityChecks.filter((check) => check.ok).length / qualityChecks.length) * 100),
    generatedAt: firebaseLiveData?.generatedAt || null,
    durationMs: firebaseLiveData?.durationMs || 0,
    projectId: firebaseLiveData?.projectId || "altftool-bca36",
    command: "npm run firebase:live-check:strict",
    artifactCommand: "npm run firebase:live-check:strict -- --output firebase-live-report.json --output-md firebase-live-report.md",
    detail: `${passingChecks}/${totalChecks} live Firestore reads passing.`,
    totalChecks,
    passingChecks,
    checks: qualityChecks,
    failures: uniqueFailures,
  };
}

function buildStrictFirebaseIntegrityReadiness(firebaseDataIntegrity) {
  const checks = firebaseDataIntegrity?.checks || [];
  const totalChecks = Number(firebaseDataIntegrity?.totalChecks || checks.length || 0);
  const passingChecks = Number(
    firebaseDataIntegrity?.passingChecks ?? checks.filter((check) => check.ok).length,
  );
  const score = Number(firebaseDataIntegrity?.score || 0);
  const failures = (firebaseDataIntegrity?.failures || []).map((issue) => issue.message || String(issue));
  const warnings = (firebaseDataIntegrity?.warnings || []).map((issue) => issue.message || String(issue));
  const gateFailures = [...failures, ...warnings];

  if (!firebaseDataIntegrity?.ok) {
    gateFailures.push("Firebase data integrity report is not passing strict mode.");
  }
  if (score < 100) {
    gateFailures.push(`Firebase data integrity score ${score} is below required 100.`);
  }

  const uniqueFailures = [...new Set(gateFailures)];
  const qualityChecks = [
    {
      key: "integrity-report",
      label: "Live integrity report",
      ok: Boolean(firebaseDataIntegrity?.generatedAt),
      detail: firebaseDataIntegrity?.generatedAt ? `Generated ${firebaseDataIntegrity.generatedAt}.` : "No integrity report generated.",
    },
    {
      key: "score",
      label: "Minimum score",
      ok: score >= 100,
      detail: `${score}/100 integrity score.`,
    },
    {
      key: "content-checks",
      label: "Content checks",
      ok: totalChecks > 0 && passingChecks === totalChecks,
      detail: `${passingChecks}/${totalChecks} content integrity checks passing.`,
    },
    {
      key: "warning-budget",
      label: "Warning budget",
      ok: warnings.length === 0,
      detail: `${warnings.length} sampled content warning${warnings.length === 1 ? "" : "s"}.`,
    },
  ];
  const ok = uniqueFailures.length === 0;

  return {
    key: "firebase-integrity-strict",
    label: "Strict Firebase integrity",
    ok,
    status: ok ? "pass" : "block",
    score: clampScore((qualityChecks.filter((check) => check.ok).length / qualityChecks.length) * 100),
    generatedAt: firebaseDataIntegrity?.generatedAt || null,
    durationMs: firebaseDataIntegrity?.durationMs || 0,
    projectId: firebaseDataIntegrity?.projectId || "altftool-bca36",
    command: "npm run firebase:integrity:strict",
    artifactCommand: "npm run firebase:integrity:strict -- --output firebase-integrity-report.json --output-md firebase-integrity-report.md",
    detail: `${passingChecks}/${totalChecks} sampled content checks passing.`,
    totalChecks,
    passingChecks,
    checks: qualityChecks,
    failures: uniqueFailures,
  };
}

function buildStrictPerformanceReadiness(performanceBudget) {
  const checks = performanceBudget?.checks || [];
  const failures = (performanceBudget?.failures || []).map((issue) => issue.message || String(issue));
  const warnings = (performanceBudget?.warnings || []).map((issue) => issue.message || String(issue));
  const gateFailures = [...failures, ...warnings];

  if (!performanceBudget?.ok) {
    gateFailures.push("Performance budget report is not passing strict mode.");
  }

  const uniqueFailures = [...new Set(gateFailures)];
  const ok = uniqueFailures.length === 0;

  return {
    key: "performance-budget-strict",
    label: "Strict performance budget",
    ok,
    status: ok ? "pass" : "block",
    score: performanceBudget?.score || 0,
    generatedAt: performanceBudget?.generatedAt || null,
    durationMs: performanceBudget?.durationMs || 0,
    command: "npm run performance:budget:strict",
    artifactCommand: "npm run performance:budget:strict -- --output performance-budget.json --output-md performance-budget.md",
    detail: `${performanceBudget?.totals?.publicImages || 0} public images, ${performanceBudget?.totals?.dynamicToolImports || 0} lazy tool imports.`,
    totals: performanceBudget?.totals || {},
    checks,
    failures: uniqueFailures,
  };
}

function buildRuntimeQualityReadiness({ routeQa, firebaseLiveData, firebaseDataIntegrity, performanceBudget }) {
  const gates = [
    buildStrictRouteQaReadiness(routeQa),
    buildStrictFirebaseLiveReadiness(firebaseLiveData),
    buildStrictFirebaseIntegrityReadiness(firebaseDataIntegrity),
    buildStrictPerformanceReadiness(performanceBudget),
  ];
  const blocked = gates.filter((gate) => !gate.ok);
  const score = clampScore(gates.reduce((sum, gate) => sum + gate.score, 0) / gates.length);

  return {
    ok: blocked.length === 0,
    status: blocked.length ? "blocked" : "ready",
    score,
    generatedAt: new Date().toISOString(),
    summary: {
      total: gates.length,
      pass: gates.length - blocked.length,
      block: blocked.length,
    },
    commands: {
      combined: "npm run validate:runtime-quality",
      route: "npm run qa:routes:strict",
      firebase: "npm run firebase:live-check:strict",
      firebaseIntegrity: "npm run firebase:integrity:strict",
      performance: "npm run performance:budget:strict",
    },
    gates,
    blockers: blocked.map((gate) => gate.label),
  };
}

function buildReleaseGates({
  qa,
  routeQa,
  routeQuality,
  blogContent,
  firebaseAdmin,
  firebaseLiveData,
  firebaseDataIntegrity,
  performanceBudget,
  productionLinks,
  productionMonitoring,
  deploy,
  production,
}) {
  const routeQaHasReport = Boolean(routeQa?.checkedAt);
  const routeFailures = Number(routeQa?.totals?.failures || 0);
  const routeWarnings = Number(routeQa?.totals?.warnings || 0);
  const routeSlow = Number(routeQa?.totals?.slowRoutes || 0);
  const routeQualityConflicts = Number(
    routeQuality?.totals?.indexConflicts || 0,
  );
  const routeQualityMissing = Number(
    routeQuality?.totals?.missingCanonicalTargets || 0,
  );
  const routeQualityIssues = Number(
    routeQuality?.totals?.routesWithIssues || 0,
  );
  const priorityTotal = Number(qa?.total || 0);
  const priorityRoutesCovered = Number(qa?.routeCovered || 0);
  const priorityFunctionalCovered = Number(qa?.functionalCovered || 0);
  const blogScore = Number(blogContent?.score || 0);
  const firebaseLiveScore = Number(firebaseLiveData?.score || 0);
  const firebaseIntegrityScore = Number(firebaseDataIntegrity?.score || 0);
  const performanceScore = Number(performanceBudget?.score || 0);
  const productionLinksScore = Number(productionLinks?.score || 0);
  const productionScore = Number(production?.score || 0);
  const deployGateStatus = getDeployGateStatus(deploy);
  const deployMissingCount = Number(deploy?.missingSecrets?.length || 0);

  const gates = [
    createReleaseGate({
      key: "priority-route-coverage",
      label: "Priority tool routes",
      status: priorityTotal && priorityRoutesCovered >= priorityTotal ? "pass" : "block",
      score: qa?.score || 0,
      detail: `${priorityRoutesCovered}/${priorityTotal} high-traffic tools have route coverage.`,
      action: "Run npm run test:tools:priority after public tool changes.",
      source: "healthManifest.qa",
    }),
    createReleaseGate({
      key: "priority-functional-flows",
      label: "Functional tool flows",
      status:
        priorityTotal && priorityFunctionalCovered >= priorityTotal
          ? "pass"
          : priorityFunctionalCovered > 0
            ? "warn"
            : "block",
      score: priorityTotal ? (priorityFunctionalCovered / priorityTotal) * 100 : 0,
      detail: `${priorityFunctionalCovered}/${priorityTotal} priority tools have deeper interaction coverage.`,
      action: "Expand tests/tool-functional.spec.mjs for any uncovered critical tools.",
      source: "healthManifest.qa",
    }),
    createReleaseGate({
      key: "route-qa-report",
      label: "Web and admin route QA",
      status: !routeQaHasReport || routeFailures > 0 ? "block" : routeWarnings || routeSlow ? "warn" : "pass",
      score: routeQa?.score || 0,
      detail: routeQaHasReport
        ? `${routeQa?.totals?.routes || 0} routes, ${routeFailures} failures, ${routeWarnings} warnings, ${routeSlow} slow routes.`
        : "No saved route QA report is available.",
      action: "Run npm run qa:routes:report before release.",
      source: "routeQaReport",
    }),
    createReleaseGate({
      key: "seo-index-control",
      label: "SEO index control",
      status:
        !routeQuality?.generatedAt ||
        routeQualityConflicts > 0 ||
        routeQualityMissing > 0 ||
        routeQualityIssues > 0
          ? "block"
          : routeQuality?.totals?.routesWithAdvisories
            ? "warn"
            : "pass",
      score: routeQuality?.score || 0,
      detail: routeQuality?.generatedAt
        ? `${routeQuality?.totals?.indexable || 0} indexable, ${routeQuality?.totals?.noindex || 0} noindex, ${routeQualityConflicts} sitemap conflicts, ${routeQualityMissing} missing canonical targets, ${routeQualityIssues} blocking metadata issues.`
        : "No rendered route-quality report is available.",
      action: "Run npm run seo:route-quality:report and npm run seo:index-control.",
      source: "routeQualityReport",
    }),
    createReleaseGate({
      key: "firebase-admin",
      label: "Firebase Admin SDK",
      status: firebaseAdmin?.adminSdkReady && firebaseAdmin?.firestoreReadable ? "pass" : "block",
      score: firebaseAdmin?.score || 0,
      detail: firebaseAdmin?.firestoreReadable
        ? "Admin SDK credentials can read Firestore."
        : "Admin SDK credentials or Firestore read access are not release-ready.",
      action: "Run npm run firebase:admin-write-check:dry-run, then the live write check.",
      source: "firebaseAdmin",
    }),
    createReleaseGate({
      key: "firebase-live-data",
      label: "Public Firebase live data",
      status: firebaseLiveData?.ok && firebaseLiveScore >= 90 ? "pass" : firebaseLiveScore >= 60 ? "warn" : "block",
      score: firebaseLiveScore,
      detail: `${firebaseLiveData?.passingChecks || 0}/${firebaseLiveData?.totalChecks || 0} live Firestore reads are passing.`,
      action: "Run npm run firebase:live-check and fix any blocked public collections.",
      source: "firebaseLiveData",
    }),
    createReleaseGate({
      key: "firebase-data-integrity",
      label: "Firebase data integrity",
      status: firebaseDataIntegrity?.ok && firebaseIntegrityScore >= 100 ? "pass" : firebaseIntegrityScore >= 80 ? "warn" : "block",
      score: firebaseIntegrityScore,
      detail: `${firebaseDataIntegrity?.passingChecks || 0}/${firebaseDataIntegrity?.totalChecks || 0} sampled content integrity checks are passing.`,
      action: "Run npm run firebase:integrity:strict and fix invalid slugs, URLs, or inactive public content.",
      source: "firebaseDataIntegrity",
    }),
    createReleaseGate({
      key: "performance-budget",
      label: "Performance budget",
      status: performanceBudget?.ok && performanceScore >= 100 ? "pass" : performanceBudget?.failures?.length ? "block" : "warn",
      score: performanceScore,
      detail: `${performanceBudget?.totals?.publicImages || 0} public images and ${performanceBudget?.totals?.dynamicToolImports || 0} lazy tool imports checked.`,
      action: "Run npm run build && npm run performance:budget:strict after heavy UI/tool changes.",
      source: "performanceBudgetReport",
    }),
    createReleaseGate({
      key: "production-links",
      label: "Production links and images",
      status: productionLinks?.ok && productionLinksScore >= 100 ? "pass" : productionLinks?.failures?.length ? "block" : "warn",
      score: productionLinksScore,
      detail: `${productionLinks?.totals?.pages || 0} pages, ${productionLinks?.totals?.linksChecked || 0} links, ${productionLinks?.totals?.imagesChecked || 0} images checked.`,
      action: "Run npm run monitor:links:report before release and fix broken production links/images.",
      source: "productionLinksReport",
    }),
    createReleaseGate({
      key: "production-monitoring",
      label: "Critical production routes",
      status: productionMonitoring?.totals?.failing
        ? "block"
        : productionMonitoring?.totals?.slow ||
            productionMonitoring?.status === "not-run"
          ? "warn"
          : "pass",
      score: productionMonitoring?.score || 0,
      detail: `${productionMonitoring?.totals?.passing || 0}/${productionMonitoring?.totals?.probes || 0} passing, ${productionMonitoring?.totals?.slow || 0} slow, ${productionMonitoring?.totals?.failing || 0} failing.`,
      action: "Refresh live health and fix any failing or slow critical route.",
      source: "productionMonitoring",
    }),
    createReleaseGate({
      key: "blog-content-health",
      label: "Blog content quality",
      status: blogScore >= 86 ? "pass" : blogScore >= 72 ? "warn" : "block",
      score: blogScore,
      detail: `${blogContent?.totals?.ready || 0}/${blogContent?.totals?.total || 0} blogs are marked ready in the saved content audit.`,
      action: "Run npm run content:blogs:report after improving FAQs, sources, and internal links.",
      source: "blogContentHealthReport",
    }),
    createReleaseGate({
      key: "vercel-deploy-readiness",
      label: "Vercel deploy readiness",
      status: deployGateStatus,
      score: deploy?.score || 0,
      detail: deploy?.ok
        ? "Web and admin deploy secrets are available."
        : deployGateStatus === "warn"
          ? "Vercel projects are linked locally; add VERCEL_TOKEN when running CI/manual deploy commands."
          : `${deployMissingCount} deploy secret gaps need attention.`,
      action: deployGateStatus === "warn"
        ? "Keep Vercel project links committed locally and set VERCEL_TOKEN or VERCEL_TOKEN_FILE only in secure environments."
        : "Set missing CI/Vercel secrets before production deploy.",
      source: "deployReadiness",
    }),
    createReleaseGate({
      key: "production-freshness",
      label: "Production freshness",
      status: productionScore >= 90 ? "pass" : productionScore >= 60 ? "warn" : "block",
      score: productionScore,
      detail: production?.error || `Public health status: ${production?.status || "unknown"}.`,
      action: "Deploy latest build and confirm public /api/health returns the current commit.",
      source: "production",
    }),
  ];
  const passed = gates.filter((gate) => gate.status === "pass").length;
  const warning = gates.filter((gate) => gate.status === "warn").length;
  const blocked = gates.filter((gate) => gate.status === "block").length;
  const score = clampScore(gates.reduce((sum, gate) => sum + gate.score, 0) / gates.length);

  return {
    score,
    ready: blocked === 0 && score >= 85,
    status: blocked ? "blocked" : warning ? "watch" : "ready",
    passed,
    warning,
    blocked,
    total: gates.length,
    blockers: gates.filter((gate) => gate.status === "block").map((gate) => gate.label),
    gates,
  };
}

function finalReleaseDoctorStatus(counts, strict = false) {
  if (counts.block > 0) return "blocked";
  if (strict && counts.warn > 0) return "blocked";
  if (counts.warn > 0) return "ready-with-warnings";
  return "ready";
}

const RELEASE_DOCTOR_FIX_COMMANDS = {
  "priority-route-coverage": "npm run test:tools:priority",
  "priority-functional-flows": "npm run test:tools:functional",
  "route-qa-report": "npm run qa:routes:report",
  "firebase-admin": "npm run firebase:admin-write-check",
  "firebase-live-data": "npm run firebase:live-check",
  "firebase-data-integrity": "npm run firebase:integrity:strict",
  "performance-budget": "npm run performance:budget:strict",
  "production-links": "npm run monitor:links:report",
  "blog-content-health": "npm run content:blogs:report",
  "vercel-deploy-readiness": "npm run deploy:readiness -- --target=all",
  "production-freshness": "npm run monitor:production",
};

const FIX_CENTER_KEY_ALIASES = {
  "health-manifest": "health-manifest",
  "route-qa": "route-qa-report",
  "route-qa-strict": "route-qa-report",
  "blog-content": "blog-content-health",
  "firebase-live-strict": "firebase-live-data",
  "firebase-integrity-strict": "firebase-data-integrity",
  "performance-budget-strict": "performance-budget",
  "vercel-readiness": "vercel-deploy-readiness",
};

const FIX_CENTER_TARGETS = {
  "health-manifest": {
    href: "#tool-health-qa-table",
    label: "Tool quality table",
  },
  "priority-route-coverage": {
    href: "#tool-health-qa-table",
    label: "Tool quality table",
  },
  "priority-functional-flows": {
    href: "#tool-health-qa-table",
    label: "Tool quality table",
  },
  "route-qa-report": {
    href: "#route-qa-report-panel",
    label: "Route QA report",
  },
  "firebase-admin": {
    href: "#admin-credential-readiness-panel",
    label: "Firebase Admin panel",
  },
  "firebase-live-data": {
    href: "#firebase-live-data-panel",
    label: "Firebase live-data panel",
  },
  "firebase-data-integrity": {
    href: "#firebase-data-integrity-panel",
    label: "Firebase integrity panel",
  },
  "performance-budget": {
    href: "#performance-budget-panel",
    label: "Performance budget panel",
  },
  "production-links": {
    href: "#production-links-panel",
    label: "Production links panel",
  },
  "blog-content-health": {
    href: "#blog-content-health-panel",
    label: "Blog content panel",
    adminPath: "/altftool/blogs/quality",
    adminLabel: "Open blog quality",
  },
  "vercel-deploy-readiness": {
    href: "#deploy-readiness-panel",
    label: "Deploy readiness panel",
  },
  "production-freshness": {
    href: "#production-freshness-panel",
    label: "Production freshness panel",
  },
};

function normalizeFixStatus(status, ok = false) {
  if (ok) return "pass";
  if (status === "block" || status === "blocked") return "block";
  if (status === "warn" || status === "watch" || status === "ready-with-warnings") return "warn";
  return "block";
}

function fixSeverity(status) {
  if (status === "block") return 0;
  if (status === "warn") return 1;
  return 2;
}

function canonicalFixKey(key) {
  return FIX_CENTER_KEY_ALIASES[key] || key;
}

function buildFixCenter({
  releaseGates,
  runtimeQuality,
  releaseDoctorArtifact,
  productionLinks,
  deploy,
}) {
  const itemMap = new Map();
  const addItem = (item) => {
    const status = normalizeFixStatus(item.status, item.ok);
    if (status === "pass") return;

    const key = canonicalFixKey(item.key || item.label);
    const target = FIX_CENTER_TARGETS[key] || {
      href: "#release-gate-command-center",
      label: "Release gate center",
    };
    const nextItem = {
      key,
      label: item.label || key,
      status,
      score: clampScore(item.score || 0),
      source: item.source || "health",
      detail: item.detail || "",
      nextAction: item.nextAction || item.action || "",
      command: item.command || RELEASE_DOCTOR_FIX_COMMANDS[key] || "",
      targetHref: target.href,
      targetLabel: target.label,
      adminPath: target.adminPath || "",
      adminLabel: target.adminLabel || "",
    };
    const existing = itemMap.get(key);

    if (!existing || fixSeverity(nextItem.status) < fixSeverity(existing.status)) {
      itemMap.set(key, nextItem);
    }
  };

  for (const gate of releaseGates?.gates || []) {
    addItem({
      key: gate.key,
      label: gate.label,
      status: gate.status,
      score: gate.score,
      source: gate.source || "releaseGates",
      detail: gate.detail,
      nextAction: gate.action,
      command: RELEASE_DOCTOR_FIX_COMMANDS[gate.key],
    });
  }

  for (const gate of runtimeQuality?.gates || []) {
    addItem({
      key: gate.key,
      label: gate.label,
      status: gate.ok ? "pass" : gate.status || "block",
      score: gate.score,
      source: "runtimeQuality",
      detail: gate.detail,
      nextAction: gate.failures?.[0] || "Clear this strict runtime gate.",
      command: gate.command,
    });
  }

  for (const check of releaseDoctorArtifact?.checks || []) {
    addItem({
      key: check.key,
      label: check.label,
      status: check.status,
      score: check.score,
      source: "releaseDoctorArtifact",
      detail: check.detail,
      nextAction: check.nextAction,
      command: check.command,
    });
  }

  for (const failure of productionLinks?.failures || []) {
    addItem({
      key: `production-links-${failure.type || "failure"}`,
      label: "Production link failure",
      status: "block",
      score: 0,
      source: "productionLinksReport",
      detail: `${failure.pageUrl || "Production page"}${failure.targetUrl ? ` -> ${failure.targetUrl}` : ""}: ${failure.message || "target failed"}`,
      nextAction: "Fix the broken route, internal link, or image and rerun the production link report.",
      command: "npm run monitor:links:report",
    });
  }

  for (const warning of productionLinks?.warnings || []) {
    addItem({
      key: `production-links-${warning.type || "warning"}`,
      label: "Production link warning",
      status: "warn",
      score: productionLinks?.score || 0,
      source: "productionLinksReport",
      detail: `${warning.pageUrl || "Production page"}: ${warning.message || "warning"}`,
      nextAction: "Fix production metadata or sitemap warnings and rerun the production link report.",
      command: "npm run monitor:links:report",
    });
  }

  if (deploy?.missingSecrets?.length) {
    addItem({
      key: "vercel-deploy-readiness",
      label: "Vercel deploy readiness",
      status: deploy.status === "linked-needs-token" ? "warn" : "block",
      score: deploy.score,
      source: "deployReadiness",
      detail: `${deploy.missingSecrets.length} deploy value gap${deploy.missingSecrets.length === 1 ? "" : "s"} detected.`,
      nextAction: "Set missing Vercel values only in secure local/CI environments.",
      command: "npm run deploy:readiness -- --target=all",
    });
  }

  const items = [...itemMap.values()].sort(
    (a, b) => fixSeverity(a.status) - fixSeverity(b.status) || a.score - b.score || a.label.localeCompare(b.label),
  );
  const block = items.filter((item) => item.status === "block").length;
  const warn = items.filter((item) => item.status === "warn").length;
  const commandCount = items.filter((item) => item.command).length;

  return {
    status: block ? "blocked" : warn ? "watch" : "ready",
    score: clampScore(100 - block * 18 - warn * 7),
    generatedAt: new Date().toISOString(),
    counts: {
      total: items.length,
      block,
      warn,
      command: commandCount,
    },
    items,
    topCommands: [...new Set(items.map((item) => item.command).filter(Boolean))].slice(0, 6),
    checks: [
      {
        key: "open-actions",
        label: "Open fix actions",
        ok: items.length === 0,
        detail: `${items.length} action${items.length === 1 ? "" : "s"} currently open.`,
      },
      {
        key: "blocking-actions",
        label: "Blocking actions",
        ok: block === 0,
        detail: `${block} blocking action${block === 1 ? "" : "s"}.`,
      },
      {
        key: "command-coverage",
        label: "Command coverage",
        ok: items.length === commandCount,
        detail: `${commandCount}/${items.length} open actions include a runnable command.`,
      },
    ],
  };
}

function buildReleaseDoctorSummary({ releaseGates, routeQa, blogContent, production }) {
  const checks = (releaseGates?.gates || []).map((gate) => ({
    key: gate.key,
    label: gate.label,
    status: gate.status,
    score: gate.score,
    detail: gate.detail,
    nextAction: gate.action,
    command: RELEASE_DOCTOR_FIX_COMMANDS[gate.key] || null,
    source: gate.source,
  }));
  const counts = checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { pass: 0, warn: 0, block: 0 },
  );
  const status = finalReleaseDoctorStatus(counts);
  const strictStatus = finalReleaseDoctorStatus(counts, true);

  return {
    status,
    strictStatus,
    ready: status === "ready",
    strictReady: strictStatus === "ready",
    score: releaseGates?.score || 0,
    commands: {
      normal: "npm run release:doctor",
      strict: "npm run release:doctor:strict",
      offline: "npm run release:doctor -- --offline",
    },
    summary: {
      counts,
      blockingChecks: checks.filter((check) => check.status === "block").map((check) => check.label),
      warningChecks: checks.filter((check) => check.status === "warn").map((check) => check.label),
    },
    sources: {
      routeQaCheckedAt: routeQa?.checkedAt || null,
      blogContentGeneratedAt: blogContent?.generatedAt || null,
      productionHealthUrl: production?.healthUrl || null,
      productionStatus: production?.status || null,
      productionScore: production?.score || 0,
    },
    checks,
  };
}

function buildRecommendations({
  tools,
  qa,
  seo,
  content,
  automation,
  routeQa,
  routeQuality,
  blogContent,
  firebaseAdmin,
  firebaseLiveData,
  firebaseDataIntegrity,
  performanceBudget,
  productionLinks,
  productionMonitoring,
  releaseDoctorArtifact,
  runtimeQuality,
  deploy,
  production,
}) {
  const recommendations = [];

  if (tools.missingEntry || tools.missingConfig) {
    recommendations.push(
      `Fix ${tools.missingEntry} missing entry files and ${tools.missingConfig} missing config files before adding more tools.`,
    );
  }

  if (tools.orphanToolDirs.length) {
    recommendations.push(
      `${tools.orphanToolDirs.length} tool folders are not registered. Add them to the registry or archive them.`,
    );
  }

  if (tools.registryWithoutDir.length) {
    recommendations.push(
      `${tools.registryWithoutDir.length} registered tools do not have source folders.`,
    );
  }

  if (tools.readiness?.counts?.broken > 0) {
    recommendations.push(
      `Repair ${tools.readiness.counts.broken} structurally broken tools before release.`,
    );
  }

  if (tools.readiness?.priority?.needsAttention > 0) {
    recommendations.push(
      `Complete implementation evidence for ${tools.readiness.priority.needsAttention} priority tools.`,
    );
  }

  if (tools.readiness?.automatedCoverage < 80) {
    recommendations.push(
      `Raise deterministic tool coverage from ${tools.readiness.automatedCoverage}% toward the 80% release target.`,
    );
  }

  if (seo.score < 100) {
    recommendations.push("Complete sitemap, robots, metadata, and JSON-LD coverage for crawl readiness.");
  }

  if (qa.score < 100) {
    recommendations.push(
      `Keep the top ${qa.total} tool route QA pack green before shipping public tool updates.`,
    );
  }

  if (content.score < 100) {
    recommendations.push("Refresh fallback content data so blogs, stores, deals, and news all stay populated.");
  }

  if (automation.score < 100) {
    recommendations.push("Keep smoke and route audits wired into full validation before every release.");
  }

  if (routeQa?.totals?.failures > 0) {
    recommendations.push(`Fix ${routeQa.totals.failures} route QA failures before shipping web or admin routing changes.`);
  }

  if (routeQa?.totals?.slowRoutes > 0) {
    recommendations.push(`Review ${routeQa.totals.slowRoutes} slow routes from the latest route QA report.`);
  }

  if (routeQuality?.totals?.indexConflicts > 0) {
    recommendations.push(
      `Remove ${routeQuality.totals.indexConflicts} noindex routes from the XML sitemap.`,
    );
  }

  if (routeQuality?.totals?.missingCanonicalTargets > 0) {
    recommendations.push(
      `Add ${routeQuality.totals.missingCanonicalTargets} indexable canonical targets to the sitemap or intentionally noindex them.`,
    );
  }

  if (blogContent?.score < 72) {
    recommendations.push("Improve blog content depth, source coverage, FAQs, and internal links from the saved blog content health report.");
  }

  if (firebaseAdmin.score < 100) {
    recommendations.push("Configure Firebase Admin service-account env vars before testing admin write actions in production.");
  }

  if (firebaseLiveData.score < 100) {
    recommendations.push("Fix Firebase live-data reads so public content modules keep loading real Firestore data.");
  }

  if (firebaseDataIntegrity.score < 100) {
    recommendations.push("Fix Firebase data-integrity warnings so sampled public content is strict-gate clean.");
  }

  if (performanceBudget.score < 100) {
    recommendations.push("Review bundle, image, and tool lazy-load budgets from the saved performance budget report.");
  }

  if (productionLinks?.score < 100) {
    recommendations.push("Refresh the production link report and fix broken public routes, images, or strict SEO warnings.");
  }

  if (productionMonitoring?.totals?.failing > 0) {
    recommendations.push(
      `Fix ${productionMonitoring.totals.failing} failing critical production route probes.`,
    );
  } else if (productionMonitoring?.totals?.slow > 0) {
    recommendations.push(
      `Optimize ${productionMonitoring.totals.slow} slow critical production routes.`,
    );
  }

  if (releaseDoctorArtifact?.status && releaseDoctorArtifact.status !== "ready") {
    recommendations.push("Regenerate the release doctor artifact and clear any warning or blocking checks before deployment.");
  }

  if (runtimeQuality && !runtimeQuality.ok) {
    recommendations.push("Run npm run validate:runtime-quality and clear strict route/Firebase blockers before release.");
  }

  if (deploy.score < 100) {
    recommendations.push("Add the missing Vercel deploy secrets so web and admin production deployments can run from CI.");
  }

  if (production.score < 100) {
    recommendations.push("Deploy the latest public web build, then confirm the production /api/health endpoint reports a fresh commit.");
  }

  if (!recommendations.length) {
    recommendations.push("System health is clean. Keep using validate:full before release pushes.");
  }

  return recommendations;
}

async function buildHealthAuditSnapshot({ lite = false } = {}) {
  const { tools, qa, seo, content, automation } = healthManifest;
  const [
    firebaseAdmin,
    firebaseLiveData,
    firebaseDataIntegrity,
    production,
    productionMonitoring,
  ] = await Promise.all([
    buildFirebaseAdminReadiness({ lite }),
    buildFirebaseLiveDataReadiness({ lite }),
    buildFirebaseDataIntegrityReadiness({ lite }),
    buildProductionFreshness({ lite }),
    buildProductionMonitoring({ lite }),
  ]);
  const deploy = buildVercelDeployReadiness();
  const performanceBudget = buildPerformanceBudgetReadiness();
  const routeQuality = buildRouteQualityReadiness();
  const productionLinks = buildProductionLinksReadiness();
  const releaseDoctorArtifact = buildReleaseDoctorArtifactReadiness();
  const runtimeQuality = buildRuntimeQualityReadiness({
    routeQa: routeQaReport,
    firebaseLiveData,
    firebaseDataIntegrity,
    performanceBudget,
  });
  const routeQaScore = Number(routeQaReport?.score || 0);
  const blogContentScore = Number(blogContentHealthReport?.score || 0);
  const releaseGates = buildReleaseGates({
    qa,
    routeQa: routeQaReport,
    routeQuality,
    blogContent: blogContentHealthReport,
    firebaseAdmin,
    firebaseLiveData,
    firebaseDataIntegrity,
    performanceBudget,
    productionLinks,
    productionMonitoring,
    deploy,
    production,
  });
  const releaseDoctor = buildReleaseDoctorSummary({
    releaseGates,
    routeQa: routeQaReport,
    blogContent: blogContentHealthReport,
    production,
  });

  const snapshotGeneratedAt = new Date().toISOString();
  const overallScore = weightedScore([
    [tools.readiness?.score ?? tools.averageScore, 10],
    [qa.score, 6],
    [routeQaScore, 8],
    [routeQuality.score, 10],
    [seo.score, 8],
    [content.score, 4],
    [blogContentScore, 6],
    [automation.score, 4],
    [firebaseAdmin.score, 8],
    [firebaseLiveData.score, 7],
    [firebaseDataIntegrity.score, 7],
    [runtimeQuality.score, 8],
    [performanceBudget.score, 6],
    [productionLinks.score, 3],
    [releaseDoctorArtifact.score, 2],
    [deploy.score, 2],
    [production.score, 2],
    [productionMonitoring.score, 4],
  ]);
  const status = overallScore >= 90 ? "healthy" : overallScore >= 75 ? "watch" : "attention";
  const releaseHistory = buildReleaseHistoryReadiness(
    createCurrentReleaseHistoryEntry({
      generatedAt: snapshotGeneratedAt,
      overallScore,
      overallStatus: status,
      releaseDoctor,
      runtimeQuality,
      productionLinks,
      performanceBudget,
      routeQa: routeQaReport,
      firebaseLiveData,
      firebaseDataIntegrity,
      deploy,
      production,
    }),
  );
  const fixCenter = buildFixCenter({
    releaseGates,
    runtimeQuality,
    releaseDoctorArtifact,
    productionLinks,
    deploy,
  });

  return {
    generatedAt: snapshotGeneratedAt,
    cached: false,
    mode: lite ? "lite" : "live",
    liveProbeSkipped: lite,
    manifest: {
      schemaVersion: healthManifest.schemaVersion,
      generatedAt: healthManifest.generatedAt,
    },
    overall: {
      score: overallScore,
      status,
      label:
        status === "healthy"
          ? "Release ready"
          : status === "watch"
            ? "Needs review"
            : "Needs attention",
    },
    tools,
    qa,
    seo,
    content,
    blogContent: blogContentHealthReport,
    automation,
    routeQa: routeQaReport,
    routeQuality,
    firebaseAdmin,
    firebaseLiveData,
    firebaseDataIntegrity,
    runtimeQuality,
    performanceBudget,
    productionLinks,
    productionMonitoring,
    releaseDoctorArtifact,
    releaseHistory,
    fixCenter,
    deploy,
    production,
    releaseGates,
    releaseDoctor,
    recommendations: buildRecommendations({
      tools,
      qa,
      seo,
      content,
      automation,
      routeQa: routeQaReport,
      routeQuality,
      blogContent: blogContentHealthReport,
      firebaseAdmin,
      firebaseLiveData,
      firebaseDataIntegrity,
      performanceBudget,
      productionLinks,
      productionMonitoring,
      releaseDoctorArtifact,
      runtimeQuality,
      deploy,
      production,
    }),
  };
}

export async function GET(request) {
  let cacheKey = "live";

  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: HEALTH_RATE_LIMIT,
      windowMs: 60_000,
      scope: "admin:health",
    });
    if (limited) return limited;

    await verifySuperAdminRequest(request);

    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("fresh") === "1";
    const lite = url.searchParams.get("lite") === "1";
    cacheKey = lite ? "lite" : "live";
    const now = Date.now();

    if (!forceRefresh && cachedHealthSnapshots[cacheKey]?.expiresAt > now) {
      return healthJson({
        ...cachedHealthSnapshots[cacheKey].payload,
        cached: true,
        generatedAt: new Date().toISOString(),
      });
    }

    if (!forceRefresh && pendingHealthSnapshots[cacheKey]) {
      const payload = await pendingHealthSnapshots[cacheKey];
      return healthJson({
        ...payload,
        cached: true,
        generatedAt: new Date().toISOString(),
      });
    }

    pendingHealthSnapshots[cacheKey] = buildHealthAuditSnapshot({ lite });

    const payload = await pendingHealthSnapshots[cacheKey];
    cachedHealthSnapshots[cacheKey] = {
      payload,
      expiresAt: Date.now() + HEALTH_CACHE_MS,
    };

    return healthJson(payload);
  } catch (error) {
    const message = error?.message || "Health audit failed.";
    const status = message === "Unauthorized" ? 401 : 500;
    if (status >= 500) {
      console.error("Health audit failed:", error);
    }

    return healthJson({ error: message }, { status });
  } finally {
    pendingHealthSnapshots[cacheKey] = null;
  }
}
