import assert from "node:assert/strict";
import test from "node:test";

import {
  CAST,
  SHOTS,
  castInNiche,
  castOnRoute,
  castUsingShot,
  getFeaturedCast,
  getPersona,
  getPopulatedNiches,
  getPopulatedShotCategories,
  getShot,
  getStats,
  searchCast,
  searchShots,
  shotsForNiche,
  shotsForRoute,
  shotsInCategory,
} from "./catalog.js";
import { ROUTE_IDS, SHOT_CATEGORY_SLUGS } from "./taxonomy.js";

/*
 * The validator throws at import time, so importing this module is itself the
 * first test. These cover what the validator cannot: editorial rules, coverage,
 * and the selectors the routes depend on.
 */

test("the catalog imports, meaning every row passed validation", () => {
  assert.ok(CAST.length >= 20);
  assert.ok(SHOTS.length >= 40);
});

test("every shot category has at least three shots in it", () => {
  for (const slug of SHOT_CATEGORY_SLUGS) {
    assert.ok(
      shotsInCategory(slug).length >= 3,
      `${slug} has only ${shotsInCategory(slug).length} shots — a category page with two entries is not a page`,
    );
  }
});

test("every persona's paired shots exist and are affordable on its route", () => {
  const rank = { "prompt-only": 0, reference: 1, trained: 2 };

  for (const entry of CAST) {
    assert.ok(entry.shots_.length >= 3, `${entry.slug} needs at least three paired shots`);
    for (const shot of entry.shots_) {
      assert.ok(
        rank[shot.minRoute] <= rank[entry.route.id] + 1,
        `${entry.slug} pairs "${shot.slug}", which needs a stronger route than the persona has`,
      );
    }
  }
});

test("a niche-bound shot never appears in a persona from another niche", () => {
  for (const entry of CAST) {
    for (const shot of entry.shots_) {
      if (!shot.niches?.length) continue;
      assert.ok(
        shot.niches.includes(entry.niche),
        `${entry.slug} (${entry.niche}) pairs "${shot.slug}", which is bound to ${shot.niches.join("/")}`,
      );
    }
  }
});

test("no two personas share an identity seed", () => {
  const seeds = CAST.map((entry) => entry.seed.token);
  assert.equal(new Set(seeds).size, seeds.length);
});

test("every persona carries the honesty pair the format promises", () => {
  for (const entry of CAST) {
    assert.ok(entry.works.length > 60, `${entry.slug}: "works" is too thin to be useful`);
    assert.ok(entry.avoid.length > 40, `${entry.slug}: "avoid" is too thin to be useful`);
    assert.ok(entry.tagline.length <= 95);
  }
});

test("the cast covers more than one route, or the route axis is decorative", () => {
  const populated = ROUTE_IDS.filter((id) => castOnRoute(id).length > 0);
  assert.ok(populated.length >= 2);
});

test("shotsForRoute is inclusive downward", () => {
  const cheap = shotsForRoute("prompt-only");
  const all = shotsForRoute("trained");
  assert.ok(cheap.length > 0);
  assert.equal(all.length, SHOTS.length);
  for (const shot of cheap) assert.ok(all.includes(shot));
});

test("shotsForNiche keeps universal shots and drops foreign ones", () => {
  const money = shotsForNiche("money");
  assert.ok(money.some((shot) => !shot.niches?.length));
  assert.ok(!money.some((shot) => shot.niches?.length && !shot.niches.includes("money")));
  assert.ok(money.length >= 15, "a niche with too few shots cannot fill a 30-day plan");
});

test("every niche has enough shots to fill a month", () => {
  for (const niche of getPopulatedNiches()) {
    assert.ok(
      shotsForNiche(niche.slug).length >= 15,
      `${niche.slug} only has ${shotsForNiche(niche.slug).length} usable shots`,
    );
  }
});

test("castUsingShot is the inverse of entry.shots", () => {
  const shot = SHOTS.find((candidate) => castUsingShot(candidate.slug).length > 0);
  assert.ok(shot);
  for (const entry of castUsingShot(shot.slug)) {
    assert.ok(entry.shots.includes(shot.slug));
  }
});

test("lookups return null rather than undefined for a missing slug", () => {
  assert.equal(getPersona("does-not-exist"), null);
  assert.equal(getShot("does-not-exist"), null);
  assert.ok(getPersona(CAST[0].slug));
});

test("stats agree with the catalog they describe", () => {
  const stats = getStats();
  assert.equal(stats.personas, CAST.length);
  assert.equal(stats.shots, SHOTS.length);
  assert.equal(stats.stills + stats.videos, SHOTS.length);
  assert.equal(stats.niches, getPopulatedNiches().length);
  assert.equal(stats.shotCategories, getPopulatedShotCategories().length);
  assert.equal(
    Object.values(stats.routes).reduce((total, count) => total + count, 0),
    CAST.length,
  );
});

test("memoised selectors hand back the same instance", () => {
  assert.equal(getStats(), getStats());
  assert.equal(getPopulatedNiches(), getPopulatedNiches());
  assert.equal(getFeaturedCast(), getFeaturedCast());
});

test("something is featured, or the landing page has nothing to show", () => {
  assert.ok(getFeaturedCast().length >= 3);
});

test("search needs two characters and matches the obvious fields", () => {
  assert.deepEqual(searchCast("a"), []);
  assert.deepEqual(searchShots("a"), []);

  const first = CAST[0];
  assert.ok(searchCast(first.name).some((entry) => entry.slug === first.slug));
  assert.ok(searchShots("flat lay").length > 0);
});

test("castInNiche only returns that niche", () => {
  for (const niche of getPopulatedNiches()) {
    for (const entry of castInNiche(niche.slug)) {
      assert.equal(entry.niche, niche.slug);
    }
  }
});
