import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

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
    const { report, markdown } = runRouteQaReport(["--strict"], { readMarkdown: true });

    assert.equal(report.ok, true);
    assert.equal(report.qualityGates.strict, true);
    assert.equal(report.qualityGates.pass, true);
    assert.match(markdown, /# Route QA Report/);
    assert.match(markdown, /Gate: PASS/);
    assert.match(markdown, /Group Matrix/);
  });
});
