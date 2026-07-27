/**
 * Photocopy set planning for admissions / recruitment paperwork.
 *
 * There is no statute fixing how many photocopy sets a process needs — each
 * stage's requirement comes from the notification or prospectus, so the user
 * supplies sets-per-application per stage. What this module encodes:
 *  - Arithmetic: total sets = sum(stage sets x applications in that stage)
 *    + spare sets; pages = sets x pages-per-set; cost = pages x per-page rate.
 *  - The common-practice default of keeping 2 spare sets, which admission
 *    checklists published by Indian universities and counselling bodies
 *    routinely advise ("carry extra sets of all documents").
 *  - Attested-set counting: stages flagged as needing attested (self-attested
 *    or gazetted-attested) copies are totalled separately, since those sets
 *    need signatures/stamps before the day.
 */

/** Common checklist advice: keep a couple of spare sets beyond stated needs. */
export const RECOMMENDED_SPARE_SETS = 2;

/** Typical stages, editable by the user. setsPerApplication are typical
 *  prospectus asks, not fixed rules — the user adjusts to their notification. */
export const STAGE_PRESETS = [
  { name: "Application / form submission", setsPerApplication: 1, applications: 1, attested: true },
  { name: "Document verification day", setsPerApplication: 2, applications: 1, attested: true },
  { name: "Counselling / seat allotment", setsPerApplication: 2, applications: 1, attested: true },
  { name: "Admission / joining day", setsPerApplication: 1, applications: 1, attested: false },
];

export const MAX_STAGES = 10;
export const MAX_SETS_PER_APPLICATION = 10;
export const MAX_APPLICATIONS = 50;
export const MAX_PAGES_PER_SET = 100;
export const MAX_PER_PAGE_COST = 50; // rupees — sanity cap

/**
 * Compute total sets, pages and cost.
 *
 * @param {object} input
 * @param {{name:string, setsPerApplication:number, applications:number,
 *          attested:boolean}[]} input.stages
 * @param {number} input.pagesPerSet   Pages in one complete document set.
 * @param {number} [input.spareSets]   Extra sets kept aside (default 2).
 * @param {number} [input.perPageCost] Photocopy cost per page, INR (0 allowed).
 * @returns {{stageBreakdown, requiredSets, spareSets, totalSets, attestedSets,
 *            totalPages, totalCost}|{error:string}}
 */
export function planPhotocopySets({ stages, pagesPerSet, spareSets = RECOMMENDED_SPARE_SETS, perPageCost = 0 }) {
  if (!Array.isArray(stages)) return { error: "Stages must be a list." };
  const cleaned = stages
    .map((stage) => ({
      name: String(stage?.name ?? "").trim(),
      setsPerApplication: Number(stage?.setsPerApplication),
      applications: Number(stage?.applications),
      attested: Boolean(stage?.attested),
    }))
    .filter((stage) => stage.name !== "");
  if (cleaned.length === 0) return { error: "Add at least one stage with a name." };
  if (cleaned.length > MAX_STAGES) return { error: `Keep it to ${MAX_STAGES} stages or fewer.` };

  for (const stage of cleaned) {
    if (
      !Number.isFinite(stage.setsPerApplication) ||
      !Number.isInteger(stage.setsPerApplication) ||
      stage.setsPerApplication < 0 ||
      stage.setsPerApplication > MAX_SETS_PER_APPLICATION
    ) {
      return { error: `Sets per application for "${stage.name}" must be a whole number from 0 to ${MAX_SETS_PER_APPLICATION}.` };
    }
    if (
      !Number.isFinite(stage.applications) ||
      !Number.isInteger(stage.applications) ||
      stage.applications < 1 ||
      stage.applications > MAX_APPLICATIONS
    ) {
      return { error: `Applications for "${stage.name}" must be a whole number from 1 to ${MAX_APPLICATIONS}.` };
    }
  }

  const pages = Number(pagesPerSet);
  if (!Number.isFinite(pages) || !Number.isInteger(pages) || pages < 1 || pages > MAX_PAGES_PER_SET) {
    return { error: `Pages per set must be a whole number from 1 to ${MAX_PAGES_PER_SET}.` };
  }

  const spare = Number(spareSets);
  if (!Number.isFinite(spare) || !Number.isInteger(spare) || spare < 0 || spare > 20) {
    return { error: "Spare sets must be a whole number from 0 to 20." };
  }

  const rate = Number(perPageCost);
  if (!Number.isFinite(rate) || rate < 0 || rate > MAX_PER_PAGE_COST) {
    return { error: `Cost per page must be between 0 and ${MAX_PER_PAGE_COST} rupees.` };
  }

  const stageBreakdown = cleaned.map((stage) => {
    const sets = stage.setsPerApplication * stage.applications;
    return {
      ...stage,
      sets,
      pages: sets * pages,
    };
  });

  const requiredSets = stageBreakdown.reduce((sum, stage) => sum + stage.sets, 0);
  const attestedSets = stageBreakdown
    .filter((stage) => stage.attested)
    .reduce((sum, stage) => sum + stage.sets, 0);
  const totalSets = requiredSets + spare;
  const totalPages = totalSets * pages;

  return {
    stageBreakdown,
    requiredSets,
    spareSets: spare,
    totalSets,
    attestedSets,
    totalPages,
    // Round to the paisa; photocopy rates are usually whole rupees anyway.
    totalCost: Math.round(totalPages * rate * 100) / 100,
    pagesPerSet: pages,
  };
}
