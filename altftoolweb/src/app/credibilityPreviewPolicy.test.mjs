import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { EXPERIENCE_CATALOG } from "../../packages/core/src/experienceCatalog.js";

const desktopSource = fs.readFileSync(new URL("./desktop/page.jsx", import.meta.url), "utf8");
const pulseSource = fs.readFileSync(new URL("./buzzfeed/page.jsx", import.meta.url), "utf8");
const pulseLayoutSource = fs.readFileSync(new URL("./buzzfeed/layout.jsx", import.meta.url), "utf8");
const sitemapSource = fs.readFileSync(new URL("./sitemap.js", import.meta.url), "utf8");
const experienceSource = fs.readFileSync(
  new URL("../../packages/core/src/experienceCatalog.js", import.meta.url),
  "utf8",
);

test("desktop is an unranked official-link directory", () => {
  assert.match(desktopSource, /Official-link directory/u);
  assert.match(desktopSource, /unranked directory/u);
  assert.doesNotMatch(desktopSource, /DesktopClient/u);
  assert.doesNotMatch(desktopSource, /AggregateRating|Review/u);
});

test("editorial preview is paused and excluded from search", () => {
  assert.match(pulseSource, /Editorial preview paused/u);
  assert.match(pulseLayoutSource, /noindex:\s*true/u);
  assert.match(pulseLayoutSource, /follow:\s*true/u);
  assert.doesNotMatch(pulseSource, /buzzfeedStaticData|buzzfeedData|Mock Article|Mock Author/u);
  assert.match(sitemapSource, /if \(experience\.noindex\) continue/u);
  assert.match(experienceSource, /slug:\s*["']buzzfeed["'][\s\S]*?selfChrome:\s*false[\s\S]*?noindex:\s*true/u);
});

test("mock community is described truthfully and excluded from search", () => {
  const altfWorld = EXPERIENCE_CATALOG.find((entry) => entry.slug === "altfworld");
  assert.equal(altfWorld?.noindex, true);
  assert.equal(altfWorld?.cta, "Explore the demo");
  assert.match(altfWorld?.description || "", /generated community-interface demo/u);
  assert.equal(EXPERIENCE_CATALOG.some((entry) => entry.slug === "animalhub"), false);
});

test("removed seed feeds and legacy clients cannot be imported again by accident", () => {
  const removed = [
    "./desktop/DesktopClient.jsx",
    "./buzzfeed/data/buzzfeedData.js",
    "./buzzfeed/data/buzzfeedStaticData.json",
  ];

  for (const file of removed) {
    assert.equal(fs.existsSync(new URL(file, import.meta.url)), false, `${file} should stay removed`);
  }
});
