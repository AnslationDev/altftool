/*
 * AltF Persona — the compose engine
 *
 * A persona spec goes in. A character sheet comes out: an identity seed, the
 * locked line, a prompt kit per generator, a negative prompt, the production
 * route the spec actually needs, and the checklist that keeps a face from
 * drifting.
 *
 * DETERMINISM IS THE PRODUCT. There is no Date.now() and no Math.random() in
 * this file, and there must never be one. The identity seed is a hash of the
 * normalised spec, which is what makes the claim on the tin — "the same
 * choices always produce the same person" — true rather than decorative. It is
 * also what lets a sheet round-trip through a URL with nothing stored on a
 * server.
 *
 * WORD ORDER IS PART OF THE SPEC. Image models weight earlier tokens more
 * heavily, so the emission order in traits.js is not cosmetic. Re-order the
 * fields and you have changed the person, not the sentence.
 */

import {
  MODELS,
  MODEL_BY_SLUG,
  NICHE_BY_SLUG,
  PLATFORM_BY_ID,
  ROUTE_BY_ID,
} from "./taxonomy.js";
import {
  IDENTITY_FIELD_KEYS,
  STYLE_FIELD_KEYS,
  TRAIT_FIELDS,
  TRAIT_FIELD_BY_KEY,
  traitLabel,
  traitOption,
  traitPrompt,
} from "./traits.js";

/* ------------------------------------------------------------------ *
 * Spec normalisation
 * ------------------------------------------------------------------ */

export const DEFAULT_SPEC = {
  name: "",
  handle: "",
  niche: "beauty",
  platform: "instagram",
  market: "global",
  language: "en",
  archetype: "the-explainer",

  presentation: "feminine",
  ageBand: "25-32",
  heritage: "south-asian",
  faceShape: "oval",
  eyeShape: "almond",
  eyeColour: "dark-brown",
  brows: "soft-arch",
  nose: "straight",
  lips: "balanced",
  mark: "freckles",

  hairLength: "shoulder",
  hairTexture: "wavy",
  hairColour: "dark-brown",
  hairDetail: "centre-part",
  skinTone: "golden",
  skinFinish: "natural",
  build: "average",
  height: "average",

  wardrobe: "minimal",
  palette: "warm-neutral",
  setting: "apartment",
  lighting: "window",
  camera: "eye",

  tone: "warm",
  value: "evidence",
  pillars: [],
};

/**
 * Fill missing fields from the default and drop anything not in the
 * vocabulary. A spec arriving from a URL is untrusted input — an unknown trait
 * id must degrade to the default, never render as `undefined` inside a prompt.
 */
export function normaliseSpec(input = {}) {
  const spec = { ...DEFAULT_SPEC };

  for (const field of TRAIT_FIELDS) {
    const value = input[field.key];
    spec[field.key] = traitOption(field.key, value)
      ? value
      : DEFAULT_SPEC[field.key];
  }

  spec.niche = NICHE_BY_SLUG[input.niche] ? input.niche : DEFAULT_SPEC.niche;
  spec.platform = PLATFORM_BY_ID[input.platform]
    ? input.platform
    : DEFAULT_SPEC.platform;
  spec.market = typeof input.market === "string" && input.market
    ? input.market
    : DEFAULT_SPEC.market;
  spec.language = typeof input.language === "string" && input.language
    ? input.language
    : DEFAULT_SPEC.language;
  spec.archetype =
    typeof input.archetype === "string" && input.archetype
      ? input.archetype
      : DEFAULT_SPEC.archetype;

  spec.name = cleanText(input.name, 48);
  spec.handle = cleanHandle(input.handle);
  spec.pillars = Array.isArray(input.pillars)
    ? input.pillars.filter((id) => typeof id === "string").slice(0, 6)
    : [];

  return spec;
}

function cleanText(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanHandle(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9._]/g, "")
    .slice(0, 30);
}

/* ------------------------------------------------------------------ *
 * Identity seed
 *
 * FNV-1a over the identity fields only. Deliberately NOT over the whole
 * spec: changing the wardrobe or the platform is a styling decision and
 * must not mint a new person. Changing an eye shape must.
 * ------------------------------------------------------------------ */

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

export function fnv1a(text = "") {
  let hash = FNV_OFFSET;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

/* Crockford base32 minus the ambiguous glyphs, so a seed can be read aloud. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encode(value, length) {
  let out = "";
  let remaining = value >>> 0;
  for (let index = 0; index < length; index += 1) {
    out = ALPHABET[remaining % 32] + out;
    remaining = Math.floor(remaining / 32);
  }
  return out;
}

export function identityFingerprint(spec) {
  const safe = normaliseSpec(spec);
  return IDENTITY_FIELD_KEYS.map((key) => `${key}:${safe[key]}`).join("|");
}

export function identitySeed(spec) {
  const fingerprint = identityFingerprint(spec);
  const primary = fnv1a(fingerprint);
  // A second pass over the reversed fingerprint widens the token past 32 bits
  // without pulling in a dependency; collisions inside one catalog matter more
  // than cryptographic strength here.
  const secondary = fnv1a([...fingerprint].reverse().join(""));

  return {
    token: `PSN-${encode(primary, 4)}-${encode(secondary, 3)}`,
    numeric: primary,
    fingerprint,
  };
}

/* ------------------------------------------------------------------ *
 * The locked line
 * ------------------------------------------------------------------ */

function joinClauses(parts) {
  return parts.filter(Boolean).join(", ");
}

function sentenceCase(text) {
  const trimmed = String(text).trim().replace(/\.$/, "");
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function buildIdentityLine(spec) {
  const safe = normaliseSpec(spec);
  const p = (key) => traitPrompt(key, safe[key]);

  const eyes = [p("eyeColour"), p("eyeShape")].filter(Boolean).join(" ");

  const hairDetail = p("hairDetail");
  const hair = [
    [p("hairLength"), p("hairTexture"), p("hairColour")]
      .filter(Boolean)
      .join(" "),
    "hair",
    hairDetail ? `with ${hairDetail}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const skin = [p("skinTone"), p("skinFinish")].filter(Boolean).join(", ");
  const frame = [p("height"), p("build")].filter(Boolean).join(" with ");

  return joinClauses([
    p("presentation"),
    p("ageBand"),
    p("heritage"),
    p("faceShape"),
    eyes,
    p("brows"),
    p("nose"),
    p("lips"),
    p("mark"),
    hair,
    skin,
    frame,
  ]);
}

export function buildStyleLine(spec) {
  const safe = normaliseSpec(spec);
  const p = (key) => traitPrompt(key, safe[key]);

  return joinClauses([
    `wearing ${p("wardrobe")}`,
    p("palette"),
    `in ${p("setting")}`,
    p("lighting"),
    `camera at ${p("camera")}`,
  ]);
}

/**
 * The single string that must appear, verbatim, in every prompt. Everything
 * else in a prompt is the shot; this is the person.
 */
export function buildLockedLine(spec) {
  return buildIdentityLine(spec);
}

/* ------------------------------------------------------------------ *
 * Negative prompt
 *
 * Two halves. The fixed half removes the things every model adds to a face
 * unasked — the beauty filter, the plastic skin, the symmetrical nothing.
 * The derived half protects whatever the spec chose to make distinctive,
 * because a model's default is to smooth exactly those away.
 * ------------------------------------------------------------------ */

const BASE_NEGATIVES = [
  "beauty filter",
  "airbrushed skin",
  "plastic skin",
  "waxy skin",
  "over-smoothed",
  "perfectly symmetrical face",
  "extra fingers",
  "malformed hands",
  "warped jewellery",
  "text artifacts",
  "watermark",
  "logo on clothing",
  "duplicate person",
  "changing facial structure",
];

const MARK_GUARDS = {
  freckles: ["clear skin", "freckles removed"],
  "beauty-mark": ["blemish-free retouching"],
  "tooth-gap": ["perfect straight teeth", "veneers"],
  "brow-scar": ["unblemished brow"],
  heterochromia: ["matching iris colour"],
  dimples: ["flat cheeks"],
  "widows-peak": ["straight hairline"],
  "cleft-chin": ["smooth chin"],
  "mole-cheek": ["retouched cheek"],
  vitiligo: ["even skin tone", "retouched skin"],
};

const FINISH_GUARDS = {
  natural: ["poreless skin"],
  "sun-weathered": ["youthified skin", "wrinkle removal"],
  freckled: ["clear skin"],
  matte: ["oily highlight"],
  dewy: ["flat matte skin"],
};

export function buildNegativePrompt(spec) {
  const safe = normaliseSpec(spec);
  const derived = [
    ...(MARK_GUARDS[safe.mark] || []),
    ...(FINISH_GUARDS[safe.skinFinish] || []),
  ];

  if (safe.build === "heavyset" || safe.build === "curvy") {
    derived.push("slimmed body", "idealised proportions");
  }
  if (safe.ageBand === "41-55" || safe.ageBand === "56+") {
    derived.push("de-aged face");
  }

  return [...BASE_NEGATIVES, ...derived].join(", ");
}

/* ------------------------------------------------------------------ *
 * Production route recommendation
 *
 * The honest answer to "what will this actually cost me". Scores the spec
 * against the things that break a face, and names every reason — a bare
 * verdict with no reasons is not usable advice.
 * ------------------------------------------------------------------ */

const FACE_CRITICAL_NICHES = new Set(["beauty", "fashion", "fitness", "wellness"]);
const LOW_FACE_NICHES = new Set(["food", "pets", "craft", "auto", "home"]);
const VIDEO_PLATFORMS = new Set(["tiktok", "youtube-shorts", "youtube"]);

export function recommendRoute(spec) {
  const safe = normaliseSpec(spec);
  const reasons = [];
  let score = 0;

  if (safe.mark === "none") {
    score += 2;
    reasons.push({
      weight: "up",
      text: "No distinguishing mark. There is nothing for a text prompt to anchor on, so the face will re-roll every generation.",
    });
  } else {
    reasons.push({
      weight: "down",
      text: `"${traitLabel("mark", safe.mark)}" gives the model a fixed landmark, which is the cheapest consistency you can buy.`,
    });
  }

  if (FACE_CRITICAL_NICHES.has(safe.niche)) {
    score += 2;
    reasons.push({
      weight: "up",
      text: `${NICHE_BY_SLUG[safe.niche].label} puts the face at the centre of most frames, so drift is the content rather than a defect in it.`,
    });
  } else if (LOW_FACE_NICHES.has(safe.niche)) {
    score -= 1;
    reasons.push({
      weight: "down",
      text: `${NICHE_BY_SLUG[safe.niche].label} is carried by hands and objects. The face is in maybe one frame in four, which forgives a lot.`,
    });
  }

  if (VIDEO_PLATFORMS.has(safe.platform)) {
    score += 2;
    reasons.push({
      weight: "up",
      text: `${PLATFORM_BY_ID[safe.platform].label} is a motion surface. A model interpolating frames re-imagines any face it was not confident about.`,
    });
  }

  const distinctiveHair =
    safe.hairDetail === "grey-streak" ||
    safe.hairColour === "dyed" ||
    safe.hairTexture === "locs" ||
    safe.hairTexture === "coily";
  if (distinctiveHair) {
    score -= 1;
    reasons.push({
      weight: "down",
      text: "Distinctive hair does a surprising amount of the recognition work at scroll speed, before anyone reads the face.",
    });
  }

  if (safe.ageBand === "18-24") {
    score += 1;
    reasons.push({
      weight: "up",
      text: "Young adult faces are the densest region of any model's training data, which means the least differentiated output.",
    });
  }

  const id = score >= 4 ? "trained" : score >= 1 ? "reference" : "prompt-only";
  const route = ROUTE_BY_ID[id];

  return {
    id,
    route,
    score,
    reasons,
    floor: ROUTE_BY_ID[id === "trained" ? "reference" : "prompt-only"],
  };
}

/* ------------------------------------------------------------------ *
 * Prompt kits
 * ------------------------------------------------------------------ */

const PLACEHOLDER = {
  referenceUrl: "[url of your approved reference frame]",
  endFrameUrl: "[url of your end frame]",
  trigger: "[your lora trigger word]",
  motion: "[what moves — keep it small]",
  camera: "slow push in",
  line: "[one line of dialogue]",
  script: "[your script]",
  voice: "[your saved voice]",
  style: "conversational",
  variable: "[the one thing that changes in this shot]",
  seconds: "8",
};

function fillTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    if (value === undefined || value === null || value === "") {
      return PLACEHOLDER[key] !== undefined ? PLACEHOLDER[key] : match;
    }
    return String(value);
  });
}

/**
 * Build the prompt kit for one model.
 *
 * `shot` is optional. Without one the kit describes the persona at rest, which
 * is what you want for the first reference frame; with one it describes the
 * persona doing something, which is what you want for everything after.
 */
export function buildPromptKit(spec, modelSlug, options = {}) {
  const model = MODEL_BY_SLUG[modelSlug];
  if (!model) return null;

  const safe = normaliseSpec(spec);
  const seed = identitySeed(safe);
  const platform = PLATFORM_BY_ID[safe.platform];
  const locked = buildLockedLine(safe);
  const style = buildStyleLine(safe);
  const shot = options.shot || null;

  /*
   * `opening` runs straight into the locked line — "Photograph of a woman,
   * late twenties, ..." — and everything after it is a separate sentence. The
   * locked line must never be broken across sentences or a model treats the
   * trailing clauses as describing the scene rather than the person.
   */
  const prompt = [
    `${shot?.opening || "Photograph of"} ${locked}`,
    style,
    shot?.framing || "Medium portrait, three-quarter angle, looking into the lens",
    shot?.direction || "Neutral expression, hands relaxed and out of frame",
    shot?.finish || "",
  ]
    .filter(Boolean)
    .map(sentenceCase)
    .join(". ");

  const aspect =
    options.aspect ||
    (model.kind === "video" ? platform.aspect : platform.stillAspect);

  const text = fillTemplate(model.syntax, {
    prompt,
    negative: buildNegativePrompt(safe),
    seed: seed.numeric,
    aspect,
    lockedLine: locked,
    handle: safe.handle || safe.name || "[your persona]",
    ...options.values,
  });

  return {
    model,
    slug: model.slug,
    label: model.label,
    kind: model.kind,
    text,
    consistency: model.consistency,
    supportsRoute: model.routes,
  };
}

export function buildPromptKits(spec, options = {}) {
  const kinds = options.kinds || ["image", "video", "avatar", "voice"];
  return MODELS.filter((model) => kinds.includes(model.kind))
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((model) => buildPromptKit(spec, model.slug, options))
    .filter(Boolean);
}

/* ------------------------------------------------------------------ *
 * Reproduction checklist — the part people skip and then wonder why the
 * face moved. Derived from the spec so it names the reader's own choices.
 * ------------------------------------------------------------------ */

export function buildChecklist(spec) {
  const safe = normaliseSpec(spec);
  const seed = identitySeed(safe);
  const route = recommendRoute(safe);
  const items = [
    {
      title: "Paste the locked line unedited",
      detail:
        "Every word, in this order. Rewording it is the single most common cause of a face moving, and it never looks like the cause because the sentence still means the same thing to you.",
    },
    {
      title: `Pin the seed to ${seed.numeric}`,
      detail:
        "A fixed seed makes a re-run reproducible. Change it only when you want a genuinely different frame, and write down which seed produced the reference you kept.",
    },
    {
      title: "Change one variable per generation",
      detail:
        "Wardrobe or setting or framing — never two. When the face moves you need to know which change moved it.",
    },
  ];

  if (route.id !== "prompt-only") {
    items.push({
      title: "Approve exactly one reference frame",
      detail:
        "Generate a batch, pick the one that is unmistakably the person, and then never re-pick. A reference set you keep re-choosing from is a persona that slowly becomes someone else.",
    });
  }

  if (route.id === "trained") {
    items.push({
      title: "Train on 12–20 frames, varied on purpose",
      detail:
        "Different angles, two lighting setups, at least three distances. A training set that is twenty near-identical frames teaches the model one pose, not one person.",
    });
  }

  items.push(
    {
      title: "Keep the negative prompt attached to the positive one",
      detail: `Yours specifically protects ${traitLabel("mark", safe.mark) || "the face"} and ${traitLabel("skinFinish", safe.skinFinish).toLowerCase()} skin — the two things models retouch away without being asked.`,
    },
    {
      title: "Version the sheet before you change it",
      detail: `The seed ${seed.token} belongs to this exact set of features. Change an eye shape and it becomes a different token, which is the system telling you it is a different person.`,
    },
    {
      title: "Leave the content credentials in the file",
      detail:
        "Platform AI labels read provenance metadata. Stripping it to dodge a label is the one action here that turns a disclosure problem into a deception problem.",
    },
  );

  return items;
}

/* ------------------------------------------------------------------ *
 * The sheet
 * ------------------------------------------------------------------ */

export function composeSheet(spec, options = {}) {
  const safe = normaliseSpec(spec);
  const seed = identitySeed(safe);
  const route = recommendRoute(safe);

  return {
    spec: safe,
    seed,
    identityLine: buildIdentityLine(safe),
    styleLine: buildStyleLine(safe),
    lockedLine: buildLockedLine(safe),
    negative: buildNegativePrompt(safe),
    route,
    kits: buildPromptKits(safe, options),
    checklist: buildChecklist(safe),
    niche: NICHE_BY_SLUG[safe.niche],
    platform: PLATFORM_BY_ID[safe.platform],
  };
}

/* ------------------------------------------------------------------ *
 * URL round-trip
 *
 * A sheet has to be shareable without an account, so the whole spec goes in
 * the query string. Keys are the field names — short codes would save maybe
 * forty characters and cost every future reader the decoder ring.
 * ------------------------------------------------------------------ */

const SERIALISED_KEYS = [
  "name",
  "handle",
  "niche",
  "platform",
  "market",
  "language",
  "archetype",
  ...TRAIT_FIELDS.map((field) => field.key),
];

export function specToQuery(spec) {
  const safe = normaliseSpec(spec);
  const params = new URLSearchParams();

  for (const key of SERIALISED_KEYS) {
    const value = safe[key];
    if (!value) continue;
    if (value === DEFAULT_SPEC[key] && key !== "name" && key !== "handle") {
      continue;
    }
    params.set(key, value);
  }
  if (safe.pillars.length) params.set("pillars", safe.pillars.join("."));

  return params.toString();
}

export function specFromQuery(query) {
  const params =
    typeof query === "string" ? new URLSearchParams(query) : query || new URLSearchParams();
  const raw = {};

  for (const key of SERIALISED_KEYS) {
    const value = params.get(key);
    if (value !== null) raw[key] = value;
  }
  const pillars = params.get("pillars");
  if (pillars) raw.pillars = pillars.split(".").filter(Boolean);

  return normaliseSpec(raw);
}

/* A spec is "started" once anything differs from the default. Used by the
 * studio to decide whether to show the resume banner. */
export function isDefaultSpec(spec) {
  const safe = normaliseSpec(spec);
  if (safe.name || safe.handle || safe.pillars.length) return false;
  return SERIALISED_KEYS.every((key) => safe[key] === DEFAULT_SPEC[key]);
}

/* Human-readable trait summary, used on cards and in JSON-LD. */
export function describeSpec(spec) {
  const safe = normaliseSpec(spec);
  return TRAIT_FIELDS.filter((field) => field.required)
    .map((field) => ({
      key: field.key,
      label: field.label,
      value: traitLabel(field.key, safe[field.key]),
    }))
    .filter((row) => row.value);
}

export { TRAIT_FIELD_BY_KEY, STYLE_FIELD_KEYS };
