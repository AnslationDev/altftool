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

const CONTENT_PROFILES = [
  {
    key: "games",
    match: ["game", "flappy", "chess", "sudoku", "snake", "2048", "minesweeper", "ludo", "cricket", "racer", "brick", "breakout", "memory match", "tic tac toe", "connect four"],
    reader: "players who want a quick browser game with clear rules and short practice loops",
    outcome: "focus, timing, decision-making, and repeatable play sessions",
    useCases: [
      "short focus breaks between work sessions",
      "logic or reflex practice without installing an app",
      "quick challenges that are easy to restart and improve",
    ],
    checks: [
      "controls feel responsive on desktop and mobile",
      "difficulty increases in a way that still feels fair",
      "the goal is clear before the first round starts",
    ],
    steps: [
      "Read the basic objective before starting your first run.",
      "Play one short round to understand movement, timing, and scoring.",
      "Replay with one improvement target, such as fewer mistakes or a higher score.",
      "Use related game guides when you want a different pace or challenge style.",
    ],
    mistakes: "Do not judge the game from a single failed round. Fast games reward rhythm, while puzzle games reward slower scanning and planning.",
    sourceLabel: "AltFTool game and puzzle topic cluster",
    sourcePath: "/blogs/topics/games-word-puzzles",
  },
  {
    key: "media",
    match: ["image", "background", "thumbnail", "compressor", "resizer", "animation", "animator", "screen recorder"],
    reader: "creators, students, marketers, and support teams preparing visuals quickly",
    outcome: "cleaner media files, faster publishing, and fewer repeated editing steps",
    useCases: [
      "resizing or compressing files before upload",
      "cleaning visuals for thumbnails, documents, and social posts",
      "checking output quality before sharing media publicly",
    ],
    checks: [
      "the output dimensions match the platform you plan to use",
      "text and faces remain sharp after compression or resizing",
      "private or sensitive media is reviewed before upload",
    ],
    steps: [
      "Start with the highest-quality original file available.",
      "Choose the output size, format, or effect based on where the file will be used.",
      "Preview the result at normal viewing size before downloading.",
      "Keep the original file until the edited version is approved.",
    ],
    mistakes: "Avoid compressing the same image again and again. Repeated edits can soften details, blur text, and make thumbnails look less trustworthy.",
    sourceLabel: "AltFTool image and video guides",
    sourcePath: "/blogs/topics/image-video-tools",
  },
  {
    key: "documents",
    match: ["pdf", "document", "word counter", "grammar", "text", "translator"],
    reader: "writers, students, and teams working with text, files, and document cleanup",
    outcome: "clearer writing, cleaner documents, and faster review workflows",
    useCases: [
      "checking writing length before submission",
      "combining or preparing files for sharing",
      "cleaning language, formatting, or readability before publishing",
    ],
    checks: [
      "the final text still says what you intended",
      "file order and page order are correct before export",
      "names, numbers, dates, and translated terms are reviewed manually",
    ],
    steps: [
      "Paste or upload a small sample first to confirm the tool behavior.",
      "Apply the correction, merge, count, or translation workflow.",
      "Review the output for formatting, meaning, and missing sections.",
      "Save the final version only after checking the most important details.",
    ],
    mistakes: "Do not treat automated text output as final without review. The tool can speed up cleanup, but names, facts, tone, and context still need a human pass.",
    sourceLabel: "AltFTool PDF and document guides",
    sourcePath: "/blogs/topics/pdf-document-tools",
  },
  {
    key: "downloaders",
    match: ["downloader", "youtube", "facebook", "thumbnail"],
    reader: "creators and researchers saving publicly available media references for later use",
    outcome: "faster media collection, cleaner references, and less manual searching",
    useCases: [
      "saving a thumbnail or media reference for a project brief",
      "reviewing examples while planning content",
      "keeping public assets organized before editing or publishing",
    ],
    checks: [
      "you have permission or a valid reason to save the content",
      "the chosen quality is high enough for your intended use",
      "the downloaded file name makes the source easy to identify later",
    ],
    steps: [
      "Copy the public media URL from the source platform.",
      "Paste it into the relevant AltFTool downloader or helper page.",
      "Choose the output that matches your intended quality and file size.",
      "Store the file with a clear name and respect the original creator's rights.",
    ],
    mistakes: "Do not reuse downloaded media as if you own it. Always check platform rules, creator permissions, and whether your use is personal, educational, or commercial.",
    sourceLabel: "AltFTool creator media guides",
    sourcePath: "/blogs/topics/image-video-tools",
  },
  {
    key: "extensions",
    match: ["extension", "chrome", "browser"],
    reader: "browser users who want helpful add-ons without slowing down their setup",
    outcome: "a cleaner browser workflow with fewer risky or unnecessary extensions",
    useCases: [
      "adding one-click help to everyday browser tasks",
      "reducing repetitive copy, download, or writing work",
      "testing a workflow before adding more extensions",
    ],
    checks: [
      "the extension permissions match the job it claims to do",
      "reviews and update history look trustworthy",
      "you can disable or remove it easily if it is not useful",
    ],
    steps: [
      "Install only the extension that solves your current task.",
      "Review permissions before enabling it on important sites.",
      "Test it on a low-risk page before using it in daily work.",
      "Remove duplicate extensions so the browser stays fast and predictable.",
    ],
    mistakes: "Avoid stacking multiple extensions that do the same job. Too many add-ons can slow browsing, add confusing buttons, and increase permission risk.",
    sourceLabel: "AltFTool extension guides",
    sourcePath: "/blogs/topics/student-productivity",
  },
  {
    key: "finance",
    match: ["currency", "finance", "exchange"],
    reader: "travelers, shoppers, students, and small teams comparing values across currencies",
    outcome: "clearer estimates before purchases, invoices, budgets, or travel planning",
    useCases: [
      "checking a price before buying from another country",
      "estimating travel budgets and daily spending",
      "comparing invoice or subscription values across currencies",
    ],
    checks: [
      "the rate is fresh enough for the decision you are making",
      "fees, bank margins, and taxes are considered separately",
      "large transfers are verified with your provider before payment",
    ],
    steps: [
      "Enter the amount and currency pair you want to compare.",
      "Check when the rate was last refreshed or updated.",
      "Add expected card, bank, or marketplace fees to the estimate.",
      "Use the result as guidance, not as a guaranteed final bank rate.",
    ],
    mistakes: "Do not use a converter result as a final trading, tax, or transfer quote. Real payments can include spreads, delays, and provider-specific fees.",
    sourceLabel: "AltFTool finance guide archive",
    sourcePath: "/blogs/category/finance",
  },
  {
    key: "calculator",
    match: ["calculator", "age calculator", "age and gender"],
    reader: "people checking quick estimates, forms, eligibility dates, or simple planning details",
    outcome: "faster calculations with fewer manual date or input mistakes",
    useCases: [
      "checking dates for forms, planning, or learning tasks",
      "testing an estimate before saving or sharing it",
      "reducing manual calculation errors in repetitive workflows",
    ],
    checks: [
      "the input date or image is correct before submitting",
      "the result is treated as an estimate where appropriate",
      "important legal, medical, or identity decisions are verified elsewhere",
    ],
    steps: [
      "Enter the required input carefully and review it once.",
      "Run the calculation or prediction with a simple test case first.",
      "Compare the result with your expected range or known example.",
      "Use the output as a quick guide and verify high-stakes decisions manually.",
    ],
    mistakes: "Do not rely on quick calculators or visual predictions for official proof. They are useful for speed, but final decisions may need verified records or expert review.",
    sourceLabel: "AltFTool calculator guides",
    sourcePath: "/blogs/topics/ai-tools",
  },
];

const DEFAULT_PROFILE = {
  key: "tools",
  reader: "readers who want a faster way to finish everyday web tasks",
  outcome: "shorter workflows, clearer outputs, and reusable tool habits",
  useCases: [
    "testing a task before choosing a heavier app",
    "saving time on a repeated browser workflow",
    "combining a guide with a related AltFTool utility",
  ],
  checks: [
    "the input is clean before running the tool",
    "the output matches the format you need",
    "private details are removed before sharing or downloading",
  ],
  steps: [
    "Read the core use case and decide what output you need.",
    "Open the related AltFTool utility and test it with a small sample.",
    "Review the result, adjust settings, and repeat only if needed.",
    "Continue with related tools or guides for the next step in the workflow.",
  ],
  mistakes: "Do not overcomplicate a simple task. Start with the smallest sample that proves the workflow, then scale up once the output looks right.",
  sourceLabel: "AltFTool tools directory",
  sourcePath: "/tools/all",
};

function getContentProfile(blog = {}) {
  const haystack = cleanText([
    blog.heading,
    blog.title,
    blog.slug,
    blog.category,
    blog.tool,
    blog.topic,
    ...(Array.isArray(blog.tags) ? blog.tags : []),
  ].filter(Boolean).join(" ")).toLowerCase();

  return CONTENT_PROFILES.find((profile) =>
    profile.match.some((keyword) => haystack.includes(keyword))
  ) || DEFAULT_PROFILE;
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
  const tool = blog.tool || blog.topic || blog.category || "online tools";
  const category = blog.category || "guides";

  return clampSentence(
    `Use ${tool} better with this ${category} guide. Learn best use cases, quality checks, mistakes to avoid, and next steps on AltFTool.`,
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
  const profile = getContentProfile(blog);
  const archivePath = getArchivePath(category);
  const resourcePath = getPrimaryResourcePath(blog);
  const profilePath = profile.sourcePath || resourcePath;
  const intro = toHtmlIntro(blog.description || blog.content || blog.body || blog.excerpt || "");
  const useCases = profile.useCases.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const checks = profile.checks.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const steps = profile.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const sections = [
    `<h2>Who should use ${escapeHtml(tool)}</h2>`,
    `<p>${escapeHtml(title)} is built for ${escapeHtml(profile.reader)}. The main goal is ${escapeHtml(profile.outcome)}, so the guide focuses on practical choices instead of broad theory.</p>`,
    `<p>Use it when you need one of these outcomes:</p>`,
    `<ul>${useCases}</ul>`,
    `<h2>How to get a better result</h2>`,
    `<ol>${steps}</ol>`,
    `<p>Start small, check the first output, and only then repeat the workflow with the full file, text, media, or game session. That gives you a quick quality check before you spend more time.</p>`,
    `<h2>Quality checks before you trust the output</h2>`,
    `<ul>${checks}</ul>`,
    `<p>${escapeHtml(profile.mistakes)}</p>`,
    `<h2>Continue your workflow</h2>`,
    `<p>If you want to try the workflow now, open the <a href="${resourcePath}">related AltFTool tool area</a>. For more reading, continue through the <a href="${archivePath}">${escapeHtml(category)} archive</a> or the <a href="${profilePath}">${escapeHtml(profile.sourceLabel)}</a>.</p>`,
    `<p>This creates a cleaner path from explanation to action: read the guide, test the tool, compare the output, and move into the next related AltFTool resource only when it helps the task.</p>`,
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
  const profile = getContentProfile(blog);
  const description = normalizeSeoDescription(blog);

  return [
    {
      question: `What is ${title} about?`,
      answer: description,
    },
    {
      question: `When should I use ${tool}?`,
      answer: `Use ${tool} when you need ${profile.useCases.slice(0, 2).join(" or ")}. It is best for ${profile.outcome}.`,
    },
    {
      question: `How do I get better results from ${tool}?`,
      answer: `Start with a small sample, then check that ${profile.checks.slice(0, 2).join(" and ")}. Review the output before using it in a final workflow.`,
    },
    {
      question: `Where can I find more ${category} guides?`,
      answer: `Use the AltFTool blog archive, ${profile.sourceLabel}, and related links on this page to explore more ${category} tutorials, tool workflows, and practical recommendations.`,
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
  const profile = getContentProfile(blog);

  const sources = [
    {
      title: `AltFTool ${category} archive`,
      url: `${SITE_URL}${archivePath}`,
      publisher: "AltFTool",
    },
    {
      title: profile.sourceLabel,
      url: `${SITE_URL}${profile.sourcePath || resourcePath}`,
      publisher: "AltFTool",
    },
    {
      title: "AltFTool related tools area",
      url: `${SITE_URL}${resourcePath}`,
      publisher: "AltFTool",
    },
  ];

  return sources.reduce((items, source) => {
    const key = source.url.toLowerCase() || source.title.toLowerCase();
    if (!items.some((item) => (item.url.toLowerCase() || item.title.toLowerCase()) === key)) {
      items.push(source);
    }
    return items;
  }, []);
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
