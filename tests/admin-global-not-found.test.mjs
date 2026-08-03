import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const adminRoot = resolve(repositoryRoot, "altftoolwebadmin");

test("admin enables the routing-level branded not-found document", async () => {
  const [nextConfig, globalNotFound] = await Promise.all([
    readFile(resolve(adminRoot, "next.config.mjs"), "utf8"),
    readFile(resolve(adminRoot, "src/app/global-not-found.jsx"), "utf8"),
  ]);

  assert.match(
    nextConfig,
    /experimental\s*:\s*\{[\s\S]*?globalNotFound\s*:\s*true/,
  );
  assert.match(globalNotFound, /import\s+"\.\/globals\.css"/);
  assert.match(globalNotFound, /import\s+NotFound\s+from\s+"\.\/not-found"/);
  assert.match(globalNotFound, /<html\s+lang="en"/);
  assert.match(globalNotFound, /<NotFound\s*\/>/);
});
