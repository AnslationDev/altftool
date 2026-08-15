const seo = {
  title: "Designer Prompt Pack: 12 Fill-in-the-Blank AI Prompts",
  metaDescription:
    "Twelve prompts for moodboards, palettes, empty states, critique and WCAG 2.2 AA review. Fill the blanks in your browser and copy the finished prompt.",
  steps: [
    "Narrow the 12 prompts with Search prompts or the Category select, then click a prompt card to open it.",
    "Complete the inputs under Fill in the blanks; Use example values loads the sample text and Clear fields empties them, and anything left empty stays visible as a {{placeholder}} listed under 'Still blank'.",
    "Check Estimated prompt size in tokens, then press Copy prompt to take the assembled text to your assistant; Reset returns the pack to its default state.",
  ],
  intro:
    "The Designer Prompt Pack is a library of 12 fill-in-the-blank AI prompts covering the design tasks that most often produce vague output: moodboard direction, colour palettes, landing page structure, empty states, microcopy, critique, accessibility review, tokens, component specs and research scripts. Each prompt already states the role, the constraints and the exact output format, so the model returns a structured answer instead of a paragraph of generalities. You fill the blanks in your browser, the tool substitutes them and shows the estimated size, then you copy the finished prompt into whichever assistant you use.",
  useCases: [
    "Turning a client's 'make it feel premium' into three named visual directions with typefaces, palettes and a cliche to avoid before you open Figma.",
    "Running a WCAG 2.2 AA review pass over a checkout flow and getting each finding tied to a numbered success criterion rather than an opinion.",
    "Writing the first-use, no-results, error and permission-denied variants of an empty state, plus the screen-reader announcement for each.",
  ],
  benefits: [
    ["Constraints built in", "Every prompt fixes the role, the output format and the rules, which is where most improvised prompts fall apart."],
    ["No stale placeholders", "Blanks you leave empty stay visible as {{markers}} and are listed above the result, so nothing ships half-written."],
    ["Runs locally", "Prompt assembly happens in the browser; no account, no API key and nothing you type leaves the page."],
  ],
  faqs: [
    [
      "How do I write a good design prompt for AI?",
      "Give it four things: a role, the specific artefact, the constraints it must respect, and the exact output format you want back. A prompt that says 'critique this screen' returns taste; one that says 'critique in this order, give observation, user impact and one concrete change, and separate blocking issues from polish' returns something you can act on.",
    ],
    [
      "What contrast ratios should the palette prompt enforce?",
      "WCAG 2.2 level AA requires at least 4.5:1 for normal body text, 3:1 for large text (18pt, or 14pt bold), and 3:1 for user interface components and graphical objects. The palette prompt asks the model to report the ratio for every pair, but always re-check the numbers in a real contrast checker because language models routinely miscalculate them.",
    ],
    [
      "Can AI replace a design critique from a colleague?",
      "No. It is useful as a first pass that catches structural problems such as unclear hierarchy, missing states and accessibility gaps, which frees a human reviewer to spend their time on judgement, context and craft. It has no knowledge of your users, your roadmap or the political constraints around a decision.",
    ],
    [
      "Which AI model works best with these prompts?",
      "Any current general-purpose assistant handles them, because the structure does the work rather than a model-specific trick. The tool shows an estimated token count at roughly four characters per token so you can tell when a filled prompt is getting long for a small context window; anything above about 700 tokens is worth checking before you paste it into an 8K-context model.",
    ],
  ],
};

export default seo;
