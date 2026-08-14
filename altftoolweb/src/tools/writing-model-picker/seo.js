const seo = {
  title: "Writing Model Picker: Score 6 AI Options on 11 Criteria",
  metaDescription:
    "Rank six ways to write - frontier, retrieval-backed, fast mid-tier, self-hosted, on-device or grammar checker - on 11 weighted criteria.",
  steps: [
    "Answer What do you mostly need?, Typical length, How fact-dependent is it? and Confidentiality.",
    "Set How much do you publish?, Matching a specific voice and Running cost, and tick I work in more than one language if it applies.",
    "Best fit score names the winner out of 100 and Full ranking bars all six options, with a note when the top two are close; press Copy result to keep it.",
  ],
  intro:
    "Writing Model Picker scores six ways of getting writing done — a frontier hosted model, a model wired to live search or retrieval, a fast mid-tier model, open weights you host, a small model on your own device, and a dedicated grammar and style checker — against eleven weighted criteria. Your answers set an importance of 0-3 per criterion, each option carries a 0-5 rating on properties that do not change with the next release, and the score is the weighted total as a percentage of the maximum. It is aimed at anyone choosing between drafting, editing and ideation tools where confidentiality, fact-checking and volume matter as much as prose quality.",
  useCases: [
    "Decide whether a fact-heavy article needs a model with live retrieval rather than one answering from training data.",
    "Choose between a cheap fast model and a frontier model for a pipeline producing dozens of product descriptions a day.",
    "Find the only options that work when a manuscript is under embargo and must never leave the device.",
    "Check whether a pure style checker beats a generative model for a team that only wants line edits.",
  ],
  benefits: [
    ["Capability constraints first", "A grammar checker is ruled out for drafting work rather than quietly scoring low on it."],
    ["Grounding is a separate axis", "Fact-dependent writing scores retrieval-backed options higher instead of treating all models as interchangeable."],
    ["Transparent arithmetic", "Every point traces to a weight and a rating you can see and disagree with."],
  ],
  faqs: [
    [
      "Which AI model is best for long-form writing?",
      "For pieces over roughly 1,500 words, the deciding factor is coherence across the whole draft rather than sentence quality, which favours large hosted models with big context windows. Small local models of 7B-14B parameters lose the thread, repeat themselves and drop constraints from earlier sections, so they suit outlines and short copy rather than chapters or reports.",
    ],
    [
      "Do I need a model with web search for factual writing?",
      "You need it whenever the piece contains dates, prices, versions or news. A model answering from training data alone cannot know anything after its cutoff and will produce plausible, confidently wrong specifics, so grounded retrieval plus a manual check of every figure is the safer setup for reported or technical writing.",
    ],
    [
      "How do I get AI to write in my own voice?",
      "Give it samples rather than adjectives: two or three of your own pieces in the prompt teach sentence length, rhythm and vocabulary far better than an instruction like 'be conversational'. If you need a house voice across a whole team and a large back catalogue, fine-tuning an open-weight model on that catalogue is the more durable option.",
    ],
    [
      "Is it safe to put confidential drafts into an AI tool?",
      "Check the provider's data terms first — business tiers usually state that inputs are not used for training, while free consumer tiers often reserve that right. For embargoed, client-confidential or pre-publication material, an open-weight model on your own hardware or a local model on your device removes the question, which is why those two rank highest when confidentiality is set to offline only.",
    ],
  ],
};

export default seo;
