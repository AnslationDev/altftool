import assert from "node:assert/strict";
import test from "node:test";

import { buildLandmarkReport, mapLandmarks } from "./mapLandmarks.mjs";

test("maps native landmarks and headings without executing source", () => {
  const result = mapLandmarks(`
    <header><h1>Site title</h1></header>
    <nav aria-label="Primary"><a href="/">Home</a></nav>
    <main><h2>Article</h2><p>Text</p></main>
    <footer>Footer</footer>
    <script>throw new Error("must not run")</script>
  `);
  assert.equal(result.ok, true);
  assert.deepEqual(
    result.landmarks.map((item) => [item.role, item.label]),
    [
      ["banner", ""],
      ["navigation", "Primary"],
      ["main", ""],
      ["contentinfo", ""],
    ],
  );
  assert.deepEqual(result.headings.map((item) => [item.level, item.text]), [
    [1, "Site title"],
    [2, "Article"],
  ]);
});

test("resolves aria-labelledby names from inert text", () => {
  const result = mapLandmarks(`
    <h2 id="account-label">Account controls</h2>
    <form aria-labelledby="account-label"><input></form>
    <main><h2>Content</h2></main>
  `);
  const form = result.landmarks.find((item) => item.role === "form");
  assert.equal(form.label, "Account controls");
  assert.equal(form.labelSource, "aria-labelledby");
});

test("does not treat unnamed form and section candidates as landmarks", () => {
  const result = mapLandmarks(
    "<main><section><h2>Topic</h2></section><form><input></form></main>",
  );
  assert.deepEqual(result.landmarks.map((item) => item.role), ["main"]);
  assert.equal(
    result.cues.filter((cue) => cue.id === "unnamed-landmark-candidate").length,
    2,
  );
});

test("reports missing main, repeated unlabelled navigation, and heading jumps", () => {
  const result = mapLandmarks(
    "<nav><h1>One</h1></nav><nav><h3>Three</h3></nav>",
  );
  const cueIds = new Set(result.cues.map((cue) => cue.id));
  assert.equal(cueIds.has("missing-main"), true);
  assert.equal(cueIds.has("repeated-unlabelled-landmark"), true);
  assert.equal(cueIds.has("heading-level-skip"), true);
});

test("skips aria-hidden subtrees and ignores script text", () => {
  const result = mapLandmarks(`
    <main>
      <h1>Visible</h1>
      <section aria-hidden="true"><h2>Private hidden heading</h2></section>
      <script><h2>Not markup</h2></script>
    </main>
  `);
  assert.deepEqual(result.headings.map((item) => item.text), ["Visible"]);
});

test("supports explicit landmark and heading roles", () => {
  const result = mapLandmarks(`
    <div role="main">
      <div role="heading" aria-level="2">Custom heading</div>
      <div role="search" aria-label="Products"></div>
    </div>
  `);
  assert.deepEqual(result.landmarks.map((item) => item.role), ["main", "search"]);
  assert.deepEqual(result.headings.map((item) => item.level), [2]);
});

test("counts-only report excludes HTML, labels, and heading text", () => {
  const source =
    '<nav aria-label="PRIVATE NAV"><h2>PRIVATE HEADING</h2></nav><main></main>';
  const result = mapLandmarks(source);
  const report = buildLandmarkReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes("PRIVATE NAV"), false);
  assert.equal(serialized.includes("PRIVATE HEADING"), false);
  assert.equal(report.scope.sourceExecuted, false);
  assert.equal(report.scope.conformanceEstablished, false);
});
