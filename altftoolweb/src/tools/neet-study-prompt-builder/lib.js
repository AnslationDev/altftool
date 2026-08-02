/**
 * NEET (UG) study prompt builder — pure logic.
 *
 * Exam-pattern constants below come from the NTA NEET (UG) information bulletin
 * pattern: 180 questions across Physics (45), Chemistry (45) and Biology (90),
 * 720 maximum marks, 200 minutes, +4 for a correct response, -1 for an
 * incorrect response and 0 for an unattempted question.
 */

/** NTA NEET (UG): total questions to be answered in the paper. */
export const NEET_TOTAL_QUESTIONS = 180;
/** NTA NEET (UG): marks awarded for each correct response. */
export const NEET_MARKS_PER_CORRECT = 4;
/** NTA NEET (UG): marks deducted for each incorrect response (negative marking). */
export const NEET_PENALTY_PER_WRONG = 1;
/** NTA NEET (UG): paper duration in minutes (3 hours 20 minutes). */
export const NEET_DURATION_MINUTES = 200;

/** Guard rails for the drill sizing inputs. */
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 180;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 600;

/**
 * NEET (UG) syllabus units as published by NTA (rationalised syllabus).
 * Chapter names are kept verbatim so a prompt anchors the model to the real unit.
 */
export const NEET_SUBJECTS = {
  Physics: [
    "Physics and Measurement",
    "Kinematics",
    "Laws of Motion",
    "Work, Energy and Power",
    "Rotational Motion",
    "Gravitation",
    "Properties of Solids and Liquids",
    "Thermodynamics",
    "Kinetic Theory of Gases",
    "Oscillations and Waves",
    "Electrostatics",
    "Current Electricity",
    "Magnetic Effects of Current and Magnetism",
    "Electromagnetic Induction and Alternating Currents",
    "Electromagnetic Waves",
    "Optics",
    "Dual Nature of Matter and Radiation",
    "Atoms and Nuclei",
    "Electronic Devices",
    "Experimental Skills",
  ],
  Chemistry: [
    "Some Basic Concepts of Chemistry",
    "Atomic Structure",
    "Chemical Bonding and Molecular Structure",
    "Chemical Thermodynamics",
    "Solutions",
    "Equilibrium",
    "Redox Reactions and Electrochemistry",
    "Chemical Kinetics",
    "Classification of Elements and Periodicity in Properties",
    "p-Block Elements",
    "d- and f-Block Elements",
    "Coordination Compounds",
    "Purification and Characterisation of Organic Compounds",
    "Some Basic Principles of Organic Chemistry",
    "Hydrocarbons",
    "Organic Compounds Containing Halogens",
    "Organic Compounds Containing Oxygen",
    "Organic Compounds Containing Nitrogen",
    "Biomolecules",
    "Principles Related to Practical Chemistry",
  ],
  Biology: [
    "Diversity in Living World",
    "Structural Organisation in Animals and Plants",
    "Cell Structure and Function",
    "Plant Physiology",
    "Human Physiology",
    "Reproduction",
    "Genetics and Evolution",
    "Biology and Human Welfare",
    "Biotechnology and its Applications",
    "Ecology and Environment",
  ],
};

/** Number of questions each subject contributes to the 180-question paper. */
export const SUBJECT_QUESTION_SHARE = {
  Physics: 45,
  Chemistry: 45,
  Biology: 90,
};

/** Study modes. Each carries the instruction block that shapes the prompt. */
export const STUDY_MODES = {
  "active-recall": {
    label: "Active recall questions",
    task: "Write open-ended active-recall questions that force retrieval from memory, not recognition. Group them from foundational to applied.",
    output:
      "A numbered question list first, then a separate 'Answer key' section with a 2-4 sentence answer for each question.",
  },
  "mcq-drill": {
    label: "MCQ drill (NEET pattern)",
    task: "Write single-correct-answer MCQs in the exact NEET (UG) style: four options A-D, one unambiguous correct answer, and distractors built from the most common student misconceptions.",
    output:
      "Questions first with no answers visible, then an 'Answer key' section giving the correct option, a one-line reason it is correct, and a one-line reason each distractor is wrong.",
  },
  "assertion-reason": {
    label: "Assertion-Reason set",
    task: "Write Assertion (A) and Reason (R) pairs using the standard four-option NEET format: both true and R explains A; both true but R does not explain A; A true R false; A false R true.",
    output:
      "The A/R pairs first, then an answer key naming the correct option and stating explicitly whether R explains A.",
  },
  "revision-notes": {
    label: "One-page revision notes",
    task: "Condense the chapter into one page of revision notes: definitions, every formula or reaction that is examinable, exceptions, and the units of each quantity.",
    output:
      "Short headed sections with bullet points and a final 'Ten-second recall' list of the facts most likely to be asked.",
  },
  "formula-sheet": {
    label: "Formula / reaction sheet",
    task: "List every formula, standard reaction or named process from the chapter, with each symbol defined and its SI unit stated, plus the condition under which the relation holds.",
    output:
      "A table with columns: Formula or reaction | Meaning of each symbol | Units | When it applies | Classic NEET trap.",
  },
  "mistake-audit": {
    label: "Mistake audit",
    task: "Diagnose the listed mistakes: for each, name the underlying misconception, restate the correct concept, and give one similar question that would catch the same error again.",
    output:
      "One block per mistake with the headings Misconception, Correct concept, Re-test question, Answer.",
  },
  "ncert-line-check": {
    label: "NCERT line-by-line check",
    task: "Pull out the NCERT statements from this chapter that have historically been asked verbatim, and turn each into a one-line fill-in-the-blank or true/false check.",
    output:
      "A numbered checklist, then the answer key, with the NCERT idea each item tests named in brackets.",
  },
  "spaced-plan": {
    label: "Spaced-repetition plan",
    task: "Build a spaced-repetition revision plan for this chapter using expanding intervals (day 1, day 3, day 7, day 16, day 35), stating exactly what to revise and what to self-test on each touch.",
    output:
      "A table with columns: Day | Revise | Self-test | Time needed, followed by a one-line rule for what to do if a session is missed.",
  },
};

/** Difficulty ladder. */
export const DIFFICULTY_LEVELS = {
  foundation: "NCERT-level. Direct, single-concept questions a student meets on first reading.",
  moderate: "Typical NEET level. Two concepts combined, or one concept applied to an unfamiliar situation.",
  advanced:
    "Top-percentile NEET level. Multi-step reasoning, data interpretation, or concepts stitched across two chapters.",
  mixed: "A graded mix: roughly 30% foundation, 50% moderate, 20% advanced, presented in that order.",
};

/** Output language options. */
export const LANGUAGES = {
  english: "English",
  hinglish: "Hinglish (English terms, Hindi explanation)",
  hindi: "Hindi (keep scientific terms in English)",
};

const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Scoring and pacing maths for a NEET-pattern drill.
 *
 * maxMarks            = questions x 4
 * secondsPerQuestion  = minutes x 60 / questions
 * breakEvenAccuracy   = penalty / (marksPerCorrect + penalty)
 *                     = 1 / (4 + 1) = 20% — below this, attempting loses marks.
 */
export function neetDrillMetrics({ questionCount, timeMinutes }) {
  const q = Number(questionCount);
  const t = Number(timeMinutes);

  if (!Number.isFinite(q) || !Number.isFinite(t)) {
    return { error: "Enter a number of questions and a time limit." };
  }
  if (q < MIN_QUESTIONS || q > MAX_QUESTIONS) {
    return { error: `Question count must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}.` };
  }
  if (t < MIN_MINUTES || t > MAX_MINUTES) {
    return { error: `Time limit must be between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.` };
  }

  const questions = Math.round(q);
  const maxMarks = questions * NEET_MARKS_PER_CORRECT;
  const secondsPerQuestion = (t * 60) / questions;
  const neetPaceSeconds = (NEET_DURATION_MINUTES * 60) / NEET_TOTAL_QUESTIONS;
  const breakEvenAccuracyPct =
    (NEET_PENALTY_PER_WRONG / (NEET_MARKS_PER_CORRECT + NEET_PENALTY_PER_WRONG)) * 100;

  return {
    questions,
    minutes: round(t, 2),
    maxMarks,
    secondsPerQuestion: round(secondsPerQuestion, 1),
    neetPaceSeconds: round(neetPaceSeconds, 1),
    paceRatio: round(secondsPerQuestion / neetPaceSeconds, 2),
    // Three-way comparison against the real NEET pace: a strict "<" here would
    // mislabel an exactly-matching pace (e.g. 90 items in 100 minutes, same
    // 200:180 ratio as the real paper) as "easier" rather than identical.
    paceComparison:
      secondsPerQuestion < neetPaceSeconds
        ? "tighter"
        : secondsPerQuestion > neetPaceSeconds
          ? "easier"
          : "same",
    breakEvenAccuracyPct: round(breakEvenAccuracyPct, 1),
  };
}

/**
 * Net score for an attempted drill under NEET marking.
 * net = 4 x correct - 1 x wrong. Unattempted questions score zero.
 */
export function scoreNeetDrill({ questionCount, correct, wrong }) {
  const q = Number(questionCount);
  const c = Number(correct);
  const w = Number(wrong);

  if (![q, c, w].every(Number.isFinite)) {
    return { error: "Enter whole numbers for questions, correct and wrong." };
  }
  if (q < MIN_QUESTIONS || q > MAX_QUESTIONS) {
    return { error: `Question count must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}.` };
  }
  if (c < 0 || w < 0) return { error: "Correct and wrong counts cannot be negative." };
  if (c + w > q) return { error: "Correct plus wrong cannot exceed the number of questions." };

  const questions = Math.round(q);
  const correctCount = Math.round(c);
  const wrongCount = Math.round(w);
  const attempted = correctCount + wrongCount;
  const net = correctCount * NEET_MARKS_PER_CORRECT - wrongCount * NEET_PENALTY_PER_WRONG;
  const maxMarks = questions * NEET_MARKS_PER_CORRECT;

  return {
    questions,
    attempted,
    unattempted: questions - attempted,
    net,
    maxMarks,
    percent: maxMarks > 0 ? round((net / maxMarks) * 100, 1) : 0,
    accuracyPct: attempted > 0 ? round((correctCount / attempted) * 100, 1) : 0,
  };
}

/**
 * Compose the study prompt.
 * Returns { title, prompt, metrics, wordCount } or { error }.
 */
export function buildNeetPrompt({
  subject,
  chapter,
  mode,
  difficulty,
  questionCount,
  timeMinutes,
  weakAreas = "",
  language = "english",
}) {
  if (!NEET_SUBJECTS[subject]) return { error: "Pick Physics, Chemistry or Biology." };
  const chapterName = String(chapter || "").trim();
  if (!chapterName) return { error: "Pick a chapter from the syllabus list." };
  if (!NEET_SUBJECTS[subject].includes(chapterName)) {
    return { error: `"${chapterName}" is not a ${subject} unit in the NEET syllabus list.` };
  }
  const modeSpec = STUDY_MODES[mode];
  if (!modeSpec) return { error: "Pick a study mode." };
  const difficultySpec = DIFFICULTY_LEVELS[difficulty];
  if (!difficultySpec) return { error: "Pick a difficulty level." };
  const languageLabel = LANGUAGES[language];
  if (!languageLabel) return { error: "Pick an output language." };

  const metrics = neetDrillMetrics({ questionCount, timeMinutes });
  if (metrics.error) return { error: metrics.error };

  const weak = String(weakAreas || "").trim();
  const subjectShare = SUBJECT_QUESTION_SHARE[subject];

  const lines = [
    `Act as a NEET (UG) subject expert for ${subject}, coaching a repeater-level aspirant.`,
    "",
    `Chapter: ${chapterName} (${subject}).`,
    `Task: ${modeSpec.task}`,
    `Volume: produce exactly ${metrics.questions} items, sized so they can be worked in ${metrics.minutes} minutes (${metrics.secondsPerQuestion} seconds per item).`,
    `Difficulty: ${difficultySpec}`,
    `Language: ${languageLabel}.`,
    "",
    "Non-negotiable rules:",
    `1. Stay strictly inside the current NTA NEET (UG) syllabus. If a sub-topic was removed in the rationalised syllabus, say so and skip it rather than covering it.`,
    `2. Anchor every fact to NCERT Class 11/12 ${subject}. Where a statement is not in NCERT, mark it "beyond NCERT".`,
    `3. Follow NEET marking in anything scored: +${NEET_MARKS_PER_CORRECT} correct, -${NEET_PENALTY_PER_WRONG} wrong, 0 unattempted. Remind me that guessing pays only above ${metrics.breakEvenAccuracyPct}% accuracy.`,
    `4. ${subject} contributes ${subjectShare} of the ${NEET_TOTAL_QUESTIONS} questions in the paper — weight depth accordingly.`,
    "5. Never invent a value, constant or NCERT line. If you are unsure, say so explicitly instead of guessing.",
    "6. Use SI units everywhere and state the unit next to every numerical answer.",
  ];

  if (weak) {
    lines.push(
      `7. Bias at least a third of the items towards these weak areas, in my own words: ${weak}`,
    );
  }

  lines.push(
    "",
    `Output format: ${modeSpec.output}`,
    "",
    "Finish with a 3-line 'Next session' note: what to revise tomorrow, what to re-test in 3 days, and the single concept most likely to cost me marks in the real paper.",
  );

  const prompt = lines.join("\n");

  return {
    title: `${subject} — ${chapterName} (${modeSpec.label})`,
    prompt,
    metrics,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
  };
}
