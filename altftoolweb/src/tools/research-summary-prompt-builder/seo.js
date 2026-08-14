const seo = {
  title: "Research Paper Summary Prompt with Word Budgets",
  metaDescription:
    "Build an AI prompt that summarises a paper into background, question, method, findings, limitations and implications, with word budgets that add up.",
  steps: [
    "Set 'Summary length in words' between 100 and 1500, choose who the summary is for — expert, student in an adjacent field, or educated non-specialist — and optionally name the research field.",
    "Under 'Sections to include' tick Background & context, Research question / hypothesis, Method, Key findings, Limitations and Implications; Method takes 25% and Limitations 15% of the budget.",
    "Leave 'Cite the section or page for each claim' on, optionally add a jargon glossary, then press Copy prompt and paste it plus your paper into your assistant.",
  ],
  intro:
    "The Research Summary Prompt Builder writes an AI prompt that turns a research paper into a structured-abstract summary — background, research question, method, findings, limitations and implications — with a word budget attached to each section. The budgets are apportioned from your chosen total using largest-remainder rounding, so the section counts always add up exactly to the length you asked for, and the prompt carries an explicit rule that any detail the paper does not state must be written as \"not reported\" rather than guessed. It is built for students, reviewers and researchers who need a summary that keeps the method and the caveats instead of collapsing a paper into three cheerful sentences.",
  useCases: [
    "A postgraduate student screening 40 papers for a literature review wants each one reduced to 300 words that still name the sample size and the design.",
    "A journal peer reviewer generates a neutral method-and-limitations summary before writing their own assessment of a submission.",
    "A science communicator asks for a 500-word summary aimed at an educated non-specialist, with every technical term defined on first use and a glossary at the end.",
  ],
  benefits: [
    ["Method and limitations kept", "Method and limitations get 25% and 15% of the word budget by default, the sections generic summarisers usually drop."],
    ["Budgets that add up", "Largest-remainder apportionment splits the total into whole words per section with no rounding drift."],
    ["Anti-fabrication rule", "The prompt forbids estimating missing details and requires \"not reported\" instead, plus — while the citation checkbox stays on, which it is by default — a section or page reference for each key claim."],
  ],
  faqs: [
    [
      "What sections should a research paper summary have?",
      "Use the structured-abstract sections derived from IMRaD: background, research question, method, findings, limitations and implications. Journals such as JAMA and the BMJ have required structured abstracts since the late 1980s precisely because unstructured summaries omit design and sample details that readers need to judge the work.",
    ],
    [
      "How long should a summary of a research paper be?",
      "For screening a paper, 250 to 400 words is usually enough — roughly the length of a journal structured abstract, which is typically capped at 250 to 300 words. This builder accepts anything from 100 to 1500 words and divides the total across the sections you select.",
    ],
    [
      "Can AI accurately summarise a scientific paper?",
      "It can produce a usable draft but not a trustworthy one on its own: large language models routinely soften hedged claims, misread numbers in tables and invent details that were never in the text. That is why the generated prompt always requires exact figures with their units and \"not reported\" for anything missing, and by default also a section or page reference for each key claim (leave the \"Cite the section or page\" checkbox on) — so the errors are easy to spot and check.",
    ],
    [
      "Does this tool summarise the paper for me?",
      "No. It builds the prompt text locally in your browser; you paste that prompt plus your paper into ChatGPT, Claude, Gemini or any other assistant. Nothing is uploaded and no paper is sent anywhere by this page, which also keeps you clear of publisher terms that restrict redistributing paywalled PDFs.",
    ],
  ],
};

export default seo;
