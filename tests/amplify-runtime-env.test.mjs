import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
const scriptPath = resolve(
  repositoryRoot,
  "altftoolweb/scripts/write-amplify-runtime-env.mjs",
);
const webAppRoot = resolve(repositoryRoot, "altftoolweb/src/app");

async function collectPageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectPageFiles(path));
      continue;
    }

    if (/^page\.(?:js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

test("Amplify runtime env writer includes only allowlisted variables", async () => {
  const directory = await mkdtemp(resolve(tmpdir(), "altftool-amplify-env-"));

  try {
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: directory,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        ALTFT_REVALIDATE_SECRET: "server secret with spaces",
        NEXT_PUBLIC_SITE_URL: "https://www.altftool.com",
        UNRELATED_PRIVATE_TOKEN: "must-not-be-written",
      },
    });

    assert.equal(result.status, 0, result.stderr);

    const output = await readFile(
      resolve(directory, ".env.production"),
      "utf8",
    );

    assert.match(
      output,
      /^ALTFT_REVALIDATE_SECRET="server secret with spaces"$/m,
    );
    assert.match(
      output,
      /^NEXT_PUBLIC_SITE_URL="https:\/\/www\.altftool\.com"$/m,
    );
    assert.doesNotMatch(output, /UNRELATED_PRIVATE_TOKEN|must-not-be-written/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("deferred prerender routes remain force-static for runtime ISR", async () => {
  const pageFiles = await collectPageFiles(webAppRoot);
  const deferredPages = [];
  const unprotectedPages = [];

  for (const pageFile of pageFiles) {
    const source = await readFile(pageFile, "utf8");
    if (!source.includes("shouldDeferBulkPrerendering")) continue;

    deferredPages.push(pageFile);
    if (!source.includes('export const dynamic = "force-static";')) {
      unprotectedPages.push(pageFile.replace(`${repositoryRoot}/`, ""));
    }
  }

  assert.ok(
    deferredPages.length >= 20,
    `Expected the deferred route inventory, found ${deferredPages.length}`,
  );
  assert.deepEqual(unprotectedPages, []);
});
