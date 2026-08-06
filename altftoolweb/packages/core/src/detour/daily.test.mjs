import assert from "node:assert/strict";
import test from "node:test";

import {
  dailyPool,
  dateKey,
  hashString,
  pickForDate,
  recentPicks,
} from "./daily.js";
import { ALL_SITES } from "./catalog.js";

test("the same date always yields the same site", () => {
  const first = pickForDate(ALL_SITES, "2026-07-29");
  const second = pickForDate(ALL_SITES, "2026-07-29");
  assert.ok(first);
  assert.equal(first.slug, second.slug);
});

test("different dates generally yield different sites", () => {
  const a = pickForDate(ALL_SITES, "2026-07-29");
  const b = pickForDate(ALL_SITES, "2026-07-30");
  assert.notEqual(a.slug, b.slug);
});

test("a year of picks is well spread", () => {
  // A weak hash mods into a handful of buckets. Collisions are expected over
  // 365 draws from ~1,280 entries, but the count must stay close to the
  // birthday-problem expectation rather than collapsing.
  const seen = new Set();
  const start = new Date("2026-01-01T00:00:00Z");
  for (let day = 0; day < 365; day += 1) {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + day);
    seen.add(pickForDate(ALL_SITES, dateKey(date)).slug);
  }
  assert.ok(
    seen.size > 300,
    `only ${seen.size} distinct sites across 365 days — hash is clustering`,
  );
});

test("the pool excludes meta categories", () => {
  const pool = dailyPool(ALL_SITES);
  assert.ok(pool.length > 0);
  // "Today's detour is a list of other lists" is a wasted day.
  assert.ok(!pool.some((site) => site.category === "directories"));
  assert.ok(!pool.some((site) => site.category === "arcade-hubs"));
});

test("the pool is sorted, so it is predictable to inspect", () => {
  // The pick itself no longer depends on pool order — rendezvous hashing is
  // order-independent, which the next test proves — but a sorted pool keeps
  // debugging output stable.
  const pool = dailyPool(ALL_SITES);
  const sorted = [...pool].sort((a, b) => a.slug.localeCompare(b.slug, "en"));
  assert.deepEqual(
    pool.map((s) => s.slug),
    sorted.map((s) => s.slug),
  );
});

test("shuffling the input does not change the pick", () => {
  // Guards the ordering guarantee above: catalog order must not leak in.
  const shuffled = [...ALL_SITES].reverse();
  assert.equal(
    pickForDate(ALL_SITES, "2026-03-14").slug,
    pickForDate(shuffled, "2026-03-14").slug,
  );
});

test("dateKey is a UTC calendar day", () => {
  assert.equal(dateKey(new Date("2026-07-29T23:59:59Z")), "2026-07-29");
  assert.equal(dateKey(new Date("2026-07-30T00:00:01Z")), "2026-07-30");
});

test("hashString is stable and spreads short keys", () => {
  assert.equal(hashString("2026-07-29#0"), hashString("2026-07-29#0"));
  assert.notEqual(hashString("2026-07-29#0"), hashString("2026-07-30#0"));
  const hashes = new Set(
    Array.from({ length: 200 }, (_, i) => hashString(`2026-01-01#${i}`) % 1000),
  );
  assert.ok(hashes.size > 150, `only ${hashes.size} distinct buckets from 200`);
});

test("recentPicks walks backwards and never repeats a date", () => {
  const picks = recentPicks(ALL_SITES, 7, new Date("2026-07-29T12:00:00Z"));
  assert.equal(picks.length, 7);
  assert.equal(picks[0].key, "2026-07-29");
  assert.equal(picks[6].key, "2026-07-23");
  assert.equal(new Set(picks.map((p) => p.key)).size, 7);
  picks.forEach((p) => assert.ok(p.site, `no site for ${p.key}`));
});

test("recentPicks agrees with pickForDate for each day", () => {
  recentPicks(ALL_SITES, 5, new Date("2026-05-05T00:00:00Z")).forEach((entry) => {
    assert.equal(entry.site.slug, pickForDate(ALL_SITES, entry.key).slug);
  });
});

test("an empty catalog returns null rather than throwing", () => {
  assert.equal(pickForDate([], "2026-07-29"), null);
});

test("growing the catalog barely disturbs past picks", () => {
  /*
   * The reason pickForDate uses rendezvous hashing rather than a modulo.
   *
   * The "Previously" list on /detour/today re-derives old days from the current
   * catalog, so if adding an entry reshuffled everything, that list would show
   * sites that were never actually the pick — while the page claims the
   * opposite. Adding one entry to ~1,280 should change roughly one day in
   * 1,280, not all of them.
   */
  const days = Array.from({ length: 200 }, (_, offset) => {
    const date = new Date("2026-01-01T00:00:00Z");
    date.setUTCDate(date.getUTCDate() + offset);
    return dateKey(date);
  });

  const before = days.map((key) => pickForDate(ALL_SITES, key).slug);

  const grown = [
    ...ALL_SITES,
    {
      slug: "zzz-hypothetical-new-entry",
      name: "Hypothetical",
      url: "https://example.invalid/",
      category: "pointless-fun",
      vibes: ["weird"],
      timeToJoy: "instant",
      blurb: "A stand-in used only to prove the daily pick is stable.",
      bestOn: "both",
      sfw: true,
      needsSound: false,
      free: true,
      needsAccount: false,
      origin: "web",
    },
  ];

  const after = days.map((key) => pickForDate(grown, key).slug);
  const changed = before.filter((slug, index) => slug !== after[index]).length;

  assert.ok(
    changed <= 3,
    `${changed}/200 past picks moved after adding one entry — the archive would be lying`,
  );
});

test("removing an entry only disturbs the days it won", () => {
  const days = Array.from({ length: 120 }, (_, offset) => {
    const date = new Date("2026-06-01T00:00:00Z");
    date.setUTCDate(date.getUTCDate() + offset);
    return dateKey(date);
  });

  const before = days.map((key) => pickForDate(ALL_SITES, key).slug);
  // Drop a site that never wins in this window; nothing should move.
  const neverWins = ALL_SITES.find(
    (site) => !before.includes(site.slug) && site.category !== "directories",
  );
  assert.ok(neverWins, "expected a site that wins on none of these days");

  const trimmed = ALL_SITES.filter((site) => site.slug !== neverWins.slug);
  const after = days.map((key) => pickForDate(trimmed, key).slug);

  assert.deepEqual(after, before);
});
