const seo = {
  title: "Shopify Product Description Prompt Builder & Handle",
  metaDescription:
    "Builds one prompt for description, SEO title, meta description and alt text, checks the 320-char meta field, and generates the Shopify URL handle.",
  steps: [
    "Enter Product title, Brand, Collection and Buyer, then fill \"Features and specifications — one per line\" and \"Keywords — one per line, primary first\".",
    "Pick Voice traits and Words to never use, choose a Description structure and word length, and paste any Current meta description to test it against 320 and 155 characters.",
    "Copy prompt takes the generated brief; Copy handle takes the URL handle, and the SEO page title panel counts your title against 70 characters.",
  ],
  intro:
    "This builder produces a single prompt covering everything on a Shopify product page: the description, the SEO page title, the meta description and image alt text, with each field's limit stated in the brief. It generates the URL handle from your title using Shopify's own slug rules, and checks an existing meta description against both the 320-character field maximum and the roughly 155 characters a desktop search result actually shows. It suits store owners and agencies writing many products in one consistent voice.",
  useCases: [
    "Rewrite an imported supplier description into your own voice without inheriting its claims.",
    "Check whether a page title will trip Shopify's 70-character counter before you paste it in.",
    "Generate a clean URL handle from a title full of punctuation, accents or unit symbols.",
    "Keep 200 products consistent by fixing the voice traits and banned words once and reusing them.",
  ],
  benefits: [
    ["Two meta limits, both checked", "Shopify's 320-character field and the shorter search snippet are measured separately."],
    ["Voice defined by exclusion too", "A banned-word list is usually more effective at removing generic AI phrasing than adjectives alone."],
    ["Handle generated, not guessed", "Accents are stripped, punctuation collapses to single hyphens, and trailing hyphens are removed."],
  ],
  faqs: [
    [
      "What is the character limit for a Shopify product title?",
      "The product title field accepts up to 255 characters. That is separate from the SEO page title in the Search engine listing editor, which Shopify counts against 70 characters — the two do not have to be the same string.",
    ],
    [
      "How long should a Shopify meta description be?",
      "Aim for about 155 characters. Shopify's field will accept up to 320, but a desktop search result typically truncates near 155-160, so anything beyond that is written for a reader who will not see it. Google also measures the snippet in pixels, so character counts are a guide rather than a guarantee.",
    ],
    [
      "How does Shopify generate a product URL handle?",
      "The handle is the title lowercased with every run of non-alphanumeric characters replaced by a single hyphen and leading or trailing hyphens removed. 'Speckled Stoneware Mug — 350 ml / Blue' becomes 'speckled-stoneware-mug-350-ml-blue'. Changing the handle later changes the URL, so set a redirect if the product is already indexed.",
    ],
    [
      "How long should a product description be?",
      "There is no SEO minimum. 100 to 200 words of specific, scannable copy usually outperforms a long block, because the buying decision rests on facts a shopper can check — size, material, compatibility, what is in the box — rather than on word count.",
    ],
  ],
};

export default seo;
