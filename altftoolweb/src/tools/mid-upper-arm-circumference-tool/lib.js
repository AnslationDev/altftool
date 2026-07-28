/**
 * Mid-upper arm circumference (MUAC) band reader.
 *
 * MUAC is a screening measurement, not a diagnosis. The child cut-offs below are
 * the WHO/UNICEF thresholds for acute malnutrition in children aged 6-59 months
 * (WHO/UNICEF joint statement on the community-based management of severe acute
 * malnutrition, 2009, carried into the WHO 2013 guideline):
 *
 *   MUAC below 115 mm            severe acute malnutrition   (red)
 *   MUAC 115 mm to below 125 mm  moderate acute malnutrition (yellow)
 *   MUAC 125 mm and above        no acute malnutrition       (green)
 *
 * Many field programmes additionally watch the 125-134 mm strip as an early
 * warning zone; that is a programme convention, not a WHO classification, and
 * it is labelled as such below.
 *
 * The 230 mm figure for pregnant and lactating women is the screening threshold
 * used in Indian nutrition programmes. Cut-offs for women vary between
 * programmes (roughly 210-230 mm), so the local protocol always wins.
 */

export const MM_PER_CM = 10;

/** WHO child cut-offs, in millimetres. */
export const CHILD_SEVERE_MM = 115;
export const CHILD_MODERATE_MM = 125;
/** Upper edge of the early-warning strip used by some programmes. */
export const CHILD_WATCH_MM = 135;

/** Screening threshold used for pregnant and lactating women in India. */
export const WOMAN_THRESHOLD_MM = 230;
export const WOMAN_THRESHOLD_RANGE_MM = [210, 230];

/** MUAC screening is validated for children from 6 to 59 months. */
export const CHILD_MIN_AGE_MONTHS = 6;
export const CHILD_MAX_AGE_MONTHS = 59;

/** Plausible tape readings, used only to catch typing mistakes. */
export const MIN_MUAC_MM = 50;
export const MAX_MUAC_MM = 500;

export const SUBJECTS = [
  { id: "child", label: "Child aged 6-59 months" },
  { id: "woman", label: "Pregnant or lactating woman" },
];

export const CHILD_BANDS = [
  {
    id: "severe",
    colour: "Red",
    below: CHILD_SEVERE_MM,
    label: "Severe acute malnutrition",
    meaning: "A reading under 115 mm is the WHO cut-off for severe acute malnutrition in a child aged 6-59 months.",
    action:
      "Take the child to a health facility today. Severe acute malnutrition needs clinical assessment and a therapeutic feeding programme, and it can be life-threatening.",
    severity: "danger",
  },
  {
    id: "moderate",
    colour: "Yellow",
    below: CHILD_MODERATE_MM,
    label: "Moderate acute malnutrition",
    meaning: "115 mm up to but not including 125 mm is the WHO band for moderate acute malnutrition.",
    action:
      "Arrange a check at an anganwadi centre or health facility this week. Supplementary feeding and repeat measurement are the usual next steps.",
    severity: "warn",
  },
  {
    id: "watch",
    colour: "Green (lower end)",
    below: CHILD_WATCH_MM,
    label: "No acute malnutrition, worth watching",
    meaning:
      "125 mm and above is green under WHO cut-offs. Some field programmes still track the 125-134 mm strip as an early-warning zone.",
    action: "No referral is triggered by MUAC alone. Re-measure monthly and keep growth monitoring up to date.",
    severity: "ok",
  },
  {
    id: "normal",
    colour: "Green",
    below: Infinity,
    label: "No acute malnutrition",
    meaning: "135 mm and above sits comfortably inside the green band.",
    action: "Continue routine growth monitoring and immunisation visits.",
    severity: "ok",
  },
];

export const WOMAN_BANDS = [
  {
    id: "below",
    colour: "Below threshold",
    below: WOMAN_THRESHOLD_MM,
    label: "Below the screening threshold",
    meaning:
      "A reading under 230 mm is the threshold Indian nutrition programmes use to flag undernutrition in pregnant and lactating women.",
    action:
      "Raise it at the next antenatal or postnatal visit. Programmes vary, so the local protocol and a clinician's assessment decide what follows.",
    severity: "warn",
  },
  {
    id: "above",
    colour: "At or above threshold",
    below: Infinity,
    label: "At or above the screening threshold",
    meaning: "230 mm and above does not trigger the undernutrition flag used in these programmes.",
    action: "Continue routine antenatal or postnatal care and dietary counselling.",
    severity: "ok",
  },
];

const toFinite = (value) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(num) ? num : NaN;
};

/** Convert a reading in mm or cm to millimetres. */
export function toMillimetres(value, unit) {
  return unit === "cm" ? value * MM_PER_CM : value;
}

/** The band list that applies to a subject. */
export function bandsFor(subject) {
  return subject === "woman" ? WOMAN_BANDS : CHILD_BANDS;
}

/** First band whose upper edge the reading falls below. */
export function classify(mm, subject) {
  const bands = bandsFor(subject);
  return bands.find((band) => mm < band.below) ?? bands[bands.length - 1];
}

/**
 * Read a MUAC measurement against the screening bands.
 *
 * @param {object} input
 * @param {number|string} input.measurement tape reading
 * @param {"mm"|"cm"} input.unit unit of the reading
 * @param {"child"|"woman"} input.subject who was measured
 * @param {number|string} input.ageMonths child age in months (ignored for women)
 * @returns {object} band and guidance, or { error } when the input is unusable
 */
export function readMuac({ measurement, unit = "mm", subject = "child", ageMonths }) {
  const raw = toFinite(measurement);

  if (Number.isNaN(raw)) return { error: "Enter the tape reading as a number." };
  if (unit !== "mm" && unit !== "cm") return { error: "Choose a unit of mm or cm." };
  if (subject !== "child" && subject !== "woman") {
    return { error: "Choose whether the measurement is for a child or for a pregnant or lactating woman." };
  }

  const mm = toMillimetres(raw, unit);
  if (!(mm >= MIN_MUAC_MM) || mm > MAX_MUAC_MM) {
    return {
      error: `A MUAC reading of ${mm} mm is outside the plausible range of ${MIN_MUAC_MM}-${MAX_MUAC_MM} mm. Check the unit and the reading.`,
    };
  }

  let age = null;
  if (subject === "child") {
    age = toFinite(ageMonths);
    if (Number.isNaN(age)) return { error: "Enter the child's age in months." };
    if (age < CHILD_MIN_AGE_MONTHS || age > CHILD_MAX_AGE_MONTHS) {
      return {
        error:
          age < CHILD_MIN_AGE_MONTHS
            ? `These cut-offs apply from ${CHILD_MIN_AGE_MONTHS} months. Below that, infants are assessed on weight-for-length rather than MUAC.`
            : `These cut-offs apply up to ${CHILD_MAX_AGE_MONTHS} months. Older children need age-specific MUAC-for-age references instead.`,
      };
    }
  }

  const band = classify(mm, subject);
  const bands = bandsFor(subject);
  const index = bands.findIndex((item) => item.id === band.id);
  const nextBand = index >= 0 && index < bands.length - 1 ? bands[index + 1] : null;
  const mmToNextBand = nextBand ? band.below - mm : null;

  const thresholds =
    subject === "child"
      ? [
          { label: "Severe acute malnutrition", text: `under ${CHILD_SEVERE_MM} mm (${CHILD_SEVERE_MM / MM_PER_CM} cm)` },
          {
            label: "Moderate acute malnutrition",
            text: `${CHILD_SEVERE_MM} mm to under ${CHILD_MODERATE_MM} mm`,
          },
          { label: "No acute malnutrition", text: `${CHILD_MODERATE_MM} mm and above` },
        ]
      : [
          { label: "Flagged for follow-up", text: `under ${WOMAN_THRESHOLD_MM} mm (${WOMAN_THRESHOLD_MM / MM_PER_CM} cm)` },
          { label: "Not flagged", text: `${WOMAN_THRESHOLD_MM} mm and above` },
        ];

  const notes = [
    "Measure the left arm, at the midpoint between the tip of the shoulder and the tip of the elbow, with the arm hanging relaxed. Pull the tape snug but not tight enough to dent the skin.",
    "MUAC is a screening tool. It does not diagnose anything on its own and does not replace weight-for-height, oedema checks or a clinical examination.",
  ];
  if (subject === "woman") {
    notes.push(
      `Thresholds for women differ between programmes, commonly between ${WOMAN_THRESHOLD_RANGE_MM[0]} and ${WOMAN_THRESHOLD_RANGE_MM[1]} mm. Follow the local protocol.`,
    );
  }
  if (subject === "child" && band.id === "severe") {
    notes.push("Also check for bilateral pitting oedema of the feet: that alone indicates severe acute malnutrition whatever the MUAC reading.");
  }

  return {
    mm,
    cm: mm / MM_PER_CM,
    subject,
    ageMonths: age,
    bandId: band.id,
    bandLabel: band.label,
    bandColour: band.colour,
    bandMeaning: band.meaning,
    bandAction: band.action,
    severity: band.severity,
    nextBandLabel: nextBand ? nextBand.label : null,
    mmToNextBand,
    thresholds,
    notes,
  };
}
