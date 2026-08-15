const seo = {
  title: "Figma AI Prompt Builder with Real Column-Grid",
  metaDescription:
    "Build Figma AI prompts for wireframes, layer naming or dev handoff, with column width computed from your frame, gutter and margin, plus 8px grid checks.",
  steps: [
    "Click a frame preset — Desktop — 1440 x 1024, Tablet — 768 x 1024 or Mobile — 375 x 812 — or type Frame width (px), Columns, Gutter (px) and Side margin (px).",
    "Pick \"What should the assistant do?\": Describe a wireframe, Clean up layer names, Plan component variants, Name design tokens, Audit the design system, Accessibility review or Write dev handoff notes, then name the screen or component.",
    "Read the calculated column width and any off-8px-grid warnings, then press \"Copy prompt\" to take the prompt into Figma AI.",
  ],
  intro:
    "Figma AI Prompt Builder writes a design prompt that carries real measurements instead of adjectives, working out your column width from the standard layout grid formula: (frame width − 2 × margin − (columns − 1) × gutter) ÷ columns. Choose the job — wireframe, layer naming scheme, variant plan, token names, system audit, accessibility pass or dev handoff — and the prompt arrives with fixed rules for each, including the 8-point spacing convention and Figma's slash-nesting rule for component names. It is for designers who keep getting back layouts described in vague spacing and layer names like Frame 27.",
  useCases: [
    "Confirm that a 1440px frame with 12 columns, 80px margins and 24px gutters gives 84.67px columns before you ask for a layout built on it.",
    "Generate a naming scheme prompt that uses Button/Primary/Large style paths so components actually nest in the Assets panel.",
    "Ask for a variant plan and get the property list multiplied out, so you notice the set is heading past a hundred variants.",
    "Produce a dev handoff prompt that forces every interactive state — default, hover, focus, active, disabled, loading, error, empty — to be described.",
  ],
  benefits: [
    ["Real grid maths", "Column width, content width and total gutter are calculated, not guessed, and impossible grids are rejected."],
    ["Off-grid warnings", "Tells you when the column width, margin or gutter does not land on the 8px spacing unit."],
    ["Task-specific rules", "Each job carries its own constraints, so a naming prompt and an accessibility prompt never blur together."],
  ],
  faqs: [
    [
      "How do I calculate column width for a Figma layout grid?",
      "Column width = (frame width − 2 × margin − (columns − 1) × gutter) ÷ columns. On a 1440px frame with 80px margins, 24px gutters and 12 columns that is (1440 − 160 − 264) ÷ 12 = 84.67px, which is why 12-column desktop grids rarely land on whole pixels.",
    ],
    [
      "What does a slash do in a Figma component name?",
      "A forward slash creates a level of nesting in the Assets panel and the instance swap menu, so Button/Primary/Large appears inside a Button folder, then Primary, then Large. A component name with no slash sits loose at the top level, which is why libraries get unusable once they pass a few dozen components.",
    ],
    [
      "What is the 8-point grid?",
      "It is a spacing convention, not a Figma feature: every spacing, size and radius value is a multiple of 8, with 4 used for small steps. It keeps components aligned when they are combined, and it maps cleanly onto common screen densities, which is why most design systems adopt it.",
    ],
    [
      "What accessibility rules should a design prompt include?",
      "At minimum, WCAG 2.2's contrast thresholds of 4.5:1 for body text and 3:1 for large text (18pt, or 14pt bold and above), and the AA target size minimum of 24 by 24 CSS pixels for interactive elements. These are the rules that can be checked in the design file itself; keyboard order and screen reader behaviour still need testing in the built product.",
    ],
  ],
};

export default seo;
