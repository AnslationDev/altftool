const seo = {
  intro:
    "The Ad Copy Prompt Builder assembles an AI prompt for writing paid ad copy that respects each platform's real character limits — 30-character headlines and 90-character descriptions for Google responsive search ads, 125/40/30 recommendations for Meta feed ads, roughly 150/70 truncation points for LinkedIn sponsored content and X's 280-character posts. It also encodes your chosen angle, verbatim proof points and compliance guardrails for regulated categories. It is built for performance marketers and founders who are tired of AI ad drafts that blow past the limits or invent claims.",
  useCases: [
    "A PPC manager generating 5 distinct 30-character Google RSA headlines that each stand alone for mix-and-match serving",
    "A DTC founder writing Meta feed ads that hook within the first 125 characters and avoid personal-attribute framing",
    "A fintech marketer producing compliant ad variants with [DISCLOSURE] placeholders where risk language is required",
  ],
  benefits: [
    ["Real platform limits", "Character caps per field come from each platform's published specs, and the prompt demands per-field character counts in the output."],
    ["Five proven angles", "Problem-solution, benefit-led, social proof, urgency and comparison — each with concrete execution instructions."],
    ["Compliance guardrails", "No invented statistics or fake urgency, plus extra rule sets for finance, health and employment/housing categories."],
  ],
  faqs: [
    [
      "What are the character limits for Google responsive search ads?",
      "Google Ads responsive search ads allow up to 15 headlines of 30 characters each and up to 4 descriptions of 90 characters each. Because Google mixes and matches assets, every headline must make sense on its own — the prompts generated here instruct the AI to write standalone headlines and to report the character count of each one.",
    ],
    [
      "How long should Facebook ad copy be?",
      "Meta recommends about 125 characters of primary text, a 40-character headline and a 30-character description for feed ads — longer text gets truncated behind a 'See more' link. The most effective practice is to put the hook in the first sentence, which this builder writes into the prompt as a hard rule.",
    ],
    [
      "Why do my AI-written ads keep getting rejected by ad platforms?",
      "The most common causes are unsubstantiated claims, implied personal attributes and gimmicky punctuation. Meta's personal-attributes policy disallows copy that implies the reader has a condition (for example 'Struggling with debt?'), and Google's editorial policy blocks exclamation marks in headlines and ALL-CAPS gimmicks. The prompts generated here encode these rules so drafts start closer to policy-clean.",
    ],
    [
      "Can I use AI to write ads for finance or health products?",
      "Yes, but with tighter guardrails: no guaranteed returns or cure claims, conditional language, and placeholders where regulated disclosures belong. This builder adds category-specific rule sets for finance, health and employment/housing ads, and instructs the model to list every claim needing verification. Final compliance review by a qualified professional is still required — this tool is informational, not legal advice.",
    ],
  ],
};

export default seo;
