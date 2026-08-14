import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_SPEC,
  buildChecklist,
  buildIdentityLine,
  buildNegativePrompt,
  buildPromptKit,
  buildPromptKits,
  buildStyleLine,
  composeSheet,
  describeSpec,
  identitySeed,
  isDefaultSpec,
  normaliseSpec,
  recommendRoute,
  specFromQuery,
  specToQuery,
} from "./compose.js";
import { IDENTITY_FIELD_KEYS, STYLE_FIELD_KEYS, TRAIT_FIELDS } from "./traits.js";
import { MODEL_SLUGS, ROUTE_IDS } from "./taxonomy.js";

/*
 * The whole product rests on one claim: the same choices always produce the
 * same person. These tests exist to make that claim falsifiable.
 */

test("the identity seed is stable across calls", () => {
  const a = identitySeed(DEFAULT_SPEC);
  const b = identitySeed({ ...DEFAULT_SPEC });
  assert.equal(a.token, b.token);
  assert.equal(a.numeric, b.numeric);
  assert.match(a.token, /^PSN-[0-9A-Z]{4}-[0-9A-Z]{3}$/);
});

test("styling changes do not mint a new person", () => {
  const base = identitySeed(DEFAULT_SPEC).token;

  for (const key of [...STYLE_FIELD_KEYS, "niche", "platform", "market", "name"]) {
    const field = TRAIT_FIELDS.find((entry) => entry.key === key);
    const changed = {
      ...DEFAULT_SPEC,
      [key]: field
        ? field.options.find((option) => option.id !== DEFAULT_SPEC[key]).id
        : "changed",
    };
    assert.equal(
      identitySeed(changed).token,
      base,
      `${key} should not change the identity seed`,
    );
  }
});

test("every identity field changes the seed", () => {
  const base = identitySeed(DEFAULT_SPEC).token;

  for (const key of IDENTITY_FIELD_KEYS) {
    const field = TRAIT_FIELDS.find((entry) => entry.key === key);
    const other = field.options.find((option) => option.id !== DEFAULT_SPEC[key]);
    const changed = identitySeed({ ...DEFAULT_SPEC, [key]: other.id }).token;
    assert.notEqual(changed, base, `${key} must change the identity seed`);
  }
});

test("an unknown trait id degrades to the default rather than reaching a prompt", () => {
  const spec = normaliseSpec({ eyeShape: "; DROP TABLE", heritage: "nowhere" });
  assert.equal(spec.eyeShape, DEFAULT_SPEC.eyeShape);
  assert.equal(spec.heritage, DEFAULT_SPEC.heritage);
  assert.ok(!buildIdentityLine(spec).includes("undefined"));
});

test("the locked line never contains a pronoun", () => {
  for (const presentation of ["feminine", "masculine", "androgynous", "nonbinary"]) {
    const line = buildIdentityLine({ ...DEFAULT_SPEC, presentation });
    assert.doesNotMatch(
      line,
      /\b(her|his|their|she|he|they)\b/i,
      `"${line}" should be pronoun-free`,
    );
  }
});

test("the identity line emits fields in the declared order", () => {
  const line = buildIdentityLine(DEFAULT_SPEC);
  const positions = ["South Asian features", "an oval face", "almond eyes"].map((fragment) =>
    line.indexOf(fragment),
  );
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test("the style line is separate from the identity line", () => {
  const identity = buildIdentityLine(DEFAULT_SPEC);
  const style = buildStyleLine(DEFAULT_SPEC);
  assert.ok(style.includes("wearing"));
  assert.ok(!identity.includes("wearing"));
});

test("the negative prompt defends whatever the spec made distinctive", () => {
  const freckled = buildNegativePrompt({ ...DEFAULT_SPEC, mark: "freckles" });
  assert.ok(freckled.includes("clear skin"));

  const gapped = buildNegativePrompt({ ...DEFAULT_SPEC, mark: "tooth-gap" });
  assert.ok(gapped.includes("veneers"));
  assert.ok(!gapped.includes("freckles removed"));

  const older = buildNegativePrompt({ ...DEFAULT_SPEC, ageBand: "56+" });
  assert.ok(older.includes("de-aged face"));
});

test("recommendRoute returns a known route and names its reasons", () => {
  const result = recommendRoute(DEFAULT_SPEC);
  assert.ok(ROUTE_IDS.includes(result.id));
  assert.ok(result.reasons.length > 0);
  for (const reason of result.reasons) {
    assert.ok(reason.text.length > 20);
    assert.ok(reason.weight === "up" || reason.weight === "down");
  }
});

test("no distinguishing mark pushes the route up, a distinctive one does not", () => {
  const anchored = recommendRoute({ ...DEFAULT_SPEC, mark: "vitiligo" });
  const unanchored = recommendRoute({ ...DEFAULT_SPEC, mark: "none" });
  assert.ok(unanchored.score > anchored.score);
});

test("a prompt kit is produced for every model and contains the locked line", () => {
  const kits = buildPromptKits(DEFAULT_SPEC);
  assert.equal(kits.length, MODEL_SLUGS.length);

  const locked = buildIdentityLine(DEFAULT_SPEC);
  const midjourney = kits.find((kit) => kit.slug === "midjourney");
  assert.ok(midjourney.text.includes(locked));
  assert.ok(midjourney.text.includes("--seed"));
});

test("unfilled template tokens become readable placeholders, never {braces}", () => {
  for (const kit of buildPromptKits(DEFAULT_SPEC)) {
    assert.doesNotMatch(kit.text, /\{\w+\}/, `${kit.slug} left an unfilled token`);
  }
});

test("a shot composes around the locked line without redescribing the face", () => {
  const shot = {
    slug: "test",
    opening: "Studio photograph of",
    framing: "Head and shoulders",
    direction: "Looking into the lens",
    finish: "Plain backdrop",
  };
  const kit = buildPromptKit(DEFAULT_SPEC, "midjourney", { shot });
  assert.ok(kit.text.startsWith("Studio photograph of a woman"));
  assert.ok(kit.text.includes("Head and shoulders"));
});

test("an unknown model slug returns null rather than a broken kit", () => {
  assert.equal(buildPromptKit(DEFAULT_SPEC, "not-a-model"), null);
});

test("the spec round-trips through a query string", () => {
  const spec = normaliseSpec({
    ...DEFAULT_SPEC,
    name: "Test Person",
    handle: "@test.person",
    eyeColour: "green",
    hairColour: "copper",
    niche: "money",
    pillars: ["teach", "compare"],
  });

  const restored = specFromQuery(specToQuery(spec));
  assert.deepEqual(restored, spec);
  assert.equal(restored.handle, "test.person");
});

test("a hostile query string cannot inject anything into a prompt", () => {
  const restored = specFromQuery("eyeColour=<script>&handle=%3Cimg%20src%3Dx%3E&name=A".toString());
  assert.equal(restored.eyeColour, DEFAULT_SPEC.eyeColour);
  assert.equal(restored.handle, "imgsrcx");
  assert.ok(!composeSheet(restored).lockedLine.includes("<"));
});

test("isDefaultSpec only reports true for an untouched spec", () => {
  assert.equal(isDefaultSpec(DEFAULT_SPEC), true);
  assert.equal(isDefaultSpec({ ...DEFAULT_SPEC, name: "A" }), false);
  assert.equal(isDefaultSpec({ ...DEFAULT_SPEC, eyeColour: "green" }), false);
});

test("the checklist always names the seed the reader is looking at", () => {
  const sheet = composeSheet(DEFAULT_SPEC);
  const joined = buildChecklist(DEFAULT_SPEC)
    .map((item) => `${item.title} ${item.detail}`)
    .join(" ");
  assert.ok(joined.includes(String(sheet.seed.numeric)));
  assert.ok(joined.includes(sheet.seed.token));
});

test("describeSpec returns a label for every required field", () => {
  const rows = describeSpec(DEFAULT_SPEC);
  const required = TRAIT_FIELDS.filter((field) => field.required);
  assert.equal(rows.length, required.length);
  for (const row of rows) assert.ok(row.value.length > 0);
});

test("composeSheet is deterministic", () => {
  const a = JSON.stringify(composeSheet(DEFAULT_SPEC));
  const b = JSON.stringify(composeSheet(DEFAULT_SPEC));
  assert.equal(a, b);
});
