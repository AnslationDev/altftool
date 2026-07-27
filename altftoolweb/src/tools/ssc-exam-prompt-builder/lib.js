/**
 * SSC exam prompt builder — pure logic.
 *
 * Every paper pattern below (question count, maximum marks, duration and the
 * negative-marking deduction) is taken from the Staff Selection Commission's
 * published examination notices for the paper named. Marks per correct answer
 * are derived as maxMarks / questions, which is how SSC states them.
 */

export const MIN_ATTEMPTS = 0;

/** SSC paper patterns. penalty = marks deducted for each wrong answer. */
export const SSC_EXAMS = {
  "cgl-tier1": {
    label: "SSC CGL Tier I",
    questions: 100,
    maxMarks: 200,
    minutes: 60,
    penalty: 0.5,
    sections: {
      "General Intelligence and Reasoning": 25,
      "General Awareness": 25,
      "Quantitative Aptitude": 25,
      "English Comprehension": 25,
    },
  },
  "chsl-tier1": {
    label: "SSC CHSL Tier I",
    questions: 100,
    maxMarks: 200,
    minutes: 60,
    penalty: 0.5,
    sections: {
      "English Language": 25,
      "General Intelligence": 25,
      "Quantitative Aptitude": 25,
      "General Awareness": 25,
    },
  },
  "mts-session1": {
    label: "SSC MTS Session I",
    questions: 40,
    maxMarks: 120,
    minutes: 45,
    penalty: 0,
    sections: {
      "Numerical and Mathematical Ability": 20,
      "Reasoning Ability and Problem Solving": 20,
    },
  },
  "mts-session2": {
    label: "SSC MTS Session II",
    questions: 50,
    maxMarks: 150,
    minutes: 45,
    penalty: 1,
    sections: {
      "General Awareness": 25,
      "English Language and Comprehension": 25,
    },
  },
  "cpo-paper1": {
    label: "SSC CPO Paper I",
    questions: 200,
    maxMarks: 200,
    minutes: 120,
    penalty: 0.25,
    sections: {
      "General Intelligence and Reasoning": 50,
      "General Knowledge and General Awareness": 50,
      "Quantitative Aptitude": 50,
      "English Comprehension": 50,
    },
  },
  "gd-constable": {
    label: "SSC GD Constable",
    questions: 80,
    maxMarks: 160,
    minutes: 60,
    penalty: 0.25,
    sections: {
      "General Intelligence and Reasoning": 20,
      "General Knowledge and General Awareness": 20,
      "Elementary Mathematics": 20,
      "English / Hindi": 20,
    },
  },
  "je-paper1": {
    label: "SSC JE Paper I",
    questions: 200,
    maxMarks: 200,
    minutes: 120,
    penalty: 0.25,
    sections: {
      "General Intelligence and Reasoning": 50,
      "General Awareness": 50,
      "General Engineering": 100,
    },
  },
};

/** Topic banks per section family, used to steer the prompt. */
export const SECTION_TOPICS = {
  reasoning: [
    "Analogy",
    "Classification / odd one out",
    "Series completion (number, letter, figure)",
    "Coding-decoding",
    "Blood relations",
    "Direction and distance",
    "Syllogism",
    "Seating arrangement",
    "Venn diagram",
    "Mirror and water image",
    "Paper folding and cutting",
    "Embedded and hidden figures",
    "Matrix / word formation",
    "Mathematical operations",
  ],
  quant: [
    "Number system and simplification",
    "Percentage",
    "Profit and loss",
    "Ratio and proportion",
    "Average",
    "Simple and compound interest",
    "Time and work",
    "Time, speed and distance",
    "Mensuration (2D and 3D)",
    "Geometry",
    "Trigonometry",
    "Height and distance",
    "Algebra",
    "Data interpretation",
  ],
  english: [
    "Error spotting",
    "Sentence improvement",
    "Fill in the blanks",
    "Synonyms and antonyms",
    "Idioms and phrases",
    "One word substitution",
    "Spelling correction",
    "Active and passive voice",
    "Direct and indirect narration",
    "Para jumbles",
    "Cloze test",
    "Reading comprehension",
  ],
  ga: [
    "Indian polity and Constitution",
    "Modern Indian history",
    "Ancient and medieval history",
    "Indian and world geography",
    "Indian economy and budget",
    "General science - physics",
    "General science - chemistry",
    "General science - biology",
    "Static GK (awards, sports, books, dances)",
    "Current affairs of the last six months",
    "Government schemes",
    "Computer fundamentals",
  ],
  engineering: [
    "Civil - building materials and estimation",
    "Civil - surveying and soil mechanics",
    "Civil - structural analysis and RCC",
    "Electrical - basic concepts and circuits",
    "Electrical - machines and transformers",
    "Electrical - measurement and utilisation",
    "Mechanical - theory of machines",
    "Mechanical - thermodynamics and IC engines",
    "Mechanical - fluid mechanics and machinery",
    "Mechanical - production engineering",
  ],
};

/** Which topic bank a section name draws from. */
export function topicBankFor(sectionName) {
  const name = String(sectionName || "").toLowerCase();
  if (name.includes("engineering")) return "engineering";
  if (name.includes("reasoning") || name.includes("intelligence")) return "reasoning";
  if (name.includes("mathemat") || name.includes("quantitative") || name.includes("numerical")) {
    return "quant";
  }
  if (name.includes("english") || name.includes("hindi")) return "english";
  return "ga";
}

/** Prompt modes. */
export const PROMPT_MODES = {
  "mcq-drill": {
    label: "MCQ practice set",
    task: "Write SSC-pattern single-correct MCQs with four options, matching the phrasing and length of real SSC questions.",
    output:
      "Questions first with no answers shown, then an answer key with a one-line justification and the trap in each wrong option.",
  },
  "shortcut-tricks": {
    label: "Shortcut / speed tricks",
    task: "Teach the fastest legitimate method for this topic: the shortcut, when it is safe to use, and when it silently fails.",
    output:
      "For each trick: the rule, a worked example the long way, the same example the short way with the time saved, and one case where the shortcut breaks.",
  },
  "concept-explain": {
    label: "Concept explainer",
    task: "Explain the concept from first principles for a candidate who has forgotten school-level basics, then build up to exam-level application.",
    output:
      "Plain-language explanation, then three worked examples of rising difficulty, then a five-line summary card.",
  },
  "error-log": {
    label: "Mistake / error log analysis",
    task: "Analyse the listed mistakes, classify each as conceptual, calculation, misreading or time pressure, and prescribe a fix for each class.",
    output:
      "A table: Mistake | Type | Root cause | Fix | One re-test question, followed by the answer key.",
  },
  "current-affairs": {
    label: "Current affairs digest",
    task: "Summarise the exam-relevant current affairs for the period given, restricted to items SSC actually asks about: schemes, appointments, awards, sports, summits, indices and reports.",
    output:
      "Grouped bullets by category, each bullet one line, followed by ten one-line revision questions with answers.",
  },
  "previous-year": {
    label: "Previous-year pattern brief",
    task: "Describe how this topic has been asked in SSC papers: the recurring question types, the typical difficulty and the sub-topics that appear most often.",
    output:
      "A ranked list of question types with an example of each, and a note on how many marks this topic is usually worth.",
  },
  "revision-sheet": {
    label: "One-page revision sheet",
    task: "Compress the topic into one page: every formula, rule and exception a candidate must recall in the exam hall.",
    output: "Dense bullets under headings, ending with a 10-item rapid-fire self-check and answers.",
  },
};

export const LANGUAGES = {
  english: "English",
  hinglish: "Hinglish (English terms with Hindi explanation)",
  bilingual: "Bilingual — each question in English and Hindi",
};

export const DIFFICULTY_LEVELS = {
  easy: "Easy — the level of SSC MTS and the opening questions of a Tier I paper.",
  moderate: "Moderate — the level of a typical SSC CGL Tier I question.",
  hard: "Hard — Tier II / cut-off-deciding level, multi-step and time-hungry.",
  mixed: "Mixed — 40% easy, 40% moderate, 20% hard, in that order.",
};

const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Pacing and marking maths for an SSC paper.
 *
 * marksPerCorrect  = maxMarks / questions
 * secondsPerQ      = minutes x 60 / questions
 * breakEvenAccuracy = penalty / (marksPerCorrect + penalty)
 *   Below this accuracy an extra attempt loses more than it gains; with zero
 *   negative marking the break-even is 0, i.e. always attempt.
 */
export function sscPaperMetrics(examKey) {
  const exam = SSC_EXAMS[examKey];
  if (!exam) return { error: "Pick an SSC paper." };

  const marksPerCorrect = exam.maxMarks / exam.questions;
  const secondsPerQuestion = (exam.minutes * 60) / exam.questions;
  const breakEvenAccuracyPct =
    exam.penalty > 0 ? (exam.penalty / (marksPerCorrect + exam.penalty)) * 100 : 0;

  return {
    label: exam.label,
    questions: exam.questions,
    maxMarks: exam.maxMarks,
    minutes: exam.minutes,
    penalty: exam.penalty,
    marksPerCorrect: round(marksPerCorrect, 2),
    secondsPerQuestion: round(secondsPerQuestion, 1),
    breakEvenAccuracyPct: round(breakEvenAccuracyPct, 1),
  };
}

/**
 * Net score under the paper's own marking.
 * net = correct x marksPerCorrect - wrong x penalty
 */
export function scoreSscAttempt({ examKey, correct, wrong }) {
  const exam = SSC_EXAMS[examKey];
  if (!exam) return { error: "Pick an SSC paper." };

  const c = Number(correct);
  const w = Number(wrong);
  if (![c, w].every(Number.isFinite)) {
    return { error: "Enter whole numbers for correct and wrong answers." };
  }
  if (c < MIN_ATTEMPTS || w < MIN_ATTEMPTS) {
    return { error: "Correct and wrong counts cannot be negative." };
  }
  if (c + w > exam.questions) {
    return { error: `${exam.label} has only ${exam.questions} questions.` };
  }

  const correctCount = Math.round(c);
  const wrongCount = Math.round(w);
  const marksPerCorrect = exam.maxMarks / exam.questions;
  const net = correctCount * marksPerCorrect - wrongCount * exam.penalty;
  const attempted = correctCount + wrongCount;

  return {
    attempted,
    unattempted: exam.questions - attempted,
    net: round(net, 2),
    maxMarks: exam.maxMarks,
    percentOfMax: round((net / exam.maxMarks) * 100, 1),
    accuracyPct: attempted > 0 ? round((correctCount / attempted) * 100, 1) : 0,
  };
}

/**
 * How many questions must be attempted at a given accuracy to reach a target score.
 *
 * marksPerAttempt = accuracy x marksPerCorrect - (1 - accuracy) x penalty
 * attempts        = ceil(target / marksPerAttempt)
 * If marksPerAttempt <= 0 the target is unreachable at that accuracy — that is
 * exactly the break-even accuracy boundary.
 */
export function attemptsForTarget({ examKey, targetMarks, accuracyPct }) {
  const exam = SSC_EXAMS[examKey];
  if (!exam) return { error: "Pick an SSC paper." };

  const target = Number(targetMarks);
  const acc = Number(accuracyPct);
  if (![target, acc].every(Number.isFinite)) {
    return { error: "Enter a target score and an accuracy percentage." };
  }
  if (target <= 0) return { error: "Target score must be greater than zero." };
  if (target > exam.maxMarks) {
    return { error: `${exam.label} is out of ${exam.maxMarks} marks.` };
  }
  if (acc <= 0 || acc > 100) return { error: "Accuracy must be between 0 and 100 percent." };

  const a = acc / 100;
  const marksPerCorrect = exam.maxMarks / exam.questions;
  const marksPerAttempt = a * marksPerCorrect - (1 - a) * exam.penalty;

  if (marksPerAttempt <= 0) {
    return {
      error: `At ${acc}% accuracy every extra attempt loses marks in ${exam.label}. Raise accuracy above the break-even point first.`,
    };
  }

  const attempts = Math.ceil(target / marksPerAttempt);
  if (attempts > exam.questions) {
    return {
      error: `Even attempting all ${exam.questions} questions at ${acc}% accuracy falls short of ${target} marks.`,
    };
  }

  const correct = Math.round(attempts * a);
  const wrong = attempts - correct;

  return {
    attempts,
    correct,
    wrong,
    marksPerAttempt: round(marksPerAttempt, 3),
    projectedNet: round(correct * marksPerCorrect - wrong * exam.penalty, 2),
    secondsAvailablePerAttempt: round((exam.minutes * 60) / attempts, 1),
  };
}

/**
 * Compose the SSC study prompt.
 * Returns { title, prompt, metrics, wordCount } or { error }.
 */
export function buildSscPrompt({
  examKey,
  section,
  topic,
  mode,
  difficulty,
  itemCount,
  language = "english",
  notes = "",
}) {
  const exam = SSC_EXAMS[examKey];
  if (!exam) return { error: "Pick an SSC paper." };
  if (!(section in exam.sections)) {
    return { error: `${section} is not a section of ${exam.label}.` };
  }
  const bank = SECTION_TOPICS[topicBankFor(section)];
  const topicName = String(topic || "").trim();
  if (!topicName) return { error: "Pick a topic." };
  if (!bank.includes(topicName)) {
    return { error: `"${topicName}" is not in the topic list for ${section}.` };
  }
  const modeSpec = PROMPT_MODES[mode];
  if (!modeSpec) return { error: "Pick a prompt mode." };
  const difficultySpec = DIFFICULTY_LEVELS[difficulty];
  if (!difficultySpec) return { error: "Pick a difficulty level." };
  const languageLabel = LANGUAGES[language];
  if (!languageLabel) return { error: "Pick an output language." };

  const count = Number(itemCount);
  if (!Number.isFinite(count) || count < 1 || count > 50) {
    return { error: "Number of items must be between 1 and 50." };
  }

  const metrics = sscPaperMetrics(examKey);
  const items = Math.round(count);
  const sectionQuestions = exam.sections[section];

  const lines = [
    `Act as an SSC coaching faculty member who has taught ${section} for ${exam.label} for ten years.`,
    "",
    `Paper: ${exam.label} — ${exam.questions} questions, ${exam.maxMarks} marks, ${exam.minutes} minutes.`,
    `Section: ${section} (${sectionQuestions} questions in the paper).`,
    `Topic: ${topicName}.`,
    `Task: ${modeSpec.task}`,
    `Produce exactly ${items} items.`,
    `Difficulty: ${difficultySpec}`,
    `Language: ${languageLabel}.`,
    "",
    "Marking and pacing rules to respect:",
    `1. ${exam.label} awards ${metrics.marksPerCorrect} mark(s) per correct answer${
      exam.penalty > 0
        ? ` and deducts ${exam.penalty} for each wrong answer`
        : " and has no negative marking"
    }.`,
    exam.penalty > 0
      ? `2. Attempting only pays above ${metrics.breakEvenAccuracyPct}% accuracy — flag any question where a candidate should skip rather than guess.`
      : "2. There is no negative marking in this paper, so state plainly that every question should be attempted.",
    `3. The paper allows about ${metrics.secondsPerQuestion} seconds per question. Give a target solving time for each item and say what to do when it overruns.`,
    "4. Match the phrasing, option length and answer-key style of real SSC papers, not textbook questions.",
    "5. Do not invent SSC notice numbers, cut-offs or vacancy figures. If a figure is not certain, say it must be checked on ssc.gov.in.",
  ];

  const extra = String(notes || "").trim();
  if (extra) lines.push(`6. Additional context from the candidate: ${extra}`);

  lines.push(
    "",
    `Output format: ${modeSpec.output}`,
    "",
    "End with three lines: the single sub-topic to revise next, the most common careless error on this topic, and one sentence on where this topic sits in the section's usual mark weight.",
  );

  const prompt = lines.join("\n");

  return {
    title: `${exam.label} · ${section} · ${topicName}`,
    prompt,
    metrics,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
  };
}
