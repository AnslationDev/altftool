const seo = {
  title: "Technical Doc Prompt Builder on the Diátaxis Model",
  metaDescription:
    "Pick tutorial, how-to, reference or explanation and get a prompt with that type's sections, Google/Microsoft style rules and TODO(author) for gaps.",
  steps: [
    "Fill \"What is being documented? (required)\", choose the Document type (Diátaxis) — Tutorial (learning-oriented), How-to guide (task-oriented), Reference (information-oriented) or Explanation (understanding-oriented) — and an Audience, then add Product / project, Code example language, prerequisites and In scope / Out of scope as needed.",
    "Tick \"Include runnable code examples\" and \"Insert [DIAGRAM] placeholders\" if you want them; the prompt rebuilds around that document type's own section outline and reports Estimated prompt tokens at roughly 4 characters per token.",
    "Copy prompt puts the finished prompt on the clipboard — second person, present tense and active voice, with TODO(author) markers demanded for any version, default or URL you did not supply — and Reset restores the defaults.",
  ],
  intro:
    "The Technical Doc Prompt Builder assembles a complete AI prompt for writing developer documentation, structured around the Diátaxis framework's four document types: tutorial, how-to guide, reference and explanation. It encodes your audience, scope boundaries and code-example language, plus prose rules drawn from the Google and Microsoft developer style guides — second person, present tense, active voice. It is built for developers and technical writers who want AI documentation drafts that follow a real docs architecture instead of generic blog-post structure.",
  useCases: [
    "A backend developer generating a how-to guide for webhook setup with runnable Node.js examples and an explicit out-of-scope list",
    "A developer advocate drafting a beginner tutorial where every step states its expected visible result",
    "A platform team producing API reference pages that list every parameter with its type, default and constraints",
  ],
  benefits: [
    ["Diátaxis-native structure", "Each of the four document types gets its own canonical section outline, not a one-size-fits-all template."],
    ["Style guide rules baked in", "Second person, present tense, active voice and no 'simply' — the common core of the Google and Microsoft style guides."],
    ["Anti-invention guardrail", "The prompt forces TODO(author) markers for any version, default or URL you did not supply, instead of hallucinated facts."],
  ],
  faqs: [
    [
      "What is the Diátaxis framework for documentation?",
      "Diátaxis is a documentation architecture by Daniele Procida that divides all docs into four types by user need: tutorials (learning-oriented), how-to guides (task-oriented), reference (information-oriented) and explanation (understanding-oriented). Mixing the four in one page is the most common cause of confusing docs, which is why this builder makes you pick one type per prompt.",
    ],
    [
      "What is the difference between a tutorial and a how-to guide?",
      "A tutorial teaches a newcomer by walking them through a guaranteed small success, while a how-to guide helps an already-competent user accomplish one specific real-world task. In Diátaxis terms, tutorials are learning-oriented and assume nothing; how-to guides are task-oriented and may assume working knowledge and an existing setup.",
    ],
    [
      "How do I get AI to write accurate technical documentation without hallucinating?",
      "Constrain it to the facts you supply and give it an explicit escape hatch. The prompts generated here instruct the model to use only the supplied details and to write TODO(author) wherever a version number, default value or URL is missing — so gaps surface as visible markers you can fill, instead of invented specifics. Always technically review AI-drafted docs before publishing.",
    ],
    [
      "What writing style should technical documentation use?",
      "The major developer style guides — Google's and Microsoft's — converge on second person (“you”), present tense, active voice, short sentences and sentence-case headings, and both advise against words like “simply” and “just” that alienate stuck readers. This builder writes those rules directly into every generated prompt.",
    ],
  ],
};

export default seo;
