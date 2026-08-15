const seo = {
  title: "Brand Colour Palette Locker: 50-900 Tints & Contrast",
  metaDescription:
    "Lock brand hex values and get a 50-900 tint and shade ramp with RGB, HSL, CMYK, WCAG contrast, ink coverage checks and CSS tokens.",
  steps: [
    "Type each brand Hex with its Role, using Add colour for up to 8 locked colours.",
    "Choose the Print stock — coated at 300% or uncoated at 260% — to set the total ink coverage limit.",
    "Read the 50-900 ramp, per-stop contrast ratios and ink flags, then press Copy tokens for the CSS custom properties.",
  ],
  intro:
    "Brand Colour Palette Locker takes the small set of hex values a brand actually owns and generates everything downstream: a 50-900 tint and shade ramp, hex, RGB, HSL and CMYK for every stop, WCAG 2.2 contrast ratios so you know which stops can carry text, and a total ink coverage figure checked against the 300% coated and 260% uncoated press limits. Tints are produced by mixing toward white and shades by mixing toward black, so the ramp stays perceptually connected to the locked base rather than drifting in hue.",
  useCases: [
    "Turn two brand hex values into a full design-token ramp with CSS custom properties ready to paste.",
    "Check which stops of a brand colour can hold white text at the 4.5:1 threshold before a component library is built.",
    "Catch a brand colour whose CMYK conversion pushes total ink coverage above the press limit before a print job is sent.",
    "Verify that two brand colours are far enough apart in contrast to be told apart when placed side by side.",
  ],
  benefits: [
    ["One source of truth", "Every ramp stop, format and token is derived from the locked hex, so nothing drifts between files."],
    ["Contrast built in", "Each stop reports the ratio for its best text colour, checked against WCAG 2.2 thresholds."],
    ["Print sanity check", "Total ink coverage is flagged against the coated and uncoated limits printers actually enforce."],
  ],
  faqs: [
    [
      "What contrast ratio does brand text need?",
      "WCAG 2.2 asks for at least 4.5:1 for normal body text and 3:1 for large text, which is 18.66 px bold or 24 px regular and above. 7:1 meets the stricter AAA level for body copy.",
    ],
    [
      "How are tints and shades calculated?",
      "A tint mixes the base colour toward white and a shade mixes it toward black, channel by channel. Mixing a colour 50% toward white gives the 300 stop; mixing 30% toward black gives the 700 stop, which keeps the hue stable across the ramp.",
    ],
    [
      "What is total ink coverage and why does it matter?",
      "It is the sum of the cyan, magenta, yellow and black percentages for one colour. Sheet-fed coated work is usually kept at or below 300%, and uncoated or web offset nearer 260%, because beyond that the ink cannot dry and offsets onto the next sheet.",
    ],
    [
      "Can I use these CMYK values for print?",
      "Use them to check ink coverage and to brief a printer, not as final separations. The conversion here is the standard formula from sRGB and ignores the ICC profile, paper and press, so ask your printer to convert with the correct profile for the job.",
    ],
  ],
};

export default seo;
