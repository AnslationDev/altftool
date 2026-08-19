const seo = {
  title: "Color Code Converter: HEX, RGB, HSL, CMYK & Alpha",
  metaDescription:
    "Paste any one colour — HEX, rgba(), hsl(), cmyk() or a named colour — and get all seven notations at once, with alpha preserved. No convert button.",
  intro:
    "The Color Code Conversion Tool takes one colour in any common CSS notation — HEX, 8-digit HEXA, rgb(), rgba(), hsl(), hsla(), cmyk() or a named colour like rebeccapurple — and returns all seven notations at once, with a live preview swatch and one-click copy. It detects the input format for you rather than making you choose it from a menu, and keeps your last 14 colours in a local history you can re-open or export as JSON. It is aimed at front-end developers and designers moving a value between a stylesheet, a design file and a print spec.",
  useCases: [
    "A designer sends you hsl(174, 80%, 40%) and your stylesheet uses HEX, so you need the exact equivalent without eyeballing it in a picker.",
    "You have an rgba() colour with 0.35 alpha and need the 8-digit HEXA form for a tool that will not accept the functional syntax.",
    "You are handing a brand colour to a printer and need its CMYK breakdown next to the on-screen HEX so both are on the same spec sheet.",
  ],
  benefits: [
    ["Auto-detects the input notation", "Paste HEX with or without the #, a 3-, 4-, 6- or 8-digit value, a functional rgb/hsl/cmyk string, or a named colour — it works out which it is."],
    ["Preserves alpha across formats", "Transparency entered as rgba, hsla or an 8-digit hex carries through to every other output rather than being silently dropped."],
    ["Keeps your recent colours", "The last 14 conversions are stored in your browser, re-openable in a click, and exportable as a JSON file."],
  ],
  faqs: [
    [
      "Which colour formats does it convert between?",
      "Seven outputs from any one input: HEX, 8-digit HEXA with alpha, RGB, RGBA, HSL, HSLA and CMYK. Input can additionally be a named CSS colour such as rebeccapurple, cyan or orange.",
    ],
    [
      "How is the alpha channel handled in hex?",
      "As a two-digit pair appended to the six-digit hex, giving the 8-digit HEXA form. The alpha value 0 to 1 is scaled to 0-255 and written in hex, so 50 percent opacity becomes roughly 80 and full opacity is FF, which the tool omits.",
    ],
    [
      "Is the CMYK output print-accurate?",
      "It is the standard arithmetic conversion, where K equals 1 minus the largest of the normalised R, G and B values and the other channels are derived from it. That is device-independent and fine as a starting point, but real press output depends on an ICC profile and paper stock, so check proofs with your printer before committing.",
    ],
    [
      "Can I paste a colour without the # or the function wrapper?",
      "Yes. A bare six- or eight-character hex string works, as does a plain comma-separated triplet like 20, 184, 166, which is read as RGB. Values outside the valid range — RGB above 255, percentages above 100 — are rejected rather than clamped silently.",
    ],
  ],
};

export default seo;
