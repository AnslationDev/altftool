const seo = {
  title: "Luxury Gold Palette Generator with CMYK Ink Limits",
  metaDescription:
    "Six-role gold and dark-neutral palettes, every text pair scored against WCAG 2.x, plus a CMYK build and a 300%/260% ink-coverage check.",
  steps: [
    "Choose a Metal tone such as Classic 24ct gold and a Dark ground such as Obsidian black, then set Hue rotation (degrees) if you want to shift it.",
    "Set Paper stock (ink limit) to Coated — 300% limit or Uncoated — 260% limit, and press Next variation to step through the six deterministic variants.",
    "Read Pairings meeting their WCAG threshold with the Contrast audit table and CMYK builds, then press Copy CSS for custom properties.",
  ],
  intro:
    "The Luxury Gold Palette Generator builds a six-role colour system — page ground, card surface, gold, gold highlight, champagne and ink — from a chosen metal tone and dark neutral, then audits every text pairing with the WCAG 2.x relative-luminance contrast formula. Each swatch also gets a CMYK build and a total-area-coverage figure so you can see whether it prints inside the usual 300% coated or 260% uncoated ink limit. It is aimed at designers working on packaging, invitations, spirits labels and premium brand sites where the same gold has to survive both a screen and a foil-stamped press sheet.",
  useCases: [
    "Set the gold and champagne tones for a spirits label, then check the CMYK build stays under the printer's 300% ink limit before sending artwork.",
    "Confirm a gold headline on a near-black web hero clears 3:1 for large display type and that body copy still clears 4.5:1.",
    "Try rose gold against espresso and midnight navy side by side when picking a direction for a jewellery brand's packaging.",
    "Export CSS custom properties for a dark premium landing page, including a banded gradient that stands in for foil sheen.",
  ],
  benefits: [
    [
      "Contrast checked, not guessed",
      "Every pairing is scored with the WCAG 2.x formula against the right threshold — 4.5:1 for body copy, 3:1 for display type and UI borders.",
    ],
    [
      "Print-aware output",
      "Each swatch carries a CMYK build, a total ink coverage figure and a warning when it exceeds the stock's limit.",
    ],
    [
      "Deterministic variations",
      "The variation index steps hue, saturation and lightness by fixed amounts, so the same settings always reproduce the same palette.",
    ],
  ],
  faqs: [
    [
      "What colours go with gold for a luxury brand?",
      "Deep, low-lightness neutrals: near-black, charcoal, midnight navy, espresso brown and very dark green. Keeping the ground under roughly 15% lightness lets a mid gold clear the 3:1 contrast ratio WCAG asks for on large text and interface borders, which is what makes the gold read as metal rather than mustard.",
    ],
    [
      "Can gold be printed in CMYK?",
      "Not as metal. CMYK inks are transparent and matte, so a four-colour build gives you a flat ochre with no specular flip; real metallic effect needs hot-foil stamping, a metallic Pantone ink, or a metallic toner press. The CMYK figures here are a usable matte stand-in and a starting point to hand a printer.",
    ],
    [
      "What is total area coverage and why does it matter?",
      "Total area coverage (TAC) is the sum of the four ink percentages in a build — a 60/40/40/100 rich black is 240%. Press guidance commonly caps coated sheetfed work near 300% and uncoated near 260%, because beyond that the ink cannot dry fast enough and you get set-off and blocking on the stack.",
    ],
    [
      "Does gold text pass accessibility requirements?",
      "It depends on the pair, which is why each combination is scored here. A mid-tone gold on near-black typically lands between 6:1 and 9:1, comfortably past the 4.5:1 body-text threshold, but the same gold on a white or light grey page often falls under 3:1 and fails. This tool reports the ratio; treat the result as a design check rather than a full accessibility audit.",
    ],
  ],
};

export default seo;
