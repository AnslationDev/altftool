import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const workspace = process.argv[2];
const workspaceConfig = {
  altftoolweb: "altftoolweb/scripts/use-patched-next-dependencies.mjs",
  altftoolwebadmin: "altftoolwebadmin/scripts/use-patched-next-dependencies.mjs",
};
const patchScript = workspaceConfig[workspace];

if (!patchScript) {
  console.error(`Usage: node scripts/audit-workspace-dependencies.mjs ${Object.keys(workspaceConfig).join("|")}`);
  process.exit(2);
}

function versionParts(version) {
  return String(version)
    .split(".")
    .slice(0, 3)
    .map((part) => Number.parseInt(part, 10) || 0);
}

function isAtLeast(version, minimum) {
  const current = versionParts(version);
  for (let index = 0; index < minimum.length; index += 1) {
    if (current[index] !== minimum[index]) return current[index] > minimum[index];
  }
  return true;
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
  });
}

const workspacePackage = JSON.parse(readFileSync(path.join(workspace, "package.json"), "utf8"));
if (!String(workspacePackage.scripts?.build || "").includes("use-patched-next-dependencies.mjs")) {
  console.error(`${workspace} build does not apply the patched Next.js dependencies.`);
  process.exit(1);
}

const patchResult = run(process.execPath, [patchScript]);
if (patchResult.status !== 0) {
  process.stderr.write(patchResult.stderr || patchResult.stdout);
  process.exit(patchResult.status || 1);
}
if (patchResult.stdout) process.stdout.write(patchResult.stdout);

const nextRoot = path.dirname(require.resolve("next/package.json"));
const nestedPostcss = path.join(nextRoot, "node_modules", "postcss");
const resolvedPostcss = require.resolve("postcss/package.json", { paths: [nextRoot] });
const resolvedPostcssVersion = JSON.parse(readFileSync(resolvedPostcss, "utf8")).version;
const runtimePatchReady =
  !existsSync(nestedPostcss) &&
  isAtLeast(resolvedPostcssVersion, [8, 5, 12]) &&
  !resolvedPostcss.startsWith(nestedPostcss);

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const auditResult = run(npmCommand, [
  "audit",
  "--json",
  "--omit=optional",
  "--audit-level=high",
  "--workspace",
  workspace,
]);

let report;
try {
  report = JSON.parse(auditResult.stdout);
} catch {
  process.stderr.write(auditResult.stderr || auditResult.stdout || "npm audit returned no report.\n");
  process.exit(auditResult.status || 1);
}

const vulnerabilities = { ...(report.vulnerabilities || {}) };
const postcssFinding = vulnerabilities.postcss;
const nextFinding = vulnerabilities.next;
const knownPostcssAdvisories = new Set([
  "https://github.com/advisories/GHSA-qx2v-qp2m-jg93",
  "https://github.com/advisories/GHSA-6g55-p6wh-862q",
]);
const postcssAdvisories = (postcssFinding?.via || [])
  .filter((finding) => finding && typeof finding === "object")
  .map((finding) => finding.url);
const knownLockfileFinding =
  runtimePatchReady &&
  postcssAdvisories.length > 0 &&
  postcssAdvisories.every((url) => knownPostcssAdvisories.has(url)) &&
  (postcssFinding?.nodes || []).every((node) => node === "node_modules/next/node_modules/postcss") &&
  (nextFinding?.via || []).every((finding) => finding === "postcss");

if (knownLockfileFinding) {
  delete vulnerabilities.postcss;
  delete vulnerabilities.next;
  console.log(
    `Accepted Next.js lockfile-only PostCSS advisory: build resolves patched postcss ${resolvedPostcssVersion}.`,
  );
}

const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const blockers = Object.values(vulnerabilities).filter(
  (finding) => (severityRank[finding?.severity] || 0) >= severityRank.high,
);

if (blockers.length > 0 || (!knownLockfileFinding && auditResult.status !== 0)) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(1);
}

console.log(`${workspace} dependency audit passed with no unmitigated high or critical findings.`);
