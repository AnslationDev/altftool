import { readFile } from "node:fs/promises";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const reportPath = path.join(
  workspaceRoot,
  "altftoolwebadmin/src/data/toolReadinessReport.json",
);
const strict = process.argv.includes("--strict");

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

let report;
try {
  report = JSON.parse(await readFile(reportPath, "utf8"));
} catch (error) {
  console.error(
    `Tool readiness failed: ${path.relative(workspaceRoot, reportPath)} is missing or invalid.`,
  );
  console.error(error?.message || error);
  process.exit(1);
}

const summary = report?.summary || {};
const counts = summary.counts || {};
const items = Array.isArray(report?.items) ? report.items : [];
const countedTotal =
  Number(counts.working || 0) +
  Number(counts["api-required"] || 0) +
  Number(counts.partial || 0) +
  Number(counts.broken || 0);
const failures = [];

if (!items.length) failures.push("report contains no tool rows");
if (Number(summary.total) !== items.length) {
  failures.push(
    `summary total ${summary.total || 0} does not match ${items.length} report rows`,
  );
}
if (countedTotal !== items.length) {
  failures.push(
    `status counts total ${countedTotal} does not match ${items.length} report rows`,
  );
}
if (Number(counts.broken || 0) > 0) {
  failures.push(`${counts.broken} structurally broken tool(s) detected`);
}
if (strict && Number(summary.priority?.needsAttention || 0) > 0) {
  failures.push(
    `${summary.priority.needsAttention} priority tool(s) are partial or broken`,
  );
}

console.log(`Tool readiness: ${strict ? "strict" : "advisory"}`);
console.log(
  [
    `${formatCount(summary.total)} total`,
    `${formatCount(counts.working)} working`,
    `${formatCount(counts["api-required"])} API-required`,
    `${formatCount(counts.partial)} partial`,
    `${formatCount(counts.broken)} broken`,
  ].join(" · "),
);
console.log(
  `Automated evidence: ${formatCount(summary.automatedTests)}/${formatCount(summary.total)} (${formatCount(summary.automatedCoverage)}%)`,
);
console.log(
  `Priority readiness: ${formatCount(summary.priority?.verified)}/${formatCount(summary.priority?.total)}`,
);
console.log(
  `API configuration: ${formatCount(summary.api?.counts?.configured)} configured · ${formatCount(summary.api?.counts?.["missing-config"])} missing config · ${formatCount(summary.api?.counts?.["runtime-check"])} runtime checks`,
);

const attentionRows = items
  .filter((item) => item.status === "broken" || item.status === "partial")
  .sort(
    (a, b) =>
      Number(b.priority) - Number(a.priority) ||
      a.score - b.score ||
      a.slug.localeCompare(b.slug),
  )
  .slice(0, 12);

if (attentionRows.length) {
  console.log("\nHighest-priority follow-up");
  for (const item of attentionRows) {
    console.log(
      `  ${item.status.toUpperCase()} ${item.slug}: ${(item.issues || []).join("; ") || "functional evidence incomplete"}`,
    );
  }
}

if (failures.length) {
  console.error("\nTool readiness gate failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nTool readiness gate passed.");
