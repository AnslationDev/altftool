const seo = {
  title: "Amazon Listing Prompt Builder — 250-Byte Search",
  metaDescription:
    "Build one AI brief for Amazon title, bullets and description with policy rules included, plus a backend search-term string packed into 250 bytes.",
  steps: [
    "Enter the product name, brand, category and shopper, then list \"Verified attributes — one per line\" and \"Keywords — one per line, primary first\".",
    "Set the bullet count, title target, characters per bullet and description length, and tick \"Also ask for an A+ content module outline\" if you need it.",
    "Check the backend search-terms byte counter against the 250 B limit, then click \"Copy prompt\" for the brief or \"Copy terms\" for the string.",
  ],
  intro:
    "This builder produces a single Amazon listing brief — title, bullets, description and optional A+ outline — with the platform's field limits and content policies stated inside the prompt itself. It also assembles the backend search-term string, stripping words that already appear in your title and packing the rest into the 250-byte limit Amazon measures that field in. It is for sellers and agencies who want listing copy tied to verified attributes rather than invented specifications.",
  useCases: [
    "Brief a writer or a chat model on a new ASIN without re-explaining Amazon's title rules every time.",
    "Build a compliant backend search-term string that fits 250 bytes without repeating title words.",
    "Keep a 40-product catalogue consistent by changing only the attribute list between runs.",
    "Check whether your planned bullet length will be collapsed behind 'read more' in the mobile app.",
  ],
  benefits: [
    ["Policy rules travel with the prompt", "Price, promotion, contact and medical claim bans are written into the brief, not left to the model."],
    ["Bytes, not characters", "Search terms are measured in UTF-8 bytes, so accented and non-Latin keywords are counted correctly."],
    ["No invented specs", "The model is instructed to write [CONFIRM] for any fact missing from your attribute list."],
  ],
  faqs: [
    [
      "What is the character limit for an Amazon product title?",
      "Most categories allow up to 200 characters, and listings that exceed the cap can be suppressed. Amazon's own guidance is to keep titles much shorter — around 80 characters reads cleanly on mobile — and several browse nodes publish stricter limits in their category style guide.",
    ],
    [
      "How many bytes are Amazon backend search terms limited to?",
      "250 bytes for the generic keywords field. Bytes matter because a plain ASCII letter costs one byte while an accented or Indic character costs two to four, so a keyword set that looks short can still overflow the field and be ignored.",
    ],
    [
      "Should I repeat title words in my backend search terms?",
      "No. Amazon indexes the title, bullets and description already, so repeating those words wastes the 250-byte allowance. This builder removes any keyword word that already appears in the title, along with filler words like 'best', 'cheap' and 'free' that add no ranking value.",
    ],
    [
      "What is not allowed in Amazon bullet points?",
      "Price, promotion, discount and shipping claims, contact details or URLs, review solicitations, references to other sellers, and unverified medical or safety claims. Comparative claims naming a competitor and subjective superlatives such as 'best seller' are also disallowed. Check the current policy pages, since Amazon updates them regularly.",
    ],
  ],
};

export default seo;
