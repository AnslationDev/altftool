/**
 * Weighted-sum model (WSM) vendor comparison — the standard additive method of
 * multi-criteria decision analysis (MCDA). Each vendor's overall score is
 * sum(weight_i × score_i) / sum(weight_i), then normalised to a 0–100 scale.
 * This is the same weighted scoring approach recommended in common procurement
 * guidance (e.g. RFP weighted evaluation matrices) — no proprietary formula.
 */

/** Scores are entered on a 1–5 Likert-style scale (1 = poor, 5 = excellent). */
export const SCORE_MIN = 1;
export const SCORE_MAX = 5;

/** Weights are percentages; any positive numbers work because the model normalises by their sum. */
export const WEIGHT_MIN = 0;
export const WEIGHT_MAX = 100;

/**
 * Default evaluation criteria for AI vendors. The four axes come straight from
 * the tool's brief (cost, control, support, compliance); the default equal
 * weights (25 each) are a neutral starting point the user is expected to tune.
 */
export const DEFAULT_CRITERIA = [
  {
    id: "cost",
    label: "Cost",
    hint: "Unit pricing, volume discounts, egress and hidden fees",
    weight: 25,
  },
  {
    id: "control",
    label: "Control",
    hint: "Data residency, model choice, fine-tuning, lock-in and exit terms",
    weight: 25,
  },
  {
    id: "support",
    label: "Support",
    hint: "SLA, response times, dedicated engineering help, docs quality",
    weight: 25,
  },
  {
    id: "compliance",
    label: "Compliance",
    hint: "SOC 2 / ISO 27001, GDPR terms (DPA), audit logs, retention controls",
    weight: 25,
  },
];

/** Score bands used to summarise a vendor's normalised 0–100 result. */
export const SCORE_BANDS = [
  { min: 80, label: "Strong fit" },
  { min: 60, label: "Good fit" },
  { min: 40, label: "Mixed" },
  { min: 0, label: "Weak fit" },
];

/** Map a 0–100 normalised score to its plain-language band label. */
export function bandForScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n) || n < 0) return SCORE_BANDS[SCORE_BANDS.length - 1].label;
  const band = SCORE_BANDS.find((b) => n >= b.min);
  return band ? band.label : SCORE_BANDS[SCORE_BANDS.length - 1].label;
}

/**
 * Compute the weighted comparison matrix.
 *
 * @param {object} input
 * @param {Array<{id:string,label:string,weight:number}>} input.criteria
 * @param {Array<{name:string,scores:Object<string,number>}>} input.vendors
 * @returns {object} { totalWeight, results: [{name, weightedAverage, normalizedScore, band,
 *                    perCriterion: [{id,label,weight,score,contribution}]}], ranking, bestName }
 *                   or { error } for invalid input.
 */
export function computeVendorMatrix({ criteria, vendors }) {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return { error: "Add at least one evaluation criterion." };
  }
  if (!Array.isArray(vendors) || vendors.length === 0) {
    return { error: "Add at least one vendor to score." };
  }

  const cleanCriteria = [];
  for (const c of criteria) {
    const weight = Number(c.weight);
    if (!Number.isFinite(weight) || weight < WEIGHT_MIN || weight > WEIGHT_MAX) {
      return {
        error: `Weight for "${c.label || c.id}" must be a number between ${WEIGHT_MIN} and ${WEIGHT_MAX}.`,
      };
    }
    cleanCriteria.push({ id: c.id, label: c.label || c.id, weight });
  }

  const totalWeight = cleanCriteria.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight <= 0) {
    return { error: "Total weight is zero — give at least one criterion a positive weight." };
  }

  const results = [];
  for (const vendor of vendors) {
    const name = typeof vendor.name === "string" && vendor.name.trim() !== "" ? vendor.name.trim() : null;
    if (!name) return { error: "Every vendor needs a name." };

    let weightedSum = 0;
    const perCriterion = [];
    for (const c of cleanCriteria) {
      const raw = vendor.scores ? vendor.scores[c.id] : undefined;
      const score = Number(raw);
      if (!Number.isFinite(score) || score < SCORE_MIN || score > SCORE_MAX) {
        return {
          error: `Score for ${name} on "${c.label}" must be between ${SCORE_MIN} and ${SCORE_MAX}.`,
        };
      }
      const contribution = c.weight * score;
      weightedSum += contribution;
      perCriterion.push({
        id: c.id,
        label: c.label,
        weight: c.weight,
        score,
        // Share of this criterion in the vendor's final 0–100 score.
        contribution: (contribution / totalWeight / SCORE_MAX) * 100,
      });
    }

    const weightedAverage = weightedSum / totalWeight; // still on the 1–5 scale
    const normalizedScore = (weightedAverage / SCORE_MAX) * 100; // 0–100 scale
    results.push({
      name,
      weightedAverage,
      normalizedScore,
      band: bandForScore(normalizedScore),
      perCriterion,
    });
  }

  const ranking = [...results].sort((a, b) => b.normalizedScore - a.normalizedScore);
  ranking.forEach((r, i) => {
    // Standard competition ranking: equal scores share a rank.
    r.rank = i > 0 && ranking[i - 1].normalizedScore === r.normalizedScore ? ranking[i - 1].rank : i + 1;
  });

  const top = ranking[0];
  const runnerUp = ranking.find((r) => r.normalizedScore < top.normalizedScore);
  const margin = runnerUp ? top.normalizedScore - runnerUp.normalizedScore : 0;
  const isTie = ranking.length > 1 && ranking[1].normalizedScore === top.normalizedScore;

  return {
    totalWeight,
    results,
    ranking,
    bestName: top.name,
    bestScore: top.normalizedScore,
    isTie,
    marginOverRunnerUp: margin,
  };
}
