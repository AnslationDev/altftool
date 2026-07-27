/**
 * TOEFL iBT score converter.
 *
 * Rules per ETS (Educational Testing Service) score reporting:
 *  - Four sections (Reading, Listening, Speaking, Writing), each scaled 0–30.
 *  - The total score is the SUM of the four section scores, 0–120.
 *  - TOEFL-to-IELTS comparison uses the score linking table ETS published from
 *    its TOEFL/IELTS comparison study (ets.org "Compare TOEFL scores").
 *  - Section performance levels are the ETS proficiency levels used on score
 *    reports since the August 2019 revision.
 */

export const SECTION_MIN = 0;
export const SECTION_MAX = 30;
export const TOTAL_MAX = 120;

export const SECTIONS = ["reading", "listening", "speaking", "writing"];

/**
 * ETS TOEFL total-to-IELTS-band linking table (ets.org comparison tool).
 * Entries: [minimum total, IELTS band, label]; scanned top-down.
 */
export const TOEFL_TO_IELTS = [
  [118, 9, "9.0"],
  [115, 8.5, "8.5"],
  [110, 8, "8.0"],
  [102, 7.5, "7.5"],
  [94, 7, "7.0"],
  [79, 6.5, "6.5"],
  [60, 6, "6.0"],
  [46, 5.5, "5.5"],
  [35, 5, "5.0"],
  [32, 4.5, "4.5"],
  [0, 4, "4.0 or below"],
];

/**
 * ETS section performance levels (post-2019 score reports).
 * Entries: [minimum section score, level name]; scanned top-down.
 */
export const SECTION_LEVELS = {
  reading: [
    [24, "Advanced"],
    [18, "High-Intermediate"],
    [4, "Low-Intermediate"],
    [0, "Below Low-Intermediate"],
  ],
  listening: [
    [22, "Advanced"],
    [17, "High-Intermediate"],
    [9, "Low-Intermediate"],
    [0, "Below Low-Intermediate"],
  ],
  speaking: [
    [25, "Advanced"],
    [20, "High-Intermediate"],
    [16, "Low-Intermediate"],
    [10, "Basic"],
    [0, "Below Basic"],
  ],
  writing: [
    [24, "Advanced"],
    [17, "High-Intermediate"],
    [13, "Low-Intermediate"],
    [7, "Basic"],
    [0, "Below Basic"],
  ],
};

/** Map a TOEFL total (0–120) to the ETS-linked IELTS band. */
export function toeflTotalToIelts(total) {
  const n = Number(total);
  if (!Number.isInteger(n) || n < 0 || n > TOTAL_MAX) {
    return { error: `Total must be a whole number between 0 and ${TOTAL_MAX}.` };
  }
  for (const [minTotal, band, label] of TOEFL_TO_IELTS) {
    if (n >= minTotal) return { band, label };
  }
  // Unreachable: table bottoms out at 0.
  return { error: "Could not map the total score." };
}

/** ETS performance level for one section score. */
export function sectionLevel(section, score) {
  const levels = SECTION_LEVELS[section];
  if (!levels) return { error: "Unknown TOEFL section." };
  const n = Number(score);
  if (!Number.isInteger(n) || n < SECTION_MIN || n > SECTION_MAX) {
    return { error: `Score must be a whole number between ${SECTION_MIN} and ${SECTION_MAX}.` };
  }
  for (const [min, level] of levels) {
    if (n >= min) return { level };
  }
  return { error: "Could not map the section score." };
}

/**
 * Compute the TOEFL total, IELTS equivalent and section levels.
 * @returns {object} result or { error }.
 */
export function computeToefl({ reading, listening, speaking, writing }) {
  const values = { reading, listening, speaking, writing };
  const scores = {};
  const levels = {};

  for (const section of SECTIONS) {
    const n = Number(values[section]);
    if (!Number.isInteger(n) || n < SECTION_MIN || n > SECTION_MAX) {
      const name = section[0].toUpperCase() + section.slice(1);
      return {
        error: `${name} must be a whole number between ${SECTION_MIN} and ${SECTION_MAX}.`,
      };
    }
    scores[section] = n;
    levels[section] = sectionLevel(section, n).level;
  }

  const total = SECTIONS.reduce((sum, section) => sum + scores[section], 0);
  const ielts = toeflTotalToIelts(total);

  return {
    total,
    totalMax: TOTAL_MAX,
    ieltsBand: ielts.band,
    ieltsLabel: ielts.label,
    scores,
    levels,
  };
}
