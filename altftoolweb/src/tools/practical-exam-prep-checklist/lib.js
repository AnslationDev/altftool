/**
 * Practical (lab) exam preparation checklist.
 *
 * The sections mirror how Indian school and university practical exams are
 * actually assessed: the completed and signed record/journal, the experiments
 * themselves, the viva voce, and exam-day logistics. Items are drawn from the
 * standard expectations of board (CBSE/state) and university lab examinations —
 * a certified record notebook, teacher/HOD signatures, knowledge of aim,
 * procedure, observations and sources of error, and the admit-card/ID
 * essentials on the day.
 *
 * The maths is plain completion arithmetic: per-section and overall percentage
 * of items ticked, mapped to a readiness band. All functions are pure — the UI
 * owns which ids are checked.
 */

/** Readiness bands over the overall completion percentage. */
export const BAND_READY_MIN = 90; // everything but stragglers done
export const BAND_NEARLY_MIN = 70;
export const BAND_PROGRESS_MIN = 40;

export const CHECKLIST_SECTIONS = [
  {
    id: "records",
    title: "Record / journal",
    items: [
      { id: "rec-complete", label: "All experiments written up in the record/journal, none pending" },
      { id: "rec-signed", label: "Every experiment signed by the subject teacher" },
      { id: "rec-certified", label: "Certificate page filled and countersigned (teacher/HOD) with date" },
      { id: "rec-index", label: "Index page complete with page numbers matching the experiments" },
      { id: "rec-graphs", label: "Graphs, circuit diagrams and tables drawn in pencil and labelled" },
      { id: "rec-spare", label: "Observation notebook / rough record carried separately if allowed" },
    ],
  },
  {
    id: "experiments",
    title: "Experiments & apparatus",
    items: [
      { id: "exp-list", label: "Full list of syllabus experiments known, with likely alternatives" },
      { id: "exp-procedure", label: "Aim, apparatus, principle and procedure revised for every experiment" },
      { id: "exp-formula", label: "Formulas, units and expected ranges of results memorised" },
      { id: "exp-handling", label: "Practised handling the apparatus/instruments at least once recently" },
      { id: "exp-readings", label: "Know how to record observations and compute the result with units" },
      { id: "exp-errors", label: "Sources of error and precautions ready for each experiment" },
    ],
  },
  {
    id: "viva",
    title: "Viva voce",
    items: [
      { id: "viva-theory", label: "Theory behind each experiment revised (principle, law, definitions)" },
      { id: "viva-questions", label: "Common viva questions for this subject practised aloud" },
      { id: "viva-project", label: "Project/investigatory work (if any) revised and defensible" },
      { id: "viva-honest", label: "Prepared to say 'I don't know' cleanly instead of bluffing" },
    ],
  },
  {
    id: "exam-day",
    title: "Exam day",
    items: [
      { id: "day-admit", label: "Admit card / hall ticket and college ID kept ready" },
      { id: "day-record", label: "Completed record/journal packed the night before" },
      { id: "day-kit", label: "Pens, pencil, eraser, scale, calculator (if allowed) packed" },
      { id: "day-dress", label: "Lab coat / required dress code ready" },
      { id: "day-time", label: "Reporting time and lab/venue confirmed" },
    ],
  },
];

/** Every valid item id, precomputed for validation. */
export const ALL_ITEM_IDS = CHECKLIST_SECTIONS.flatMap((section) =>
  section.items.map((item) => item.id),
);

/**
 * Compute per-section and overall readiness from the set of checked item ids.
 *
 * @param {object} input
 * @param {string[]} input.checkedIds  Ids of ticked items (unknown ids are ignored).
 * @returns {object} progress summary, or { error } for invalid input.
 */
export function computeProgress({ checkedIds }) {
  if (!Array.isArray(checkedIds)) {
    return { error: "Checked items must be a list of item ids." };
  }

  const checked = new Set(checkedIds.filter((id) => ALL_ITEM_IDS.includes(id)));

  const sections = CHECKLIST_SECTIONS.map((section) => {
    const total = section.items.length;
    const done = section.items.filter((item) => checked.has(item.id)).length;
    return {
      id: section.id,
      title: section.title,
      done,
      total,
      percent: Math.round((done / total) * 100),
    };
  });

  const totalItems = ALL_ITEM_IDS.length;
  const totalDone = checked.size;
  const percent = Math.round((totalDone / totalItems) * 100);

  let band;
  let verdict;
  if (percent >= BAND_READY_MIN) {
    band = "ready";
    verdict = "Exam-ready — only stragglers left, if any.";
  } else if (percent >= BAND_NEARLY_MIN) {
    band = "nearly";
    verdict = "Nearly there — close out the unticked items below.";
  } else if (percent >= BAND_PROGRESS_MIN) {
    band = "in-progress";
    verdict = "In progress — records and viva sections usually need the most lead time.";
  } else {
    band = "starting";
    verdict = "Just starting — begin with the record/journal section; signatures take the longest.";
  }

  /** The section with the lowest completion — where to focus next. */
  const weakest = sections.reduce((low, section) =>
    section.percent < low.percent ? section : low,
  );

  return {
    sections,
    totalDone,
    totalItems,
    percent,
    band,
    verdict,
    weakestSection: weakest.percent < 100 ? weakest.title : null,
  };
}
