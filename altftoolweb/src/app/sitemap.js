import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { slugifyCategory } from "@/platform/registry/categoryTaxonomy";
import { unstable_cache } from "next/cache";
import {
  blogTaxonomySlug,
  filterBlogsByCategorySlug,
  filterBlogsByTagSlug,
  getAllBlogTags,
  getAllBlogs,
  getBlogAuthors,
  getBlogCategories,
  getBlogTopicClusters,
} from "@/app/blogs/data";
import { fetchFirebaseBlogsPage } from "@/app/blogs/data/firebaseBlogs";
import { shouldNoindexBlogPost } from "@/app/blogs/utils/blogIndexPolicy";
import buySmartStores from "@/app/buysmart/data/stores.json";
import { getDeals } from "@/app/deals/data/deals";
import dealData from "@/app/exclusivedeals/(data)/db.json";
import { INCUMBENTS as alternativeIncumbents } from "@/app/alternatives/data/incumbents";
import { getIndexableTop9Items } from "@/app/top9/data/getTop9Items";
import wattpadBooks from "@/app/wattpad/data/books.json";
import wattpadCategories from "@/app/wattpad/data/categories.json";
import wattpadChapters from "@/app/wattpad/data/chapters.json";
import { fetchAllPublishedLanderSlugs } from "@/app/lander/data/firebaseLanders";
import {
  absoluteUrl,
  getSiteUrl,
  normalizeSlug,
} from "@/platform/seo/generateMetadata";
import { getAllGeoSlugs } from "@/platform/seo/geoLocations";
import { loadSeoConfig } from "@/platform/seo/seoConfigSource";
import { toXmlSafeSitemap } from "@/platform/seo/sitemapXml";
import { brandSlug } from "@/app/exclusivedeals/lib/brandSlug";
import { resolveSitemap } from "@altftool/core/seo/resolver";
import newsData from "../../public/data/newsdata.json";
import { TOOLS as altPdfTools } from "@/app/altflovepdf/toolsData";
import { CALCULATORS as altCalculators } from "@/app/altfcalculators/toolsData";
import { services as homeservServices } from "@/app/homeserv/services-data";
import { apps } from "@/app/apps/data/apps";
import { SIGNAL_CATALOG } from "@altftool/core/signals";
import { isSignalIndexable } from "@/app/signals/signalCoverage";
import { PRODUCT_SUITE_CATALOG } from "@altftool/core/product-suites";
import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";
import {
  getAllWorkflows,
  getAllNodes,
  getCategories as getN8nCategories,
} from "@/app/n8n/data/service";
import {
  CATEGORIES as altfNativeGameCategories,
  GAMES as altfNativeGames,
} from "@/app/altfgame/_data/games";
import { TOOLS as transformTools } from "@/app/transform/_lib/manifest";
import { EXAM_SPECS as examPhotoSpecs } from "@/app/exam-photo/data/examSpecs";
import { ALL_NAV_ITEMS as promptStudioItems } from "@/app/imgprompt/data/navigation";
import { getPromptCards } from "@/app/prompts/data/service";
import {
  getAllCategories as getFactNetCategories,
  getLatestArticles as getFactNetArticles,
} from "@/app/fact-net/data/factNetData";
import { TEMPLATES as socialMockupTemplates } from "@/app/prank-socialmedia/lib/templates";
import { getAllKymRoutes } from "@/app/kym/components/KymGenericPage";
import { isKymIndexable } from "@/app/kym/data/indexPolicy";
import { pranks as pranxExperiences } from "@/app/pranx/data/pranxData";
import { sitemapPages as tripFindBoxPages } from "@/app/bops/tripfindbox/lib/sitemapPages";
import { HN_CATEGORIES } from "@/app/bops/housingneeds/_data/categories";
import { BOPS_COLLECTIONS } from "@/app/bops/_data/collections";
import { INSTRUMENTS as tradeonInstruments } from "@/app/tradeon/lib/instruments";
import {
  assetHref as tradeonAssetHref,
  chartHref as tradeonChartHref,
} from "@/app/tradeon/lib/format";

export const revalidate = 3600;

// These registry entries redirect to /bops/housing-services#<slug>. Keep the
// guides available to the dashboard, but never advertise redirecting URLs in
// the sitemap.
const HN_REDIRECTED_GUIDE_SLUGS = new Set(["bathroom", "hvac"]);

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/tools", priority: 0.95 },
  { path: "/alternatives", priority: 0.7 },
  { path: "/transform", priority: 0.7 },
  { path: "/exam-photo", priority: 0.7 },
  { path: "/signals", priority: 0.88 },
  { path: "/products", priority: 0.9 },
  { path: "/blogs", priority: 0.9 },
  { path: "/blogs/topics", priority: 0.72 },
  { path: "/buysmart", priority: 0.85 },
  { path: "/buysmart/view-all", priority: 0.75 },
  { path: "/extensions", priority: 0.8 },
  { path: "/embed", priority: 0.75 },
  { path: "/apps", priority: 0.78 },
  { path: "/desktop", priority: 0.7 },
  { path: "/fullscrn", priority: 0.65 },
  { path: "/search-eng", priority: 0.65 },
  // /top11 is deliberately absent: the hub and all ten of its categories are
  // noindexed (see app/top11/data/indexPolicy.js), and a noindexed URL must
  // not be submitted. The gated loop further down covers the categories; this
  // is the hub. /kym is absent for the same reason and never appeared here.
  { path: "/top9", priority: 0.68 },
  { path: "/top10", priority: 0.68 },
  { path: "/labs", priority: 0.66 },
  { path: "/licenses", priority: 0.3 },
  // Reference pages built for other people to link to: the open-data terms and
  // field documentation for the two public JSON endpoints, and the media kit.
  // The endpoints themselves live under /api/ and are deliberately absent —
  // robots.txt disallows /api/, and submitting a disallowed URL is a
  // contradiction. /open-data is the crawlable, citable surface for them.
  { path: "/open-data", priority: 0.55 },
  { path: "/press", priority: 0.45 },
  { path: "/ancestory/meaning", priority: 0.56 },
  { path: "/fact-net/categories", priority: 0.62 },
  { path: "/fact-net/listings", priority: 0.62 },
  { path: "/pixel-thought/meditation", priority: 0.54 },
  { path: "/prank-socialmedia/templates", priority: 0.58 },
  { path: "/windowswap/pricing", priority: 0.45 },
  // Four routes were indexable, self-canonical and substantial, yet published
  // nowhere — checked live on 2026-07-31, each 200 with `index, follow` and its
  // own canonical. Three had their PARENT in this file but not themselves,
  // which is the tell that they were missed rather than withheld:
  // /altpintrest is here and /altpintrest/explore was not, /playbuzz is here
  // and /playbuzz/quiz-play was not, /windowswap/pricing is here and
  // /windowswap/sendGift was not. /altflinking had no entry at all despite
  // being a hub that carries its own SoftwareApplication JSON-LD.
  //
  // Priorities follow the neighbours: a hub at 0.7, a secondary page under an
  // existing hub at 0.45, matching /windowswap/pricing directly above.
  //
  // /smartlink is deliberately still absent — it is noindex, nofollow (verified
  // live), and a noindexed URL must not be submitted.
  { path: "/altflinking", priority: 0.7 },
  { path: "/altpintrest/explore", priority: 0.45 },
  { path: "/playbuzz/quiz-play", priority: 0.45 },
  { path: "/windowswap/sendGift", priority: 0.45 },
  { path: "/trendingvids", priority: 0.7 },
  { path: "/news", priority: 0.7 },
  { path: "/news/headlines", priority: 0.6 },
  { path: "/news/local", priority: 0.6 },
  { path: "/news/newsletter", priority: 0.48 },
  { path: "/news/topics", priority: 0.6 },
  { path: "/news/trending", priority: 0.6 },
  { path: "/brandrating", priority: 0.7 },
  { path: "/deals", priority: 0.85 },
  { path: "/exclusivedeals", priority: 0.85 },
  { path: "/exclusivedeals/all-stores", priority: 0.75 },
  { path: "/exclusivedeals/store", priority: 0.7 },
  { path: "/academy", priority: 0.6 },
  { path: "/sale", priority: 0.7 },
  { path: "/status", priority: 0.45 },
  { path: "/docs", priority: 0.58 },
  { path: "/free-ai-tool", priority: 0.66 },
  { path: "/supportsetting", priority: 0.45 },
  { path: "/request-a-tool", priority: 0.5 },
  { path: "/site-map", priority: 0.5 },
  // The seven /altfworld URLs are deliberately absent: the section is a
  // display-only demo whose members, threads, listings and resources are all
  // generated (see altfworld/data/mockCommunity.js), so every route under it is
  // noindex via altfworld/seo.js and a noindexed URL must not be submitted.
  { path: "/imgprompt", priority: 0.76 },
  { path: "/imgprompt/studio", priority: 0.66 },
  { path: "/n8n", priority: 0.76 },
  { path: "/tradeon", priority: 0.76 },
  { path: "/tradeon/dashboard", priority: 0.66 },
  { path: "/tradeon/workspace", priority: 0.66 },
  { path: "/prompts", priority: 0.76 },
  { path: "/prompts/seedream-5-pro", priority: 0.7 },
  { path: "/policypages/about", priority: 0.35 },
  { path: "/policypages/affiliate", priority: 0.35 },
  { path: "/policypages/contact", priority: 0.35 },
  { path: "/policypages/cookie", priority: 0.25 },
  { path: "/policypages/disclaimer", priority: 0.25 },
  { path: "/policypages/faq", priority: 0.35 },
  { path: "/policypages/privacy", priority: 0.25 },
  { path: "/policypages/termsandconditions", priority: 0.25 },

  // --- ALTF Love IMG (browser image tools) ---
  { path: "/altfloveimg", priority: 0.7 },
  { path: "/altfloveimg/compress", priority: 0.64 },
  { path: "/altfloveimg/resize", priority: 0.64 },
  { path: "/altfloveimg/crop", priority: 0.62 },
  { path: "/altfloveimg/rotate", priority: 0.6 },
  { path: "/altfloveimg/jpg-to-png", priority: 0.6 },
  { path: "/altfloveimg/png-to-jpg", priority: 0.6 },
  { path: "/altfloveimg/webp-to-jpg", priority: 0.6 },
  { path: "/altfloveimg/jpg-to-webp", priority: 0.6 },
  { path: "/altfloveimg/watermark", priority: 0.6 },
  { path: "/altfloveimg/editor", priority: 0.62 },
  { path: "/altfloveimg/meme", priority: 0.58 },
  { path: "/altfloveimg/background-remover", priority: 0.62 },
  { path: "/altfloveimg/upscaler", priority: 0.62 },

  // --- Altf Love PDF (browser PDF tools) ---
  { path: "/altflovepdf", priority: 0.7 },

  // --- AltF Calculators ---
  { path: "/altfcalculators", priority: 0.78 },

  // --- QuoteNest Pros (homeserv) ---
  { path: "/homeserv", priority: 0.62 },
  { path: "/homeserv/contact-us", priority: 0.4 },
  { path: "/homeserv/privacy-policy", priority: 0.3 },
  { path: "/homeserv/terms-of-use", priority: 0.3 },

  // --- TripFindBox (travel) ---

  // --- Business Ops ---
  { path: "/bops/housing-services", priority: 0.68 },
  { path: "/bops/tripfindbox", priority: 0.68 },
  { path: "/bops/tripfindbox/about-us", priority: 0.45 },
  { path: "/bops/tripfindbox/blogs", priority: 0.6 },
  { path: "/bops/tripfindbox/contact-us", priority: 0.4 },
  { path: "/bops/tripfindbox/privacy-policy", priority: 0.3 },
  { path: "/bops/tripfindbox/terms-and-conditions", priority: 0.3 },
  { path: "/bops/tripfindbox/site-map", priority: 0.4 },

  // --- Housing Needs ---
  // Legacy /housingneeds/* URLs redirect permanently in next.config.mjs. The
  // canonical guides are added from HN_CATEGORIES below, excluding redirects.
  { path: "/bops/housingneeds", priority: 0.72 },
  // /siding is absent: it duplicates the /bops/housing-services/siding-pros
  // lander, which is noindex like all 39 of its siblings, and this copy is
  // now noindex too. A noindexed URL must not be submitted.
];

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const FIREBASE_PROJECT_ROOT = "projects/altftool";
const SEO_FIREBASE_BLOG_LIMIT = 500;
const SEO_FIREBASE_PAGE_SIZE = 100;
const SEO_FIRESTORE_LIST_TIMEOUT_MS = 3500;

function safeDate(value) {
  if (!value) return undefined;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value?.seconds === "number") {
    const date = new Date(value.seconds * 1000);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function sitemapEntry(path, options = {}) {
  const lastModified = safeDate(options.lastModified);
  const entry = {
    url: `${getSiteUrl()}${path}`,
    changeFrequency: options.changeFrequency || "weekly",
    priority: options.priority ?? 0.6,
  };
  if (lastModified) {
    entry.lastModified = lastModified;
  }
  // Image sitemap support (Next.js MetadataRoute.Sitemap `images` field).
  if (Array.isArray(options.images) && options.images.length) {
    entry.images = options.images;
  }
  return entry;
}

// ALTF Engine: central SEO config for this sitemap build (null = inert).
let activeSeoConfig = null;

function pushUnique(entries, seen, path, options) {
  if (!path || seen.has(path)) return;

  let opts = options;
  if (activeSeoConfig) {
    try {
      const sm = resolveSitemap(activeSeoConfig, { path });
      if (sm && sm.include === false) return; // excluded by central config
      if (sm && (sm.priority !== undefined || sm.changeFreq !== undefined)) {
        opts = {
          ...options,
          priority: sm.priority !== undefined ? sm.priority : options?.priority,
          changeFrequency:
            sm.changeFreq !== undefined
              ? sm.changeFreq
              : options?.changeFrequency,
        };
      }
    } catch {
      opts = options; // never let the engine break sitemap generation
    }
  }

  seen.add(path);
  entries.push(sitemapEntry(path, opts));
}

function firestoreCollectionUrl(path, pageSize = 100) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`,
  );
  url.searchParams.set("key", FIREBASE_API_KEY);
  url.searchParams.set("pageSize", String(pageSize));
  return url.toString();
}

function firestoreValueToJs(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(firestoreValueToJs);
  }
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, nestedValue]) => [
        key,
        firestoreValueToJs(nestedValue),
      ]),
    );
  }
  return undefined;
}

function decodeFirestoreDocument(document) {
  return {
    id: document.name?.split("/").pop() || "",
    ...Object.fromEntries(
      Object.entries(document.fields || {}).map(([key, value]) => [
        key,
        firestoreValueToJs(value),
      ]),
    ),
  };
}

async function listPublicFirestoreDocs(path, pageSize = 100) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    SEO_FIRESTORE_LIST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(firestoreCollectionUrl(path, pageSize), {
      next: { revalidate },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return [];
    return (payload.documents || []).map(decodeFirestoreDocument);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFirebaseBlogsForSeo(maxPosts = SEO_FIREBASE_BLOG_LIMIT) {
  const pageSize = SEO_FIREBASE_PAGE_SIZE;
  const posts = [];
  let offset = 0;

  while (posts.length < maxPosts) {
    const rows = await fetchFirebaseBlogsPage({
      pageSize: Math.min(pageSize, maxPosts - posts.length),
      offset,
      includeDescription: false,
    }).catch(() => []);

    if (!rows.length) break;
    posts.push(...rows);
    if (rows.length < pageSize) break;
    offset += rows.length;
  }

  return posts;
}

async function getLiveSitemapCollections() {
  const [
    firebaseBlogs,
    extensions,
    brandCategories,
    brandSubcategories,
    brands,
    landers,
  ] = await Promise.all([
    fetchFirebaseBlogsForSeo(),
    listPublicFirestoreDocs(`${FIREBASE_PROJECT_ROOT}/extensions`, 100),
    listPublicFirestoreDocs(
      `${FIREBASE_PROJECT_ROOT}/consumerrating/data/categories`,
      100,
    ),
    listPublicFirestoreDocs(
      `${FIREBASE_PROJECT_ROOT}/consumerrating/data/subcategories`,
      100,
    ),
    listPublicFirestoreDocs(
      `${FIREBASE_PROJECT_ROOT}/consumerrating/data/brands`,
      100,
    ),
    fetchAllPublishedLanderSlugs(),
  ]);

  return {
    firebaseBlogs,
    extensions,
    brandCategories,
    brandSubcategories,
    brands,
    landers,
  };
}

const EMPTY_LIVE_COLLECTIONS = Object.freeze({
  firebaseBlogs: [],
  extensions: [],
  brandCategories: [],
  brandSubcategories: [],
  brands: [],
  landers: [],
});

async function buildSitemapEntries({
  includeLiveCollections = true,
  includeSeoConfig = true,
} = {}) {
  const entries = [];
  const seen = new Set();
  // ALTF Engine: load central config once per build. Returns an empty/disabled
  // config (inert) unless the engine is enabled, so output is unchanged by default.
  activeSeoConfig = includeSeoConfig
    ? await loadSeoConfig().catch(() => null)
    : null;
  const liveCollections = includeLiveCollections
    ? await getLiveSitemapCollections()
    : EMPTY_LIVE_COLLECTIONS;
  const sitemapBlogs = [...getAllBlogs(), ...liveCollections.firebaseBlogs];

  for (const route of staticRoutes) {
    pushUnique(entries, seen, route.path, {
      priority: route.priority,
      changeFrequency: route.path === "/" ? "daily" : "weekly",
    });
  }

  for (const category of HN_CATEGORIES) {
    for (const page of category.pages.filter((item) =>
      item.tags?.includes("Guide"),
    )) {
      if (HN_REDIRECTED_GUIDE_SLUGS.has(page.slug)) continue;
      pushUnique(entries, seen, page.href, {
        priority: 0.8,
        changeFrequency: "monthly",
      });
    }
  }

  // Business Ops collections — the Insurance and Loans hubs and their
  // standalone vertical landing pages (hrefs come from the registry).
  for (const collection of Object.values(BOPS_COLLECTIONS)) {
    pushUnique(entries, seen, `/bops/${collection.slug}`, {
      priority: 0.7,
      changeFrequency: "weekly",
    });
    // Collections flagged noindexPages hold provider-style landers whose
    // layouts set robots:noindex — keep those out of the sitemap.
    if (collection.noindexPages) continue;
    for (const page of collection.pages) {
      // Individual pages can also be noindex landers.
      if (page.noindex) continue;
      pushUnique(entries, seen, page.href, {
        priority: 0.7,
        changeFrequency: "monthly",
      });
    }
  }

  for (const instrument of tradeonInstruments) {
    pushUnique(entries, seen, tradeonAssetHref(instrument.symbol), {
      priority: 0.58,
      changeFrequency: instrument.binance ? "daily" : "weekly",
    });
    pushUnique(entries, seen, tradeonChartHref(instrument.symbol), {
      priority: 0.52,
      changeFrequency: instrument.binance ? "daily" : "weekly",
    });
  }

  for (const suite of PRODUCT_SUITE_CATALOG) {
    pushUnique(entries, seen, `/products/${suite.slug}`, {
      priority: suite.status === "working" ? 0.82 : 0.72,
      changeFrequency: "weekly",
    });
  }

  for (const experience of EXPERIENCE_CATALOG) {
    // EXPERIENCE_CATALOG powers navigation, including live experiences that
    // are intentionally noindexed. Apply the KYM family's indexing policy here
    // too so the catalogue loop cannot silently re-add its hub after the
    // dedicated, policy-gated KYM loop below excludes it.
    if (experience.href === "/kym" && !isKymIndexable(experience.href)) continue;
    pushUnique(entries, seen, experience.href, {
      priority: experience.priority,
      changeFrequency: "monthly",
    });
  }

  for (const entry of Object.values(alternativeIncumbents)) {
    if (entry?.slug) {
      pushUnique(entries, seen, `/alternatives/${entry.slug}`, {
        priority: 0.62,
        changeFrequency: "monthly",
      });
    }
  }

  for (const tool of transformTools) {
    if (tool?.slug) {
      pushUnique(entries, seen, `/transform/${tool.slug}`, {
        priority: 0.58,
        changeFrequency: "monthly",
      });
    }
  }

  // One page per exam. These answer a narrow, high-intent question ("what photo
  // size does SSC CGL want") from a named notification, and the figures change
  // when the conducting body issues a new one — hence the monthly frequency.
  for (const exam of examPhotoSpecs) {
    if (exam?.slug) {
      pushUnique(entries, seen, `/exam-photo/${exam.slug}`, {
        priority: 0.66,
        changeFrequency: "monthly",
      });
    }
  }

  for (const category of altfNativeGameCategories) {
    pushUnique(entries, seen, `/altfgame/category/${category.slug}`, {
      priority: 0.58,
      changeFrequency: "monthly",
    });
  }

  for (const game of altfNativeGames) {
    pushUnique(entries, seen, `/altfgame/${game.slug}`, {
      priority: 0.62,
      changeFrequency: "monthly",
      images: game.image ? [absoluteUrl(game.image)] : undefined,
    });
  }

  for (const item of promptStudioItems.filter((entry) =>
    ["core", "model", "category"].includes(entry.kind),
  )) {
    pushUnique(entries, seen, `/imgprompt/studio/${item.slug}`, {
      priority: item.kind === "core" ? 0.64 : 0.56,
      changeFrequency: "monthly",
    });
  }

  const toolCategories = new Set(["all"]);
  for (const tool of Object.values(toolMetaMap)) {
    const categories = Array.isArray(tool.category)
      ? tool.category
      : [tool.category];
    // Must match the /tools/[category] route slugs (slugifyCategory), not
    // normalizeSlug — the two disagree on "&" ("design-color" vs "design-and-color").
    categories
      .filter(Boolean)
      .forEach((category) => toolCategories.add(slugifyCategory(category)));
  }

  for (const category of [...toolCategories].sort()) {
    pushUnique(entries, seen, `/tools/${category}`, {
      priority: category === "all" ? 0.9 : 0.72,
      changeFrequency: "weekly",
    });
  }

  // Only the canonical /tools/all/<slug> URL goes in the sitemap.
  // The /tools/<category>/<slug> route still works for users but it canonicalises
  // to /tools/all/<slug>; listing it caused the "Alternative page with proper
  // canonical tag" duplicates, so it is intentionally excluded here.
  for (const slug of Object.keys(toolMetaMap)) {
    pushUnique(entries, seen, `/tools/all/${slug}`, {
      priority: 0.78,
      changeFrequency: "monthly",
    });
  }

  for (const signal of SIGNAL_CATALOG) {
    // Signals with no working tool behind them are noindex; submitting a
    // noindexed URL is a contradiction Google reports as an error.
    if (!isSignalIndexable(signal.slug)) continue;
    pushUnique(entries, seen, `/signals/${signal.slug}`, {
      priority: 0.74,
      changeFrequency: "weekly",
    });
  }

  for (const blog of getAllBlogs()) {
    if (shouldNoindexBlogPost(blog.slug)) continue;
    pushUnique(entries, seen, `/blogs/${blog.slug}`, {
      lastModified: blog.date ? new Date(blog.date) : undefined,
      priority: 0.7,
      changeFrequency: "monthly",
      images: blog.image ? [absoluteUrl(blog.image)] : undefined,
    });
  }

  for (const blog of liveCollections.firebaseBlogs) {
    if (blog?.slug && !shouldNoindexBlogPost(blog.slug)) {
      pushUnique(entries, seen, `/blogs/${blog.slug}`, {
        lastModified:
          blog.updatedAt || blog.date
            ? new Date(blog.updatedAt || blog.date)
            : undefined,
        priority: 0.72,
        changeFrequency: "weekly",
        images: blog.image ? [absoluteUrl(blog.image)] : undefined,
      });
    }
  }

  for (const lander of liveCollections.landers) {
    if (!lander?.slug || lander.noIndex) continue;
    pushUnique(entries, seen, `/lander/${normalizeSlug(lander.slug)}`, {
      lastModified: lander.updatedAt
        ? new Date(lander.updatedAt)
        : undefined,
      priority: 0.62,
      changeFrequency: "monthly",
    });
  }

  // GEO landing pages (Entity SEO) — every registry location, plus the hub.
  // Adding a location to src/platform/seo/geoLocations.js adds it here too.
  pushUnique(entries, seen, "/locations", {
    priority: 0.6,
    changeFrequency: "weekly",
  });
  for (const geo of getAllGeoSlugs()) {
    pushUnique(entries, seen, `/locations/${geo}`, {
      priority: 0.55,
      changeFrequency: "monthly",
    });
  }

  for (const category of getBlogCategories(sitemapBlogs).filter(
    (item) => item !== "All",
  )) {
    const categorySlug = blogTaxonomySlug(category);
    if (
      categorySlug &&
      filterBlogsByCategorySlug(sitemapBlogs, categorySlug).length >= 2
    ) {
      pushUnique(entries, seen, `/blogs/category/${categorySlug}`, {
        priority: 0.66,
        changeFrequency: "weekly",
      });
    }
  }

  for (const tag of getAllBlogTags(sitemapBlogs)) {
    const tagSlug = blogTaxonomySlug(tag);
    if (
      tagSlug &&
      filterBlogsByTagSlug(sitemapBlogs, tagSlug).length >= 2
    ) {
      pushUnique(entries, seen, `/blogs/tag/${tagSlug}`, {
        priority: 0.54,
        changeFrequency: "weekly",
      });
    }
  }

  for (const author of getBlogAuthors(sitemapBlogs)) {
    if (author?.slug && Number(author.postCount || author.posts?.length) >= 2) {
      pushUnique(entries, seen, `/blogs/author/${author.slug}`, {
        lastModified: author.lastUpdated
          ? new Date(author.lastUpdated)
          : undefined,
        priority: 0.56,
        changeFrequency: "weekly",
      });
    }
  }

  for (const cluster of getBlogTopicClusters(sitemapBlogs)) {
    pushUnique(entries, seen, `/blogs/topics/${cluster.slug}`, {
      priority: cluster.postCount > 0 ? 0.62 : 0.54,
      changeFrequency: "weekly",
    });
  }

  for (const extension of liveCollections.extensions) {
    const slug = normalizeSlug(extension.slug || extension.id);
    if (slug) {
      pushUnique(entries, seen, `/extensions/${slug}`, {
        lastModified:
          extension.updatedAt || extension.createdAt
            ? new Date(extension.updatedAt || extension.createdAt)
            : undefined,
        priority: 0.62,
        changeFrequency: "weekly",
      });
    }
  }

  for (const app of apps || []) {
    if (app?.slug) {
      pushUnique(entries, seen, `/apps/${app.slug}`, {
        lastModified: app.lastUpdated ? new Date(app.lastUpdated) : undefined,
        priority: 0.66,
        changeFrequency: "monthly",
      });
    }
  }

  const brandCategoryById = new Map(
    liveCollections.brandCategories
      .filter((category) => category?.id && category?.name)
      .map((category) => [category.id, category]),
  );
  const brandSubcategoryById = new Map(
    liveCollections.brandSubcategories
      .filter((subcategory) => subcategory?.id && subcategory?.name)
      .map((subcategory) => [subcategory.id, subcategory]),
  );

  for (const subcategory of liveCollections.brandSubcategories) {
    const category = brandCategoryById.get(subcategory.categoryId);
    const categorySlug = normalizeSlug(category?.name);
    const subcategorySlug = normalizeSlug(subcategory?.name);

    if (categorySlug && subcategorySlug) {
      pushUnique(
        entries,
        seen,
        `/brandrating/${categorySlug}/${subcategorySlug}`,
        {
          lastModified:
            subcategory.updatedAt || subcategory.createdAt
              ? new Date(subcategory.updatedAt || subcategory.createdAt)
              : undefined,
          priority: 0.62,
          changeFrequency: "weekly",
        },
      );
    }
  }

  for (const brand of liveCollections.brands) {
    const category = brandCategoryById.get(brand.categoryId);
    const subcategory = brandSubcategoryById.get(brand.subCategoryId);
    const categorySlug = normalizeSlug(category?.name);
    const subcategorySlug = normalizeSlug(subcategory?.name);
    const brandSlug = normalizeSlug(brand?.name);

    if (categorySlug && subcategorySlug && brandSlug) {
      pushUnique(
        entries,
        seen,
        `/brandrating/${categorySlug}/${subcategorySlug}/${brandSlug}`,
        {
          lastModified:
            brand.updatedAt || brand.createdAt
              ? new Date(brand.updatedAt || brand.createdAt)
              : undefined,
          priority: 0.58,
          changeFrequency: "weekly",
        },
      );
    }
  }

  for (const store of buySmartStores) {
    if (store?.slug) {
      pushUnique(entries, seen, `/buysmart/stores/${store.slug}`, {
        priority: 0.68,
        changeFrequency: "weekly",
      });
    }
  }

  // /deals/<slug> pages are submitted again. They used to be skipped because
  // they duplicated /tools/all/<slug> and canonicalised there; they are now
  // dated price comparisons against named paid products, which the tool page
  // does not carry, and the canonical override in the deals route has been
  // removed so each page is self-canonical. Both changes must stay together: a
  // page that canonicalises away must never be submitted.
  for (const deal of getDeals() || []) {
    if (!deal?.slug) continue;
    pushUnique(entries, seen, `/deals/${deal.slug}`, {
      priority: 0.7,
      changeFrequency: "monthly",
    });
  }

  for (const category of dealData.categories || []) {
    if (!category?.slug) continue;

    pushUnique(entries, seen, `/exclusivedeals/${category.slug}`, {
      priority: 0.72,
      changeFrequency: "weekly",
    });

    for (const brand of category.brands || []) {
      // Key by slugified brand NAME, not brand.id. Every internal link builds
      // these URLs that way and BrandDetail resolves the last path segment by
      // matching slugified names — an id URL renders a permanent loading
      // skeleton at HTTP 200, i.e. a soft 404. This emitted 60 of them.
      const slug = brandSlug(brand?.brandName || brand?.name);
      if (!slug) continue;
      pushUnique(
        entries,
        seen,
        `/exclusivedeals/${category.slug}/${slug}`,
        {
          priority: 0.64,
          changeFrequency: "weekly",
        },
      );
      pushUnique(
        entries,
        seen,
        `/exclusivedeals/store/${category.slug}/${slug}`,
        {
          priority: 0.58,
          changeFrequency: "weekly",
        },
      );
    }
  }

  // A noindexed URL must never be submitted: Google reports that pairing as an
  // error and the submission is wasted crawl either way. The loop below asks
  // the same predicate the pages' own metadata asks, so the sitemap and the
  // robots directives cannot disagree. (The whole /top11 family is noindexed —
  // see app/top11/data/indexPolicy.js — so none of it is submitted at all.)

  // Only the lists that publish a ranking. The other 46 render a title and a
  // paragraph, are noindexed, and so are not submitted.
  for (const item of getIndexableTop9Items()) {
    pushUnique(entries, seen, `/top9/${item.slug}`, {
      lastModified: item.date ? new Date(item.date) : undefined,
      priority: 0.58,
      changeFrequency: "monthly",
    });
  }

  for (const category of wattpadCategories) {
    if (!category?.slug) continue;

    const categoryBookIds = new Set(
      wattpadBooks
        .filter((book) => book.categoryId === category.id)
        .map((book) => book.id),
    );
    const categoryHasChapters = wattpadChapters.some((chapter) =>
      categoryBookIds.has(chapter.bookId),
    );
    // Category metadata applies the same gate. Empty catalogue pages remain
    // reachable from the visual browser, but noindexed pages are not submitted.
    if (!categoryHasChapters) continue;

    pushUnique(entries, seen, `/wattpad/category/${category.slug}`, {
      lastModified: category.createdAt
        ? new Date(category.createdAt)
        : undefined,
      priority: 0.54,
      changeFrequency: "monthly",
    });
  }

  for (const book of wattpadBooks) {
    // A book with no chapters has nothing to read — the page is noindex, so it
    // must not be submitted either.
    const bookHasChapters = wattpadChapters.some(
      (chapter) => chapter.bookId === book?.id,
    );
    if (book?.slug && bookHasChapters) {
      pushUnique(entries, seen, `/wattpad/book/${book.slug}`, {
        lastModified: book.createdAt ? new Date(book.createdAt) : undefined,
        priority: 0.56,
        changeFrequency: "monthly",
      });
    }
  }

  const wattpadBooksById = new Map(
    wattpadBooks.map((book) => [book.id, book]),
  );
  for (const chapter of wattpadChapters) {
    const book = wattpadBooksById.get(chapter?.bookId);
    if (!book?.slug || !chapter?.chapterNumber) continue;
    pushUnique(
      entries,
      seen,
      `/wattpad/read/${book.slug}/${chapter.chapterNumber}`,
      {
        lastModified: chapter.createdAt
          ? new Date(chapter.createdAt)
          : undefined,
        priority: 0.5,
        changeFrequency: "monthly",
      },
    );
  }

  for (const article of newsData.news || []) {
    if (article?.slug) {
      pushUnique(entries, seen, `/news/${article.slug}`, {
        priority: 0.55,
        changeFrequency: "weekly",
      });
    }
  }

  // News topic pages are noindexed (client-loaded feeds, thin server content),
  // so they are intentionally excluded from the sitemap to save crawl budget.

  // Altf Love PDF tool pages (/altflovepdf/[toolSlug])
  for (const tool of altPdfTools || []) {
    if (tool?.slug) {
      pushUnique(entries, seen, `/altflovepdf/${tool.slug}`, {
        priority: 0.62,
        changeFrequency: "monthly",
      });
    }
  }

  // AltF Calculators tool pages (/altfcalculators/[toolSlug])
  for (const tool of altCalculators || []) {
    if (tool?.slug) {
      pushUnique(entries, seen, `/altfcalculators/${tool.slug}`, {
        priority: 0.68,
        changeFrequency: "monthly",
      });
    }
  }

  // QuoteNest Pros service pages (/homeserv/services/[slug])
  for (const service of homeservServices || []) {
    if (service?.slug) {
      pushUnique(entries, seen, `/homeserv/services/${service.slug}`, {
        priority: 0.55,
        changeFrequency: "monthly",
      });
    }
  }

  // FactNet category and article pages are owned, indexable content. Search
  // result permutations stay out of the sitemap to avoid thin crawl variants.
  for (const category of getFactNetCategories()) {
    if (category?.href) {
      pushUnique(entries, seen, category.href, {
        lastModified: category.lastmod ? new Date(category.lastmod) : undefined,
        priority: 0.58,
        changeFrequency: "weekly",
      });
    }
  }

  for (const article of getFactNetArticles(1000)) {
    if (article?.href) {
      pushUnique(entries, seen, article.href, {
        lastModified: article.lastmod ? new Date(article.lastmod) : undefined,
        priority: 0.52,
        changeFrequency: "monthly",
      });
    }
  }

  // Each Mockly editor is a complete client-side tool with a stable URL.
  for (const template of socialMockupTemplates) {
    if (template?.slug) {
      pushUnique(entries, seen, `/prank-socialmedia/editor/${template.slug}`, {
        priority: 0.56,
        changeFrequency: "monthly",
      });
    }
  }

  // Same rule as above: the meme-encyclopedia entries are noindexed because 35
  // of the 37 are assembled from eight shared templates, so none of them is
  // submitted. /kym itself was never in this file.
  for (const path of getAllKymRoutes()) {
    if (!isKymIndexable(path)) continue;
    pushUnique(entries, seen, path, {
      priority: 0.52,
      changeFrequency: "monthly",
    });
  }

  for (const experience of pranxExperiences) {
    if (experience?.slug) {
      pushUnique(entries, seen, `/pranx/${experience.slug}`, {
        priority: 0.54,
        changeFrequency: "monthly",
      });
    }
  }

  for (const page of tripFindBoxPages) {
    if (page?.slug) {
      pushUnique(entries, seen, `/bops/tripfindbox/${page.slug}`, {
        priority:
          page.section === "Top Cities" || page.section === "Top Airlines"
            ? 0.62
            : 0.52,
        changeFrequency: "monthly",
      });
    }
  }

  // Automation templates and their browse surfaces.
  for (const workflow of getAllWorkflows()) {
    if (workflow?.slug) {
      pushUnique(entries, seen, `/n8n/${workflow.slug}`, {
        priority: 0.62,
        changeFrequency: "monthly",
      });
    }
  }

  for (const category of getN8nCategories()) {
    if (category?.slug) {
      pushUnique(entries, seen, `/n8n/category/${category.slug}`, {
        priority: 0.58,
        changeFrequency: "monthly",
      });
    }
  }

  for (const node of getAllNodes()) {
    if (node?.slug) {
      pushUnique(entries, seen, `/n8n/node/${node.slug}`, {
        priority: 0.56,
        changeFrequency: "monthly",
      });
    }
  }

  // Prompt cards open within the library page; the library itself is canonical.
  if (getPromptCards().length) {
    pushUnique(entries, seen, "/prompts/seedream-5-pro", {
      priority: 0.7,
      changeFrequency: "weekly",
    });
  }

  return entries;
}

export const getSitemapEntries = unstable_cache(
  buildSitemapEntries,
  ["altftool-sitemap-entries-v4"],
  {
    revalidate: 3600,
    tags: ["altftool-sitemap-entries"],
  },
);

export const getStaticSearchSitemapEntries = unstable_cache(
  () =>
    buildSitemapEntries({
      includeLiveCollections: false,
      includeSeoConfig: false,
    }),
  ["altftool-static-search-sitemap-entries-v4"],
  {
    revalidate: 86400,
    tags: ["altftool-static-search-sitemap-entries"],
  },
);

export default async function sitemap() {
  // Escape only here, at the XML boundary. getSitemapEntries() must keep
  // returning raw URLs — /site-map and the search index render them as links.
  return toXmlSafeSitemap(await getSitemapEntries());
}
