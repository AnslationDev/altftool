import assert from "node:assert/strict";
import test from "node:test";

import {
  KYM_META_LIMITS,
  buildKymEntryDescription,
  buildKymEntryTitle,
  entryPhrase,
} from "./entryMeta.js";
import { contentGroups, getAllKymRoutes, findKymItem } from "./entries.js";

const { MAX_TITLE_LENGTH, MIN_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH } =
  KYM_META_LIMITS;

/**
 * The routes /kym/[slug] actually serves, minus the two that carry hand-written
 * metadata in the route file. Everything else is generated, so the assertions
 * below run over the real catalog rather than a sample.
 */
const CUSTOM_ROUTES = new Set([
  "/kym/weekly-meme-roundup",
  "/kym/meme-of-the-month-may-2026",
]);
const generatedItems = getAllKymRoutes()
  .filter((href) => !CUSTOM_ROUTES.has(href))
  .map((href) => findKymItem(href.replace("/kym/", "")));

test("the catalog still resolves to the routes these assertions cover", () => {
  assert.equal(getAllKymRoutes().length, 37);
  assert.equal(generatedItems.length, 35);
  assert.ok(generatedItems.every(Boolean));
});

test("every generated title renders inside the mobile SERP budget", () => {
  for (const item of generatedItems) {
    const title = buildKymEntryTitle(item);
    // /kym/[slug] gets no brand suffix — ../layout.jsx consumes the root
    // "%s | AltFTool" template — so the authored length is the rendered one.
    assert.ok(
      title.length <= MAX_TITLE_LENGTH,
      `${item.title}: title is ${title.length} chars (${title})`,
    );
    assert.ok(title.length > 0);
    assert.ok(!/[\s,;:—–-]$/.test(title), `${item.title}: title ends on a separator`);
  }
});

test("every generated description lands in the 150-158 window", () => {
  for (const item of generatedItems) {
    const description = buildKymEntryDescription(item);
    assert.ok(
      description.length >= MIN_DESCRIPTION_LENGTH &&
        description.length <= MAX_DESCRIPTION_LENGTH,
      `${item.title}: description is ${description.length} chars (${description})`,
    );
    assert.match(description, /[.!?]$/);
  }
});

test("generated copy reads as English on the real catalog", () => {
  for (const item of generatedItems) {
    const description = buildKymEntryDescription(item);
    // "a episode entry" / "a explainer entry" — the bug the category labels fix.
    assert.doesNotMatch(description, /\ba [aeiou]/i, description);
    // "What What Does 'Tweaking' Mean?" / "a entry entry".
    assert.doesNotMatch(description, /\b(\w+) \1\b/i, description);
    // "… Meme? — an episode entry": a finished sentence takes a new one.
    assert.doesNotMatch(description, /[.!?] —/, description);
  }
});

test("no two entries share a title or a description", () => {
  const titles = generatedItems.map((item) => buildKymEntryTitle(item));
  const descriptions = generatedItems.map((item) => buildKymEntryDescription(item));
  assert.equal(new Set(titles).size, titles.length);
  assert.equal(new Set(descriptions).size, descriptions.length);
});

test("titles keep the entry name whole whenever it fits", () => {
  const troll = contentGroups.find((item) => item.title === "Troll Face");
  assert.equal(buildKymEntryTitle(troll), "Troll Face — Meaning, Origin and Examples");

  // 129-character explainer title: clamps to its own question, not mid-word.
  const harambe = contentGroups.find((item) => item.title.startsWith("What Is Harambe"));
  assert.equal(
    buildKymEntryTitle(harambe),
    "What Is Harambe The Gorilla And Did He Really Become A Meme?",
  );
});

test("category phrases agree with their article", () => {
  assert.equal(entryPhrase("Meme"), "a meme entry");
  assert.equal(entryPhrase("Explainer"), "an explainer entry");
  assert.equal(entryPhrase("Episode"), "an episode entry");
  assert.equal(entryPhrase("Event"), "an event entry");
  assert.equal(entryPhrase("Collections"), "a collection entry");
  assert.equal(entryPhrase("Entry"), "an encyclopedia entry");
  assert.equal(entryPhrase(""), "an internet culture entry");
});

test("a record with no usable title still produces shippable metadata", () => {
  const description = buildKymEntryDescription({ category: "Meme" });
  assert.ok(description.length >= MIN_DESCRIPTION_LENGTH);
  assert.ok(description.length <= MAX_DESCRIPTION_LENGTH);
  assert.equal(buildKymEntryTitle({}), "Meme Encyclopedia Entry");
});

test("an oversized future title is clamped, not shipped whole", () => {
  const item = { title: "A".repeat(400), category: "Meme" };
  const description = buildKymEntryDescription(item);
  assert.ok(description.length <= MAX_DESCRIPTION_LENGTH, `${description.length}`);
  assert.ok(buildKymEntryTitle(item).length <= MAX_TITLE_LENGTH);
});
