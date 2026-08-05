import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { brotliDecompressSync } from "node:zlib";

import { toolContentOverrides } from "../altftoolweb/src/app/tools/toolContentOverrides.js";
import { hasPublishableHowToSteps } from "../altftoolweb/src/app/tools/howtoStepQuality.js";
import {
  buildMetaDescription,
  TOOL_META_DESCRIPTION_BOUNDS,
} from "../altftoolweb/src/app/tools/toolMetaDescription.js";

const toolsDirectory = path.resolve("altftoolweb/src/tools");
const generatedDirectory = path.resolve(
  "altftoolweb/src/app/tools/generated",
);
const generatedMapPath = path.join(generatedDirectory, "toolSeoMap.br");
const toolSeoContentPath = path.resolve(
  "altftoolweb/src/app/tools/toolSeoContent.js",
);
const toolMetaMapPath = path.resolve(
  "altftoolweb/src/platform/registry/toolMetaMap.js",
);

function decodeGeneratedSeo() {
  return JSON.parse(
    brotliDecompressSync(readFileSync(generatedMapPath)).toString("utf8"),
  );
}

function withoutUnpublishableHowTo(seo = {}) {
  const sanitized = { ...seo };
  if (
    Object.hasOwn(sanitized, "steps") &&
    !hasPublishableHowToSteps(sanitized.steps)
  ) {
    delete sanitized.steps;
  }
  return sanitized;
}

let authoredSeoPromise;

async function loadAuthoredSeo() {
  if (!authoredSeoPromise) {
    authoredSeoPromise = (async () => {
      const toolEntries = await readdir(toolsDirectory, { withFileTypes: true });
      const seoEntries = await Promise.all(
        toolEntries
          .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
          .map(async (entry) => {
            const seoPath = path.join(toolsDirectory, entry.name, "seo.js");
            try {
              await stat(seoPath);
            } catch {
              return null;
            }
            const module = await import(pathToFileURL(seoPath).href);
            return [entry.name, module.default ?? module.seo];
          }),
      );
      return Object.fromEntries(seoEntries.filter(Boolean));
    })();
  }
  return authoredSeoPromise;
}

test("compressed tool SEO lookup preserves legacy and per-tool content", async () => {
  const authoredSeo = await loadAuthoredSeo();
  const generatedSeo = decodeGeneratedSeo();
  const expectedSlugs = [
    ...new Set([
      ...Object.keys(toolContentOverrides),
      ...Object.keys(authoredSeo),
    ]),
  ].sort();

  assert.deepEqual(Object.keys(generatedSeo).sort(), expectedSlugs);
  for (const slug of expectedSlugs) {
    assert.deepEqual(generatedSeo[slug], {
      ...withoutUnpublishableHowTo(toolContentOverrides[slug]),
      ...withoutUnpublishableHowTo(authoredSeo[slug]),
    });
  }
  assert.equal(
    Object.hasOwn(generatedSeo["algebra-solver"], "steps"),
    false,
    "generic HowTo steps must not reach the compressed payload",
  );
  assert.equal(typeof generatedSeo["age-calculator"]?.intro, "string");
  assert.equal(
    typeof generatedSeo["audio-edit-boundary-visualizer"]?.intro,
    "string",
  );
  assert.equal(typeof generatedSeo["wcag-quick-auditor"]?.intro, "string");
});

test("generated tool lookups stay limited to deployable server modules", async () => {
  const generatedFiles = await readdir(generatedDirectory);
  assert.deepEqual(generatedFiles.sort(), ["toolNetworkMap.js", "toolSeoMap.br"]);

  const generatedMapSize = (await stat(generatedMapPath)).size;
  assert.ok(
    generatedMapSize < 4 * 1024 * 1024,
    `generated SEO payload is ${(generatedMapSize / (1024 * 1024)).toFixed(2)} MiB`,
  );
});

test("authored tool metadata fits the rendered search-result budget", () => {
  const generatedSeo = decodeGeneratedSeo();
  const authoredTitles = Object.entries(generatedSeo).filter(
    ([, value]) => typeof value?.title === "string" && value.title.trim(),
  );
  const authoredDescriptions = Object.entries(generatedSeo).filter(
    ([, value]) =>
      typeof value?.metaDescription === "string" &&
      value.metaDescription.trim(),
  );

  assert.ok(authoredTitles.length >= 100);
  for (const [slug, value] of authoredTitles) {
    const renderedTitle = `${value.title.trim()} | AltFTool`;
    assert.ok(
      renderedTitle.length <= 60,
      `${slug} renders a ${renderedTitle.length}-character title: ${renderedTitle}`,
    );
  }

  for (const [slug, value] of authoredDescriptions) {
    assert.ok(
      value.metaDescription.trim().length <= 158,
      `${slug} has an over-budget authored meta description`,
    );
  }
});

test("every tool fallback produces a useful meta-description length", async () => {
  const generatedSeo = decodeGeneratedSeo();
  const toolMetaSource = await readFile(toolMetaMapPath, "utf8");
  const match = toolMetaSource.match(
    /export const toolMetaMap = (\{[\s\S]*\});?\s*$/,
  );
  assert.ok(match, "generated tool metadata should remain parseable");
  const toolMetaMap = JSON.parse(match[1]);

  for (const [slug, tool] of Object.entries(toolMetaMap)) {
    const categories = Array.isArray(tool.category)
      ? tool.category
      : [tool.category];
    const description =
      generatedSeo[slug]?.metaDescription?.trim() ||
      buildMetaDescription(
        tool.name || slug,
        tool.description,
        categories[0],
      );

    assert.ok(
      description.length >= TOOL_META_DESCRIPTION_BOUNDS.min &&
        description.length <= TOOL_META_DESCRIPTION_BOUNDS.max,
      `${slug} resolves to a ${description.length}-character meta description`,
    );
  }
});

test("admin tool metadata keeps precedence over per-tool fallbacks", async () => {
  const source = await readFile(toolSeoContentPath, "utf8");

  assert.match(
    source,
    /const summary\s*=\s*central\.metaDescription\s*\|\|\s*override\?\.metaDescription/u,
  );
  assert.match(
    source,
    /title:\s*central\.title\s*\|\|\s*override\?\.title/u,
  );
});
