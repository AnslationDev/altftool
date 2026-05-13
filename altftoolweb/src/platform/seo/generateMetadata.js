export const siteConfig = {
  name: "AltFTool",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://altftool.com",
  description:
    "AltFTool is your online tools website with free tools, software, games, must-have Chrome extensions, and best web tools to boost productivity and fun.",
  logoPath: "/assets/logo3.png",
};

export function getSiteUrl() {
  return siteConfig.url.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  if (!path) return getSiteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
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
  type = "website",
} = {}) {
  const url = absoluteUrl(path);
  const imageUrl = image ? absoluteUrl(image) : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type,
      images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getSiteUrl()}/#organization`,
    name: siteConfig.name,
    url: getSiteUrl(),
    logo: absoluteUrl(siteConfig.logoPath),
  };
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: siteConfig.name,
    url: getSiteUrl(),
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/tools?search={search_term_string}`,
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

export function createBlogPostingJsonLd(blog) {
  if (!blog?.slug) return null;

  const title = blog.heading || blog.title;
  const path = `/blogs/${blog.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(path)}#article`,
    headline: title,
    description: blog.excerpt || blog.description,
    image: blog.image ? absoluteUrl(blog.image) : undefined,
    datePublished: blog.date,
    dateModified: blog.updatedAt || blog.date,
    author: {
      "@type": "Organization",
      name: blog.author || siteConfig.name,
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
