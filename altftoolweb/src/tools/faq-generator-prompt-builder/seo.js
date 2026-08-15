const seo = {
  title: "FAQ Prompt Builder with Intent Mix and FAQPage Schema",
  metaDescription:
    "Paste a product description, choose 3 to 30 questions across pricing, setup, comparison, trust, support and policy, and set 40-60 word snippet answers.",
  steps: [
    "Enter the product or service name and paste the product description — declared in the prompt as the only facts the model may use.",
    "Set how many questions (3-30), pick an Answer length such as \"Snippet — 40 to 60 words\", choose a Tone, and tick the question categories to cover.",
    "Optionally tick \"Also ask for schema.org FAQPage JSON-LD\", check the Questions planned count, then press Copy prompt.",
  ],
  intro:
    "An FAQ generator prompt builder turns a product description into a controlled AI prompt that returns a specific number of questions, spread across the buyer-intent categories you choose, with answers written to a set word length. It ranks the recurring terms in your description so wording stays consistent, and it can request a matching schema.org FAQPage JSON-LD block alongside the visible text. The point is coverage and honesty: pricing, limits and objections get their own questions instead of being quietly skipped.",
  useCases: [
    "Build the FAQ block for a product or pricing page from the copy you already have, without inventing features.",
    "Cut repeat support tickets by turning the five questions your team answers daily into published answers.",
    "Write snippet-length answers of 40 to 60 words aimed at featured snippets and AI answer engines.",
    "Produce a consistent FAQ for every product in a catalogue by running the same category plan across each description.",
  ],
  benefits: [
    [
      "Coverage you choose",
      "Questions are distributed across pricing, setup, comparison, trust, support and policy — not seven variations of \"what is it\".",
    ],
    [
      "Facts stay bounded",
      "The description is declared as the only source, so any number the model cannot find comes back as TODO(verify).",
    ],
    [
      "Schema that matches the page",
      "The optional FAQPage JSON-LD request requires the markup text and the visible text to be identical, which is what search engines check.",
    ],
  ],
  faqs: [
    [
      "How long should an FAQ answer be?",
      "Around 40 to 60 words if you want the answer to be quotable as a featured snippet, and up to about 120 words when the question genuinely needs detail. Lead with the direct answer in the first sentence — the supporting explanation after it is what gets truncated, and that is fine.",
    ],
    [
      "How many FAQs should a page have?",
      "Six to twelve for a product or pricing page. Past that, the questions start duplicating each other's answers, which dilutes the page and annoys readers. Split a longer set into a dedicated help centre organised by topic instead.",
    ],
    [
      "Does FAQ schema still get rich results in Google?",
      "Rarely. Since August 2023 Google has shown FAQ rich results only for well-known authoritative government and health websites. The FAQPage markup is still valid and still helps machines parse your page, but for most sites it will not change how the listing looks.",
    ],
    [
      "What makes an FAQ question good?",
      "It uses the customer's words, not yours, and it has exactly one answer. \"How much does it cost per user?\" is a question; \"Pricing\" is a heading. Questions that make you uncomfortable — cancellation, limits, what the product does not do — are usually the highest-value ones to answer.",
    ],
  ],
};

export default seo;
