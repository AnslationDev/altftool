/**
 * CBSE Class 12 syllabus tracker.
 *
 * Chapter lists follow the current rationalised NCERT textbooks used by CBSE
 * (the trimmed syllabus in force from the 2023-24 session onwards), and the
 * marks split for each subject is the theory / practical or theory / internal
 * assessment distribution printed in the CBSE senior secondary curriculum
 * document. Boards issue a fresh curriculum circular every session, so treat
 * the lists as a starting point and check your school's copy.
 *
 * The module is pure arithmetic over a status map: no dates, no DOM, no React.
 */

/**
 * How far along a chapter is. The weights are a display convention used to
 * turn four qualitative states into one completion percentage — they are not
 * a CBSE grading scale. A chapter only counts fully once it has been revised
 * and its previous-year questions solved.
 */
export const CHAPTER_STATUSES = [
  { id: "not-started", label: "Not started", weight: 0 },
  { id: "reading", label: "First reading done", weight: 0.5 },
  { id: "revised", label: "Revised", weight: 0.8 },
  { id: "mastered", label: "Revised + PYQs solved", weight: 1 },
];

export const DEFAULT_STATUS = "not-started";

const STATUS_WEIGHT = CHAPTER_STATUSES.reduce((acc, status) => {
  acc[status.id] = status.weight;
  return acc;
}, {});

const DAYS_PER_WEEK = 7;

/**
 * Class 12 subjects with their chapter lists and the CBSE marks split.
 * `theory` + `practical` always add up to 100 for the subject.
 */
export const CLASS_12_SUBJECTS = [
  {
    id: "physics",
    name: "Physics",
    stream: "Science",
    theory: 70,
    practical: 30,
    practicalLabel: "Practical",
    chapters: [
      "Electric Charges and Fields",
      "Electrostatic Potential and Capacitance",
      "Current Electricity",
      "Moving Charges and Magnetism",
      "Magnetism and Matter",
      "Electromagnetic Induction",
      "Alternating Current",
      "Electromagnetic Waves",
      "Ray Optics and Optical Instruments",
      "Wave Optics",
      "Dual Nature of Radiation and Matter",
      "Atoms",
      "Nuclei",
      "Semiconductor Electronics: Materials, Devices and Simple Circuits",
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    stream: "Science",
    theory: 70,
    practical: 30,
    practicalLabel: "Practical",
    chapters: [
      "Solutions",
      "Electrochemistry",
      "Chemical Kinetics",
      "The d- and f-Block Elements",
      "Coordination Compounds",
      "Haloalkanes and Haloarenes",
      "Alcohols, Phenols and Ethers",
      "Aldehydes, Ketones and Carboxylic Acids",
      "Amines",
      "Biomolecules",
    ],
  },
  {
    id: "maths",
    name: "Mathematics",
    stream: "Science / Commerce",
    theory: 80,
    practical: 20,
    practicalLabel: "Internal assessment",
    chapters: [
      "Relations and Functions",
      "Inverse Trigonometric Functions",
      "Matrices",
      "Determinants",
      "Continuity and Differentiability",
      "Application of Derivatives",
      "Integrals",
      "Application of Integrals",
      "Differential Equations",
      "Vector Algebra",
      "Three Dimensional Geometry",
      "Linear Programming",
      "Probability",
    ],
  },
  {
    id: "biology",
    name: "Biology",
    stream: "Science",
    theory: 70,
    practical: 30,
    practicalLabel: "Practical",
    chapters: [
      "Sexual Reproduction in Flowering Plants",
      "Human Reproduction",
      "Reproductive Health",
      "Principles of Inheritance and Variation",
      "Molecular Basis of Inheritance",
      "Evolution",
      "Human Health and Disease",
      "Microbes in Human Welfare",
      "Biotechnology: Principles and Processes",
      "Biotechnology and its Applications",
      "Organisms and Populations",
      "Ecosystem",
      "Biodiversity and Conservation",
    ],
  },
  {
    id: "english",
    name: "English Core",
    stream: "All streams",
    theory: 80,
    practical: 20,
    practicalLabel: "Internal assessment",
    chapters: [
      "Reading comprehension: unseen passages",
      "Reading: case-based factual passage",
      "Notice writing",
      "Formal and informal invitation",
      "Letter to the editor / job application",
      "Article and report writing",
      "Flamingo: prose",
      "Flamingo: poetry",
      "Vistas: supplementary reader",
    ],
  },
  {
    id: "accountancy",
    name: "Accountancy",
    stream: "Commerce",
    theory: 80,
    practical: 20,
    practicalLabel: "Project work",
    chapters: [
      "Accounting for Partnership Firms: fundamentals",
      "Goodwill: nature and valuation",
      "Change in profit-sharing ratio among existing partners",
      "Admission of a partner",
      "Retirement and death of a partner",
      "Dissolution of a partnership firm",
      "Accounting for Share Capital",
      "Issue and Redemption of Debentures",
      "Financial Statements of a Company",
      "Analysis of Financial Statements",
      "Accounting Ratios",
      "Cash Flow Statement",
    ],
  },
  {
    id: "business-studies",
    name: "Business Studies",
    stream: "Commerce",
    theory: 80,
    practical: 20,
    practicalLabel: "Project work",
    chapters: [
      "Nature and Significance of Management",
      "Principles of Management",
      "Business Environment",
      "Planning",
      "Organising",
      "Staffing",
      "Directing",
      "Controlling",
      "Financial Management",
      "Financial Markets",
      "Marketing Management",
      "Consumer Protection",
    ],
  },
  {
    id: "economics",
    name: "Economics",
    stream: "Commerce / Humanities",
    theory: 80,
    practical: 20,
    practicalLabel: "Project work",
    chapters: [
      "Introduction to Macroeconomics",
      "National Income and Related Aggregates",
      "Money and Banking",
      "Determination of Income and Employment",
      "Government Budget and the Economy",
      "Balance of Payments",
      "Development Experience (1947-90) and Economic Reforms since 1991",
      "Current Challenges Facing the Indian Economy",
      "Development Experience of India: a comparison with neighbours",
    ],
  },
  {
    id: "computer-science",
    name: "Computer Science (Python)",
    stream: "Science / Commerce",
    theory: 70,
    practical: 30,
    practicalLabel: "Practical",
    chapters: [
      "Revision of Python basics",
      "Functions: scope, arguments, return values",
      "Exception handling",
      "File handling: text, binary and CSV files",
      "Data structures: stack",
      "Computer networks",
      "Database concepts and SQL",
      "Interface Python with MySQL",
    ],
  },
];

export function subjectById(id) {
  return CLASS_12_SUBJECTS.find((subject) => subject.id === id) || null;
}

/** Stable key for one chapter's status inside the status map. */
export function chapterKey(subjectId, index) {
  return `${subjectId}:${index}`;
}

function weightOf(statusId) {
  const weight = STATUS_WEIGHT[statusId];
  return typeof weight === "number" ? weight : 0;
}

/**
 * Progress for one subject.
 *
 * @param {string} subjectId
 * @param {object} statusMap  { "physics:0": "revised", ... }
 * @returns {object} counts and percentages, or { error }
 */
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

  const started = total - counts["not-started"];
  const done = counts.mastered;

  return {
    id: subject.id,
    name: subject.name,
    total,
    counts,
    started,
    done,
    remaining: total - done,
    // Guarded: a subject always has at least one chapter, but never divide blind.
    percent: total > 0 ? (weighted / total) * 100 : 0,
    masteredPercent: total > 0 ? (done / total) * 100 : 0,
    theory: subject.theory,
    practical: subject.practical,
    practicalLabel: subject.practicalLabel,
  };
}

/**
 * Combined progress across the subjects a student has selected. Every chapter
 * counts the same, so a 14-chapter subject carries more weight than an
 * 8-chapter one.
 */
export function overallProgress(subjectIds = [], statusMap = {}) {
  if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
    return { error: "Select at least one subject to track." };
  }

  const subjects = subjectIds.map((id) => subjectProgress(id, statusMap)).filter((item) => !item.error);
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
    masteredPercent: (mastered / total) * 100,
  };
}

/**
 * How fast you now have to move to finish the chapters that are left.
 *
 * @param {object} input { remainingChapters, daysLeft }
 * @returns {object} { perDay, perWeek, daysPerChapter } or { error }
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
