import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildReleaseHistoryEntry, mergeReleaseHistoryEntries } from "../scripts/update-release-history.mjs";

async function writeFixture(rootDir, relativePath, value) {
  const filePath = path.join(rootDir, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

test("release history entry summarizes saved release reports without secrets", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "altft-release-history-"));
  const generatedAt = "2026-05-20T12:00:00.000Z";

  await writeFixture(rootDir, "altftoolwebadmin/src/data/healthManifest.json", {
    generatedAt,
    tools: { averageScore: 100, healthy: 231, total: 231, needsAttention: 0 },
  });
  await writeFixture(rootDir, "altftoolwebadmin/src/data/routeQaReport.json", {
    checkedAt: generatedAt,
    ok: true,
    score: 100,
    totals: { routes: 162, failures: 0, warnings: 0 },
  });
  await writeFixture(rootDir, "altftoolwebadmin/src/data/blogContentHealthReport.json", {
    generatedAt,
    status: "ready",
    score: 100,
    totals: { ready: 31, total: 31 },
  });
  await writeFixture(rootDir, "altftoolwebadmin/src/data/performanceBudgetReport.json", {
    generatedAt,
    status: "clean",
    score: 100,
    totals: { publicImages: 390, dynamicToolImports: 231 },
  });
  await writeFixture(rootDir, "altftoolwebadmin/src/data/productionLinksReport.json", {
    generatedAt,
    status: "clean",
    score: 100,
    totals: { pages: 12, linksChecked: 192, imagesChecked: 36 },
  });
  await writeFixture(rootDir, "altftoolwebadmin/src/data/releaseDoctorReport.json", {
    generatedAt,
    status: "ready-with-warnings",
    summary: { counts: { pass: 8, warn: 2, block: 0 } },
    checks: [
      { key: "firebase-live-data", label: "Firebase public live data", status: "pass", score: 100, detail: "19/19 live checks." },
      { key: "firebase-data-integrity", label: "Firebase data integrity", status: "pass", score: 100, detail: "20/20 sampled checks." },
      { key: "vercel-readiness", label: "Vercel readiness", status: "warn", score: 67, detail: "Token missing." },
      { key: "production-freshness", label: "Production freshness", status: "pass", score: 100, detail: "Public health 200." },
    ],
  });

  const entry = await buildReleaseHistoryEntry({ rootDir });
  const serialized = JSON.stringify(entry);

  assert.equal(entry.generatedAt, generatedAt);
  assert.equal(entry.status, "watch");
  assert.ok(entry.metrics.some((metric) => metric.key === "production-links" && metric.score === 100));
  assert.ok(entry.metrics.some((metric) => metric.key === "vercel-readiness" && metric.status === "watch"));
  assert.equal(serialized.includes("PRIVATE KEY-----"), false);
  assert.equal(serialized.includes("vcp_"), false);
});

test("release history merge replaces duplicate entries and keeps the newest limit", () => {
  const entries = mergeReleaseHistoryEntries(
    [
      { id: "a", generatedAt: "2026-05-20T10:00:00.000Z", score: 80 },
      { id: "b", generatedAt: "2026-05-20T11:00:00.000Z", score: 90 },
    ],
    { id: "b", generatedAt: "2026-05-20T11:00:00.000Z", score: 95 },
    2,
  );

  assert.deepEqual(entries.map((entry) => entry.score), [80, 95]);
});
