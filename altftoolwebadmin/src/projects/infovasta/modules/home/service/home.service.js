import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Infovasta — Home module data layer.
 *
 * The home page is a single admin page composed of many sections. Every
 * section is a singleton settings document (`home/<key>`). Field names below
 * mirror infovasta's `data/home.json` exactly — DO NOT rename them, the
 * frontend JSON fallback wins whenever the admin leaves a value empty.
 *
 * Firestore layout (all under `projects/infovasta/...`):
 *   home/hero          singleton
 *   home/services      singleton
 *   home/whyChoose     singleton
 *   home/team          singleton
 *   home/testimonials  singleton
 *   home/newsletter    singleton
 *   home/blog          singleton
 *   home/faq           singleton
 *   home/portfolio     singleton
 */

const PROJECT_ID = "infovasta";
const HOME_DOC_PATH = (key) => ["projects", PROJECT_ID, "home", key];

const cleanText = (value = "") => String(value ?? "").trim();

/** { label, href } pair, always present so the frontend never reads undefined. */
const toCta = (value = {}) => ({
  label: cleanText(value?.label),
  href: cleanText(value?.href),
});

/** string[] repeatable list -> trimmed, de-blanked string[] */
const toLines = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => cleanText(entry)).filter(Boolean);
};

/** array of { icon, label } / other small objects -> trimmed rows, drop fully-empty rows */
const toObjectList = (value, keys) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const next = {};
      keys.forEach((key) => { next[key] = cleanText(row?.[key]); });
      return next;
    })
    .filter((row) => keys.some((key) => row[key]));
};

// ---------------------------------------------------------------------------
// 1) Hero — doc home/hero
// ---------------------------------------------------------------------------
export const DEFAULT_HERO = {
  badges: [
    { icon: "shield-checkmark-outline", label: "Google Partner" },
    { icon: "star-outline", label: "4.9/5 average rating" },
    { icon: "flash-outline", label: "48hr response time" },
  ],
  headingBefore: "We Grow Brands With ",
  headingHighlight: "Data-Driven Marketing",
  description:
    "InfoVsta is a digital marketing agency combining web design, development, SEO and paid growth into one accountable team — built to turn traffic into revenue.",
  primaryCta: { label: "Get Free Consultation", href: "/contact-us" },
  secondaryCta: { label: "Explore Services", href: "/service" },
  image: "/assets/images/hero-banner.png",
  imageAlt: "InfoVsta digital marketing team",
  marqueeLabel: "Trusted by growing teams at",
  marqueeLogos: ["Northwind", "Acme Co.", "Orbit", "Zenith", "Atlas Labs", "Vertex", "Nimbus", "Cascade"],
};

const heroDoc = createSingletonDocService(HOME_DOC_PATH("hero"), DEFAULT_HERO);
export const subscribeHero = heroDoc.subscribe;
export function saveHero(payload) {
  return heroDoc.save({
    badges: toObjectList(payload.badges, ["icon", "label"]),
    headingBefore: cleanText(payload.headingBefore),
    headingHighlight: cleanText(payload.headingHighlight),
    description: cleanText(payload.description),
    primaryCta: toCta(payload.primaryCta),
    secondaryCta: toCta(payload.secondaryCta),
    image: cleanText(payload.image),
    imageAlt: cleanText(payload.imageAlt),
    marqueeLabel: cleanText(payload.marqueeLabel),
    marqueeLogos: toLines(payload.marqueeLogos),
  });
}

// ---------------------------------------------------------------------------
// 2) Services — doc home/services
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES = {
  eyebrow: "Our Services",
  heading: "Growing your business with our best services",
  ctaLabel: "View All Services",
  ctaHref: "/service",
};

const servicesDoc = createSingletonDocService(HOME_DOC_PATH("services"), DEFAULT_SERVICES);
export const subscribeServices = servicesDoc.subscribe;
export function saveServices(payload) {
  return servicesDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}

// ---------------------------------------------------------------------------
// 3) Why Choose — doc home/whyChoose
// ---------------------------------------------------------------------------
export const DEFAULT_WHY_CHOOSE = {
  eyebrow: "Why Choose Us",
  headingBefore: "Built for brands who take ",
  headingHighlight: "growth seriously",
};

const whyChooseDoc = createSingletonDocService(HOME_DOC_PATH("whyChoose"), DEFAULT_WHY_CHOOSE);
export const subscribeWhyChoose = whyChooseDoc.subscribe;
export function saveWhyChoose(payload) {
  return whyChooseDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headingBefore: cleanText(payload.headingBefore),
    headingHighlight: cleanText(payload.headingHighlight),
  });
}

// ---------------------------------------------------------------------------
// 4) Team — doc home/team
// ---------------------------------------------------------------------------
export const DEFAULT_TEAM = {
  eyebrow: "Our Team",
  headingBefore: "The people behind your ",
  headingHighlight: "growth",
  ctaLabel: "Meet The Full Team",
  ctaHref: "/team",
};

const teamDoc = createSingletonDocService(HOME_DOC_PATH("team"), DEFAULT_TEAM);
export const subscribeTeam = teamDoc.subscribe;
export function saveTeam(payload) {
  return teamDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headingBefore: cleanText(payload.headingBefore),
    headingHighlight: cleanText(payload.headingHighlight),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}

// ---------------------------------------------------------------------------
// 5) Testimonials — doc home/testimonials
// ---------------------------------------------------------------------------
export const DEFAULT_TESTIMONIALS = {
  eyebrow: "Testimonials",
  headingBefore: "See what others are ",
  headingHighlight: "saying",
};

const testimonialsDoc = createSingletonDocService(HOME_DOC_PATH("testimonials"), DEFAULT_TESTIMONIALS);
export const subscribeTestimonials = testimonialsDoc.subscribe;
export function saveTestimonials(payload) {
  return testimonialsDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headingBefore: cleanText(payload.headingBefore),
    headingHighlight: cleanText(payload.headingHighlight),
  });
}

// ---------------------------------------------------------------------------
// 6) Newsletter — doc home/newsletter
// ---------------------------------------------------------------------------
export const DEFAULT_NEWSLETTER = {
  eyebrow: "Get every update",
  heading: "Subscribe newslater get latest updates and deals",
  placeholder: "Enter your mail",
  buttonLabel: "Subscribe",
  bgImage: "/assets/images/newsletter-bg.jpg",
  bannerImage: "/assets/images/newsletter-banner.png",
  bannerAlt: "newsletter banner",
};

const newsletterDoc = createSingletonDocService(HOME_DOC_PATH("newsletter"), DEFAULT_NEWSLETTER);
export const subscribeNewsletter = newsletterDoc.subscribe;
export function saveNewsletter(payload) {
  return newsletterDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    placeholder: cleanText(payload.placeholder),
    buttonLabel: cleanText(payload.buttonLabel),
    bgImage: cleanText(payload.bgImage),
    bannerImage: cleanText(payload.bannerImage),
    bannerAlt: cleanText(payload.bannerAlt),
  });
}

// ---------------------------------------------------------------------------
// 7) Blog — doc home/blog
// ---------------------------------------------------------------------------
export const DEFAULT_BLOG = {
  eyebrow: "Blog Post",
  headingBefore: "Popular ",
  headingHighlight: "blog post",
  ctaLabel: "View All Articles",
  ctaHref: "/blog",
};

const blogDoc = createSingletonDocService(HOME_DOC_PATH("blog"), DEFAULT_BLOG);
export const subscribeBlog = blogDoc.subscribe;
export function saveBlog(payload) {
  return blogDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headingBefore: cleanText(payload.headingBefore),
    headingHighlight: cleanText(payload.headingHighlight),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}

// ---------------------------------------------------------------------------
// 8) FAQ — doc home/faq
// ---------------------------------------------------------------------------
export const DEFAULT_FAQ = {
  eyebrow: "FAQ",
  headingBefore: "Frequently asked ",
  headingHighlight: "questions",
  searchPlaceholder: "Search a question...",
};

const faqDoc = createSingletonDocService(HOME_DOC_PATH("faq"), DEFAULT_FAQ);
export const subscribeFaq = faqDoc.subscribe;
export function saveFaq(payload) {
  return faqDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headingBefore: cleanText(payload.headingBefore),
    headingHighlight: cleanText(payload.headingHighlight),
    searchPlaceholder: cleanText(payload.searchPlaceholder),
  });
}

// ---------------------------------------------------------------------------
// 9) Portfolio — doc home/portfolio
// ---------------------------------------------------------------------------
export const DEFAULT_PORTFOLIO = {
  eyebrow: "Our Work",
  headingBefore: "Real results for real ",
  headingHighlight: "brands",
  ctaLabel: "View Full Portfolio",
  ctaHref: "/portfolio",
};

const portfolioDoc = createSingletonDocService(HOME_DOC_PATH("portfolio"), DEFAULT_PORTFOLIO);
export const subscribePortfolio = portfolioDoc.subscribe;
export function savePortfolio(payload) {
  return portfolioDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    headingBefore: cleanText(payload.headingBefore),
    headingHighlight: cleanText(payload.headingHighlight),
    ctaLabel: cleanText(payload.ctaLabel),
    ctaHref: cleanText(payload.ctaHref),
  });
}
