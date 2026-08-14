const seo = {
  title: "Flesch-Kincaid Grade Checker and AI Rewrite Prompt",
  metaDescription:
    "Score any text with the Flesch-Kincaid formula, then build a rewrite prompt with a hard sentence-length cap for grades 2-3 through college level.",
  steps: [
    "Paste the passage into \"Text or prompt to adjust\" — at least 10 words, below which the tool refuses to score rather than give a misleading grade.",
    "Pick a Target reading level from Grades 2-3 (age 7-9) up to College / professional, and tick \"Keep essential technical terms (defined on first use)\" if the jargon has to stay.",
    "\"Current Flesch-Kincaid grade\" appears with words per sentence, syllables per word and Flesch Reading Ease, and the Generated rewrite prompt is ready for Copy prompt.",
  ],
  intro:
    "The Reading Level Prompt Adjuster scores any text with the Flesch-Kincaid grade formula (0.39 × words-per-sentence + 11.8 × syllables-per-word − 15.59) and builds an AI rewrite prompt targeting the grade band you choose, from grades 2-3 to college level. Instead of vaguely asking an AI to \"simplify this\", the generated prompt sets checkable rules: a maximum sentence length, plain-word substitutions and a ban on adding or changing content. Teachers, technical writers and accessibility editors get rewrites they can verify by re-scoring.",
  useCases: [
    "A teacher adapts one science explanation into grade 4-5 and grade 9-12 versions for a mixed-ability class.",
    "A government or health writer rewrites guidance to a grade 6-8 level, the range commonly recommended for public-facing documents.",
    "A prompt engineer lowers the reading level of a chatbot's system prompt so its answers stay accessible to younger users.",
  ],
  benefits: [
    ["A measured starting point", "Your text's actual Flesch-Kincaid grade, words per sentence and syllables per word are computed locally and embedded in the prompt."],
    ["Checkable rewrite rules", "Each grade band sets a concrete maximum sentence length derived from the FK formula, not just \"make it simpler\"."],
    ["Meaning preserved", "The prompt forbids adding, removing or reordering content — only the language changes, with technical terms optionally kept and defined."],
  ],
  faqs: [
    [
      "What is the Flesch-Kincaid grade level?",
      "It is a readability score that estimates the US school grade needed to understand a text, computed as 0.39 × (words per sentence) + 11.8 × (syllables per word) − 15.59 (Kincaid et al., 1975). A score of 8.0 means an average eighth-grader can read the text; this tool computes it locally in your browser.",
    ],
    [
      "What reading level should I target for a general audience?",
      "Plain-language guidance for public-facing writing commonly targets grades 6-8. Average adult reading comfort sits well below college level, so unless your audience is specialist, the grades 6-8 band is the safest default this tool offers.",
    ],
    [
      "How accurate is the syllable counting?",
      "It uses the standard heuristic of counting vowel groups with silent-e handling, which is what most automated readability tools do. Scores are typically within about one grade of dictionary-based counts; for borderline cases, judge by the words-per-sentence figure too, which is exact.",
    ],
    [
      "Why does the tool need at least 10 words?",
      "The Flesch-Kincaid formula averages over sentences and words, so on very short samples one unusual word can swing the grade by several levels. The tool refuses to score fewer than 10 words rather than give a misleading number.",
    ],
  ],
};

export default seo;
