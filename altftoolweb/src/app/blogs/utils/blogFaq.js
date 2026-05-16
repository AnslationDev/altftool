import { stripHtml } from "../data";

function decodeHtmlEntities(value = "") {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanText(value = "") {
  return decodeHtmlEntities(stripHtml(value).replace(/\s+/g, " ").trim());
}

function trimMetaDescription(value = "", maxLength = 160) {
  const text = cleanText(value);
  if (!text) return "";
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

function normalizeFaqItems(value) {
  const source = Array.isArray(value) ? value : [];

  return source
    .map((item) => ({
      question: cleanText(item?.question || item?.q || item?.title || ""),
      answer: cleanText(item?.answer || item?.a || item?.description || ""),
    }))
    .filter((item) => item.question.length > 4 && item.answer.length > 12)
    .slice(0, 8);
}

function extractFaqsFromHtml(html = "") {
  const source = String(html || "");
  if (!source) return [];

  const blockMatch = source.match(/<!--\s*FAQ Start\s*-->([\s\S]*?)<!--\s*FAQ End\s*-->/i);
  const faqSource = blockMatch?.[1] || source;
  const itemPattern = /<div[^>]*class=["'][^"']*FAQ_ITEM[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  const items = [];
  let itemMatch = itemPattern.exec(faqSource);

  while (itemMatch) {
    const itemHtml = itemMatch[1] || "";
    const question =
      itemHtml.match(/<button[^>]*class=["'][^"']*FAQ_Q[^"']*["'][^>]*>([\s\S]*?)<\/button>/i)?.[1] ||
      "";
    const answer =
      itemHtml.match(/<div[^>]*class=["'][^"']*FAQ_A[^"']*["'][^>]*>([\s\S]*?)$/i)?.[1] ||
      "";
    const normalized = {
      question: cleanText(question),
      answer: cleanText(answer),
    };

    if (normalized.question.length > 4 && normalized.answer.length > 12) {
      items.push(normalized);
    }

    itemMatch = itemPattern.exec(faqSource);
  }

  return items.slice(0, 8);
}

function extractOrderedSteps(html = "") {
  const source = String(html || "");
  const orderedList = source.match(/<ol\b[^>]*>([\s\S]*?)<\/ol>/i)?.[1] || "";
  if (!orderedList) return [];

  const steps = [];
  const itemPattern = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let match = itemPattern.exec(orderedList);

  while (match) {
    const text = cleanText(match[1]);
    if (text.length > 10 && text.length < 220) steps.push(text);
    if (steps.length >= 8) break;
    match = itemPattern.exec(orderedList);
  }

  return steps;
}

function extractHeadingSteps(html = "") {
  const steps = [];
  const headingPattern = /<h([2-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match = headingPattern.exec(String(html || ""));

  while (match) {
    const text = cleanText(match[2]);
    const lower = text.toLowerCase();
    const looksActionable =
      lower.startsWith("step") ||
      lower.includes("how to") ||
      lower.startsWith("use ") ||
      lower.startsWith("open ") ||
      lower.startsWith("choose ") ||
      lower.startsWith("check ") ||
      lower.startsWith("create ") ||
      lower.startsWith("download ") ||
      lower.startsWith("convert ");

    if (looksActionable && text.length > 10 && text.length < 180) {
      steps.push(text);
    }

    if (steps.length >= 8) break;
    match = headingPattern.exec(String(html || ""));
  }

  return steps;
}

export function getBlogDescription(blog) {
  return trimMetaDescription(
    blog?.seoDescription ||
    blog?.excerpt ||
    stripHtml(blog?.description || blog?.content || "").slice(0, 160) ||
    "Read practical AltFTool guides, tool tutorials, and digital productivity articles.",
  );
}

export function deriveBlogFaqItems(blog) {
  if (!blog) return [];

  const authoredFaqs = [
    ...normalizeFaqItems(blog.faq),
    ...normalizeFaqItems(blog.faqs),
    ...normalizeFaqItems(blog.faqItems),
    ...normalizeFaqItems(blog.faq?.items),
    ...extractFaqsFromHtml(blog.description || blog.content || blog.body || ""),
  ].reduce((acc, item) => {
    const key = item.question.toLowerCase();
    if (!acc.some((existing) => existing.question.toLowerCase() === key)) {
      acc.push(item);
    }
    return acc;
  }, []);

  if (authoredFaqs.length) return authoredFaqs;

  const title = blog.heading || blog.title || "this AltFTool article";
  const category = blog.category || "AltFTool guides";
  const readTime = blog.readTime || `${blog.readTimeMinutes || 2} min read`;
  const readingDuration = String(readTime).replace(/\s*read$/i, "");

  return [
    {
      question: `What is ${title} about?`,
      answer: getBlogDescription(blog),
    },
    {
      question: `How long does it take to read ${title}?`,
      answer: `This article takes about ${readingDuration} to read.`,
    },
    {
      question: `Where can I find more ${category} articles?`,
      answer: `Browse the ${category} archive on AltFTool for more related guides, tips, and tool workflows.`,
    },
  ];
}

export function deriveBlogHowToSteps(blog, relatedTools = []) {
  if (!blog) return [];

  const content = blog.description || blog.content || blog.body || "";
  const authoredSteps = [...extractOrderedSteps(content), ...extractHeadingSteps(content)].reduce((acc, step) => {
    const key = step.toLowerCase();
    if (!acc.some((existing) => existing.toLowerCase() === key)) acc.push(step);
    return acc;
  }, []);

  if (authoredSteps.length >= 2) return authoredSteps.slice(0, 8);

  const title = blog.heading || blog.title || "this guide";
  const primaryTool = relatedTools[0]?.name || blog.tool;
  const steps = [
    `Read the key points in ${title} and note the workflow that matches your goal.`,
    primaryTool
      ? `Open ${primaryTool} on AltFTool when you are ready to try the workflow.`
      : "Open the related AltFTool resource when you are ready to try the workflow.",
    "Review the result, adjust your input, and continue with the related guides or tools shown on the page.",
  ];

  return steps;
}
