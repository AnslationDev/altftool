import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const memoryWrappedRouteQualityCommand =
  "node scripts/run-with-node-memory.mjs node --no-warnings scripts/generate-route-quality-report.mjs";

function runMemoryWrapper({ maxOldSpaceSize, nodeOptions } = {}) {
  const env = { ...process.env };
  delete env.ALTFT_NODE_MAX_OLD_SPACE_SIZE;
  delete env.NODE_OPTIONS;

  if (maxOldSpaceSize !== undefined) {
    env.ALTFT_NODE_MAX_OLD_SPACE_SIZE = maxOldSpaceSize;
  }
  if (nodeOptions !== undefined) {
    env.NODE_OPTIONS = nodeOptions;
  }

  const result = spawnSync(
    process.execPath,
    [
      "scripts/run-with-node-memory.mjs",
      process.execPath,
      "--print",
      "process.env.NODE_OPTIONS",
    ],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env,
    },
  );

  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

describe("route-quality memory policy", () => {
  it("wraps every route-quality and index-control entry point", () => {
    assert.deepEqual(
      {
        "seo:route-quality": packageJson.scripts["seo:route-quality"],
        "seo:route-quality:report": packageJson.scripts["seo:route-quality:report"],
        "seo:route-quality:strict": packageJson.scripts["seo:route-quality:strict"],
        "seo:index-control": packageJson.scripts["seo:index-control"],
      },
      {
        "seo:route-quality": memoryWrappedRouteQualityCommand,
        "seo:route-quality:report": `${memoryWrappedRouteQualityCommand} --output=altftoolwebadmin/src/data/routeQualityReport.json`,
        "seo:route-quality:strict": `${memoryWrappedRouteQualityCommand} --strict-quality`,
        "seo:index-control": `${memoryWrappedRouteQualityCommand} --strict`,
      },
    );
  });

  it("uses the default memory budget when no override is configured", () => {
    assert.equal(runMemoryWrapper(), "--max-old-space-size=12288");
  });

  it("applies ALTFT_NODE_MAX_OLD_SPACE_SIZE without dropping other Node options", () => {
    assert.equal(
      runMemoryWrapper({
        maxOldSpaceSize: "6144",
        nodeOptions: "--trace-warnings",
      }),
      "--trace-warnings --max-old-space-size=6144",
    );
  });

  it("preserves an explicit NODE_OPTIONS heap override", () => {
    assert.equal(
      runMemoryWrapper({
        maxOldSpaceSize: "12288",
        nodeOptions: "--trace-warnings --max-old-space-size=4096",
      }),
      "--trace-warnings --max-old-space-size=4096",
    );
  });
});
