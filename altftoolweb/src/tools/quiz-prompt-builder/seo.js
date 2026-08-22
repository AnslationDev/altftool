const seo = {
  title: "AI Quiz Prompt Builder with Difficulty Mix",
  metaDescription:
    "Turn a topic and an easy/medium/hard percentage mix into a paste-ready AI quiz prompt — exact question counts, 4 formats, MCQ options and an answer key.",
  steps: [
    "Enter a Quiz topic, an optional Audience and the Number of questions (1–100), then set the Easy %, Medium % and Hard % fields, which must total 100%.",
    "Tick the question types — Multiple choice, True / false, Short answer, Fill in the blank — set Options per MCQ (2–6), and choose 'Include a separate answer key' or 'Add a one-line explanation per answer'.",
    "The Generated prompt pane shows the exact easy/medium/hard question counts and the full text; press Copy prompt to paste it into any AI assistant, or Reset to restore defaults.",
  ],
  intro:
    "The Quiz Prompt Builder turns a topic, a difficulty percentage mix and your allowed question formats into a structured, paste-ready quiz-generation prompt for any AI assistant. It converts percentages into exact whole-question counts using largest-remainder apportionment, so a 10-question quiz at 50/30/20 always yields exactly 5 easy, 3 medium and 2 hard questions. Teachers, trainers and course creators get consistent quizzes with a clean answer key instead of vague one-line requests.",
  useCases: [
    "A biology teacher builds a 15-question end-of-unit quiz with 40% easy recall, 40% application and 20% multi-step questions, plus a printable answer key.",
    "A corporate trainer generates a 10-question compliance check using only multiple-choice and true/false formats with 4 options per question.",
    "A student creates self-test quizzes from lecture topics, asking for explanations after each answer to turn the quiz into a revision aid.",
  ],
  benefits: [
    ["Exact difficulty counts", "Percentages become whole question counts that always sum to your total — no rounding drift."],
    ["Consistent output format", "The prompt fixes numbering, difficulty tags, MCQ option counts and answer-key layout so every quiz looks the same."],
    ["Private and instant", "Everything is assembled in your browser; no topic or class data leaves your device."],
  ],
  faqs: [
    [
      "How does the tool split questions across difficulty levels?",
      "It uses largest-remainder (Hare quota) apportionment: each percentage is converted to a fractional quota, floors are assigned first, and leftover questions go to the largest fractional remainders. This guarantees the easy, medium and hard counts always add up to exactly the total you asked for.",
    ],
    [
      "What question types can the prompt include?",
      "Four formats: multiple choice, true/false, short answer and fill in the blank. You can enable any combination, and for multiple choice you can fix the number of options anywhere from 2 to 6, with A–F labels and one clearly correct answer.",
    ],
    [
      "Does the generated prompt include an answer key?",
      "Yes, by default the prompt instructs the AI to append a separate \"Answer key\" section listing every answer on its own line. You can switch this off, or additionally request a one-sentence explanation for each answer for revision use.",
    ],
    [
      "How many questions can one prompt ask for?",
      "Between 1 and 100 questions. The cap exists because a single AI response tends to degrade in quality and consistency beyond roughly 100 questions; for longer assessments, generate the quiz in batches of 20–30 questions.",
    ],
  ],
};

export default seo;
