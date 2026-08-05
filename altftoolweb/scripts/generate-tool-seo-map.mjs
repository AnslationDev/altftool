#!/usr/bin/env node
/**
 * Collects per-tool SEO content into generated shards.
 *
 * Each tool may ship its own `src/tools/<slug>/seo.js`:
 *
 *   const seo = {
 *     intro: "…",
 *     useCases: ["…", "…", "…"],
 *     benefits: [["Title", "body"], …],
 *     faqs: [["Question", "Answer"], …],
 *   };
 *   export default seo;
 *
 * Why per-tool files instead of one hand-edited map: the catalogue is growing
 * into the thousands, and tools are authored in parallel batches. A single
 * shared file means every author edits the same lines — merge conflicts and,
 * worse, one bad edit corrupts the SEO of every tool. A file per tool is
 * isolated, reviewable in a diff, and deleted along with its tool.
 *
 * Output is one binary Brotli payload. Legacy content in
 * toolContentOverrides.js is merged before compression, and per-tool files
 * keep field-level precedence exactly as they did in the runtime merge.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { brotliCompressSync, constants as zlibConstants } from "node:zlib";
import { toolContentOverrides } from "../src/app/tools/toolContentOverrides.js";
import {
  getHowToStepIssues,
  hasPublishableHowToSteps,
} from "../src/app/tools/howtoStepQuality.js";

const TOOLS_DIR = "src/tools";
const OUT_DIR = "src/app/tools/generated";
// This module is generated once during a release build and decoded once per
// server process. Maximum-quality Brotli costs a few extra build seconds but
// preserves deployment headroom for the 3,944-entry catalogue.
const BROTLI_QUALITY = 11;
const omittedHowTo = [];

function withoutUnpublishableHowTo(slug, seo, source) {
  const sanitized = { ...seo };
  if (
    Object.hasOwn(sanitized, "steps") &&
    !hasPublishableHowToSteps(sanitized.steps)
  ) {
    omittedHowTo.push({
      slug,
      source,
      issues: getHowToStepIssues(sanitized.steps),
    });
    delete sanitized.steps;
  }
  return sanitized;
}

const slugs = fs
  .readdirSync(TOOLS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
  .map((d) => d.name)
  .filter((slug) => fs.existsSync(path.join(TOOLS_DIR, slug, "seo.js")))
  .sort();

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.rmSync(path.join(OUT_DIR, "toolSeoMap.js"), { force: true });
fs.rmSync(path.join(OUT_DIR, "toolSeoMap.br"), { force: true });

const seoEntries = new Map();

for (const slug of slugs) {
  const seoPath = path.resolve(TOOLS_DIR, slug, "seo.js");
  try {
    const mod = await import(pathToFileURL(seoPath).href);
    const seo = mod.default ?? mod.seo ?? null;
    if (!seo || typeof seo !== "object" || Array.isArray(seo)) {
      throw new Error("default export must be an object");
    }
    seoEntries.set(slug, seo);
  } catch (error) {
    throw new Error(`Unable to load SEO content for ${slug}: ${error.message}`);
  }
}

// Fold the legacy shared overrides into the generated payload. The runtime
// used to ship them as a second, uncompressed object beside the generated
// catalogue; merging here preserves the same field-level precedence while
// letting Brotli compress the whole data set once.
const mergedSeoEntries = new Map(
  Object.entries(toolContentOverrides).map(([slug, seo]) => [
    slug,
    withoutUnpublishableHowTo(slug, seo, "toolContentOverrides.js"),
  ]),
);

for (const [slug, seo] of seoEntries) {
  const sanitizedSeo = withoutUnpublishableHowTo(slug, seo, "seo.js");
  mergedSeoEntries.set(slug, {
    ...(mergedSeoEntries.get(slug) || {}),
    ...sanitizedSeo,
  });
}

const serializedSeo = JSON.stringify(Object.fromEntries(mergedSeoEntries));
const compressedSeo = brotliCompressSync(serializedSeo, {
  params: {
    [zlibConstants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY,
  },
});
fs.writeFileSync(
  path.join(OUT_DIR, "toolSeoMap.br"),
  compressedSeo,
);

console.log(
  `✅ toolSeoMap generated (${mergedSeoEntries.size} tools, ` +
    `${(serializedSeo.length / (1024 * 1024)).toFixed(2)} MiB JSON -> ` +
    `${(compressedSeo.length / (1024 * 1024)).toFixed(2)} MiB Brotli)`,
);
if (omittedHowTo.length > 0) {
  const preview = omittedHowTo
    .slice(0, 12)
    .map(({ slug, source }) => `${slug} (${source})`)
    .join(", ");
  console.warn(
    `⚠️ HowTo quality filter omitted ${omittedHowTo.length} generic step set(s): ` +
      `${preview}${omittedHowTo.length > 12 ? ", …" : ""}`,
  );
}
