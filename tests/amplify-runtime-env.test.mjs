import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
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
