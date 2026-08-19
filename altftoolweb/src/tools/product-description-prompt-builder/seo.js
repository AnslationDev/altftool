const seo = {
  title: "Product Description Prompt Builder: Amazon, Etsy",
  metaDescription:
    "Turn a feature list into a listing-copy prompt: feature-to-benefit bullets, a word budget that sums exactly, and Amazon, Etsy or eBay title limits.",
  steps: [
    "Type the product name and paste your features, one per line, into the Features box.",
    "Pick Where it will be listed (Amazon, Etsy or eBay), a Tone, and the Description length (words).",
    "The Copy budget panel splits those words across five sections; press Copy prompt for the finished brief.",
  ],
  intro:
    "Product Description Prompt Builder converts a raw feature list into a listing-copy prompt that pairs every feature with the benefit it creates, splits a word budget across the five parts of a listing, and carries the destination marketplace's real title, bullet and description limits. The split uses the largest-remainder method so the section word counts always add back to the total you asked for. Aimed at sellers and copywriters who want listings that read like a spec sheet a human wrote, not a wall of adjectives.",
  useCases: [
    "Rewrite an Amazon listing so the five bullets each state a feature and what it changes for the buyer.",
    "Fit a product title into eBay's 80-character cap without losing the searchable attribute.",
    "Generate 13 Etsy tags of 20 characters or fewer alongside the description.",
    "Give a freelancer a brief that already contains the word count per section and the claims they must not make.",
  ],
  benefits: [
    ["Features become benefits", "Every bullet is instructed to state the feature and its consequence in the same sentence."],
    ["Budget that adds up", "The largest-remainder split guarantees the per-section word counts sum to your total exactly."],
    ["Claim guardrails", "No invented certifications, ratings, awards, or health and environmental claims outside your own feature list."],
  ],
  faqs: [
    [
      "How long should a product description be?",
      "For most marketplaces 150 to 250 words of description plus five bullets is enough; longer copy rarely gets read on mobile. What matters more than the total is the split — roughly 15% hook, 45% feature-to-benefit bullets, 20% use cases, 10% specs and 10% close.",
    ],
    [
      "What is the character limit for an Amazon product title?",
      "200 characters is the usual ceiling, though Amazon sets category-specific limits and several categories cap much lower. Assume the mobile app will truncate around 70-80 characters, so the product type and the key attribute must come first.",
    ],
    [
      "How many bullet points does Amazon show?",
      "Five. If you have more features than that, the extras belong in the description rather than in a sixth bullet, because anything past the fifth is typically not displayed on the product page.",
    ],
    [
      "What is the difference between a feature and a benefit in listing copy?",
      "A feature is a property of the product ('deep pocket fits mattresses up to 40 cm'); a benefit is what changes for the buyer ('so it stays on over a thick topper instead of popping off at 3am'). Listings convert better when each bullet contains both, in that order.",
    ],
  ],
};

export default seo;
