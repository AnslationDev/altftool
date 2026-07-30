import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { mergeCuratedRelatedTools } from "./toolRelatedCurations.js";

const routeUtilsSource = readFileSync(
  new URL("./toolRouteUtils.js", import.meta.url),
  "utf8",
);

const candidates = [
  { slug: "campaign-budget-planner", name: "Campaign Budget Planner" },
  { slug: "utm-link-builder", name: "Duplicate UTM candidate" },
  { slug: "link-preview", name: "Link Preview" },
  { slug: "qr-code-generator", name: "QR Code Generator" },
  { slug: "short-url-generator", name: "Short URL Generator" },
  { slug: "website-link-checker", name: "Website Link Checker" },
  { slug: "redirect-checker", name: "Redirect Checker" },
];

test("pins the UTM builder first on complementary tracking tools", () => {
  for (const slug of [
    "tracking-link-decoder",
    "url-tracking-parameter-stripper",
  ]) {
    const related = mergeCuratedRelatedTools(
      slug,
      candidates,
      6,
      () => "UTM Builder",
    );

    assert.equal(related[0].slug, "utm-link-builder");
    assert.equal(new Set(related.map((item) => item.slug)).size, related.length);
    assert.equal(related.length, 6);
  }
});

test("adds both complementary tools to the UTM builder without duplicates", () => {
  const related = mergeCuratedRelatedTools(
    "utm-link-builder",
    [
      { slug: "tracking-link-decoder", name: "Duplicate decoder" },
      ...candidates,
    ],
    6,
    (slug) => `Name for ${slug}`,
  );

  assert.deepEqual(
    related.slice(0, 2).map((item) => item.slug),
    ["tracking-link-decoder", "url-tracking-parameter-stripper"],
  );
  assert.equal(new Set(related.map((item) => item.slug)).size, related.length);
  assert.equal(related.length, 6);
});

test("the live related-tool resolver applies curated clusters after scoring", () => {
  assert.match(
    routeUtilsSource,
    /import \{ mergeCuratedRelatedTools \} from "\.\/toolRelatedCurations";/,
  );
  assert.match(
    routeUtilsSource,
    /return mergeCuratedRelatedTools\(\s*slug,\s*scoredRelatedTools,/,
  );
});
