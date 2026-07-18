import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Infodrif — Home module data layer.
 *
 * Every field name below mirrors `src/data/home.json` in the public site
 * (infodrif/src/data/home.json) EXACTLY. The site loads each section with
 * `loadSection()` (src/lib/contentLoader.js) and overlays the Firestore
 * document on that JSON via `mergeWithFallback()`. A renamed or misspelled key
 * does not error — it is simply ignored and the JSON fallback renders instead.
 * Treat the JSON as the schema of record and change both together.
 *
 * Firestore layout
 *   projects/infodrif/homesection/hero          (+ rotatingWords, customerAvatars, teamAvatars)
 *   projects/infodrif/homesection/trusted-by    (+ brands)
 *   projects/infodrif/homesection/work-strategy (+ segments, features)
 *   projects/infodrif/homesection/showcase      (+ row1, row2, row3)
 */

const PROJECT_ID = "infodrif";
const HOME_SECTION_PATH = (key) => ["projects", PROJECT_ID, "homesection", key];

const HERO_ROTATING_WORDS_PATH = [...HOME_SECTION_PATH("hero"), "rotatingWords"];
const HERO_CUSTOMER_AVATARS_PATH = [...HOME_SECTION_PATH("hero"), "customerAvatars"];
const HERO_TEAM_AVATARS_PATH = [...HOME_SECTION_PATH("hero"), "teamAvatars"];
const TRUSTED_BY_BRANDS_PATH = [...HOME_SECTION_PATH("trusted-by"), "brands"];
const WORK_STRATEGY_SEGMENTS_PATH = [...HOME_SECTION_PATH("work-strategy"), "segments"];
const WORK_STRATEGY_FEATURES_PATH = [...HOME_SECTION_PATH("work-strategy"), "features"];
const SHOWCASE_ROW_PATHS = {
  row1: [...HOME_SECTION_PATH("showcase"), "row1"],
  row2: [...HOME_SECTION_PATH("showcase"), "row2"],
  row3: [...HOME_SECTION_PATH("showcase"), "row3"],
};

const cleanText = (value = "") => String(value).trim();
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// ---------------------------------------------------------------------------
// Hub metadata — one card per sub-section on the module index page.
// ---------------------------------------------------------------------------
export const HOME_SECTIONS = [
  {
    key: "hero",
    label: "Hero",
    description:
      "Badge, split headline, rotating words, CTA, rating, hero image, and the customer/team avatar strips.",
    route: "/infodrif/home/hero",
  },
  {
    key: "trusted-by",
    label: "Trusted By",
    description: "The split social-proof heading and the logo strip of trusted brands.",
    route: "/infodrif/home/trusted-by",
  },
  {
    key: "work-strategy",
    label: "Work Strategy",
    description:
      "Two-line heading and eyebrow, the highlight card, the interactive arc segments, and the feature list.",
    route: "/infodrif/home/work-strategy",
  },
  {
    key: "showcase",
    label: "Showcase",
    description: "Integrations heading plus the three scrolling rows of app cards.",
    route: "/infodrif/home/showcase",
  },
];

// ---------------------------------------------------------------------------
// Lucide icon names. Stored as STRINGS and resolved back to components by the
// site's own `ICONS` lookup — a name outside these lists renders nothing.
// Keep each list in sync with the component named beside it.
// ---------------------------------------------------------------------------

/** Site component: infodrif/src/components/TrustedBy.jsx -> `ICONS` */
export const TRUSTED_BY_ICON_NAMES = ["Compass", "Layers", "Activity", "Award", "Globe"];

/** Site component: infodrif/src/components/WorkStretegy.jsx -> `ICONS` */
export const WORK_STRATEGY_ICON_NAMES = [
  "Rocket",
  "Target",
  "DollarSign",
  "ShieldCheck",
  "Users",
  "TrendingUp",
  "Cpu",
  "ShoppingCart",
  "PieChart",
  "Lightbulb",
];

/**
 * Tailwind class strings, not free text. The site interpolates these straight
 * into `className`, so only classes its Tailwind build already emits will
 * render — hence a fixed list rather than a text input.
 * Site component: infodrif/src/components/WorkStretegy.jsx
 */
export const WORK_STRATEGY_SEGMENT_COLORS = ["emerald", "blue", "purple"];
export const WORK_STRATEGY_FEATURE_COLORS = [
  "text-cyan-400",
  "text-purple-400",
  "text-emerald-400",
  "text-blue-400",
];

/** Site component: infodrif/src/components/ShowCase.jsx */
export const SHOWCASE_COLORS = [
  "bg-cyan-500",
  "bg-sky-500",
  "bg-sky-600",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-lime-500",
  "bg-orange-500",
  "bg-stone-500",
  "bg-gray-700",
  "bg-gray-800",
];

// ---------------------------------------------------------------------------
// Section settings defaults (the singleton document bodies).
// ---------------------------------------------------------------------------
export const DEFAULT_HOME_SECTIONS = {
  hero: {
    badgeEmoji: "🚀",
    badgeText: "#1 Performance Marketing Agency",
    headingLine1: "Smart Ideas",
    subheading:
      "InfoDrif helps affiliates discover high-converting offers, optimize campaigns, and maximize commissions through performance-first marketing.",
    ctaLabel: "Get Started",
    ctaHref: "/contact",
    customersLabel: "Our Happy Customers",
    ratingValue: "4.9",
    ratingLabel: "(15k Reviews)",
    imageUrl: "/assets/Hero.svg",
    imagePath: "",
    imageAlt: "Brand Illustration",
    imageWidth: 900,
    imageHeight: 900,
    statValue: "250+",
    statLabel: "Projects Completed",
    teamLabel: "Team Members",
  },
  "trusted-by": {
    // Split across three fields because the site styles the middle span
    // separately: {headingPrefix}<span>{headingHighlight}</span>{headingSuffix}
    headingPrefix: "Trusted by more than ",
    headingHighlight: "100+",
    headingSuffix: " companies",
  },
  "work-strategy": {
    headingLine1: "Smarter Solutions.",
    headingLine2: "Stronger Businesses.",
    eyebrowLine1: "AI + AUTOMATION + STRATEGY",
    eyebrowLine2: "Build. Grow. Scale.",
    // Nested object — merged recursively by the site's mergeWithFallback().
    highlightCard: {
      brandPrefix: "Web",
      brandSuffix: "FX",
      title: "Revenue Engine",
      statValue: "15%",
      statLabel: "Higher Lead Growth",
      active: true,
    },
  },
  showcase: {
    heading: "One marketing platform to unite 300+ apps",
    subheading:
      "InfoDrif integrates with hundreds of tools to help you save time and get more done.",
  },
};

const sectionServices = Object.fromEntries(
  Object.entries(DEFAULT_HOME_SECTIONS).map(([key, defaults]) => [
    key,
    createSingletonDocService(HOME_SECTION_PATH(key), defaults),
  ]),
);

export function subscribeHomeSection(key, onNext, onError) {
  return sectionServices[key].subscribe(onNext, onError);
}

export function saveHomeSection(key, payload) {
  return sectionServices[key].save(payload);
}

export function resetHomeSection(key) {
  return sectionServices[key].reset();
}

// ---------------------------------------------------------------------------
// Hero — rotatingWords / customerAvatars / teamAvatars
// ---------------------------------------------------------------------------
function normalizeRotatingWord(payload) {
  return {
    text: cleanText(payload.text),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

/** Both avatar strips share a shape: imageUrl + imagePath pair, alt, order, active. */
function normalizeAvatar(payload) {
  return {
    imageUrl: cleanText(payload.imageUrl),
    // Storage path kept alongside the URL so the blob can be deleted later.
    imagePath: cleanText(payload.imagePath),
    alt: cleanText(payload.alt),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const rotatingWordsService = createCollectionCrudService(HERO_ROTATING_WORDS_PATH, {
  normalize: normalizeRotatingWord,
  orderByField: "order",
});

export const subscribeHeroRotatingWords = rotatingWordsService.subscribe;
export const createHeroRotatingWord = rotatingWordsService.create;
export const updateHeroRotatingWord = rotatingWordsService.update;
export const deleteHeroRotatingWord = rotatingWordsService.remove;
export const toggleHeroRotatingWordStatus = rotatingWordsService.toggleActive;

const customerAvatarsService = createCollectionCrudService(HERO_CUSTOMER_AVATARS_PATH, {
  normalize: normalizeAvatar,
  orderByField: "order",
});

export const subscribeHeroCustomerAvatars = customerAvatarsService.subscribe;
export const createHeroCustomerAvatar = customerAvatarsService.create;
export const updateHeroCustomerAvatar = customerAvatarsService.update;
export const deleteHeroCustomerAvatar = customerAvatarsService.remove;
export const toggleHeroCustomerAvatarStatus = customerAvatarsService.toggleActive;

const teamAvatarsService = createCollectionCrudService(HERO_TEAM_AVATARS_PATH, {
  normalize: normalizeAvatar,
  orderByField: "order",
});

export const subscribeHeroTeamAvatars = teamAvatarsService.subscribe;
export const createHeroTeamAvatar = teamAvatarsService.create;
export const updateHeroTeamAvatar = teamAvatarsService.update;
export const deleteHeroTeamAvatar = teamAvatarsService.remove;
export const toggleHeroTeamAvatarStatus = teamAvatarsService.toggleActive;

const heroImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/home/hero` });
export const uploadHeroImage = heroImageUploader.upload;
export const deleteHeroImage = heroImageUploader.remove;

const customerAvatarUploader = createImageUploader({
  pathPrefix: `${PROJECT_ID}/home/hero/customer-avatar`,
});
export const uploadCustomerAvatarImage = customerAvatarUploader.upload;
export const deleteCustomerAvatarImage = customerAvatarUploader.remove;

const teamAvatarUploader = createImageUploader({
  pathPrefix: `${PROJECT_ID}/home/hero/team-avatar`,
});
export const uploadTeamAvatarImage = teamAvatarUploader.upload;
export const deleteTeamAvatarImage = teamAvatarUploader.remove;

// ---------------------------------------------------------------------------
// Trusted By — brands
// ---------------------------------------------------------------------------
function normalizeBrand(payload) {
  return {
    label: cleanText(payload.label),
    icon: cleanText(payload.icon),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const brandsService = createCollectionCrudService(TRUSTED_BY_BRANDS_PATH, {
  normalize: normalizeBrand,
  orderByField: "order",
});

export const subscribeTrustedByBrands = brandsService.subscribe;
export const createTrustedByBrand = brandsService.create;
export const updateTrustedByBrand = brandsService.update;
export const deleteTrustedByBrand = brandsService.remove;
export const toggleTrustedByBrandStatus = brandsService.toggleActive;

// ---------------------------------------------------------------------------
// Work Strategy — segments (arc geometry) / features
// ---------------------------------------------------------------------------

/**
 * `id` ("arc1") is real content, not a database key: WorkStretegy.jsx renders
 * `<path id={seg.id}>` and points a `<textPath href={"#" + seg.id}>` at it, so
 * the label text only follows the arc when the value round-trips verbatim.
 *
 * That collides with the id plumbing. BOTH the admin factory
 * (createCollectionCrudService) and the site's reader (firestoreRead.js) build
 * items as `{ id: doc.id, ...doc.data() }` — the spread comes last, so a stored
 * `id` field SHADOWS the real document id and `update(item.id)` would address
 * the wrong document. Writing each segment to a document whose id IS the arc id
 * keeps the two values identical, which makes the shadowing a harmless no-op.
 * That is why saves go through createSingletonDocService at an explicit path
 * rather than the collection factory's addDoc.
 */
export const SEGMENT_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;

function normalizeSegment(payload) {
  return {
    label: cleanText(payload.label),
    // Arc geometry, in degrees — drives describeArc() on the site.
    startAngle: toNumber(payload.startAngle),
    endAngle: toNumber(payload.endAngle),
    id: cleanText(payload.id),
    color: cleanText(payload.color),
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    stats: cleanText(payload.stats),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const segmentsService = createCollectionCrudService(WORK_STRATEGY_SEGMENTS_PATH, {
  normalize: normalizeSegment,
  orderByField: "order",
});

export const subscribeWorkStrategySegments = segmentsService.subscribe;
export const deleteWorkStrategySegment = segmentsService.remove;
export const toggleWorkStrategySegmentStatus = segmentsService.toggleActive;

/**
 * Creates or updates a segment at `segments/<arc id>`. Pass `previousId` when
 * editing so a renamed arc leaves no orphan behind.
 */
export async function saveWorkStrategySegment(payload, previousId) {
  const segment = normalizeSegment(payload);
  await createSingletonDocService([...WORK_STRATEGY_SEGMENTS_PATH, segment.id], {}).save(segment);
  if (previousId && previousId !== segment.id) {
    await segmentsService.remove(previousId);
  }
  return segment.id;
}

function normalizeFeature(payload) {
  return {
    icon: cleanText(payload.icon),
    title: cleanText(payload.title),
    desc: cleanText(payload.desc),
    color: cleanText(payload.color),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const featuresService = createCollectionCrudService(WORK_STRATEGY_FEATURES_PATH, {
  normalize: normalizeFeature,
  orderByField: "order",
});

export const subscribeWorkStrategyFeatures = featuresService.subscribe;
export const createWorkStrategyFeature = featuresService.create;
export const updateWorkStrategyFeature = featuresService.update;
export const deleteWorkStrategyFeature = featuresService.remove;
export const toggleWorkStrategyFeatureStatus = featuresService.toggleActive;

// ---------------------------------------------------------------------------
// Showcase — row1 / row2 / row3
// ---------------------------------------------------------------------------
export const SHOWCASE_ROWS = [
  { key: "row1", label: "Row 1" },
  { key: "row2", label: "Row 2" },
  { key: "row3", label: "Row 3" },
];

function normalizeShowcaseCard(payload) {
  return {
    name: cleanText(payload.name),
    desc: cleanText(payload.desc),
    // Short glyph or wordmark shown in the tile ("C", "Woo", "⌘").
    logo: cleanText(payload.logo),
    color: cleanText(payload.color),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const showcaseRowServices = Object.fromEntries(
  Object.entries(SHOWCASE_ROW_PATHS).map(([key, path]) => [
    key,
    createCollectionCrudService(path, {
      normalize: normalizeShowcaseCard,
      orderByField: "order",
    }),
  ]),
);

export function subscribeShowcaseRow(rowKey, onNext, onError) {
  return showcaseRowServices[rowKey].subscribe(onNext, onError);
}

export function createShowcaseCard(rowKey, payload) {
  return showcaseRowServices[rowKey].create(payload);
}

export function updateShowcaseCard(rowKey, id, payload) {
  return showcaseRowServices[rowKey].update(id, payload);
}

export function deleteShowcaseCard(rowKey, id) {
  return showcaseRowServices[rowKey].remove(id);
}

export function toggleShowcaseCardStatus(rowKey, id, active) {
  return showcaseRowServices[rowKey].toggleActive(id, active);
}
