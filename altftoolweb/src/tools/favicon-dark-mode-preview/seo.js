const seo = {
  intro:
    "Favicon Dark Mode Preview renders your icon on a simulated light and dark browser tab strip and measures the WCAG 2.x contrast ratio of the artwork against each background, including per-pixel coverage below the 3:1 threshold set by SC 1.4.11 Non-text Contrast. It also reports transparency, edge padding, saturation and brightness spread — the four things that decide whether a mark survives being drawn at 16 pixels. Everything is decoded in your own browser, so the file never leaves the device.",
  useCases: [
    "Check whether a dark navy wordmark disappears against a dark tab strip before shipping a rebrand.",
    "Decide if you need a second icon served behind a prefers-color-scheme media query in your link tags.",
    "Confirm a new icon still reads at 16 px after the designer added fine detail to the 512 px master.",
    "Test whether an icon that relies on colour rather than brightness will collapse in a Safari pinned-tab mask.",
  ],
  benefits: [
    ["Both themes side by side", "Light and dark tab strips render at once, independently of the theme you are browsing in."],
    ["Measured, not eyeballed", "Reports the WCAG contrast ratio and the share of pixels that fall under 3:1 on each background."],
    ["Runs locally", "The icon is decoded with a canvas in your browser — nothing is uploaded to a server."],
  ],
  faqs: [
    [
      "How do I make a favicon that works in dark mode?",
      "Serve two icons and let the browser choose: <link rel=\"icon\" href=\"light.svg\" media=\"(prefers-color-scheme: light)\"> plus a dark counterpart. An SVG favicon can also switch internally with a prefers-color-scheme media query in its own stylesheet. If you must ship one file, give the mark a contrasting outline or a solid plate behind it.",
    ],
    [
      "What contrast ratio does a favicon need?",
      "Aim for at least 3:1 against the tab background, the WCAG 2.1 SC 1.4.11 minimum for graphical objects. A ratio of 1:1 means the artwork is the same luminance as the tab and is effectively invisible; pure white on a dark Chrome tab strip is roughly 16:1.",
    ],
    [
      "What favicon sizes should I still ship in 2026?",
      "A scalable SVG plus a 32 x 32 PNG covers most browsers, with a 180 x 180 apple-touch-icon for iOS home screens and a 192 x 192 and 512 x 512 pair in the web app manifest. Multi-size .ico is only needed for very old Internet Explorer support.",
    ],
    [
      "Why does my icon look muddy in a Safari pinned tab?",
      "Pinned tabs use a single-colour mask, so all colour information is discarded and only the silhouette remains. If shapes in your icon are separated by hue rather than by brightness they merge together — supply a dedicated monochrome SVG via <link rel=\"mask-icon\">.",
    ],
  ],
};

export default seo;
