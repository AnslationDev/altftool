/**
 * qSOFA — quick Sequential (sepsis-related) Organ Failure Assessment.
 *
 * Defined in the Third International Consensus Definitions for Sepsis and
 * Septic Shock (Sepsis-3), Singer et al., JAMA 2016. Three bedside criteria,
 * one point each, applied to patients with suspected infection outside the ICU.
 * A total of 2 or more marks a patient at greater risk of a poor outcome; it is
 * a prompt to look harder, not a diagnosis of sepsis.
 */

/** Respiratory rate at or above this many breaths per minute scores 1 point. */
export const RESP_RATE_THRESHOLD = 22;
/** Systolic blood pressure at or below this many mmHg scores 1 point. */
export const SYSTOLIC_THRESHOLD_MMHG = 100;
/** Any Glasgow Coma Scale total below this counts as altered mentation. */
export const GCS_NORMAL = 15;
/** Total at or above which qSOFA is called positive. */
export const POSITIVE_SCORE = 2;

export const GCS_MIN = 3;
export const GCS_MAX = 15;

/** Plausible measurement windows; outside these it is a typo, not an observation. */
export const RESP_RATE_MIN = 1;
export const RESP_RATE_MAX = 80;
export const SYSTOLIC_MIN_MMHG = 30;
export const SYSTOLIC_MAX_MMHG = 300;

/**
 * Score bands. The Sepsis-3 derivation found that, among patients outside the
 * ICU with suspected infection, a qSOFA of 2 or more identified a group whose
 * in-hospital mortality was roughly three to fourteen times that of patients
 * scoring 0 or 1, and it is the cut-point used in the paper.
 */
export const SCORE_BANDS = [
  {
    max: 1,
    label: "qSOFA negative",
    tone: "success",
    note: "A score of 0 or 1 does not rule out sepsis. Sepsis-3 is explicit that qSOFA has limited sensitivity, and a deteriorating patient still needs escalation on clinical grounds.",
  },
  {
    max: 2,
    label: "qSOFA positive",
    tone: "warning",
    note: "Two of the three criteria are met. In the Sepsis-3 cohorts this identified patients with a markedly higher risk of prolonged ICU stay or in-hospital death, and it should trigger a full assessment for organ dysfunction.",
  },
  {
    max: 3,
    label: "qSOFA positive — all three criteria",
    tone: "danger",
    note: "All three criteria are met, the highest possible qSOFA. Urgent senior review and a full SOFA assessment are indicated.",
  },
];

const toNumber = (raw) => {
  if (typeof raw === "number") return raw;
  if (raw === null || raw === undefined) return NaN;
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  return Number(text);
};

export function bandForScore(score) {
  return SCORE_BANDS.find((band) => score <= band.max) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Score the three qSOFA criteria.
 *
 * @param {object} input
 * @param {number|string} input.respiratoryRate Breaths per minute.
 * @param {number|string} input.systolicBp Systolic blood pressure in mmHg.
 * @param {number|string} input.gcs Glasgow Coma Scale total, 3 to 15.
 * @returns {object} per-criterion detail and the total, or { error }
 */
export function calculateQsofa({ respiratoryRate, systolicBp, gcs }) {
  const rr = toNumber(respiratoryRate);
  const sbp = toNumber(systolicBp);
  const coma = toNumber(gcs);

  if (!Number.isFinite(rr) || !Number.isFinite(sbp) || !Number.isFinite(coma)) {
    return { error: "Enter a respiratory rate, a systolic blood pressure and a GCS total." };
  }
  if (rr < RESP_RATE_MIN || rr > RESP_RATE_MAX) {
    return { error: `Respiratory rate should be between ${RESP_RATE_MIN} and ${RESP_RATE_MAX} breaths per minute.` };
  }
  if (sbp < SYSTOLIC_MIN_MMHG || sbp > SYSTOLIC_MAX_MMHG) {
    return { error: `Systolic blood pressure should be between ${SYSTOLIC_MIN_MMHG} and ${SYSTOLIC_MAX_MMHG} mmHg.` };
  }
  if (!Number.isInteger(coma) || coma < GCS_MIN || coma > GCS_MAX) {
    return { error: `The Glasgow Coma Scale total is a whole number from ${GCS_MIN} to ${GCS_MAX}.` };
  }

  const criteria = [
    {
      id: "resp",
      label: `Respiratory rate ${RESP_RATE_THRESHOLD} breaths/min or more`,
      value: `${rr} breaths/min`,
      met: rr >= RESP_RATE_THRESHOLD,
    },
    {
      id: "sbp",
      label: `Systolic blood pressure ${SYSTOLIC_THRESHOLD_MMHG} mmHg or less`,
      value: `${sbp} mmHg`,
      met: sbp <= SYSTOLIC_THRESHOLD_MMHG,
    },
    {
      id: "mentation",
      label: `Altered mentation (GCS below ${GCS_NORMAL})`,
      value: `GCS ${coma}`,
      met: coma < GCS_NORMAL,
    },
  ];

  const score = criteria.reduce((total, item) => total + (item.met ? 1 : 0), 0);
  const band = bandForScore(score);

  return {
    respiratoryRate: rr,
    systolicBp: sbp,
    gcs: coma,
    criteria,
    score,
    maxScore: criteria.length,
    positive: score >= POSITIVE_SCORE,
    band: { label: band.label, tone: band.tone, note: band.note },
  };
}
