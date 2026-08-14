import { spawn } from "node:child_process";

const [, , ...command] = process.argv;

if (!command.length) {
  console.error("Usage: node scripts/run-with-node-memory.mjs <command> [args...]");
  process.exit(1);
}

// The full 3,947-tool route graph can exceed 8 GiB during a cold webpack
// compile. Keep local builds aligned with Amplify's existing build ceiling.
// This applies only to the build child process, not the deployed app.
const configuredMaxOldSpaceSize =
  process.env.ALTFT_NODE_MAX_OLD_SPACE_SIZE?.trim();
const maxOldSpaceSize = configuredMaxOldSpaceSize || "10240";
if (!/^[1-9]\d*$/u.test(maxOldSpaceSize)) {
  throw new Error(
    `ALTFT_NODE_MAX_OLD_SPACE_SIZE must be a positive integer; received ${JSON.stringify(maxOldSpaceSize)}`,
  );
}

const existingNodeOptions = process.env.NODE_OPTIONS || "";
const MAX_OLD_SPACE_OPTION =
  /(?:^|\s+)--max[-_]old[-_]space[-_]size(?:=\S+|\s+\S+)/gu;
const hasExistingMaxOldSpace = MAX_OLD_SPACE_OPTION.test(existingNodeOptions);
MAX_OLD_SPACE_OPTION.lastIndex = 0;
const memoryOption = `--max-old-space-size=${maxOldSpaceSize}`;

// NODE_OPTIONS remains authoritative for ordinary local builds, but the
// dedicated ALTFT setting must win when CI pins it. Otherwise an inherited
// 12 GiB NODE_OPTIONS value can silently defeat Amplify's 10 GiB safety cap.
const nodeOptions = configuredMaxOldSpaceSize
  ? [existingNodeOptions.replace(MAX_OLD_SPACE_OPTION, "").trim(), memoryOption]
    .filter(Boolean)
    .join(" ")
  : hasExistingMaxOldSpace
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
