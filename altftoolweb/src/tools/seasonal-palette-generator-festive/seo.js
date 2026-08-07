const seo = {
  intro:
    "Festive Seasonal Palette Generator builds a six-role campaign palette — background, surface, primary, accent, highlight and neutral text — for a chosen season, then audits the six layout pairings that matter most for a campaign (body text on background, body text on card, primary on background, accent on background, highlight on card, and button label on primary) with the WCAG 2.x contrast formula. Each season stores hue offsets from a base hue rather than fixed colours, so rotating the base hue keeps the relationships intact while changing the mood. Output is deterministic: the same season, hue rotation and variation number always return the same palette, which matters when a team needs to reproduce a campaign palette months later.",
  useCases: [
    "Build a Black Friday banner palette where the neon accent still clears 4.5:1 against the near-black ground.",
    "Rotate a spring sale palette 30 degrees so it sits closer to an existing brand hue.",
    "Export CSS custom properties for a seasonal landing page without hand-picking six colours.",
    "Check before design starts whether the festive red you want will pass contrast as body text.",
  ],
  benefits: [
    [
      "Contrast checked, not guessed",
      "Six real layout pairings are graded AAA, AA, large-text-only or fail before you build anything.",
    ],
    [
      "Reproducible output",
      "No randomness — a season plus a hue rotation and variation number always regenerates the same palette.",
    ],
    [
      "Ready to paste",
      "Copy the palette as CSS custom properties or as a text block with the full contrast audit.",
    ],
  ],
  faqs: [
    [
      "What contrast ratio do sale banners need to pass?",
      "WCAG 2.x asks for at least 4.5:1 between body text and its background, 3:1 for large text of 24px regular or 18.66px bold and above, and 3:1 for interface components such as button outlines. Headline-sized discount numbers usually qualify as large text.",
    ],
    [
      "How many colours should a campaign palette have?",
      "Six roles cover almost every layout: a background, a card surface, a primary brand colour, an accent, a highlight for badges or price tags, and a neutral for body text. Adding more usually reduces consistency rather than improving it.",
    ],
    [
      "Why do festive red and green look wrong together on screen?",
      "A mid-tone red on a mid-tone green has almost no luminance difference, so the pair can measure under 2:1 even though the hues clash strongly. Lighten one side or separate them with a neutral so the contrast ratio does the work rather than the hue.",
    ],
    [
      "Can I use these palettes for print as well as screen?",
      "The values are sRGB and the contrast maths assumes a screen. For print, convert through your printer's ICC profile and check total ink coverage separately — saturated screen colours often sit outside the CMYK gamut.",
    ],
  ],
};

export default seo;
