import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Snapagee — Home module data layer.
 *
 * Cloned from `src/projects/thestylelife/modules/home/service/home.service.js`
 * and adapted to Snapagee's `data/home.json` shape (see
 * `src/projects/snapagee/CONTRACT.md` — field names are authoritative).
 *
 * Firestore layout (all under `projects/snapagee/...`):
 *   home/hero              singleton (NO image, NO hrefs — buttons link to
 *                          hardcoded /contact, /services on the frontend)
 *                          + collection homeHeroStats (the 4 stats under the
 *                          hero copy — independent from homeStats below)
 *   home/trustedLogos      singleton (heading only) + collection
 *                          homeTrustedLogos (real logo images `{src,alt}`,
 *                          not brand-name text)
 *   homeStats              collection only — no singleton doc for this
 *                          section (standalone Stats section, independent
 *                          from homeHeroStats)
 *   home/about             singleton (no image on Snapagee) + collection
 *                          homeAboutPoints
 *   home/whyChooseUs       singleton + collection homeWhyReasons (each
 *                          reason carries `imageUrl`, NOT `image` — kept
 *                          exactly as the frontend component expects)
 *   home/servicesIntro     singleton (ServicesGrid heading)
 *   home/teamPreview       singleton ("Meet everyone")
 *   home/testimonialsIntro singleton (no CTA)
 *   home/contactCta        singleton (no eyebrow field on Snapagee)
 *
 * Snapagee has no FAQ intro / latest-blogs doc on the home page (neither
 * section renders there), and `home.json`'s top-level `newsletter` field is
 * dead data — both intentionally out of scope, per CONTRACT.md.
 *
 * Singleton DEFAULTS are prefilled with the site's current JSON content
 * (`data/home.json`) so the admin shows real copy on first load; saving
 * writes it to Firestore. Collections start empty — the frontend's JSON
 * fallback still supplies content for those until the admin adds rows.
 */

const PROJECT_ID = "snapagee";
const HOME_DOC_PATH = (key) => ["projects", PROJECT_ID, "home", key];
const COLLECTION_PATH = (name) => ["projects", PROJECT_ID, name];

const cleanText = (value = "") => String(value ?? "").trim();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// ---------------------------------------------------------------------------
// 1) Hero — doc home/hero + collection homeHeroStats
// ---------------------------------------------------------------------------
export const DEFAULT_HERO = {
  badge: "Currently accepting 3 new projects",
  headline: "RESULTS SNAP INTO FOCUS",
  subcopy:
    "Snapagee is a digital marketing and product studio for brands that move fast. We design, build, and grow — websites, apps, and campaigns that ship in weeks and perform for years.",
  primaryCtaLabel: "Book a Call",
  secondaryCtaLabel: "See Our Work",
};

const heroDoc = createSingletonDocService(HOME_DOC_PATH("hero"), DEFAULT_HERO);

export const subscribeHero = heroDoc.subscribe;

export function saveHero(payload) {
  return heroDoc.save({
    badge: cleanText(payload.badge),
    headline: cleanText(payload.headline),
    subcopy: cleanText(payload.subcopy),
    primaryCtaLabel: cleanText(payload.primaryCtaLabel),
    secondaryCtaLabel: cleanText(payload.secondaryCtaLabel),
  });
}

function normalizeHeroStat(payload) {
  return {
    label: cleanText(payload.label),
    value: toNumber(payload.value),
    suffix: cleanText(payload.suffix),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const heroStatsCollection = createCollectionCrudService(COLLECTION_PATH("homeHeroStats"), {
  normalize: normalizeHeroStat,
  orderByField: "order",
});

export const subscribeHeroStatItems = heroStatsCollection.subscribe;
export const createHeroStat = heroStatsCollection.create;
export const updateHeroStat = heroStatsCollection.update;
export const deleteHeroStat = heroStatsCollection.remove;
export const toggleHeroStatStatus = heroStatsCollection.toggleActive;

// ---------------------------------------------------------------------------
// 2) Trusted Logos — doc home/trustedLogos + collection homeTrustedLogos
// ---------------------------------------------------------------------------
export const DEFAULT_TRUSTED_LOGOS = {
  heading: "Trusted by teams that ship fast",
};

const trustedLogosDoc = createSingletonDocService(
  HOME_DOC_PATH("trustedLogos"),
  DEFAULT_TRUSTED_LOGOS,
);

export const subscribeTrustedLogos = trustedLogosDoc.subscribe;

export function saveTrustedLogos(payload) {
  return trustedLogosDoc.save({ heading: cleanText(payload.heading) });
}

function normalizeTrustedLogo(payload) {
  return {
    src: cleanText(payload.src),
    alt: cleanText(payload.alt),
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

const trustedLogoImageUploader = createImageUploader({ pathPrefix: "snapagee/home/trusted-logo" });
export const uploadTrustedLogoImage = trustedLogoImageUploader.upload;

// ---------------------------------------------------------------------------
// 3) Stats — collection homeStats (standalone, independent from homeHeroStats)
// ---------------------------------------------------------------------------
function normalizeStat(payload) {
  return {
    label: cleanText(payload.label),
    value: toNumber(payload.value),
    suffix: cleanText(payload.suffix),
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
// 4) About — doc home/about + collection homeAboutPoints
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT = {
  eyebrow: "Who We Are",
  heading: "An agency built for teams that don't wait around",
  body:
    "Snapagee was founded on a simple frustration: agencies take too long to ship work that should take weeks, not quarters. We built a studio around senior talent, tight feedback loops, and a bias for shipping — so the strategy in the deck actually becomes the product in market, fast.",
};

const aboutDoc = createSingletonDocService(HOME_DOC_PATH("about"), DEFAULT_ABOUT);

export const subscribeAbout = aboutDoc.subscribe;

export function saveAbout(payload) {
  return aboutDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
  });
}

function normalizeAboutPoint(payload) {
  return {
    text: cleanText(payload.text),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const aboutPointsCollection = createCollectionCrudService(COLLECTION_PATH("homeAboutPoints"), {
  normalize: normalizeAboutPoint,
  orderByField: "order",
});

export const subscribeAboutPointItems = aboutPointsCollection.subscribe;
export const createAboutPoint = aboutPointsCollection.create;
export const updateAboutPoint = aboutPointsCollection.update;
export const deleteAboutPoint = aboutPointsCollection.remove;
export const toggleAboutPointStatus = aboutPointsCollection.toggleActive;

// ---------------------------------------------------------------------------
// 5) Why Choose Us — doc home/whyChooseUs + collection homeWhyReasons
// ---------------------------------------------------------------------------
export const DEFAULT_WHY_CHOOSE_US = {
  eyebrow: "Why Snapagee",
  heading: "Built for teams who don't want to wait",
  description:
    "We turned the typical agency model inside out — smaller teams, faster cycles, and a bias toward shipping over meetings about shipping.",
};

const whyChooseUsDoc = createSingletonDocService(
  HOME_DOC_PATH("whyChooseUs"),
  DEFAULT_WHY_CHOOSE_US,
);

export const subscribeWhyChooseUs = whyChooseUsDoc.subscribe;

export function saveWhyChooseUs(payload) {
  return whyChooseUsDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    description: cleanText(payload.description),
  });
}

function normalizeWhyReason(payload) {
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    imageUrl: cleanText(payload.imageUrl),
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

const whyReasonImageUploader = createImageUploader({ pathPrefix: "snapagee/home/why-reason" });
export const uploadWhyReasonImage = whyReasonImageUploader.upload;

// ---------------------------------------------------------------------------
// 6) Services intro — doc home/servicesIntro (ServicesGrid heading)
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES_INTRO = {
  eyebrow: "What We Do",
  heading: "Eight disciplines. One senior team.",
  description:
    "From first pixel to production deploy, every discipline you need to launch and grow lives under one roof — no handoffs, no dilution.",
};

const servicesIntroDoc = createSingletonDocService(
  HOME_DOC_PATH("servicesIntro"),
  DEFAULT_SERVICES_INTRO,
);

export const subscribeServicesIntro = servicesIntroDoc.subscribe;

export function saveServicesIntro(payload) {
  return servicesIntroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    description: cleanText(payload.description),
  });
}

// ---------------------------------------------------------------------------
// 7) Team preview — doc home/teamPreview
// ---------------------------------------------------------------------------
export const DEFAULT_TEAM_PREVIEW = {
  eyebrow: "The Team",
  heading: "Senior operators, not a rotating cast",
  description: "The people who scope your project are the same people who ship it.",
  ctaLabel: "Meet everyone",
};

const teamPreviewDoc = createSingletonDocService(
  HOME_DOC_PATH("teamPreview"),
  DEFAULT_TEAM_PREVIEW,
);

export const subscribeTeamPreview = teamPreviewDoc.subscribe;

export function saveTeamPreview(payload) {
  return teamPreviewDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    description: cleanText(payload.description),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}

// ---------------------------------------------------------------------------
// 8) Testimonials intro — doc home/testimonialsIntro (no CTA)
// ---------------------------------------------------------------------------
export const DEFAULT_TESTIMONIALS_INTRO = {
  eyebrow: "Client Results",
  heading: "What it's like to work with us",
  description:
    "No cherry-picked metrics — these are the same numbers our clients see in their own dashboards.",
};

const testimonialsIntroDoc = createSingletonDocService(
  HOME_DOC_PATH("testimonialsIntro"),
  DEFAULT_TESTIMONIALS_INTRO,
);

export const subscribeTestimonialsIntro = testimonialsIntroDoc.subscribe;

export function saveTestimonialsIntro(payload) {
  return testimonialsIntroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    description: cleanText(payload.description),
  });
}

// ---------------------------------------------------------------------------
// 9) Contact CTA — doc home/contactCta (no eyebrow field on Snapagee)
// ---------------------------------------------------------------------------
export const DEFAULT_CONTACT_CTA = {
  heading: "Have a project in mind?",
  subheading: "Tell us what you're building. We'll reply within one business day with real next steps.",
  buttonLabel: "Start a Project",
};

const contactCtaDoc = createSingletonDocService(
  HOME_DOC_PATH("contactCta"),
  DEFAULT_CONTACT_CTA,
);

export const subscribeContactCta = contactCtaDoc.subscribe;

export function saveContactCta(payload) {
  return contactCtaDoc.save({
    heading: cleanText(payload.heading),
    subheading: cleanText(payload.subheading),
    buttonLabel: cleanText(payload.buttonLabel),
  });
}
