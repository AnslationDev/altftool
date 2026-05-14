import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

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

function configured(names) {
  return names.some((name) => Boolean(envValue(name)));
}

function targetFromArgs() {
  const target = argValue("--target", "all").trim().toLowerCase();
  if (["all", "web", "admin"].includes(target)) return target;
  console.error(`Unknown Vercel deploy readiness target: ${target}`);
  process.exit(2);
}

const target = targetFromArgs();
const selectedTargets = target === "all" ? ["web", "admin"] : [target];

const checks = {
  web: {
    label: "Public web",
    root: envValue("WEB_PROJECT_ROOT") || "altftoolweb",
    requirements: [
      {
        label: "Vercel API token",
        names: ["VERCEL_TOKEN"],
      },
      {
        label: "Vercel team/org id",
        names: ["VERCEL_ORG_ID"],
      },
      {
        label: "Public web project id",
        names: ["VERCEL_WEB_PROJECT_ID", "VERCEL_PROJECT_ID"],
      },
    ],
  },
  admin: {
    label: "Admin web",
    root: envValue("ADMIN_PROJECT_ROOT") || "altftoolwebadmin",
    requirements: [
      {
        label: "Vercel API token",
        names: ["VERCEL_TOKEN"],
      },
      {
        label: "Vercel team/org id",
        names: ["VERCEL_ORG_ID"],
      },
      {
        label: "Admin project id",
        names: ["VERCEL_ADMIN_PROJECT_ID"],
      },
    ],
  },
};

function evaluateTarget(name) {
  const config = checks[name];
  const missing = [];
  const present = [];

  for (const requirement of config.requirements) {
    const ok = configured(requirement.names);
    const item = {
      label: requirement.label,
      names: requirement.names,
      displayName: requirement.names.join(" or "),
    };

    if (ok) present.push(item);
    else missing.push(item);
  }

  const projectRoot = path.resolve(root, config.root);
  const rootExists = existsSync(projectRoot);
  if (!rootExists) {
    missing.push({
      label: "Project root",
      names: [config.root],
      displayName: `${config.root} directory`,
    });
  }

  return {
    name,
    label: config.label,
    projectRoot: path.relative(root, projectRoot),
    ok: missing.length === 0,
    present,
    missing,
  };
}

const results = selectedTargets.map(evaluateTarget);
const failures = results.filter((result) => !result.ok);
const ok = failures.length === 0;

function markdownSummary() {
  const lines = [
    `### Vercel deploy readiness: ${target}`,
    "",
  ];

  for (const result of results) {
    lines.push(`#### ${result.label}`);
    lines.push(`- Status: ${result.ok ? "ready" : "blocked"}`);
    lines.push(`- Project root: \`${result.projectRoot}\``);

    if (result.missing.length > 0) {
      lines.push(`- Missing: ${result.missing.map((item) => `\`${item.displayName}\``).join(", ")}`);
    }

    if (result.present.length > 0) {
      lines.push(`- Present: ${result.present.map((item) => `\`${item.displayName}\``).join(", ")}`);
    }

    lines.push("");
  }

  if (!ok) {
    lines.push("Add the missing values as GitHub Actions repository secrets, then re-run this workflow or the failed deploy jobs.");
    lines.push("");
    lines.push("Required secret names:");
    lines.push("- `VERCEL_TOKEN`");
    lines.push("- `VERCEL_ORG_ID`");
    lines.push("- `VERCEL_WEB_PROJECT_ID` or fallback `VERCEL_PROJECT_ID`");
    lines.push("- `VERCEL_ADMIN_PROJECT_ID`");
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

const report = {
  generatedAt: new Date().toISOString(),
  target,
  ok,
  results: results.map((result) => ({
    name: result.name,
    label: result.label,
    projectRoot: result.projectRoot,
    ok: result.ok,
    missing: result.missing.map(({ label, names }) => ({ label, names })),
    present: result.present.map(({ label, names }) => ({ label, names })),
  })),
};

console.log("Vercel deploy readiness:");
for (const result of results) {
  console.log(`\n${result.label}`);
  console.log(`  ${result.ok ? "PASS" : "FAIL"} status: ${result.ok ? "ready" : "blocked"}`);
  console.log(`  INFO project root: ${result.projectRoot}`);

  for (const item of result.present) {
    console.log(`  PASS ${item.displayName}: configured`);
  }
  for (const item of result.missing) {
    console.log(`  FAIL ${item.displayName}: required but missing`);
  }
}

console.log("\nSummary");
console.log(JSON.stringify(report, null, 2));

if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, markdownSummary(), { flag: "a" });
}

if (process.env.VERCEL_READINESS_OUTPUT_PATH) {
  writeFileSync(process.env.VERCEL_READINESS_OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

if (!ok) {
  for (const result of failures) {
    const names = result.missing.map((item) => item.displayName).join(", ");
    console.error(`::error::${result.label} Vercel deploy is blocked by missing value(s): ${names}`);
  }
  process.exit(1);
}
