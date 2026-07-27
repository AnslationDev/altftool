const seo = {
  intro:
    "This builder validates an Etsy tag set against the platform's hard limits — 13 tags of at most 20 characters each — and then assembles a listing prompt around your verified item details, materials and a chosen maker story angle. Tags that are too long are shown with a shortened version that fits, duplicates are removed, and any unused slot is turned into a request for the model to suggest a replacement. It is aimed at handmade and vintage sellers who want a title and description grounded in what the item actually is.",
  useCases: [
    "Find out which of your tags are silently being rejected for running past 20 characters.",
    "Fill the last four empty tag slots instead of leaving them unused on a live listing.",
    "Write the same item in five colourways without rewriting the story section each time.",
    "Give a listing a specific maker angle — process, materials, or the gifting moment — rather than generic craft copy.",
  ],
  benefits: [
    ["Tags checked before you paste", "Length, duplicates, slot count and over-repeated words are all flagged with the fix."],
    ["Story angle, not filler", "Five concrete angles replace vague 'tell your brand story' advice with a specific brief."],
    ["Facts stay fenced", "The prompt limits the model to your detail and material lists and marks anything else [CONFIRM]."],
  ],
  faqs: [
    [
      "How many tags can an Etsy listing have?",
      "Thirteen. Each tag can be up to 20 characters including spaces, so multi-word phrases have to be tight — 'handmade ceramic mug' is exactly 20 characters and fits, while 'personalised coffee mug for her' is 31 and does not.",
    ],
    [
      "What is the character limit for an Etsy title?",
      "140 characters. The whole title is indexed, but only the opening is visible in search results and shared links, so put what the item literally is in roughly the first 40 characters and keep the qualifiers behind it.",
    ],
    [
      "Should Etsy tags be single words or phrases?",
      "Phrases, in almost every case. Shoppers search in phrases, and a multi-word tag can match both the phrase and its component words. Repeating the same word across many tags mostly wastes slots — this builder warns when one word appears in four or more of your 13.",
    ],
    [
      "How many photos can I add to an Etsy listing?",
      "Up to 10 photos and one video per listing. Materials are capped at 13 entries of 45 characters each. These limits can change, so check Etsy's current seller handbook before you rely on them for a bulk upload.",
    ],
  ],
};

export default seo;
