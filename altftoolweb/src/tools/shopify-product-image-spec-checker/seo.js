const seo = {
  title: "Shopify Image Size Checker: 25 MP, 5000 px, 20 MB",
  metaDescription:
    "Tests width, height, file size and format against Shopify's 25 megapixel, 5000 px and 20 MB limits, plus your store's aspect ratio and centre-crop loss.",
  steps: [
    "Enter Width (px), Height (px), File size (MB) and File type — unsupported types are marked 'not supported' in the dropdown — then pick your store's standard aspect ratio, from 1:1 square to 16:9 landscape.",
    "The verdict updates live — Upload-ready, 'Uploads, but not ideal' or 'Shopify will reject this file' — from separate checks on the 25 MP resolution, 5000 px per-side, under-20 MB and 800 px shortest-side detail rules.",
    "Review each pass/warn/fail row and 'The rules being applied' table, use the presets (Shopify square 2048 x 2048, 4:5 portrait, 3:2 landscape), and press Copy report for the full check list.",
  ],
  intro:
    "This checker tests a product photo against Shopify's published image limits before you upload it: a maximum of 25 megapixels (up to 5000 x 5000 px per side), a file size smaller than 20 MB, and 2048 x 2048 px as the recommended square size. It also applies a clearly labelled, theme-dependent detail heuristic and compares the image to the single aspect ratio your store uses, because Shopify's own advice is to keep one ratio across every product so collection grids line up.",
  useCases: [
    "Check whether a 30 megapixel camera export will be refused before you drag 200 files into the admin.",
    "Flag a 600 x 600 px photo that may show little extra detail in a theme's zoom view.",
    "See how much of a square photo is lost when your theme crops to a 4:5 portrait grid.",
    "Confirm a HEIC file straight off an iPhone is supported without converting it first.",
  ],
  benefits: [
    ["Hard limits first", "The 25 MP / 5000 px limits and the under-20-MB rule can block an upload, and they are checked separately."],
    ["Crop maths, not guesswork", "Reports the exact percentage a centre crop to your store ratio removes."],
    ["Grid consistency", "Flags an image that will leave uneven padding next to the rest of your catalogue."],
  ],
  faqs: [
    [
      "What is the best image size for Shopify products?",
      "2048 x 2048 pixels for square product photos. That is Shopify's own recommendation: it is large enough for a sharp zoom on retina screens and comfortably under the 25 megapixel / 5000 px ceiling, and Shopify generates all the smaller variants automatically.",
    ],
    [
      "What are Shopify's image upload limits?",
      "Up to 25 megapixels and 5000 x 5000 px per side, with a file size smaller than 20 MB. A 7000 x 5000 px camera export is 35 megapixels and will be refused, so downscale before uploading rather than after a failed batch.",
    ],
    [
      "Why is zoom not working on my Shopify product images?",
      "Zoom behavior is controlled by your Shopify theme, so there is no universal 800 px platform rule. A small source image can still provide little extra detail when enlarged; check the theme's own media settings and test the product page on desktop and mobile.",
    ],
    [
      "Do all my product images need the same aspect ratio?",
      "Shopify recommends it. Collection grids reserve a fixed frame for every product, so mixing square and portrait photos leaves uneven white padding down the page. Pick one ratio — 1:1 and 4:5 are the common choices — and crop everything to it.",
    ],
  ],
};

export default seo;
