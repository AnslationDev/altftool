const seo = {
  title: "Hex to CMYK Converter With Total Ink Coverage",
  metaDescription:
    "Converts a hex colour to C, M, Y, K percentages and sums total ink coverage against press limits: 320% GRACoL, 300% SWOP, 240% newsprint.",
  steps: [
    "Type a value into the Hex colour box, which starts at #14B8A6 and accepts 3, 4, 6 and 8 digit hex with any alpha flagged and left out of the ink maths.",
    "Choose an Ink limit profile: Coated sheetfed offset (GRACoL 2006 #1) at 320%, Coated web offset (SWOP #3), Uncoated offset (PSO / FOGRA47) or Newsprint (ISOnewspaper26v4) at 240%.",
    "The swatch panel lists RGB, HSL and CMYK values plus Total ink as a percentage with the headroom left or the amount over the limit; Copy result copies the conversion.",
  ],
  intro:
    "Hex To CMYK Converter turns a web hex value into cyan, magenta, yellow and black plate percentages and adds up the total ink coverage. It uses the standard arithmetic conversion — K = 1 − max(R, G, B) scaled to 0-1, then C, M and Y taken as the shortfall of each channel below that maximum — and compares the C+M+Y+K sum against published press limits such as 320% for GRACoL coated sheetfed and 240% for newsprint. Aimed at designers moving a screen palette into a print job and needing a sanity check before artwork goes out.",
  useCases: [
    "Translate a brand hex value into CMYK build numbers for a printer's artwork spec sheet.",
    "Check that a deep navy background will not exceed the 240% ink limit on a newsprint insert.",
    "See how far a saturated screen colour shifts when it is round-tripped back from four whole-number plates.",
    "Document the CMYK equivalents of a web palette inside a brand guidelines document.",
  ],
  benefits: [
    [
      "Ink coverage, not just numbers",
      "Total area coverage is summed and compared against a chosen press condition's published limit.",
    ],
    [
      "Round-trip check",
      "Converting the rounded plates back to RGB shows exactly how much precision whole percentages cost.",
    ],
    [
      "Handles every hex form",
      "3, 4, 6 and 8 digit hex are all accepted, with alpha flagged and excluded from the ink maths.",
    ],
  ],
  faqs: [
    [
      "How do you convert hex to CMYK?",
      "Split the hex into red, green and blue bytes and divide each by 255. Set K = 1 − max(R, G, B); if K is 1 the colour is black, otherwise C = (1 − R − K) ÷ (1 − K), and M and Y follow the same pattern with green and blue. Multiply each by 100 for percentages.",
    ],
    [
      "What is total ink coverage and why does it matter?",
      "Total ink coverage, also called TAC or TIC, is the sum of the four plate percentages. Too much ink will not dry, so presses set limits — 320% for GRACoL coated sheetfed, 300% for SWOP web offset and PSO uncoated, and 240% for ISOnewspaper26v4 newsprint.",
    ],
    [
      "Why does my CMYK colour look duller than the hex?",
      "RGB screens emit light and cover a wider gamut than four process inks reflecting off paper. Bright cyans, oranges and greens simply cannot be reproduced in CMYK, so the printed result shifts. Proof on the actual stock rather than trusting the screen.",
    ],
    [
      "Is this conversion accurate enough for a real print job?",
      "It is a mathematical conversion with no ICC profile, GCR or dot-gain compensation, so treat it as a starting value. For a colour-critical job, convert through the printer's supplied profile in your design application and ask for a contract proof.",
    ],
  ],
};

export default seo;
