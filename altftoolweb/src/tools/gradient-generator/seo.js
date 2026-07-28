const seo = {
  title: "CSS Gradient Generator — Linear, Radial & Animated",
  h1: "CSS Gradient Generator",
  metaDescription:
    "Build linear or radial CSS gradients, drag the angle dial, then copy as CSS, Tailwind, SCSS or React — plus 1200×630 PNG export. Free, in-browser.",
  intro:
    "The Gradient Generator builds CSS `linear-gradient()` and `radial-gradient()` values from two colors plus an angle you set on a drag dial, which reads your pointer with Math.atan2 to give any whole degree from 0 to 359. The same gradient is emitted in four formats — plain CSS, a Tailwind arbitrary-value class, an SCSS variable block, and a React inline style object — and can be rendered to a 1200×630 `<canvas>` with `createLinearGradient` / `createRadialGradient` and saved as a PNG. Everything runs in your browser, including the built-in WCAG contrast check, which uses the official relative-luminance formula (0.2126R + 0.7152G + 0.0722B on sRGB-linearized channels) and the (L1 + 0.05) / (L2 + 0.05) ratio. No colors, images, or code are ever sent to a server.",
  useCases: [
    "Copying a production-ready linear-gradient() or radial-gradient() for a button, hero section, or card background",
    "Exporting a 1200×630 PNG of the gradient for an Open Graph image, slide background, or social banner",
    "Checking whether white or black text stays readable on a gradient before shipping it",
  ],
  benefits: [
    [
      "Four copy formats, one gradient",
      "Switch between plain CSS, a Tailwind arbitrary-value class (bg-[linear-gradient(...)]), an SCSS variable block, and a React style object — the code preview updates live before you copy.",
    ],
    [
      "Built-in WCAG contrast check",
      "Your gradient colors are scored against white and black text with the WCAG relative-luminance formula and graded AAA (≥7:1), AA (≥4.5:1), AA* (≥3:1, large text only) or Fail, with a suggested text color.",
    ],
    [
      "Animated and gradient-text output too",
      "Export a moving gradient as background-size: 400% 400% plus its @keyframes block (1–14s cycle, four directions), or copy -webkit-background-clip: text code — and the same headline as an SVG <linearGradient>.",
    ],
    [
      "Free, in-browser, and shareable",
      "No signup and no upload. Your last 10 gradients live in your own browser's localStorage, and the Share button packs the two hex colors and the angle into the URL.",
    ],
  ],
  faqs: [
    [
      "How do I make a CSS gradient?",
      "Pick two colors and an angle, then copy the generated line — for example background: linear-gradient(120deg, #6366f1, #0ea5e9);. This tool writes that for you and gives the same value as a Tailwind class, an SCSS variable, or a React style object. Switch the type to radial and you also get a shape (circle or ellipse) and one of nine positions.",
    ],
    [
      "How do I make a gradient with more than two colors?",
      "Use the Multi-Color Gradient section. It opens with three stops, you can add as many more as you like, drag any stop to reorder it, and remove stops down to a minimum of two — the CSS output rewrites itself with every change.",
    ],
    [
      "Can I download a CSS gradient as an image?",
      "Yes. The Download button paints the current gradient onto a 1200×630 canvas and saves it as a PNG named after both hex codes, like gradient-6366f1-0ea5e9.png. 1200×630 is the standard Open Graph size for social and link previews.",
    ],
    [
      "How do I make gradient text in CSS?",
      "Set the gradient as background-image, then add -webkit-background-clip: text, -webkit-text-fill-color: transparent, and background-clip: text. The Gradient Text Generator previews it live with your own text, font size, weight, family and letter spacing, and copies exactly that block — or the same effect as an 800×200 SVG with a <linearGradient> fill.",
    ],
    [
      "Should I use white or black text on a gradient background?",
      "The Contrast Checker answers that for you. It computes the WCAG contrast ratio of your gradient colors against both white and black, grades each one (AAA ≥ 7:1, AA ≥ 4.5:1, AA* ≥ 3:1 for large text, Fail under 3:1), and marks the safer of the two as the suggested text color.",
    ],
    [
      "How do I animate a CSS gradient?",
      "Stretch the background with background-size: 400% 400% and animate background-position in a @keyframes rule. The Animated Gradient section exports that CSS with the keyframes included, at a cycle length you set from 1 to 14 seconds, in horizontal, vertical, diagonal, or rotate direction.",
    ],
    [
      "Can I share a gradient I made?",
      "Yes. The Share button copies a link with your colors and angle in the query string — ?c1=6366f1&c2=0ea5e9&angle=120 — and the page reads those parameters on load, so anyone opening the link starts from the identical gradient.",
    ],
    [
      "Is this gradient generator free?",
      "Yes, free with no signup. Every part of it runs locally in your browser: the CSS is generated in JavaScript, the PNG is drawn with the Canvas API on your device, and the recent-gradient history is kept only in your browser's localStorage, which you can clear from the tool.",
    ],
  ],
  steps: [
    "Pick your two colors and drag the angle dial — or switch to radial and choose a shape and position.",
    "Choose an output format (CSS, Tailwind, SCSS, or React) and check the WCAG contrast score under the preview.",
    "Copy the code, download the 1200×630 PNG, or copy a share link that encodes both colors and the angle.",
  ],
};

export default seo;
