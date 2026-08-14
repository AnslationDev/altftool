import assert from "node:assert/strict";
import test from "node:test";

import { WEEK_ARC, buildPlan, buildShotList } from "./plan.js";
import { buildBio, buildCaption, buildHooks, nameCandidates } from "./voice.js";
import { buildDisclosure, combinedObligations } from "./disclosure.js";
import { buildProductionBudget, buildQuote } from "./economics.js";
import { DEFAULT_SPEC, normaliseSpec } from "./compose.js";
import { MARKET_IDS, PLATFORM_IDS } from "./taxonomy.js";
import { CAST } from "./catalog.js";

const SPEC = normaliseSpec({ ...DEFAULT_SPEC, niche: "money", platform: "linkedin" });

/* ------------------------------- plan -------------------------------- */

test("a plan covers thirty numbered days with no gaps", () => {
  const plan = buildPlan(SPEC);
  assert.equal(plan.days.length, 30);
  assert.deepEqual(
    plan.days.map((day) => day.day),
    Array.from({ length: 30 }, (_, index) => index + 1),
  );
});

test("posting days are spread rather than clustered", () => {
  const plan = buildPlan(SPEC);
  const postDays = plan.days.filter((day) => !day.rest).map((day) => day.day);
  assert.ok(postDays.length > 0);

  for (let index = 1; index < postDays.length; index += 1) {
    const gap = postDays[index] - postDays[index - 1];
    assert.ok(gap >= 1 && gap <= 7, `a ${gap}-day gap defeats the point of a cadence`);
  }
});

test("every post has a pillar drawn from its own week's arc", () => {
  const plan = buildPlan(SPEC);
  for (const entry of plan.days) {
    if (entry.rest) continue;
    const week = WEEK_ARC[entry.week - 1];
    assert.ok(
      week.pillars.includes(entry.pillar.id),
      `day ${entry.day} used "${entry.pillar.id}", which is not in week ${entry.week}`,
    );
  }
});

test("every post has a shot the persona's route can actually afford", () => {
  const rank = { "prompt-only": 0, reference: 1, trained: 2 };
  for (const entry of CAST.slice(0, 6)) {
    const plan = buildPlan(entry.spec);
    for (const day of plan.days) {
      if (day.rest) continue;
      assert.ok(day.shot, `day ${day.day} has no shot`);
      assert.ok(rank[day.shot.minRoute] <= rank[plan.route.id]);
      assert.ok(
        !day.shot.niches?.length || day.shot.niches.includes(entry.niche),
        `${entry.slug} was planned "${day.shot.slug}", which belongs to another niche`,
      );
    }
  }
});

test("the plan is deterministic", () => {
  assert.equal(
    JSON.stringify(buildPlan(SPEC).days.map((day) => day.shot?.slug)),
    JSON.stringify(buildPlan(SPEC).days.map((day) => day.shot?.slug)),
  );
});

test("the shot list batches the month by setup, heaviest first", () => {
  const list = buildShotList(buildPlan(SPEC));
  assert.ok(list.length > 0);
  for (let index = 1; index < list.length; index += 1) {
    assert.ok(list[index - 1].count >= list[index].count);
  }
  const totalUses = list.reduce((total, row) => total + row.count, 0);
  assert.equal(totalUses, buildPlan(SPEC).summary.posts);
});

test("the summary adds up", () => {
  const plan = buildPlan(SPEC);
  const { summary } = plan;
  assert.equal(summary.posts + summary.restDays, 30);
  assert.equal(summary.videos + summary.stills, summary.posts);
  assert.ok(summary.productionMinutes > 0);
});

/* ------------------------------- voice ------------------------------- */

test("hooks are filled, distinct and carry no unreplaced token", () => {
  const hooks = buildHooks(SPEC, { pillar: "compare", topic: "index funds" });
  assert.ok(hooks.length >= 3);
  for (const hook of hooks) {
    assert.doesNotMatch(hook.text, /\{topic\}/);
    assert.ok(hook.text.length > 10);
  }
  assert.equal(new Set(hooks.map((hook) => hook.text)).size, hooks.length);
});

test("a caption carries the disclosure as its own part", () => {
  const caption = buildCaption(SPEC, { paid: true });
  const disclosure = caption.parts.find((part) => part.role === "disclosure");
  assert.ok(disclosure);
  assert.ok(disclosure.text.includes("#ad"));
  assert.ok(caption.budget > 0);
});

test("bios fit the tightest surface we target", () => {
  const bios = buildBio(SPEC);
  assert.equal(bios.length, 3);
  assert.ok(bios.some((bio) => bio.fitsInstagram));
});

test("name candidates are distinct and produce usable handles", () => {
  const names = nameCandidates(SPEC, 5);
  assert.ok(names.length >= 3);
  for (const candidate of names) {
    assert.match(candidate.handle, /^[a-z0-9._]+$/);
    assert.ok(candidate.name.includes(" "));
  }
});

test("voice output is deterministic", () => {
  assert.equal(
    JSON.stringify(nameCandidates(SPEC, 5)),
    JSON.stringify(nameCandidates(SPEC, 5)),
  );
});

/* ---------------------------- disclosure ----------------------------- */

test("every market and platform pair produces a complete disclosure", () => {
  for (const market of MARKET_IDS) {
    for (const platform of PLATFORM_IDS) {
      const result = buildDisclosure({ market, platform, paid: true });
      assert.ok(result.profileLine.length > 10, `${market}/${platform} profile line`);
      assert.ok(result.captionLine.includes("#ad"));
      assert.ok(result.placement.length > 20);
      assert.ok(result.obligations.length >= 3);
      assert.doesNotMatch(result.profileLine, /\{disclosure\}/);
    }
  }
});

test("the disclosure follows the post's language, not the site's", () => {
  const hindi = buildDisclosure({ language: "hi", market: "in", paid: true });
  assert.ok(hindi.captionLine.includes("एआई-निर्मित"));
  assert.ok(hindi.adLabel.includes("विज्ञापन"));
});

test("an unpaid post carries the AI disclosure but not the ad label", () => {
  const organic = buildDisclosure({ paid: false });
  assert.ok(!organic.captionLine.includes("#ad"));
  assert.ok(organic.captionLine.includes("AI-generated"));
  assert.ok(!organic.obligations.some((item) => item.id === "commercial"));
});

test("combined obligations deduplicate across markets", () => {
  const combined = combinedObligations(["us", "uk", "in"]);
  const texts = combined.map((item) => item.text.toLowerCase());
  assert.equal(new Set(texts).size, texts.length);
  assert.equal(combinedObligations([]).length, 0);
});

/* ---------------------------- economics ------------------------------ */

test("quote totals only the user's supplied line items", () => {
  const quote = buildQuote({
    currency: "inr",
    creativeFee: 1200,
    usageRightsFee: 300,
    exclusivityFee: 200,
    rushFee: 50,
    expenses: 25,
  });
  assert.equal(quote.currency, "INR");
  assert.equal(quote.total, 1775);
  assert.equal(quote.lines.length, 5);
});

test("production budget separates cash and user-valued labour", () => {
  const budget = buildProductionBudget({
    posts: 10,
    tools: 100,
    training: 50,
    storage: 25,
    other: 25,
    hours: 8,
    hourlyRate: 20,
  });
  assert.equal(budget.cash, 200);
  assert.equal(budget.labour, 160);
  assert.equal(budget.total, 360);
  assert.equal(budget.perPost, 36);
});

test("worksheet inputs are clamped rather than propagated", () => {
  const quote = buildQuote({ creativeFee: -10, expenses: Number.NaN });
  const budget = buildProductionBudget({ posts: 0, hours: -2, tools: Infinity });
  assert.equal(quote.total, 0);
  assert.equal(budget.posts, 1);
  assert.equal(budget.total, 0);
  assert.ok(Number.isFinite(budget.perPost));
});
