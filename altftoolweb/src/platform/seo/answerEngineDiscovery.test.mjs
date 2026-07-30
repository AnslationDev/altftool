import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifestSource = readFileSync(
  new URL("./answerEngineManifest.js", import.meta.url),
  "utf8",
);
const toolSeoSource = readFileSync(
  new URL("../../app/tools/toolSeoContent.js", import.meta.url),
  "utf8",
);
const robotsSource = readFileSync(
  new URL("../../app/robots.js", import.meta.url),
  "utf8",
);
const apiTesterSeoSource = readFileSync(
  new URL("../../tools/api-tester/seo.js", import.meta.url),
  "utf8",
);
const barcodeScannerSeoSource = readFileSync(
  new URL("../../tools/barcode-scanner/seo.js", import.meta.url),
  "utf8",
);
const barcodeScannerRuntimeSource = readFileSync(
  new URL("../../tools/barcode-scanner/components/scanner.jsx", import.meta.url),
  "utf8",
);

test("answer-engine manifests retain converter, exam, open-data, and safety discovery", () => {
  for (const expected of [
    "TRANSFORM_TOOLS.map((tool) => transformLine(site, tool))",
    "EXAM_SPECS.map((exam) => examSpecLine(site, exam))",
    "${site}/transform",
    "${site}/exam-photo",
    "${site}/open-data",
    "${site}/press",
    "/altfworld/forums/",
  ]) {
    assert.match(manifestSource, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("fallback SEO copy does not promise local-only processing", () => {
  for (const unsafeClaim of [
    "files never leave your device",
    "your data isn't shipped to a server",
    "stays on your device instead of being sent to a server",
  ]) {
    assert.doesNotMatch(toolSeoSource, new RegExp(unsafeClaim, "i"));
  }

  assert.match(manifestSource, /Do not infer local-only or server processing/);
});

test("networked tool privacy copy names the data recipient", () => {
  assert.match(apiTesterSeoSource, /travel directly from your browser to the target API/i);
  assert.doesNotMatch(apiTesterSeoSource, /tokens never reach a third-party server/i);
  assert.match(barcodeScannerRuntimeSource, /fetchProductData\(detectedBarcode\)/);
  assert.match(barcodeScannerSeoSource, /sent to Open Food Facts[\s\S]*UPCitemdb/i);
  assert.match(barcodeScannerSeoSource, /image or live camera frames stay in your browser/i);
});

test("explicit answer-engine rules still honor ALTF Engine crawl policy", () => {
  assert.match(
    robotsSource,
    /const aiCrawlerRule = \{[\s\S]*allow: crawl\.allow\.length[\s\S]*\.\.\.crawl\.disallow/,
  );
});
