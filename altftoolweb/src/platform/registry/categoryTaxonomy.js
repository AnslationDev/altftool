// Canonical category taxonomy for the tool registry.
//
// Single source of truth consumed by BOTH:
//   - scripts/generate-tool-meta.mjs (build-time: consolidates free-text
//     tool.config.js categories into the canonical set below, fails loudly
//     on unknown values so drift cannot re-enter silently), and
//   - runtime routes (/tools/[category]) for legacy-slug redirects.
//
// Why: the organic taxonomy had grown to 94 free-text values
// (Utility 45 vs Utilities 12, Game vs Games, Developer vs Developers,
// education ×4 …) — every stray value minted a separate thin category route
// and sitemap entry. Tools keep their original values as `topics` so search
// and related-tool scoring lose nothing.

/** Canonical categories (order = display order on hubs/filters). */
export const CANONICAL_CATEGORIES = [
  { label: "AI Tools", slug: "ai-tools", description: "AI-powered helpers that run in your browser." },
  { label: "PDF & Documents", slug: "pdf-documents", description: "Merge, split, convert, and edit PDFs and documents." },
  { label: "Image & Photo", slug: "image-photo", description: "Compress, convert, resize, and edit images." },
  { label: "Video & Audio", slug: "video-audio", description: "Trim, convert, and process video and audio." },
  { label: "Text & Writing", slug: "text-writing", description: "Write, count, clean, and transform text." },
  { label: "Converters", slug: "converters", description: "Convert units, files, data, and formats." },
  { label: "Generators", slug: "generators", description: "Generate QR codes, passwords, names, and more." },
  { label: "Calculators", slug: "calculators", description: "Math, dates, percentages, and everyday calculators." },
  { label: "Finance Calculators", slug: "finance-calculators", description: "EMI, SIP, tax, GST, and money calculators." },
  { label: "Health Calculators", slug: "health-calculators", description: "BMI, calories, and health metric calculators." },
  { label: "Health & Fitness", slug: "health-fitness", description: "Trackers and tools for fitness and wellbeing." },
  { label: "Developer", slug: "developer", description: "Formatters, testers, and utilities for developers." },
  { label: "Design & Color", slug: "design-color", description: "Color, layout, and creative design tools." },
  { label: "Marketing & Social", slug: "marketing-social", description: "SEO, social media, and marketing utilities." },
  { label: "Security & Privacy", slug: "security-privacy", description: "Encryption, passwords, and privacy tools." },
  { label: "Education & Science", slug: "education-science", description: "Learning, exam, and science tools." },
  { label: "Productivity", slug: "productivity", description: "Planners, organizers, and time-savers." },
  { label: "Business", slug: "business", description: "Invoices, startup, and business utilities." },
  { label: "Lifestyle", slug: "lifestyle", description: "Everyday tools for home, food, and life." },
  { label: "Fun", slug: "fun", description: "Playful experiments and entertaining tools." },
  { label: "Games", slug: "games", description: "Free browser games — no install, no sign-up." },
  { label: "Other", slug: "other", description: "Everything that fits nowhere else (yet)." },
];

export const CANONICAL_LABELS = CANONICAL_CATEGORIES.map((entry) => entry.label);
const CANONICAL_LABEL_SET = new Set(CANONICAL_LABELS.map((label) => label.toLowerCase()));
const CANONICAL_SLUG_TO_LABEL = new Map(
  CANONICAL_CATEGORIES.map((entry) => [entry.slug, entry.label]),
);

/** Special token: refined into one of the three calculator categories. */
const CALC = "__CALCULATOR__";

/**
 * Raw (lowercased) free-text value → canonical label.
 * String value = direct mapping.
 * `{ generic: true, fallback }` = drop the value when the tool has any other
 * resolvable category; use the fallback only when nothing else resolves.
 */
export const CATEGORY_ALIASES = {
  // Developer & data
  developer: "Developer",
  developers: "Developer",
  code: "Developer",
  devops: "Developer",
  api: "Developer",
  "no-code": "Developer",
  data: "Developer",
  "data tools": "Developer",
  analytics: "Developer",
  network: "Developer",
  accessibility: "Developer",
  web: { generic: true, fallback: "Developer" },

  // AI
  ai: "AI Tools",
  generative: "AI Tools",
  "fun / ai": "AI Tools",
  "computer vision": "AI Tools",

  // Documents
  pdf: "PDF & Documents",
  document: "PDF & Documents",
  documents: "PDF & Documents",

  // Image
  image: "Image & Photo",
  photo: "Image & Photo",
  photography: "Image & Photo",
  selfie: "Image & Photo",
  "ai & image tools": "Image & Photo",

  // Video & audio
  video: "Video & Audio",
  audio: "Video & Audio",
  music: "Video & Audio",
  media: { generic: true, fallback: "Video & Audio" },

  // Text
  text: "Text & Writing",
  "text tools": "Text & Writing",
  word: "Text & Writing",
  language: "Text & Writing",

  // Conversion / generation / calculation
  converter: "Converters",
  converters: "Converters",
  generator: "Generators",
  generators: "Generators",
  calculator: CALC,
  calculators: CALC,
  math: "Calculators",

  // Finance
  finance: "Finance Calculators",
  "financial tools": "Finance Calculators",

  // Health
  health: "Health & Fitness",
  fitness: "Health & Fitness",
  medical: "Health & Fitness",
  "health & fitness": "Health & Fitness",
  "health & wellness": "Health & Fitness",

  // Design & creative
  design: "Design & Color",
  "design tools": "Design & Color",
  art: "Design & Color",
  creative: "Design & Color",
  "3d": "Design & Color",
  creators: { generic: true, fallback: "Design & Color" },
  "content creation": { generic: true, fallback: "Design & Color" },

  // Marketing & social
  marketing: "Marketing & Social",
  "social media": "Marketing & Social",
  seo: "Marketing & Social",

  // Security
  security: "Security & Privacy",
  "cybersecurity tool": "Security & Privacy",
  privacy: "Security & Privacy",

  // Education & science
  education: "Education & Science",
  educational: "Education & Science",
  edtech: "Education & Science",
  science: "Education & Science",
  neuroscience: "Education & Science",
  psychology: "Education & Science",
  physics: "Education & Science",

  // Productivity & business
  productivity: "Productivity",
  planning: "Productivity",
  utility: { generic: true, fallback: "Productivity" },
  utilities: { generic: true, fallback: "Productivity" },
  business: "Business",
  startup: "Business",
  job: "Business",
  career: "Business",
  "e-commerce": "Business",
  "property management": "Business",

  // Lifestyle
  lifestyle: "Lifestyle",
  personal: "Lifestyle",
  home: "Lifestyle",
  "kitchen tools": "Lifestyle",
  food: "Lifestyle",
  beauty: "Lifestyle",
  fashion: "Lifestyle",
  style: "Lifestyle",
  astrology: "Lifestyle",
  "shopping tools": "Lifestyle",

  // Fun & games
  fun: "Fun",
  interactive: "Fun",
  "optical illusions": "Fun",
  simulation: "Fun",
  "visual experiments": "Fun",
  entertainment: { generic: true, fallback: "Fun" },
  game: "Games",
  games: "Games",
  card: "Games",

  other: "Other",
};

/**
 * Slug-level overrides for tools whose configs are plainly mislabeled
 * (e.g. PDF tools tagged only "Web"). Prepended to the resolved list.
 */
export const SLUG_CATEGORY_OVERRIDES = {
  "pdf-annotation": "PDF & Documents",
  "pdf-merger": "PDF & Documents",
  "pdf-purifier": "PDF & Documents",
  "pdf-to-image-converter": "PDF & Documents",
};

const FINANCE_HINTS = new Set(["finance", "financial tools", "business", "startup"]);
const HEALTH_HINTS = new Set(["health", "fitness", "medical", "health & fitness", "health & wellness"]);

export function slugifyCategory(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolve a tool's raw category list into canonical categories + topics.
 *
 * @param {string|string[]} rawCategory value(s) from tool.config.js
 * @param {string} slug tool slug (for overrides / error messages)
 * @returns {{ categories: string[], topics: string[] }}
 * @throws {Error} on a raw value missing from CATEGORY_ALIASES
 */
export function resolveToolCategories(rawCategory, slug = "") {
  const rawList = (Array.isArray(rawCategory) ? rawCategory : [rawCategory])
    .map((value) => String(value ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const canonical = [];
  const fallbacks = [];
  let wantsCalculator = false;

  const push = (label) => {
    if (label && !canonical.includes(label)) canonical.push(label);
  };

  if (SLUG_CATEGORY_OVERRIDES[slug]) push(SLUG_CATEGORY_OVERRIDES[slug]);

  const rawLower = rawList.map((value) => value.toLowerCase());

  for (const value of rawList) {
    const alias = CATEGORY_ALIASES[value.toLowerCase()];
    if (alias === undefined) {
      throw new Error(
        `Unknown tool category "${value}"${slug ? ` on "${slug}"` : ""}. ` +
          `Add it to CATEGORY_ALIASES in src/platform/registry/categoryTaxonomy.js ` +
          `or use one of: ${CANONICAL_LABELS.join(", ")}.`,
      );
    }
    if (alias === CALC) {
      wantsCalculator = true;
    } else if (typeof alias === "string") {
      push(alias);
    } else if (alias.generic) {
      fallbacks.push(alias.fallback);
    }
  }

  if (wantsCalculator) {
    if (rawLower.some((value) => HEALTH_HINTS.has(value))) push("Health Calculators");
    else if (rawLower.some((value) => FINANCE_HINTS.has(value))) push("Finance Calculators");
    else push("Calculators");
  }

  if (!canonical.length) {
    for (const fallback of fallbacks) push(fallback);
  }
  if (!canonical.length) push("Other");

  // Preserve original values (minus exact canonical duplicates) so search
  // and related-tools keep their signal; these render as sub-category chips.
  const topics = [];
  for (const value of rawList) {
    if (CANONICAL_LABEL_SET.has(value.toLowerCase())) continue;
    if (!topics.some((topic) => topic.toLowerCase() === value.toLowerCase())) topics.push(value);
  }

  return { categories: canonical, topics };
}

/**
 * Legacy category-route slugs → canonical slug, for /tools/[category]
 * redirects (keeps old indexed URLs like /tools/calculator alive).
 */
export function getLegacyCategorySlugMap() {
  const map = {};
  for (const [raw, alias] of Object.entries(CATEGORY_ALIASES)) {
    const label = alias === CALC ? "Calculators" : typeof alias === "string" ? alias : alias.fallback;
    const from = slugifyCategory(raw);
    const to = slugifyCategory(label);
    if (from && from !== to && !CANONICAL_SLUG_TO_LABEL.has(from)) map[from] = to;
  }
  return map;
}

export function getCanonicalCategoryBySlug(slug) {
  return CANONICAL_CATEGORIES.find((entry) => entry.slug === slug) ?? null;
}
