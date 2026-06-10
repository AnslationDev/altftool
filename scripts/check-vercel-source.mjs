import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const DEFAULT_EXPECTED_REPO = "AnslationDev/altftool";
const VALID_TARGETS = new Set(["all", "web", "admin"]);

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];

  return fallback;
}

function envValue(name) {
  return typeof process.env[name] === "string" ? process.env[name].trim() : "";
}

function normalizeRepo(value = "") {
  const cleaned = String(value || "")
    .trim()
    .replace(/^git\+/, "")
    .replace(/^https:\/\/github\.com\//i, "")
    .replace(/^git@github\.com:/i, "")
    .replace(/\.git$/i, "")
    .replace(/^\/+|\/+$/g, "");

  if (!cleaned) return "";

  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`.toLowerCase();
  }

  return cleaned.toLowerCase();
}

function repoName(value = "") {
  const normalized = normalizeRepo(value);
  return normalized.split("/").filter(Boolean).pop() || "";
}

function gitOutput(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  return result.status === 0 ? result.stdout.trim() : "";
}

function projectJsonValue(projectRoot) {
  const candidates = [
    path.join(root, projectRoot, ".vercel/project.json"),
    path.join(root, ".vercel/project.json"),
  ];

  for (const candidate of candidates) {
    try {
      const payload = JSON.parse(readFileSync(candidate, "utf8"));
      if (payload?.projectId) {
        return {
          orgId: payload.orgId || "",
          projectId: payload.projectId || "",
          projectName: payload.projectName || "",
          rootDirectory: payload.settings?.rootDirectory ?? null,
          path: path.relative(root, candidate),
        };
      }
    } catch {}
  }

  return null;
}

function expectedRepo() {
  return normalizeRepo(argValue("--expected-repo", envValue("ALTFT_EXPECTED_GITHUB_REPO") || DEFAULT_EXPECTED_REPO));
}

function selectedTargets() {
  const target = argValue("--target", envValue("ALTFT_DEPLOY_TARGET") || "all").toLowerCase();
  if (!VALID_TARGETS.has(target)) {
    console.error(`Unknown source-check target: ${target}`);
    process.exit(2);
  }
  return target === "all" ? ["web", "admin"] : [target];
}

function localSourceReport(expected) {
  const origin = gitOutput(["remote", "get-url", "origin"]);
  const branch = gitOutput(["branch", "--show-current"]);
  const commitSha = gitOutput(["rev-parse", "HEAD"]);
  const githubRepository = envValue("GITHUB_REPOSITORY");
  const candidates = [
    { label: "GITHUB_REPOSITORY", value: githubRepository },
    { label: "git origin", value: origin },
  ].filter((candidate) => candidate.value);
  const matchingCandidate = candidates.find((candidate) => normalizeRepo(candidate.value) === expected);

  return {
    expected,
    ok: Boolean(matchingCandidate),
    branch,
    commitSha,
    origin,
    githubRepository,
    matchedBy: matchingCandidate?.label || "",
    candidates: candidates.map((candidate) => ({
      label: candidate.label,
      repo: normalizeRepo(candidate.value),
      ok: normalizeRepo(candidate.value) === expected,
    })),
  };
}

function targetProject(target) {
  const roots = {
    web: envValue("WEB_PROJECT_ROOT") || "altftoolweb",
    admin: envValue("ADMIN_PROJECT_ROOT") || "altftoolwebadmin",
  };
  const projectIds = {
    web: envValue("VERCEL_WEB_PROJECT_ID") || envValue("VERCEL_PROJECT_ID"),
    admin: envValue("VERCEL_ADMIN_PROJECT_ID"),
  };
  const link = projectJsonValue(roots[target]);

  return {
    target,
    root: roots[target],
    projectId: projectIds[target] || link?.projectId || "",
    projectLink: link,
  };
}

async function fetchJson(url, token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = payload?.error?.message || payload?.message || `Vercel API returned ${response.status}.`;
      throw new Error(detail);
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function deploymentRepoSignals(meta = {}) {
  return [
    {
      label: "altftSourceRepo",
      repo: normalizeRepo(meta.altftSourceRepo),
      strict: true,
    },
    {
      label: "githubOrg/githubRepo",
      repo: normalizeRepo(meta.githubOrg && meta.githubRepo ? `${meta.githubOrg}/${meta.githubRepo}` : meta.githubRepo),
      strict: Boolean(meta.githubOrg),
    },
    {
      label: "githubCommitOrg/githubCommitRepo",
      repo: normalizeRepo(
        meta.githubCommitOrg && meta.githubCommitRepo
          ? `${meta.githubCommitOrg}/${meta.githubCommitRepo}`
          : meta.githubCommitRepo,
      ),
      strict: Boolean(meta.githubCommitOrg),
    },
  ].filter((signal) => signal.repo);
}

function repoSignalMatches(signal, expected) {
  if (signal.strict || expected.includes("/")) {
    return signal.repo === expected;
  }
  return repoName(signal.repo) === repoName(expected);
}

function evaluateDeployment({ target, deployment, expected, expectedCommit }) {
  const meta = deployment?.meta || {};
  const signals = deploymentRepoSignals(meta);
  const matchingSignal = signals.find((signal) => repoSignalMatches(signal, expected));
  const commitSha = meta.githubCommitSha || meta.githubSha || "";
  const commitOk = !expectedCommit || !commitSha || commitSha === expectedCommit;

  return {
    target,
    checked: true,
    ok: Boolean(matchingSignal) && commitOk,
    state: deployment?.state || deployment?.readyState || "unknown",
    deploymentId: deployment?.id || "",
    deploymentUrl: deployment?.url || "",
    source: deployment?.source || "",
    matchedBy: matchingSignal?.label || "",
    expected,
    expectedCommit: expectedCommit || "",
    commitSha,
    commitOk,
    signals: signals.map((signal) => ({
      label: signal.label,
      repo: signal.repo,
      ok: repoSignalMatches(signal, expected),
    })),
  };
}

async function deploymentForTarget({ deploymentUrl, projectId, teamId, token }) {
  if (deploymentUrl) {
    const encoded = encodeURIComponent(deploymentUrl.replace(/^https?:\/\//, ""));
    return fetchJson(`https://api.vercel.com/v13/deployments/${encoded}?teamId=${encodeURIComponent(teamId)}`, token);
  }

  if (!projectId) return null;

  const payload = await fetchJson(
    `https://api.vercel.com/v13/deployments?projectId=${encodeURIComponent(projectId)}&teamId=${encodeURIComponent(teamId)}&limit=1&target=production`,
    token,
  );

  return payload?.deployments?.[0] ? { deployment: payload.deployments[0] } : null;
}

async function liveSourceReport({ targets, expected }) {
  const token = envValue("VERCEL_TOKEN");
  const teamId = envValue("VERCEL_ORG_ID");
  const expectedCommit = argValue("--expected-commit", envValue("ALTFT_EXPECTED_COMMIT"));
  const deploymentUrl = argValue("--deployment-url", envValue("ALTFT_DEPLOYMENT_URL"));

  if (!token || !teamId) {
    return targets.map((target) => ({
      target,
      checked: false,
      ok: true,
      skipped: true,
      reason: "VERCEL_TOKEN and VERCEL_ORG_ID are not available in this environment.",
    }));
  }

  const reports = [];

  for (const target of targets) {
    try {
      const project = targetProject(target);
      const payload = await deploymentForTarget({
        deploymentUrl,
        projectId: project.projectId,
        teamId,
        token,
      });
      const deployment = payload?.deployment || payload;

      if (!deployment?.id) {
        reports.push({
          target,
          checked: true,
          ok: false,
          error: "No production deployment was returned by Vercel.",
        });
        continue;
      }

      reports.push(evaluateDeployment({ target, deployment, expected, expectedCommit }));
    } catch (error) {
      reports.push({
        target,
        checked: true,
        ok: false,
        error: error?.message || "Vercel deployment source check failed.",
      });
    }
  }

  return reports;
}

function markdownSummary(report) {
  const lines = [
    `### Vercel source check`,
    "",
    `- Expected repo: \`${report.expected}\``,
    `- Local source: ${report.local.ok ? "ready" : "blocked"}${report.local.matchedBy ? ` via ${report.local.matchedBy}` : ""}`,
  ];

  for (const target of report.targets) {
    lines.push("");
    lines.push(`#### ${target.target}`);
    lines.push(`- Status: ${target.ok ? "ready" : "blocked"}`);
    if (target.skipped) {
      lines.push(`- Live check: skipped (${target.reason})`);
    } else {
      lines.push(`- Deployment: \`${target.deploymentId || "unknown"}\``);
      if (target.deploymentUrl) lines.push(`- URL: \`${target.deploymentUrl}\``);
      if (target.matchedBy) lines.push(`- Matched by: \`${target.matchedBy}\``);
      if (target.error) lines.push(`- Error: ${target.error}`);
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

const expected = expectedRepo();
const targets = selectedTargets();
const local = localSourceReport(expected);
const live = await liveSourceReport({ targets, expected });
const report = {
  generatedAt: new Date().toISOString(),
  expected,
  ok: local.ok && live.every((target) => target.ok),
  local,
  targets: live,
};

console.log("Vercel source check:");
console.log(`  Expected repo: ${expected}`);
console.log(`  Local source: ${local.ok ? "PASS" : "FAIL"}${local.matchedBy ? ` (${local.matchedBy})` : ""}`);
for (const target of live) {
  const status = target.ok ? "PASS" : "FAIL";
  const suffix = target.skipped ? ` skipped: ${target.reason}` : target.matchedBy ? ` matched by ${target.matchedBy}` : "";
  console.log(`  ${status} ${target.target}:${suffix}`);
  if (target.error) console.log(`    ${target.error}`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, markdownSummary(report), { flag: "a" });
}

if (process.env.VERCEL_SOURCE_OUTPUT_PATH) {
  writeFileSync(process.env.VERCEL_SOURCE_OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

if (!report.ok) {
  console.error("::error::Vercel deployment source does not match the expected final repo.");
  process.exit(1);
}
