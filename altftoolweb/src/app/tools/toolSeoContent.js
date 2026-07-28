import { toolContentOverrides } from "./toolContentOverrides";
import { generatedToolSeo } from "./generated/toolSeoMap";
import { getSeoConfigSnapshot } from "@/platform/seo/seoConfigSource";
import { resolveContent } from "@altftool/core/seo/resolver";

// ---------------------------------------------------------------------------
// Integrity note — claims this file is allowed to make
//
// The tool corpus has no per-tool "processing happens on your device" flag, and
// it would be wrong to invent one: ~61 tools call a network API from their own
// runtime directory (LanguageTool for the spelling/grammar checkers, an image
// service for pixar-style-generator, /api/tools/* for the AI tools…) and a
// further ~68 render the shared AdvancedWorkbench, which posts the user's query
// and optional geolocation to /api/tools/live-utility. So the templated copy
// below states only what is true of EVERY tool page and is already asserted by
// the SoftwareApplication JSON-LD in createToolJsonLd(): free (`isAccessible
// ForFree`, `Offer price 0`), browser-based (`operatingSystem: "Web"`,
// `browserRequirements`), and no account. Locality of processing is claimed
// only where a human wrote it for that specific tool (src/tools/<slug>/seo.js
// or toolContentOverrides), never from a shared template.
// ---------------------------------------------------------------------------

const workflowTemplates = {
  developer: {
    examples: [
      ["Ship cleaner code, faster", "Paste snippets, payloads, or commands straight from your editor and get a tidy, shareable result in one step."],
      ["Validate before it goes live", "Format, convert, or inspect data before it lands in tests, documentation, or production requests."],
      ["Skip the boilerplate", "Use the generated output as a copy-ready starting point instead of writing everything by hand."],
    ],
    steps: ["Paste your code or data sample into the workspace.", "Pick the format, conversion, or analysis you need.", "Copy the polished result straight back into your project."],
  },
  converter: {
    examples: [
      ["Switch formats in seconds", "Move text, files, or encoded data into exactly the format your workflow expects — no desktop software needed."],
      ["Check before you publish", "Preview the converted result so you catch issues before it reaches an app, document, or message."],
      ["Keep results ready to reuse", "Every output is one click away from being copied, downloaded, or dropped into your next task."],
    ],
    steps: ["Paste or upload your source content.", "Choose the target format or conversion mode.", "Copy or download the converted result."],
  },
  calculator: {
    examples: [
      ["Get answers instantly", "Enter what you know and see an accurate result immediately — no formulas or spreadsheets required."],
      ["Compare scenarios side by side", "Adjust the inputs to see exactly how each change affects the outcome before you decide."],
      ["Make confident decisions", "Take a clear, precise number into your plans, reports, or conversations."],
    ],
    steps: ["Enter the values you already know.", "Fine-tune the options to match your scenario.", "Read the result and use it in your planning or reporting."],
  },
  media: {
    examples: [
      ["Edit without desktop software", "Open images, audio, video, or documents in the page and make the change you need without installing an editor."],
      ["Preview every change", "See the result before you export, so the final file is exactly what you expect."],
      ["Export production-ready files", "Download output that's ready for your website, presentation, or client hand-off."],
    ],
    steps: ["Upload or drag in the file you want to work with.", "Adjust the settings and preview the result.", "Download the finished file to your device."],
  },
  ai: {
    examples: [
      ["Get a result in seconds", "Hand over an image, some text, or a few numbers and read the analysis or generated output straight away."],
      ["Experiment freely", "Try different inputs and settings, compare the outcomes, and keep the one that fits best."],
      ["No account, no credits", "There is nothing to sign up for and no per-use quota to watch — open the page and run it again as often as you need."],
    ],
    steps: ["Provide your input — an image, text, or data.", "Let the tool analyze or generate the result.", "Review, refine, and reuse the output wherever you need it."],
  },
  writing: {
    examples: [
      ["Polish text in one pass", "Clean up, transform, or analyze your writing without leaving the browser."],
      ["Match the exact format", "Get output shaped precisely for your document, post, or platform requirements."],
      ["Reuse everywhere", "Copy the finished text straight into emails, docs, code, or social posts."],
    ],
    steps: ["Paste or type the text you're working with.", "Choose how it should be transformed or analyzed.", "Copy the finished text into your document or post."],
  },
  default: {
    examples: [
      ["Finish quick tasks quickly", "A focused workspace for one-off content, data, or planning jobs — open it, use it, done."],
      ["Refine until it's right", "Start with a rough input and iterate until the result matches exactly what you need."],
      ["Take the result anywhere", "Copy or download the output for your project, document, or daily workflow."],
    ],
    steps: ["Add your input to the workspace.", "Adjust the options until the result looks right.", "Copy or download the output and put it to work."],
  },
};

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function getCategories(tool) {
  if (!tool?.category) return [];
  return (Array.isArray(tool.category) ? tool.category : [tool.category]).map((item) => cleanText(item)).filter(Boolean);
}

function getTopics(tool) {
  if (!tool?.topics) return [];
  return (Array.isArray(tool.topics) ? tool.topics : [tool.topics]).map((item) => cleanText(item)).filter(Boolean);
}

function chooseTemplate(categories, slug = "", name = "") {
  const haystack = `${slug} ${name} ${categories.join(" ")}`.toLowerCase();

  if (/image|media|video|audio|pdf|file|svg|barcode/.test(haystack)) return workflowTemplates.media;
  if (/calculator|calculate|finance|loan|ratio|converter|convert|base64|csv|json|xml|yaml|unit|byte|hex|binary/.test(haystack)) {
    return /calculator|calculate|finance|loan|ratio/.test(haystack) ? workflowTemplates.calculator : workflowTemplates.converter;
  }
  if (/developer|api|code|css|html|javascript|sql|regex|cron|nginx|curl/.test(haystack)) return workflowTemplates.developer;
  if (/\bai\b|detect|recogni|generat|neural|face|emotion|smart/.test(haystack)) return workflowTemplates.ai;
  if (/text|writing|word|grammar|paraphras|summar|letter|essay|caption|bio\b/.test(haystack)) return workflowTemplates.writing;
  return workflowTemplates.default;
}

// Google shows roughly 155–160 characters of a snippet. The tool's own
// description is the only part that can match a real query, so it leads; the
// differentiator is appended only when it genuinely fits, never at the cost of
// pushing the useful copy out of the snippet.
const META_DESCRIPTION_MAX = 158;
const META_DIFFERENTIATOR = "Free, no signup, runs in your browser.";

// A cut can land right after a conjunction or preposition ("… verification or");
// drop those so the snippet still reads as a finished sentence.
const DANGLING_TAIL =
  /\s+(?:a|an|and|as|at|but|by|for|from|in|into|nor|of|on|or|per|plus|so|than|that|the|then|to|via|vs|with|without)$/i;

function endSentence(value = "") {
  const text = cleanText(value).replace(/[\s,;:—–-]+$/g, "");
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function endTruncatedSentence(value = "") {
  let text = cleanText(value).replace(/[\s,;:—–-]+$/g, "");
  while (DANGLING_TAIL.test(text)) text = text.replace(DANGLING_TAIL, "");
  return endSentence(text);
}

/**
 * Trim to `maxLength` at the nearest clause boundary — sentence end first, then
 * a comma/semicolon/dash, then a word boundary — instead of slicing mid-word
 * and appending an ellipsis.
 */
function trimAtClause(value = "", maxLength = META_DESCRIPTION_MAX) {
  const text = cleanText(value);
  if (!text) return "";
  if (text.length <= maxLength) return endSentence(text);

  const clipped = text.slice(0, maxLength);
  const floor = Math.floor(maxLength * 0.55);
  const lastBoundary = (pattern) =>
    [...clipped.matchAll(pattern)].map((match) => match.index).pop();

  const sentenceEnd = lastBoundary(/[.!?](?=\s|$)/g);
  if (sentenceEnd !== undefined && sentenceEnd >= floor) {
    return clipped.slice(0, sentenceEnd + 1).trim();
  }

  const clauseEnd = lastBoundary(/[,;:—–](?=\s)/g);
  if (clauseEnd !== undefined && clauseEnd >= floor) {
    return endTruncatedSentence(clipped.slice(0, clauseEnd));
  }

  const wordEnd = clipped.lastIndexOf(" ");
  return endTruncatedSentence(wordEnd > floor ? clipped.slice(0, wordEnd) : clipped);
}

function buildMetaDescription(name, description) {
  const base = trimAtClause(description, META_DESCRIPTION_MAX);

  if (!base) {
    return trimAtClause(
      `${name} is a free online tool on AltFTool — it opens in your browser with no signup and nothing to install`,
      META_DESCRIPTION_MAX,
    );
  }

  const withDifferentiator = `${base} ${META_DIFFERENTIATOR}`;
  return withDifferentiator.length <= META_DESCRIPTION_MAX
    ? withDifferentiator
    : base;
}

// ---------------------------------------------------------------------------
// Answer-first lead sentence
//
// Answer engines quote sentences that stand on their own. The registry gives
// every tool a name, one or more categories and a one-line description, but the
// description alone is a fragment ("Merge tiles to reach 2048…") that never
// names the thing it describes — lifted out of the page it is unattributable.
// The lead sentence below welds the tool's OWN fields into a single sentence
// that names the entity, says what kind of tool it is, where it lives and what
// it does, so the first prose after the H1 is quotable as-is.
// ---------------------------------------------------------------------------

/** Head noun a reader would use for a tool in this category. */
const CATEGORY_TYPE_NOUNS = {
  "AI Tools": "AI tool",
  Business: "business tool",
  Calculators: "calculator",
  Converters: "converter",
  "Design & Color": "design tool",
  Developer: "developer tool",
  "Education & Science": "science and education tool",
  "Finance Calculators": "finance calculator",
  Fun: "tool",
  Games: "browser game",
  Generators: "generator",
  "Health & Fitness": "health and fitness tool",
  "Health Calculators": "health calculator",
  "Image & Photo": "image tool",
  Lifestyle: "everyday tool",
  "Marketing & Social": "marketing tool",
  Other: "tool",
  "PDF & Documents": "PDF and document tool",
  Productivity: "productivity tool",
  "Security & Privacy": "privacy and security tool",
  "Text & Writing": "text tool",
  "Video & Audio": "audio and video tool",
};

/** Singular/plural tolerant word test, so "Games" blocks a second "game". */
function nameHasWord(name, word) {
  const escaped = String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}(?:e?s)?\\b`, "i").test(name);
}

/**
 * "free online developer tool", "free browser game", … — the noun phrase that
 * classifies the tool. Modifiers the name already carries are dropped so a tool
 * called "Free QR Generator" never reads "is a free free online generator".
 */
function toolTypeNoun(categories) {
  return (
    categories.map((category) => CATEGORY_TYPE_NOUNS[category]).find(Boolean) ||
    "tool"
  );
}

function describeToolType(name, noun) {
  // "browser game" already says where it runs; anything else gets "online".
  const modifiers = /browser/.test(noun) ? ["free"] : ["free", "online"];
  return [...modifiers.filter((word) => !nameHasWord(name, word)), noun].join(" ");
}

// Part of the catalogue is written in transliterated Hindi ("… aur inverted
// normals detect kare"). Those descriptions are real content and still render
// verbatim, but they must never be spliced into an English relative clause —
// the result would be a sentence this builder invented and cannot defend.
const TRANSLITERATED_MARKERS =
  /\b(?:aur|kare|karein|karke|karta|karne|karna|kijiye|karega|dikhaye|dikhaega|banaye|banaen|bataye|nikale|dhoonde|badle|jaaye|hain|mein|saath|liye|wala|wale|rahe|kaise)\b/i;

// First words that read as an instruction to the reader, i.e. the description
// can be spliced after "…that lets you". Derived from the actual first-word
// distribution of the 1,451 registry descriptions; anything not listed falls
// back to the safe two-sentence form.
const IMPERATIVE_VERBS = new Set([
  "add", "adjust", "analyse", "analyze", "annotate", "answer", "apply", "archive",
  "ask", "assess", "audit", "beautify", "boost", "break", "brighten", "browse",
  "build", "calculate", "capture", "catch", "challenge", "change", "check",
  "choose", "clean", "classify", "clip", "collapse", "compare", "compress",
  "compute", "configure", "contact", "convert", "copy", "count", "cover",
  "create", "crop", "cut", "decode", "delete", "design", "detect", "discover",
  "download", "draw", "drop", "edit", "embed", "encode", "enhance", "enter",
  "escape", "estimate", "evaluate", "expand", "experience", "explain", "explore",
  "export", "expose", "extract", "filter", "find", "fit", "flag", "flip",
  "follow", "forecast", "format", "freeze", "gamify", "generate", "get", "group",
  "guess", "hash", "hide", "highlight", "identify", "import", "improve",
  "inspect", "join", "keep", "learn", "lint", "log", "look", "lookup",
  "maintain", "manage", "map", "mark", "mask", "master", "measure", "merge",
  "mix", "monitor", "open", "optimise", "optimize", "organise", "organize",
  "parse", "paste", "pause", "perform", "pick", "plan", "play", "practice",
  "practise", "predict", "prepare", "preview", "print", "prioritise",
  "prioritize", "project", "query", "rank", "reach", "read", "rearrange",
  "record", "reduce", "reject", "remove", "render", "repeat", "replace",
  "resize", "reverse", "review", "rewrite", "roll", "rotate", "run", "save",
  "scale", "scan", "schedule", "score", "screen", "scrub", "search", "see",
  "segment", "select", "send", "set", "share", "sharpen", "shift", "shrink",
  "simplify", "simulate", "size", "smash", "solve", "sort", "spin", "split",
  "stop", "store", "summarise", "summarize", "swap", "sync", "tag", "take",
  "tap", "test", "trace", "track", "train", "transform", "translate", "trim",
  "try", "tune", "turn", "uncover", "understand", "upload", "validate",
  "view", "visualise", "visualize", "watch", "whack", "work", "write", "zoom",
]);

// Above this, "… that lets you <description>" becomes a 250-character sentence
// nobody would quote; those descriptions get their own sentence instead.
const PREDICATE_MAX_LENGTH = 170;

/**
 * Turn an imperative description into a clause that can follow "that lets you",
 * or return null when the description is not shaped for it.
 */
function toPredicateClause(description) {
  const raw = cleanText(description);
  // A question or exclamation cannot become the tail of "…that lets you X." —
  // stripping its mark turns it into an ungrammatical statement.
  if (/[?!]\s*$/.test(raw)) return null;

  const text = raw.replace(/\s*[.!?]+$/, "");
  if (!text || text.length > PREDICATE_MAX_LENGTH) return null;
  if (TRANSLITERATED_MARKERS.test(text)) return null;

  const firstWord = (text.split(/\s+/)[0] || "")
    .replace(/[^A-Za-z-]/g, "")
    .toLowerCase();
  if (!IMPERATIVE_VERBS.has(firstWord)) return null;

  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * The self-contained sentence that opens the page. One sentence when the
 * description splices cleanly; otherwise two, the first of which still names
 * the tool, its type and where it lives, so neither half needs prior context.
 */
function buildAnswerSentence({ name, typePhrase, description }) {
  // The article follows the phrase's initial sound, and that changes whenever
  // describeToolType drops a modifier ("a free online tool" -> "an online tool"
  // when the name already contains "free").
  const article = /^[aeiou]/i.test(typePhrase) ? "an" : "a";
  const subject = `${name} is ${article} ${typePhrase} on AltFTool`;
  const clause = toPredicateClause(description);
  if (clause) return `${subject} that lets you ${clause}.`;

  // Do not weld on a description the builder already judged unsafe to splice —
  // a transliterated-Hindi fragment after an English subject reads as broken in
  // both languages, and this sentence also ships as the meta description. The
  // raw description still renders as its own paragraph below.
  const text = cleanText(description);
  if (!text || TRANSLITERATED_MARKERS.test(text)) return `${subject}.`;

  const detail = endSentence(description);
  return detail ? `${subject}. ${detail}` : `${subject}.`;
}

// A handful of hand-written intros open on a demonstrative with no antecedent
// ("This calculator converts an absolute return into…"). Read on the page that
// is fine; retrieved as a standalone chunk it names nothing. Swapping in the
// tool's own name costs nothing and makes the paragraph self-describing.
const GENERIC_TOOL_NOUNS =
  "tool|calculator|converter|generator|checker|estimator|planner|page|utility|app|widget|tracker|analyzer|analyser|formatter|editor|viewer|game|simulator|solver|tester|scanner|builder|finder|counter|explorer|inspector|visualizer|visualiser|dashboard|maker|helper|workspace";
const LEADING_DEMONSTRATIVE = new RegExp(
  `^(?:This|The)\\s+(?:${GENERIC_TOOL_NOUNS})\\b(?!\\s+of\\b)`,
);

function anchorIntro(intro, name) {
  const text = cleanText(intro);
  if (!text || !name) return text;
  if (LEADING_DEMONSTRATIVE.test(text)) return text.replace(LEADING_DEMONSTRATIVE, name);
  if (/^It\s/.test(text)) return text.replace(/^It\s/, `${name} `);
  return text;
}

/**
 * The at-a-glance table. Every row is either the tool's own registry metadata
 * or a fact that holds for every page in the corpus and is already asserted by
 * the SoftwareApplication JSON-LD. Nothing here is inferred per tool.
 */
function buildFacts(categories, topics) {
  const facts = [];
  if (categories.length) {
    facts.push({ label: "Tool type", value: categories.join(" · ") });
  }
  if (topics.length) {
    // `topics` is a subject taxonomy, not an audience — labelling it "Made for"
    // produced rows like "Made for: Web" and "Made for: Calculator".
    facts.push({ label: "Topics", value: topics.join(" · ") });
  }
  facts.push({
    label: "Price",
    value: "Free — no account, no trial limit and no paid tier.",
  });
  facts.push({
    label: "What you need",
    value:
      "A modern web browser with JavaScript enabled, on desktop, tablet or mobile.",
  });
  facts.push({
    label: "Not required",
    value: "No download, no install and no sign-up.",
  });
  return facts;
}

export function buildToolSeoContent(slug, tool = {}) {
  const name = cleanText(tool.name) || cleanText(slug).replace(/[-_]/g, " ");
  const description = cleanText(tool.description);
  const categories = getCategories(tool);
  const topics = getTopics(tool);
  const primaryCategory = categories[0] || "";
  const template = chooseTemplate(categories, slug, name);
  const summary = buildMetaDescription(name, description);

  // The head noun for this category, e.g. "developer tool", "AI tool",
  // "browser game". Prose uses this rather than the raw category label, which
  // lowercases into nonsense ("a free ai tools tool", "a free pdf & documents
  // tool"); the raw label is kept only where it is quoted as a section name.
  const typeNoun = toolTypeNoun(categories);
  const typeNounPlural = `${typeNoun}s`;
  // Per-tool src/tools/<slug>/seo.js wins over the legacy shared map: newer
  // tools ship their own file, older ones still live in toolContentOverrides.
  const override = generatedToolSeo[slug] || toolContentOverrides[slug] || null;
  // ALTF Engine: admin-managed per-page content override (highest precedence).
  // Empty/disabled => {} so behavior is identical to before.
  const central = resolveContent(getSeoConfigSnapshot(), `/tools/all/${slug}`);

  const typePhrase = describeToolType(name, typeNoun);
  const answer = buildAnswerSentence({ name, typePhrase, description });

  // Keep the intro complementary to the answer sentence above it — never
  // restate the raw description (it used to appear 3× on the page: header,
  // intro and summary).
  // A game has no input to add and no result to download, so it needs its own
  // fallback rather than the utility one.
  const isGame = /\bgames?\b/i.test(typeNoun);
  const fallbackIntro = isGame
    ? `${name} is one of the free ${typeNounPlural} on AltFTool: open the page and play straight away. There is no account to create and nothing to install — it is a web page, so it works the same on desktop, tablet and mobile.`
    : `${name} is one of the free ${typeNounPlural} on AltFTool: open the page, add your input, and copy or download the result. There is no account to create and nothing to install — it is a web page, so it works the same on desktop, tablet and mobile.`;

  const intro = anchorIntro(
    central.intro || override?.intro || fallbackIntro,
    name,
  );

  // Examples (benefits): central admin override > hand-written code override >
  // category template (with the tool name injected so copy stays unique).
  const examples = central.benefits?.length
    ? central.benefits.map((b) => ({ title: b.title, body: b.body }))
    : override?.benefits?.length
    ? override.benefits.map(([title, body]) => ({ title, body }))
    : template.examples.map(([title, body]) => ({ title, body }));

  const faqs = central.faqs?.length
    ? central.faqs.map((f) => ({ question: f.q, answer: f.a }))
    : override?.faqs?.length
    ? override.faqs.map(([question, answer]) => ({ question, answer }))
    : [
        // Fallback Q&As only. Each answer states something verifiable for every
        // tool in the corpus — no claim about where a given tool processes your
        // input, because the registry carries no such signal (see the integrity
        // note at the top of this file).
        {
          question: `What is ${name}?`,
          answer: primaryCategory
            ? `${answer} It sits in the ${primaryCategory} section of the AltFTool library.`
            : answer,
        },
        {
          question: `Is ${name} free to use?`,
          answer: `Yes — ${name} is free on AltFTool. There is no account to create, no trial limit and no paid tier.`,
        },
        {
          question: `Do I need to install anything to use ${name}?`,
          answer: `No. ${name} is a web page, so it opens in any modern browser on desktop, tablet or mobile with nothing to download and no extension to add.`,
        },
        {
          question: `What can I use ${name} for?`,
          answer: description
            ? `${endSentence(description)} It is one of the free ${typeNounPlural} on AltFTool, so the result is ready to copy or download straight away.`
            : `${name} is one of the free ${typeNounPlural} on AltFTool, built for quick everyday jobs with results you can copy or download straight away.`,
        },
      ];

  // Whether the FAQs/steps above came from a real per-tool source rather than
  // the shared category template. Google requires FAQPage markup to be unique
  // to the page; emitting the four name-swapped fallback Q&As as FAQPage on
  // every templated tool is a structured-data policy risk across ~1,900 URLs.
  // The fallback prose still renders for readers — only the schema is gated.
  const hasCuratedFaqs = Boolean(central.faqs?.length || override?.faqs?.length);
  const hasCuratedSteps = Boolean(
    central.steps?.length || override?.steps?.length,
  );

  return {
    name,
    h1: central.h1 || name,
    heading: `${name} workflows`,
    summary,
    // The self-contained opening sentence. Rendered as the first prose after
    // the H1 and reused as the "What is …?" fallback answer.
    answer,
    intro,
    metaDescription: summary,
    facts: buildFacts(categories, topics),
    // Entity-anchored, question-form section headings. A retrieval chunk that
    // starts at any of these headings identifies its own subject. `howTo` is
    // also the name any HowTo JSON-LD for this page must carry, so the markup
    // and the visible heading stay identical.
    headings: {
      facts: `${name} at a glance`,
      howTo: `How do I use ${name}?`,
      why: `Why use ${name}?`,
      useCases: `What can I do with ${name}?`,
      faq: `Frequently asked questions about ${name}`,
      related: `Tools related to ${name}`,
      embed: `How do I embed ${name} on my site?`,
    },
    hasCuratedFaqs,
    hasCuratedSteps,
    useCases: central.useCases?.length ? central.useCases : override?.useCases || [],
    examples,
    // Per-tool "How to use" steps when available (admin override > hand/AI
    // override > category template), so each tool reads uniquely.
    steps: central.steps?.length
      ? central.steps
      : override?.steps?.length
      ? [`Open ${name} on AltFTool — it loads instantly in your browser.`, ...override.steps]
      : [`Open ${name} on AltFTool — it loads instantly in your browser.`, ...template.steps],
    faqs,
  };
}
