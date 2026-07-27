/**
 * CBSE Class 10 syllabus tracker.
 *
 * Chapter lists follow the rationalised NCERT textbooks CBSE currently
 * prescribes for the secondary stage (the trimmed syllabus in force from the
 * 2023-24 session). At Class 10 every main subject is assessed as an 80-mark
 * board theory paper plus 20 marks of internal assessment, which the CBSE
 * assessment scheme splits into periodic test, multiple assessment, portfolio
 * and subject enrichment activity — 5 marks each.
 *
 * Pure arithmetic only: no dates, no DOM, no React.
 */

/** Board theory paper marks for every main Class 10 subject. */
export const THEORY_MARKS = 80;

/** Internal assessment marks for every main Class 10 subject. */
export const INTERNAL_MARKS = 20;

/** The four 5-mark components that make up the 20 internal marks. */
export const INTERNAL_COMPONENTS = [
  { label: "Periodic test", marks: 5 },
  { label: "Multiple assessment", marks: 5 },
  { label: "Portfolio", marks: 5 },
  { label: "Subject enrichment activity", marks: 5 },
];

/**
 * Revision states for a chapter. The weights convert four qualitative states
 * into a single percentage for display; they are not a CBSE grading scale.
 */
export const CHAPTER_STATUSES = [
  { id: "not-started", label: "Not started", weight: 0 },
  { id: "reading", label: "Read once", weight: 0.5 },
  { id: "revised", label: "Revised", weight: 0.8 },
  { id: "mastered", label: "Revised + sample papers done", weight: 1 },
];

export const DEFAULT_STATUS = "not-started";

const STATUS_WEIGHT = CHAPTER_STATUSES.reduce((acc, status) => {
  acc[status.id] = status.weight;
  return acc;
}, {});

const DAYS_PER_WEEK = 7;

export const CLASS_10_SUBJECTS = [
  {
    id: "science",
    name: "Science",
    note: "NCERT Science, rationalised",
    chapters: [
      "Chemical Reactions and Equations",
      "Acids, Bases and Salts",
      "Metals and Non-metals",
      "Carbon and its Compounds",
      "Life Processes",
      "Control and Coordination",
      "How do Organisms Reproduce?",
      "Heredity",
      "Light: Reflection and Refraction",
      "The Human Eye and the Colourful World",
      "Electricity",
      "Magnetic Effects of Electric Current",
      "Our Environment",
    ],
  },
  {
    id: "maths",
    name: "Mathematics",
    note: "Same chapters for Standard and Basic papers",
    chapters: [
      "Real Numbers",
      "Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations",
      "Arithmetic Progressions",
      "Triangles",
      "Coordinate Geometry",
      "Introduction to Trigonometry",
      "Some Applications of Trigonometry",
      "Circles",
      "Areas Related to Circles",
      "Surface Areas and Volumes",
      "Statistics",
      "Probability",
    ],
  },
  {
    id: "social-science",
    name: "Social Science",
    note: "History, Geography, Political Science and Economics",
    chapters: [
      "History: The Rise of Nationalism in Europe",
      "History: Nationalism in India",
      "History: The Making of a Global World",
      "History: The Age of Industrialisation",
      "History: Print Culture and the Modern World",
      "Geography: Resources and Development",
      "Geography: Forest and Wildlife Resources",
      "Geography: Water Resources",
      "Geography: Agriculture",
      "Geography: Minerals and Energy Resources",
      "Geography: Manufacturing Industries",
      "Geography: Lifelines of the National Economy",
      "Civics: Power Sharing",
      "Civics: Federalism",
      "Civics: Gender, Religion and Caste",
      "Civics: Political Parties",
      "Civics: Outcomes of Democracy",
      "Economics: Development",
      "Economics: Sectors of the Indian Economy",
      "Economics: Money and Credit",
      "Economics: Globalisation and the Indian Economy",
      "Economics: Consumer Rights",
    ],
  },
  {
    id: "english",
    name: "English (Language and Literature)",
    note: "First Flight and Footprints Without Feet",
    chapters: [
      "Reading: unseen discursive passage",
      "Reading: unseen case-based passage",
      "Grammar: tenses, modals, subject-verb concord",
      "Grammar: reported speech and determiners",
      "Writing: formal letter",
      "Writing: analytical paragraph",
      "First Flight: prose",
      "First Flight: poetry",
      "Footprints Without Feet: supplementary reader",
    ],
  },
  {
    id: "hindi",
    name: "Hindi (Course B)",
    note: "Sparsh and Sanchayan",
    chapters: [
      "Apathit gadyansh (unseen passages)",
      "Vyakaran: pad parichay and rachna ke aadhar par vakya bhed",
      "Vyakaran: samas, muhavare and arth ki drishti se vakya bhed",
      "Sparsh: gadya khand (prose)",
      "Sparsh: kavya khand (poetry)",
      "Sanchayan: supplementary reader",
      "Lekhan: anuchchhed, patra and suchna",
    ],
  },
  {
    id: "computer-applications",
    name: "Computer Applications (Code 165)",
    note: "Optional sixth subject",
    chapters: [
      "Networking basics and internet services",
      "HTML: document structure and text formatting",
      "HTML: lists, tables, links and images",
      "HTML: forms and embedding media",
      "Cyber ethics, safety and digital footprints",
      "Scratch or Python: programming fundamentals",
    ],
  },
];

export function subjectById(id) {
  return CLASS_10_SUBJECTS.find((subject) => subject.id === id) || null;
}

export function chapterKey(subjectId, index) {
  return `${subjectId}:${index}`;
}

function weightOf(statusId) {
  const weight = STATUS_WEIGHT[statusId];
  return typeof weight === "number" ? weight : 0;
}

/** Progress for a single subject. */
export function subjectProgress(subjectId, statusMap = {}) {
  const subject = subjectById(subjectId);
  if (!subject) return { error: "Unknown subject." };

  const total = subject.chapters.length;
  const counts = { "not-started": 0, reading: 0, revised: 0, mastered: 0 };
  let weighted = 0;

  subject.chapters.forEach((_, index) => {
    const status = statusMap[chapterKey(subjectId, index)] || DEFAULT_STATUS;
    if (counts[status] === undefined) counts[status] = 0;
    counts[status] += 1;
    weighted += weightOf(status);
  });

  const done = counts.mastered;

  return {
    id: subject.id,
    name: subject.name,
    note: subject.note,
    total,
    counts,
    done,
    remaining: total - done,
    percent: total > 0 ? (weighted / total) * 100 : 0,
    /** Share of the 80-mark theory paper this subject's finished chapters cover. */
    theoryMarksSecured: total > 0 ? (weighted / total) * THEORY_MARKS : 0,
  };
}

/** Combined progress across the selected subjects; every chapter counts equally. */
export function overallProgress(subjectIds = [], statusMap = {}) {
  if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
    return { error: "Select at least one subject to track." };
  }

  const subjects = subjectIds
    .map((id) => subjectProgress(id, statusMap))
    .filter((item) => !item.error);
  if (subjects.length === 0) return { error: "Select at least one subject to track." };

  const total = subjects.reduce((sum, item) => sum + item.total, 0);
  if (total === 0) return { error: "The selected subjects have no chapters to track." };

  const weighted = subjects.reduce((sum, item) => sum + (item.percent / 100) * item.total, 0);
  const mastered = subjects.reduce((sum, item) => sum + item.done, 0);
  const notStarted = subjects.reduce((sum, item) => sum + item.counts["not-started"], 0);

  return {
    subjects,
    totalChapters: total,
    masteredChapters: mastered,
    notStartedChapters: notStarted,
    remainingChapters: total - mastered,
    percent: (weighted / total) * 100,
    boardMarksInPlay: subjects.length * THEORY_MARKS,
  };
}

/**
 * Chapters per day and per week needed to finish what is left.
 * @returns {object} { perDay, perWeek, daysPerChapter, finished } or { error }
 */
export function requiredPace({ remainingChapters, daysLeft }) {
  const remaining = Number(remainingChapters);
  const days = Number(daysLeft);

  if (!Number.isFinite(remaining) || remaining < 0) {
    return { error: "Remaining chapters must be zero or more." };
  }
  if (!Number.isFinite(days)) return { error: "Enter how many days are left before the exam." };
  if (days <= 0) {
    return { error: "Enter at least one day left before the exam to work out a pace." };
  }
  if (remaining === 0) {
    return { perDay: 0, perWeek: 0, daysPerChapter: null, finished: true };
  }

  return {
    perDay: remaining / days,
    perWeek: (remaining / days) * DAYS_PER_WEEK,
    daysPerChapter: days / remaining,
    finished: false,
  };
}
