const seo = {
  title: "Tech Startup Font Pairing & Grid-Snapped Type",
  steps: [
    "Under 1. Pick a trio, choose one of the eight pairings such as Developer platform, Clean SaaS or Fintech-adjacent, each naming a display, UI text and monospace family.",
    "In 2. Scale and grid, set UI body size (px), Scale ratio such as Minor third or Perfect fourth, Baseline grid (px), Hero step on the scale and Text container width (px).",
    "Read Hero size on the grid and the Characters per line verdict, answer 3. Will it read from the back of the room with your slide width, viewing distance and screen height, then press Copy CSS.",
  ],
  intro:
    "Tech Startup Font Pairing builds a complete product type system from a geometric or neo-grotesque Google Font trio: a display face, a UI text face and a monospace for numbers and code. Sizes come from a modular scale (size = base × ratio^step) and are then snapped to your 4px or 8px baseline grid, with line boxes rounded to the same grid so cards, tables and buttons stack cleanly. It also converts the same type onto a 16:9 slide and checks it against the 20-arcminute character height that ISO 9241-303 associates with comfortable reading.",
  useCases: [
    "Define h1–h4, body and caption sizes for a SaaS dashboard on an 8px grid before opening Figma.",
    "Check whether 16px body copy in a 600px container lands inside the 45–75 character readability band.",
    "Find out if the 24px body size on your pitch deck is still legible from the back row of a 12-metre room.",
    "Pick a monospace that shares a skeleton with your UI face so figures line up between prose and tables.",
  ],
  benefits: [
    ["Grid-true numbers", "Font sizes and line boxes are snapped to your baseline grid, and collapsed steps are flagged instead of hidden."],
    ["A mono face in every trio", "Each pairing names a monospace for metrics, IDs and code, with tabular figures in the generated CSS."],
    ["Deck legibility from geometry", "Minimum slide size is derived from viewing distance, screen height and character height, not from a rule of thumb."],
  ],
  faqs: [
    [
      "What font size should body text be in a web app?",
      "16px is the common floor for UI body text because it is the browser default root size and stays readable without zoom on a phone. Below about 14px, long-form reading becomes tiring; labels and captions can sit at 12–13px if they are short and high contrast.",
    ],
    [
      "Why snap font sizes to a 4px or 8px grid?",
      "Because a modular scale produces awkward values like 39.06px, and unsnapped line boxes stop components lining up. Snapping each size and its line box to a 4px or 8px multiple keeps cards, list rows and buttons on the same rhythm — at the cost of a small drift from the pure ratio, which this tool shows for every step.",
    ],
    [
      "How big should text be on a presentation slide?",
      "Size it by angle, not by a fixed point size: a character should subtend about 20 minutes of arc at the back row. On a 1.5 m tall screen viewed from 8 m that works out to roughly a 48px font on a 1920×1080 artboard. Halve the distance and you can halve the size.",
    ],
    [
      "Is it fine to use one font family for both headings and body?",
      "Yes, if the family has enough weight range. A single variable family such as Manrope or Inter set at 400 for text and 700–800 for headings gives clear hierarchy, loads one font file instead of two or three, and removes any risk of a mismatched x-height between the two faces.",
    ],
  ],
};

export default seo;
