/*
 * AltF Persona — the 30-day plan
 *
 * A character sheet without a plan is a costume. This turns a spec into thirty
 * numbered days: which pillar, which shot recipe, which hook, and an honest
 * estimate of how long the frame will take to produce on the route the spec
 * actually needs.
 *
 * THE ARC IS THE POINT. A plan that picks pillars at random produces thirty
 * unrelated posts, which is what most calendar tools ship and what nobody can
 * grow on. The four weeks here are an argument: say what you are for, show it
 * working, put it against the alternatives, then answer the room. Every pillar
 * choice is drawn from the week's pool rather than from the whole vocabulary.
 *
 * Deterministic throughout — no clock, no randomness. Same spec, same plan.
 */

import { fnv1a, identitySeed, normaliseSpec, recommendRoute } from "./compose.js";
/* shots.js rather than catalog.js on purpose — the planner runs in the studio's
   client bundle, and the cast rows are the heavier half of the data. */
import { ROUTE_RANK, shotsForNiche } from "./shots.js";
import { NICHE_BY_SLUG, PILLAR_BY_ID, PLATFORM_BY_ID, ROUTE_BY_ID } from "./taxonomy.js";
import { buildHooks } from "./voice.js";

export const WEEK_ARC = [
  {
    index: 1,
    title: "Say what you are for",
    goal: "A new visitor should be able to finish one post and state, in a sentence, what this account is about.",
    pillars: ["teach", "myth-bust", "list"],
  },
  {
    index: 2,
    title: "Show the method working",
    goal: "Move from claim to demonstration. This is the week the account earns the right to be believed.",
    pillars: ["prove", "routine", "behind-the-scenes", "teach"],
  },
  {
    index: 3,
    title: "Put it against the alternatives",
    goal: "Comparison content is what people search for and what brands read as commercial intent.",
    pillars: ["compare", "review", "haul", "list"],
  },
  {
    index: 4,
    title: "Answer the room",
    goal: "Everything from the first three weeks generated questions. Answering them publicly is the cheapest content there is.",
    pillars: ["q-and-a", "story", "react", "day-in-life"],
  },
];

const ROUTE_EFFORT = {
  "prompt-only": 1,
  reference: 1.35,
  trained: 1.7,
};

const BASE_EFFORT = { still: 25, video: 55 };

/**
 * Even distribution of N posts across 30 days. Spacing beats clustering: an
 * account that posts five times on Monday and nothing until Friday trains the
 * feed to stop showing it.
 */
function postDayNumbers(perWeek, days = 30) {
  const total = Math.max(1, Math.round((perWeek * days) / 7));
  const out = [];
  for (let index = 0; index < total; index += 1) {
    out.push(Math.floor((index * days) / total) + 1);
  }
  return [...new Set(out)];
}

function chooseShot(pool, key, recentSlugs) {
  if (!pool.length) return null;
  const fresh = pool.filter((shot) => !recentSlugs.includes(shot.slug));
  const from = fresh.length ? fresh : pool;
  return from[fnv1a(key) % from.length];
}

export function buildPlan(spec, options = {}) {
  const safe = normaliseSpec(spec);
  const seed = identitySeed(safe);
  const route = options.route || recommendRoute(safe);
  const platform = PLATFORM_BY_ID[safe.platform];
  const niche = NICHE_BY_SLUG[safe.niche];
  const days = options.days || 30;

  /* The pillars a persona actually claims win over the niche defaults, but a
     week's arc still filters them — otherwise week three has no comparisons in
     it and the whole shape collapses. */
  const claimed = safe.pillars.length ? safe.pillars : niche.pillars;
  const affordable = shotsForNiche(safe.niche).filter(
    (shot) => ROUTE_RANK[shot.minRoute] <= ROUTE_RANK[route.id],
  );

  const postDays = new Set(postDayNumbers(platform.cadencePerWeek, days));
  const recent = [];
  const entries = [];

  for (let day = 1; day <= days; day += 1) {
    const weekIndex = Math.min(WEEK_ARC.length, Math.ceil(day / 7));
    const week = WEEK_ARC[weekIndex - 1];

    if (!postDays.has(day)) {
      entries.push({ day, week: week.index, rest: true });
      continue;
    }

    const key = `${seed.token}:day:${day}`;
    const weekPool = week.pillars.filter((id) => claimed.includes(id));
    const pool = weekPool.length ? weekPool : week.pillars;
    const pillarId = pool[fnv1a(`${key}:pillar`) % pool.length];
    const pillar = PILLAR_BY_ID[pillarId];

    const biased = affordable.filter(
      (shot) => shot.category === pillar.shotBias && (shot.pillars || []).includes(pillarId),
    );
    const matching = affordable.filter((shot) => (shot.pillars || []).includes(pillarId));
    const shot =
      chooseShot(biased, `${key}:shot`, recent) ||
      chooseShot(matching, `${key}:shot`, recent) ||
      chooseShot(affordable, `${key}:shot`, recent);

    if (shot) {
      recent.push(shot.slug);
      if (recent.length > 5) recent.shift();
    }

    const hook = buildHooks(safe, { pillar: pillarId, count: 1 })[0];
    const kind = shot?.kind || "still";
    const effort = Math.round(BASE_EFFORT[kind] * (ROUTE_EFFORT[route.id] || 1));

    entries.push({
      day,
      week: week.index,
      rest: false,
      pillar,
      shot,
      hook: hook?.text || "",
      kind,
      format:
        kind === "video"
          ? `${platform.runSeconds[0]}–${platform.runSeconds[1]}s ${platform.aspect}`
          : `${platform.stillAspect} still`,
      effortMinutes: effort,
    });
  }

  const posts = entries.filter((entry) => !entry.rest);
  const weeks = WEEK_ARC.map((week) => ({
    ...week,
    days: entries.filter((entry) => entry.week === week.index),
    posts: posts.filter((entry) => entry.week === week.index).length,
  }));

  const shotsUsed = new Set(posts.map((entry) => entry.shot?.slug).filter(Boolean));

  return {
    spec: safe,
    seed,
    route: ROUTE_BY_ID[route.id],
    platform,
    niche,
    days: entries,
    weeks,
    summary: {
      posts: posts.length,
      videos: posts.filter((entry) => entry.kind === "video").length,
      stills: posts.filter((entry) => entry.kind === "still").length,
      distinctShots: shotsUsed.size,
      productionMinutes: posts.reduce((total, entry) => total + entry.effortMinutes, 0),
      setupMinutes: ROUTE_BY_ID[route.id].setupMinutes,
      restDays: entries.length - posts.length,
    },
  };
}

/**
 * A flat shopping list of every distinct shot the plan needs, so a month can be
 * produced in one batch instead of thirty separate sittings. Batching is the
 * entire operational advantage of a synthetic persona and almost nobody uses
 * it, because their calendar is organised by date rather than by setup.
 */
export function buildShotList(plan) {
  const counts = new Map();

  for (const entry of plan.days) {
    if (entry.rest || !entry.shot) continue;
    const current = counts.get(entry.shot.slug);
    if (current) {
      current.count += 1;
      current.days.push(entry.day);
    } else {
      counts.set(entry.shot.slug, { shot: entry.shot, count: 1, days: [entry.day] });
    }
  }

  return [...counts.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.shot.title.localeCompare(b.shot.title);
  });
}
