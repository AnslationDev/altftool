const seo = {
  intro:
    "This builder composes an AI image prompt for an ecommerce product shot from your chosen surface, camera angle, lighting and shot type, then computes the framing numbers for the target platform — canvas size, aspect ratio, product coverage and margins. Marketplace rules are encoded directly: Amazon's main image needs a pure white background with the product filling 85% or more of the frame, and at least 1000 px on the longest side for zoom. It is built for sellers and marketers generating listing and social imagery.",
  useCases: [
    "An Amazon seller generating a compliant main-image concept and getting warned when a wood or marble surface would breach the pure-white rule",
    "An Etsy shop owner producing lifestyle shots at the 2000 px shortest-side recommendation with the 4:3 thumbnail crop in mind",
    "A social media manager building a 1080 x 1350 portrait product post that keeps the product at 65% coverage with clean margins",
  ],
  benefits: [
    ["Marketplace rules built in", "Amazon's 85% coverage and pure-white main-image rules, zoom thresholds and Instagram render sizes are applied automatically."],
    ["Framing numbers, not guesses", "Canvas, aspect ratio, product pixels and per-side margins are computed from the platform and your coverage setting."],
    ["Model-safe negatives", "The negative prompt blocks warped products, garbled label text, stray hands and busy backgrounds."],
  ],
  faqs: [
    [
      "What are Amazon's main product image requirements?",
      "The main image must have a pure white background (RGB 255,255,255), show only the product being sold with no props, graphics or watermarks, and the product should fill 85% or more of the frame. Images need at least 1000 px on the longest side for zoom to work, and Amazon recommends 1600 px or more.",
    ],
    [
      "What size should product photos be for an online store?",
      "Square 2048 x 2048 px covers most stores: it is Shopify's recommended zoomable size and clears Amazon's 1600 px zoom recommendation. Etsy asks for at least 2000 px on the shortest side, and Instagram renders feed photos at 1080 px wide (1080 x 1350 for portrait, 1080 x 1080 square).",
    ],
    [
      "How do I write an AI prompt for a product photo?",
      "State the product and material first, then one surface, one camera angle, one lighting setup and the coverage you want, and finish with negatives like 'no warped shape, no garbled label text, no hands'. Stacking multiple surfaces or lighting styles in one prompt produces muddled, unusable shots.",
    ],
    [
      "Can I use AI-generated images for Amazon or Etsy listings?",
      "Policies differ and change — Amazon requires images to accurately represent the actual product, so AI renders that misrepresent it risk suppression, while Etsy requires disclosure for AI-created listing content in some categories. Use generated scenes for concepts and backgrounds, keep the product itself photographed, and check each marketplace's current policy.",
    ],
  ],
};

export default seo;
