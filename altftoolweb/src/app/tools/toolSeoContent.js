import { toolContentOverrides } from "./toolContentOverrides";
import { generatedToolSeo } from "./generated/toolSeoMap";
import { getSeoConfigSnapshot } from "@/platform/seo/seoConfigSource";
import { resolveContent } from "@altftool/core/seo/resolver";

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
      ["Edit without uploading", "Process images, audio, video, and documents directly in your browser — files never leave your device."],
      ["Preview every change", "See the result before you export, so the final file is exactly what you expect."],
      ["Export production-ready files", "Download output that's ready for your website, presentation, or client hand-off."],
    ],
    steps: ["Upload or drag in the file you want to work with.", "Adjust the settings and preview the result.", "Download the finished file to your device."],
  },
  ai: {
    examples: [
      ["Get AI-powered results instantly", "Run the analysis or generation right in your browser and see results within seconds."],
      ["Experiment freely", "Try different inputs and settings, compare the outcomes, and keep the one that fits best."],
      ["Stay private by design", "Processing happens on your device wherever possible — your data isn't shipped to a server."],
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
      `${name} runs entirely in your browser on AltFTool — no signup, no install, and nothing to upload`,
      META_DESCRIPTION_MAX,
    );
  }

  const withDifferentiator = `${base} ${META_DIFFERENTIATOR}`;
  return withDifferentiator.length <= META_DESCRIPTION_MAX
    ? withDifferentiator
    : base;
}

export function buildToolSeoContent(slug, tool = {}) {
  const name = cleanText(tool.name) || cleanText(slug).replace(/[-_]/g, " ");
  const description = cleanText(tool.description);
  const categories = getCategories(tool);
  const primaryCategory = categories[0] || "online";
  const template = chooseTemplate(categories, slug, name);
  const summary = buildMetaDescription(name, description);

  // Keep short acronym categories (AI, SEO, CSS…) uppercase in prose;
  // longer labels read naturally in lowercase.
  const categoryLabel = primaryCategory
    ? primaryCategory.length <= 3
      ? primaryCategory.toUpperCase()
      : primaryCategory.toLowerCase()
    : "online";
  // Per-tool src/tools/<slug>/seo.js wins over the legacy shared map: newer
  // tools ship their own file, older ones still live in toolContentOverrides.
  const override = generatedToolSeo[slug] || toolContentOverrides[slug] || null;
  // ALTF Engine: admin-managed per-page content override (highest precedence).
  // Empty/disabled => {} so behavior is identical to before.
  const central = resolveContent(getSeoConfigSnapshot(), `/tools/all/${slug}`);

  // Keep the intro complementary to the description shown in the section
  // header — never restate the raw description (it used to appear 3× on the
  // page: header, intro and summary).
  const intro =
    central.intro ||
    override?.intro ||
    `${name} is a free ${categoryLabel} tool that runs entirely in your browser — nothing to install, no account to create, and your data never leaves your device. Open the page, add your input, and get a clean, copy-ready result in seconds.`;

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
        {
          question: `Is ${name} free to use?`,
          answer: `Yes — ${name} is completely free on AltFTool, with no signup, no trial limits, and no hidden costs.`,
        },
        {
          question: `Is my data private when I use ${name}?`,
          answer: `Yes. ${name} runs in your browser, so what you enter or upload stays on your device instead of being sent to a server.`,
        },
        {
          question: `What can I use ${name} for?`,
          answer: description
            ? `${description.replace(/\.$/, "")}. It's built for quick, everyday ${categoryLabel} tasks with results you can copy or download straight away.`
            : `${name} is built for quick, everyday ${categoryLabel} tasks with results you can copy or download straight away.`,
        },
        {
          question: `Does ${name} work on mobile?`,
          answer: `Yes — ${name} works in any modern browser, on desktop, tablet, and mobile, with the same features everywhere.`,
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
    intro,
    metaDescription: summary,
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
