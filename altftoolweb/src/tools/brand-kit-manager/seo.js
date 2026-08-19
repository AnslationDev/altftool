const seo = {
  title: "Brand Kit Manager: Logos, Palette, JSON Export",
  intro:
    "Brand Kit Manager is a browser workspace that stores one brand's logo files, hex palette, type scale, official links and written guidelines as a single reusable kit. It is built for freelancers, small studios and in-house marketers who keep re-sending the same assets to designers, developers and printers. Colours are validated as six-digit hex, links are checked against the http, https and mailto protocols, and everything stays in your browser's localStorage — nothing is uploaded.",
  useCases: [
    "Hand a new freelance designer one JSON export instead of a folder of loose PNGs and a Slack message with the hex codes",
    "Keep separate kits for a parent company and its sub-brands, and switch between them when writing social posts",
    "Paste the plain-text brand summary into a print shop's order notes so the logo, fonts and palette arrive with the file",
  ],
  benefits: [
    ["Everything in one record", "Logos, colours, fonts, links and tone-of-voice notes live in the same kit rather than four different apps."],
    ["Validated before it ships", "Palette entries must be full six-digit hex and links must resolve to http, https or mailto, so a broken value never reaches the export."],
    ["Private by default", "Kits are held in your browser's localStorage and exported only when you click download — no account, no server copy."],
  ],
  faqs: [
    [
      "Where is my brand kit stored?",
      "In your own browser, under the localStorage key altftools:brand-kit-manager:v1. Nothing is sent to a server, so clearing site data or switching browsers loses the kit — use the JSON export as your backup.",
    ],
    [
      "What logo file types can I upload?",
      "Four: PNG, JPEG, SVG and WebP, each up to 2 MB. The 2 MB cap exists because kits persist to localStorage, whose practical per-origin quota is about 5 MB, and base64 encoding inflates a file by roughly one third.",
    ],
    [
      "Why is my colour rejected?",
      "The palette only accepts full six-digit hex such as #14B8A6. Three-digit shorthand (#1B8), eight-digit hex with alpha (#14B8A6FF) and named colours like \"teal\" are refused so the exported values paste cleanly into CSS, Figma and print specs.",
    ],
    [
      "What do I actually get when I export?",
      "Two formats. The JSON export is the complete kit object — every field, plus logos embedded as base64 data URLs — and can be re-imported. The copy button puts a plain-text one-pager on your clipboard: name, tagline, industry, website, contact, the full colour list, heading and body fonts, and the voice, messaging and design-rule guidelines.",
    ],
  ],
};

export default seo;
