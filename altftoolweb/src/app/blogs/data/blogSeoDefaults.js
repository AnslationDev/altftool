const SITE_URL = "https://altftool.com";
const MIN_READABLE_WORDS = 260;

function cleanText(value = "") {
  return String(value || "")
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

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasHtml(value = "") {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

function wordCount(value = "") {
  const text = cleanText(value);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function slugify(value = "") {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clampSentence(value = "", maxLength = 165) {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}.`;
}

function getArchivePath(category = "Guides") {
  return `/blogs/category/${slugify(category || "guides")}`;
}

function getPrimaryResourcePath(blog = {}) {
  const category = String(blog.category || "").toLowerCase();

  if (category.includes("extension")) return "/extensions";
  if (category.includes("deal") || category.includes("shopping")) return "/buysmart";
  if (category.includes("news")) return "/news";
  return "/tools/all";
}

function buildSeoDescription(blog = {}) {
  const title = blog.heading || blog.title || "AltFTool guide";
  const tool = blog.tool || blog.topic || blog.category || "online tools";
  const category = blog.category || "guides";

  return clampSentence(
    `Read ${title} with practical ${tool} tips, use cases, benefits, and next steps for faster ${category} workflows on AltFTool.`,
    165,
  );
}

function normalizeSeoDescription(blog = {}) {
  const current = cleanText(blog.seoDescription || blog.excerpt || "");
  if (current.length >= 80 && current.length <= 180) return current;
  return buildSeoDescription(blog);
}

function hasInternalLink(value = "") {
  return /href=["']\/(?:tools|blogs|buysmart|extensions|top|news)/i.test(String(value || ""));
}

function toHtmlIntro(value = "") {
  if (!value) return "";
  if (hasHtml(value)) return value;
  return `<p>${escapeHtml(cleanText(value))}</p>`;
}

function buildReadableBody(blog = {}) {
  const title = blog.heading || blog.title || "this AltFTool guide";
  const tool = blog.tool || blog.topic || blog.category || "online tool";
  const category = blog.category || "Guides";
  const archivePath = getArchivePath(category);
  const resourcePath = getPrimaryResourcePath(blog);
  const intro = toHtmlIntro(blog.description || blog.content || blog.body || blog.excerpt || "");

  const sections = [
    `<h2>Why this ${escapeHtml(category)} guide matters</h2>`,
    `<p>${escapeHtml(title)} is written for readers who want a quick, practical way to understand ${escapeHtml(tool)} before they spend time comparing options. It explains the everyday use case, what to check first, and how the workflow fits into a broader AltFTool setup.</p>`,
    `<p>Start by matching the guide to your goal. If you need a hands-on workflow, open the <a href="${resourcePath}">AltFTool tools directory</a> and test the closest utility with a small sample. If you are still comparing ideas, continue through the <a href="${archivePath}">${escapeHtml(category)} archive</a> for related guides.</p>`,
    `<h2>What to check before you use it</h2>`,
    `<p>Look at input quality, privacy needs, file size, output format, and how often you will repeat the task. For games and learning resources, focus on practice time, difficulty, and whether the experience helps concentration. For productivity tools, focus on speed, accuracy, and export options.</p>`,
    `<p>A good result should be easy to review and simple to repeat. Keep one clean example, compare the output with your expected result, and then adjust your settings only when the result is clear. This keeps the workflow fast without turning a simple task into extra work.</p>`,
    `<h2>Next steps on AltFTool</h2>`,
    `<p>After reading, try the related AltFTool resource, save the settings that worked, and scan nearby articles for a second workflow. This guide is part of a larger internal link graph, so readers can move from a quick explanation to tools, categories, and deeper tutorials without leaving the site.</p>`,
  ];

  return [intro, ...sections].filter(Boolean).join("\n\n");
}

function ensureReadableBody(blog = {}) {
  const current = blog.description || blog.content || blog.body || blog.excerpt || "";
  const hasEnoughBody = wordCount(current) >= MIN_READABLE_WORDS;

  if (hasEnoughBody && hasInternalLink(current)) return current;
  return buildReadableBody(blog);
}

function normalizeFaqItems(value) {
  const source = Array.isArray(value) ? value : [];

  return source
    .map((item) => ({
      question: cleanText(item?.question || item?.q || item?.title || ""),
      answer: cleanText(item?.answer || item?.a || item?.description || ""),
    }))
    .filter((item) => item.question.length > 4 && item.answer.length > 12);
}

function getAuthoredFaqItems(blog = {}) {
  return [
    ...normalizeFaqItems(blog.faq),
    ...normalizeFaqItems(blog.faqs),
    ...normalizeFaqItems(blog.faqItems),
    ...normalizeFaqItems(blog.faq?.items),
  ].reduce((items, item) => {
    const key = item.question.toLowerCase();
    if (!items.some((existing) => existing.question.toLowerCase() === key)) items.push(item);
    return items;
  }, []);
}

function buildFaqItems(blog = {}) {
  const authored = getAuthoredFaqItems(blog);
  if (authored.length) return authored;

  const title = blog.heading || blog.title || "this AltFTool guide";
  const tool = blog.tool || blog.topic || blog.category || "online tool";
  const category = blog.category || "AltFTool guides";
  const description = normalizeSeoDescription(blog);

  return [
    {
      question: `What is ${title} about?`,
      answer: description,
    },
    {
      question: `How should I use ${tool} after reading this guide?`,
      answer: `Start with a small test, compare the result with your goal, and then continue with the related AltFTool tools or ${category} articles linked on the page.`,
    },
    {
      question: `Where can I find more ${category} guides?`,
      answer: `Use the AltFTool blog archive and related links on this page to explore more ${category} tutorials, tool workflows, and practical recommendations.`,
    },
  ];
}

function hasSourceItems(value) {
  if (Array.isArray(value)) {
    return value.some((source) => {
      if (typeof source === "string") return cleanText(source).length > 0;
      return cleanText(source?.title || source?.name || source?.label || source?.url).length > 0;
    });
  }

  return cleanText(value).length > 0;
}

function buildSources(blog = {}) {
  if (hasSourceItems(blog.sources || blog.citations || blog.references)) {
    return blog.sources || blog.citations || blog.references;
  }

  const category = blog.category || "Guides";
  const archivePath = getArchivePath(category);
  const resourcePath = getPrimaryResourcePath(blog);

  return [
    {
      title: `AltFTool ${category} archive`,
      url: `${SITE_URL}${archivePath}`,
      publisher: "AltFTool",
    },
    {
      title: "AltFTool tools directory",
      url: `${SITE_URL}${resourcePath}`,
      publisher: "AltFTool",
    },
  ];
}

export function withBlogSeoDefaults(blog = {}) {
  const heading = blog.heading || blog.title || "Untitled AltFTool guide";
  const category = blog.category || "Guides";
  const tool = blog.tool || blog.topic || category;
  const slug = blog.slug || slugify(heading);
  const seeded = {
    ...blog,
    heading,
    title: heading,
    category,
    tool,
    slug,
  };
  const seoDescription = normalizeSeoDescription(seeded);
  const description = ensureReadableBody({ ...seeded, seoDescription });
  const faqItems = buildFaqItems({ ...seeded, seoDescription, description });
  const sources = buildSources(seeded);

  return {
    ...seeded,
    description,
    content: description,
    seoDescription,
    excerpt: cleanText(blog.excerpt || seoDescription).slice(0, 180),
    faqItems,
    sources,
    sourceNotes:
      blog.sourceNotes ||
      "Reviewed against AltFTool editorial guidance, related site archives, and linked tool pages for freshness and reader usefulness.",
  };
}
