const seo = {
  title: "CSS Button Generator with Hover State",
  metaDescription:
    "Build a .custom-button rule plus a matching :hover block — gradient or solid fill, radius, shadow depth and hover scale — and export the CSS with HTML.",
  intro:
    "CSS Button Generator builds a complete `.custom-button` rule plus a matching `:hover` rule from visual controls for padding, font size and weight, border radius, border, solid or 135° linear-gradient background, box-shadow depth and opacity, and hover scale. It is for developers and designers who want the hover state generated for them rather than hand-writing a second block. The preview is a real button you can hover, and the export includes both the CSS and the HTML snippet that uses it.",
  useCases: [
    "You need a primary call-to-action for a landing page and want to see the gradient, the shadow and the hover lift together before pasting anything into your stylesheet.",
    "Your design calls for a pill button, so you push the radius to 9999px and check that the horizontal and vertical padding still look balanced at 14px text.",
    "You are building a secondary outline button and want a transparent background with a 2px coloured border and no shadow, matched to the same size as your filled button.",
  ],
  benefits: [
    [
      "Generates the hover state too",
      "The exported CSS includes a `:hover` block with the scale transform and a deeper shadow derived from your base values, so the two states stay consistent.",
    ],
    [
      "Shadow depth drives both blur and offset",
      "A single depth control sets the y-offset and a blur of twice that value, which keeps the shadow physically plausible instead of letting the two drift apart.",
    ],
    [
      "Four starting presets",
      "Neon gradient pill, outline, dark and retro presets set background, radius, border and shadow together, so you begin from a coherent style rather than defaults.",
    ],
  ],
  faqs: [
    [
      "Does it generate the hover effect as well as the button?",
      "Yes. Every export contains two rules: the base `.custom-button` and a `.custom-button:hover` that applies `transform: scale(...)` and increases the shadow by 2px of depth and 0.05 of opacity over the base values. Both share a `transition: all 0.2s ease-in-out`.",
    ],
    [
      "How do I make a fully rounded pill button?",
      "Set the border radius to a value at least half the button's height — 9999px is the usual trick, and it is what the neon preset uses. Anything that large clamps to a perfect semicircle on each end regardless of the button's actual height.",
    ],
    [
      "What kind of gradient does it produce?",
      "A two-stop `linear-gradient(135deg, colour1 0%, colour2 100%)`, which runs diagonally from top-left to bottom-right. Switching to solid mode replaces it with a plain `background-color` using the first colour only.",
    ],
    [
      "What do I get when I export?",
      "A single text file containing the full stylesheet for both states plus the matching `<button class=\"custom-button\">` markup with your button label, so the snippet works as soon as it is pasted. You can also copy just the CSS to the clipboard.",
    ],
  ],
};

export default seo;
