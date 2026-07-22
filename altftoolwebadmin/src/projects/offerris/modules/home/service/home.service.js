import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Offerris — Home module data layer.
 *
 * Cloned from `src/projects/exclusinsider/modules/home/service/home.service.js`
 * and adapted to Offerris's `data/home.json` + `data/pages.json` shapes (see
 * `src/projects/offerris/CONTRACT.md` — field names are authoritative).
 *
 * Firestore layout (all under `projects/offerris/...`):
 *   home/hero              singleton (incl. stackItems[] + project card copy)
 *   home/trustedLogos      singleton + collection homeTrustedLogos (text marquee)
 *   collection homeStats   (no intro doc — home.json stats is a bare array)
 *   home/about             singleton + collection homeAboutHighlights
 *   home/whyChooseUs       singleton + collection homeWhyItems
 *   home/servicesIntro     singleton (ServicesGrid heading)
 *   home/teamPreview       singleton
 *   home/testimonialsIntro singleton
 *   home/faqIntro          singleton
 *   home/latestBlogs       singleton
 *   home/newsletter        singleton
 *   home/contactCta        singleton
 *
 * Singleton DEFAULTS are prefilled with the site's current JSON content so
 * the admin shows real copy on first load; saving writes it to Firestore.
 */

const PROJECT_ID = "offerris";
const HOME_DOC_PATH = (key) => ["projects", PROJECT_ID, "home", key];
const COLLECTION_PATH = (name) => ["projects", PROJECT_ID, name];

const cleanText = (value = "") => String(value ?? "").trim();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// 1) Hero — doc home/hero
// ---------------------------------------------------------------------------
export const DEFAULT_HERO = {
  eyebrow: "Digital Agency // Est. 2018",
  headline: "We build brands that move at full voltage.",
  subcopy:
    "Offeris fuses strategy, design, and engineering into one kinetic current — websites, apps, and campaigns engineered to convert attention into momentum.",
  primaryCtaLabel: "Start a Project",
  primaryCtaHref: "/contact",
  secondaryCtaLabel: "View Our Work",
  secondaryCtaHref: "/services",
  scrollLabel: "Scroll to explore",
  stackItems: ["STRATEGY", "DESIGN", "DEVELOPMENT", "MARKETING"],
  cardValue: "240+",
  cardLabel: "Projects Completed",
  cardSub: "Across 12+ Countries",
};

const heroDoc = createSingletonDocService(HOME_DOC_PATH("hero"), DEFAULT_HERO);

export const subscribeHero = heroDoc.subscribe;

export function saveHero(payload) {
  return heroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    subcopy: cleanText(payload.subcopy),
    primaryCtaLabel: cleanText(payload.primaryCtaLabel),
    primaryCtaHref: cleanText(payload.primaryCtaHref),
    secondaryCtaLabel: cleanText(payload.secondaryCtaLabel),
    secondaryCtaHref: cleanText(payload.secondaryCtaHref),
    scrollLabel: cleanText(payload.scrollLabel),
    stackItems: cleanLines(payload.stackItems),
    cardValue: cleanText(payload.cardValue),
    cardLabel: cleanText(payload.cardLabel),
    cardSub: cleanText(payload.cardSub),
  });
}

// ---------------------------------------------------------------------------
// 2) Trusted Logos — doc home/trustedLogos + collection homeTrustedLogos
// ---------------------------------------------------------------------------
export const DEFAULT_TRUSTED_LOGOS = {
  label: "Powering momentum for ambitious teams",
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
// 3) Stats — collection homeStats (bare array on the frontend)
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
// 4) About — doc home/about + collection homeAboutHighlights
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT = {
  eyebrow: "Who We Are",
  headline: "A studio built for brands that refuse to idle.",
  copy:
    "Offeris started as a two-person freelance shop chasing a simple idea: most agency work is slow, safe, and forgettable. We built the opposite — a full-stack team of strategists, designers, and engineers who ship fast without cutting corners. Every project runs through the same current: sharp positioning, kinetic design, and code that performs under pressure.",
  ctaLabel: "More About Us",
  ctaHref: "/about",
};

const aboutDoc = createSingletonDocService(HOME_DOC_PATH("about"), DEFAULT_ABOUT);

export const subscribeAbout = aboutDoc.subscribe;

export function saveAbout(payload) {
  return aboutDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    copy: cleanText(payload.copy),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}

function normalizeAboutHighlight(payload) {
  return {
    text: cleanText(payload.text),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const aboutHighlightsCollection = createCollectionCrudService(
  COLLECTION_PATH("homeAboutHighlights"),
  { normalize: normalizeAboutHighlight, orderByField: "order" },
);

export const subscribeAboutHighlightItems = aboutHighlightsCollection.subscribe;
export const createAboutHighlight = aboutHighlightsCollection.create;
export const updateAboutHighlight = aboutHighlightsCollection.update;
export const deleteAboutHighlight = aboutHighlightsCollection.remove;
export const toggleAboutHighlightStatus = aboutHighlightsCollection.toggleActive;

// ---------------------------------------------------------------------------
// 5) Why Choose Us — doc home/whyChooseUs + collection homeWhyItems
// ---------------------------------------------------------------------------
export const DEFAULT_WHY_CHOOSE_US = {
  eyebrow: "Why Offeris",
  headline: "Speed and craft aren't a trade-off here.",
  subcopy:
    "We built our entire operating model around shipping fast without the usual agency drag — bloated decks, endless approval chains, and diluted execution.",
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
    subcopy: cleanText(payload.subcopy),
  });
}

function normalizeWhyItem(payload) {
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const whyItemsCollection = createCollectionCrudService(COLLECTION_PATH("homeWhyItems"), {
  normalize: normalizeWhyItem,
  orderByField: "order",
});

export const subscribeWhyItemItems = whyItemsCollection.subscribe;
export const createWhyItem = whyItemsCollection.create;
export const updateWhyItem = whyItemsCollection.update;
export const deleteWhyItem = whyItemsCollection.remove;
export const toggleWhyItemStatus = whyItemsCollection.toggleActive;

// ---------------------------------------------------------------------------
// 6) Services intro — doc home/servicesIntro (ServicesGrid heading)
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES_INTRO = {
  eyebrow: "What We Do",
  heading: "Eight disciplines. One current.",
  subcopy:
    "Every service is built to work standalone or as part of a full-stack engagement — strategy, design, and engineering moving together.",
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
    subcopy: cleanText(payload.subcopy),
  });
}

// ---------------------------------------------------------------------------
// 7) Team preview — doc home/teamPreview
// ---------------------------------------------------------------------------
export const DEFAULT_TEAM_PREVIEW = {
  eyebrow: "The People",
  heading: "Senior talent. No hand-offs.",
  subcopy:
    "The strategists, designers, and engineers who show up on your kickoff call are the same ones shipping your project.",
  ctaLabel: "Meet the full team",
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
    subcopy: cleanText(payload.subcopy),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}

// ---------------------------------------------------------------------------
// 8) Testimonials intro — doc home/testimonialsIntro
// ---------------------------------------------------------------------------
export const DEFAULT_TESTIMONIALS_INTRO = {
  eyebrow: "Client Voices",
  heading: "Brands running at Offeris speed.",
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
  });
}

// ---------------------------------------------------------------------------
// 9) FAQ intro — doc home/faqIntro
// ---------------------------------------------------------------------------
export const DEFAULT_FAQ_INTRO = {
  eyebrow: "Questions",
  heading: "Everything you're wondering before you reach out.",
};

const faqIntroDoc = createSingletonDocService(HOME_DOC_PATH("faqIntro"), DEFAULT_FAQ_INTRO);

export const subscribeFaqIntro = faqIntroDoc.subscribe;

export function saveFaqIntro(payload) {
  return faqIntroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
  });
}

// ---------------------------------------------------------------------------
// 10) Latest blogs intro — doc home/latestBlogs
// ---------------------------------------------------------------------------
export const DEFAULT_LATEST_BLOGS = {
  eyebrow: "From the Journal",
  heading: "Field notes from inside the work.",
  subcopy:
    "Straight-shooting breakdowns of what we're seeing across web, growth, and product work.",
  ctaLabel: "Read the journal",
};

const latestBlogsDoc = createSingletonDocService(
  HOME_DOC_PATH("latestBlogs"),
  DEFAULT_LATEST_BLOGS,
);

export const subscribeLatestBlogs = latestBlogsDoc.subscribe;

export function saveLatestBlogs(payload) {
  return latestBlogsDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    subcopy: cleanText(payload.subcopy),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}

// ---------------------------------------------------------------------------
// 11) Newsletter — doc home/newsletter
// ---------------------------------------------------------------------------
export const DEFAULT_NEWSLETTER = {
  headline: "Get the Pulse.",
  subcopy: "One email a month. Growth tactics, design breakdowns, zero fluff.",
  placeholder: "you@company.com",
  cta: "Subscribe",
};

const newsletterDoc = createSingletonDocService(
  HOME_DOC_PATH("newsletter"),
  DEFAULT_NEWSLETTER,
);

export const subscribeNewsletter = newsletterDoc.subscribe;

export function saveNewsletter(payload) {
  return newsletterDoc.save({
    headline: cleanText(payload.headline),
    subcopy: cleanText(payload.subcopy),
    placeholder: cleanText(payload.placeholder),
    cta: cleanText(payload.cta),
  });
}

// ---------------------------------------------------------------------------
// 12) Contact CTA — doc home/contactCta
// ---------------------------------------------------------------------------
export const DEFAULT_CONTACT_CTA = {
  headline: "Got a brand that's ready to move?",
  subcopy: "Tell us where you're headed. We'll tell you how fast we can get you there.",
  ctaLabel: "Book a Strategy Call",
  ctaHref: "/contact",
};

const contactCtaDoc = createSingletonDocService(
  HOME_DOC_PATH("contactCta"),
  DEFAULT_CONTACT_CTA,
);

export const subscribeContactCta = contactCtaDoc.subscribe;

export function saveContactCta(payload) {
  return contactCtaDoc.save({
    headline: cleanText(payload.headline),
    subcopy: cleanText(payload.subcopy),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}
