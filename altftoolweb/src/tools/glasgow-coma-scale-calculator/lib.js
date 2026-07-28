/**
 * Glasgow Coma Scale (GCS)
 *
 * Component structure and point values follow Teasdale & Jennett (Lancet, 1974)
 * as standardised by the Glasgow Structured Approach to Assessment of the
 * Glasgow Coma Scale (2014): Eye opening 1-4, Verbal response 1-5,
 * Best motor response 1-6. The total is the sum of the three components.
 *
 * GCS-Pupils (GCS-P) subtracts a Pupil Reactivity Score (PRS) from the total,
 * per Brennan, Murray & Teasdale, J Neurosurg 2018;128:1612-1620.
 *
 * Paediatric wording for pre-verbal children follows the widely used
 * paediatric adaptation of the same 3/4/5/6-point component structure.
 *
 * This module is informational/educational only. It is not a clinical
 * decision tool and must not replace bedside assessment by a clinician.
 */

/** Lowest and highest possible totals: 1+1+1 and 4+5+6. */
export const GCS_MIN = 3;
export const GCS_MAX = 15;

/** GCS-P range: GCS 3 minus a pupil reactivity score of 2 gives 1. */
export const GCSP_MIN = 1;
export const GCSP_MAX = 15;

export const EYE_MIN = 1;
export const EYE_MAX = 4;
export const VERBAL_MIN = 1;
export const VERBAL_MAX = 5;
export const MOTOR_MIN = 1;
export const MOTOR_MAX = 6;

/** Eye opening — identical wording for adults and children. */
export const EYE_OPTIONS = [
  { value: 4, label: "Spontaneous", hint: "Eyes already open before you approach" },
  { value: 3, label: "To sound", hint: "Opens eyes when spoken to or shouted at" },
  { value: 2, label: "To pressure", hint: "Opens eyes only to a standard peripheral or trapezius stimulus" },
  { value: 1, label: "None", hint: "No eye opening to any stimulus" },
];

/** Verbal response — adult / verbal child. */
export const VERBAL_OPTIONS_ADULT = [
  { value: 5, label: "Orientated", hint: "Knows name, place and date" },
  { value: 4, label: "Confused", hint: "Talks in sentences but is disorientated" },
  { value: 3, label: "Words", hint: "Single intelligible words only" },
  { value: 2, label: "Sounds", hint: "Groans or moans, no recognisable words" },
  { value: 1, label: "None", hint: "No vocal response" },
];

/** Verbal response — pre-verbal infant / young child adaptation. */
export const VERBAL_OPTIONS_PAEDIATRIC = [
  { value: 5, label: "Babbles, coos, smiles", hint: "Age-appropriate interaction and vocalising" },
  { value: 4, label: "Irritable cry", hint: "Cries but is consolable" },
  { value: 3, label: "Cries to pressure", hint: "Cries only in response to a stimulus" },
  { value: 2, label: "Moans to pressure", hint: "Moans or grunts to a stimulus" },
  { value: 1, label: "None", hint: "No vocal response" },
];

/** Best motor response — adult / older child. */
export const MOTOR_OPTIONS_ADULT = [
  { value: 6, label: "Obeys commands", hint: "Performs a two-part request" },
  { value: 5, label: "Localising", hint: "Purposeful movement towards the stimulus" },
  { value: 4, label: "Normal flexion", hint: "Rapid withdrawal away from the stimulus" },
  { value: 3, label: "Abnormal flexion", hint: "Slow, stereotyped flexion of the arm across the chest" },
  { value: 2, label: "Extension", hint: "Arm straightens and rotates inward" },
  { value: 1, label: "None", hint: "No motor response" },
];

/** Best motor response — pre-verbal infant adaptation. */
export const MOTOR_OPTIONS_PAEDIATRIC = [
  { value: 6, label: "Spontaneous movement", hint: "Normal purposeful movement for age" },
  { value: 5, label: "Withdraws to touch", hint: "Pulls away when touched" },
  { value: 4, label: "Withdraws to pressure", hint: "Rapid withdrawal from a stimulus" },
  { value: 3, label: "Abnormal flexion", hint: "Slow, stereotyped flexion" },
  { value: 2, label: "Extension", hint: "Limbs straighten and rotate inward" },
  { value: 1, label: "None", hint: "No motor response" },
];

/** Pupil Reactivity Score: number of pupils NOT reacting to light (0, 1 or 2). */
export const PUPIL_OPTIONS = [
  { value: 0, label: "Both pupils react", hint: "Pupil reactivity score 0" },
  { value: 1, label: "One pupil unreactive", hint: "Pupil reactivity score 1" },
  { value: 2, label: "Neither pupil reacts", hint: "Pupil reactivity score 2" },
];

/**
 * Conventional severity bands for total GCS.
 * Severe 3-8, moderate 9-12, mild 13-15 (Teasdale/Jennett head-injury grading).
 */
export const SEVERITY_BANDS = [
  { min: 3, max: 8, label: "Severe", note: "Coma range. Airway protection is the immediate concern in a real patient." },
  { min: 9, max: 12, label: "Moderate", note: "Impaired consciousness with preserved responses to stimuli." },
  { min: 13, max: 15, label: "Mild", note: "Alert or only slightly impaired; 15 is a fully normal score." },
];

export function severityForTotal(total) {
  const band = SEVERITY_BANDS.find((b) => total >= b.min && total <= b.max);
  return band || null;
}

const isIntInRange = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max;

/**
 * Compute a total GCS, its notation and the GCS-Pupils score.
 *
 * @param {object} input
 * @param {number} input.eye                 Eye opening component, 1-4.
 * @param {number} input.verbal              Verbal component, 1-5. Ignored when verbalNotTestable is true.
 * @param {number} input.motor               Best motor component, 1-6.
 * @param {number} [input.pupilsUnreactive]  Pupil Reactivity Score, 0-2. Defaults to 0.
 * @param {boolean} [input.verbalNotTestable] True when the airway is intubated so no verbal score can be given.
 * @returns {object} Result object, or { error } when the input is not scoreable.
 */
export function computeGcs({
  eye,
  verbal,
  motor,
  pupilsUnreactive = 0,
  verbalNotTestable = false,
} = {}) {
  const e = Number(eye);
  const m = Number(motor);
  const prs = Number(pupilsUnreactive);

  if (!isIntInRange(e, EYE_MIN, EYE_MAX)) {
    return { error: "Eye opening must be a whole number from 1 to 4." };
  }
  if (!isIntInRange(m, MOTOR_MIN, MOTOR_MAX)) {
    return { error: "Best motor response must be a whole number from 1 to 6." };
  }
  if (!isIntInRange(prs, 0, 2)) {
    return { error: "Pupil reactivity score must be 0, 1 or 2 unreactive pupils." };
  }

  let v = null;
  if (!verbalNotTestable) {
    v = Number(verbal);
    if (!isIntInRange(v, VERBAL_MIN, VERBAL_MAX)) {
      return { error: "Verbal response must be a whole number from 1 to 5, or marked not testable." };
    }
  }

  const components = { eye: e, verbal: v, motor: m };
  const sum = e + m + (v === null ? 0 : v);

  if (verbalNotTestable) {
    // Convention: report the sum of the testable components with a "T" suffix.
    // No severity band is assigned because the scale is incomplete.
    return {
      components,
      verbalNotTestable: true,
      total: sum,
      totalLabel: `${sum}T`,
      totalMax: EYE_MAX + MOTOR_MAX,
      notation: `E${e} VNT M${m}`,
      pupilsUnreactive: prs,
      gcsP: null,
      gcsPLabel: "—",
      severity: null,
      severityNote:
        "Verbal response is not testable, so the score is reported as a sum of the eye and motor components with a T suffix. A severity band needs all three components.",
      isFullyNormal: false,
    };
  }

  const total = sum;
  const band = severityForTotal(total);
  const gcsP = Math.max(GCSP_MIN, total - prs);

  return {
    components,
    verbalNotTestable: false,
    total,
    totalLabel: String(total),
    totalMax: GCS_MAX,
    notation: `E${e} V${v} M${m}`,
    pupilsUnreactive: prs,
    gcsP,
    gcsPLabel: String(gcsP),
    severity: band ? band.label : null,
    severityNote: band ? band.note : "",
    isFullyNormal: total === GCS_MAX,
  };
}
