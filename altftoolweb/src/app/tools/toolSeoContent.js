const workflowTemplates = {
  developer: {
    examples: [
      ["Debug a copied snippet", "Paste code, payloads, or commands from your editor and clean them before sharing."],
      ["Prepare API payloads", "Convert, format, or inspect data before it goes into tests, docs, or requests."],
      ["Review output quickly", "Use the generated result as a copy-ready starting point for your next task."],
    ],
    steps: ["Add your code or data sample.", "Choose the formatter, converter, or analyzer action.", "Review the output and copy the final result."],
  },
  converter: {
    examples: [
      ["Convert copied content", "Move text, files, or encoded data into the format your workflow needs."],
      ["Inspect before publishing", "Check the converted result before placing it in an app, document, or message."],
      ["Create a clean output", "Keep the result ready for download, copy, or quick reuse."],
    ],
    steps: ["Paste or upload the source input.", "Select the conversion mode that matches your target format.", "Copy or download the converted output."],
  },
  calculator: {
    examples: [
      ["Estimate a value", "Enter the known values and get a fast calculation for planning or comparison."],
      ["Compare scenarios", "Adjust inputs to see how the result changes across common cases."],
      ["Save a clear result", "Use the final number in notes, reports, or next-step decisions."],
    ],
    steps: ["Enter the values you already know.", "Adjust the options for your scenario.", "Use the calculated result for comparison or planning."],
  },
  media: {
    examples: [
      ["Prepare local assets", "Convert or inspect images, audio, video, and files directly in the workspace."],
      ["Preview before export", "Check the result visually where the tool supports previews."],
      ["Download the final file", "Keep the output ready for testing, upload, or documentation."],
    ],
    steps: ["Upload or paste the local asset data.", "Choose the output mode or preview option.", "Download or copy the finished result."],
  },
  default: {
    examples: [
      ["Clean a quick task", "Use the workspace for one-off content, data, or planning work."],
      ["Try a sample workflow", "Start with a small input and refine it until the result matches your need."],
      ["Keep output reusable", "Copy the finished result into your project, document, or daily workflow."],
    ],
    steps: ["Add the input for the task.", "Set the available options for the result you need.", "Review the output and reuse it where needed."],
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
  if (/calculator|calculate|finance|loan|ratio|converter|convert|base64|csv|json|xml|yaml|text|unit|byte|hex|binary/.test(haystack)) {
    return /calculator|calculate|finance|loan|ratio/.test(haystack) ? workflowTemplates.calculator : workflowTemplates.converter;
  }
  if (/developer|api|code|css|html|javascript|sql|regex|cron|nginx|curl/.test(haystack)) return workflowTemplates.developer;
  return workflowTemplates.default;
}

function buildMetaDescription(name, description, primaryCategory) {
  const base = cleanText(description) || `${name} is a free online tool for quick browser-based workflows.`;
  const suffix = `Use ${name} online for ${primaryCategory || "daily"} tasks with quick examples and copy-ready results.`;
  const combined = `${base} ${suffix}`;
  return combined.length > 158 ? `${combined.slice(0, 155).trim()}...` : combined;
}

export function buildToolSeoContent(slug, tool = {}) {
  const name = cleanText(tool.name) || cleanText(slug).replace(/[-_]/g, " ");
  const description = cleanText(tool.description);
  const categories = getCategories(tool);
  const primaryCategory = categories[0] || "online";
  const template = chooseTemplate(categories, slug, name);
  const summary = buildMetaDescription(name, description, primaryCategory);

  return {
    name,
    heading: `${name} workflows`,
    summary,
    metaDescription: summary,
    examples: template.examples.map(([title, body]) => ({ title, body })),
    steps: template.steps,
    faqs: [
      {
        question: `Is ${name} free to use?`,
        answer: `Yes. ${name} is available as a free online tool on AltFTool.`,
      },
      {
        question: `What can I use ${name} for?`,
        answer: description || `${name} helps with ${primaryCategory.toLowerCase()} workflows and quick browser-based tasks.`,
      },
      {
        question: `Does ${name} work on mobile?`,
        answer: `Yes. ${name} is designed for modern desktop and mobile browsers.`,
      },
    ],
  };
}
