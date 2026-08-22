const seo = {
  title: "Ecommerce Listing Prompt Builder: Keyword Plan",
  metaDescription:
    "Build a listing prompt from verified attributes, spreading keywords across title and bullets inside Merchant Center's 150 and 5,000 character limits.",
  steps: [
    "Fill Product name, Category and Buyer, and pick a Tone for the copy.",
    "List only verified facts under \"Attributes — one per line\", then \"Keywords — one per line, most important first\" — the first keyword is treated as primary and assigned to the title, and only the first 20 are used.",
    "Set Bullet count, Title target (characters) and Description length (words), tick \"Ask for a meta description\" or \"Ask for three buyer FAQs\" if you want them, then press Copy prompt.",
  ],
  intro:
    "This builder assembles a single structured prompt for writing a product listing, made up of a role line, your verified attributes, the benefits to lead with, a keyword placement plan and hard output limits. Keywords are allocated across title, bullets and description so no phrase is repeated in every field, and the length rules follow the Google Merchant Center product data specification — 150 characters for a title, 5,000 for a description. It is aimed at sellers and marketers who want listing copy grounded in real product facts instead of invented specifications.",
  useCases: [
    "Write fifty listings in one style by changing only the attributes and keywords between runs.",
    "Hand a freelancer or an AI assistant a brief that already contains the character limits and the keyword plan.",
    "Stop a model inventing dimensions or certifications by restricting it to the attribute list you supply.",
    "Produce a title that still says what the product is inside the first 60 characters shown in search.",
  ],
  benefits: [
    ["Keyword allocation, not stuffing", "The primary phrase goes to the title and the rest are dealt one per bullet, with a two-mention cap."],
    ["Facts are fenced", "The prompt instructs the model to write [CONFIRM] instead of guessing any missing specification."],
    ["Limits baked in", "Title, description and meta description lengths are stated in the prompt so the output arrives usable."],
  ],
  faqs: [
    [
      "How long should an ecommerce product title be?",
      "Aim for 60 characters or fewer, because that is roughly what Google shows before truncating a result. The technical ceiling is higher — the Google Merchant Center title attribute accepts 150 characters — but anything past the truncation point is invisible to most shoppers.",
    ],
    [
      "How many keywords should one product listing target?",
      "Two to six related phrases is usually enough for one listing. Beyond that the phrases start competing with each other and the copy reads as stuffed; this builder caps the plan at 20 and spreads them so no single phrase appears more than twice.",
    ],
    [
      "What is the maximum length of a product description in a shopping feed?",
      "The Google Merchant Center description attribute accepts up to 5,000 characters. In practice 100-200 words of scannable copy converts better than a long block, so the builder asks for a word target and states the 5,000-character ceiling as a hard limit rather than a goal.",
    ],
    [
      "Will AI-written product copy hurt my search rankings?",
      "Search guidance judges content by usefulness and accuracy rather than by how it was produced, so the risk is not the tool but the output — invented specifications, duplicated boilerplate across variants and unsupported claims. Review every generated listing against the real product before publishing.",
    ],
  ],
};

export default seo;
