import { resolveSeo, applyResolvedSeo, resolveExtendedMeta } from "@altftool/core/seo/resolver";
import { getSeoConfigSnapshot, primeSeoConfig } from "./seoConfigSource.js";
import { getGeoCountries } from "./geoLocations.js";
import { normalizeCanonicalUrl, resolveSiteUrl } from "./siteUrl.js";

export const siteConfig = {
  name: "AltFTool",
  shortName: "AltFTool",
  url: resolveSiteUrl(),
  description:
    "AltFTool is your online tools website with free tools, software, games, must-have Chrome extensions, and best web tools to boost productivity and fun.",
  logoPath: "/assets/logo3.png",
  defaultImagePath: "/assets/og-default.png",
  locale: "en_US",
  twitterHandle: "@altftool17279",
  sameAs: [
    "https://x.com/altftool17279",
    "https://www.facebook.com/profile.php?id=61586134133885",
    "https://www.instagram.com/altftools/",
    "https://www.threads.com/@altftools",
    "https://www.youtube.com/@AltFTool",
  ],
  keywords: [
    "AltFTool",
    "online tools",
    "free web tools",
    "micro tools",
    "developer tools",
    "PDF tools",
    "image tools",
    "productivity tools",
    "Chrome extensions",
    "digital toolkit",
  ],
  // Entity SEO: topics the brand is an authority on (Organization.knowsAbout).
  knowsAbout: [
    "online tools",
    "file converters",
    "PDF tools",
    "image editing tools",
    "developer tools",
    "calculators",
    "AI tools",
    "productivity software",
    "browser games",
    "Chrome extensions",
  ],
  contactPath: "/policypages/contact",
  // Optional Knowledge Graph signals — set via env when ready; omitted when empty.
  founderName: process.env.NEXT_PUBLIC_ORG_FOUNDER || "",
  foundingDate: process.env.NEXT_PUBLIC_ORG_FOUNDING_DATE || "",
  contactEmail: process.env.NEXT_PUBLIC_ORG_CONTACT_EMAIL || "",
};

export function getSiteUrl() {
  return siteConfig.url.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  if (!path) return getSiteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function trimMetaDescription(value = "", maxLength = 160) {
  const text = stripHtml(value);
  if (!text) return siteConfig.description;
  if (text.length < maxLength) return /[.!?]$/.test(text) ? text : `${text}.`;
  if (text.length === maxLength && /[.!?]$/.test(text)) return text;

  const clipped = text.slice(0, maxLength);
  const sentenceEnd = [...clipped.matchAll(/[.!?](?=\s|$)/g)]
    .map((match) => match.index)
    .filter((index) => index >= 80)
    .pop();

  if (sentenceEnd) return clipped.slice(0, sentenceEnd + 1).trim();

  const wordBoundary = clipped.lastIndexOf(" ");
  const tidy = (wordBoundary > 90 ? clipped.slice(0, wordBoundary) : clipped)
    .replace(/[,:;\-\s]+$/g, "")
    .trim();

  return /[.!?]$/.test(tidy) ? tidy : `${tidy}.`;
}

export function compactBrandedTitle(value = "", maxLength = 65) {
  const suffix = ` | ${siteConfig.name}`;
  const normalized = stripHtml(value)
    .replace(
      /(?:\s*(?:\||-|\u2013|\u2014)\s*)?AltFTool(?:\s+Blog)?\s*$/i,
      "",
    )
    // Stored seoTitles sometimes end with a stray separator ("Title |") \u2014
    // strip it so the brand suffix doesn't render as "Title | | AltFTool".
    .replace(/[\s|\-\u2013\u2014:]+$/g, "")
    .trim();
  const fallback = siteConfig.name;
  const base = normalized || fallback;

  if (base === fallback) return fallback;
  if (`${base}${suffix}`.length <= maxLength) return `${base}${suffix}`;

  const available = Math.max(24, maxLength - suffix.length);
  const clipped = base.slice(0, available + 1);
  const wordBoundary = clipped.lastIndexOf(" ");
  const compactBase = (
    wordBoundary >= Math.floor(available * 0.65)
      ? clipped.slice(0, wordBoundary)
      : base.slice(0, available)
  )
    .replace(/[,:;\-\s]+$/g, "")
    .trim();

  return `${compactBase}${suffix}`;
}

function getWordCount(value = "") {
  const text = stripHtml(value);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

export function normalizeSlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Apply ALTF Engine central SEO config (if enabled) onto raw page args.
 *
 * Inheritance defaults ("fill") apply only where the page left a value
 * undefined; per-URL admin overrides ("force") win over page code. When the
 * engine is disabled or the snapshot is cold/empty, this returns the args
 * unchanged so output is byte-identical to the pre-engine behavior. Never
 * throws — metadata generation must not be able to fail because of the engine.
 *
 * `pageType` (taxonomy: "tools" | "blogs" | ...) is distinct from `type`
 * (the OpenGraph type: "website" | "article").
 */
function applyCentralSeo(args = {}) {
  const snapshot = getSeoConfigSnapshot();
  if (!snapshot) return args;
  try {
    const resolved = resolveSeo(snapshot, {
      path: args.path || "/",
      pageType: args.pageType,
      brandId: args.brandId,
    });
    return applyResolvedSeo(args, resolved);
  } catch {
    return args;
  }
}

/**
 * Resolve the central-config EXTENDED meta (OG/Twitter overrides, verification,
 * favicon, hreflang, JSON-LD) for a path. Returns empty maps when the engine is
 * disabled/cold so output stays byte-identical to the pre-engine behavior.
 */
function getExtendedMeta(path, brandId) {
  const empty = { og: {}, twitter: {}, verification: {}, favicon: null, baseUrl: null, hreflang: [], jsonLd: [] };
  const snapshot = getSeoConfigSnapshot();
  if (!snapshot) return empty;
  try {
    return resolveExtendedMeta(snapshot, { path: path || "/", brandId });
  } catch {
    return empty;
  }
}

/** Map verification tokens to the Next.js metadata.verification shape. */
function buildVerification(v) {
  if (!v || typeof v !== "object") return undefined;
  const out = {};
  if (v.google) out.google = v.google;
  if (v.yandex) out.yandex = v.yandex;
  const other = {};
  if (v.bing) other["msvalidate.01"] = v.bing;
  if (v.pinterest) other["p:domain_verify"] = v.pinterest;
  if (v.facebook) other["facebook-domain-verification"] = v.facebook;
  if (Object.keys(other).length) out.other = other;
  return Object.keys(out).length ? out : undefined;
}

function resolveDocumentTitle(title) {
  if (typeof title !== "string") return title;

  // Editors sometimes save seoTitles that end mid-suffix ("Title |") or that
  // arrive with a doubled separator from upstream config merges. Collapse
  // repeated pipes and strip orphan trailing separators so the layout's
  // "%s | AltFTool" template can't render "Title | | AltFTool".
  const normalizedTitle = title
    .trim()
    .replace(/(?:\s*\|\s*){2,}/g, " | ")
    .replace(/[\s|–—:-]+$/g, "")
    .trim();
  const hasLeadingBrand = /^AltFTool(?:\b|\s*[-:|\u2013\u2014])/i.test(
    normalizedTitle,
  );
  const hasTrailingBrand =
    /(?:\||-|\u2013|\u2014|:)\s*AltFTool(?:\s+[A-Za-z][\w-]*)*\s*$/i.test(
      normalizedTitle,
    );

  return hasLeadingBrand || hasTrailingBrand
    ? { absolute: normalizedTitle }
    : normalizedTitle;
}

export async function createPageMetadata(rawArgs = {}) {
  // A cold Firestore read must not hold the first page response hostage. The
  // prime helper waits fully during builds, but uses a small runtime budget and
  // lets the shared snapshot finish refreshing in the background.
  await primeSeoConfig();
  const {
    title,
    description = siteConfig.description,
    path = "/",
    image,
    keywords = [],
    type = "website",
    noindex = false,
    follow = true,
    canonical,
    imageAlt,
    category = "technology",
    publishedTime,
    modifiedTime,
    authors,
  } = applyCentralSeo(rawArgs);
  const url = normalizeCanonicalUrl(canonical || path, path, getSiteUrl());
  const imageUrl = absoluteUrl(image || siteConfig.defaultImagePath);
  const cleanDescription = trimMetaDescription(description);
  const keywordList = [...new Set([...siteConfig.keywords, ...keywords].filter(Boolean))];
  const resolvedTitle = title || siteConfig.name;

  // Extended central-config overrides (inert/empty when engine disabled).
  const ext = getExtendedMeta(rawArgs.path || path, rawArgs.brandId);
  const ogImageUrl = ext.og?.image ? absoluteUrl(ext.og.image) : imageUrl;
  const twitterImageUrl = ext.twitter?.image ? absoluteUrl(ext.twitter.image) : ogImageUrl;

  const languages = { "x-default": url, en: url };
  for (const alt of ext.hreflang || []) {
    if (alt?.lang && alt?.href) languages[alt.lang] = absoluteUrl(alt.href);
  }

  const verification = buildVerification(ext.verification);
  const icons = ext.favicon ? { icon: absoluteUrl(ext.favicon) } : undefined;

  const metadata = {
    title: resolveDocumentTitle(resolvedTitle),
    description: cleanDescription,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: getSiteUrl() }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category,
    keywords: keywordList,
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: ext.og?.title || resolvedTitle,
      description: ext.og?.description ? trimMetaDescription(ext.og.description) : cleanDescription,
      url,
      siteName: ext.og?.siteName || siteConfig.name,
      type: ext.og?.type || type,
      locale: ext.og?.locale || siteConfig.locale,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt || ext.og?.title || resolvedTitle,
        },
      ],
    },
    twitter: {
      card: ext.twitter?.card || "summary_large_image",
      title: ext.twitter?.title || ext.og?.title || resolvedTitle,
      description: ext.twitter?.description
        ? trimMetaDescription(ext.twitter.description)
        : ext.og?.description
          ? trimMetaDescription(ext.og.description)
          : cleanDescription,
      site: ext.twitter?.site || siteConfig.twitterHandle,
      creator: ext.twitter?.creator || siteConfig.twitterHandle,
      images: [twitterImageUrl],
    },
    robots: {
      index: !noindex,
      follow,
      googleBot: {
        index: !noindex,
        follow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };

  if (type === "article") {
    if (publishedTime) metadata.openGraph.publishedTime = publishedTime;
    if (modifiedTime) metadata.openGraph.modifiedTime = modifiedTime;
    if (Array.isArray(authors) && authors.length) {
      metadata.openGraph.authors = authors
        .map((author) => (typeof author === "string" ? author : author?.url || author?.name))
        .filter(Boolean);
    }
  }

  if (verification) metadata.verification = verification;
  if (icons) metadata.icons = icons;

  return metadata;
}

/**
 * Brand entity (Knowledge Graph hub). Every other node references this via
 * `@id: …/#organization`, so publisher/provider/about relations across the
 * whole site resolve to ONE entity.
 *
 * GEO Entity SEO: `areaServed` lists the countries from the geo registry
 * (src/platform/seo/geoLocations.js), each disambiguated with Wikidata —
 * the legitimate, non-spam signal that associates the AltFTool brand with
 * those location entities ("AltFTool India", "AltFTool USA", …). Add a
 * location to the registry and this node updates automatically.
 */
export function createOrganizationJsonLd() {
  const logoUrl = absoluteUrl(siteConfig.logoPath);

  const node = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getSiteUrl()}/#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    legalName: siteConfig.name,
    description: siteConfig.description,
    url: getSiteUrl(),
    logo: {
      "@type": "ImageObject",
      "@id": `${getSiteUrl()}/#logo`,
      url: logoUrl,
      contentUrl: logoUrl,
      caption: siteConfig.name,
    },
    image: logoUrl,
    sameAs: siteConfig.sameAs,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
      logo: logoUrl,
    },
    knowsAbout: siteConfig.knowsAbout,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: absoluteUrl(siteConfig.contactPath),
      availableLanguage: ["English", "Hindi"],
    },
    areaServed: getGeoCountries().map((country) => ({
      "@type": "Country",
      name: country.name,
      sameAs: country.wikidata,
    })),
  };

  if (siteConfig.contactEmail) node.email = siteConfig.contactEmail;
  if (siteConfig.foundingDate) node.foundingDate = siteConfig.foundingDate;
  if (siteConfig.founderName) {
    node.founder = { "@type": "Person", name: siteConfig.founderName };
  }

  return node;
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: siteConfig.name,
    alternateName: `${siteConfig.name} — Free Online Tools`,
    description: siteConfig.description,
    url: getSiteUrl(),
    inLanguage: "en",
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function createBreadcrumbJsonLd(items = []) {
  const list = items
    .filter((item) => item?.name && item?.path)
    .map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    }));

  if (!list.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list,
  };
}

export function createToolJsonLd({ slug, tool, category = "all" } = {}) {
  if (!slug || !tool) return null;

  const categories = Array.isArray(tool.category)
    ? tool.category
    : [tool.category].filter(Boolean);

  const url = absoluteUrl(`/tools/${category || "all"}/${slug}`);
  const isGame = categories.some((value) => /^games?$/i.test(String(value).trim()));

  return {
    "@context": "https://schema.org",
    // Games get the VideoGame entity (rich results + AI answer engines);
    // VideoGame is itself a SoftwareApplication subtype.
    "@type": isGame ? ["VideoGame", "WebApplication"] : ["SoftwareApplication", "WebApplication"],
    "@id": `${absoluteUrl(`/tools/all/${slug}`)}#software`,
    name: tool.name || slug.replace(/-/g, " "),
    description: tool.description || siteConfig.description,
    url,
    applicationCategory: categories[0] || "WebApplication",
    applicationSubCategory: categories.slice(1).join(", ") || undefined,
    operatingSystem: "Web",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    isAccessibleForFree: true,
    inLanguage: "en",
    image: absoluteUrl(siteConfig.defaultImagePath),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    isPartOf: {
      "@id": `${getSiteUrl()}/#website`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export function createGameJsonLd({ game, path } = {}) {
  if (!game?.title || !path) return null;

  const url = absoluteUrl(path);
  const playCount = Number(game.plays || 0);

  return compactJsonLdObject({
    "@context": "https://schema.org",
    "@type": ["VideoGame", "WebApplication"],
    "@id": `${url}#game`,
    name: game.title,
    description: game.description || siteConfig.description,
    url,
    image: absoluteUrl(game.image || siteConfig.defaultImagePath),
    applicationCategory: "GameApplication",
    applicationSubCategory: game.category || undefined,
    genre: game.category || undefined,
    operatingSystem: "Web",
    gamePlatform: "Web browser",
    playMode:
      game.category === "Multiplayer"
        ? "https://schema.org/MultiPlayer"
        : "https://schema.org/SinglePlayer",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    isAccessibleForFree: true,
    inLanguage: "en",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    interactionStatistic: playCount
      ? {
          "@type": "InteractionCounter",
          interactionType: { "@type": "PlayAction" },
          userInteractionCount: playCount,
        }
      : undefined,
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  });
}

export function createBookJsonLd({ book, path } = {}) {
  if (!book?.title || !path) return null;

  const url = absoluteUrl(path);
  const reviewCount = Number(book.stats?.totalReviews || 0);
  const ratingValue = Number(book.stats?.rating || 0);
  const price = Number(book.price || 0);

  return compactJsonLdObject({
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${url}#book`,
    name: book.title,
    headline: book.title,
    description: book.description || book.summary || siteConfig.description,
    url,
    image: absoluteUrl(book.coverImage || book.bannerImage || siteConfig.defaultImagePath),
    author: {
      "@type": "Person",
      name: book.authorId || siteConfig.name,
    },
    genre: [book.categoryId, ...(book.tags || [])].filter(Boolean),
    inLanguage: book.language || "English",
    numberOfPages: Number(book.meta?.pages || 0) || undefined,
    datePublished: book.createdAt || undefined,
    isAccessibleForFree: Boolean(book.isFree || price === 0),
    aggregateRating:
      ratingValue > 0 && reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue,
            bestRating: 5,
            worstRating: 1,
            reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      price: String(price),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    potentialAction: {
      "@type": "ReadAction",
      target: url,
    },
  });
}

export function createFaqJsonLd({ path, questions = [] } = {}) {
  const mainEntity = questions
    .filter((item) => item?.question && item?.answer)
    .map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    }));

  if (!path || !mainEntity.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    mainEntity,
  };
}

export function createHowToJsonLd({ path, name, description, steps = [] } = {}) {
  const stepItems = steps
    .filter(Boolean)
    .map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    }));

  if (!path || !name || !stepItems.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${absoluteUrl(path)}#how-to`,
    name,
    description,
    step: stepItems,
  };
}

function compactJsonLdObject(value = {}) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => {
      if (item === undefined || item === null || item === "") return false;
      if (Array.isArray(item) && item.length === 0) return false;
      return true;
    }),
  );
}

function getBlogTags(value) {
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter(Boolean);

  return String(value || "")
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeCitationSource(source) {
  if (!source) return null;

  if (typeof source === "string") {
    const url = source.match(/https?:\/\/[^\s|]+/i)?.[0] || "";
    const title = source.replace(url, "").replace(/\|+/g, " ").trim() || url || source;

    return compactJsonLdObject({
      "@type": "CreativeWork",
      name: title,
      url: url || undefined,
    });
  }

  const title = source.title || source.name || source.label || source.url;
  const url = source.url || source.href;
  const publisher = source.publisher || source.site || source.source;

  return compactJsonLdObject({
    "@type": "CreativeWork",
    name: title,
    url,
    publisher: publisher
      ? {
          "@type": "Organization",
          name: publisher,
        }
      : undefined,
  });
}

function getBlogCitations(blog = {}) {
  const rawSources = Array.isArray(blog.sources)
    ? blog.sources
    : Array.isArray(blog.citations)
      ? blog.citations
      : Array.isArray(blog.references)
        ? blog.references
        : String(blog.sources || blog.citations || blog.references || "")
            .split(/\n+/)
            .filter(Boolean);

  return rawSources.map(normalizeCitationSource).filter((source) => source?.name || source?.url);
}

function createInteractionStatistic(type, count) {
  const value = Number(count || 0);
  if (!value) return null;

  return {
    "@type": "InteractionCounter",
    interactionType: { "@type": type },
    userInteractionCount: value,
  };
}

export function createBlogPostingJsonLd(blog) {
  if (!blog?.slug) return null;

  const title = blog.heading || blog.title;
  const path = `/blogs/${blog.slug}`;
  const content = blog.description || blog.content || blog.body || "";
  const description = trimMetaDescription(blog.seoDescription || blog.excerpt || stripHtml(content).slice(0, 180), 180);
  const wordCount = getWordCount(content);
  const tags = getBlogTags(blog.tags);
  const citations = getBlogCitations(blog);
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const imageUrl = absoluteUrl(blog.image || siteConfig.defaultImagePath);
  const authorName = blog.author || siteConfig.name;
  const reviewerName = blog.reviewedBy || "";
  const authorType = authorName && authorName !== siteConfig.name ? "Person" : "Organization";
  const about = [blog.category, blog.tool, blog.topic, ...tags]
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex((entry) => String(entry).toLowerCase() === String(item).toLowerCase()) === index)
    .slice(0, 12)
    .map((name) => ({ "@type": "Thing", name }));
  const interactionStatistic = [
    createInteractionStatistic("ReadAction", blog.views || blog.viewCount || blog.totalViews),
    createInteractionStatistic("LikeAction", blog.likesCount || blog.likes || blog.reactions),
    createInteractionStatistic("CommentAction", blog.commentsCount || blog.commentCount || blog.comments),
  ].filter(Boolean);
  const articleBody = stripHtml(content);

  return compactJsonLdObject({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(path)}#article`,
    url: absoluteUrl(path),
    headline: title,
    name: title,
    description,
    abstract: description,
    image: [
      compactJsonLdObject({
        "@type": "ImageObject",
        url: imageUrl,
        contentUrl: imageUrl,
        caption: blog.imageAlt || title,
        width: 1200,
        height: 630,
      }),
    ],
    thumbnailUrl: imageUrl,
    datePublished: blog.date,
    dateModified: blog.reviewedAt || blog.updatedAt || blog.date,
    articleSection: blog.category || "AltFTool guides",
    keywords: tags.length ? tags.join(", ") : undefined,
    citation: citations.length ? citations : undefined,
    about: about.length ? about : undefined,
    wordCount: wordCount || undefined,
    articleBody: articleBody ? articleBody.slice(0, 1200) : undefined,
    timeRequired: `PT${readTimeMinutes}M`,
    isAccessibleForFree: true,
    inLanguage: "en",
    accessMode: ["textual", "visual"],
    accessibilityFeature: ["alternativeText", "tableOfContents", "readingOrder"],
    accessibilityHazard: "none",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#blog-article-title", "#article-summary"],
    },
    isPartOf: {
      "@id": `${getSiteUrl()}/#website`,
    },
    author: compactJsonLdObject({
      "@type": authorType,
      name: authorName,
      jobTitle: blog.authorRole || undefined,
      url: authorType === "Person" ? absoluteUrl(`/blogs/author/${normalizeSlug(authorName)}`) : getSiteUrl(),
    }),
    reviewedBy: reviewerName
      ? compactJsonLdObject({
          "@type": /team|editorial|altftool/i.test(reviewerName) ? "Organization" : "Person",
          name: reviewerName,
          url: /team|editorial|altftool/i.test(reviewerName) ? getSiteUrl() : undefined,
        })
      : undefined,
    editor: reviewerName
      ? compactJsonLdObject({
          "@type": /team|editorial|altftool/i.test(reviewerName) ? "Organization" : "Person",
          name: reviewerName,
        })
      : undefined,
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    copyrightHolder: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(path),
    },
    interactionStatistic: interactionStatistic.length ? interactionStatistic : undefined,
    potentialAction: {
      "@type": "ReadAction",
      target: absoluteUrl(path),
    },
  });
}

export function createArticleJsonLd({
  path,
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  type = "Article",
} = {}) {
  if (!path || !headline) return null;

  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${absoluteUrl(path)}#article`,
    headline,
    description,
    image: image ? absoluteUrl(image) : absoluteUrl(siteConfig.defaultImagePath),
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: author || siteConfig.name,
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    mainEntityOfPage: absoluteUrl(path),
  };
}

export function createCollectionPageJsonLd({ path, name, description } = {}) {
  if (!path || !name) return null;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(path)}#collection`,
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "en",
    isPartOf: {
      "@id": `${getSiteUrl()}/#website`,
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
  };
}

export function createPersonJsonLd({
  path,
  name,
  description,
  jobTitle,
  sameAs = [],
} = {}) {
  if (!path || !name) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${absoluteUrl(path)}#person`,
    name,
    description,
    jobTitle,
    url: absoluteUrl(path),
    worksFor: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

/**
 * ImageObject node — use for hero/OG images that should be eligible for
 * image rich results (blogs, tool screenshots).
 */
export function createImageObjectJsonLd({ path, image, caption, width = 1200, height = 630 } = {}) {
  if (!image) return null;
  const imageUrl = absoluteUrl(image);

  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `${absoluteUrl(path || image)}#image`,
    url: imageUrl,
    contentUrl: imageUrl,
    caption: caption || siteConfig.name,
    width,
    height,
    representativeOfPage: true,
  };
}

/**
 * VideoObject node — wire in when video content ships (blog embeds,
 * tool demo videos). All Google-required fields are enforced.
 */
export function createVideoJsonLd({
  path,
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
} = {}) {
  if (!path || !name || !thumbnailUrl || !uploadDate) return null;

  const node = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${absoluteUrl(path)}#video`,
    name,
    description: description || name,
    thumbnailUrl: absoluteUrl(thumbnailUrl),
    uploadDate,
    publisher: { "@id": `${getSiteUrl()}/#organization` },
  };
  if (duration) node.duration = duration; // ISO 8601, e.g. "PT2M30S"
  if (contentUrl) node.contentUrl = absoluteUrl(contentUrl);
  if (embedUrl) node.embedUrl = absoluteUrl(embedUrl);
  return node;
}

/**
 * hreflang readiness — build the `alternates.languages` map for a page that
 * has real language/regional variants. Pass ONLY variants that exist as
 * distinct URLs; pages without variants keep the default x-default/en pair
 * emitted by createPageMetadata. Example:
 *   buildLanguageAlternates("/tools/all/step-counter", { "hi-IN": "/hi/tools/all/step-counter" })
 */
export function buildLanguageAlternates(path, variants = {}) {
  const canonical = absoluteUrl(path);
  const languages = { "x-default": canonical, en: canonical };
  for (const [lang, href] of Object.entries(variants)) {
    if (lang && href) languages[lang] = absoluteUrl(href);
  }
  return languages;
}

export function createItemListJsonLd({ path, name, items = [] } = {}) {
  const itemListElement = items
    .filter((item) => item?.name && item?.path)
    .map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    }));

  if (!itemListElement.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${absoluteUrl(path || "/")}#item-list`,
    name,
    itemListElement,
  };
}
