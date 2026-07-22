import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Samvatsara — Home module data layer.
 *
 * The home page is a single admin page composed of many sections. Each section
 * is either a singleton settings document (`home/<key>`) or a settings document
 * paired with an ordered collection (`home<Collection>`). Every field name below
 * is authoritative per `src/projects/samvatsara/CONTRACT.md` — DO NOT rename them.
 * When the admin leaves a value empty, the frontend JSON fallback wins.
 *
 * Firestore layout (all under `projects/samvatsara/...`):
 *   home/hero                singleton (+ hero image)
 *   home/trustedLogos        singleton  + collection homeTrustedLogos
 *   home/stats -> —          collection homeStats
 *   home/aboutTeaser         singleton
 *   home/whyChooseUs         singleton  + collection homeWhyReasons
 *   home/servicesPreview     singleton
 *   home/teamPreview         singleton
 *   home/testimonialsPreview singleton
 *   home/faqPreview          singleton
 *   home/blogPreview         singleton
 *   home/cta                 singleton
 *   home/newsletter          singleton
 */

const PROJECT_ID = "samvatsara";
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

const WHY_ICONS = ["hand", "compass", "house", "heart"];
export { WHY_ICONS };

// ---------------------------------------------------------------------------
// 1) Hero — doc home/hero
// ---------------------------------------------------------------------------
export const DEFAULT_HERO = {
  eyebrow: "Boutique digital studio, est. 2016",
  headlineLead: "We build brands that feel",
  headlineItalic: "unmistakably yours.",
  subcopy:
    "CampianAstra Studio is a small, deliberate team of designers, writers, and strategists who craft websites, campaigns, and identities with the care of an atelier and the rigor of an agency.",
  ctaPrimary: { label: "Let's Create Together", href: "/contact" },
  ctaSecondary: { label: "See Our Services", href: "/services" },
  scrollLabel: "Scroll to explore",
  imageUrl: "",
  imagePath: "",
};

const heroDoc = createSingletonDocService(HOME_DOC_PATH("hero"), DEFAULT_HERO);

export const subscribeHero = heroDoc.subscribe;

export function saveHero(payload) {
  return heroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headlineLead: cleanText(payload.headlineLead),
    headlineItalic: cleanText(payload.headlineItalic),
    subcopy: cleanText(payload.subcopy),
    ctaPrimary: toCta(payload.ctaPrimary),
    ctaSecondary: toCta(payload.ctaSecondary),
    scrollLabel: cleanText(payload.scrollLabel),
    imageUrl: cleanText(payload.imageUrl),
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
  label: "Trusted by independent brands and growing teams",
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
// 4) About Teaser — doc home/aboutTeaser
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_TEASER = {
  eyebrow: "Who we are",
  heading: "Part studio, part strategy room, part atelier.",
  headingItalic: "atelier",
  body:
    "We started CampianAstra around a kitchen table with one belief: good marketing shouldn't feel manufactured. Nine years later we're still small on purpose — a tight team that designs every project by hand, sweats the typography, and writes copy that sounds like a person, not a press release.",
  points: [
    "Senior makers on every project, no hand-offs to junior benches",
    "Strategy and craft under one roof — no relay race between vendors",
    "Slow enough to get it right, fast enough to matter",
  ],
  cta: { label: "More about the studio", href: "/about" },
  quote:
    "Good marketing shouldn't feel manufactured — it should feel like it could only come from you.",
  quoteAuthor: "Marisol Abbott, Founder",
};

const aboutTeaserDoc = createSingletonDocService(
  HOME_DOC_PATH("aboutTeaser"),
  DEFAULT_ABOUT_TEASER,
);

export const subscribeAboutTeaser = aboutTeaserDoc.subscribe;

export function saveAboutTeaser(payload) {
  return aboutTeaserDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    headingItalic: cleanText(payload.headingItalic),
    body: cleanText(payload.body),
    points: toLines(payload.points),
    cta: toCta(payload.cta),
    quote: cleanText(payload.quote),
    quoteAuthor: cleanText(payload.quoteAuthor),
  });
}

// ---------------------------------------------------------------------------
// 5) Why Choose Us — doc home/whyChooseUs + collection homeWhyReasons
// ---------------------------------------------------------------------------
export const DEFAULT_WHY_CHOOSE_US = {
  eyebrow: "Why studios choose CampianAstra",
  heading: "Craft first. Everything else follows.",
  headingItalic: "Craft first.",
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
    headingItalic: cleanText(payload.headingItalic),
  });
}

function normalizeWhyReason(payload) {
  const icon = WHY_ICONS.includes(payload.icon) ? payload.icon : WHY_ICONS[0];
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    icon,
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
// 6) Services Preview — doc home/servicesPreview
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES_PREVIEW = {
  eyebrow: "What we do",
  heading: "Eight crafts, one studio.",
  headingItalic: "one studio.",
  body:
    "From first sketch to shipped product, we cover the whole craft — so your brand never gets stretched thin across five different vendors.",
};

const servicesPreviewDoc = createSingletonDocService(
  HOME_DOC_PATH("servicesPreview"),
  DEFAULT_SERVICES_PREVIEW,
);

export const subscribeServicesPreview = servicesPreviewDoc.subscribe;

export function saveServicesPreview(payload) {
  return servicesPreviewDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    headingItalic: cleanText(payload.headingItalic),
    body: cleanText(payload.body),
  });
}

// ---------------------------------------------------------------------------
// 7) Team Preview — doc home/teamPreview
// ---------------------------------------------------------------------------
export const DEFAULT_TEAM_PREVIEW = {
  eyebrow: "Meet the makers",
  heading: "The hands behind the work.",
  headingItalic: "behind the work.",
  body:
    "No account managers relaying your feedback down a chain. These are the people who'll actually be in your project, start to finish.",
  ctaLabel: "Meet the Whole Studio",
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
    headingItalic: cleanText(payload.headingItalic),
    body: cleanText(payload.body),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}

// ---------------------------------------------------------------------------
// 8) Testimonials Preview — doc home/testimonialsPreview
// ---------------------------------------------------------------------------
export const DEFAULT_TESTIMONIALS_PREVIEW = {
  eyebrow: "Kind words",
  heading: "Don't just take our word for it.",
  headingItalic: "our word for it.",
};

const testimonialsPreviewDoc = createSingletonDocService(
  HOME_DOC_PATH("testimonialsPreview"),
  DEFAULT_TESTIMONIALS_PREVIEW,
);

export const subscribeTestimonialsPreview = testimonialsPreviewDoc.subscribe;

export function saveTestimonialsPreview(payload) {
  return testimonialsPreviewDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    headingItalic: cleanText(payload.headingItalic),
  });
}

// ---------------------------------------------------------------------------
// 9) FAQ Preview — doc home/faqPreview
// ---------------------------------------------------------------------------
export const DEFAULT_FAQ_PREVIEW = {
  eyebrow: "Questions, answered",
  heading: "Everything you're probably wondering.",
  headingItalic: "probably wondering.",
};

const faqPreviewDoc = createSingletonDocService(
  HOME_DOC_PATH("faqPreview"),
  DEFAULT_FAQ_PREVIEW,
);

export const subscribeFaqPreview = faqPreviewDoc.subscribe;

export function saveFaqPreview(payload) {
  return faqPreviewDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    headingItalic: cleanText(payload.headingItalic),
  });
}

// ---------------------------------------------------------------------------
// 10) Blog Preview — doc home/blogPreview
// ---------------------------------------------------------------------------
export const DEFAULT_BLOG_PREVIEW = {
  eyebrow: "From the studio",
  heading: "Notes on craft & marketing.",
  headingItalic: "craft & marketing.",
  ctaLabel: "Read the Blog",
};

const blogPreviewDoc = createSingletonDocService(
  HOME_DOC_PATH("blogPreview"),
  DEFAULT_BLOG_PREVIEW,
);

export const subscribeBlogPreview = blogPreviewDoc.subscribe;

export function saveBlogPreview(payload) {
  return blogPreviewDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    headingItalic: cleanText(payload.headingItalic),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}

// ---------------------------------------------------------------------------
// 11) CTA — doc home/cta
// ---------------------------------------------------------------------------
export const DEFAULT_CTA = {
  eyebrow: "Ready when you are",
  heading: "Have a brand worth building properly?",
  headingItalic: "worth building properly?",
  body:
    "Tell us what you're working on. We read every note ourselves and reply within one business day, promise.",
  ctaPrimary: { label: "Start a Project", href: "/contact" },
  ctaSecondary: { label: "View Our Work", href: "/services" },
};

const ctaDoc = createSingletonDocService(HOME_DOC_PATH("cta"), DEFAULT_CTA);

export const subscribeCta = ctaDoc.subscribe;

export function saveCta(payload) {
  return ctaDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    headingItalic: cleanText(payload.headingItalic),
    body: cleanText(payload.body),
    ctaPrimary: toCta(payload.ctaPrimary),
    ctaSecondary: toCta(payload.ctaSecondary),
  });
}

// ---------------------------------------------------------------------------
// 12) Newsletter — doc home/newsletter
// ---------------------------------------------------------------------------
export const DEFAULT_NEWSLETTER = {
  heading: "Studio notes, twice a month.",
  body:
    "Field notes on design, marketing, and running a small studio well — no spam, just the good stuff.",
  placeholder: "you@yourbrand.com",
  cta: "Subscribe",
};

const newsletterDoc = createSingletonDocService(HOME_DOC_PATH("newsletter"), DEFAULT_NEWSLETTER);

export const subscribeNewsletter = newsletterDoc.subscribe;

export function saveNewsletter(payload) {
  return newsletterDoc.save({
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
    placeholder: cleanText(payload.placeholder),
    cta: cleanText(payload.cta),
  });
}
