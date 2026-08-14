const seo = {
  title: "CSS Border Radius Generator with 8-Value Blob Mode",
  metaDescription:
    "Sliders for the four-corner shorthand and the eight-value slash syntax that makes blobs, previewed on four backdrops - copy or download the .css.",
  intro:
    "The CSS Border Radius Generator builds a `border-radius` value from sliders in two modes: a simple four-corner shorthand in px or %, and an advanced eight-value form written as four horizontal radii, a slash, then four vertical radii — the syntax that produces organic blob shapes. It is for designers and front-end developers who want to see the corner curvature on a live preview before committing the rule. The output is a ready-to-paste declaration, copyable in one click or downloadable as a .css file.",
  useCases: [
    "You are styling a card component and want to compare a 16px radius against a larger one on a real box before hardcoding the value into your design tokens.",
    "You need an organic blob background for a hero section and want to nudge the eight percentage values until the shape stops looking like a squashed circle.",
    "You are making a leaf or shield shape by zeroing two opposite corners and rounding the other two, and you want to check it against both a dark and a light backdrop before shipping.",
  ],
  benefits: [
    [
      "Simple and eight-value modes side by side",
      "The four-corner shorthand covers cards and pills; the advanced `.. / ..` form exposes horizontal and vertical radii separately, which is the only way to make asymmetric organic shapes.",
    ],
    [
      "Preview on four different backdrops",
      "Gradient, grid, dark and light backgrounds are switchable, so you can check the silhouette reads correctly against whatever the shape will actually sit on.",
    ],
    [
      "Presets that jump straight to a shape",
      "Circle, card, shield, leaf and organic presets set every slider at once, giving you a working starting point rather than eight zeros.",
    ],
  ],
  faqs: [
    [
      "What does the slash in a border-radius value mean?",
      "Values before the slash are the horizontal radii and values after it are the vertical radii, in the order top-left, top-right, bottom-right, bottom-left. So `30% 70% 40% 60% / 30% 40% 70% 60%` gives each corner an ellipse rather than a circular arc, which is what creates a blob.",
    ],
    [
      "Should I use px or percent for border-radius?",
      "Use px when you want a fixed curve that stays the same on every element size — a 16px card corner, for example — and percent when the curve should scale with the box. Percent is relative to the element's own width and height, which is why 50% on all four corners turns a square into a circle.",
    ],
    [
      "How do I make a perfect circle in CSS?",
      "Set all four corners to 50% on an element whose width and height are equal. The circle preset does exactly that; if the box is not square you get an ellipse instead.",
    ],
    [
      "What ranges do the sliders cover?",
      "In simple mode, 0–100 when the unit is percent and 0–200 when the unit is px. The advanced eight-value mode is always percentage-based, with every one of its eight sliders running 0–100.",
    ],
  ],
};

export default seo;
