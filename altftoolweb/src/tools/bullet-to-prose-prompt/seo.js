const seo = {
  title: "Bullet Points to Prose: AI Prompt with a Word",
  metaDescription:
    "Paste bullet notes and get an AI prompt with a computed word, sentence and paragraph budget — and a hard rule against inventing facts.",
  steps: [
    "Paste your notes into \"Your bullet points\" (one idea per line, two-space indent for sub-points) and describe the audience.",
    "Set the \"Expansion factor (×)\", average sentence words and sentences per paragraph — or fix an exact word count instead.",
    "Review the target prose length and the bullets-over-30-words count, then click \"Copy prompt\" to take the no-invention prompt.",
  ],
  intro:
    "Bullet to Prose Prompt measures the notes you paste — bullet count, words per bullet, nesting depth — and converts them into a length budget: source words multiplied by an expansion factor gives a target word count, which divides by your average sentence length into sentences and then into paragraphs. The prompt it writes carries those numbers plus a hard rule against inventing any fact not present in the notes. For anyone whose draft exists as a list and needs to become a paragraph.",
  useCases: [
    "Turn a sprint's worth of standup bullets into a status update for leadership who did not follow the detail.",
    "Expand interview notes into a readable summary without letting the model add opinions you never heard.",
    "Convert a CV's bullet list into a cover letter paragraph that keeps every achievement.",
    "Rewrite nested research notes into prose where the indented sub-points become subordinate clauses.",
  ],
  benefits: [
    ["A length budget, not a guess", "Expansion factor sets the word count, which resolves into a paragraph and sentence count."],
    ["Catches overloaded bullets", "Any bullet over 30 words is flagged as more than one idea and marked for splitting."],
    ["No invented detail", "The prompt forbids adding facts, numbers or names, and asks the model to name any bullet too thin to expand."],
  ],
  faqs: [
    [
      "How do I turn bullet points into a paragraph?",
      "Decide the target length first, then give the AI the bullets with an explicit instruction that every bullet must appear and nothing may be added. Without a length target and a no-invention rule, models pad bullets with generic filler — which is exactly what makes AI prose recognisable.",
    ],
    [
      "How many words should each bullet expand to?",
      "An expansion of 2 to 3 times the source word count usually reads naturally: 27 words of notes becomes roughly 55 to 80 words of prose. Beyond about 4x the model has to start inventing connective material, which is where accuracy slips.",
    ],
    [
      "What is a good average sentence length?",
      "Plain-language guidance from the UK Government Digital Service and plainlanguage.gov converges on 15 to 20 words per sentence on average, with variation between sentences. This tool defaults to 18 and lets you change it — the average matters more than any single sentence.",
    ],
    [
      "Will the AI add things I did not write?",
      "It can, which is why the generated prompt bans new facts, numbers, names and claims outright and asks the model to list any bullet it could not expand honestly. Always read the output against your notes before sending it — the instruction reduces invention but does not eliminate it.",
    ],
  ],
};

export default seo;
