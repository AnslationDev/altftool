/*
 * AltF Persona — the cast, and everything that reads across cast and shots
 *
 * The shot library lives in shots.js and validates itself there; this module
 * adds the personas, validates the cross-references between the two, and
 * exposes the reads the routes need.
 *
 * VALIDATION THROWS. These are authoring mistakes, not runtime conditions — an
 * unknown pillar id silently drops a persona off a filter and nothing else
 * complains, which is exactly the class of bug that reaches production. The
 * thrown error lists every problem at once rather than the first one.
 *
 * DERIVED SELECTORS ARE MEMOISED. They are called from generateStaticParams,
 * generateMetadata AND the body of every route, which is three times per page.
 * Treat the returned arrays as read-only; callers share one instance.
 */

import {
  ARCHETYPE_BY_ID,
  ARCHETYPE_IDS,
  LANGUAGE_IDS,
  MARKET_IDS,
  NICHE_BY_SLUG,
  NICHE_SLUGS,
  PILLAR_IDS,
  PLATFORM_BY_ID,
  PLATFORM_IDS,
  ROUTE_IDS,
} from "./taxonomy.js";
import { TRAIT_FIELDS, traitOption } from "./traits.js";
import { buildLockedLine, identitySeed, normaliseSpec, recommendRoute } from "./compose.js";
import { SHOTS, SHOT_BY_SLUG, getPopulatedShotCategories } from "./shots.js";

import { CAST as CAST_A } from "./data/cast-a.js";
import { CAST as CAST_B } from "./data/cast-b.js";
import { CAST as CAST_C } from "./data/cast-c.js";

const RAW_CAST = [...CAST_A, ...CAST_B, ...CAST_C];

function memo(factory) {
  let cached;
  let filled = false;
  return () => {
    if (!filled) {
      cached = factory();
      filled = true;
    }
    return cached;
  };
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validate(cast) {
  const problems = [];
  const castSlugs = new Set();

  for (const entry of cast) {
    const at = entry.slug || entry.name || "<unnamed persona>";
    if (!entry.slug) problems.push(`cast ${at}: missing slug`);
    if (!SLUG_PATTERN.test(entry.slug || "")) {
      problems.push(`cast ${at}: slug is not kebab-case`);
    }
    if (castSlugs.has(entry.slug)) problems.push(`cast ${at}: duplicate slug`);
    castSlugs.add(entry.slug);

    if (!entry.name) problems.push(`cast ${at}: missing name`);
    if (!entry.handle) problems.push(`cast ${at}: missing handle`);
    if (!entry.tagline) problems.push(`cast ${at}: missing tagline`);
    if (entry.tagline && entry.tagline.length > 95) {
      problems.push(
        `cast ${at}: tagline is ${entry.tagline.length} chars (max 95)`,
      );
    }
    if (!entry.bio) problems.push(`cast ${at}: missing bio`);
    if (!entry.works) problems.push(`cast ${at}: missing "works" note`);
    if (!entry.avoid) problems.push(`cast ${at}: missing "avoid" note`);

    if (!NICHE_SLUGS.includes(entry.niche)) {
      problems.push(`cast ${at}: unknown niche "${entry.niche}"`);
    }
    if (!PLATFORM_IDS.includes(entry.platform)) {
      problems.push(`cast ${at}: unknown platform "${entry.platform}"`);
    }
    if (!MARKET_IDS.includes(entry.market)) {
      problems.push(`cast ${at}: unknown market "${entry.market}"`);
    }
    if (!LANGUAGE_IDS.includes(entry.language)) {
      problems.push(`cast ${at}: unknown language "${entry.language}"`);
    }
    if (!ARCHETYPE_IDS.includes(entry.archetype)) {
      problems.push(`cast ${at}: unknown archetype "${entry.archetype}"`);
    }
    for (const pillar of entry.pillars || []) {
      if (!PILLAR_IDS.includes(pillar)) {
        problems.push(`cast ${at}: unknown pillar "${pillar}"`);
      }
    }

    /*
     * The spec must be complete, not merely valid. normaliseSpec would happily
     * fill a missing eye shape from the default — and then two personas that
     * were authored differently would quietly share a face.
     */
    for (const field of TRAIT_FIELDS) {
      const value = entry.spec?.[field.key];
      if (value === undefined) {
        problems.push(`cast ${at}: spec is missing "${field.key}"`);
      } else if (!traitOption(field.key, value)) {
        problems.push(`cast ${at}: unknown ${field.key} "${value}"`);
      }
    }

    if (!entry.shots?.length) {
      problems.push(`cast ${at}: needs at least one paired shot`);
    }
    for (const slug of entry.shots || []) {
      const shot = SHOT_BY_SLUG[slug];
      if (!shot) {
        problems.push(`cast ${at}: shot "${slug}" is not in the library`);
        continue;
      }
      /* A niche-bound shot on a persona from another niche renders a card that
         is plausible and wrong — the exact failure the `niches` field exists to
         prevent, so it is checked here rather than left to a reviewer. */
      if (shot.niches?.length && !shot.niches.includes(entry.niche)) {
        problems.push(
          `cast ${at}: shot "${slug}" is bound to ${shot.niches.join("/")}, not ${entry.niche}`,
        );
      }
    }
  }

  const seenSeeds = new Map();
  for (const entry of cast) {
    if (!entry.spec) continue;
    const { token } = identitySeed(entry.spec);
    if (seenSeeds.has(token)) {
      problems.push(
        `cast ${entry.slug}: identity seed ${token} collides with ${seenSeeds.get(token)} — two personas with the same face`,
      );
    }
    seenSeeds.set(token, entry.slug);
  }

  if (problems.length) {
    throw new Error(
      `AltF Persona catalog is invalid:\n  - ${problems.join("\n  - ")}`,
    );
  }
}

validate(RAW_CAST);

export const CAST = RAW_CAST.map((entry) => {
  const spec = normaliseSpec({
    ...entry.spec,
    name: entry.name,
    handle: entry.handle,
    niche: entry.niche,
    platform: entry.platform,
    market: entry.market,
    language: entry.language,
    archetype: entry.archetype,
    pillars: entry.pillars,
  });

  return {
    ...entry,
    spec,
    seed: identitySeed(spec),
    lockedLine: buildLockedLine(spec),
    route: recommendRoute(spec),
    niche_: NICHE_BY_SLUG[entry.niche],
    platform_: PLATFORM_BY_ID[entry.platform],
    archetype_: ARCHETYPE_BY_ID[entry.archetype],
    shots_: (entry.shots || []).map((slug) => SHOT_BY_SLUG[slug]).filter(Boolean),
  };
});

export const CAST_BY_SLUG = Object.fromEntries(
  CAST.map((entry) => [entry.slug, entry]),
);

/* Re-exported so a route can import the whole product surface from one path. */
export {
  SHOTS,
  SHOT_BY_SLUG,
  getPopulatedShotCategories,
  getShot,
  searchShots,
  shotsForNiche,
  shotsForRoute,
  shotsInCategory,
} from "./shots.js";

export function getPersona(slug) {
  return CAST_BY_SLUG[slug] || null;
}

export const getFeaturedCast = memo(() =>
  CAST.filter((entry) => entry.featured),
);

export function castInNiche(slug) {
  return CAST.filter((entry) => entry.niche === slug);
}

export function castOnRoute(id) {
  return CAST.filter((entry) => entry.route.id === id);
}

/** Personas that pair with a shot — the reverse of entry.shots. */
export function castUsingShot(slug) {
  return CAST.filter((entry) => (entry.shots || []).includes(slug));
}

export const getPopulatedNiches = memo(() =>
  NICHE_SLUGS.map((slug) => ({
    ...NICHE_BY_SLUG[slug],
    count: CAST.filter((entry) => entry.niche === slug).length,
  })).filter((niche) => niche.count > 0),
);

export const getStats = memo(() => {
  const routes = Object.fromEntries(
    ROUTE_IDS.map((id) => [id, CAST.filter((entry) => entry.route.id === id).length]),
  );

  return {
    personas: CAST.length,
    shots: SHOTS.length,
    stills: SHOTS.filter((shot) => shot.kind === "still").length,
    videos: SHOTS.filter((shot) => shot.kind === "video").length,
    niches: getPopulatedNiches().length,
    shotCategories: getPopulatedShotCategories().length,
    platforms: new Set(CAST.map((entry) => entry.platform)).size,
    markets: new Set(CAST.map((entry) => entry.market)).size,
    languages: new Set(CAST.map((entry) => entry.language)).size,
    routes,
    freeShots: SHOTS.filter((shot) => shot.minRoute === "prompt-only").length,
  };
});

/* Simple substring search over the fields a reader would actually type. */
export function searchCast(query) {
  const needle = String(query || "").trim().toLowerCase();
  if (needle.length < 2) return [];

  return CAST.filter((entry) =>
    [
      entry.name,
      entry.handle,
      entry.tagline,
      entry.bio,
      entry.niche_.label,
      entry.archetype_.label,
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}
