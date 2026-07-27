const ISSUE_LABELS = {
  slug: "Missing slug",
  heading: "Missing title",
  body: "Thin body",
  seoDescription: "Weak meta description",
  image: "Image gap",
  taxonomy: "Taxonomy gap",
  trust: "Trust fields gap",
  freshness: "Freshness gap",
  sources: "Source gap",
  faq: "FAQ gap",
  links: "Internal links gap",
};

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function cleanText(value = "") {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value = "") {
  return cleanText(value).split(/\s+/).filter(Boolean).length;
}

function normalizeDate(value) {
  if (!value) return null;
  if (typeof value?.seconds === "number") {
    const date = new Date(value.seconds * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value?.toDate) {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysSince(value, now = Date.now()) {
  const date = normalizeDate(value);
  if (!date) return null;
  return Math.max(0, Math.floor((now - date.getTime()) / 86_400_000));
}

function getSourceCount(blog = {}) {
  const buckets = [blog.sources, blog.citations, blog.references];
  const sources = buckets.flatMap((bucket) => {
    if (!bucket) return [];
    if (Array.isArray(bucket)) return bucket;
    return String(bucket || "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  });
  const normalized = sources
    .map((source) => {
      if (typeof source === "string") return source;
      return source?.title || source?.url || source?.name || source?.label || "";
    })
    .map(cleanText)
    .filter(Boolean);

  if (normalized.length) return new Set(normalized.map((source) => source.toLowerCase())).size;
  return cleanText(blog.sourceNotes).length > 24 ? 1 : 0;
}

function hasFaqContent(blog = {}) {
  const structured = [blog.faq, blog.faqs, blog.faqItems, blog.faq?.items]
    .filter(Array.isArray)
    .some((items) =>
      items.some((item) => {
        const question = cleanText(item?.question || item?.q || item?.title);
        const answer = cleanText(item?.answer || item?.a || item?.description);
        return question.length > 4 && answer.length > 12;
      }),
    );
  const mapFaq =
    blog.faq &&
    !Array.isArray(blog.faq) &&
    cleanText(blog.faq.question || blog.faq.q || blog.faq.title).length > 4 &&
    cleanText(blog.faq.answer || blog.faq.a || blog.faq.description).length > 12;

  return structured || mapFaq || /FAQ_ITEM|FAQ_Q|FAQ_A|Frequently Asked Questions|<!--\s*FAQ Start\s*-->/i.test(
    String(blog.description || blog.content || blog.body || ""),
  );
}

function hasInternalLinks(blog = {}) {
  const structuredLinks = [blog.internalLinks, blog.relatedLinks, blog.relatedTools, blog.relatedBlogs]
    .filter(Array.isArray)
    .some((items) =>
      items.some((item) => cleanText(item?.href || item?.url || item?.path || item?.slug || item).length > 1),
    );

  if (structuredLinks) return true;

  const body = String(blog.description || blog.content || blog.body || "");
  return /(?:href=["']|]\()(?:(?:https?:\/\/(?:www\.)?altftool\.com)?\/(?:tools|blogs|buysmart|extensions|top|news|policypages))/i.test(body);
}

function createCheck(key, done, weight, detail, severity = "warning") {
  return {
    key,
    label: ISSUE_LABELS[key] || key,
    done: Boolean(done),
    weight,
    detail,
    severity,
  };
}

export function evaluateBlogContent(blog = {}, options = {}) {
  const now = Number(options.now) || Date.now();
  const title = cleanText(blog.heading || blog.title);
  const body = blog.description || blog.content || blog.body || "";
  const words = wordCount(body);
  const meta = cleanText(blog.seoDescription || blog.excerpt);
  const tags = Array.isArray(blog.tags) ? blog.tags.filter(Boolean) : [];
  const sourceCount = getSourceCount(blog);
  const reviewAge = daysSince(blog.reviewedAt || blog.updatedAt || blog.date || blog.createdAt, now);
  const checks = [
    createCheck("slug", cleanText(blog.slug).length >= 3, 12, "Every published blog needs a stable route slug.", "critical"),
    createCheck("heading", title.length >= 12, 12, "Title should be descriptive enough for cards and metadata.", "critical"),
    createCheck("body", words >= 250, 14, `${words} words detected; target 250+ for a useful guide.`),
    createCheck("seoDescription", meta.length >= 80 && meta.length <= 180, 10, `${meta.length} characters; target 80-180.`),
    createCheck("image", Boolean(blog.image) && cleanText(blog.imageAlt).length >= 5, 9, "Cover image and image alt text should both be present."),
    createCheck("taxonomy", Boolean(blog.category) && tags.length >= 2, 8, `${tags.length} tags detected; target 2+ with a category.`),
    createCheck("trust", Boolean(blog.authorRole || blog.reviewedBy || blog.editorialNote), 9, "Add author role, reviewer, or editorial note."),
    createCheck("freshness", reviewAge !== null && reviewAge <= 180, 8, reviewAge === null ? "No reviewed/updated date found." : `${reviewAge} days since review.`),
    createCheck("sources", sourceCount > 0, 9, `${sourceCount} cited source${sourceCount === 1 ? "" : "s"} detected.`),
    createCheck("faq", hasFaqContent(blog), 5, "Add structured FAQ or authored FAQ block."),
    createCheck("links", hasInternalLinks(blog), 4, "Add relevant internal blog/tool links."),
  ];
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earnedWeight = checks.filter((check) => check.done).reduce((sum, check) => sum + check.weight, 0);
  const score = clampScore((earnedWeight / totalWeight) * 100);
  const missing = checks.filter((check) => !check.done);

  return {
    id: blog.id || blog.slug || title,
    slug: blog.slug || "",
    title: title || "Untitled blog",
    category: blog.category || "Uncategorized",
    score,
    status: score >= 86 ? "ready" : score >= 72 ? "watch" : "needs-work",
    words,
    sourceCount,
    hasFaq: checks.find((check) => check.key === "faq")?.done || false,
    hasLinks: checks.find((check) => check.key === "links")?.done || false,
    reviewAgeDays: reviewAge,
    criticalIssues: missing.filter((check) => check.severity === "critical").map((check) => check.key),
    missing: missing.map((check) => check.key),
    checks,
  };
}

function createSummaryCheck(key, label, ok, value, detail) {
  return {
    key,
    label,
    ok: Boolean(ok),
    value,
    detail,
  };
}

export function createBlogContentHealthReport(blogs = [], options = {}) {
  const source = options.source || "local";
  const evaluated = blogs.map((blog) => evaluateBlogContent(blog, options));
  const total = evaluated.length;
  const ready = evaluated.filter((item) => item.status === "ready").length;
  const watch = evaluated.filter((item) => item.status === "watch").length;
  const needsWork = evaluated.filter((item) => item.status === "needs-work").length;
  const criticalIssues = evaluated.reduce((sum, item) => sum + item.criticalIssues.length, 0);
  const withSources = evaluated.filter((item) => item.sourceCount > 0).length;
  const withFaq = evaluated.filter((item) => item.hasFaq).length;
  const withLinks = evaluated.filter((item) => item.hasLinks).length;
  const averageScore = clampScore(
    total ? evaluated.reduce((sum, item) => sum + item.score, 0) / total : 0,
  );
  const issueCounts = new Map();

  evaluated.forEach((item) => {
    item.missing.forEach((issue) => {
      issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1);
    });
  });

  const topIssues = [...issueCounts.entries()]
    .map(([key, count]) => ({
      key,
      label: ISSUE_LABELS[key] || key,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 10);
  const lowestScoring = [...evaluated]
    .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title))
    .slice(0, 8)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      score: item.score,
      status: item.status,
      missing: item.missing.slice(0, 5),
    }));
  const readyTarget = Math.ceil(total * 0.7);

  const checks = [
    createSummaryCheck("auditedBlogs", "Audited blogs", total > 0, total, `${total} ${source} blogs audited.`),
    createSummaryCheck("criticalIssues", "Critical fields", criticalIssues === 0, criticalIssues, `${criticalIssues} critical issues found.`),
    createSummaryCheck("readyCoverage", "Ready coverage", ready >= readyTarget, ready, `${ready}/${total} ready guides.`),
    createSummaryCheck("sourceCoverage", "Source coverage", total ? withSources / total >= 0.35 : false, withSources, `${withSources}/${total} guides cite sources.`),
    createSummaryCheck("faqCoverage", "FAQ coverage", total ? withFaq / total >= 0.45 : false, withFaq, `${withFaq}/${total} guides include FAQ content.`),
    createSummaryCheck("linkCoverage", "Internal links", total ? withLinks / total >= 0.45 : false, withLinks, `${withLinks}/${total} guides include internal links.`),
  ];
  const checkScore = clampScore((checks.filter((check) => check.ok).length / checks.length) * 100);
  const score = clampScore(averageScore * 0.75 + checkScore * 0.25);

  return {
    generatedAt: new Date().toISOString(),
    source,
    ok: total > 0 && criticalIssues === 0 && score >= 72,
    status: score >= 86 ? "ready" : score >= 72 ? "watch" : "needs-work",
    score,
    averageScore,
    totals: {
      total,
      ready,
      watch,
      needsWork,
      criticalIssues,
      withSources,
      withFaq,
      withLinks,
    },
    checks,
    topIssues,
    lowestScoring,
  };
}
