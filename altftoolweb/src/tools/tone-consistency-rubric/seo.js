const seo = {
  intro:
    "A tone consistency rubric scores a piece of writing against a defined brand voice on six anchored 1-5 scales — formality, warmth, directness, energy, jargon density and humour — and returns a weighted 0-100 alignment score plus the direction of every miss. It uses a behaviourally anchored rating scale, so each level carries a concrete description instead of a vague label, and each dimension is normalised by the worst possible miss for its own target. Useful for content leads, editors and anyone reviewing AI-generated copy at volume.",
  useCases: [
    "Reviewing AI-drafted support replies before they go out, to catch copy that has drifted formal or cold",
    "Onboarding a new writer or agency by scoring their first drafts against the same anchors the team uses",
    "Auditing a sample of published pages to find which channel has drifted furthest from the voice guide",
    "Checking that two editors agree on what the voice guide means before rolling a rubric out to a team",
  ],
  benefits: [
    ["Concrete anchors", "Every 1-5 level has a written description, so scores are repeatable across raters."],
    ["Weighted to your priorities", "Set weights per dimension; a dimension weighted zero drops out of the score entirely."],
    ["Names the fix", "Reports which dimension costs the most points and in which direction it drifted."],
  ],
  faqs: [
    [
      "How do you measure brand tone of voice consistency?",
      "Define a target level on each voice dimension, rate the sample on the same scale, then score alignment as the weighted average of one minus the miss divided by the worst possible miss for that target. A target of 3 can only be missed by 2 points while a target of 1 can be missed by 4, so normalising per dimension stops extreme targets from dominating the score.",
    ],
    [
      "What are the dimensions of a brand voice?",
      "The six used here cover most published voice guides: formality, warmth, directness, energy, jargon density and humour. Nielsen Norman Group's tone-of-voice work uses four similar dimensions (funny to serious, formal to casual, respectful to irreverent, enthusiastic to matter-of-fact); the extra scales here separate jargon and directness because those are where AI-generated copy drifts first.",
    ],
    [
      "What counts as a good tone consistency score?",
      "90 and above reads as on voice — the remaining difference is inside normal rater noise. 75 to 89 is minor drift fixable with a couple of edits, 60 to 74 is drift a regular reader would feel, and below 60 the piece effectively reads as a different brand and is faster to rewrite than to patch.",
    ],
    [
      "How do I know two reviewers are using the rubric the same way?",
      "Have both score the same sample and compare exact agreement and adjacent agreement (within one scale point). Adjacent agreement below roughly 80% almost always means an anchor is ambiguous rather than that a rater is wrong — rewrite the anchor for the dimension with the biggest gap and re-test.",
    ],
  ],
};

export default seo;
