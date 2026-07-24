import assert from "node:assert/strict";
import test from "node:test";

import {
  auditHtmlStructure,
  auditorLimits,
  buildCountsOnlyWcagReport,
} from "./auditHtmlStructure.mjs";

test("well-structured sample clears the configured checks", () => {
  const result = auditHtmlStructure(`<!doctype html>
<html lang="en">
<head><title>Account settings</title></head>
<body>
  <header>Site header</header>
  <nav aria-label="Primary"><a href="/home">Home</a></nav>
  <main>
    <h1>Account settings</h1>
    <img src="shape.png" alt="">
    <form>
      <label for="email">Email address</label>
      <input id="email" name="email" type="email" autocomplete="email">
      <button type="submit">Save settings</button>
    </form>
    <table><caption>Plan details</caption><tr><th scope="col">Plan</th></tr><tr><td>Basic</td></tr></table>
  </main>
  <footer>Site footer</footer>
</body>
</html>`);

  assert.equal(result.findings.length, 0);
  assert.equal(result.assessment.level, "clear");
  assert.equal(result.stats.decorativeImages, 1);
});

test("finds missing document title and language", () => {
  const result = auditHtmlStructure("<html><head><title> </title></head><body><main>Hi</main></body></html>");
  const rules = new Set(result.findings.map((finding) => finding.ruleId));

  assert.equal(rules.has("document-language"), true);
  assert.equal(rules.has("page-title"), true);
});

test("does not mistake an SVG title for the document title", () => {
  const result = auditHtmlStructure(
    '<html lang="en"><body><main><h1>Icons</h1><svg><title>Search icon</title></svg></main></body></html>',
  );

  assert.ok(result.findings.some((finding) => finding.ruleId === "page-title"));
});

test("finds empty headings, missing h1, and skipped heading levels", () => {
  const result = auditHtmlStructure(
    '<html lang="en"><title>Page</title><main><h2>Section</h2><h4></h4></main></html>',
  );
  const rules = new Set(result.findings.map((finding) => finding.ruleId));

  assert.equal(rules.has("empty-heading"), true);
  assert.equal(rules.has("missing-h1"), true);
  assert.equal(rules.has("heading-order"), true);
});

test("handles empty image alt as decorative but catches unnamed image links", () => {
  const result = auditHtmlStructure(
    '<html lang="en"><title>Gallery</title><main><h1>Gallery</h1><img alt=""><a href="/buy"><img alt=""></a><img src="info.png"></main></html>',
  );
  const altFinding = result.findings.find(
    (finding) => finding.ruleId === "image-alt-missing",
  );
  const nameFinding = result.findings.find(
    (finding) => finding.ruleId === "interactive-name",
  );

  assert.equal(altFinding.count, 1);
  assert.equal(nameFinding.count, 1);
  assert.equal(result.stats.decorativeImages, 2);
});

test("checks form labels and button or link accessible-name heuristics", () => {
  const result = auditHtmlStructure(
    '<html lang="en"><title>Form</title><main><h1>Form</h1><input id="phone" placeholder="Phone"><button><svg aria-hidden="true"></svg></button><a href="/next" aria-label="Next step"></a></main></html>',
  );
  const fieldFinding = result.findings.find(
    (finding) => finding.ruleId === "form-field-label",
  );
  const controlFinding = result.findings.find(
    (finding) => finding.ruleId === "interactive-name",
  );

  assert.equal(fieldFinding.count, 1);
  assert.equal(controlFinding.count, 1);
});

test("finds duplicate IDs, untitled iframes, and positive tabindex", () => {
  const result = auditHtmlStructure(
    '<html lang="en"><head><title>Embed</title></head><main><h1>Embed</h1><div id="same"></div><p id="same" hidden></p><iframe src="remote.html"></iframe><button tabindex="3">Open</button></main></html>',
  );
  const rules = new Set(result.findings.map((finding) => finding.ruleId));

  assert.equal(rules.has("duplicate-id"), true);
  assert.equal(rules.has("iframe-title"), true);
  assert.equal(rules.has("positive-tabindex"), true);
});

test("checks table caption, header cells, and main landmarks", () => {
  const result = auditHtmlStructure(
    '<html lang="en"><title>Data</title><body><h1>Data</h1><table><tr><td>Value</td></tr></table></body></html>',
  );
  const rules = new Set(result.findings.map((finding) => finding.ruleId));

  assert.equal(rules.has("table-caption"), true);
  assert.equal(rules.has("table-headers"), true);
  assert.equal(rules.has("main-landmark"), true);
});

test("flags personal-data fields without useful autocomplete cues", () => {
  const result = auditHtmlStructure(
    '<html lang="en"><title>Profile</title><main><h1>Profile</h1><label for="full-name">Full name</label><input id="full-name" name="full-name" autocomplete="off"></main></html>',
  );

  assert.ok(
    result.findings.some((finding) => finding.ruleId === "autocomplete-cue"),
  );
});

test("script text and remote resource attributes remain inert strings", () => {
  globalThis.__altfAuditorExecuted = false;
  const result = auditHtmlStructure(
    '<html lang="en"><title>Safe parse</title><main><h1>Safe</h1><script>globalThis.__altfAuditorExecuted = true</script><img src="https://remote.invalid/pixel" alt="Status"><iframe src="https://remote.invalid/embed" title="Example"></iframe></main></html>',
  );

  assert.equal(globalThis.__altfAuditorExecuted, false);
  assert.equal(result.counts.error, 0);
  delete globalThis.__altfAuditorExecuted;
});

test("counts-only report excludes source content, attributes, and locations", () => {
  const privateSource =
    '<html><title>Secret Customer Portal</title><main><h1 id="private-account-7788">Portal</h1><img src="https://secret.example/private.png"></main></html>';
  const result = auditHtmlStructure(privateSource);
  const report = buildCountsOnlyWcagReport(result);

  assert.doesNotMatch(
    report,
    /Secret Customer|private-account|secret\.example|line \d+/iu,
  );
  assert.match(report, /counts and generic rule names only/iu);
  assert.match(report, /does not establish WCAG conformance/iu);
});

test("bounds unusually large HTML input", () => {
  const result = auditHtmlStructure(
    `<html lang="en"><title>Large</title><main><h1>Large</h1>${"x".repeat(auditorLimits.maxHtmlLength + 200)}`,
  );

  assert.equal(result.scannedCharacters, auditorLimits.maxHtmlLength);
  assert.equal(result.truncated, true);
});
