import "server-only";

import { cache } from "react";
import { brotliDecompressSync } from "node:zlib";
import { toolContentOverrides } from "./toolContentOverrides";
import { generatedToolSeoBrotliBase64 } from "./generated/toolSeoMap";
import { toolNetworkDestinations } from "./generated/toolNetworkMap";
import { getSeoConfigSnapshot } from "@/platform/seo/seoConfigSource";
import { resolveContent } from "@altftool/core/seo/resolver";
import { buildMetaDescription } from "./toolMetaDescription";

let decodedGeneratedToolSeo = null;

function getGeneratedToolSeo(slug) {
  if (!decodedGeneratedToolSeo) {
    const compressed = Buffer.from(generatedToolSeoBrotliBase64, "base64");
    decodedGeneratedToolSeo = JSON.parse(
      brotliDecompressSync(compressed).toString("utf8"),
    );
  }

  return decodedGeneratedToolSeo[slug] || null;
}

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
      ["Work from your browser", "Process images, audio, video, and documents without installing desktop software. Check the individual tool page for its network and privacy details."],
      ["Preview every change", "See the result before you export, so the final file is exactly what you expect."],
      ["Export production-ready files", "Download output that's ready for your website, presentation, or client hand-off."],
    ],
    steps: ["Upload or drag in the file you want to work with.", "Adjust the settings and preview the result.", "Download the finished file to your device."],
  },
  ai: {
    examples: [
      ["Get AI-powered results instantly", "Run the analysis or generation right in your browser and see results within seconds."],
      ["Experiment freely", "Try different inputs and settings, compare the outcomes, and keep the one that fits best."],
      ["Understand the workflow", "Review the individual tool page for its processing, network, and privacy details before adding sensitive data."],
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

// The type nouns the generated intros actually use to refer to themselves,
// taken from the leading word of every generated intro rather than guessed.
const SUBJECT_NOUNS = [
  "analyser", "analyzer", "advisor", "app", "auditor", "board", "builder",
  "calculator", "checker", "checklist", "chooser", "comparator", "comparer",
  "comparison", "converter", "counter", "countdown", "dashboard", "debugger",
  "decoder", "detector", "estimator", "explainer", "explorer", "filter",
  "finder", "fitter", "formatter", "generator", "guide", "helper", "inspector",
  "joiner", "library", "linter", "matcher", "optimizer", "organiser",
  "organizer", "page", "planner", "reader", "redactor", "reference", "scanner",
  "scheduler", "scorer", "screener", "selector", "simulator", "splitter",
  "suggester", "tester", "timer", "tool", "tracker", "utility", "validator",
  "visualizer", "widget", "workbench", "workspace", "worksheet",
];
// Nouns that carry no information beyond "this thing", so repeating them after
// the tool's own name would only pad the sentence.
const BARE_SUBJECT_NOUNS = new Set([
  "app", "helper", "page", "tool", "utility", "widget", "workspace",
]);
const SUBJECT_NOUN_SET = new Set(SUBJECT_NOUNS);
// Does the tool's own name already carry a type word anywhere in it? Matching
// the whole name, not just its last word, is what keeps "Calcium Intake
// Calculator For Women" from being introduced as "…For Women calculator".
const NAME_HAS_TYPE = new RegExp(`\\b(?:${SUBJECT_NOUNS.join("|")})\\b`, "i");

/**
 * AEO: the first sentence of the intro is the one an answer engine lifts as
 * this page's answer, and 1,471 of the 3,943 generated intros open with a bare
 * demonstrative — "This calculator runs a two-sided pooled two-proportion
 * z-test…". Quoted anywhere off the page, that sentence names no subject, so
 * nothing attributes it back here and the engine learns which page it came
 * from only by accident. 1,309 of those 1,471 are rewritten below; the other
 * 162 open with something this cannot safely rewrite and are left alone.
 *
 * Binding the referent to the tool's own name asserts nothing new: on
 * /tools/all/<slug>, "this calculator" IS that tool. Only a leading
 * "This <type noun>" or "This is a/an/the …" is rewritten — a leading "This"
 * followed by a verb, an adjective or a proper noun ("This turns…", "This XML
 * sitemap validator…") is left exactly as written rather than risking a broken
 * sentence for the sake of a rule.
 */
function bindIntroSubject(intro, name) {
  if (!intro || !name || !/^This\b/.test(intro)) return intro;

  const definition = intro.match(/^This is (an?|the) /);
  if (definition) {
    return `${name} is ${definition[1]} ${intro.slice(definition[0].length)}`;
  }

  // The type phrase can be two words ("This reference tool looks up…"), so the
  // second word is swallowed too when it is itself a type noun — otherwise the
  // leftover produced "The Time Complexity Cheat Tool tool looks up…".
  const opener = intro.match(/^This ([a-z][a-z-]*)(?: ([a-z][a-z-]*))? /);
  if (!opener || !SUBJECT_NOUN_SET.has(opener[1])) return intro;
  const compound = opener[2] && SUBJECT_NOUN_SET.has(opener[2]);
  const noun = compound ? opener[2] : opener[1];
  const consumed = compound
    ? `This ${opener[1]} ${opener[2]} `
    : `This ${opener[1]} `;
  const keepNoun = !BARE_SUBJECT_NOUNS.has(noun) && !NAME_HAS_TYPE.test(name);
  const subject = keepNoun ? `The ${name} ${noun}` : `The ${name}`;
  return `${subject} ${intro.slice(consumed.length)}`;
}

function getCategories(tool) {
  if (!tool?.category) return [];
  return (Array.isArray(tool.category) ? tool.category : [tool.category]).map((item) => cleanText(item)).filter(Boolean);
}

// The tool's own primary category is curated, is the taxonomy the rest of the
// site already routes on, and is the only signal here that cannot be produced
// by an accident of spelling. Consulting it first is what stops "Audio File
// Size Calculator" — a Calculators tool with no file anywhere in it — from
// being told to "Upload or drag in the file you want to work with" and then to
// "Download the finished file to your device", which is what /tools/all/
// audio-file-size-calculator serves today. Categories with no single honest
// workflow (Generators, Security & Privacy, Business, Lifestyle, …) are left
// to the name heuristic below.
const CATEGORY_WORKFLOWS = {
  "Calculators": "calculator",
  "Finance Calculators": "calculator",
  "Health Calculators": "calculator",
  "Converters": "converter",
  "Developer": "developer",
  "Text & Writing": "writing",
  "AI Tools": "ai",
  "Image & Photo": "media",
  "Video & Audio": "media",
  "PDF & Documents": "media",
};

// A tool named as a generator, checklist, quiz or calculator builds its output
// from what you type into it. It has nothing to upload and returns nothing to
// paste back into a codebase, so the `file` and `code` substrings must not be
// allowed to speak for it.
const BUILDS_FROM_INPUTS =
  /generator|maker|creator|builder|checklist|quiz|planner|guide|cheat|calculator|estimator|tracker/;

// Narrower than the above: a checklist, quiz, guide, calculator, estimator,
// planner or tracker has no file input at all, so the media workflow — which
// opens with "Upload or drag in the file you want to work with" — is false for
// one however its name is spelled.
const NEVER_TAKES_A_FILE = /checklist|quiz|guide|cheat|calculator|estimator|planner|tracker/;

const MEDIA_CATEGORIES = new Set([
  "Image & Photo",
  "Video & Audio",
  "PDF & Documents",
]);

function chooseTemplate(categories, slug = "", name = "") {
  const byCategory = CATEGORY_WORKFLOWS[categories[0]];
  if (byCategory) {
    // A Developer tool also filed under a media category is one you hand a
    // file to, not one you paste code into: Accessible Document Checker
    // (Developer + PDF & Documents) opens a PDF, DOCX, XLSX or PPTX, so
    // "Copy the polished result straight back into your project" describes
    // nothing it does.
    if (byCategory === "developer" && categories.some((c) => MEDIA_CATEGORIES.has(c))) {
      return workflowTemplates.media;
    }
    return workflowTemplates[byCategory];
  }

  const haystack = `${slug} ${name} ${categories.join(" ")}`.toLowerCase();
  const buildsFromInputs = BUILDS_FROM_INPUTS.test(haystack);

  // `ratio`, `api` and `unit` are anchored because inside a longer word they
  // carry no meaning at all and were choosing the copy for 22 tools:
  // ration-card-category-explainer and every hydration planner matched
  // "ratio", capital-city-quiz matched "api", community-post-planner matched
  // "unit". They were served calculator, developer and converter workflows.
  //
  // The rest stay unanchored on purpose. `file` catching "profile-picture-*"
  // and `code` catching "encoder-decoder" are accidents, but they land those
  // tools in media and developer, which is where they belong — anchoring them
  // moved profile-picture-maker out of media and rot13-encoder-decoder into
  // writing. Fix what is meaningless, not what is merely lucky.
  //
  // What is meaningless here: `image` matched "afterimage-generator" and
  // `media` matched "social-media-app-permission-audit", so both were told to
  // upload a file they have no input for — hence the word-start anchors. And
  // `file`/`code` now only speak for a tool that is not named as one building
  // its output from typed input, so profile-picture-maker keeps media through
  // `image` while "CODEOWNERS File Generator" and "Caddyfile Generator" stop
  // being handed an upload step.
  const neverTakesAFile = NEVER_TAKES_A_FILE.test(haystack);
  if (!neverTakesAFile && /\bimage|\bmedia|\bvideo|\baudio|\bpdf|\bsvg/.test(haystack)) {
    return workflowTemplates.media;
  }
  if (!buildsFromInputs && /file|barcode/.test(haystack)) return workflowTemplates.media;
  if (/calculator|calculate|finance|loan|\bratio\b|converter|convert|base64|csv|json|xml|yaml|\bunit|byte|hex|binary/.test(haystack)) {
    return /calculator|calculate|finance|loan|\bratio\b/.test(haystack) ? workflowTemplates.calculator : workflowTemplates.converter;
  }
  if (/developer|\bapi\b|css|html|javascript|sql|regex|cron|nginx|curl/.test(haystack)) return workflowTemplates.developer;
  if (!buildsFromInputs && /code/.test(haystack)) return workflowTemplates.developer;
  if (/\bai\b|detect|recogni|generat|neural|face|emotion|smart/.test(haystack)) return workflowTemplates.ai;
  if (/text|writing|word|grammar|paraphras|summar|letter|essay|caption|bio\b/.test(haystack)) return workflowTemplates.writing;
  return workflowTemplates.default;
}

// Memoised per request. buildToolMetadata, the page body and ToolSeoSection
// each build the same content for one render, and each call resolves
// overrides and the generated SEO shard for the slug.
// The shared copy above promises that a tool needing to contact a service says
// so on its own page. This is what makes that true. Destinations come from
// generated/toolNetworkMap.js, derived by scanning each tool's own directory
// for a literal fetch()/axios() target — evidence, not assumption. Silence is
// deliberately NOT a local-only claim: a tool absent from the map is one where
// no direct call was found, and the copy then says nothing either way.
function networkNote(slug) {
  const hosts = toolNetworkDestinations(slug);
  if (!hosts || hosts.length === 0) return "";
  const external = hosts.filter((h) => h !== "self");
  if (external.length === 0) {
    return " To produce a result it sends your input to AltFTool's own server, so it does not work offline.";
  }
  return ` To produce a result it sends your input to ${external.slice(0, 2).join(" and ")}, so it does not work offline.`;
}

export const buildToolSeoContent = cache(function buildToolSeoContent(slug, tool = {}) {
  const name = cleanText(tool.name) || cleanText(slug).replace(/[-_]/g, " ");
  const description = cleanText(tool.description);
  const categories = getCategories(tool);
  const primaryCategory = categories[0] || "online";
  const template = chooseTemplate(categories, slug, name);

  // Keep short acronym categories (AI, SEO, CSS…) uppercase in prose;
  // longer labels read naturally in lowercase.
  const categoryLabel = primaryCategory
    ? primaryCategory.length <= 3
      ? primaryCategory.toUpperCase()
      : primaryCategory.toLowerCase()
    : "online";
  // Per-tool src/tools/<slug>/seo.js wins over the legacy shared map: newer
  // tools ship their own file, older ones still live in toolContentOverrides.
  const generatedOverride = getGeneratedToolSeo(slug);
  const legacyOverride = toolContentOverrides[slug] || null;
  const override =
    generatedOverride || legacyOverride
      ? { ...(legacyOverride || {}), ...(generatedOverride || {}) }
      : null;
  // ALTF Engine: admin-managed per-page content override (highest precedence).
  // Empty/disabled => {} so behavior is identical to before.
  const central = resolveContent(getSeoConfigSnapshot(), `/tools/all/${slug}`);
  // Hand-written meta descriptions win over the generic "X is a free Y tool…
  // Use X online for Z tasks…" formula, which reads as boilerplate in search
  // snippets and depresses CTR even at a strong ranking position.
  const summary =
    central.metaDescription ||
    override?.metaDescription ||
    buildMetaDescription(name, description, primaryCategory);

  // Keep the intro complementary to the description shown in the section
  // header — never restate the raw description (it used to appear 3× on the
  // page: header, intro and summary).
  const intro = bindIntroSubject(
    central.intro ||
      override?.intro ||
      // The fallback must not make a local-only promise: some tools call a
      // remote origin or one of our API routes. A tool that really is
      // local-only may say so in its reviewed per-tool content.
      `${name} is a free ${categoryLabel} tool that runs in your browser — nothing to install and no account to create. Open the page, add your input, and get a clean, copy-ready result in seconds.${networkNote(slug)}`,
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
        {
          question: `Is ${name} free to use?`,
          answer: `Yes — ${name} is completely free on AltFTool, with no signup, no trial limits, and no hidden costs.`,
        },
        {
            // Network behaviour varies by tool, so the shared answer cannot
            // make a privacy promise on the tool's behalf.
            question: `Do I need an account to use ${name}?`,
            answer: `No. ${name} is free on AltFTool with no signup and nothing to install. Network behaviour depends on the tool, so avoid sensitive data unless its page explicitly explains how the input is processed.`,
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
    title: central.title || override?.title || null,
    h1: central.h1 || override?.h1 || name,
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
});
