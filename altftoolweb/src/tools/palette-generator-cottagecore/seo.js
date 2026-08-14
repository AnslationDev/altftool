const seo = {
  title: "Cottagecore Palette: Cream, Sage, Moss and Berry",
  metaDescription:
    "Build a muted botanical palette from a seed word and a season, held under a saturation ceiling, with WCAG-checked button pairs and UI-safe variants.",
  steps: [
    "Type a Seed word or phrase, pick a Season — Spring young green, Summer meadow, Autumn dried grass or Winter bare stem — and drag Softness, where a higher value means a lower saturation ceiling.",
    "Check the read-out: Saturation ceiling, Mean saturation of the colour roles, Softness score and Contrast checks passing, then use Shuffle seed for a different seed word.",
    "Copy hex codes takes the whole set, the Palette list copies a single swatch, and the Export block writes the palette as CSS variables, Tailwind @theme or JSON — with the Sage tint ramp, Button pairings and UI-safe variants tables underneath.",
  ],
  intro:
    "The Cottagecore Palette Generator produces a soft botanical colour set — cream paper, linen, sage, moss, wild berry, clay rose and honey — from a seed word and a season. What makes it read as cottagecore rather than pastel candy is the saturation ceiling: a softness slider moves a shared saturation ceiling between 22% and 52%, and each colour then takes its own fraction of that ceiling, so the tool reports the resulting mean saturation so the muting is measurable. It also picks the readable label colour for each fill and darkens each accent — where it needs it — until it clears the WCAG 3:1 minimum for borders and icons.",
  useCases: [
    "Set the palette for a small-batch food or candle shop where everything should look sun-faded rather than neon.",
    "Move a spring palette to autumn by switching the season, keeping the same seed and colour relationships.",
    "Find out which of ink or cream should sit on a sage button before building the component.",
    "Get a border colour that still passes accessibility checks without abandoning the pastel look.",
  ],
  benefits: [
    [
      "Muting you can measure",
      "The saturation ceiling and the mean saturation are shown as numbers, not left to eye judgement.",
    ],
    [
      "Four seasonal variants",
      "Each season shifts hue and lightness — young green in spring, dried grass in autumn, bare stem in winter.",
    ],
    [
      "Accessible without losing the look",
      "Button label colours are chosen by contrast, and each accent gets a UI-safe twin adjusted to clear 3:1 — darkened only as far as it needs to be, since some hues already pass as-is.",
    ],
  ],
  faqs: [
    [
      "What colours are in a cottagecore palette?",
      "A warm off-white or cream base, one or two muted greens (sage and a deeper moss), a soft red-purple berry, a clay or dusty rose, and a honey or wheat warm. Saturation stays low — usually under about 50% — which is what gives the faded, sun-bleached feel.",
    ],
    [
      "Why do my pastel colours fail accessibility checks?",
      "Contrast depends on relative luminance, and a pale colour on a pale cream background has very little luminance difference. WCAG 2.1 asks for 4.5:1 for body text and 3:1 for large text, borders and icons; a clay rose on cream often sits near 2:1. Use the darkened UI-safe variant for anything functional and keep the pastel for fills.",
    ],
    [
      "What is the difference between sage and moss here?",
      "Sage is the lighter mid-tone lead colour, around 58% lightness, used for buttons and headings. Moss is the same green family taken down to roughly 26% lightness so it can carry text on cream and anchor footers.",
    ],
    [
      "Can I use these colours for paint or fabric?",
      "Treat them as a starting point. Screen colour is emitted light and paint or dye is reflected light, so a hex value will not match a swatch exactly — take the hex to a paint mixer or supplier and check a physical sample before committing.",
    ],
  ],
};

export default seo;
