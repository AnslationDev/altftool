const seo = {
  intro:
    "This generator writes a complete CSS text rule — family, size, weight, style, transform, letter-spacing, line-height, alignment, colour, gradient fill and text-shadow — from sliders you adjust against a live preview. Turn responsive on and the font-size is emitted as a clamp() with your minimum in px, a fluid vw middle value derived from the base size, and your maximum in px, which is the modern way to scale headings without media queries. You get the rule as copyable CSS or a downloadable style.css, plus a Google Fonts @import line at the top of the output when the family needs one.",
  useCases: [
    "You have a hero headline that looks right at 64px on desktop and enormous on a phone, and you want the clamp() values rather than three breakpoint overrides",
    "A designer asked for a gradient headline and you need the exact background-clip incantation that makes gradient text work, not a screenshot of it",
    "You are settling on a button label style — uppercase, heavy weight, wide tracking — and want to nudge letter-spacing live before pasting the finished rule into your stylesheet",
  ],
  benefits: [
    ["Emits real clamp() typography", "Responsive mode outputs font-size as clamp(min, fluid vw, max), so the heading scales continuously instead of jumping at breakpoints."],
    ["Handles gradient text correctly", "Enabling a gradient writes background-image, -webkit-background-clip: text, background-clip: text and color: transparent together, which is the combination that actually renders."],
    ["Keeps your last six styles", "Copying or downloading saves the settings to a local history of six entries you can re-apply, and there is a 20-step undo while you experiment."],
  ],
  faqs: [
    [
      "What CSS does it actually output?",
      "A single rule named .generated-font-style containing font-family, font-size, font-weight, font-style, text-transform, letter-spacing, line-height and text-align, plus either a colour or the four gradient properties, and a text-shadow line when shadow is enabled. Rename the selector to whatever your project uses.",
    ],
    [
      "How is the responsive font size calculated?",
      "As clamp(minimum px, fluid vw, maximum px), where the fluid middle is your base size divided by 16 and expressed in vw with a floor of 1vw — so a 48px base becomes 3.00vw. The text never renders below the minimum or above the maximum you set.",
    ],
    [
      "Which fonts can I preview?",
      "Eight families: Inter, Poppins, Roboto, Montserrat and Open Sans, which load their stylesheet from Google Fonts automatically, plus Arial, Georgia and Courier New, which use the copies already on the device. Each is written as a full stack with fallbacks in the output.",
    ],
    [
      "Can I output colours as rgb() or hsl() instead of hex?",
      "Yes — the colour mode switch converts the picked value to hex, rgb() or hsl() in the generated rule. Gradients are always written as a linear-gradient with your two hex stops and the angle you set in degrees.",
    ],
  ],
};

export default seo;
