#!/usr/bin/env node
/**
 * Validates the Brotli SEO payload that the server actually reads.
 *
 * Source-regex checks are easy to bypass with alternate quoting, inline arrays,
 * constants or spreads. `prebuild` generates toolSeoMap.br before this guard
 * runs, so validating that payload covers every effective repository-authored
 * HowTo record independent of source syntax. Runtime admin steps pass through
 * the same shared predicate in toolSeoContent.js.
 */
import fs from "node:fs";
import { brotliDecompressSync } from "node:zlib";

import {
  getHowToStepIssues,
  inspectHowToStep,
} from "../src/app/tools/howtoStepQuality.js";

const SEO_MAP = "src/app/tools/generated/toolSeoMap.br";

const genericRegressionSteps = [
  "Adjust the options until the result looks right.",
  "Choose your options and copy the result.",
  "Adjust the options. Copy the result.",
  "Convert the input and download the result.",
  "Choose the appropriate option.",
  "Enter the required details and submit.",
  "Press Submit to continue.",
  'Click the "Generate" button.',
  "Review the generated result and save it.",
  "Upload the selected file and download the final version.",
];

for (const step of genericRegressionSteps) {
  if (inspectHowToStep(step).valid) {
    throw new Error(`HowTo guard regression: generic step was accepted: ${step}`);
  }
}

if (!fs.existsSync(SEO_MAP)) {
  console.error(`HowTo steps guard: generated payload is missing: ${SEO_MAP}`);
  process.exit(1);
}

let seoMap;
try {
  seoMap = JSON.parse(
    brotliDecompressSync(fs.readFileSync(SEO_MAP)).toString("utf8"),
  );
} catch (error) {
  console.error(`HowTo steps guard: unable to decode ${SEO_MAP}: ${error.message}`);
  process.exit(1);
}

const offenders = [];
let records = 0;
let stepsChecked = 0;

for (const [slug, seo] of Object.entries(seoMap)) {
  if (!Array.isArray(seo?.steps) || seo.steps.length === 0) continue;
  records += 1;
  stepsChecked += seo.steps.length;
  for (const issue of getHowToStepIssues(seo.steps)) {
    offenders.push({ slug, ...issue });
  }
}

if (offenders.length === 0) {
  console.log(
    `HowTo steps guard: OK (${records} effective tool records, ${stepsChecked} published steps).`,
  );
  process.exit(0);
}

console.error(
  `HowTo steps guard: ${offenders.length} generic step(s) remain in the generated payload.\n`,
);
for (const offender of offenders.slice(0, 20)) {
  console.error(
    `  ${offender.slug} step ${offender.index + 1}\n` +
      `    ${offender.reason}: "${String(offender.step).slice(0, 100)}"\n`,
  );
}
if (offenders.length > 20) {
  console.error(`  … and ${offenders.length - 20} more\n`);
}
console.error(
  "Remove or rewrite the source steps, then run npm run generate:registry. " +
    "No HowTo schema is safer than a generic or unverifiable workflow.",
);
process.exit(1);
