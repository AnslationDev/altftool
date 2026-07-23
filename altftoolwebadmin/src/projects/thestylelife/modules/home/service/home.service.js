import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * TheStyleLife — Home module data layer.
 *
 * Cloned from `src/projects/shophobia/modules/home/service/home.service.js`
 * and adapted to TheStyleLife's `data/home.json` shape (see
 * `src/projects/thestylelife/CONTRACT.md` — field names are authoritative).
 *
 * Firestore layout (all under `projects/thestylelife/...`):
 *   home/hero              singleton (NO glitch word, NO scroll label) + image
 *   home/trustedLogos      singleton (heading only) + collection homeTrustedLogos
 *                          (plain brand-name text, no logo image)
 *   homeStats              collection only — no singleton doc for this section
 *   home/about             singleton (incl. image) + collection homeAboutPoints
 *   home/whyChooseUs       singleton + collection homeWhyReasons (each reason
 *                          carries an illustration image)
 *   home/servicesIntro     singleton (ServicesGrid heading + "View All Services")
 *   home/teamPreview       singleton ("Meet the Full Team")
 *   home/testimonialsIntro singleton (no CTA)
 *   home/faqIntro          singleton (no CTA)
 *   home/latestBlogs       singleton ("Read the Blog")
 *   home/newsletter        singleton (cta is a plain button label, not a link)
 *   home/contactCta        singleton
 *
 * Singleton DEFAULTS are prefilled with the site's current JSON content
 * (`data/home.json`) so the admin shows real copy on first load; saving
 * writes it to Firestore. Collections start empty — the frontend's JSON
 * fallback still supplies content for those until the admin adds rows.
 */

const PROJECT_ID = "thestylelife";
const HOME_DOC_PATH = (key) => ["projects", PROJECT_ID, "home", key];
const COLLECTION_PATH = (name) => ["projects", PROJECT_ID, name];

const cleanText = (value = "") => String(value ?? "").trim();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// ---------------------------------------------------------------------------
// 1) Hero — doc home/hero
// ---------------------------------------------------------------------------
export const DEFAULT_HERO = {
  eyebrow: "Digital Agency — Est. 2016",
  headline: "We design brands the way stylists design a look.",
  subcopy:
    "Sharp, considered, unforgettable. TheStyleLife builds websites, apps, and campaigns with an editorial eye and an engineer's discipline — for brands that refuse to blend in.",
  primaryCtaLabel: "Start Your Story",
  primaryCtaHref: "/contact",
  secondaryCtaLabel: "See Our Work",
  secondaryCtaHref: "/services",
  image: "https://preply.com/wp-content/uploads/2023/12/How-to-conduct-a-business-meeting.jpg",
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
    image: cleanText(payload.image),
  });
}

const heroImageUploader = createImageUploader({ pathPrefix: "thestylelife/home/hero" });
export const uploadHeroImage = heroImageUploader.upload;

// ---------------------------------------------------------------------------
// 2) Trusted Logos — doc home/trustedLogos + collection homeTrustedLogos
// ---------------------------------------------------------------------------
export const DEFAULT_TRUSTED_LOGOS = {
  heading: "Styled brands trust us with their story",
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
// 3) Stats — collection homeStats (standalone, no singleton doc)
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
  eyebrow: "The Studio",
  image: "https://static.toiimg.com/thumb/msid-107762883,width-400,resizemode-4/107762883.jpg",
  headline: "Part design studio. Part newsroom. All discipline.",
  body:
    "TheStyleLife was founded on a simple idea borrowed from magazine publishing: nothing ships until it's been edited down to its sharpest form. We're strategists, designers, writers, and engineers working in the same room, building brands with the same rigor a great editor brings to a cover story.",
  ctaLabel: "More About Us",
  ctaHref: "/about",
};

const aboutDoc = createSingletonDocService(HOME_DOC_PATH("about"), DEFAULT_ABOUT);

export const subscribeAbout = aboutDoc.subscribe;

export function saveAbout(payload) {
  return aboutDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    image: cleanText(payload.image),
    headline: cleanText(payload.headline),
    body: cleanText(payload.body),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}

const aboutImageUploader = createImageUploader({ pathPrefix: "thestylelife/home/about" });
export const uploadAboutImage = aboutImageUploader.upload;

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
  eyebrow: "Why TheStyleLife",
  headline: "Craft and performance, in the same sentence.",
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
    image: cleanText(payload.image),
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

const whyReasonImageUploader = createImageUploader({ pathPrefix: "thestylelife/home/why-reason" });
export const uploadWhyReasonImage = whyReasonImageUploader.upload;

// ---------------------------------------------------------------------------
// 6) Services intro — doc home/servicesIntro (ServicesGrid heading)
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES_INTRO = {
  eyebrow: "What We Do",
  heading: "Eight disciplines. One point of view.",
  description:
    "Every service is developed by the same team, in the same room — so strategy, design, and code never lose the thread between them.",
  ctaLabel: "View All Services",
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
    ctaLabel: cleanText(payload.ctaLabel),
  });
}

// ---------------------------------------------------------------------------
// 7) Team preview — doc home/teamPreview
// ---------------------------------------------------------------------------
export const DEFAULT_TEAM_PREVIEW = {
  eyebrow: "The People",
  heading: "The editors behind the work.",
  description:
    "A studio of strategists, designers, and engineers who all still get their hands dirty on every project.",
  ctaLabel: "Meet the Full Team",
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
  eyebrow: "Client Notes",
  heading: "Read reviews, not just numbers.",
  description: "A few lines from the brands who trusted us with their next chapter.",
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
// 9) FAQ intro — doc home/faqIntro (no CTA)
// ---------------------------------------------------------------------------
export const DEFAULT_FAQ_INTRO = {
  eyebrow: "Questions",
  heading: "Everything you were about to ask.",
  description: "If something's still unclear, that's what the contact page is for.",
};

const faqIntroDoc = createSingletonDocService(HOME_DOC_PATH("faqIntro"), DEFAULT_FAQ_INTRO);

export const subscribeFaqIntro = faqIntroDoc.subscribe;

export function saveFaqIntro(payload) {
  return faqIntroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    description: cleanText(payload.description),
  });
}

// ---------------------------------------------------------------------------
// 10) Latest blogs intro — doc home/latestBlogs
// ---------------------------------------------------------------------------
export const DEFAULT_LATEST_BLOGS = {
  eyebrow: "The Edit",
  heading: "Notes from the studio.",
  description:
    "Thinking on brand, motion, and growth — published whenever we have something worth saying.",
  ctaLabel: "Read the Blog",
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
    description: cleanText(payload.description),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}

// ---------------------------------------------------------------------------
// 11) Newsletter — doc home/newsletter (cta is a plain button label)
// ---------------------------------------------------------------------------
export const DEFAULT_NEWSLETTER = {
  eyebrow: "The Edit",
  headline: "A monthly dispatch on brand, design, and growth.",
  body: "No spam, no filler — just the sharpest thinking from our studio, once a month.",
  ctaLabel: "Subscribe",
};

const newsletterDoc = createSingletonDocService(
  HOME_DOC_PATH("newsletter"),
  DEFAULT_NEWSLETTER,
);

export const subscribeNewsletter = newsletterDoc.subscribe;

export function saveNewsletter(payload) {
  return newsletterDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    body: cleanText(payload.body),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}

// ---------------------------------------------------------------------------
// 12) Contact CTA — doc home/contactCta
// ---------------------------------------------------------------------------
export const DEFAULT_CONTACT_CTA = {
  eyebrow: "Let's Talk",
  headline: "Ready to build something worth looking at twice?",
  body: "Tell us about your brand. We'll tell you how we'd style it.",
  ctaLabel: "Start a Conversation",
  ctaHref: "/contact",
};

const contactCtaDoc = createSingletonDocService(
  HOME_DOC_PATH("contactCta"),
  DEFAULT_CONTACT_CTA,
);

export const subscribeContactCta = contactCtaDoc.subscribe;

export function saveContactCta(payload) {
  return contactCtaDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    body: cleanText(payload.body),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}
