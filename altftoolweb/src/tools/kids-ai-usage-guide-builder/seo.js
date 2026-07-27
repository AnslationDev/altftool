const seo = {
  intro:
    "The Kids AI Usage Guide Builder turns an age, a time allowance and a set of house rules into a written family agreement covering which AI activities are allowed now, which need an adult present, and which wait a few years. Age thresholds follow COPPA (which covers children under 13 in the US), the GDPR Article 8 default digital-consent age of 16, and the 13+ minimum age stated in the consumer terms of the mainstream AI assistants. Parents and carers get a printable text they can edit, sign and revisit on a set review cycle.",
  useCases: [
    "Agree a first set of rules before handing a 12-year-old an AI homework helper on the family tablet.",
    "Renegotiate screen time with a 15-year-old who has moved from homework questions to image generation and long chats.",
    "Give a grandparent or childminder a one-page summary of what the child is and is not allowed to ask an AI tool.",
    "Bring a written agreement to a parent-teacher meeting so home rules line up with the school's AI policy.",
  ],
  benefits: [
    ["Age-aware defaults", "Suggested supervision level and daily minutes change with the age band instead of one blanket rule."],
    ["Activity-by-activity", "Each use — homework help, image generation, companionship, uploading a face — is sorted into now, with an adult, or later."],
    ["Written and reviewable", "Produces a signable text with a built-in review interval, so the deal changes as the child grows."],
  ],
  faqs: [
    [
      "What age can a child use AI chatbots?",
      "Most mainstream consumer AI assistants set 13 as their minimum age and ask for parental permission for anyone under 18. Below 13, COPPA applies in the United States and the child should be on a purpose-built children's product or using an adult's account with the adult present.",
    ],
    [
      "How much time should kids spend using AI tools each day?",
      "There is no official medical limit for AI specifically, so this builder starts from modest defaults — around 20 minutes a day under 13, 45 minutes at 13 to 15, and an hour at 16 to 17 — and flags any allowance more than 1.5 times the band's starting point. Treat those as conversation starters and adjust for whether the use is schoolwork or entertainment.",
    ],
    [
      "What rules should be in a family AI agreement?",
      "The highest-value rules are: never type identifying details such as full name, address, school or phone number; check anything factual in a second source; follow the school's AI policy and disclose AI use on schoolwork; keep AI use in a shared room; and tell a parent immediately if anything on screen is upsetting. The builder weights these when scoring how well covered your agreement is.",
    ],
    [
      "Is it safe for children to treat an AI as a friend?",
      "Companion-style chatting is the use this tool defers longest, to around 16, because it involves sustained personal disclosure to a system that stores conversations and can answer confidently but wrongly. If a child is already relying on an AI for emotional support, that is worth discussing with them and, where it affects wellbeing, with a doctor or school counsellor.",
    ],
  ],
};

export default seo;
