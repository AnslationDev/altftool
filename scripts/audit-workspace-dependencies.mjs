import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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

function collectSourceFiles(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(entryPath);
    if (!/\.(?:[cm]?[jt]sx?)$/u.test(entry.name)) return [];
    return statSync(entryPath).size <= 1024 * 1024 ? [entryPath] : [];
  });
}

function usesReactRouterRscApis(directory) {
  const rscEntryPoint =
    /(?:from\s*|import\s*\(\s*|require\s*\(\s*)["']react-router(?:-dom)?\/(?:rsc(?:\/[^"']*)?|dom\/server|server)["']/u;
  const rscApi =
    /\b(?:(?:unstable_|UNSAFE_)?[A-Za-z0-9]*RSC[A-Za-z0-9_]*|unstable_(?:createCallServer|getRequest))\b/u;

  return collectSourceFiles(directory).some((file) => {
    const source = readFileSync(file, "utf8")
      .replace(/^\s*\/\/.*$/gmu, "")
      .replace(/\/\*[\s\S]*?\*\//gu, "");
    return rscEntryPoint.test(source) || rscApi.test(source);
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
  isAtLeast(resolvedPostcssVersion, [8, 5, 18]) &&
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
  "https://github.com/advisories/GHSA-r28c-9q8g-f849",
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

const reactRouterFinding = vulnerabilities["react-router"];
const reactRouterDomFinding = vulnerabilities["react-router-dom"];
const reactRouterAdvisories = (reactRouterFinding?.via || [])
  .filter((finding) => finding && typeof finding === "object")
  .map((finding) => finding.url);
const reactRouterVersionPath =
  workspace === "altftoolweb"
    ? require.resolve("react-router/package.json", { paths: [path.join(process.cwd(), workspace)] })
    : null;
const reactRouterDomVersionPath =
  workspace === "altftoolweb"
    ? require.resolve("react-router-dom/package.json", { paths: [path.join(process.cwd(), workspace)] })
    : null;
const reactRouterVersion = reactRouterVersionPath
  ? JSON.parse(readFileSync(reactRouterVersionPath, "utf8")).version
  : null;
const reactRouterDomVersion = reactRouterDomVersionPath
  ? JSON.parse(readFileSync(reactRouterDomVersionPath, "utf8")).version
  : null;
// GHSA-qwww-vcr4-c8h2 only affects unstable RSC APIs. Keep this exception
// version- and advisory-specific, and fail it closed if those APIs enter src/.
const knownClientOnlyReactRouterFinding =
  workspace === "altftoolweb" &&
  reactRouterVersion === "7.18.1" &&
  reactRouterDomVersion === "7.18.1" &&
  reactRouterAdvisories.length === 1 &&
  reactRouterAdvisories[0] === "https://github.com/advisories/GHSA-qwww-vcr4-c8h2" &&
  (reactRouterFinding?.nodes || []).every((node) => node === "node_modules/react-router") &&
  (reactRouterDomFinding?.via || []).length === 1 &&
  reactRouterDomFinding.via[0] === "react-router" &&
  (reactRouterDomFinding?.nodes || []).every((node) => node === "node_modules/react-router-dom") &&
  !usesReactRouterRscApis(path.join(workspace, "src"));

if (knownClientOnlyReactRouterFinding) {
  delete vulnerabilities["react-router"];
  delete vulnerabilities["react-router-dom"];
  console.log(
    "Accepted React Router RSC-only advisory: this client-router app does not import unstable RSC APIs.",
  );
}

const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const blockers = Object.values(vulnerabilities).filter(
  (finding) => (severityRank[finding?.severity] || 0) >= severityRank.high,
);

if (
  blockers.length > 0 ||
  (!knownLockfileFinding && !knownClientOnlyReactRouterFinding && auditResult.status !== 0)
) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(1);
}

console.log(`${workspace} dependency audit passed with no unmitigated high or critical findings.`);
