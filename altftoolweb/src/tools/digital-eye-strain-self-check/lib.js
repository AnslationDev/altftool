/**
 * Digital Eye Strain Self-Check — logic only. No React, no DOM.
 *
 * Scoring follows the published Computer Vision Syndrome Questionnaire (CVS-Q,
 * Segui et al., Journal of Clinical Epidemiology, 2015):
 *   - 16 symptoms.
 *   - Frequency is rated: never = 0, occasionally = 1, often or always = 2.
 *   - Intensity is rated: moderate = 1, intense = 2.
 *   - Each symptom score is frequency x intensity, then recoded so that a
 *     product of 1 or 2 scores 1, and a product of 4 scores 2. A frequency of
 *     never scores 0 whatever the intensity.
 *   - The total therefore runs from 0 to 32, and a total of 6 or more is the
 *     published cut-off suggesting computer vision syndrome.
 *
 * This is a screening questionnaire used in occupational research, not a
 * diagnosis. It measures symptom burden; it does not identify the cause.
 */

/** Number of symptoms in the questionnaire. */
export const SYMPTOM_COUNT = 16;

/** Maximum achievable total (16 symptoms x 2 points each). */
export const MAX_SCORE = 32;

/** Published cut-off at or above which the questionnaire suggests CVS. */
export const CVS_CUTOFF = 6;

/** Frequency options and their raw codes. */
export const FREQUENCY_OPTIONS = [
  { id: "never", label: "Never", value: 0 },
  { id: "occasionally", label: "Occasionally", value: 1 },
  { id: "often", label: "Often or always", value: 2 },
];

/** Intensity options and their raw codes. */
export const INTENSITY_OPTIONS = [
  { id: "moderate", label: "Moderate", value: 1 },
  { id: "intense", label: "Intense", value: 2 },
];

/** The 16 CVS-Q symptoms. */
export const SYMPTOMS = [
  { id: "burning", label: "Burning" },
  { id: "itching", label: "Itching" },
  { id: "foreign-body", label: "Feeling of a foreign body in the eye" },
  { id: "tearing", label: "Tearing or watering" },
  { id: "excessive-blinking", label: "Excessive blinking" },
  { id: "redness", label: "Eye redness" },
  { id: "pain", label: "Eye pain" },
  { id: "heavy-lids", label: "Heavy eyelids" },
  { id: "dryness", label: "Dryness" },
  { id: "blurred", label: "Blurred vision" },
  { id: "double", label: "Double vision" },
  { id: "near-focus", label: "Difficulty focusing for near vision" },
  { id: "light-sensitivity", label: "Increased sensitivity to light" },
  { id: "halos", label: "Coloured halos around objects" },
  { id: "worsening", label: "Feeling that sight is worsening" },
  { id: "headache", label: "Headache" },
];

export function findSymptom(id) {
  return SYMPTOMS.find((symptom) => symptom.id === id) || null;
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * CVS-Q recode for one symptom.
 * frequency x intensity, where a product of 1 or 2 scores 1 and 4 scores 2.
 */
export function scoreSymptom(frequency, intensity) {
  if (!isNum(frequency) || !isNum(intensity)) return null;
  if (frequency < 0 || frequency > 2) return null;
  if (intensity < 1 || intensity > 2) return null;
  const product = frequency * intensity;
  if (product === 0) return 0;
  if (product === 4) return 2;
  return 1;
}

/** Bands used to describe a total. Only the 6-point cut-off is from the paper. */
export function scoreBand(total) {
  if (!isNum(total)) return null;
  if (total < CVS_CUTOFF) {
    return {
      id: "below",
      label: "Below the CVS-Q cut-off",
      advice:
        "Your symptom burden sits below the published cut-off of 6. Keeping distance breaks, screen height and an up-to-date prescription in place is what usually keeps it there.",
    };
  }
  if (total < 12) {
    return {
      id: "mild",
      label: "At or above the cut-off — mild burden",
      advice:
        "You are above the cut-off of 6. Start with the reversible things: the 20-20-20 rule, screen brightness matched to the room, screen top at or just below eye level, and a deliberate blink drill.",
    };
  }
  if (total < 20) {
    return {
      id: "moderate",
      label: "At or above the cut-off — moderate burden",
      advice:
        "A total in this range usually means more than one thing is going on at once — dryness plus an uncorrected prescription, for example. An eye examination is worth booking rather than working through more self-help.",
    };
  }
  return {
    id: "high",
    label: "At or above the cut-off — high burden",
    advice:
      "This is a heavy symptom load. Book an eye examination and mention the specific symptoms, especially any double vision, pain or coloured halos, which are not typical of simple screen fatigue.",
  };
}

/**
 * Symptoms that should not simply be filed under screen fatigue.
 * These are the ones worth naming to a clinician when they score.
 */
export const RED_FLAG_IDS = ["double", "pain", "halos", "worsening"];

/**
 * Score a completed questionnaire.
 *
 * @param {object} input
 * @param {Object<string,{frequency:number,intensity:number}>} input.answers
 * @param {number} [input.screenHours] Screen hours per day, for context only.
 * @returns {object} result, or { error }.
 */
export function scoreQuestionnaire({ answers, screenHours = 0 } = {}) {
  if (!answers || typeof answers !== "object") return { error: "Answer the questionnaire to see a score." };
  if (!isNum(screenHours) || screenHours < 0 || screenHours > 24) {
    return { error: "Screen hours must be between 0 and 24." };
  }

  const rows = [];
  let total = 0;
  let answered = 0;

  for (const symptom of SYMPTOMS) {
    const answer = answers[symptom.id];
    const frequency = answer && isNum(answer.frequency) ? answer.frequency : 0;
    const intensity = answer && isNum(answer.intensity) ? answer.intensity : 1;
    const score = scoreSymptom(frequency, intensity);
    if (score === null) {
      return { error: `Invalid rating for "${symptom.label}". Frequency must be 0-2 and intensity 1-2.` };
    }
    if (frequency > 0) answered += 1;
    total += score;
    rows.push({ ...symptom, frequency, intensity, score });
  }

  const band = scoreBand(total);
  const percentOfMax = Math.round((total / MAX_SCORE) * 1000) / 10;
  const aboveCutoff = total >= CVS_CUTOFF;

  const topSymptoms = rows
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, 5);

  const redFlags = rows.filter((row) => RED_FLAG_IDS.includes(row.id) && row.score > 0);

  const notes = [];
  if (aboveCutoff) {
    notes.push(
      `A total of ${CVS_CUTOFF} or more is the published CVS-Q cut-off. Your total is ${total} out of ${MAX_SCORE}.`,
    );
  } else {
    notes.push(`Your total is ${total} out of ${MAX_SCORE}, below the CVS-Q cut-off of ${CVS_CUTOFF}.`);
  }
  if (redFlags.length > 0) {
    notes.push(
      `You scored on ${redFlags.map((flag) => flag.label.toLowerCase()).join(", ")}. Those are worth naming specifically at an eye examination — they are not typical of ordinary screen fatigue.`,
    );
  }
  if (screenHours >= 6) {
    notes.push(
      `At ${screenHours} screen hours a day the 20-20-20 rule works out at about ${Math.floor((screenHours * 60) / 20)} distance breaks — the single change with the most evidence behind it.`,
    );
  }
  if (answered === 0) {
    notes.push("No symptoms rated above 'never', so there is nothing for the questionnaire to score.");
  }

  return {
    rows,
    total,
    maxScore: MAX_SCORE,
    cutoff: CVS_CUTOFF,
    aboveCutoff,
    percentOfMax,
    band,
    symptomsReported: answered,
    topSymptoms,
    redFlags,
    screenHours,
    notes,
  };
}

/** An all-zero answer set, for resetting the form. */
export function blankAnswers() {
  const answers = {};
  for (const symptom of SYMPTOMS) {
    answers[symptom.id] = { frequency: 0, intensity: 1 };
  }
  return answers;
}
