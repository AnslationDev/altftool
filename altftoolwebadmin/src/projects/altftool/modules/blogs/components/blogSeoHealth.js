function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function stripBlogHtml(value = "") {
  return cleanText(
    String(value || "")
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'"),
  );
}

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value?.seconds === "number") {
    const date = new Date(value.seconds * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function countMatches(value = "", pattern) {
  return (String(value || "").match(pattern) || []).length;
}

export function parseBlogSources(value = "") {
  if (Array.isArray(value)) {
    return value
      .map((source) => {
        if (typeof source === "string") return { title: cleanText(source), url: "", publisher: "" };
        return {
          title: cleanText(source?.title || source?.name || source?.label || source?.url),
          url: cleanText(source?.url || source?.href || ""),
          publisher: cleanText(source?.publisher || source?.site || source?.source || ""),
        };
      })
      .filter((source) => source.title || source.url);
  }

  return String(value || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim()).filter(Boolean);
      const urlMatch = line.match(/https?:\/\/[^\s|]+/i);
      const url = urlMatch?.[0] || "";
      const title = parts[0] && parts[0] !== url ? parts[0] : url || line;
      const publisher = parts[2] || (parts[1] && parts[1] !== url ? parts[1] : "");

      return {
        title: cleanText(title),
        url: cleanText(url),
        publisher: cleanText(publisher),
      };
    })
    .filter((source) => source.title || source.url);
}

export function hasBlogFaqContent(blog = {}) {
  const description = String(blog.description || blog.content || blog.body || "");
  const structuredFaqs = [blog.faq, blog.faqs, blog.faqItems, blog.faq?.items]
    .filter(Array.isArray)
    .some((items) =>
      items.some((item) => {
        const question = cleanText(item?.question || item?.q || item?.title);
        const answer = cleanText(item?.answer || item?.a || item?.description);
        return question.length > 4 && answer.length > 12;
      }),
    );

  return structuredFaqs || /FAQ_ITEM|FAQ_Q|FAQ_A|<!--\s*FAQ Start\s*-->/i.test(description);
}

export function getBlogSchemaHealth(blog = {}) {
  const heading = cleanText(blog.heading || blog.title);
  const slug = cleanText(blog.slug);
  const description = cleanText(
    blog.seoDescription ||
      blog.excerpt ||
      stripBlogHtml(blog.description || blog.content || blog.body || "").slice(0, 180),
  );
  const body = blog.description || blog.content || blog.body || "";
  const plainBody = stripBlogHtml(body);
  const wordCount = plainBody ? plainBody.split(/\s+/).filter(Boolean).length : 0;
  const sourceCount = parseBlogSources(blog.sources || blog.citations || blog.references || "").length;
  const hasFaq = hasBlogFaqContent(blog);
  const hasReviewDate = Boolean(toDate(blog.reviewedAt || blog.updatedAt || blog.date || blog.createdAt));
  const hasPublishDate = Boolean(toDate(blog.date || blog.publishedAt || blog.createdAt));
  const hasInternalLink = /href=["']\/(?:tools|blogs|buysmart|extensions|top|news)/i.test(String(body || ""));
  const imageAltLength = cleanText(blog.imageAlt).length;
  const hasHeroImage = Boolean(cleanText(blog.image));
  const hasHeroAlt = !hasHeroImage || (imageAltLength >= 5 && imageAltLength <= 125);
  const hasTrustSignal = Boolean(
    cleanText(blog.authorRole) ||
      cleanText(blog.reviewedBy) ||
      cleanText(blog.editorialNote),
  );

  const checks = [
    {
      key: "identity",
      label: "Article identity",
      detail: heading ? "Heading found" : "Missing heading",
      done: heading.length >= 8,
      required: true,
    },
    {
      key: "canonical",
      label: "Canonical slug",
      detail: slug || "Missing slug",
      done: slug.length >= 3 && slug.length <= 90,
      required: true,
    },
    {
      key: "description",
      label: "Search description",
      detail: `${description.length}/160 characters`,
      done: description.length >= 80 && description.length <= 180,
      required: true,
    },
    {
      key: "dates",
      label: "Publish and review dates",
      detail: hasPublishDate && hasReviewDate ? "Freshness signals found" : "Missing date signal",
      done: hasPublishDate && hasReviewDate,
      required: true,
    },
    {
      key: "author",
      label: "Author and trust",
      detail: hasTrustSignal ? "Author/reviewer context found" : "Missing reviewer context",
      done: Boolean(cleanText(blog.author)) && hasTrustSignal,
      required: true,
    },
    {
      key: "image",
      label: "Article image",
      detail: hasHeroImage ? (hasHeroAlt ? "Image and alt text ready" : "Alt text needs work") : "Missing image",
      done: hasHeroImage && hasHeroAlt,
      required: true,
    },
    {
      key: "body",
      label: "Readable body",
      detail: `${wordCount} words`,
      done: wordCount >= 250,
      required: false,
    },
    {
      key: "faq",
      label: "FAQ rich result",
      detail: hasFaq ? "FAQ source found" : "No FAQ source",
      done: hasFaq,
      required: false,
    },
    {
      key: "citations",
      label: "Citation schema",
      detail: `${sourceCount} source${sourceCount === 1 ? "" : "s"}`,
      done: sourceCount >= 1,
      required: false,
    },
    {
      key: "internal-links",
      label: "Internal link graph",
      detail: hasInternalLink ? "Internal link found" : "No contextual internal link",
      done: hasInternalLink,
      required: false,
    },
  ];

  const requiredChecks = checks.filter((check) => check.required);
  const articleSchemaReady = requiredChecks.every((check) => check.done);
  const richResultReady = articleSchemaReady && hasFaq && sourceCount >= 1;
  const doneCount = checks.filter((check) => check.done).length;
  const issues = checks.filter((check) => !check.done);

  return {
    score: Math.round((doneCount / checks.length) * 100),
    checks,
    issues,
    articleSchemaReady,
    richResultReady,
    flags: {
      hasFaq,
      hasReviewDate,
      hasPublishDate,
      hasHeroImage,
      hasHeroAlt,
      hasTrustSignal,
      hasInternalLink,
      sourceCount,
      wordCount,
      outboundLinkCount: countMatches(body, /<a\b/gi),
    },
  };
}
