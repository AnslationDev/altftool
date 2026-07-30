import assert from "node:assert/strict";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { brotliDecompressSync } from "node:zlib";

import { generatedToolSeoBrotliBase64 } from "../altftoolweb/src/app/tools/generated/toolSeoMap.js";

const toolsDirectory = path.resolve("altftoolweb/src/tools");
const generatedDirectory = path.resolve(
  "altftoolweb/src/app/tools/generated",
);
const generatedMapPath = path.join(generatedDirectory, "toolSeoMap.js");

function decodeGeneratedSeo() {
  return JSON.parse(
    brotliDecompressSync(
      Buffer.from(generatedToolSeoBrotliBase64, "base64"),
    ).toString("utf8"),
  );
}

test("compressed tool SEO lookup covers every authored SEO module", async () => {
  const toolEntries = await readdir(toolsDirectory, { withFileTypes: true });
  const seoSlugs = (
    await Promise.all(
      toolEntries
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
        .map(async (entry) => {
          try {
            await stat(path.join(toolsDirectory, entry.name, "seo.js"));
            return entry.name;
          } catch {
            return null;
          }
        }),
    )
  )
    .filter(Boolean)
    .sort();

  const generatedSeo = decodeGeneratedSeo();
  assert.deepEqual(Object.keys(generatedSeo).sort(), seoSlugs);
  assert.equal(typeof generatedSeo["age-calculator"]?.intro, "string");
  assert.equal(
    typeof generatedSeo["audio-edit-boundary-visualizer"]?.intro,
    "string",
  );
  assert.equal(typeof generatedSeo["wcag-quick-auditor"]?.intro, "string");
});

test("generated SEO stays packed into one deployable server module", async () => {
  const generatedFiles = await readdir(generatedDirectory);
  assert.deepEqual(generatedFiles, ["toolSeoMap.js"]);

  const generatedMapSize = (await stat(generatedMapPath)).size;
  assert.ok(
    generatedMapSize < 6 * 1024 * 1024,
    `generated SEO module is ${(generatedMapSize / (1024 * 1024)).toFixed(2)} MiB`,
  );
});
