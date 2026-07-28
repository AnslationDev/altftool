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

const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

function advisories(finding) {
  return (finding?.via || [])
    .filter((via) => via && typeof via === "object" && via.url)
    .map((via) => via.url);
}

function directViaNames(finding) {
  return (finding?.via || []).filter((via) => typeof via === "string");
}

function allNodesMatch(finding, predicate) {
  const nodes = Array.isArray(finding?.nodes) ? finding.nodes : [];
  return nodes.length > 0 && nodes.every(predicate);
}

function effectsSubset(finding, allowedEffects) {
  const effects = Array.isArray(finding?.effects) ? finding.effects : [];
  return effects.every((effect) => allowedEffects.has(effect));
}

function acceptFinding(name, reason) {
  if (!vulnerabilities[name]) return;
  delete vulnerabilities[name];
  console.log(`Accepted ${workspace} audit finding (${name}): ${reason}`);
}

if (workspace === "altftoolweb") {
  const eslintToolchain = new Set([
    "@eslint/config-array",
    "@eslint/eslintrc",
    "eslint",
    "eslint-config-next",
    "eslint-plugin-import",
    "eslint-plugin-jsx-a11y",
    "eslint-plugin-react",
  ]);

  for (const name of eslintToolchain) {
    const finding = vulnerabilities[name];
    if (!finding) continue;
    if (finding.isDirect || effectsSubset(finding, eslintToolchain)) {
      acceptFinding(name, "dev-only lint toolchain; production bundle/runtime does not import ESLint packages.");
    }
  }

  const flowToTsFinding = vulnerabilities["@khanacademy/flow-to-ts"];
  if (
    flowToTsFinding &&
    directViaNames(flowToTsFinding).includes("glob") &&
    existsSync("altftoolweb/src/app/transform/_lib/transformers/_flowToTs.js") &&
    readFileSync("altftoolweb/src/app/transform/_lib/transformers/_flowToTs.js", "utf8").includes(
      "@khanacademy/flow-to-ts/dist/convert.bundle.js",
    )
  ) {
    acceptFinding(
      "@khanacademy/flow-to-ts",
      "converter imports the packaged conversion bundle directly; advisory is in the unused CLI glob/file-discovery path.",
    );
  }

  const globFinding = vulnerabilities.glob;
  if (
    globFinding &&
    effectsSubset(globFinding, new Set(["@khanacademy/flow-to-ts"])) &&
    allNodesMatch(globFinding, (node) => node.startsWith("node_modules/@khanacademy/flow-to-ts/node_modules/glob"))
  ) {
    acceptFinding("glob", "only reachable through the unused @khanacademy/flow-to-ts CLI file-discovery dependency.");
  }

  const tsToZodFinding = vulnerabilities["ts-to-zod"];
  if (tsToZodFinding && directViaNames(tsToZodFinding).includes("@oclif/core")) {
    acceptFinding(
      "ts-to-zod",
      "runtime transformer imports the library generate() export; advisory chain is in the package's unused @oclif CLI dependency.",
    );
  }
  for (const name of ["@oclif/core", "ejs", "jake", "filelist"]) {
    const finding = vulnerabilities[name];
    if (!finding) continue;
    const allowed = name === "@oclif/core" ? new Set(["ts-to-zod"]) : new Set(["@oclif/core", "ejs", "jake"]);
    if (effectsSubset(finding, allowed)) {
      acceptFinding(name, "only reachable through the unused ts-to-zod command-line interface dependency chain.");
    }
  }

  const reactRouterFinding = vulnerabilities["react-router"];
  const reactRouterUrls = advisories(reactRouterFinding);
  if (
    reactRouterFinding &&
    reactRouterUrls.length === 1 &&
    reactRouterUrls[0] === "https://github.com/advisories/GHSA-qwww-vcr4-c8h2"
  ) {
    acceptFinding(
      "react-router",
      "ALTFTool embeds React Router only as client-side widgets inside Next.js and does not enable React Router RSC/actions.",
    );
  }
  const reactRouterDomFinding = vulnerabilities["react-router-dom"];
  if (reactRouterDomFinding && directViaNames(reactRouterDomFinding).every((via) => via === "react-router")) {
    acceptFinding(
      "react-router-dom",
      "remaining advisory is inherited from React Router RSC mode, which this Next.js app does not use.",
    );
  }

  const minimatchFinding = vulnerabilities.minimatch;
  if (
    minimatchFinding &&
    directViaNames(minimatchFinding).every((via) => via === "brace-expansion") &&
    effectsSubset(
      minimatchFinding,
      new Set([
        ...eslintToolchain,
        "filelist",
        "glob",
      ]),
    )
  ) {
    acceptFinding(
      "minimatch",
      "only reported through lint tooling, flow-to-ts CLI, or ts-to-zod CLI chains; converter API caps request size.",
    );
  }

  const braceFinding = vulnerabilities["brace-expansion"];
  if (
    braceFinding &&
    effectsSubset(braceFinding, new Set(["minimatch"])) &&
    allNodesMatch(braceFinding, (node) =>
      [
        "node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion",
        "node_modules/brace-expansion",
        "node_modules/editorconfig/node_modules/brace-expansion",
        "node_modules/filelist/node_modules/brace-expansion",
        "node_modules/js-beautify/node_modules/brace-expansion",
      ].includes(node),
    )
  ) {
    acceptFinding(
      "brace-expansion",
      "reported via package/tooling glob expansion paths; public transform endpoint now rejects oversized payloads.",
    );
  }
}

const blockers = Object.values(vulnerabilities).filter(
  (finding) => (severityRank[finding?.severity] || 0) >= severityRank.high,
);

if (blockers.length > 0 || (!knownLockfileFinding && auditResult.status !== 0)) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(1);
}

console.log(`${workspace} dependency audit passed with no unmitigated high or critical findings.`);
