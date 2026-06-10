import fs from "node:fs";
import path from "node:path";

const VALID_TARGETS = new Set(["all", "web", "admin"]);

function envValue(env, name) {
  return typeof env?.[name] === "string" ? env[name].trim() : "";
}

function fileValue(filePath = "") {
  const trimmedPath = String(filePath || "").trim();
  if (!trimmedPath) return "";

  try {
    return fs.readFileSync(trimmedPath, "utf8").trim();
  } catch {
    return "";
  }
}

function configured(env, requirement) {
  const envConfigured = requirement.names.some((name) => Boolean(envValue(env, name)));
  const fileConfigured = (requirement.fileNames || []).some((name) => Boolean(fileValue(envValue(env, name))));

  return envConfigured || fileConfigured || Boolean(requirement.fallbackValue);
}

function normalizeTarget(target = "all") {
  const value = String(target || "all").trim().toLowerCase();
  return VALID_TARGETS.has(value) ? value : "all";
}

function selectedTargets(target) {
  return target === "all" ? ["web", "admin"] : [target];
}

function readProjectLink(root, cwd) {
  const candidates = [
    path.resolve(/* turbopackIgnore: true */ cwd, root, ".vercel/project.json"),
    path.resolve(/* turbopackIgnore: true */ cwd, ".vercel/project.json"),
  ];

  for (const candidate of candidates) {
    try {
      const raw = JSON.parse(fs.readFileSync(/* turbopackIgnore: true */ candidate, "utf8"));
      if (raw?.projectId || raw?.orgId) {
        return {
          orgId: raw.orgId || "",
          projectId: raw.projectId || "",
          projectName: raw.projectName || "",
          path: candidate,
        };
      }
    } catch {}
  }

  return null;
}

function createTargetConfig(env = process.env, options = {}) {
  const cwd = options.cwd || process.cwd();
  const webRoot = envValue(env, "WEB_PROJECT_ROOT") || options.webProjectRoot || "altftoolweb";
  const adminRoot = envValue(env, "ADMIN_PROJECT_ROOT") || options.adminProjectRoot || "altftoolwebadmin";
  const webLink = readProjectLink(webRoot, cwd);
  const adminLink = readProjectLink(adminRoot, cwd);

  return {
    web: {
      label: "Public web",
      root: webRoot,
      requirements: [
        {
          label: "Vercel API token",
          names: ["VERCEL_TOKEN"],
          fileNames: ["VERCEL_TOKEN_FILE"],
        },
        {
          label: "Vercel team/org id",
          names: ["VERCEL_ORG_ID"],
          fallbackValue: webLink?.orgId,
        },
        {
          label: "Public web project id",
          names: ["VERCEL_WEB_PROJECT_ID", "VERCEL_PROJECT_ID"],
          fallbackValue: webLink?.projectId,
        },
      ],
      link: webLink,
    },
    admin: {
      label: "Admin web",
      root: adminRoot,
      requirements: [
        {
          label: "Vercel API token",
          names: ["VERCEL_TOKEN"],
          fileNames: ["VERCEL_TOKEN_FILE"],
        },
        {
          label: "Vercel team/org id",
          names: ["VERCEL_ORG_ID"],
          fallbackValue: adminLink?.orgId,
        },
        {
          label: "Admin project id",
          names: ["VERCEL_ADMIN_PROJECT_ID"],
          fallbackValue: adminLink?.projectId,
        },
      ],
      link: adminLink,
    },
  };
}

function evaluateTarget(name, config, env) {
  const missing = [];
  const present = [];

  for (const requirement of config.requirements) {
    const ok = configured(env, requirement);
    const item = {
      label: requirement.label,
      names: [...requirement.names, ...(requirement.fileNames || [])],
      displayName: [...requirement.names, ...(requirement.fileNames || [])].join(" or "),
      source: requirement.fallbackValue && !requirement.names.some((envName) => Boolean(envValue(env, envName)))
        ? "vercel-project-link"
        : "env",
    };

    if (ok) present.push(item);
    else missing.push(item);
  }

  return {
    name,
    label: config.label,
    projectRoot: config.root,
    projectLink: config.link
      ? {
          projectName: config.link.projectName,
          path: config.link.path,
        }
      : null,
    ok: missing.length === 0,
    present,
    missing,
  };
}

export function createVercelDeployReadinessReport(options = {}) {
  const env = options.env || process.env;
  const target = normalizeTarget(options.target || "all");
  const config = createTargetConfig(env, options);
  const results = selectedTargets(target).map((name) =>
    evaluateTarget(name, config[name], env),
  );
  const ok = results.every((result) => result.ok);

  return {
    generatedAt: new Date().toISOString(),
    target,
    ok,
    results: results.map((result) => ({
      name: result.name,
      label: result.label,
      projectRoot: result.projectRoot,
      projectLink: result.projectLink,
      ok: result.ok,
      missing: result.missing.map(({ label, names, displayName, source }) => ({
        label,
        names,
        displayName,
        source,
      })),
      present: result.present.map(({ label, names, displayName, source }) => ({
        label,
        names,
        displayName,
        source,
      })),
    })),
  };
}

export function formatVercelReadinessMarkdown(report) {
  const lines = [
    `### Vercel deploy readiness: ${report.target}`,
    "",
  ];

  for (const result of report.results) {
    lines.push(`#### ${result.label}`);
    lines.push(`- Status: ${result.ok ? "ready" : "blocked"}`);
    lines.push(`- Project root: \`${result.projectRoot}\``);

    if (result.missing.length > 0) {
      lines.push(
        `- Missing: ${result.missing.map((item) => `\`${item.displayName}\``).join(", ")}`,
      );
    }

    if (result.present.length > 0) {
      lines.push(
        `- Present: ${result.present.map((item) => `\`${item.displayName}\``).join(", ")}`,
      );
    }

    lines.push("");
  }

  if (!report.ok) {
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
