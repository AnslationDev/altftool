const seo = {
  intro:
    "This builder scores your text with the Flesch Reading Ease formula — 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words) — and the Flesch–Kincaid grade level, then writes the rewrite prompt that moves it to the tone and readability band you choose. The prompt carries the measured numbers, the size of the gap in Flesch points, and an explicit list of what must not change: facts, quotations, structure, terminology or length. It is for writers, support teams and anyone turning dense copy into something a specific reader can actually follow.",
  useCases: [
    "Turn a legal or policy paragraph into plain English at Flesch 60–70 without altering its legal effect.",
    "Re-tone a support macro from formal to empathetic while keeping every product term and reference number intact.",
    "Set a house readability target and generate a consistent rewrite prompt every writer on the team can reuse.",
  ],
  benefits: [
    ["Measured, not guessed", "Both Flesch formulas run on your text before the prompt is written, so the model is told exactly how far it has to move."],
    ["Preservation rules", "Tick the things the rewrite must not touch — facts, quotes, Markdown, headings — and they become explicit prompt rules."],
    ["Twelve tone directives", "Each tone is a concrete instruction about voice, hedging and sentence shape rather than a one-word label."],
  ],
  faqs: [
    [
      "What is a good Flesch Reading Ease score?",
      "For public-facing writing, aim for 60–70, which the Flesch scale labels Plain English at roughly an 8th to 9th grade reading level. Consumer copy often targets 70–80, while academic and legal text commonly falls below 50.",
    ],
    [
      "How is Flesch Reading Ease calculated?",
      "The formula is 206.835 − 1.015 × (total words ÷ total sentences) − 84.6 × (total syllables ÷ total words). Only sentence length and syllable count feed it, which is why a short sentence of nonsense can still score highly.",
    ],
    [
      "What is the difference between Reading Ease and Flesch–Kincaid grade level?",
      "Reading Ease is a 0–100 scale where higher means easier; Flesch–Kincaid converts the same two inputs into a US school grade using 0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59. A grade level of 8 means an average eighth-grader should follow it.",
    ],
    [
      "Why does an AI rewrite change my facts?",
      "Because nothing in a plain 'make this friendlier' instruction forbids it. Naming the constraints explicitly — do not add, remove or alter any fact, name, date or figure; reproduce quotations verbatim — is what stops the drift, and this tool writes those rules into the prompt for you.",
    ],
  ],
};

export default seo;
