import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * DailyHNT — Home module data layer.
 *
 * The home page is a single admin page composed of SEVEN sections. Each section
 * is either a singleton settings document (`home/<key>`) or a settings document
 * paired with an ordered collection (`home<Collection>`). Every field name below
 * is authoritative per `src/projects/dailyhnt/CONTRACT.md` — DO NOT rename them.
 *
 * Firestore layout (all under `projects/dailyhnt/...`):
 *   home/hero            singleton
 *   home/trustedLogos    singleton  + collection homeTrustedLogos
 *   home/stats           singleton  + collection homeStats
 *   home/aboutTeaser     singleton
 *   home/whyChooseUs     singleton  + collection homeWhyReasons
 *   home/cta             singleton
 *   home/newsletter      singleton
 *
 * Images upload to `projects/dailyhnt/home/<slot>-<ts>.<ext>`; the download URL
 * is stored in the section's URL field (`image` for docs, `src` for logos) with
 * a paired `imagePath` kept for later Storage cleanup.
 */

const PROJECT_ID = "dailyhnt";
const HOME_DOC_PATH = (key) => ["projects", PROJECT_ID, "home", key];
const COLLECTION_PATH = (name) => ["projects", PROJECT_ID, name];

// ---------------------------------------------------------------------------
// Shared value coercers.
// ---------------------------------------------------------------------------
const cleanText = (value = "") => String(value ?? "").trim();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** textarea (one entry per line) -> trimmed, de-blanked string[] */
const toLines = (value) => {
  if (Array.isArray(value)) {
    return value.map((line) => cleanText(line)).filter(Boolean);
  }
  return cleanText(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

/** { label, href } pair, always present so the frontend never reads undefined. */
const toCta = (value = {}) => ({
  label: cleanText(value?.label),
  href: cleanText(value?.href),
});

// ---------------------------------------------------------------------------
// 1) Hero — doc home/hero
// ---------------------------------------------------------------------------
export const DEFAULT_HERO = {
  eyebrow: "DAILY HEADLINES & TRENDS",
  headline: "Stay ahead with news that actually matters.",
  subcopy:
    "DailyHNT curates the stories, data, and analysis worth your time — delivered clean, fast, and without the noise.",
  primaryCta: { label: "Start Reading", href: "/blog" },
  secondaryCta: { label: "Explore Services", href: "/services" },
  meta: [],
  image: "",
  imagePath: "",
};

const heroDoc = createSingletonDocService(HOME_DOC_PATH("hero"), DEFAULT_HERO);

export const subscribeHero = heroDoc.subscribe;

export function saveHero(payload) {
  return heroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    subcopy: cleanText(payload.subcopy),
    primaryCta: toCta(payload.primaryCta),
    secondaryCta: toCta(payload.secondaryCta),
    meta: toLines(payload.meta),
    image: cleanText(payload.image),
    imagePath: cleanText(payload.imagePath),
  });
}

const heroUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/home/hero` });
export const uploadHeroImage = heroUploader.upload;
export const deleteHeroImage = heroUploader.remove;

// ---------------------------------------------------------------------------
// 2) Trusted Logos — doc home/trustedLogos + collection homeTrustedLogos
// ---------------------------------------------------------------------------
export const DEFAULT_TRUSTED_LOGOS = {
  label: "Trusted by teams at",
};

const trustedLogosDoc = createSingletonDocService(
  HOME_DOC_PATH("trustedLogos"),
  DEFAULT_TRUSTED_LOGOS,
);

export const subscribeTrustedLogos = trustedLogosDoc.subscribe;

export function saveTrustedLogos(payload) {
  return trustedLogosDoc.save({ label: cleanText(payload.label) });
}

function normalizeTrustedLogo(payload) {
  return {
    name: cleanText(payload.name),
    // Download URL — the frontend reads `src` (also accepts imageUrl).
    src: cleanText(payload.src),
    imagePath: cleanText(payload.imagePath),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const trustedLogosCollection = createCollectionCrudService(COLLECTION_PATH("homeTrustedLogos"), {
  normalize: normalizeTrustedLogo,
  orderByField: "order",
});

export const subscribeTrustedLogoItems = trustedLogosCollection.subscribe;
export const createTrustedLogo = trustedLogosCollection.create;
export const updateTrustedLogo = trustedLogosCollection.update;
export const deleteTrustedLogo = trustedLogosCollection.remove;
export const toggleTrustedLogoStatus = trustedLogosCollection.toggleActive;

const trustedLogoUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/home/logo` });
export const uploadTrustedLogoImage = trustedLogoUploader.upload;
export const deleteTrustedLogoImage = trustedLogoUploader.remove;

// ---------------------------------------------------------------------------
// 3) Stats — doc home/stats + collection homeStats
// ---------------------------------------------------------------------------
export const DEFAULT_STATS = {
  label: "By the numbers",
};

const statsDoc = createSingletonDocService(HOME_DOC_PATH("stats"), DEFAULT_STATS);

export const subscribeStats = statsDoc.subscribe;

export function saveStats(payload) {
  return statsDoc.save({ label: cleanText(payload.label) });
}

function normalizeStat(payload) {
  return {
    value: toNumber(payload.value),
    prefix: cleanText(payload.prefix),
    suffix: cleanText(payload.suffix),
    label: cleanText(payload.label),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const statsCollection = createCollectionCrudService(COLLECTION_PATH("homeStats"), {
  normalize: normalizeStat,
  orderByField: "order",
});

export const subscribeStatItems = statsCollection.subscribe;
export const createStat = statsCollection.create;
export const updateStat = statsCollection.update;
export const deleteStat = statsCollection.remove;
export const toggleStatStatus = statsCollection.toggleActive;

// ---------------------------------------------------------------------------
// 4) About Teaser — doc home/aboutTeaser
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_TEASER = {
  eyebrow: "WHY DAILYHNT",
  headline: "Independent journalism, engineered for clarity.",
  body:
    "We pair editorial rigor with data tooling so every story is fast to read and easy to trust.",
  points: [],
  cta: { label: "About us", href: "/about-us" },
};

const aboutTeaserDoc = createSingletonDocService(
  HOME_DOC_PATH("aboutTeaser"),
  DEFAULT_ABOUT_TEASER,
);

export const subscribeAboutTeaser = aboutTeaserDoc.subscribe;

export function saveAboutTeaser(payload) {
  return aboutTeaserDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    body: cleanText(payload.body),
    points: toLines(payload.points),
    cta: toCta(payload.cta),
  });
}

// ---------------------------------------------------------------------------
// 5) Why Choose Us — doc home/whyChooseUs + collection homeWhyReasons
// ---------------------------------------------------------------------------
export const DEFAULT_WHY_CHOOSE_US = {
  eyebrow: "THE DIFFERENCE",
  headline: "Why readers choose DailyHNT",
  image: "",
  imagePath: "",
};

const whyChooseUsDoc = createSingletonDocService(
  HOME_DOC_PATH("whyChooseUs"),
  DEFAULT_WHY_CHOOSE_US,
);

export const subscribeWhyChooseUs = whyChooseUsDoc.subscribe;

export function saveWhyChooseUs(payload) {
  return whyChooseUsDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    image: cleanText(payload.image),
    imagePath: cleanText(payload.imagePath),
  });
}

const whyUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/home/why` });
export const uploadWhyImage = whyUploader.upload;
export const deleteWhyImage = whyUploader.remove;

function normalizeWhyReason(payload) {
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const whyReasonsCollection = createCollectionCrudService(COLLECTION_PATH("homeWhyReasons"), {
  normalize: normalizeWhyReason,
  orderByField: "order",
});

export const subscribeWhyReasonItems = whyReasonsCollection.subscribe;
export const createWhyReason = whyReasonsCollection.create;
export const updateWhyReason = whyReasonsCollection.update;
export const deleteWhyReason = whyReasonsCollection.remove;
export const toggleWhyReasonStatus = whyReasonsCollection.toggleActive;

// ---------------------------------------------------------------------------
// 6) CTA — doc home/cta
// ---------------------------------------------------------------------------
export const DEFAULT_CTA = {
  eyebrow: "READY WHEN YOU ARE",
  headline: "Get the stories that matter, first.",
  body: "Join thousands of readers who start their day with DailyHNT.",
  primaryCta: { label: "Get Started", href: "/contact-us" },
  secondaryCta: { label: "See Services", href: "/services" },
};

const ctaDoc = createSingletonDocService(HOME_DOC_PATH("cta"), DEFAULT_CTA);

export const subscribeCta = ctaDoc.subscribe;

export function saveCta(payload) {
  return ctaDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    body: cleanText(payload.body),
    primaryCta: toCta(payload.primaryCta),
    secondaryCta: toCta(payload.secondaryCta),
  });
}

// ---------------------------------------------------------------------------
// 7) Newsletter — doc home/newsletter
// ---------------------------------------------------------------------------
export const DEFAULT_NEWSLETTER = {
  eyebrow: "STAY IN THE LOOP",
  headline: "One email. Everything worth knowing.",
  body: "A concise briefing delivered every morning — no spam, unsubscribe anytime.",
  placeholder: "Enter your email",
  cta: "Subscribe",
};

const newsletterDoc = createSingletonDocService(HOME_DOC_PATH("newsletter"), DEFAULT_NEWSLETTER);

export const subscribeNewsletter = newsletterDoc.subscribe;

export function saveNewsletter(payload) {
  return newsletterDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    body: cleanText(payload.body),
    placeholder: cleanText(payload.placeholder),
    cta: cleanText(payload.cta),
  });
}
