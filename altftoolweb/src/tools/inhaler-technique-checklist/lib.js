/**
 * Inhaler technique checklists and scoring.
 *
 * Step sequences follow the technique instructions published by respiratory
 * bodies and device manufacturers — the Global Initiative for Asthma (GINA)
 * technique appendix, NICE/BTS-SIGN asthma guidance, and the patient leaflets
 * for each device family. Nothing here is device-brand specific advice; always
 * read the leaflet that came with your own inhaler.
 *
 * The single most important difference between families:
 *  - Pressurised metered-dose inhalers (pMDI), spacers and soft-mist inhalers
 *    need a SLOW, steady inhalation over about 4-5 seconds.
 *  - Dry powder inhalers need a QUICK, deep, forceful inhalation, because the
 *    patient's own effort is what breaks up and carries the powder.
 * Using the wrong speed for the device is one of the commonest reasons an
 * inhaler "stops working".
 *
 * Steps flagged `critical: true` are the ones where getting it wrong means most
 * of the dose never reaches the lungs. Steps flagged false still matter — they
 * affect side effects, dose counting and device life.
 *
 * Scoring is pure: it takes the device key and the set of ticked step ids.
 */

/** Recommended breath-hold after inhaling, seconds (all device families). */
export const BREATH_HOLD_SECONDS = 10;

/** Gap between two puffs from the same pMDI, seconds. */
export const WAIT_BETWEEN_PUFFS_SECONDS = 30;

/** Tidal-breathing alternative for young children using a spacer, breaths per puff. */
export const TIDAL_BREATHS_PER_PUFF = 5;

export const INHALER_DEVICES = {
  pmdi: {
    key: "pmdi",
    label: "Metered-dose inhaler (pMDI)",
    aka: "The classic pressurised canister in a plastic boot",
    inhalationSpeed: "Slow and steady over 4-5 seconds",
    steps: [
      { id: "pmdi-cap", text: "Remove the cap and check the mouthpiece is clean and clear.", critical: false },
      { id: "pmdi-shake", text: "Shake the inhaler well for about 5 seconds.", critical: true, why: "Most pMDIs are suspensions; without shaking, the puff can be mostly propellant." },
      { id: "pmdi-prime", text: "If it is new or unused for two weeks, spray one test puff away from your face.", critical: false, why: "An unprimed canister can deliver a short dose on the first actuation." },
      { id: "pmdi-upright", text: "Sit or stand upright with your chin slightly raised.", critical: false },
      { id: "pmdi-exhale", text: "Breathe out gently, away from the inhaler, until your lungs feel empty.", critical: true, why: "Starting from a full chest leaves no room to draw the aerosol deep." },
      { id: "pmdi-seal", text: "Put the mouthpiece between your teeth and seal your lips around it without biting.", critical: true, why: "A leaky seal lets the dose escape into the room." },
      { id: "pmdi-fire", text: "Start breathing in slowly, then press the canister once as the breath begins.", critical: true, why: "Firing before or after the breath starts is the classic coordination error." },
      { id: "pmdi-slow", text: `Keep breathing in slowly and deeply for 4-5 seconds.`, critical: true, why: "A fast, sharp breath deposits the drug in the throat, not the airways." },
      { id: "pmdi-hold", text: `Hold your breath for up to ${BREATH_HOLD_SECONDS} seconds, or as long as is comfortable.`, critical: true, why: "The breath-hold is what lets the small particles settle in the lung." },
      { id: "pmdi-out", text: "Breathe out gently, away from the inhaler.", critical: false },
      { id: "pmdi-wait", text: `If a second puff is due, shake again and wait about ${WAIT_BETWEEN_PUFFS_SECONDS} seconds.`, critical: false },
      { id: "pmdi-rinse", text: "Replace the cap, and rinse your mouth and spit out if this is a steroid inhaler.", critical: false, why: "Rinsing reduces oral thrush and hoarseness." },
    ],
  },
  spacer: {
    key: "spacer",
    label: "pMDI with a spacer",
    aka: "Volumatic, AeroChamber, Zerostat and similar chambers",
    inhalationSpeed: "Slow and steady, or five tidal breaths for a young child",
    steps: [
      { id: "sp-assemble", text: "Check the spacer is clean, undamaged and correctly assembled.", critical: false },
      { id: "sp-wash", text: "Wash a new spacer in warm detergent water and let it drip dry — do not rub it dry.", critical: false, why: "Rubbing builds static that pulls the drug onto the chamber wall." },
      { id: "sp-shake", text: "Remove the inhaler cap, shake it well, and insert it into the spacer.", critical: true, why: "An unshaken suspension inhaler delivers an unreliable dose." },
      { id: "sp-exhale", text: "Breathe out gently, away from the spacer.", critical: true },
      { id: "sp-seal", text: "Seal your lips around the mouthpiece, or hold the mask flat against the face covering nose and mouth.", critical: true, why: "A gap of even a centimetre at the mask sharply cuts the delivered dose." },
      { id: "sp-onepuff", text: "Fire one puff only into the chamber.", critical: true, why: "Two puffs at once make the particles collide and stick to the chamber." },
      { id: "sp-inhale", text: `Breathe in slowly and deeply and hold for ${BREATH_HOLD_SECONDS} seconds, or take ${TIDAL_BREATHS_PER_PUFF} normal breaths if using a mask.`, critical: true },
      { id: "sp-prompt", text: "Start breathing within a couple of seconds of firing the puff.", critical: true, why: "Aerosol in a spacer falls out of suspension within seconds." },
      { id: "sp-wait", text: `Shake again and wait about ${WAIT_BETWEEN_PUFFS_SECONDS} seconds before the next puff.`, critical: false },
      { id: "sp-rinse", text: "Rinse the mouth and spit out after a steroid inhaler, and wash the child's face if a mask was used.", critical: false },
    ],
  },
  dpi: {
    key: "dpi",
    label: "Dry powder inhaler (DPI)",
    aka: "Accuhaler, Turbuhaler, Ellipta, Rotahaler and capsule devices",
    inhalationSpeed: "Quick, deep and forceful from the very start",
    steps: [
      { id: "dpi-open", text: "Open the device and hold it in the position the leaflet shows — upright for a Turbuhaler, level for most others.", critical: false },
      { id: "dpi-load", text: "Load one dose: click, slide the lever, or pierce the capsule once.", critical: true, why: "No loaded dose means an empty breath, and piercing twice can shatter the capsule." },
      { id: "dpi-exhale", text: "Breathe out gently and fully, AWAY from the mouthpiece.", critical: true, why: "Breathing out into a DPI adds moisture that clumps the powder and can blow the dose away." },
      { id: "dpi-seal", text: "Seal your lips tightly around the mouthpiece without covering the air vents.", critical: true },
      { id: "dpi-fast", text: "Breathe in quickly, deeply and forcefully right from the start of the breath.", critical: true, why: "Your own inspiratory effort is what disperses the powder — a slow breath leaves it in the device." },
      { id: "dpi-hold", text: `Take the device out and hold your breath for ${BREATH_HOLD_SECONDS} seconds.`, critical: true },
      { id: "dpi-out", text: "Breathe out gently, away from the device.", critical: false },
      { id: "dpi-check", text: "For capsule devices, open and check the capsule is empty; repeat the breath if powder remains.", critical: false },
      { id: "dpi-close", text: "Close the device and check the dose counter has moved.", critical: false },
      { id: "dpi-rinse", text: "Rinse the mouth and spit out if the inhaler contains a steroid.", critical: false },
      { id: "dpi-dry", text: "Keep the device dry and never wash the mouthpiece under a tap.", critical: false, why: "Moisture ruins the remaining powder doses." },
    ],
  },
  smi: {
    key: "smi",
    label: "Soft mist inhaler",
    aka: "Respimat and similar slow-mist devices",
    inhalationSpeed: "Slow and steady while the mist is released",
    steps: [
      { id: "smi-prime", text: "Prime a new inhaler by turning, opening and pressing until a visible cloud appears, then repeat as the leaflet says.", critical: false },
      { id: "smi-turn", text: "With the cap closed, turn the clear base half a turn until it clicks.", critical: true, why: "No click means no dose was loaded." },
      { id: "smi-open", text: "Flip the cap fully open.", critical: false },
      { id: "smi-exhale", text: "Breathe out slowly and fully, away from the inhaler.", critical: true },
      { id: "smi-seal", text: "Seal your lips around the mouthpiece without covering the air vents.", critical: true },
      { id: "smi-fire", text: "Begin a slow, deep breath in and press the dose button while you are still breathing in.", critical: true, why: "The mist lasts over a second, so the breath must already be under way." },
      { id: "smi-hold", text: `Hold your breath for ${BREATH_HOLD_SECONDS} seconds, or as long as is comfortable.`, critical: true },
      { id: "smi-close", text: "Close the cap and check the dose indicator.", critical: false },
      { id: "smi-rinse", text: "Rinse the mouth and spit out if the inhaler contains a steroid.", critical: false },
    ],
  },
  breathActuated: {
    key: "breathActuated",
    label: "Breath-actuated inhaler",
    aka: "Easi-Breathe, Autohaler and similar self-firing pMDIs",
    inhalationSpeed: "Slow and steady, and keep going past the click",
    steps: [
      { id: "ba-shake", text: "Shake the inhaler well for about 5 seconds.", critical: true },
      { id: "ba-arm", text: "Open the cap or push the lever up to arm the device.", critical: true, why: "An unarmed device will not fire when you breathe in." },
      { id: "ba-exhale", text: "Breathe out gently, away from the inhaler.", critical: true },
      { id: "ba-seal", text: "Seal your lips around the mouthpiece without blocking the air holes.", critical: true },
      { id: "ba-steady", text: "Breathe in slowly and steadily, and keep breathing in after the click.", critical: true, why: "Stopping at the click is the commonest error — the dose is released at the click, not before it." },
      { id: "ba-hold", text: `Hold your breath for ${BREATH_HOLD_SECONDS} seconds.`, critical: true },
      { id: "ba-reset", text: "Lower the lever or close the cap to reset the device.", critical: false },
      { id: "ba-wait", text: `Shake and wait about ${WAIT_BETWEEN_PUFFS_SECONDS} seconds before a second puff.`, critical: false },
      { id: "ba-rinse", text: "Rinse the mouth and spit out if the inhaler contains a steroid.", critical: false },
    ],
  },
};

/** Verdict bands, keyed off critical errors first and then the overall score. */
export const VERDICTS = {
  perfect: {
    key: "perfect",
    label: "Technique complete",
    tone: "good",
    advice: "Every step is ticked. Re-check yourself against this list every few months and at each review.",
  },
  minorSlips: {
    key: "minorSlips",
    label: "Minor slips only",
    tone: "warn",
    advice:
      "The dose is reaching your lungs, but the unticked steps affect side effects, device life or dose counting.",
  },
  criticalError: {
    key: "criticalError",
    label: "Critical step missed",
    tone: "bad",
    advice:
      "At least one step that determines whether the drug reaches your lungs is missing. Ask a pharmacist or asthma nurse to watch you use the device before assuming the medicine is not working.",
  },
};

/**
 * Score a run through the checklist.
 *
 * @param {object} input
 * @param {string} input.deviceKey
 * @param {string[]} input.completedIds  Ids of the steps ticked.
 * @returns {object} score, or { error } for an unknown device.
 */
export function scoreTechnique({ deviceKey, completedIds = [] }) {
  const device = INHALER_DEVICES[deviceKey];
  if (!device) return { error: "Choose the type of inhaler you use." };
  if (!Array.isArray(completedIds)) {
    return { error: "The list of completed steps is not readable." };
  }

  const validIds = new Set(device.steps.map((step) => step.id));
  const ticked = new Set(completedIds.filter((id) => validIds.has(id)));

  const totalSteps = device.steps.length;
  const criticalSteps = device.steps.filter((step) => step.critical);
  const missedSteps = device.steps.filter((step) => !ticked.has(step.id));
  const missedCritical = missedSteps.filter((step) => step.critical);

  const completedCount = totalSteps - missedSteps.length;
  const scorePct = totalSteps === 0 ? 0 : Math.round((completedCount / totalSteps) * 100);
  const criticalPct =
    criticalSteps.length === 0
      ? 100
      : Math.round(((criticalSteps.length - missedCritical.length) / criticalSteps.length) * 100);

  let verdict = VERDICTS.perfect;
  if (missedCritical.length > 0) verdict = VERDICTS.criticalError;
  else if (missedSteps.length > 0) verdict = VERDICTS.minorSlips;

  return {
    device,
    totalSteps,
    completedCount,
    scorePct,
    criticalTotal: criticalSteps.length,
    criticalMissed: missedCritical.length,
    criticalPct,
    missedSteps,
    missedCritical,
    verdict,
  };
}

/** Every step id for a device — used to tick or clear the whole list. */
export function allStepIds(deviceKey) {
  const device = INHALER_DEVICES[deviceKey];
  return device ? device.steps.map((step) => step.id) : [];
}
