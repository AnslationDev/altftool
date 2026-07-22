import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Dealnbook — Home module data layer.
 *
 * The home page is a single admin page composed of 12 sections (per
 * CONTRACT.md). Each section is either a singleton settings document
 * (`home/<key>`) or a settings document paired with an ordered collection.
 * Field names mirror the Dealnbook frontend's `data/home.json` shape exactly
 * — when the admin leaves a value empty, the frontend JSON fallback wins.
 *
 * Firestore layout (all under `projects/dealnbook/...`):
 *   home/hero              singleton + collection homeVisualCards
 *   home/trustedLogos      singleton (label only) + collection homeTrustedLogos
 *   —                      collection homeStats (no settings doc)
 *   home/about             singleton + collection homeAboutPoints
 *   home/servicesIntro     singleton
 *   home/whyChooseUs       singleton + collection homeWhyItems
 *   home/teamPreview       singleton
 *   home/testimonialsIntro singleton
 *   home/faqIntro          singleton
 *   home/blogIntro         singleton
 *   home/newsletter        singleton
 *   home/contactCta        singleton
 */

const PROJECT_ID = "dealnbook";
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
// 1) Hero — doc home/hero + collection homeVisualCards
// ---------------------------------------------------------------------------
export const DEFAULT_HERO = {
  eyebrow: "Book Smarter, Save More",
  headlineLines: ["Every deal,", "one place."],
  supportCopy:
    "Dealnbook curates and verifies the best offers, coupons, and bookings across your favorite brands so you never overpay again.",
  primaryCtaLabel: "Browse Deals",
  primaryCtaHref: "/services",
  secondaryCtaLabel: "How It Works",
  secondaryCtaHref: "/about",
  statValue: "10k+",
  statSuffix: "",
  statLabel: "Deals booked",
};

const heroDoc = createSingletonDocService(HOME_DOC_PATH("hero"), DEFAULT_HERO);

export const subscribeHero = heroDoc.subscribe;

export function saveHero(payload) {
  return heroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headlineLines: toStringList(payload.headlineLines),
    supportCopy: cleanText(payload.supportCopy),
    primaryCtaLabel: cleanText(payload.primaryCtaLabel),
    primaryCtaHref: cleanText(payload.primaryCtaHref),
    secondaryCtaLabel: cleanText(payload.secondaryCtaLabel),
    secondaryCtaHref: cleanText(payload.secondaryCtaHref),
    statValue: cleanText(payload.statValue),
    statSuffix: cleanText(payload.statSuffix),
    statLabel: cleanText(payload.statLabel),
  });
}

function normalizeVisualCard(payload) {
  return {
    image: cleanText(payload.image),
    alt: cleanText(payload.alt),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const visualCardsCollection = createCollectionCrudService(COLLECTION_PATH("homeVisualCards"), {
  normalize: normalizeVisualCard,
  orderByField: "order",
});

export const subscribeVisualCardItems = visualCardsCollection.subscribe;
export const createVisualCard = visualCardsCollection.create;
export const updateVisualCard = visualCardsCollection.update;
export const deleteVisualCard = visualCardsCollection.remove;
export const toggleVisualCardStatus = visualCardsCollection.toggleActive;

// ---------------------------------------------------------------------------
// 2) Trusted Logos — doc home/trustedLogos (label only) + collection homeTrustedLogos
// ---------------------------------------------------------------------------
export const DEFAULT_TRUSTED_LOGOS = {
  label: "Trusted by shoppers everywhere",
};

const trustedLogosDoc = createSingletonDocService(
  HOME_DOC_PATH("trustedLogos"),
  DEFAULT_TRUSTED_LOGOS,
);

export const subscribeTrustedLogos = trustedLogosDoc.subscribe;

export function saveTrustedLogos(payload) {
  return trustedLogosDoc.save({ label: cleanText(payload.label) });
}

/** Plain text brand names — no logo images, matches current data/home.json. */
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
// 4) About — doc home/about + collection homeAboutPoints
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT = {
  eyebrow: "Who We Are",
  heading: "We built Dealnbook because deal-hunting shouldn't be a chore.",
  headingHighlight: "shouldn't be a chore",
  body:
    "Our team verifies every offer before it goes live, so you can book with confidence instead of hoping a code still works.",
  imageSrc: "",
  imageAlt: "Dealnbook team at work",
  ctaLabel: "Learn Our Story",
  ctaHref: "/about",
};

const aboutDoc = createSingletonDocService(HOME_DOC_PATH("about"), DEFAULT_ABOUT);

export const subscribeAbout = aboutDoc.subscribe;

export function saveAbout(payload) {
  return aboutDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    headingHighlight: cleanText(payload.headingHighlight),
    body: cleanText(payload.body),
    imageSrc: cleanText(payload.imageSrc),
    imageAlt: cleanText(payload.imageAlt),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}

function normalizeAboutPoint(payload) {
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    icon: cleanText(payload.icon),
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
// 5) Services Intro — doc home/servicesIntro
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES_INTRO = {
  eyebrow: "What We Offer",
  heading: "Services built around finding you the best deal.",
  body: "From curated coupon drops to hands-on booking support, here's how Dealnbook helps you save.",
};

const servicesIntroDoc = createSingletonDocService(HOME_DOC_PATH("servicesIntro"), DEFAULT_SERVICES_INTRO);

export const subscribeServicesIntro = servicesIntroDoc.subscribe;

export function saveServicesIntro(payload) {
  return servicesIntroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
  });
}

// ---------------------------------------------------------------------------
// 6) Why Choose Us — doc home/whyChooseUs + collection homeWhyItems
// ---------------------------------------------------------------------------
export const DEFAULT_WHY_CHOOSE_US = {
  eyebrow: "Why Dealnbook",
  heading: "Because 'good enough' deals aren't good enough.",
  body: "We hand-verify every offer, so what you see is what you get at checkout.",
  hint: "No dead codes, no bait-and-switch pricing.",
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
    body: cleanText(payload.body),
    hint: cleanText(payload.hint),
  });
}

function normalizeWhyItem(payload) {
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    icon: cleanText(payload.icon),
    tag: cleanText(payload.tag),
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
// 7) Team Preview — doc home/teamPreview
// ---------------------------------------------------------------------------
export const DEFAULT_TEAM_PREVIEW = {
  eyebrow: "Meet The Team",
  heading: "The people behind every verified deal.",
  body: "A small, focused team that tests offers by hand before they ever reach the site.",
  ctaLabel: "Meet the Team",
  ctaHref: "/team",
};

const teamPreviewDoc = createSingletonDocService(HOME_DOC_PATH("teamPreview"), DEFAULT_TEAM_PREVIEW);

export const subscribeTeamPreview = teamPreviewDoc.subscribe;

export function saveTeamPreview(payload) {
  return teamPreviewDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}

// ---------------------------------------------------------------------------
// 8) Testimonials Intro — doc home/testimonialsIntro
// ---------------------------------------------------------------------------
export const DEFAULT_TESTIMONIALS_INTRO = {
  eyebrow: "Kind Words",
  heading: "Don't just take our word for it.",
};

const testimonialsIntroDoc = createSingletonDocService(HOME_DOC_PATH("testimonialsIntro"), DEFAULT_TESTIMONIALS_INTRO);

export const subscribeTestimonialsIntro = testimonialsIntroDoc.subscribe;

export function saveTestimonialsIntro(payload) {
  return testimonialsIntroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
  });
}

// ---------------------------------------------------------------------------
// 9) FAQ Intro — doc home/faqIntro
// ---------------------------------------------------------------------------
export const DEFAULT_FAQ_INTRO = {
  eyebrow: "Questions, Answered",
  heading: "Everything you're probably wondering.",
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
// 10) Blog Intro — doc home/blogIntro
// ---------------------------------------------------------------------------
export const DEFAULT_BLOG_INTRO = {
  eyebrow: "From The Blog",
  heading: "Deal-hunting tips and savings guides.",
  ctaLabel: "Read the Blog",
  ctaHref: "/blog",
};

const blogIntroDoc = createSingletonDocService(HOME_DOC_PATH("blogIntro"), DEFAULT_BLOG_INTRO);

export const subscribeBlogIntro = blogIntroDoc.subscribe;

export function saveBlogIntro(payload) {
  return blogIntroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}

// ---------------------------------------------------------------------------
// 11) Newsletter — doc home/newsletter
// ---------------------------------------------------------------------------
export const DEFAULT_NEWSLETTER = {
  eyebrow: "Stay In The Loop",
  heading: "Get our best deals, weekly.",
  body: "No spam, no fluff — just the offers worth your attention, straight to your inbox.",
  placeholder: "Enter your email",
  ctaLabel: "Subscribe",
};

const newsletterDoc = createSingletonDocService(HOME_DOC_PATH("newsletter"), DEFAULT_NEWSLETTER);

export const subscribeNewsletter = newsletterDoc.subscribe;

export function saveNewsletter(payload) {
  return newsletterDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
    placeholder: cleanText(payload.placeholder),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}

// ---------------------------------------------------------------------------
// 12) Contact CTA — doc home/contactCta
// ---------------------------------------------------------------------------
export const DEFAULT_CONTACT_CTA = {
  eyebrow: "Ready When You Are",
  heading: "Have a question about a deal?",
  body: "Reach out and our team will get back to you within one business day.",
  ctaLabel: "Contact Us",
  ctaHref: "/contact",
};

const contactCtaDoc = createSingletonDocService(HOME_DOC_PATH("contactCta"), DEFAULT_CONTACT_CTA);

export const subscribeContactCta = contactCtaDoc.subscribe;

export function saveContactCta(payload) {
  return contactCtaDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}
