const seo = {
  title: "Kids AI Tutor System Prompt Builder - Child-Safe Rules",
  metaDescription:
    "Generate a child-safe AI tutor system prompt with an age band (5-7, 8-10, 11-13), allowed subjects and seven safety rules like trusted-adult referral.",
  steps: [
    "Pick the Age band (required) - Ages 5-7, 8-10 or 11-13 - and a Teaching style such as Guide with questions (Socratic), then tick the Subjects the tutor may teach and the seven Safety rules like Never ask for personal data and Refer sensitive issues to a trusted adult.",
    "The prompt assembles live with an estimated token count, and any protection you untick is flagged under Safety gaps to close so removing a rule is a visible choice.",
    "Review the full text under Your system prompt and press Copy prompt to paste it into your AI assistant - the prompt is assembled in your browser and sent nowhere.",
  ],
  intro:
    "This builder creates a child-safe system prompt for an AI tutor: an age-matched reading level (5–7, 8–10 or 11–13), a fixed list of allowed subjects, and non-negotiable safety rules — no personal-data collection (aligned with COPPA's under-13 protections), safe-topic boundaries and referral of any sensitive disclosure to a trusted adult. It is for parents, teachers and edtech builders configuring an AI tutor a child will actually talk to.",
  useCases: [
    "A parent setting up a maths practice buddy for an 8-year-old that stays on maths and hands anything sensitive to a trusted adult",
    "A primary teacher creating a reading tutor persona whose sentence length and vocabulary match early readers",
    "An edtech developer drafting the safety section of a tutor prompt before a child-safety review",
  ],
  benefits: [
    ["Age-matched language", "Each band sets concrete rules — sentence length, vocabulary, example types — not just 'be age appropriate'."],
    ["Safety rules by default", "Safe topics, no personal data, trusted-adult referral, no external links and kind tone ship as one-click rules the tool warns about if removed."],
    ["Pedagogy built in", "Socratic questioning, one-idea-per-message pacing and growth-mindset praise are written into the prompt."],
  ],
  faqs: [
    [
      "How do I make an AI tutor safe for kids?",
      "Constrain four things in the system prompt: allowed topics (with a rule to redirect everything else), personal data (never ask for names, schools, addresses or photos), sensitive disclosures (one gentle sentence, then refer the child to a parent or teacher), and tone (never mock mistakes). A prompt reduces risk but does not replace supervision — an adult should stay aware of the conversations.",
    ],
    [
      "What age is appropriate for a child to use an AI tutor?",
      "Most AI chat services set 13 as their minimum age for unsupervised use, which is also the line drawn by COPPA, the US children's privacy law. Below that age, use should run through a parent's or school's account with an adult supervising — which is the scenario this builder's prompts are designed for, with bands at 5–7, 8–10 and 11–13.",
    ],
    [
      "What is the Socratic method in tutoring?",
      "It is teaching by guided questions instead of giving answers: the tutor breaks a problem into small steps and asks one question at a time, so the child does the thinking. Research on tutoring effectiveness, going back to Bloom's two-sigma studies, consistently favours guided practice over answer-giving. This builder's default style withholds the answer until the child has made two honest attempts.",
    ],
    [
      "Why should a tutor praise effort instead of intelligence?",
      "Carol Dweck's growth-mindset research found that praising strategy and effort ('you tried three different ways') keeps children taking on harder problems, while praising innate ability ('you're so smart') makes them avoid challenges that might disprove the label. The builder includes this as a one-click rule written into the prompt's safety section.",
    ],
  ],
};

export default seo;
