import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createFirebaseDataIntegrityReport } from "@altftool/core/firebaseDataIntegrity";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

function parseSections(value) {
  return String(value || "")
    .split(",")
    .map((section) => section.trim())
    .filter(Boolean);
}

function summarizeReport(report) {
  return {
    generatedAt: report.generatedAt,
    durationMs: report.durationMs,
    projectId: report.projectId,
    status: report.status,
    score: report.score,
    sections: report.totals.sections,
    checks: report.totals.checks,
    passed: report.totals.passed,
    failed: report.totals.failed,
    failures: report.totals.failures,
    warnings: report.totals.warnings,
  };
}

export function renderFirebaseDataIntegrityMarkdown(report) {
  const lines = [
    "# Firebase Data Integrity Report",
    "",
    `- Status: ${report.status}`,
    `- Score: ${report.score}/100`,
    `- Project: ${report.projectId}`,
    `- Duration: ${report.durationMs}ms`,
    `- Sample limit: ${report.sampleLimit}`,
    `- Checks: ${report.totals.passed}/${report.totals.checks} passed`,
    `- Failures: ${report.totals.failures}`,
    `- Warnings: ${report.totals.warnings}`,
    "",
    "## Checks",
    "",
  ];

  for (const check of report.checks) {
    lines.push(`- ${check.ok ? "PASS" : "FAIL"} ${check.label}: ${check.detail}`);
  }

  if (report.failures.length) {
    lines.push("", "## Failures", "");
    for (const issue of report.failures.slice(0, 80)) {
      lines.push(`- ${issue.section}: ${issue.message}`);
    }
  }

  if (report.warnings.length) {
    lines.push("", "## Warnings", "");
    for (const issue of report.warnings.slice(0, 80)) {
      lines.push(`- ${issue.section}: ${issue.message}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

async function writeArtifact(filePath, content) {
  if (!filePath) return;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

function printReport(report, jsonOnly = false) {
  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("Firebase data integrity check");
  console.log(JSON.stringify(summarizeReport(report), null, 2));

  if (report.failures.length) {
    console.error("Firebase data integrity failures:");
    for (const issue of report.failures.slice(0, 30)) console.error(`- ${issue.section}: ${issue.message}`);
  }

  if (report.warnings.length) {
    console.log("Firebase data integrity warnings:");
    for (const issue of report.warnings.slice(0, 30)) console.log(`- ${issue.section}: ${issue.message}`);
  }

  if (!report.failures.length) {
    console.log("Firebase data integrity check passed.");
  }
}

async function main() {
  const report = await createFirebaseDataIntegrityReport({
    env: process.env,
    sampleLimit: Number(argValue("--limit", process.env.ALTFT_FIREBASE_INTEGRITY_SAMPLE_LIMIT || "25")),
    sections: parseSections(argValue("--sections", process.env.ALTFT_FIREBASE_INTEGRITY_SECTIONS || "")),
    strict: args.has("--strict") || envFlag("ALTFT_FIREBASE_INTEGRITY_STRICT"),
    timeoutMs: Number(argValue("--timeout-ms", process.env.ALTFT_FIREBASE_INTEGRITY_TIMEOUT_MS || "8000")),
  });
  const outputPath = resolveOutputPath(argValue("--output", process.env.ALTFT_FIREBASE_INTEGRITY_OUTPUT || ""));
  const markdownPath = resolveOutputPath(
    argValue(
      "--output-md",
      argValue("--output-markdown", process.env.ALTFT_FIREBASE_INTEGRITY_MARKDOWN_OUTPUT || ""),
    ),
  );

  await writeArtifact(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeArtifact(markdownPath, renderFirebaseDataIntegrityMarkdown(report));
  printReport(report, args.has("--json"));

  if (!report.ok) {
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
