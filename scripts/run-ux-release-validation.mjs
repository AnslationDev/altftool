import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const args = new Set(process.argv.slice(2));
const quick = args.has("--quick") || process.env.ALTFT_UX_RELEASE_QUICK === "true";
const includeLiveParity =
  args.has("--live-parity") || process.env.ALTFT_UX_RELEASE_LIVE_PARITY === "true";
const productionMobilePattern =
  "chat assistant|blog mobile|blog detail|/blogs has|age-calculator-guide has|search.q=json|tools/all\\?search";

const baseSteps = [
  {
    name: "Web lint",
    command: npmCommand,
    args: ["run", "lint:web"],
  },
  {
    name: "Web production build",
    command: npmCommand,
    args: ["run", "build:web"],
  },
  ...(!quick
    ? [
        {
          name: "Admin production build",
          command: npmCommand,
          args: ["run", "build:admin"],
        },
        {
          name: "Full mobile UX sweep",
          command: npmCommand,
          args: ["run", "test:mobile-ux"],
        },
      ]
    : []),
  {
    name: "Keyboard and blog SEO/a11y contracts",
    command: npxCommand,
    args: [
      "playwright",
      "test",
      "tests/keyboard-accessibility.spec.mjs",
      "tests/blog-accessibility-seo.spec.mjs",
    ],
  },
  {
    name: "Production-mode mobile UX subset",
    command: npxCommand,
    args: [
      "playwright",
      "test",
      "tests/mobile-ux.spec.mjs",
      "-g",
      productionMobilePattern,
    ],
    env: {
      ALTFT_PLAYWRIGHT_SERVER: "production",
      ALTFT_SKIP_ADMIN_SERVER: "true",
    },
  },
  {
    name: "Production monitor and Firebase live data",
    command: npmCommand,
    args: ["run", "monitor:production"],
  },
];

const steps = includeLiveParity
  ? [
      ...baseSteps,
      {
        name: "Live deploy parity gate",
        command: npmCommand,
        args: ["run", "deploy:parity"],
      },
    ]
  : baseSteps;

const startedAt = Date.now();
const results = [];

console.log(`UX release validation started${quick ? " (quick mode)" : ""}.`);
console.log(
  includeLiveParity
    ? "Live deploy parity gate is included."
    : "Live deploy parity gate is not included; run `npm run validate:ux-release:live` after deploying.",
);

for (const [index, step] of steps.entries()) {
  const label = `${index + 1}/${steps.length} ${step.name}`;
  console.log(`\n--- ${label} ---`);
  const stepStartedAt = Date.now();
  const result = spawnSync(step.command, step.args, {
    cwd: root,
    env: {
      ...process.env,
      ...(step.env || {}),
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
    console.error(`\nUX release validation failed at: ${step.name}`);
    printSummary(results, Date.now() - startedAt);
    process.exit(result.status || 1);
  }
}

printSummary(results, Date.now() - startedAt);
console.log("\nUX release validation passed.");

function printSummary(items, totalMs) {
  console.log("\nUX release validation summary:");
  for (const item of items) {
    const seconds = (item.durationMs / 1000).toFixed(1);
    console.log(`- ${item.ok ? "PASS" : "FAIL"} ${item.name} (${seconds}s)`);
  }
  console.log(`Total: ${(totalMs / 1000).toFixed(1)}s`);
}
