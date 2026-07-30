const seo = {
  intro:
    "Readability Checker scores pasted text against five standard formulas at once — Flesch reading ease, Flesch-Kincaid grade level, the Gunning Fog index, the Coleman-Liau index and SMOG — and reports the counts they are built from: words, sentences, syllables and words of three or more syllables. The reading-ease score uses the classic 206.835 − 1.015 × (words per sentence) − 84.6 × (syllables per word), and is banded from Very Easy at 90+ down to Very Confusing below 10. It is aimed at anyone who has to hit a stated reading level — plain-language policy, patient information, exam material, marketing copy — and wants to see which sentences are pulling the grade up.",
  useCases: [
    "Your health or government content has to meet a plain-language target around US grade 8, and you need the Flesch-Kincaid and Gunning Fog numbers before it goes to review.",
    "A blog draft feels heavy but you cannot say why, so you check whether the problem is sentence length (words per sentence) or vocabulary (percentage of three-syllable words), because the fix is different for each.",
    "You are writing worksheets for a specific school year and want SMOG and Coleman-Liau to agree roughly on the grade level before you hand them out.",
  ],
  benefits: [
    [
      "Five formulas side by side",
      "Reading ease, Flesch-Kincaid grade, Gunning Fog, Coleman-Liau and SMOG all run on the same text, so you can see where they disagree.",
    ],
    [
      "Shows the inputs, not just the verdict",
      "Word, sentence, syllable and complex-word counts are displayed, which is what tells you whether to shorten sentences or simplify vocabulary.",
    ],
    [
      "Scores as you type",
      "The analysis updates from the textarea directly, so you can edit a paragraph and watch the grade move rather than re-running a report.",
    ],
  ],
  faqs: [
    [
      "What is a good readability score?",
      "For general web and consumer writing, aim for a Flesch reading ease of 60-70 and a grade level around 8, which is where most plain-language guidance lands. Here 90+ reads as Very Easy, 70-89 Easy, 50-69 Fairly Easy, 30-49 Standard, 10-29 Fairly Difficult and below 10 Very Confusing.",
    ],
    [
      "Why do the four grade-level scores differ from each other?",
      "Because they weigh different things. Flesch-Kincaid and SMOG count syllables, Gunning Fog counts the percentage of words with three or more syllables, and Coleman-Liau ignores syllables entirely and uses letters per 100 words. A two- or three-grade spread between them on the same text is normal; treat the range as the answer rather than any single figure.",
    ],
    [
      "What counts as a complex word?",
      "Any word of three or more syllables, which is the standard threshold used by Gunning Fog and SMOG. That count and its share of total words are shown alongside the scores, so you can see exactly how much the vocabulary is costing you.",
    ],
    [
      "How accurate is the syllable counting?",
      "It uses a rule-based estimator — vowel groups, with adjustments for words ending in e, le, es and ed — which is close but not perfect on irregular words and names. Scores are therefore indicative; every syllable-based readability formula shares this limitation, and a difference of a few tenths of a grade is not meaningful.",
    ],
  ],
};

export default seo;
