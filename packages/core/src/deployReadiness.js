const VALID_TARGETS = new Set(["all", "web", "admin"]);

function envValue(env, name) {
  return typeof env?.[name] === "string" ? env[name].trim() : "";
}

function configured(env, names) {
  return names.some((name) => Boolean(envValue(env, name)));
}

function normalizeTarget(target = "all") {
  const value = String(target || "all").trim().toLowerCase();
  return VALID_TARGETS.has(value) ? value : "all";
}

function selectedTargets(target) {
  return target === "all" ? ["web", "admin"] : [target];
}

function createTargetConfig(env = process.env, options = {}) {
  return {
    web: {
      label: "Public web",
      root: envValue(env, "WEB_PROJECT_ROOT") || options.webProjectRoot || "altftoolweb",
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
      root: envValue(env, "ADMIN_PROJECT_ROOT") || options.adminProjectRoot || "altftoolwebadmin",
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
}

function evaluateTarget(name, config, env) {
  const missing = [];
  const present = [];

  for (const requirement of config.requirements) {
    const ok = configured(env, requirement.names);
    const item = {
      label: requirement.label,
      names: requirement.names,
      displayName: requirement.names.join(" or "),
    };

    if (ok) present.push(item);
    else missing.push(item);
  }

  return {
    name,
    label: config.label,
    projectRoot: config.root,
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
      ok: result.ok,
      missing: result.missing.map(({ label, names, displayName }) => ({
        label,
        names,
        displayName,
      })),
      present: result.present.map(({ label, names, displayName }) => ({
        label,
        names,
        displayName,
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
