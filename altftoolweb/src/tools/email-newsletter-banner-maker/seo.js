const seo = {
  intro:
    "Email Newsletter Banner Maker designs a header at a real email content width — 560, 600 or 640 CSS pixels — and exports it at 2x so it stays sharp on retina screens while the width attribute keeps the layout at 1x. It also scores the banner against a light and a dark client canvas, because email clients do not invert image pixels: a white header stays white and glares inside a dark-mode message. Built for newsletter writers and marketers who need a header that survives Gmail, Outlook and Apple Mail without a design tool.",
  useCases: [
    "Produce a weekly issue header where only the issue number and headline change between sends.",
    "Fix a header that looks like a glaring white block for subscribers reading in dark mode.",
    "Check whether a long headline still fits at 600 px before it wraps awkwardly on mobile.",
    "Get the image markup with width, height and max-width already set for a hand-coded template.",
  ],
  benefits: [
    ["Retina without blurring", "Draws at 2x and gives you the 1x width and height to declare, so clients downsample instead of upscaling."],
    ["Dark-mode seam measured", "Reports the contrast between your banner background and both the light and dark client canvases."],
    ["Paste-ready markup", "Outputs an image tag with display:block, width:100% and max-width so it scales on mobile and does not gap in Outlook."],
  ],
  faqs: [
    [
      "What size should an email newsletter banner be?",
      "600 CSS pixels wide is the safe standard, with a height of 150-300 px depending on the proportion you want. Export the image at 2x — 1200 px wide for a 600 px banner — and set width=\"600\" in the markup.",
    ],
    [
      "Why does my email header look blurry on a phone?",
      "Because the image is being upscaled. Phones have 2x or 3x pixel density, so a 600 px image displayed at 600 CSS pixels is stretched. Export at double the CSS size and declare the CSS size in the width attribute.",
    ],
    [
      "How do I make an email banner work in dark mode?",
      "Avoid a white or near-white background, because clients do not invert image pixels and it will glow inside a dark message. A mid-tone or dark background with light text reads well in both modes; matching the banner background to your email's container colour hides the seam entirely.",
    ],
    [
      "Why does Gmail cut off my newsletter?",
      "Gmail clips a message once its HTML part passes about 102 KB and hides the rest behind a \"View entire message\" link. Images are fetched separately and do not count, so the fix is trimming inline CSS and repeated table markup, not the banner.",
    ],
  ],
};

export default seo;
