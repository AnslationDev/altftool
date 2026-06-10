import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

test("release doctor emits a compact offline JSON summary without secrets", () => {
  const result = spawnSync(
    process.execPath,
    ["--no-warnings", "scripts/run-release-doctor.mjs", "--offline", "--json"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        VERCEL_TOKEN: " ",
        VERCEL_TOKEN_FILE: path.join(os.tmpdir(), "missing-altft-vercel-token"),
      },
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.doesNotMatch(result.stdout, /PRIVATE KEY-----/);
  assert.doesNotMatch(result.stdout, /vcp_[A-Za-z0-9]/);

  const payload = JSON.parse(result.stdout);
  assert.equal(payload.offline, true);
  assert.equal(payload.summary.counts.block, 0);
  assert.ok(["ready", "ready-with-warnings"].includes(payload.status));
  assert.ok(payload.checks.some((check) => check.key === "health-manifest" && check.status === "pass"));
  assert.ok(payload.checks.some((check) => check.key === "route-qa" && check.status === "pass"));
  assert.ok(payload.checks.some((check) => check.key === "blog-content" && check.status === "pass"));
  assert.ok(payload.checks.some((check) => check.key === "firebase-data-integrity" && check.status === "warn"));
  assert.ok(payload.checks.some((check) => check.key === "performance-budget" && check.status === "pass"));
  assert.ok(payload.checks.some((check) => check.key === "production-links" && check.status === "warn"));
  assert.ok(payload.checks.some((check) => check.key === "vercel-readiness"));
  assert.equal(
    payload.checks.find((check) => check.key === "vercel-readiness")?.command,
    "npm run deploy:readiness -- --target=all",
  );
});

test("release doctor writes markdown reports and GitHub summaries without secrets", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "altft-release-doctor-"));
  const markdownPath = path.join(tmpDir, "release-doctor.md");
  const summaryPath = path.join(tmpDir, "github-summary.md");

  try {
    const result = spawnSync(
      process.execPath,
      [
        "--no-warnings",
        "scripts/run-release-doctor.mjs",
        "--offline",
        "--json",
        "--output-md",
        markdownPath,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          GITHUB_STEP_SUMMARY: summaryPath,
          VERCEL_TOKEN: " ",
          VERCEL_TOKEN_FILE: path.join(os.tmpdir(), "missing-altft-vercel-token"),
        },
      },
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(fs.existsSync(markdownPath), true);
    assert.equal(fs.existsSync(summaryPath), true);

    const markdown = fs.readFileSync(markdownPath, "utf8");
    const summary = fs.readFileSync(summaryPath, "utf8");

    for (const text of [markdown, summary]) {
      assert.match(text, /## AltFTool Release Doctor/);
      assert.match(text, /\| Check \| Status \| Score \| Detail \| Next command \|/);
      assert.match(text, /npm run deploy:readiness -- --target=all/);
      assert.match(text, /npm run firebase:integrity:strict/);
      assert.match(text, /npm run performance:budget:strict/);
      assert.match(text, /npm run monitor:links:strict/);
      assert.match(text, /### Attention Needed/);
      assert.doesNotMatch(text, /PRIVATE KEY-----/);
      assert.doesNotMatch(text, /vcp_[A-Za-z0-9]/);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("release doctor blocks missing Vercel token only when CI token is required", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--no-warnings",
      "scripts/run-release-doctor.mjs",
      "--offline",
      "--json",
      "--require-vercel-token",
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        VERCEL_TOKEN: " ",
        VERCEL_TOKEN_FILE: path.join(os.tmpdir(), "missing-altft-vercel-token"),
      },
    },
  );

  assert.equal(result.status, 1, result.stderr || result.stdout);
  assert.doesNotMatch(result.stdout, /PRIVATE KEY-----/);
  assert.doesNotMatch(result.stdout, /vcp_[A-Za-z0-9]/);

  const payload = JSON.parse(result.stdout);
  const vercelCheck = payload.checks.find((check) => check.key === "vercel-readiness");

  assert.equal(payload.status, "blocked");
  assert.equal(vercelCheck?.status, "block");
  assert.equal(vercelCheck?.meta?.requireToken, true);
  assert.match(vercelCheck?.detail || "", /requires VERCEL_TOKEN or VERCEL_TOKEN_FILE/);
  assert.match(vercelCheck?.nextAction || "", /secure CI\/deploy environment/);
});
