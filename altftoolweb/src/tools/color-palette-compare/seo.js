const seo = {
  title: "Color Palette Compare: Two Palettes, One Mockup",
  metaDescription:
    "Render two five-role palettes into the same dashboard mockup and grade background/text contrast — AAA 7:1, AA 4.5:1, large-text 3:1.",
  intro:
    "Color Palette Compare puts two five-role palettes — primary, secondary, background, surface and text — side by side and renders each one into the same dashboard mockup, complete with cards, buttons and body copy. Under each mockup it reports the WCAG contrast ratio between that palette's background and text, graded AAA at 7:1, AA at 4.5:1 and large-text AA at 3:1. It is for designers deciding between two directions who want to judge them in a real layout instead of as loose swatches.",
  useCases: [
    "You have a light theme and a dark theme for the same product and want to check that both reach AA on body text before you build either.",
    "Two candidate brand palettes look equally good as swatch rows, and you need to see which one still works once it is a card, a primary button and a secondary button.",
    "A stakeholder has picked a primary colour and you want to demonstrate, in a mockup rather than an argument, that white label text on it does not pass.",
  ],
  benefits: [
    ["Judged in a layout, not on swatches", "Each palette is rendered into the same interface, so you compare like with like: same card, same buttons, same text hierarchy."],
    ["Button label colour is chosen for you", "White or black is selected for each button automatically, based on whichever clears 4.5:1 against that button's fill."],
    ["Live contrast readout per palette", "Background against text is scored continuously and labelled AAA, AA, AA large text or Fail, so a change to either colour shows its effect immediately."],
  ],
  faqs: [
    [
      "Which colour roles does each palette use?",
      "Five: primary, secondary, background, surface and text. That is enough to render a realistic page — background behind everything, surface for cards, primary and secondary for the two buttons, and text for all copy.",
    ],
    [
      "What contrast ratio does a palette need to pass?",
      "4.5:1 between background and text for AA body copy, 7:1 for AAA, and 3:1 for large text only. The badge under each mockup shows which grade your current pair reaches, calculated with the standard WCAG relative luminance formula.",
    ],
    [
      "How does it decide whether button text is black or white?",
      "It measures each button's fill colour against white; if that ratio is above 4.5:1, white is used, otherwise black. That is why the label flips as you drag a primary colour from light to dark.",
    ],
    [
      "Can I test random palettes quickly?",
      "Yes — the randomize button on either side regenerates all five roles at once, which is a fast way to see how rarely arbitrary colour combinations pass the 4.5:1 threshold. You can also type or pick any hex value directly.",
    ],
  ],
};

export default seo;
