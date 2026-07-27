const seo = {
  intro:
    "The Student Prompt Pack is a library of 9 fill-in-the-blank AI prompts built around evidence-backed study methods: the Feynman technique, active recall, spaced repetition, examiner-style marking and rubric-based feedback. Every prompt is written so the model checks, quizzes and critiques your work rather than doing it for you — quiz answers are withheld until you attempt the questions, essay feedback quotes your draft instead of rewriting it, and outlines organise your own thesis and evidence. Fill in the blanks in your browser and copy the finished prompt into any assistant.",
  useCases: [
    "Pasting your from-memory explanation of osmosis and getting every error quoted and challenged, plus three questions targeting the weakest spot — without a model answer to copy.",
    "Building a dated spaced-repetition schedule from six chemistry topics, real exam dates and an honest 8 hours a week, with expanding review intervals of roughly 1, 3, 7 and 14 days.",
    "Having a 6-mark past-paper answer marked strictly against the official mark scheme, separating knowledge you lacked from knowledge you had but stated too vaguely to credit.",
  ],
  benefits: [
    ["Learning-first by design", "Prompts forbid the model from writing your essay or answering its own quiz questions — the structure forces retrieval and revision, which is what produces grades."],
    ["Built on methods that work", "Active recall, spacing and self-explanation are among the best-supported techniques in learning research; each prompt operationalises one of them."],
    ["Runs locally", "Prompt assembly happens in the browser; no account, no API key and nothing you type leaves the page."],
  ],
  faqs: [
    [
      "Is using AI to study considered cheating?",
      "It depends on how you use it and your institution's policy. Having AI write assessed work for you is academic misconduct almost everywhere; using it to quiz you, check your own explanation or critique your draft is closer to a study partner. These prompts are deliberately written for the second mode — several explicitly instruct the model not to produce replacement prose — but always check your institution's rules.",
    ],
    [
      "Why is active recall better than re-reading my notes?",
      "Because retrieving information strengthens memory far more than re-exposure to it — the testing effect is one of the most replicated findings in learning research. The quiz prompt builds questions only from your own notes and withholds the answer key until you confirm you have attempted every question on paper.",
    ],
    [
      "What intervals should I use for spaced repetition?",
      "Expanding gaps of roughly 1 day, then 3, then 7, then 14 work well when an exam is weeks away; the exact numbers matter less than the expansion and the honesty of your available hours. The schedule prompt places weak topics earliest, gives them one extra review, and reserves the final three days for mixed retrieval rather than new learning.",
    ],
    [
      "How does the Feynman technique work with an AI?",
      "You write your explanation from memory first, then the AI acts as the critical audience: it quotes your imprecisions, lists what a complete explanation includes, and asks follow-up questions it deliberately leaves unanswered. The prompt forbids the model from writing a model explanation, because the learning happens when you rewrite yours.",
    ],
  ],
};

export default seo;
