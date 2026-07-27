/**
 * Diagram practice tracking for exams.
 *
 * The mastery model follows the standard retrieval-practice principle
 * (free recall under exam-like time pressure beats re-reading): a diagram
 * only counts as exam-ready when it was reproduced from memory within the
 * time you would actually have in the exam.
 */

/** How the last attempt at a diagram went. */
export const ATTEMPT_STATUSES = [
  { id: "none", label: "Not attempted yet" },
  { id: "with-reference", label: "Drew it, but needed notes/reference" },
  { id: "memory", label: "Drew it fully from memory" },
];

/**
 * Mastery levels derived from the last attempt.
 * mastered  — from memory AND within the target time (exam-ready).
 * close     — from memory but over the target time (speed practice needed).
 * learning  — still needs the reference open (content practice needed).
 * unpractised — never attempted.
 */
export const MASTERY_LEVELS = {
  mastered: { id: "mastered", label: "Exam-ready", order: 3 },
  close: { id: "close", label: "Close — too slow", order: 2 },
  learning: { id: "learning", label: "Learning", order: 1 },
  unpractised: { id: "unpractised", label: "Not practised", order: 0 },
};

/**
 * Readiness weights (this tool's convention): a from-memory-but-slow diagram
 * is worth 70% of a mastered one, a reference-assisted attempt 40%, and an
 * unattempted diagram 0%.
 */
export const READINESS_WEIGHTS = {
  mastered: 1,
  close: 0.7,
  learning: 0.4,
  unpractised: 0,
};

/** Practical ceiling for a single diagram's time budget, in minutes. */
export const MAX_TARGET_MINUTES = 180;

/** Classify one diagram from its last attempt. Exported for direct testing. */
export function classifyDiagram({ status, targetMinutes, lastMinutes }) {
  if (status === "none") return MASTERY_LEVELS.unpractised.id;
  if (status === "with-reference") return MASTERY_LEVELS.learning.id;
  // status === "memory"
  if (Number.isFinite(lastMinutes) && lastMinutes > targetMinutes) {
    return MASTERY_LEVELS.close.id;
  }
  return MASTERY_LEVELS.mastered.id;
}

/**
 * Compute mastery stats over a list of diagrams.
 *
 * @param {object} input
 * @param {Array<{name: string, targetMinutes: number, status: string, lastMinutes?: number}>} input.diagrams
 * @returns {object} stats or { error }
 */
export function computeDiagramStats({ diagrams }) {
  if (!Array.isArray(diagrams) || diagrams.length === 0) {
    return { error: "Add at least one diagram to track." };
  }

  const rows = [];
  for (let index = 0; index < diagrams.length; index += 1) {
    const diagram = diagrams[index];
    const name =
      typeof diagram.name === "string" && diagram.name.trim() !== ""
        ? diagram.name.trim()
        : `Diagram ${index + 1}`;
    const target = Number(diagram.targetMinutes);
    if (!Number.isFinite(target) || target <= 0) {
      return { error: `Target time for "${name}" must be greater than zero minutes.` };
    }
    if (target > MAX_TARGET_MINUTES) {
      return { error: `Target time for "${name}" is unrealistically long — use minutes, not seconds.` };
    }
    const statusIds = ATTEMPT_STATUSES.map((option) => option.id);
    const status = statusIds.includes(diagram.status) ? diagram.status : "none";
    let lastMinutes = null;
    if (status !== "none" && diagram.lastMinutes !== undefined && diagram.lastMinutes !== "") {
      lastMinutes = Number(diagram.lastMinutes);
      if (!Number.isFinite(lastMinutes) || lastMinutes <= 0) {
        return { error: `Time taken for "${name}" must be greater than zero minutes.` };
      }
    }
    if (status === "memory" && lastMinutes === null) {
      return { error: `Enter how long "${name}" took so speed can be checked against the target.` };
    }

    const level = classifyDiagram({ status, targetMinutes: target, lastMinutes });
    rows.push({
      name,
      targetMinutes: target,
      status,
      lastMinutes,
      level,
      levelLabel: MASTERY_LEVELS[level].label,
      overByMinutes:
        level === MASTERY_LEVELS.close.id && lastMinutes !== null
          ? lastMinutes - target
          : 0,
    });
  }

  const counts = {
    mastered: rows.filter((row) => row.level === "mastered").length,
    close: rows.filter((row) => row.level === "close").length,
    learning: rows.filter((row) => row.level === "learning").length,
    unpractised: rows.filter((row) => row.level === "unpractised").length,
  };

  const readinessSum = rows.reduce((sum, row) => sum + READINESS_WEIGHTS[row.level], 0);
  const readinessPercent = (readinessSum / rows.length) * 100;

  // Practise weakest first: unpractised, then learning, then close (slow).
  const practiceQueue = rows
    .filter((row) => row.level !== "mastered")
    .sort((a, b) => MASTERY_LEVELS[a.level].order - MASTERY_LEVELS[b.level].order)
    .map((row) => ({ name: row.name, levelLabel: row.levelLabel, level: row.level }));

  return {
    rows,
    counts,
    total: rows.length,
    masteredPercent: (counts.mastered / rows.length) * 100,
    readinessPercent,
    practiceQueue,
  };
}
