/**
 * Class-wise NCERT coverage map for UPSC-style preparation.
 *
 * The subject x class availability grid follows the standard NCERT reading
 * list circulated for UPSC preparation: History, Geography and Polity/Civics
 * run from class 6 to 12; Economics starts at class 9; general Science books
 * exist for classes 6-10 (streams split after that); Sociology exists only in
 * classes 11-12.
 *
 * Coverage convention (stated in the UI): Done = 1, In progress = 0.5,
 * Not started = 0; a percentage is the weighted sum over the available books
 * in that row/column/grid.
 */

export const CLASSES = [6, 7, 8, 9, 10, 11, 12];

/** Subjects with the classes in which a commonly-read NCERT book exists. */
export const SUBJECTS = [
  { id: "history", label: "History", classes: [6, 7, 8, 9, 10, 11, 12] },
  { id: "geography", label: "Geography", classes: [6, 7, 8, 9, 10, 11, 12] },
  { id: "polity", label: "Polity / Civics", classes: [6, 7, 8, 9, 10, 11, 12] },
  { id: "economics", label: "Economics", classes: [9, 10, 11, 12] },
  { id: "science", label: "Science", classes: [6, 7, 8, 9, 10] },
  { id: "sociology", label: "Sociology", classes: [11, 12] },
];

/** Cell statuses in cycling order, with their coverage weight. */
export const CELL_STATUSES = [
  { id: "not-started", label: "Not started", weight: 0 },
  { id: "in-progress", label: "In progress", weight: 0.5 },
  { id: "done", label: "Done", weight: 1 },
];

const WEIGHT_BY_STATUS = Object.fromEntries(CELL_STATUSES.map((s) => [s.id, s.weight]));
const STATUS_IDS = CELL_STATUSES.map((s) => s.id);

export function cellKey(subjectId, classNumber) {
  return `${subjectId}-${classNumber}`;
}

/** Advance a cell one step in the cycle, wrapping around. */
export function nextCellStatus(statusId) {
  const index = STATUS_IDS.indexOf(statusId);
  return STATUS_IDS[(index + 1) % STATUS_IDS.length];
}

/** Does a commonly-read NCERT exist for this subject-class cell? */
export function isAvailable(subjectId, classNumber) {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  return Boolean(subject && subject.classes.includes(classNumber));
}

/**
 * Compute coverage from a grid of cell statuses.
 * @param {object} input
 * @param {Record<string, string>} input.grid  Map of cellKey -> status id.
 *        Missing keys count as not-started. Keys for unavailable cells are ignored.
 * @returns {object} coverage breakdown or { error }
 */
export function computeCoverage({ grid }) {
  if (grid === null || typeof grid !== "object" || Array.isArray(grid)) {
    return { error: "Coverage data is malformed — reset the map." };
  }

  for (const [key, status] of Object.entries(grid)) {
    if (!(status in WEIGHT_BY_STATUS)) {
      return { error: `Unknown status "${status}" recorded for ${key} — reset the map.` };
    }
  }

  let totalBooks = 0;
  let totalWeight = 0;
  let doneCount = 0;
  let inProgressCount = 0;

  const bySubject = SUBJECTS.map((subject) => {
    let weight = 0;
    for (const classNumber of subject.classes) {
      const status = grid[cellKey(subject.id, classNumber)] ?? "not-started";
      const w = WEIGHT_BY_STATUS[status];
      weight += w;
      totalWeight += w;
      totalBooks += 1;
      if (status === "done") doneCount += 1;
      if (status === "in-progress") inProgressCount += 1;
    }
    return {
      id: subject.id,
      label: subject.label,
      books: subject.classes.length,
      percent: (weight / subject.classes.length) * 100,
    };
  });

  const byClass = CLASSES.map((classNumber) => {
    const available = SUBJECTS.filter((subject) => subject.classes.includes(classNumber));
    let weight = 0;
    for (const subject of available) {
      weight += WEIGHT_BY_STATUS[grid[cellKey(subject.id, classNumber)] ?? "not-started"];
    }
    return {
      classNumber,
      books: available.length,
      percent: available.length > 0 ? (weight / available.length) * 100 : 0,
    };
  });

  const weakestSubject = bySubject.reduce((weak, s) => (s.percent < weak.percent ? s : weak));
  const weakestClass = byClass.reduce((weak, c) => (c.percent < weak.percent ? c : weak));

  return {
    bySubject,
    byClass,
    totalBooks,
    doneCount,
    inProgressCount,
    notStartedCount: totalBooks - doneCount - inProgressCount,
    overallPercent: totalBooks > 0 ? (totalWeight / totalBooks) * 100 : 0,
    weakestSubject,
    weakestClass,
  };
}
