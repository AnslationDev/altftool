const seo = {
  title: "Newsletter Header Image Size and Retina Export",
  metaDescription:
    "Get export pixels, phone render size, the smallest text that still reads at 14px and a KB budget for a 600px-wide email header.",
  steps: [
    "Enter Email body width (px) — 600 is the standard — then choose an Aspect ratio, Export multiplier and Image format.",
    "Set Phone viewport width (px), Body padding each side (px) and a Weight budget (KB) so mobile scaling and file weight are both checked.",
    "Read the export dimensions, the phone render size as a percentage of design size, and the Smallest text that still reads at 14px, then press Copy plan.",
  ],
  intro:
    "An email header image has to be exported at twice its display size for high-density screens, then survive being scaled down again on a phone — and this planner does that arithmetic. Enter the body width (600px is the long-standing standard), an aspect ratio and a phone viewport, and it returns the export dimensions, the size the header actually renders at on the phone, the smallest text you can draw inside the image and still have it read at 14px, and whether your file-weight budget is realistic for the format you picked. It also runs the dark-mode and Outlook checks that catch most broken headers.",
  useCases: [
    "Get the exact export size for a 600px-wide newsletter before opening the design file.",
    "Find out why a headline baked into a header is unreadable on a phone — the image is scaled to about 56% of its design size on a 375px screen.",
    "Check whether a PNG-24 header at 2x will blow past a 200 KB budget before exporting it.",
    "Catch a transparent logo with dark artwork that would vanish when a client repaints the message in dark mode.",
  ],
  benefits: [
    ["Mobile scaling maths", "Shows the real render size on a phone and the design text size needed to survive it."],
    ["Format weight estimates", "Bytes-per-pixel figures for JPEG, PNG-8, PNG-24, GIF and WebP with a suggested smaller export."],
    ["Client-specific warnings", "Outlook's Word rendering engine, first-frame-only GIFs and missing WebP support are all flagged."],
  ],
  faqs: [
    [
      "What size should a newsletter header image be?",
      "For a 600px-wide email, export at 1200px wide for 2x screens and let it display at 600px. A 3:1 banner is 600 x 200 displayed, so 1200 x 400 exported. Heights above roughly 300px push your first line of copy out of the preview pane.",
    ],
    [
      "Why does text in my email header look tiny on mobile?",
      "Because the image is scaled to fit the phone. A 600px-wide header inside a 375px viewport with 20px padding each side renders at 335px — about 56% of its design size — so 14px text in the design lands near 8px on screen. Design in-image text at 26px or larger, or keep the headline as live HTML text.",
    ],
    [
      "How do I stop my header breaking in dark mode?",
      "Avoid dark artwork on a transparent background, since several clients repaint the message background dark and the artwork disappears. Give logos an opaque background or a light outline, and keep headlines as live text so they can be restyled rather than baked into pixels.",
    ],
    [
      "Does image size affect Gmail clipping?",
      "No. Gmail clips a message when the HTML source passes roughly 102 KB, and image bytes are not part of that figure. Large images still hurt load time and data use, so a header under about 200 KB is a sensible target.",
    ],
  ],
};

export default seo;
