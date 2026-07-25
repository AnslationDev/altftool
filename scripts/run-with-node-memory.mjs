import { spawn } from "node:child_process";

const [, , ...command] = process.argv;

if (!command.length) {
  console.error("Usage: node scripts/run-with-node-memory.mjs <command> [args...]");
  process.exit(1);
}

// Keep the outer workspace build aligned with the web build wrapper. The full
// generated tool graph now exceeds 6 GiB during a cold webpack compile; when
// the outer process injected 6144 MiB, the inner wrapper correctly preserved
// that existing value and the release build could OOM before prerendering.
const maxOldSpaceSize = process.env.ALTFT_NODE_MAX_OLD_SPACE_SIZE || "8192";
const existingNodeOptions = process.env.NODE_OPTIONS || "";
const memoryOption = `--max-old-space-size=${maxOldSpaceSize}`;
const nodeOptions = existingNodeOptions.includes("--max-old-space-size")
  ? existingNodeOptions
  : [existingNodeOptions, memoryOption].filter(Boolean).join(" ");

const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("="))
);

const quoteArg = (value) => {
  if (!/[\s"]/u.test(value)) return value;
  return `"${value.replaceAll('"', '\\"')}"`;
};

const commandLine = command.map(quoteArg).join(" ");

const child = spawn(commandLine, {
  env: {
    ...env,
    NODE_OPTIONS: nodeOptions,
  },
  shell: true,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
