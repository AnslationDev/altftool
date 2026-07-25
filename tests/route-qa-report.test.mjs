import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  parseRouteQaShard,
  routeQaShardNumber,
} from "../scripts/lib/route-qa-sharding.mjs";

function runRouteQaReport(args = [], { readMarkdown = false } = {}) {
  const tempDir = mkdtempSync(join(tmpdir(), "altftool-route-qa-"));
  const outputPath = join(tempDir, "route-qa-report.json");
  const markdownPath = join(tempDir, "route-qa-report.md");
  const result = spawnSync(
    process.execPath,
    [
      "scripts/check-route-qa-report.mjs",
      "--dry-run",
      "--no-browser",
      `--output=${outputPath}`,
      `--output-md=${markdownPath}`,
      ...args,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        ALTFT_ROUTE_QA_ADMIN: "true",
      },
    },
  );

  try {
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(readFileSync(outputPath, "utf8"));
    return readMarkdown
      ? { report, markdown: readFileSync(markdownPath, "utf8") }
      : report;
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
}

describe("route QA report contracts", () => {
  it("emits a release matrix for the standard route inventory", () => {
    const report = runRouteQaReport();

    assert.equal(report.ok, true);
    assert.equal(report.profileMode, "single");
    assert.ok(report.totals.routes > 120, "expected public, tool, blog, and admin route inventory");
    assert.equal(report.matrix.length, report.totals.routes);
    assert.ok(report.groupMatrix.length >= 6, "expected grouped route QA surfaces");
    assert.ok(report.groupMatrix.some((group) => group.app === "web" && group.group === "tool detail"));
    assert.ok(report.groupMatrix.some((group) => group.app === "admin" && group.group === "admin public"));
    assert.equal(report.crawler.browserScope, "selected");
    assert.equal(report.crawler.mobileBrowserScope, "selected");
    assert.deepEqual(report.crawler.linkAudit, {
      observed: 0,
      uniqueDiscovered: 0,
      alreadyInventoried: 0,
      excluded: 0,
      checked: 0,
      truncated: 0,
      budget: 5000,
      linksPerPage: 80,
    });
  });

  it("keeps matrix rows compact and dashboard-ready", () => {
    const report = runRouteQaReport();
    const sample = report.matrix.find((row) => row.route === "/tools/all");

    assert.ok(sample, "expected /tools/all in route QA matrix");
    assert.deepEqual(Object.keys(sample).sort(), [
      "app",
      "durationMs",
      "group",
      "issues",
      "ok",
      "probe",
      "quality",
      "route",
      "status",
      "warnings",
    ]);
    assert.equal(sample.quality, "pass");
    assert.equal(sample.probe, "http");
  });

  it("supports strict quality gates and Markdown artifacts", () => {
    const { report, markdown } = runRouteQaReport(
      ["--strict", "--browser-scope=full", "--mobile-scope=full"],
      { readMarkdown: true },
    );

    assert.equal(report.ok, true);
    assert.equal(report.qualityGates.strict, true);
    assert.equal(report.qualityGates.pass, true);
    assert.equal(report.crawler.browserScope, "full");
    assert.equal(report.crawler.mobileBrowserScope, "full");
    assert.match(markdown, /# Route QA Report/);
    assert.match(markdown, /Gate: PASS/);
    assert.match(markdown, /Browser scope: full/);
    assert.match(markdown, /Group Matrix/);
  });

  it("partitions the full inventory into deterministic non-overlapping shards", () => {
    const full = runRouteQaReport(["--scope=full"]);
    const first = runRouteQaReport(["--scope=full", "--shard=1/2"]);
    const second = runRouteQaReport(["--scope=full", "--shard=2/2"]);
    const fullKeys = new Set(
      full.matrix.map((row) => `${row.app}:${row.route}`),
    );
    const firstKeys = new Set(
      first.matrix.map((row) => `${row.app}:${row.route}`),
    );
    const secondKeys = new Set(
      second.matrix.map((row) => `${row.app}:${row.route}`),
    );

    assert.equal(first.shard.label, "1/2");
    assert.equal(second.shard.label, "2/2");
    assert.equal(first.shard.inventoryRoutes, full.totals.routes);
    assert.equal(second.shard.inventoryRoutes, full.totals.routes);
    assert.equal(first.totals.routes + second.totals.routes, full.totals.routes);
    assert.equal(
      [...firstKeys].some((key) => secondKeys.has(key)),
      false,
      "shards must not overlap",
    );
    assert.deepEqual(new Set([...firstKeys, ...secondKeys]), fullKeys);
  });

  it("validates one-based shard specs and keeps assignments stable", () => {
    assert.deepEqual(parseRouteQaShard("3/8"), {
      index: 3,
      total: 8,
      label: "3/8",
    });
    assert.equal(parseRouteQaShard(""), null);
    assert.throws(() => parseRouteQaShard("0/4"), /Invalid route QA shard/);
    assert.throws(() => parseRouteQaShard("5/4"), /Invalid route QA shard/);

    const entry = { app: "web", route: "/tools/all/json-formatter" };
    assert.equal(
      routeQaShardNumber(entry, 4),
      routeQaShardNumber(entry, 4),
    );
  });
});
