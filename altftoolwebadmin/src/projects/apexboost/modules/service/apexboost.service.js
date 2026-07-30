import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Client-side Firestore data layer for every apexboost content-editor page
 * under src/projects/apexboost/modules/. Replaces the fetch("/api/apexboost/data...")
 * calls that pointed at a Next.js API route which never existed — this
 * module follows the same established pattern as
 * src/projects/campaignastra/modules/home/service/home.service.js:
 * createSingletonDocService() for one-object "settings" sections, and
 * createCollectionCrudService() for lists of independently
 * add/edit/delete-able cards, each its own Firestore document. Reads/writes
 * are gated by firestore.rules, not a server route.
 *
 * Firestore layout:
 *   projects/apexboost/content/<key>                — singleton doc sections
 *   projects/apexboost/content/<key>/items/<itemId>  — list sections
 *
 * IMPORTANT — id-field collisions:
 * createCollectionCrudService's subscribe() builds each row as
 * `{ id: doc.id, ...doc.data() }`, so a stored field literally named `id`
 * would silently clobber the real Firestore document id. A few of the old
 * broken pages hand-rolled their own `id` (Date.now(), or a title slug).
 * Those are renamed on write (see comments below — `planSlug`, `slug`) so
 * the real Firestore id, returned as `id` from every subscribe*() call, is
 * always what update*()/delete*() should be called with.
 */

const PROJECT_ID = "apexboost";
const SINGLETON_PATH = (key) => ["projects", PROJECT_ID, "content", key];
const LIST_PATH = (key) => ["projects", PROJECT_ID, "content", key, "items"];

const cleanText = (value) => (typeof value === "string" ? value.trim() : value ?? "");
const withOrder = (payload) => Number(payload?.order) || 0;

/* ==================================================================== *
 * hero/page.jsx
 * ==================================================================== */
export const DEFAULT_HERO = {
  badge: "",
  heading: "",
  headingHighlight: "",
  description: "",
  primaryBtn: "Get Started",
  secondaryBtn: "Book Consultation",
  demoBtn: "Watch Demo",
  reviewText: "4.9/5 · 520+ reviews",
  heroImages: ["", "", "", ""],
  floatingCards: [
    { label: "", value: "" },
    { label: "", value: "" },
    { label: "", value: "" },
  ],
};
const heroService = createSingletonDocService(SINGLETON_PATH("hero"), DEFAULT_HERO);
export const subscribeHero = heroService.subscribe;
export const saveHero = heroService.save;

/* ==================================================================== *
 * cta/page.jsx
 * ==================================================================== */
export const DEFAULT_CTA = {
  badge: "",
  title: "",
  desc: "",
  button1Text: "",
  button1Link: "",
  button2Text: "",
  button2Link: "",
};
const ctaService = createSingletonDocService(SINGLETON_PATH("cta"), DEFAULT_CTA);
export const subscribeCta = ctaService.subscribe;
export const saveCta = ctaService.save;

/* ==================================================================== *
 * contact/page.jsx
 * Source has no hardcoded BLANK_FORM (form starts as `null`), so the
 * default below only fixes the *shape* — no copy is invented.
 * ==================================================================== */
export const DEFAULT_CONTACT_CONFIG = {
  heading: { eyebrow: "", title: "", highlight: "", subtitle: "" },
  card: { title: "", subtitle: "", locations: "" },
  info: [],
  form: { buttonText: "", successMsg: "", footerText: "" },
  requirements: [],
};
const contactConfigService = createSingletonDocService(SINGLETON_PATH("contactConfig"), DEFAULT_CONTACT_CONFIG);
export const subscribeContactConfig = contactConfigService.subscribe;
export const saveContactConfig = contactConfigService.save;

/* ==================================================================== *
 * settings/page.jsx
 * ==================================================================== */
export const DEFAULT_SITE_SETTINGS = {
  siteName: "Apex Boost",
  siteUrl: "https://apexboost.com",
  contactEmail: "contact@apexboost.com",
  contactPhone: "+1 (555) 123-4567",
  address: "123 Business Ave, Suite 100, San Francisco, CA 94105",
  metaDescription: "Apex Boost — Digital, Affiliate & Advertising Marketing Agency",
  socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "" },
};
const siteSettingsService = createSingletonDocService(SINGLETON_PATH("settings"), DEFAULT_SITE_SETTINGS);
export const subscribeSiteSettings = siteSettingsService.subscribe;
export const saveSiteSettings = siteSettingsService.save;

/* ==================================================================== *
 * navLinks/NavbarConfigEditor.jsx
 * ==================================================================== */
export const DEFAULT_NAVBAR_CONFIG = {
  logoTextFirst: "",
  logoTextSecond: "",
  logoIcon: "",
  buttonText: "",
  buttonLink: "",
};
const navbarConfigService = createSingletonDocService(SINGLETON_PATH("navbarConfig"), DEFAULT_NAVBAR_CONFIG);
export const subscribeNavbarConfig = navbarConfigService.subscribe;
export const saveNavbarConfig = navbarConfigService.save;

/* ==================================================================== *
 * navLinks/FooterConfigEditor.jsx
 * ==================================================================== */
export const DEFAULT_FOOTER_CONFIG = {
  subscribeTitle: "",
  subscribeDesc: "",
  companyDesc: "",
  address: "",
  email: "",
  phone: "",
  copyright: "",
};
const footerConfigService = createSingletonDocService(SINGLETON_PATH("footerConfig"), DEFAULT_FOOTER_CONFIG);
export const subscribeFooterConfig = footerConfigService.subscribe;
export const saveFooterConfig = footerConfigService.save;

/* ==================================================================== *
 * whyChooseUs/AboutHeroEditor.jsx
 * ==================================================================== */
export const DEFAULT_ABOUT_HERO = {
  eyebrow: "",
  title: "",
  descLeft: "",
  descRight: "",
  buttonText: "",
  buttonLink: "",
  image: "",
};
const aboutHeroService = createSingletonDocService(SINGLETON_PATH("aboutHero"), DEFAULT_ABOUT_HERO);
export const subscribeAboutHero = aboutHeroService.subscribe;
export const saveAboutHero = aboutHeroService.save;

/* ==================================================================== *
 * whyChooseUs/AboutEditor.jsx
 * ==================================================================== */
export const DEFAULT_ABOUT_CONTENT = {
  eyebrow: "",
  title: "",
  subtitle: "",
  image: "",
  badgeTitle: "",
  badgeSubtitle: "",
  buttonText: "",
  buttonLink: "",
  points: [],
};
const aboutContentService = createSingletonDocService(SINGLETON_PATH("aboutContent"), DEFAULT_ABOUT_CONTENT);
export const subscribeAboutContent = aboutContentService.subscribe;
export const saveAboutContent = aboutContentService.save;

/* ==================================================================== *
 * whyChooseUs/AboutPillarsEditor.jsx
 * ==================================================================== */
function normalizeAboutPillar(payload = {}) {
  return {
    title: cleanText(payload.title),
    desc: cleanText(payload.desc),
    icon: payload.icon || "Target",
    order: withOrder(payload),
  };
}
const aboutPillarsService = createCollectionCrudService(LIST_PATH("aboutPillars"), {
  normalize: normalizeAboutPillar,
  orderByField: "order",
});
export const subscribeAboutPillars = aboutPillarsService.subscribe;
export const createAboutPillar = aboutPillarsService.create;
export const updateAboutPillar = aboutPillarsService.update;
export const deleteAboutPillar = aboutPillarsService.remove;

/* ==================================================================== *
 * services/page.jsx — hero editor modal
 * ==================================================================== */
export const DEFAULT_SERVICES_HERO = { images: [], badge: "", heading: "", description: "" };
const servicesHeroService = createSingletonDocService(SINGLETON_PATH("servicesHero"), DEFAULT_SERVICES_HERO);
export const subscribeServicesHero = servicesHeroService.subscribe;
export const saveServicesHero = servicesHeroService.save;

/* ==================================================================== *
 * blogs/page.jsx — categories modal
 * Stored as { items: string[] } under one doc so save/subscribe can
 * still hand the page a plain string array, matching what it already
 * sends/expects.
 * ==================================================================== */
export const DEFAULT_BLOG_CATEGORIES = [
  "All",
  "SEO Tips",
  "Affiliate Guides",
  "Advertising Strategies",
  "Lead Generation",
  "Digital Growth",
];
const blogCategoriesService = createSingletonDocService(SINGLETON_PATH("blogCategories"), {
  items: DEFAULT_BLOG_CATEGORIES,
});
export function subscribeBlogCategories(onNext, onError) {
  return blogCategoriesService.subscribe(
    (doc) => onNext(Array.isArray(doc.items) ? doc.items : []),
    onError,
  );
}
export function saveBlogCategories(categories) {
  return blogCategoriesService.save({ items: Array.isArray(categories) ? categories : [] });
}

/* ==================================================================== *
 * blogs/page.jsx — individual posts (edit modal + soft-delete), synced
 * to the old, equally-missing /api/apexboost/blogs route.
 * NOTE: incoming payload.id (the human slug, e.g. "seo-2026") is renamed
 * to `slug` — use the real Firestore id (from subscribeBlogPosts) for
 * updateBlogPost/deleteBlogPost. Soft delete = updateBlogPost(id, { ...post, deleted: true }).
 * ==================================================================== */
function normalizeBlogPost(payload = {}) {
  const { id, ...rest } = payload;
  return {
    slug: id || rest.slug || "",
    title: cleanText(rest.title),
    excerpt: cleanText(rest.excerpt),
    category: rest.category || "",
    author: cleanText(rest.author),
    role: cleanText(rest.role),
    date: rest.date || "",
    readTime: rest.readTime || "",
    image: rest.image || "",
    emoji: rest.emoji || "",
    intro: rest.intro || "",
    content: Array.isArray(rest.content) ? rest.content : [],
    takeaways: Array.isArray(rest.takeaways) ? rest.takeaways : [],
    deleted: rest.deleted === true,
    order: withOrder(rest),
  };
}
const blogPostsService = createCollectionCrudService(LIST_PATH("blogPosts"), {
  normalize: normalizeBlogPost,
  orderByField: "order",
});
export const subscribeBlogPosts = blogPostsService.subscribe;
export const createBlogPost = blogPostsService.create;
export const updateBlogPost = blogPostsService.update;
export const deleteBlogPost = blogPostsService.remove;

/* ==================================================================== *
 * testimonials/page.jsx
 * ==================================================================== */
function normalizeTestimonial(payload = {}) {
  return {
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    company: cleanText(payload.company),
    rating: Number(payload.rating) || 5,
    quote: cleanText(payload.quote),
    color: payload.color || "from-brand to-brand-cyan",
    image: payload.image || "",
    order: withOrder(payload),
  };
}
const testimonialsService = createCollectionCrudService(LIST_PATH("testimonials"), {
  normalize: normalizeTestimonial,
  orderByField: "order",
});
export const subscribeTestimonials = testimonialsService.subscribe;
export const createTestimonial = testimonialsService.create;
export const updateTestimonial = testimonialsService.update;
export const deleteTestimonial = testimonialsService.remove;

/* ==================================================================== *
 * teams/page.jsx
 * NOTE: legacy client-generated `id: Date.now()` is dropped on write —
 * use the Firestore document id from subscribeTeamMembers instead.
 * ==================================================================== */
function normalizeTeamMember(payload = {}) {
  return {
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    email: cleanText(payload.email),
    order: withOrder(payload),
  };
}
const teamMembersService = createCollectionCrudService(LIST_PATH("teams"), {
  normalize: normalizeTeamMember,
  orderByField: "order",
});
export const subscribeTeamMembers = teamMembersService.subscribe;
export const createTeamMember = teamMembersService.create;
export const updateTeamMember = teamMembersService.update;
export const deleteTeamMember = teamMembersService.remove;

/* ==================================================================== *
 * portfolio/page.jsx AND services/page.jsx (Portfolio / Case Studies
 * modal) — both read/write the same "portfolio" section, so they share
 * this one collection. `gradient` is optional (only services/page.jsx's
 * form sets it); `category` is optional (only portfolio/page.jsx sets
 * it) — both are just carried through.
 * NOTE: legacy client-generated `id: Date.now()` is dropped on write —
 * use the Firestore document id from subscribePortfolioItems instead.
 * ==================================================================== */
function normalizePortfolioItem(payload = {}) {
  return {
    title: cleanText(payload.title),
    client: cleanText(payload.client),
    category: payload.category || "Digital Marketing",
    result: cleanText(payload.result),
    metric: cleanText(payload.metric),
    image: payload.image || "",
    gradient: payload.gradient || "",
    order: withOrder(payload),
  };
}
const portfolioItemsService = createCollectionCrudService(LIST_PATH("portfolio"), {
  normalize: normalizePortfolioItem,
  orderByField: "order",
});
export const subscribePortfolioItems = portfolioItemsService.subscribe;
export const createPortfolioItem = portfolioItemsService.create;
export const updatePortfolioItem = portfolioItemsService.update;
export const deletePortfolioItem = portfolioItemsService.remove;

/* ==================================================================== *
 * navLinks/page.jsx (the nav link list itself, below the two config
 * editors)
 * ==================================================================== */
function normalizeNavLink(payload = {}) {
  return {
    to: payload.to || "",
    label: cleanText(payload.label),
    order: withOrder(payload),
  };
}
const navLinksService = createCollectionCrudService(LIST_PATH("navLinks"), {
  normalize: normalizeNavLink,
  orderByField: "order",
});
export const subscribeNavLinks = navLinksService.subscribe;
export const createNavLink = navLinksService.create;
export const updateNavLink = navLinksService.update;
export const deleteNavLink = navLinksService.remove;

/* ==================================================================== *
 * faq/page.jsx
 * ==================================================================== */
function normalizeFaqItem(payload = {}) {
  return {
    q: cleanText(payload.q),
    a: cleanText(payload.a),
    order: withOrder(payload),
  };
}
const faqItemsService = createCollectionCrudService(LIST_PATH("faq"), {
  normalize: normalizeFaqItem,
  orderByField: "order",
});
export const subscribeFaqItems = faqItemsService.subscribe;
export const createFaqItem = faqItemsService.create;
export const updateFaqItem = faqItemsService.update;
export const deleteFaqItem = faqItemsService.remove;

/* ==================================================================== *
 * features/page.jsx — feature cards
 * ==================================================================== */
function normalizeFeature(payload = {}) {
  return {
    title: cleanText(payload.title),
    desc: cleanText(payload.desc),
    image: payload.image || "",
    order: withOrder(payload),
  };
}
const featuresService = createCollectionCrudService(LIST_PATH("features"), {
  normalize: normalizeFeature,
  orderByField: "order",
});
export const subscribeFeatures = featuresService.subscribe;
export const createFeature = featuresService.create;
export const updateFeature = featuresService.update;
export const deleteFeature = featuresService.remove;

/* ==================================================================== *
 * stats/page.jsx — both counters lists share the same item shape
 * ==================================================================== */
function normalizeStat(payload = {}) {
  return {
    value: payload.value ?? "",
    prefix: payload.prefix || "",
    suffix: payload.suffix || "",
    label: cleanText(payload.label),
    icon: payload.icon || "TrendingUp",
    decimals: Number(payload.decimals) || 0,
    order: withOrder(payload),
  };
}
const statsService = createCollectionCrudService(LIST_PATH("stats"), {
  normalize: normalizeStat,
  orderByField: "order",
});
export const subscribeStats = statsService.subscribe;
export const createStat = statsService.create;
export const updateStat = statsService.update;
export const deleteStat = statsService.remove;

const heroStatsService = createCollectionCrudService(LIST_PATH("heroStats"), {
  normalize: normalizeStat,
  orderByField: "order",
});
export const subscribeHeroStats = heroStatsService.subscribe;
export const createHeroStat = heroStatsService.create;
export const updateHeroStat = heroStatsService.update;
export const deleteHeroStat = heroStatsService.remove;

/* ==================================================================== *
 * process/page.jsx
 * ==================================================================== */
function normalizeProcessStep(payload = {}) {
  return {
    title: cleanText(payload.title),
    desc: cleanText(payload.desc),
    order: withOrder(payload),
  };
}
const processStepsService = createCollectionCrudService(LIST_PATH("process"), {
  normalize: normalizeProcessStep,
  orderByField: "order",
});
export const subscribeProcessSteps = processStepsService.subscribe;
export const createProcessStep = processStepsService.create;
export const updateProcessStep = processStepsService.update;
export const deleteProcessStep = processStepsService.remove;

/* ==================================================================== *
 * pricing/page.jsx
 * NOTE: legacy `id` (a slug, e.g. "plan-1234567890" or user-typed) is
 * renamed to `planSlug` — use the Firestore document id from
 * subscribePricingPlans for updatePricingPlan/deletePricingPlan.
 * ==================================================================== */
function normalizePricingPlan(payload = {}) {
  const { id, ...rest } = payload;
  return {
    planSlug: id || rest.planSlug || "",
    name: cleanText(rest.name),
    tagline: cleanText(rest.tagline),
    monthly: Number(rest.monthly) || 0,
    yearly: Number(rest.yearly) || 0,
    popular: rest.popular === true,
    features: Array.isArray(rest.features) ? rest.features : [],
    cta: cleanText(rest.cta),
    order: withOrder(rest),
  };
}
const pricingPlansService = createCollectionCrudService(LIST_PATH("pricing"), {
  normalize: normalizePricingPlan,
  orderByField: "order",
});
export const subscribePricingPlans = pricingPlansService.subscribe;
export const createPricingPlan = pricingPlansService.create;
export const updatePricingPlan = pricingPlansService.update;
export const deletePricingPlan = pricingPlansService.remove;

/* ==================================================================== *
 * whyChooseUs/page.jsx — "Why Choose Us Cards" tab
 * ==================================================================== */
function normalizeWhyChooseUsItem(payload = {}) {
  return {
    title: cleanText(payload.title),
    desc: cleanText(payload.desc),
    image: payload.image || "",
    order: withOrder(payload),
  };
}
const whyChooseUsService = createCollectionCrudService(LIST_PATH("whyChooseUs"), {
  normalize: normalizeWhyChooseUsItem,
  orderByField: "order",
});
export const subscribeWhyChooseUsItems = whyChooseUsService.subscribe;
export const createWhyChooseUsItem = whyChooseUsService.create;
export const updateWhyChooseUsItem = whyChooseUsService.update;
export const deleteWhyChooseUsItem = whyChooseUsService.remove;

/* ==================================================================== *
 * services/page.jsx — Marketing Impact modal cards
 * ==================================================================== */
function normalizeMarketingImpactCard(payload = {}) {
  return {
    title: cleanText(payload.title),
    desc: cleanText(payload.desc),
    icon: payload.icon || "Target",
    color: payload.color || "from-blue-500 to-indigo-500",
    order: withOrder(payload),
  };
}
const marketingImpactCardsService = createCollectionCrudService(LIST_PATH("marketingImpactCards"), {
  normalize: normalizeMarketingImpactCard,
  orderByField: "order",
});
export const subscribeMarketingImpactCards = marketingImpactCardsService.subscribe;
export const createMarketingImpactCard = marketingImpactCardsService.create;
export const updateMarketingImpactCard = marketingImpactCardsService.update;
export const deleteMarketingImpactCard = marketingImpactCardsService.remove;

/* ==================================================================== *
 * services/page.jsx — service categories ("Pillar/Card" grid) with
 * their nested sub-service items. `items` stays a plain array field on
 * the category document (the page always edits it as a nested array
 * inside the category object, e.g. `updated[catIdx].items.push(...)`),
 * so updateServiceCategory(id, fullCategoryObject) should be called
 * with the *complete* category (title/tagline/description/image/accent/
 * features/items together) — exactly what saveServices(updated) sends
 * today, just scoped to one category doc instead of the whole tree.
 * NOTE: legacy `id` (a title slug, e.g. "digital-marketing") is renamed
 * to `slug` — use the Firestore document id from subscribeServiceCategories
 * for routing to the items view and for update/delete.
 * ==================================================================== */
function normalizeServiceCategory(payload = {}) {
  const { id, ...rest } = payload;
  return {
    slug: id || rest.slug || "",
    title: cleanText(rest.title),
    tagline: cleanText(rest.tagline),
    description: cleanText(rest.description),
    image: rest.image || "",
    accent: rest.accent || "",
    features: Array.isArray(rest.features) ? rest.features : [],
    items: Array.isArray(rest.items) ? rest.items : [],
    order: withOrder(rest),
  };
}
const serviceCategoriesService = createCollectionCrudService(LIST_PATH("serviceCategories"), {
  normalize: normalizeServiceCategory,
  orderByField: "order",
});
export const subscribeServiceCategories = serviceCategoriesService.subscribe;
export const createServiceCategory = serviceCategoriesService.create;
export const updateServiceCategory = serviceCategoriesService.update;
export const deleteServiceCategory = serviceCategoriesService.remove;

/* ==================================================================== *
 * components/admin/SectionHeadingEditor.jsx (shared component — takes
 * a `sectionKey` prop) + the two pages that reimplement the same
 * "heading" shape inline (features/page.jsx "Main Heading" modal,
 * stats/page.jsx "Section Heading" modal) + the two heading-shaped
 * sections inside services/page.jsx (servicesHeading, marketingImpact).
 * All of these are the same {eyebrow,title,highlight,subtitle}-ish
 * singleton doc, keyed dynamically by section — one generic pair of
 * functions covers every caller.
 * ==================================================================== */
export const DEFAULT_HEADING_SECTIONS = {
  blogHeading: {
    eyebrow: "Blog & Insights",
    title: "Growth strategies you can",
    highlight: "steal today",
    subtitle:
      "Fresh thinking on SEO, affiliate programs, paid ads and the tactics driving modern marketing wins.",
  },
  testimonialsHeading: {
    eyebrow: "Client Reviews",
    title: "Trusted by brands that",
    highlight: "demand results",
    subtitle:
      "Real words from real clients — brands that came to us for growth and found a long-term partner.",
  },
  portfolioHeading: {
    eyebrow: "Our Work",
    title: "Campaigns that",
    highlight: "move the needle",
    subtitle: "A curated look at the results we drive across Digital, Affiliate and Advertising marketing.",
  },
  faqHeading: {
    eyebrow: "FAQ",
    title: "Answers to your",
    highlight: "growth questions",
    subtitle:
      "Everything you need to know about working with us across Digital, Affiliate and Advertising marketing.",
  },
  processHeading: {
    eyebrow: "Our Process",
    title: "A proven path from idea to impact",
    highlight: "",
    subtitle: "Eight disciplined steps that turn raw ambition into predictable, scalable marketing growth.",
  },
  whyChooseUsHeading: {
    eyebrow: "Why Choose Us",
    title: "The growth partner brands actually trust",
    highlight: "",
    subtitle:
      "We're not just another agency. We're an extension of your team — accountable, transparent and relentlessly focused on your results.",
  },
  featuresHeading: { eyebrow: "", title: "", highlight: "", subtitle: "" },
  statsHeading: { title: "Numbers that drive", highlight: "Confidence" },
  servicesHeading: { eyebrow: "", title: "", highlight: "", subtitle: "" },
  marketingImpact: { eyebrow: "", title: "", highlight: "", subtitle: "" },
};
const DEFAULT_HEADING_FALLBACK = { eyebrow: "", title: "", highlight: "", subtitle: "" };

const headingServices = {};
function getHeadingService(sectionKey) {
  if (!headingServices[sectionKey]) {
    const defaults = DEFAULT_HEADING_SECTIONS[sectionKey] || DEFAULT_HEADING_FALLBACK;
    headingServices[sectionKey] = createSingletonDocService(SINGLETON_PATH(sectionKey), defaults);
  }
  return headingServices[sectionKey];
}

export function subscribeSectionHeading(sectionKey, onNext, onError) {
  return getHeadingService(sectionKey).subscribe(onNext, onError);
}

export function saveSectionHeading(sectionKey, payload) {
  return getHeadingService(sectionKey).save(payload);
}
