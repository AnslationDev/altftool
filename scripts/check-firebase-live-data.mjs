import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createFirebaseLiveDataReport } from "@altftool/core/firebaseLiveData";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const index = rawArgs.indexOf(name);
  if (index >= 0 && rawArgs[index + 1] && !rawArgs[index + 1].startsWith("--")) {
    return rawArgs[index + 1];
  }

  const match = rawArgs.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function envFlag(name) {
  return process.env[name] === "true" || process.env[name] === "1";
}

function resolveOutputPath(value) {
  if (!value) return "";
  return path.isAbsolute(value) ? value : path.join(workspaceRoot, value);
}

const jsonOnly = args.has("--json");
const strict = args.has("--strict") || envFlag("ALTFT_FIREBASE_LIVE_STRICT");
const outputPath = resolveOutputPath(
  argValue("--output", process.env.ALTFT_FIREBASE_LIVE_OUTPUT || ""),
);
const markdownPath = resolveOutputPath(
  argValue(
    "--output-md",
    argValue("--output-markdown", process.env.ALTFT_FIREBASE_LIVE_MARKDOWN_OUTPUT || ""),
  ),
);
const minScore = Number(
  argValue(
    "--min-score",
    process.env.ALTFT_FIREBASE_LIVE_MIN_SCORE || (strict ? "100" : "1"),
  ),
);
const timeoutMs = Number(argValue("--timeout-ms", process.env.ALTFT_FIREBASE_LIVE_TIMEOUT_MS || "8000"));
const requiredSections = argValue(
  "--require-sections",
  process.env.ALTFT_FIREBASE_LIVE_REQUIRED_SECTIONS || "",
)
  .split(",")
  .map((section) => section.trim())
  .filter(Boolean);

function statusIcon(ok) {
  return ok ? "PASS" : "FAIL";
}

function summarizeReport(report, gateFailures = []) {
  return {
    generatedAt: report.generatedAt,
    durationMs: report.durationMs,
    projectId: report.projectId,
    status: report.status,
    score: report.score,
    checks: report.checks.length,
    passed: report.checks.filter((check) => check.ok).length,
    failed: report.checks.filter((check) => !check.ok).length,
    gateFailures,
  };
}

function applyQualityGate(report) {
  const gateFailures = [...report.failures];

  if (Number.isFinite(minScore) && report.score < minScore) {
    gateFailures.push(`Firebase live data score ${report.score} is below required ${minScore}.`);
  }

  for (const section of requiredSections) {
    if (!report.sections?.[section]) {
      gateFailures.push(`Required Firebase section missing: ${section}`);
      continue;
    }

    const matchingChecks = report.checks.filter((check) => check.key === section || check.key.startsWith(section));
    if (matchingChecks.length && matchingChecks.some((check) => !check.ok)) {
      gateFailures.push(`Required Firebase section failed: ${section}`);
    }
  }

  return {
    ...report,
    ok: gateFailures.length === 0,
    gate: {
      strict,
      minScore: Number.isFinite(minScore) ? minScore : null,
      requiredSections,
      ok: gateFailures.length === 0,
      failures: gateFailures,
    },
  };
}

function renderMarkdown(report) {
  const lines = [
    "# Firebase Live Data Report",
    "",
    `- Status: ${report.status}`,
    `- Score: ${report.score}/100`,
    `- Project: ${report.projectId}`,
    `- Duration: ${report.durationMs}ms`,
    `- Gate: ${report.gate.ok ? "PASS" : "FAIL"}`,
    "",
    "## Checks",
    "",
  ];

  for (const check of report.checks) {
    lines.push(`- ${statusIcon(check.ok)} ${check.label}: ${check.detail}`);
  }

  if (report.gate.failures.length) {
    lines.push("", "## Gate Failures", "");
    for (const failure of report.gate.failures) lines.push(`- ${failure}`);
  }

  return `${lines.join("\n")}\n`;
}

async function writeJson(filePath, data) {
  if (!filePath) return;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeMarkdown(filePath, markdown) {
  if (!filePath) return;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, markdown, "utf8");
}

function printReport(report) {
  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const summary = summarizeReport(report, report.gate.failures);
  console.log("Firebase live data check");
  console.log(JSON.stringify(summary, null, 2));

  if (report.gate.failures.length) {
    console.error("Firebase live data check failed:");
    for (const failure of report.gate.failures) console.error(`- ${failure}`);
    return;
  }

  console.log("Firebase live data check passed.");
}

const report = applyQualityGate(
  await createFirebaseLiveDataReport({
    env: process.env,
    timeoutMs,
  }),
);

await writeJson(outputPath, report);
await writeMarkdown(markdownPath, renderMarkdown(report));
printReport(report);

if (!report.ok) {
  process.exit(1);
}
