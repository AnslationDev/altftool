export const siteConfig = {
  name: "AltFTool",
  shortName: "AltFTool",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://altftool.com",
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

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image,
  keywords = [],
  type = "website",
} = {}) {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image || siteConfig.defaultImagePath);
  const cleanDescription = trimMetaDescription(description);
  const keywordList = [...new Set([...siteConfig.keywords, ...keywords].filter(Boolean))];

  return {
    title,
    description: cleanDescription,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: getSiteUrl() }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "technology",
    keywords: keywordList,
    alternates: {
      canonical: path,
      languages: {
        "x-default": path,
        en: path,
      },
    },
    openGraph: {
      title,
      description: cleanDescription,
      url,
      siteName: siteConfig.name,
      type,
      locale: siteConfig.locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getSiteUrl()}/#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: getSiteUrl(),
    logo: absoluteUrl(siteConfig.logoPath),
    sameAs: siteConfig.sameAs,
  };
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: siteConfig.name,
    url: getSiteUrl(),
    inLanguage: "en",
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/search?q={search_term_string}`,
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

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${absoluteUrl(`/tools/all/${slug}`)}#software`,
    name: tool.name || slug.replace(/-/g, " "),
    description: tool.description || siteConfig.description,
    url: absoluteUrl(`/tools/${category || "all"}/${slug}`),
    applicationCategory: categories[0] || "WebApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
  };
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
