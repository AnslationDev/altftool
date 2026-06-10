import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const args = process.argv.slice(2);
const vercelVersion = process.env.VERCEL_CLI_VERSION || "54.2.0";

function hasFlag(name) {
  return args.includes(name);
}

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) return args[index + 1];

  return fallback;
}

function envValue(name) {
  return typeof process.env[name] === "string" ? process.env[name].trim() : "";
}

function runStep(label, command, commandArgs, options = {}) {
  const optional = Boolean(options.optional);
  console.log(`\n[release] ${label}`);

  const result = spawnSync(command, commandArgs, {
    cwd: root,
    env: {
      ...process.env,
      ...(options.env || {}),
    },
    stdio: "inherit",
  });

  if (result.status !== 0) {
    const message = `${label} failed with exit code ${result.status || 1}.`;
    if (optional) {
      console.warn(`[release] WARN ${message}`);
      return false;
    }

    throw new Error(message);
  }

  return true;
}

async function waitForUrl(url, timeoutMs = 45_000) {
  const startedAt = Date.now();
  let lastError = "";

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error?.message || String(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url}${lastError ? ` (${lastError})` : ""}.`);
}

async function runLocalWebMonitor() {
  if (hasFlag("--skip-local-monitor")) {
    console.log("\n[release] Skipping local web monitor.");
    return;
  }

  const port = Number(argValue("--web-port", process.env.ALTFT_RELEASE_WEB_PORT || "3022"));
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`\n[release] Starting web production server on ${baseUrl}`);

  const child = spawn(npmCommand, ["--prefix", "altftoolweb", "run", "start", "--", "-p", String(port)], {
    cwd: root,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: "inherit",
  });

  try {
    await waitForUrl(`${baseUrl}/api/health`);
    runStep("Local web monitor", npmCommand, ["run", "monitor:production"], {
      env: {
        ALTFT_MONITOR_WEB_URL: baseUrl,
        ALTFT_MONITOR_SKIP_ADMIN: "true",
        ALTFT_MONITOR_SKIP_FIREBASE_LIVE_DATA: "true",
      },
    });
  } finally {
    child.kill("SIGTERM");
  }
}

function ensureDeployEnv(target) {
  const required = ["VERCEL_TOKEN", "VERCEL_ORG_ID"];
  if (target === "web" || target === "all") required.push("VERCEL_WEB_PROJECT_ID");
  if (target === "admin" || target === "all") required.push("VERCEL_ADMIN_PROJECT_ID");

  const missing = required.filter((name) => !envValue(name));
  if (missing.length) {
    throw new Error(`Cannot deploy; missing ${missing.join(", ")}.`);
  }
}

function runVercel(projectId, label, commandArgs) {
  runStep(label, npxCommand, ["--yes", `vercel@${vercelVersion}`, ...commandArgs], {
    env: {
      VERCEL_TOKEN: envValue("VERCEL_TOKEN"),
    },
  });
}

function deployTarget(target) {
  const configs = [];
  if (target === "web" || target === "all") {
    configs.push({
      name: "web",
      projectId: envValue("VERCEL_WEB_PROJECT_ID") || envValue("VERCEL_PROJECT_ID"),
    });
  }
  if (target === "admin" || target === "all") {
    configs.push({
      name: "admin",
      projectId: envValue("VERCEL_ADMIN_PROJECT_ID"),
    });
  }

  for (const config of configs) {
    runVercel(config.projectId, `Vercel link ${config.name}`, [
      "link",
      "--yes",
      "--scope",
      envValue("VERCEL_ORG_ID"),
      "--project",
      config.projectId,
      "--cwd",
      ".",
    ]);
    runVercel(config.projectId, `Vercel pull ${config.name}`, [
      "pull",
      "--yes",
      "--environment=production",
      "--cwd",
      ".",
    ]);
    runVercel(config.projectId, `Vercel build ${config.name}`, [
      "build",
      "--prod",
      "--cwd",
      ".",
    ]);
    runVercel(config.projectId, `Vercel deploy ${config.name}`, [
      "deploy",
      "--prebuilt",
      "--prod",
      "--cwd",
      ".",
    ]);
  }
}

async function main() {
  const deploy = argValue("--deploy", "none").toLowerCase();
  const validDeployTargets = new Set(["none", "web", "admin", "all"]);

  if (!validDeployTargets.has(deploy)) {
    throw new Error("Use --deploy=none, --deploy=web, --deploy=admin, or --deploy=all.");
  }

  console.log("AltFTool release preflight");
  console.log(`- Deploy: ${deploy === "none" ? "disabled" : deploy}`);
  console.log(`- Local monitor: ${hasFlag("--skip-local-monitor") ? "skipped" : "enabled"}`);

  runStep("Environment readiness", npmCommand, ["run", "env:readiness"]);
  runStep("Route loading coverage", npmCommand, ["run", "test:route-loading"]);
  runStep("Firebase Admin checker wiring", npmCommand, ["run", "test:firebase-admin-write-check"]);

  if (!hasFlag("--skip-firebase-live")) {
    runStep("Firebase live data", npmCommand, ["run", "firebase:live-check"], { optional: true });
  }

  runStep("Build web", npmCommand, ["run", "build:web"]);
  await runLocalWebMonitor();
  runStep("Build admin", npmCommand, ["run", "build:admin"]);
  runStep("Bundle audit", npmCommand, ["run", "bundle:audit"]);

  if (deploy !== "none") {
    ensureDeployEnv(deploy);
    runStep("Vercel deploy readiness", npmCommand, ["run", "deploy:readiness", "--", `--target=${deploy}`]);
    deployTarget(deploy);
  } else {
    console.log("\n[release] Deploy skipped. Use --deploy=web, --deploy=admin, or --deploy=all when you intentionally want to deploy.");
  }

  console.log("\n[release] Preflight completed.");
}

main().catch((error) => {
  console.error(`\n[release] ${error?.message || error}`);
  process.exit(1);
});
