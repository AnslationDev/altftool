import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";

const webRoot = path.resolve(import.meta.dirname, "..");
const memoryWrapperPath = path.join(
  webRoot,
  "scripts/run-with-node-memory.mjs",
);

const [amplifyBuild, memoryWrapper, packageJsonSource, runbook] =
  await Promise.all([
    fs.readFile(path.join(webRoot, "amplify.yml"), "utf8"),
    fs.readFile(
      path.join(webRoot, "scripts/run-with-node-memory.mjs"),
      "utf8",
    ),
    fs.readFile(path.join(webRoot, "package.json"), "utf8"),
    fs.readFile(path.join(webRoot, "docs/AWS_AMPLIFY_RUNBOOK.md"), "utf8"),
  ]);

test("Amplify pins the measured single-worker web memory budget", () => {
  assert.match(amplifyBuild, /ALTFT_BUILD_CPUS=1/u);
  assert.match(amplifyBuild, /ALTFT_NODE_MAX_OLD_SPACE_SIZE=10240/u);
  assert.match(amplifyBuild, /ALTFT_WEBPACK_BUILD_WORKER=true/u);
  assert.doesNotMatch(amplifyBuild, /ALTFT_NODE_MAX_OLD_SPACE_SIZE=12288/u);
});

test("the local wrapper and production build keep the same webpack contract", () => {
  assert.match(memoryWrapper, /configuredMaxOldSpaceSize \|\| "10240"/u);

  const packageJson = JSON.parse(packageJsonSource);
  assert.match(
    packageJson.scripts.build,
    /run-with-node-memory\.mjs next build --webpack/u,
  );
});

test("an explicit ALTFT heap cap replaces inherited NODE_OPTIONS", () => {
  const inspectOptions = (env) => {
    const result = spawnSync(
      process.execPath,
      [
        memoryWrapperPath,
        process.execPath,
        "-e",
        "process.stdout.write(process.env.NODE_OPTIONS || '')",
      ],
      {
        cwd: webRoot,
        encoding: "utf8",
        env: { ...process.env, ...env },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };

  assert.equal(
    inspectOptions({
      ALTFT_NODE_MAX_OLD_SPACE_SIZE: "10240",
      NODE_OPTIONS:
        "--trace-warnings --max-old-space-size=12288 --stack-trace-limit=25",
    }),
    "--trace-warnings --stack-trace-limit=25 --max-old-space-size=10240",
  );

  assert.equal(
    inspectOptions({
      ALTFT_NODE_MAX_OLD_SPACE_SIZE: "",
      NODE_OPTIONS: "--max_old_space_size=9216 --trace-warnings",
    }),
    "--max_old_space_size=9216 --trace-warnings",
  );
  assert.equal(
    inspectOptions({ ALTFT_NODE_MAX_OLD_SPACE_SIZE: "", NODE_OPTIONS: "" }),
    "--max-old-space-size=10240",
  );
});

test("the runbook documents the effective public web settings", () => {
  const publicWebSection = runbook.match(
    /Effective public web build settings[\s\S]*?Admin build environment:/u,
  )?.[0];

  assert.ok(publicWebSection, "public web build section must exist");
  assert.match(publicWebSection, /ALTFT_NODE_MAX_OLD_SPACE_SIZE=10240/u);
  assert.match(publicWebSection, /ALTFT_BUILD_CPUS=1/u);
  assert.match(publicWebSection, /ALTFT_WEBPACK_BUILD_WORKER=true/u);
});
