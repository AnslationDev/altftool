/*
 * AltF Persona — the shot library
 *
 * Split out of catalog.js deliberately. The studio and the planner need the
 * shots and nothing else, and the cast rows are the heavier half of the data —
 * keeping them in separate modules is what stops a client bundle that only
 * plans a month from also shipping twenty-four character sheets.
 *
 * Validation throws at import time. The thrown error lists every problem at
 * once, because fixing authoring mistakes one round-trip at a time is
 * miserable.
 */

import {
  NICHE_SLUGS,
  PILLAR_IDS,
  ROUTE_BY_ID,
  ROUTE_IDS,
  SHOT_CATEGORY_BY_SLUG,
  SHOT_CATEGORY_SLUGS,
} from "./taxonomy.js";

import { SHOTS as SHOTS_A } from "./data/shots-a.js";
import { SHOTS as SHOTS_B } from "./data/shots-b.js";

const RAW_SHOTS = [...SHOTS_A, ...SHOTS_B];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validate(shots) {
  const problems = [];
  const seen = new Set();

  for (const shot of shots) {
    const at = shot.slug || shot.title || "<unnamed shot>";
    if (!shot.slug) problems.push(`shot ${at}: missing slug`);
    if (!SLUG_PATTERN.test(shot.slug || "")) {
      problems.push(`shot ${at}: slug is not kebab-case`);
    }
    if (seen.has(shot.slug)) problems.push(`shot ${at}: duplicate slug`);
    seen.add(shot.slug);

    if (!shot.title) problems.push(`shot ${at}: missing title`);
    if (!SHOT_CATEGORY_SLUGS.includes(shot.category)) {
      problems.push(`shot ${at}: unknown category "${shot.category}"`);
    }
    if (shot.kind !== "still" && shot.kind !== "video") {
      problems.push(`shot ${at}: kind must be still or video`);
    }
    if (!ROUTE_IDS.includes(shot.minRoute)) {
      problems.push(`shot ${at}: unknown minRoute "${shot.minRoute}"`);
    }
    for (const key of ["opening", "framing", "direction", "finish", "why"]) {
      if (!shot[key]) problems.push(`shot ${at}: missing ${key}`);
    }
    for (const pillar of shot.pillars || []) {
      if (!PILLAR_IDS.includes(pillar)) {
        problems.push(`shot ${at}: unknown pillar "${pillar}"`);
      }
    }
    /* `niches` is optional and absence means universal — a shot that lists no
       niche belongs in every plan. Listing an unknown one, though, silently
       removes the shot from every plan instead. */
    for (const slug of shot.niches || []) {
      if (!NICHE_SLUGS.includes(slug)) {
        problems.push(`shot ${at}: unknown niche "${slug}"`);
      }
    }
    if (!Array.isArray(shot.tips) || shot.tips.length < 1) {
      problems.push(`shot ${at}: needs at least one tip`);
    }
  }

  if (problems.length) {
    throw new Error(
      `AltF Persona shot library is invalid:\n  - ${problems.join("\n  - ")}`,
    );
  }
}

validate(RAW_SHOTS);

export const SHOTS = RAW_SHOTS.map((shot) => ({
  ...shot,
  category_: SHOT_CATEGORY_BY_SLUG[shot.category],
  route_: ROUTE_BY_ID[shot.minRoute],
}));

export const SHOT_BY_SLUG = Object.fromEntries(
  SHOTS.map((shot) => [shot.slug, shot]),
);

export const ROUTE_RANK = { "prompt-only": 0, reference: 1, trained: 2 };

export function getShot(slug) {
  return SHOT_BY_SLUG[slug] || null;
}

export function shotsInCategory(slug) {
  return SHOTS.filter((shot) => shot.category === slug);
}

export function shotsForRoute(routeId) {
  const ceiling = ROUTE_RANK[routeId];
  if (ceiling === undefined) return [];
  return SHOTS.filter((shot) => ROUTE_RANK[shot.minRoute] <= ceiling);
}

/**
 * A shot with no `niches` is universal. A shot that lists them is niche-bound,
 * and putting "Menu in hand" in a personal-finance calendar is exactly the kind
 * of plausible nonsense a generator produces when nobody models the constraint.
 */
export function shotsForNiche(nicheSlug) {
  return SHOTS.filter(
    (shot) => !shot.niches?.length || shot.niches.includes(nicheSlug),
  );
}

export function getPopulatedShotCategories() {
  return SHOT_CATEGORY_SLUGS.map((slug) => ({
    ...SHOT_CATEGORY_BY_SLUG[slug],
    count: SHOTS.filter((shot) => shot.category === slug).length,
  })).filter((category) => category.count > 0);
}

export function searchShots(query) {
  const needle = String(query || "").trim().toLowerCase();
  if (needle.length < 2) return [];

  return SHOTS.filter((shot) =>
    [shot.title, shot.framing, shot.direction, shot.why, shot.category_.label]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}
