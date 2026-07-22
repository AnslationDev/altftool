import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * OfferHoppr — Home module data layer.
 *
 * The home page is a single admin page composed of several sections. Each
 * section is either a singleton settings document (`home/<key>`) or a
 * settings document paired with an ordered collection (`home<Collection>`).
 * Field names mirror offerhopper's `data/home.json` shape exactly — when the
 * admin leaves a value empty, the frontend JSON fallback wins.
 *
 * Firestore layout (all under `projects/offerhoppr/...`):
 *   home/hero          singleton
 *   home/trustedLogos   singleton (label only) + collection homeTrustedLogos
 *   home/stats -> —     collection homeStats
 *   home/about          singleton
 *   home/whyChooseUs    singleton  + collection homeWhyReasons
 *   home/newsletter     singleton
 *   home/contactCta     singleton
 */

const PROJECT_ID = "offerhoppr";
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

/** Repeatable-text-input array (string[] or newline-joined string) -> trimmed, de-blanked string[] */
const toStringList = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanText(entry)).filter(Boolean);
  }
  return cleanText(value)
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

// ---------------------------------------------------------------------------
// 1) Hero — doc home/hero
// ---------------------------------------------------------------------------
export const DEFAULT_HERO = {
  eyebrow: "Performance Marketing With A Pulse",
  headline: "Marketing That Feels Like A Party, Performs Like A Machine",
  subcopy:
    "OfferHoppr is the pop-art marketing agency for brands who refuse to be boring. Bold creative, relentless optimization, and campaigns that turn browsers into buyers.",
  stickers: ["+63% avg. conversion lift", "210% organic growth", "3.1x return on ad spend"],
  ctaPrimary: "Grab the Deal",
  ctaSecondary: "See Our Work",
};

const heroDoc = createSingletonDocService(HOME_DOC_PATH("hero"), DEFAULT_HERO);

export const subscribeHero = heroDoc.subscribe;

export function saveHero(payload) {
  return heroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    subcopy: cleanText(payload.subcopy),
    stickers: toStringList(payload.stickers),
    ctaPrimary: cleanText(payload.ctaPrimary),
    ctaSecondary: cleanText(payload.ctaSecondary),
  });
}

// ---------------------------------------------------------------------------
// 2) Trusted Logos — doc home/trustedLogos (optional) + collection homeTrustedLogos
// ---------------------------------------------------------------------------
export const DEFAULT_TRUSTED_LOGOS = {};

const trustedLogosDoc = createSingletonDocService(
  HOME_DOC_PATH("trustedLogos"),
  DEFAULT_TRUSTED_LOGOS,
);

export const subscribeTrustedLogos = trustedLogosDoc.subscribe;

export function saveTrustedLogos(payload) {
  return trustedLogosDoc.save({});
}

function normalizeTrustedLogo(payload) {
  return {
    name: cleanText(payload.name),
    logo: cleanText(payload.logo),
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

// ---------------------------------------------------------------------------
// 3) Stats — collection homeStats
// ---------------------------------------------------------------------------
function normalizeStat(payload) {
  return {
    value: toNumber(payload.value),
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
// 4) About — doc home/about
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT = {
  eyebrow: "Who We Are",
  headline: "We're The Agency That Actually Enjoys This Stuff",
  body:
    "Founded in 2018, OfferHoppr grew out of one simple frustration: marketing didn't have to be boring to be effective. We built an agency where bold creative and hard performance data live in the same room, run by people who genuinely love the work. No jargon-stuffed decks, no vanity metrics — just campaigns engineered to hop your brand straight to the front of the line.",
  highlights: ["Full-funnel in-house team", "Data-obsessed creative process", "Real humans, zero outsourcing"],
};

const aboutDoc = createSingletonDocService(HOME_DOC_PATH("about"), DEFAULT_ABOUT);

export const subscribeAbout = aboutDoc.subscribe;

export function saveAbout(payload) {
  return aboutDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    body: cleanText(payload.body),
    highlights: toStringList(payload.highlights),
  });
}

// ---------------------------------------------------------------------------
// 5) Why Choose Us — doc home/whyChooseUs + collection homeWhyReasons
// ---------------------------------------------------------------------------
export const DEFAULT_WHY_CHOOSE_US = {
  eyebrow: "Why OfferHoppr",
  headline: "Because 'Fine' Marketing Isn't Worth Your Budget",
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
  });
}

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
// 6) Newsletter — doc home/newsletter
// ---------------------------------------------------------------------------
export const DEFAULT_NEWSLETTER = {
  headline: "Get Our Best Marketing Moves, Monthly",
  subcopy:
    "No spam, no fluff — just the strategies actually moving the needle for our clients, straight to your inbox once a month.",
};

const newsletterDoc = createSingletonDocService(HOME_DOC_PATH("newsletter"), DEFAULT_NEWSLETTER);

export const subscribeNewsletter = newsletterDoc.subscribe;

export function saveNewsletter(payload) {
  return newsletterDoc.save({
    headline: cleanText(payload.headline),
    subcopy: cleanText(payload.subcopy),
  });
}

// ---------------------------------------------------------------------------
// 7) Contact CTA — doc home/contactCta
// ---------------------------------------------------------------------------
export const DEFAULT_CONTACT_CTA = {
  headline: "Ready To Make Your Marketing Fun Again?",
  subcopy: "Let's talk about what's holding your growth back, and how fast we can fix it.",
  buttonLabel: "Grab the Deal",
};

const contactCtaDoc = createSingletonDocService(HOME_DOC_PATH("contactCta"), DEFAULT_CONTACT_CTA);

export const subscribeContactCta = contactCtaDoc.subscribe;

export function saveContactCta(payload) {
  return contactCtaDoc.save({
    headline: cleanText(payload.headline),
    subcopy: cleanText(payload.subcopy),
    buttonLabel: cleanText(payload.buttonLabel),
  });
}
