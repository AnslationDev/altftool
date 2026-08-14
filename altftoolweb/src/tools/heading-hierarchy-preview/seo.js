const seo = {
  title: "Type Scale Generator: H1-H6 Sizes, Spacing, CSS",
  metaDescription:
    "Set a base size and ratio (1.067-1.618) to get H1-H6 size, line height, weight and margins as copyable rem or px CSS.",
  steps: [
    "Enter Body size px and Root px, then pick a Scale ratio from Minor second · 1.067 through Golden ratio · 1.618.",
    "Set Heading weight and Body line height, and choose rem or px in the CSS unit list.",
    "The Preview column renders H1 to H6 with each level's px size and line height; press Copy to put the generated CSS on the clipboard, or Reset to return to the 18px / Major third defaults.",
  ],
  intro:
    "The Heading Hierarchy Preview turns a base font size and a modular scale ratio into a complete H1 to H6 specification — size in px and rem, line height, font weight, and the space above and below each heading — and shows the whole ladder rendered together. Sizes follow the classical modular scale size = base × ratio^step using musical-interval ratios from the minor second (1.067) to the golden ratio (1.618); body spacing is checked against WCAG 2.1 success criterion 1.4.12, which expects text to stay readable at a line height of 1.5 and paragraph spacing of twice the font size.",
  useCases: [
    "Choosing a scale ratio for a new design system and seeing whether H2 and H3 stay visually distinct",
    "Producing the heading CSS for a marketing site with consistent rem values off a 16px root",
    "Reviewing an existing hierarchy where headings feel cramped, to find sensible margin values",
  ],
  benefits: [
    ["A whole scale at once", "Every level is rendered together, so hierarchy problems show up before you build."],
    ["Leading that follows size", "Line height steps down as sizes grow instead of applying one number to display and body alike."],
    ["Accessibility checked", "Flags body line height under 1.5 and body sizes under 16px against WCAG text-spacing expectations."],
  ],
  faqs: [
    [
      "What is a good type scale ratio for a website?",
      "A major third (1.25) or perfect fourth (1.333) suits most websites: from a 16px body they give an H1 of about 61px and 90px respectively, with clearly separated intermediate levels. Smaller ratios like the major second (1.125) compress the levels until H1 and H2 stop reading as different, and the golden ratio (1.618) usually needs hand-tuning at the top.",
    ],
    [
      "What line height should headings use?",
      "Less than body text. Body copy wants around 1.5, but a 60px heading only needs about 1.15 — long body lines need leading to help the eye find the next line, while a two- or three-word heading does not. Step the value down as size rises rather than applying one figure everywhere.",
    ],
    [
      "How much space should go above and below a heading?",
      "More above than below. A heading belongs to the text it introduces, so a gap of roughly 0.75 of its own font size above and 0.35 below groups it correctly. Equal spacing on both sides leaves the heading floating between two blocks with no visible ownership.",
    ],
    [
      "Should I pick heading levels based on size?",
      "No. H1 to H6 describe document structure and are what screen reader users navigate by, so they must run in order without skipping levels. If a section heading needs to look smaller, keep the correct tag and change the size with a class.",
    ],
  ],
};

export default seo;
