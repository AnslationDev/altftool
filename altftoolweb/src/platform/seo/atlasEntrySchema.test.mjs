import assert from "node:assert/strict";
import test from "node:test";

import { ENTRIES } from "../../../packages/core/src/atlas/catalog.js";
import { CATEGORY_BY_SLUG } from "../../../packages/core/src/atlas/taxonomy.js";
import { createAtlasEntryJsonLd } from "./atlasEntrySchema.js";

const SITE_URL = "https://www.altftool.com";
const ATLAS_URL = `${SITE_URL}/altfatlas`;

test("every Atlas detail schema separates the canonical page from the external site", () => {
  const accessLevelsCovered = new Set();
  const statusesCovered = new Set();
  let rendered = 0;

  for (const entry of ENTRIES) {
    const pageUrl = `${ATLAS_URL}/site/${entry.slug}`;
    const schema = createAtlasEntryJsonLd({
      entry,
      category: CATEGORY_BY_SLUG[entry.category],
      pageUrl,
      atlasUrl: ATLAS_URL,
    });

    rendered += 1;
    accessLevelsCovered.add(entry.access);
    statusesCovered.add(entry.status);

    assert.equal(schema["@type"], "WebPage", entry.slug);
    assert.equal(schema["@id"], `${pageUrl}#webpage`, entry.slug);
    assert.equal(schema.url, pageUrl, entry.slug);
    assert.equal(schema.dateModified, entry.checked, entry.slug);
    assert.equal(schema.isPartOf["@id"], `${ATLAS_URL}#collection`, entry.slug);
    assert.equal(schema.about["@type"], "WebSite", entry.slug);
    assert.equal(schema.about.name, entry.name, entry.slug);

    // Atlas has no first-party transaction or rating for these third-party
    // sites, so it must never manufacture SoftwareApplication rich-result data.
    assert.notEqual(schema["@type"], "WebApplication", entry.slug);
    assert.notEqual(schema.about["@type"], "WebApplication", entry.slug);
    assert.ok(!("offers" in schema), entry.slug);
    assert.ok(!("offers" in schema.about), entry.slug);
    assert.ok(!("price" in schema), entry.slug);
    assert.ok(!("price" in schema.about), entry.slug);

    if (entry.status === "live") {
      assert.equal(schema.about.url, entry.url, entry.slug);
      assert.notEqual(schema.about.url, pageUrl, entry.slug);
      assert.equal(schema.about.isAccessibleForFree, true, entry.slug);
    } else {
      assert.ok(!("url" in schema.about), entry.slug);
      assert.ok(!("isAccessibleForFree" in schema.about), entry.slug);
    }
  }

  assert.equal(rendered, ENTRIES.length);
  assert.deepEqual([...accessLevelsCovered].sort(), ["account", "freemium", "open"]);
  assert.deepEqual([...statusesCovered].sort(), ["live", "retired"]);
});

test("Atlas entry schema stays inert when its required page identity is missing", () => {
  assert.equal(createAtlasEntryJsonLd(), null);
  assert.equal(createAtlasEntryJsonLd({ entry: { name: "Example" } }), null);
});
