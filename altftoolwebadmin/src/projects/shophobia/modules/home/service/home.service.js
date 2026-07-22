import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Shophobia — Home module data layer.
 *
 * Cloned from `src/projects/offerris/modules/home/service/home.service.js`
 * and adapted to Shophobia's `data/home.json` shape (see
 * `src/projects/shophobia/CONTRACT.md` — field names are authoritative).
 *
 * Firestore layout (all under `projects/shophobia/...`):
 *   home/hero              singleton (incl. glitchWord)
 *   home/trustedLogos      singleton + collection homeTrustedLogos (logo images)
 *   home/about             singleton (incl. image + since badge) + collection homeAboutHighlights
 *   home/whyChooseUs       singleton + collection homeWhyItems
 *   home/servicesIntro     singleton (ServicesGrid heading)
 *   home/teamPreview       singleton
 *   home/testimonialsIntro singleton
 *   home/faqIntro          singleton
 *   home/latestBlogs       singleton
 *   home/newsletter        singleton (incl. successMessage)
 *   home/contactCta        singleton
 *
 * (Site stats live in the site-settings module's `siteStats` collection.)
 *
 * Singleton DEFAULTS are prefilled with the site's current JSON content so
 * the admin shows real copy on first load; saving writes it to Firestore.
 */

const PROJECT_ID = "shophobia";
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
  eyebrow: "Digital Agency // Est. 2021",
  headline: "We Build Brands For The Internet's Next Main Character",
  glitchWord: "Main Character",
  subcopy:
    "Shophobia is a chrome-and-holographic digital studio for brands that refuse to look like everyone else's Q3 roadmap. Websites, apps, and campaigns engineered to get screenshotted.",
  primaryCtaLabel: "Enter the Drop",
  primaryCtaHref: "/contact",
  secondaryCtaLabel: "See Our Work",
  secondaryCtaHref: "/services",
  scrollLabel: "Scroll To Glitch",
};

const heroDoc = createSingletonDocService(HOME_DOC_PATH("hero"), DEFAULT_HERO);

export const subscribeHero = heroDoc.subscribe;

export function saveHero(payload) {
  return heroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headline: cleanText(payload.headline),
    glitchWord: cleanText(payload.glitchWord),
    subcopy: cleanText(payload.subcopy),
    primaryCtaLabel: cleanText(payload.primaryCtaLabel),
    primaryCtaHref: cleanText(payload.primaryCtaHref),
    secondaryCtaLabel: cleanText(payload.secondaryCtaLabel),
    secondaryCtaHref: cleanText(payload.secondaryCtaHref),
    scrollLabel: cleanText(payload.scrollLabel),
  });
}

// ---------------------------------------------------------------------------
// 2) Trusted Logos — doc home/trustedLogos + collection homeTrustedLogos
// ---------------------------------------------------------------------------
export const DEFAULT_TRUSTED_LOGOS = {
  heading: "Trusted By Brands Who Refuse To Blend In",
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

const trustedLogoUploader = createImageUploader({ pathPrefix: "shophobia/home/trusted-logo" });
export const uploadTrustedLogoImage = trustedLogoUploader.upload;

// ---------------------------------------------------------------------------
// 3) About — doc home/about + collection homeAboutHighlights
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT = {
  eyebrow: "Who We Are",
  heading: "Part Design Studio, Part Chrome Foundry, Full-Time Internet Natives",
  body:
    "We started Shophobia because the internet's design language went beige. Every startup looked like the last one — same rounded corners, same safe gradients, same forgettable pitch. We build the opposite: brands with chrome in their veins and a point of view loud enough to survive the scroll.",
  ctaLabel: "More About Us",
  ctaHref: "/about",
  image:
    "https://img.magnific.com/free-photo/business-strategy-success-target-goals_1421-33.jpg?semt=ais_hybrid&w=740&q=80",
  imageAlt: "About Us",
  sinceLabel: "Since",
  sinceYear: "2021",
};

const aboutDoc = createSingletonDocService(HOME_DOC_PATH("about"), DEFAULT_ABOUT);

export const subscribeAbout = aboutDoc.subscribe;

export function saveAbout(payload) {
  return aboutDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
    image: cleanText(payload.image),
    imageAlt: cleanText(payload.imageAlt),
    sinceLabel: cleanText(payload.sinceLabel),
    sinceYear: cleanText(payload.sinceYear),
  });
}

const aboutImageUploader = createImageUploader({ pathPrefix: "shophobia/home/about" });
export const uploadAboutImage = aboutImageUploader.upload;

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
// 4) Why Choose Us — doc home/whyChooseUs + collection homeWhyItems
// ---------------------------------------------------------------------------
export const DEFAULT_WHY_CHOOSE_US = {
  eyebrow: "Why Shophobia",
  heading: "We're Not Your Typical Agency Deck",
  subcopy:
    "We combine strategy, creativity, and technology to build brands that stand out in crowded digital markets.",
  ctaLabel: "Let's Work Together",
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
    subcopy: cleanText(payload.subcopy),
    ctaLabel: cleanText(payload.ctaLabel),
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
// 5) Services intro — doc home/servicesIntro (ServicesGrid heading)
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES_INTRO = {
  eyebrow: "What We Do",
  heading: "Eight Ways We Make Your Brand Impossible To Ignore",
  description: "Every service is a full-stack engagement — strategy, design, and build under one roof.",
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
// 6) Team preview — doc home/teamPreview
// ---------------------------------------------------------------------------
export const DEFAULT_TEAM_PREVIEW = {
  eyebrow: "The Collective",
  heading: "The Humans Behind The Holograms",
  description: "A small, senior team that stays hands-on from kickoff to launch.",
  ctaLabel: "Meet The Full Team",
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
// 7) Testimonials intro — doc home/testimonialsIntro
// ---------------------------------------------------------------------------
export const DEFAULT_TESTIMONIALS_INTRO = {
  eyebrow: "Word On The Street",
  heading: "Brands That Stopped Blending In",
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
// 8) FAQ intro — doc home/faqIntro
// ---------------------------------------------------------------------------
export const DEFAULT_FAQ_INTRO = {
  eyebrow: "Questions",
  heading: "Before You Enter The Drop",
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
// 9) Latest blogs intro — doc home/latestBlogs
// ---------------------------------------------------------------------------
export const DEFAULT_LATEST_BLOGS = {
  eyebrow: "From The Studio",
  heading: "Signal, Not Noise",
  description: "Notes on design, marketing, and building brands that don't disappear into the feed.",
  ctaLabel: "View All Posts",
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
// 10) Newsletter — doc home/newsletter
// ---------------------------------------------------------------------------
export const DEFAULT_NEWSLETTER = {
  heading: "Get The Chrome Report",
  subcopy:
    "Monthly drops on internet culture, design trends, and what's actually working in digital marketing right now. No spam, just signal.",
  placeholder: "your@email.com",
  buttonLabel: "Subscribe",
  successMessage: "You're in. Watch your inbox.",
};

const newsletterDoc = createSingletonDocService(
  HOME_DOC_PATH("newsletter"),
  DEFAULT_NEWSLETTER,
);

export const subscribeNewsletter = newsletterDoc.subscribe;

export function saveNewsletter(payload) {
  return newsletterDoc.save({
    heading: cleanText(payload.heading),
    subcopy: cleanText(payload.subcopy),
    placeholder: cleanText(payload.placeholder),
    buttonLabel: cleanText(payload.buttonLabel),
    successMessage: cleanText(payload.successMessage),
  });
}

// ---------------------------------------------------------------------------
// 11) Contact CTA — doc home/contactCta
// ---------------------------------------------------------------------------
export const DEFAULT_CONTACT_CTA = {
  heading: "Ready To Build Something Nobody's Seen Yet?",
  subcopy:
    "Tell us about your brand, your goals, and your budget. We'll come back with a plan, not a sales pitch.",
  buttonLabel: "Start The Conversation",
};

const contactCtaDoc = createSingletonDocService(
  HOME_DOC_PATH("contactCta"),
  DEFAULT_CONTACT_CTA,
);

export const subscribeContactCta = contactCtaDoc.subscribe;

export function saveContactCta(payload) {
  return contactCtaDoc.save({
    heading: cleanText(payload.heading),
    subcopy: cleanText(payload.subcopy),
    buttonLabel: cleanText(payload.buttonLabel),
  });
}
