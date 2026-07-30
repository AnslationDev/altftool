import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const webRoot = path.resolve(import.meta.dirname, "..");
const workspaceRoot = path.resolve(webRoot, "..");
const testRoots = [
  path.join(workspaceRoot, "packages/core/src/seo"),
  path.join(webRoot, "src/app/(marketing)/components"),
  path.join(webRoot, "src/app/blogs/utils"),
  path.join(webRoot, "src/app/tools"),
  path.join(webRoot, "src/platform/linking"),
  path.join(webRoot, "src/platform/navigation"),
  path.join(webRoot, "src/platform/seo"),
  path.join(webRoot, "src/tools"),
];
const TEST_FILE_PATTERN = /\.(?:test|spec)\.(?:js|mjs|cjs)$/i;
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  "coverage",
  "dist",
  "node_modules",
]);

async function discoverTests(directory) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const tests = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || IGNORED_DIRECTORIES.has(entry.name)) {
      continue;
    }
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      tests.push(...(await discoverTests(absolutePath)));
    } else if (entry.isFile() && TEST_FILE_PATTERN.test(entry.name)) {
      tests.push(absolutePath);
    }
  }
  return tests;
}

const tests = (
  await Promise.all(testRoots.map((directory) => discoverTests(directory)))
)
  .flat()
  .sort((a, b) => a.localeCompare(b));

if (!tests.length) {
  console.error("No unit tests were discovered.");
  process.exitCode = 1;
} else {
  console.log(`Running ${tests.length} discovered unit test files.`);
  const child = spawn(process.execPath, ["--test", ...tests], {
    cwd: webRoot,
    env: process.env,
    stdio: "inherit",
  });

  child.on("error", (error) => {
    console.error(error);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    if (signal) {
      console.error(`Unit test process stopped by ${signal}.`);
      process.exitCode = 1;
      return;
    }
    process.exitCode = code ?? 1;
  });
}
