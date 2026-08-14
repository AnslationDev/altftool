const seo = {
  title: "AI Quiz Generator: Paste Text, Get 15 Questions",
  intro:
    "AI Quiz Generator turns any passage of text into a graded quiz using in-browser NLP: it splits the passage into sentences, ranks the key terms in each one, then blanks a term to build multiple-choice and fill-in-the-blank questions or swaps a term to build a false statement for true/false. Terms are prioritised by type — capitalised two-word phrases rank highest, then proper nouns, then numbers, then long words — so the questions target the content words rather than random filler. It produces up to 15 questions per run, grades instantly, and shows the original sentence as the explanation for every answer.",
  useCases: [
    "You have a chapter of lecture notes and want to self-test on it tonight rather than reread it a fourth time",
    "You are teaching and need a quick comprehension check from a reading you assigned, with the source sentence attached to each answer",
    "You are onboarding someone onto a policy or handbook section and want to confirm they actually absorbed the specifics, not just skimmed",
  ],
  benefits: [
    [
      "Difficulty changes which terms get tested",
      "Easy targets the highest-priority terms (proper nouns and capitalised phrases); hard deliberately picks low-priority ordinary vocabulary, which is far harder to recall from context.",
    ],
    [
      "Every answer traces back to the source",
      "Explanations quote the original sentence verbatim, including the corrected version for a false true/false item, so a disputed answer is settled from the text.",
    ],
    [
      "Three question formats from one paste",
      "Multiple choice, true/false and fill-in-the-blank are generated from the same passage in a single pass, capped at 5 of each so no one format dominates.",
    ],
  ],
  faqs: [
    [
      "How much text do I need to paste in?",
      "At least two usable sentences containing at least two distinct key terms, but a few hundred words gives much better results. Only sentences between 4 and 45 words are used — very short fragments carry nothing to test, and very long ones make unreadable question stems.",
    ],
    [
      "How many questions will it generate?",
      "Up to 15 in total, with a maximum of 5 per question type. If your passage is short you will get fewer, because each question consumes a sentence and a key term and neither is reused.",
    ],
    [
      "Does my text get uploaded anywhere?",
      "No. Sentence splitting, term extraction and question building all run in JavaScript in your tab, and quiz history is kept in localStorage under the key ai-quiz-generator-history. That makes it safe for internal documents and unpublished coursework.",
    ],
    [
      "Why are some of the wrong answers obviously wrong?",
      "Distractors are drawn from other key terms in the same passage, so when the text is short or the terms are very different in kind, the wrong options stand out. Paste a longer, more uniform passage — more candidate terms means more plausible distractors.",
    ],
  ],
};

export default seo;
