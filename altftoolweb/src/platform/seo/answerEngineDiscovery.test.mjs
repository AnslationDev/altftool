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
// barcode-scanner's live pipeline is entry.jsx -> pages/index.jsx ->
// utils/decodeEngine.js; there is no components/scanner.jsx in this tree
// (an earlier ZXing-based, network-calling variant that used to live there
// has been removed entirely, not just left unimported). decodeEngine.js is
// the actual decode pipeline the page renders, so that is what the
// local-only privacy claim below is checked against.
const barcodeScannerDecodeEngineSource = readFileSync(
  new URL("../../tools/barcode-scanner/utils/decodeEngine.js", import.meta.url),
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
});

test("barcode scanner's local-only privacy claim matches its actual decode pipeline", () => {
  // The pipeline only decodes — it never looks up product data over the
  // network, so it must not call out to a server.
  assert.doesNotMatch(barcodeScannerDecodeEngineSource, /fetch\(|axios|XMLHttpRequest/i);
  assert.match(barcodeScannerSeoSource, /never sent anywhere/i);
});

test("explicit answer-engine rules still honor ALTF Engine crawl policy", () => {
  assert.match(
    robotsSource,
    /const aiCrawlerRule = \{[\s\S]*allow: crawl\.allow\.length[\s\S]*\.\.\.crawl\.disallow/,
  );
});
