import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawArgs = process.argv.slice(2);
const DEFAULT_OUTPUT = "altftoolwebadmin/src/data/releaseHistoryReport.json";

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const index = rawArgs.indexOf(name);
  if (index >= 0 && rawArgs[index + 1] && !rawArgs[index + 1].startsWith("--")) {
    return rawArgs[index + 1];
  }

  const match = rawArgs.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function resolveFromRoot(rootDir, relativePath) {
  return path.isAbsolute(relativePath) ? relativePath : path.join(rootDir, relativePath);
}

async function readJson(rootDir, relativePath, fallback = {}) {
  try {
    return JSON.parse(await readFile(resolveFromRoot(rootDir, relativePath), "utf8"));
  } catch {
    return fallback;
  }
}

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function averageScore(items = []) {
  const scores = items.map((item) => Number(item.score)).filter(Number.isFinite);
  if (!scores.length) return 0;
  return clampScore(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function normalizeStatus(status, score) {
  const value = String(status || "").toLowerCase();
  if (["blocked", "block", "failed", "error"].includes(value)) return "blocked";
  if (["ready-with-warnings", "watch", "warn", "warning", "linked-needs-token"].includes(value)) return "watch";
  if (["ready", "clean", "fresh", "pass", "healthy"].includes(value)) return "ready";
  return score >= 90 ? "ready" : score >= 75 ? "watch" : "blocked";
}

function findDoctorCheck(releaseDoctor, key) {
  return (releaseDoctor.checks || []).find((check) => check.key === key) || {};
}

function doctorScore(releaseDoctor) {
  if (Number.isFinite(Number(releaseDoctor.score))) return clampScore(Number(releaseDoctor.score));
  return averageScore(releaseDoctor.checks || []);
}

function createMetric({ key, label, score, status, generatedAt, detail = "" }) {
  const safeScore = clampScore(Number(score || 0));
  return {
    key,
    label,
    score: safeScore,
    status: normalizeStatus(status, safeScore),
    generatedAt: generatedAt || null,
    detail,
  };
}

export async function buildReleaseHistoryEntry({ rootDir = root, timestamp = "" } = {}) {
  const healthManifest = await readJson(rootDir, "altftoolwebadmin/src/data/healthManifest.json");
  const routeQa = await readJson(rootDir, "altftoolwebadmin/src/data/routeQaReport.json");
  const blogContent = await readJson(rootDir, "altftoolwebadmin/src/data/blogContentHealthReport.json");
  const performanceBudget = await readJson(rootDir, "altftoolwebadmin/src/data/performanceBudgetReport.json");
  const productionLinks = await readJson(rootDir, "altftoolwebadmin/src/data/productionLinksReport.json");
  const releaseDoctor = await readJson(rootDir, "altftoolwebadmin/src/data/releaseDoctorReport.json");

  const firebaseLive = findDoctorCheck(releaseDoctor, "firebase-live-data");
  const firebaseIntegrity = findDoctorCheck(releaseDoctor, "firebase-data-integrity");
  const productionFreshness = findDoctorCheck(releaseDoctor, "production-freshness");
  const deployReadiness = findDoctorCheck(releaseDoctor, "vercel-readiness");
  const releaseDoctorGeneratedAt = releaseDoctor.generatedAt || "";
  const generatedAt = timestamp || releaseDoctorGeneratedAt || new Date().toISOString();
  const metrics = [
    createMetric({
      key: "release-doctor",
      label: "Release Doctor",
      score: doctorScore(releaseDoctor),
      status: releaseDoctor.status,
      generatedAt: releaseDoctorGeneratedAt,
      detail: `${releaseDoctor.summary?.counts?.pass || 0} pass, ${releaseDoctor.summary?.counts?.warn || 0} warn, ${releaseDoctor.summary?.counts?.block || 0} block.`,
    }),
    createMetric({
      key: "production-links",
      label: "Production Links",
      score: productionLinks.score,
      status: productionLinks.status,
      generatedAt: productionLinks.generatedAt,
      detail: `${productionLinks.totals?.pages || 0} pages, ${productionLinks.totals?.linksChecked || 0} links, ${productionLinks.totals?.imagesChecked || 0} images.`,
    }),
    createMetric({
      key: "performance-budget",
      label: "Performance Budget",
      score: performanceBudget.score,
      status: performanceBudget.status,
      generatedAt: performanceBudget.generatedAt,
      detail: `${performanceBudget.totals?.publicImages || 0} public images, ${performanceBudget.totals?.dynamicToolImports || 0} lazy tool imports.`,
    }),
    createMetric({
      key: "route-qa",
      label: "Route QA",
      score: routeQa.score,
      status: routeQa.ok ? "ready" : routeQa.totals?.failures ? "blocked" : "watch",
      generatedAt: routeQa.checkedAt,
      detail: `${routeQa.totals?.routes || 0} routes, ${routeQa.totals?.failures || 0} failures, ${routeQa.totals?.warnings || 0} warnings.`,
    }),
    createMetric({
      key: "blog-content",
      label: "Blog Content",
      score: blogContent.score,
      status: blogContent.status,
      generatedAt: blogContent.generatedAt,
      detail: `${blogContent.totals?.ready || 0}/${blogContent.totals?.total || 0} blogs ready.`,
    }),
    createMetric({
      key: "tool-quality",
      label: "Tool Quality",
      score: healthManifest.tools?.averageScore,
      status: Number(healthManifest.tools?.needsAttention || 0) ? "watch" : "ready",
      generatedAt: healthManifest.generatedAt,
      detail: `${healthManifest.tools?.healthy || 0}/${healthManifest.tools?.total || 0} tools healthy.`,
    }),
    createMetric({
      key: "firebase-live",
      label: "Firebase Live Data",
      score: firebaseLive.score,
      status: firebaseLive.status,
      generatedAt: releaseDoctorGeneratedAt,
      detail: firebaseLive.detail || "Firebase live-data release doctor check.",
    }),
    createMetric({
      key: "firebase-integrity",
      label: "Firebase Integrity",
      score: firebaseIntegrity.score,
      status: firebaseIntegrity.status,
      generatedAt: releaseDoctorGeneratedAt,
      detail: firebaseIntegrity.detail || "Firebase integrity release doctor check.",
    }),
    createMetric({
      key: "vercel-readiness",
      label: "Vercel Readiness",
      score: deployReadiness.score,
      status: deployReadiness.status,
      generatedAt: releaseDoctorGeneratedAt,
      detail: deployReadiness.detail || "Vercel deploy readiness check.",
    }),
    createMetric({
      key: "production-freshness",
      label: "Production Freshness",
      score: productionFreshness.score,
      status: productionFreshness.status,
      generatedAt: releaseDoctorGeneratedAt,
      detail: productionFreshness.detail || "Production freshness check.",
    }),
  ];

  return {
    id: generatedAt.replace(/[^0-9A-Za-z]+/g, "-").replace(/^-|-$/g, ""),
    generatedAt,
    status: normalizeStatus(releaseDoctor.status, doctorScore(releaseDoctor)),
    score: averageScore(metrics),
    summary: {
      releaseDoctorStatus: releaseDoctor.status || "unknown",
      releaseDoctorCounts: releaseDoctor.summary?.counts || { pass: 0, warn: 0, block: 0 },
      productionLinkStatus: productionLinks.status || "unknown",
      performanceStatus: performanceBudget.status || "unknown",
    },
    metrics,
  };
}

export function mergeReleaseHistoryEntries(existingEntries = [], nextEntry, limit = 30) {
  const entriesById = new Map();

  for (const entry of existingEntries) {
    if (entry?.id || entry?.generatedAt) {
      entriesById.set(entry.id || entry.generatedAt, entry);
    }
  }
  entriesById.set(nextEntry.id || nextEntry.generatedAt, nextEntry);

  return [...entriesById.values()]
    .sort((a, b) => new Date(a.generatedAt || 0).getTime() - new Date(b.generatedAt || 0).getTime())
    .slice(-Math.max(1, Number(limit || 30)));
}

export async function createReleaseHistoryReport(options = {}) {
  const rootDir = options.rootDir || root;
  const output = options.output || DEFAULT_OUTPUT;
  const limit = Number(options.limit || 30);
  const outputPath = resolveFromRoot(rootDir, output);
  const existing = await readJson(rootDir, output, {
    schemaVersion: 1,
    generatedAt: null,
    entries: [],
  });
  const entry = await buildReleaseHistoryEntry({
    rootDir,
    timestamp: options.timestamp,
  });
  const entries = mergeReleaseHistoryEntries(existing.entries || [], entry, limit);
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: "release-history-report",
    limit,
    latest: entry,
    entries,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return report;
}

async function main() {
  const report = await createReleaseHistoryReport({
    output: argValue("--output", DEFAULT_OUTPUT),
    limit: Number(argValue("--limit", "30")),
    timestamp: argValue("--timestamp", ""),
  });

  console.log("Release history report");
  console.log(`Entries: ${report.entries.length}`);
  console.log(`Latest: ${report.latest.status} (${report.latest.score}/100)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
