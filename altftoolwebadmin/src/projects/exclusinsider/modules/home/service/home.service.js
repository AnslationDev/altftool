import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * ExclusInsider — Home module data layer.
 *
 * Cloned from `src/projects/dealnbook/modules/home/service/home.service.js`.
 * The home page is a single admin page composed of 11 sections (per
 * CONTRACT.md's "home" section). Each section is either a singleton settings
 * document (`home/<key>`) or a settings document paired with an ordered
 * collection. Field names mirror CONTRACT.md exactly — they are authoritative
 * and must not be renamed.
 *
 * Firestore layout (all under `projects/exclusinsider/...`):
 *   home/hero              singleton + collection homeHeroCredentials
 *   home/trustedLogos      singleton + collection homeTrustedLogos
 *   home/stats             singleton + collection homeStats
 *   home/about             singleton + collection homeAboutPoints
 *   home/whyChooseUs       singleton + collection homeWhyItems
 *   home/teamPreview       singleton
 *   home/testimonialsIntro singleton
 *   home/faqIntro          singleton
 *   home/latestBlogs       singleton
 *   home/newsletter        singleton
 *   home/contactCta        singleton
 */

const PROJECT_ID = "exclusinsider";
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

// ---------------------------------------------------------------------------
// 1) Hero — doc home/hero + collection homeHeroCredentials
// ---------------------------------------------------------------------------
export const DEFAULT_HERO = {
  eyebrow: "",
  headline: "",
  subcopy: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
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
  });
}

function normalizeHeroCredential(payload) {
  return {
    text: cleanText(payload.text),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const heroCredentialsCollection = createCollectionCrudService(COLLECTION_PATH("homeHeroCredentials"), {
  normalize: normalizeHeroCredential,
  orderByField: "order",
});

export const subscribeHeroCredentialItems = heroCredentialsCollection.subscribe;
export const createHeroCredential = heroCredentialsCollection.create;
export const updateHeroCredential = heroCredentialsCollection.update;
export const deleteHeroCredential = heroCredentialsCollection.remove;
export const toggleHeroCredentialStatus = heroCredentialsCollection.toggleActive;

// ---------------------------------------------------------------------------
// 2) Trusted Logos — doc home/trustedLogos + collection homeTrustedLogos
// ---------------------------------------------------------------------------
export const DEFAULT_TRUSTED_LOGOS = {
  eyebrow: "",
  heading: "",
};

const trustedLogosDoc = createSingletonDocService(
  HOME_DOC_PATH("trustedLogos"),
  DEFAULT_TRUSTED_LOGOS,
);

export const subscribeTrustedLogos = trustedLogosDoc.subscribe;

export function saveTrustedLogos(payload) {
  return trustedLogosDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
  });
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

const trustedLogoImageUploader = createImageUploader({
  pathPrefix: "exclusinsider/home/trustedLogos",
});
export const uploadTrustedLogoImage = trustedLogoImageUploader.upload;

// ---------------------------------------------------------------------------
// 3) Stats — doc home/stats + collection homeStats
// ---------------------------------------------------------------------------
export const DEFAULT_STATS = {
  eyebrow: "",
  heading: "",
};

const statsDoc = createSingletonDocService(HOME_DOC_PATH("stats"), DEFAULT_STATS);

export const subscribeStats = statsDoc.subscribe;

export function saveStats(payload) {
  return statsDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
  });
}

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
  eyebrow: "",
  image: "",
  heading: "",
  body: "",
  ctaLabel: "",
  ctaHref: "",
};

const aboutDoc = createSingletonDocService(HOME_DOC_PATH("about"), DEFAULT_ABOUT);

export const subscribeAbout = aboutDoc.subscribe;

export function saveAbout(payload) {
  return aboutDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    image: cleanText(payload.image),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}

const aboutImageUploader = createImageUploader({ pathPrefix: "exclusinsider/home/about" });
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
// 5) Why Choose Us — doc home/whyChooseUs + collection homeWhyItems
// ---------------------------------------------------------------------------
export const DEFAULT_WHY_CHOOSE_US = {
  eyebrow: "",
  heading: "",
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
// 6) Team Preview — doc home/teamPreview
// ---------------------------------------------------------------------------
export const DEFAULT_TEAM_PREVIEW = {
  eyebrow: "",
  heading: "",
};

const teamPreviewDoc = createSingletonDocService(HOME_DOC_PATH("teamPreview"), DEFAULT_TEAM_PREVIEW);

export const subscribeTeamPreview = teamPreviewDoc.subscribe;

export function saveTeamPreview(payload) {
  return teamPreviewDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
  });
}

// ---------------------------------------------------------------------------
// 7) Testimonials Intro — doc home/testimonialsIntro
// ---------------------------------------------------------------------------
export const DEFAULT_TESTIMONIALS_INTRO = {
  eyebrow: "",
  heading: "",
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
// 8) FAQ Intro — doc home/faqIntro
// ---------------------------------------------------------------------------
export const DEFAULT_FAQ_INTRO = {
  eyebrow: "",
  heading: "",
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
// 9) Latest Blogs — doc home/latestBlogs
// ---------------------------------------------------------------------------
export const DEFAULT_LATEST_BLOGS = {
  eyebrow: "",
  heading: "",
};

const latestBlogsDoc = createSingletonDocService(HOME_DOC_PATH("latestBlogs"), DEFAULT_LATEST_BLOGS);

export const subscribeLatestBlogs = latestBlogsDoc.subscribe;

export function saveLatestBlogs(payload) {
  return latestBlogsDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
  });
}

// ---------------------------------------------------------------------------
// 10) Newsletter — doc home/newsletter
// ---------------------------------------------------------------------------
export const DEFAULT_NEWSLETTER = {
  eyebrow: "",
  heading: "",
  body: "",
  ctaLabel: "",
};

const newsletterDoc = createSingletonDocService(HOME_DOC_PATH("newsletter"), DEFAULT_NEWSLETTER);

export const subscribeNewsletter = newsletterDoc.subscribe;

export function saveNewsletter(payload) {
  return newsletterDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}

// ---------------------------------------------------------------------------
// 11) Contact CTA — doc home/contactCta
// ---------------------------------------------------------------------------
export const DEFAULT_CONTACT_CTA = {
  eyebrow: "",
  heading: "",
  body: "",
  ctaLabel: "",
};

const contactCtaDoc = createSingletonDocService(HOME_DOC_PATH("contactCta"), DEFAULT_CONTACT_CTA);

export const subscribeContactCta = contactCtaDoc.subscribe;

export function saveContactCta(payload) {
  return contactCtaDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}
