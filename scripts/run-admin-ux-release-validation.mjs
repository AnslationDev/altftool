import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const args = new Set(process.argv.slice(2));
const quick = args.has("--quick") || process.env.ALTFT_ADMIN_UX_RELEASE_QUICK === "true";

const steps = [
  {
    name: "Admin production build",
    command: npmCommand,
    args: ["run", "build:admin"],
  },
  {
    name: "Admin API safety",
    command: npmCommand,
    args: ["run", "test:admin-api"],
  },
  {
    name: "Admin mobile UX sweep",
    command: npmCommand,
    args: ["run", "test:admin-mobile-ux"],
  },
  ...(!quick
    ? [
        {
          name: "Admin blog authoring UX",
          command: npmCommand,
          args: ["run", "test:admin-blog-ux"],
        },
      ]
    : []),
];

const startedAt = Date.now();
const results = [];

console.log(`Admin UX release validation started${quick ? " (quick mode)" : ""}.`);

for (const [index, step] of steps.entries()) {
  const label = `${index + 1}/${steps.length} ${step.name}`;
  console.log(`\n--- ${label} ---`);

  const stepStartedAt = Date.now();
  const result = spawnSync(step.command, step.args, {
    cwd: root,
    env: {
      ...process.env,
      ALTFT_ADMIN_URL: process.env.ALTFT_ADMIN_URL || "http://localhost:3011",
    },
    stdio: "inherit",
  });
  const durationMs = Date.now() - stepStartedAt;

  results.push({
    name: step.name,
    ok: result.status === 0,
    status: result.status,
    durationMs,
  });

  if (result.status !== 0) {
    console.error(`\nAdmin UX release validation failed at: ${step.name}`);
    printSummary(results, Date.now() - startedAt);
    process.exit(result.status || 1);
  }
}

printSummary(results, Date.now() - startedAt);
console.log("\nAdmin UX release validation passed.");

function printSummary(items, totalMs) {
  console.log("\nAdmin UX release validation summary:");
  for (const item of items) {
    const seconds = (item.durationMs / 1000).toFixed(1);
    console.log(`- ${item.ok ? "PASS" : "FAIL"} ${item.name} (${seconds}s)`);
  }
  console.log(`Total: ${(totalMs / 1000).toFixed(1)}s`);
}
