import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const rawArgs = process.argv.slice(2);

function argValue(name, fallback) {
  const prefix = `${name}=`;
  return rawArgs.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || fallback;
}

const shardTotal = Math.max(
  1,
  Number(argValue("--shards", process.env.ALTFT_ROUTE_QA_SHARDS || 4)),
);
if (!Number.isSafeInteger(shardTotal)) {
  throw new Error("--shards must be a positive integer.");
}

const outputDirectory = path.resolve(
  workspaceRoot,
  argValue(
    "--output-dir",
    process.env.ALTFT_ROUTE_QA_SHARD_OUTPUT || "test-results/route-qa-shards",
  ),
);
const forwardedArgs = rawArgs.filter(
  (arg) =>
    !arg.startsWith("--shards=") &&
    !arg.startsWith("--output-dir=") &&
    !arg.startsWith("--shard=") &&
    !arg.startsWith("--output=") &&
    !arg.startsWith("--output-md=") &&
    !arg.startsWith("--output-markdown="),
);

await mkdir(outputDirectory, { recursive: true });

function runShard(index) {
  const label = `${index}/${shardTotal}`;
  const jsonPath = path.join(outputDirectory, `shard-${index}-of-${shardTotal}.json`);
  const markdownPath = path.join(outputDirectory, `shard-${index}-of-${shardTotal}.md`);
  const childArgs = [
    "scripts/check-route-qa-report.mjs",
    "--scope=full",
    "--browser-scope=full",
    "--no-mobile",
    `--shard=${label}`,
    `--output=${jsonPath}`,
    `--output-md=${markdownPath}`,
    ...forwardedArgs,
  ];

  return new Promise((resolve) => {
    const child = spawn(process.execPath, childArgs, {
      cwd: workspaceRoot,
      env: {
        ...process.env,
        ALTFT_ROUTE_QA_CONCURRENCY:
          process.env.ALTFT_ROUTE_QA_CONCURRENCY || "2",
        ALTFT_ROUTE_QA_BROWSER_CONCURRENCY:
          process.env.ALTFT_ROUTE_QA_BROWSER_CONCURRENCY || "1",
      },
      stdio: "inherit",
    });
    child.once("exit", (code, signal) => {
      resolve({
        index,
        label,
        code: code ?? 1,
        signal: signal || null,
        jsonPath,
        markdownPath,
      });
    });
  });
}

const runs = await Promise.all(
  Array.from({ length: shardTotal }, (_, index) => runShard(index + 1)),
);
const reports = [];

for (const run of runs) {
  try {
    reports.push(JSON.parse(await readFile(run.jsonPath, "utf8")));
  } catch {
    reports.push(null);
  }
}

const summary = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  shards: shardTotal,
  ok: runs.every((run, index) => run.code === 0 && reports[index]?.ok),
  totals: {
    routes: reports.reduce(
      (sum, report) => sum + Number(report?.totals?.routes || 0),
      0,
    ),
    browserProbes: reports.reduce(
      (sum, report) => sum + Number(report?.totals?.browserProbes || 0),
      0,
    ),
    failures: reports.reduce(
      (sum, report) => sum + Number(report?.totals?.failures || 0),
      0,
    ),
    warnings: reports.reduce(
      (sum, report) => sum + Number(report?.totals?.warnings || 0),
      0,
    ),
    slowRoutes: reports.reduce(
      (sum, report) => sum + Number(report?.totals?.slowRoutes || 0),
      0,
    ),
  },
  runs: runs.map((run, index) => ({
    shard: run.label,
    ok: run.code === 0 && Boolean(reports[index]?.ok),
    exitCode: run.code,
    signal: run.signal,
    routes: reports[index]?.totals?.routes || 0,
    browserProbes: reports[index]?.totals?.browserProbes || 0,
    report: path.relative(workspaceRoot, run.jsonPath),
  })),
};

const summaryPath = path.join(outputDirectory, "summary.json");
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log("\nSharded route QA summary");
console.log(JSON.stringify(summary, null, 2));
console.log(`Report: ${path.relative(workspaceRoot, summaryPath)}`);

if (!summary.ok) process.exit(1);
