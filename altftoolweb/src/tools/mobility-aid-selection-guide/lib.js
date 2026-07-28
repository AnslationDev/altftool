/**
 * Mobility aid selection guide.
 *
 * The aids and their trade-offs follow standard physiotherapy and occupational
 * therapy teaching: support increases from a single-point cane through a quad
 * cane, crutches, a pick-up frame, a two-wheeled walker and a four-wheeled
 * rollator to a wheelchair, while manoeuvrability and portability fall in
 * roughly the opposite order.
 *
 * Fitting rule: with the person standing upright in their usual shoes and arms
 * hanging relaxed, the handgrip of a cane, crutch or walker should sit level
 * with the wrist crease (the ulnar styloid), which puts the elbow at about 15
 * to 20 degrees of flexion when the aid is in use. That crease sits at roughly
 * half of standing height, which is why the height range below is derived from
 * height — but the wrist-crease check, not the number, is what settles it.
 *
 * Scoring here is a structured comparison, not a clinical prescription. The aid
 * that suits a person is decided by a physiotherapist or occupational therapist
 * who watches them walk.
 */

/** Handgrip height as a fraction of standing height (approximation of the wrist crease). */
export const GRIP_HEIGHT_FRACTION = { min: 0.48, max: 0.52 };

/** Elbow flexion the fitting aims for, in degrees. */
export const TARGET_ELBOW_FLEXION = { min: 15, max: 20 };

/**
 * `level` is the weight relief a walking aid must provide, on the same 0-3 scale
 * as the aids. `ambulatory: false` means walking is not a realistic option, which
 * puts the choice in a different category rather than further along the scale.
 */
export const SUPPORT_NEEDS = [
  { key: "balance-only", label: "Just a bit of balance support", level: 1, ambulatory: true, nonWeightBearing: false },
  { key: "light", label: "Light weight taken off one leg", level: 2, ambulatory: true, nonWeightBearing: false },
  { key: "moderate", label: "Moderate support, unsteady on both legs", level: 3, ambulatory: true, nonWeightBearing: false },
  { key: "heavy", label: "One leg cannot take weight at all (fracture, post-surgery)", level: 3, ambulatory: true, nonWeightBearing: true },
  { key: "non-ambulatory", label: "Cannot walk useful distances at all", level: 3, ambulatory: false, nonWeightBearing: false },
];

export const BALANCE_LEVELS = [
  { key: "good", label: "Steady", stabilityNeed: 1 },
  { key: "fair", label: "Occasionally unsteady", stabilityNeed: 2 },
  { key: "poor", label: "Often unsteady or has fallen", stabilityNeed: 3 },
];

export const ENDURANCE_LEVELS = [
  { key: "high", label: "Can walk over 500 m without a rest", seatNeed: 0 },
  { key: "medium", label: "Manages 100-500 m, then needs a rest", seatNeed: 1 },
  { key: "low", label: "Under 100 m before needing to sit", seatNeed: 2 },
];

export const GRIP_LEVELS = [
  { key: "good", label: "Good hand and arm strength", tolerance: 3 },
  { key: "fair", label: "Some weakness or arthritis in the hands", tolerance: 2 },
  { key: "poor", label: "Weak grip, painful or unreliable hands", tolerance: 1 },
];

export const ENVIRONMENTS = [
  { key: "indoor", label: "Mostly indoors, tight spaces" },
  { key: "outdoor", label: "Mostly outdoors, pavements and shops" },
  { key: "both", label: "A mix of both" },
];

/**
 * Aid attributes on a 0-3 scale.
 *  support      how much body weight it can take off the legs
 *  stability    how much it widens the base of support
 *  indoorFit    manoeuvrability in narrow doorways and around furniture
 *  outdoorFit   handling on pavements, kerbs and rough ground
 *  gripDemand   how much hand and arm strength it needs
 *  stairs       how workable it is on stairs
 *  portability  how easily it is carried, folded or put in a car
 */
export const AIDS = [
  {
    key: "single-cane",
    label: "Single-point walking stick",
    support: 1,
    stability: 1,
    indoorFit: 3,
    outdoorFit: 2,
    gripDemand: 1,
    stairs: 3,
    portability: 3,
    hasSeat: false,
    bothHands: false,
    canCarry: true,
    summary: "Lightest option. Takes up to roughly a quarter of body weight off one side and mainly gives sensory feedback and a wider base.",
    pros: ["Easy indoors, on stairs and in vehicles", "Leaves one hand completely free", "Cheapest option and easy to replace"],
    cons: ["Very little actual weight relief", "No help if balance fails suddenly"],
    tip: "Hold it in the hand opposite the weaker leg, and move stick and weak leg forward together.",
  },
  {
    key: "quad-cane",
    label: "Quad cane (four-footed stick)",
    support: 2,
    stability: 2,
    indoorFit: 2,
    outdoorFit: 1,
    gripDemand: 1,
    stairs: 2,
    portability: 2,
    hasSeat: false,
    bothHands: false,
    canCarry: true,
    summary: "A four-footed base gives more support than a single stick and stands up on its own, at the cost of weight and speed.",
    pros: ["Stands unaided, so it is not always falling over", "More support than a single stick", "Still leaves one hand free"],
    cons: ["Heavier and slower to use", "All four feet must land flat, which is awkward on kerbs and uneven ground"],
    tip: "Set it down with the widest side of the base away from your body so your foot does not catch it.",
  },
  {
    key: "forearm-crutches",
    label: "Pair of forearm (elbow) crutches",
    support: 3,
    stability: 2,
    indoorFit: 2,
    outdoorFit: 2,
    gripDemand: 3,
    stairs: 2,
    portability: 3,
    hasSeat: false,
    bothHands: true,
    canCarry: false,
    summary: "Takes substantial weight off one or both legs and suits partial or non-weight-bearing after injury, but demands real arm strength.",
    pros: ["Large amount of weight relief", "Cuffs let you briefly release the grip to open a door", "Light and easy to transport"],
    cons: ["Needs good arm, shoulder and grip strength", "Both hands occupied, so nothing can be carried", "Tiring over long distances"],
    tip: "On stairs: up with the stronger leg first, down with the crutches and the weaker leg first.",
  },
  {
    key: "pickup-frame",
    label: "Standard walking frame (no wheels)",
    support: 3,
    stability: 3,
    indoorFit: 2,
    outdoorFit: 1,
    gripDemand: 2,
    stairs: 0,
    portability: 1,
    hasSeat: false,
    bothHands: true,
    canCarry: false,
    summary: "The most stable walking aid because it must be lifted and planted before each step, which makes it slow but very secure.",
    pros: ["Maximum stability while standing still", "Good for short indoor distances and standing at a sink", "Inexpensive"],
    cons: ["Must be lifted, so it needs arm strength and interrupts a natural gait", "Useless outdoors on rough ground and impossible on stairs", "Nothing can be carried"],
    tip: "Plant all four legs before stepping in. Never use it to pull yourself up from a chair — push up from the chair arms first.",
  },
  {
    key: "two-wheel-walker",
    label: "Two-wheeled walker",
    support: 3,
    stability: 3,
    indoorFit: 2,
    outdoorFit: 2,
    gripDemand: 2,
    stairs: 0,
    portability: 1,
    hasSeat: false,
    bothHands: true,
    canCarry: false,
    summary: "Front wheels with rear skids: it rolls forward without needing to be lifted, but grips the floor as soon as you lean on it.",
    pros: ["Smoother, more natural walking pattern than a pick-up frame", "Still very stable because the rear feet brake under load", "No brake levers to remember"],
    cons: ["Bulky and awkward in narrow homes", "Not for stairs", "Nothing can be carried unless a tray or bag is added"],
    tip: "Keep it close — walking with the walker too far ahead pulls you into a stooped, unsafe posture.",
  },
  {
    key: "rollator",
    label: "Four-wheeled rollator with seat",
    support: 3,
    stability: 2,
    indoorFit: 1,
    outdoorFit: 3,
    gripDemand: 2,
    stairs: 0,
    portability: 1,
    hasSeat: true,
    bothHands: true,
    canCarry: true,
    summary: "Rolls continuously, carries shopping in a basket and gives a seat to rest on — the usual answer when stamina, not balance, is the limit.",
    pros: ["Built-in seat for resting on longer trips", "Basket or bag carries shopping", "Handles pavements and outdoor surfaces well"],
    cons: ["Rolls away if you lean on it without the brakes on", "Wide and heavy indoors", "Needs the hand strength and memory to work the brakes"],
    tip: "Always lock both brakes before sitting on the seat, and sit facing outwards, never backwards over the wheels.",
  },
  {
    key: "knee-walker",
    label: "Knee walker (knee scooter)",
    // Only indicated when one lower leg must stay completely off the ground.
    requiresNonWeightBearing: true,
    support: 3,
    stability: 2,
    indoorFit: 1,
    outdoorFit: 2,
    gripDemand: 2,
    stairs: 0,
    portability: 1,
    hasSeat: false,
    bothHands: true,
    canCarry: true,
    summary: "The lower leg rests on a padded platform while the other leg pushes — designed for non-weight-bearing below the knee, such as after a foot or ankle injury.",
    pros: ["Keeps a foot or ankle completely off the ground without tiring the arms", "Far less effort than crutches", "Basket carries items"],
    cons: ["Only works for injuries below the knee", "No use on stairs and awkward in tight spaces", "Needs good balance on the standing leg"],
    tip: "Only suitable if the knee bends comfortably and the injury is below it — check with the treating clinician first.",
  },
  {
    key: "transport-chair",
    label: "Transport chair or wheelchair",
    ambulatory: false,
    support: 3,
    stability: 3,
    indoorFit: 1,
    outdoorFit: 2,
    gripDemand: 1,
    stairs: 0,
    portability: 0,
    hasSeat: true,
    bothHands: false,
    canCarry: true,
    summary: "For distances that cannot be walked at all. Often used alongside a walking aid rather than instead of it, so short indoor walking is preserved.",
    pros: ["Removes the distance limit entirely", "Lets someone join long outings they would otherwise miss", "A self-propelled chair keeps some independence"],
    cons: ["Full-time use accelerates muscle loss if walking is still possible", "Needs a helper unless self-propelled", "Access, kerbs and transport all become planning problems"],
    tip: "Use it for the long stretches and keep walking the short ones — the walking is what preserves strength.",
  },
];

const WEIGHTS = {
  supportMatch: 4,
  supportExcess: 1.5,
  stability: 3,
  seat: 2.5,
  grip: 2.5,
  environment: 2,
  carry: 1.5,
  stairs: 2,
  oneHanded: 2.5,
  cognitive: 3,
  category: 25, // walking aid vs wheelchair — a category mismatch, not a near miss
  nonWeightBearing: 4,
};

function round1(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Rank the aids against one person's needs.
 *
 * @param {object} input
 * @param {string} input.supportKey     key from SUPPORT_NEEDS
 * @param {string} input.balanceKey     key from BALANCE_LEVELS
 * @param {string} input.enduranceKey   key from ENDURANCE_LEVELS
 * @param {string} input.gripKey        key from GRIP_LEVELS
 * @param {string} input.environmentKey key from ENVIRONMENTS
 * @param {boolean} [input.needsFreeHand] needs one hand free while walking
 * @param {boolean} [input.carriesItems]  needs to carry shopping or a bag
 * @param {boolean} [input.usesStairs]    uses stairs most days
 * @param {boolean} [input.memoryConcern] memory or judgement problems
 * @param {number} [input.heightCm]       standing height for the fitting range
 * @returns {object} ranked aids and fitting guidance, or { error }
 */
export function recommendMobilityAid({
  supportKey,
  balanceKey,
  enduranceKey,
  gripKey,
  environmentKey,
  needsFreeHand = false,
  carriesItems = false,
  usesStairs = false,
  memoryConcern = false,
  heightCm = null,
} = {}) {
  const support = SUPPORT_NEEDS.find((row) => row.key === supportKey);
  if (!support) return { error: "Choose how much support is needed." };
  const balance = BALANCE_LEVELS.find((row) => row.key === balanceKey);
  if (!balance) return { error: "Choose how steady walking currently is." };
  const endurance = ENDURANCE_LEVELS.find((row) => row.key === enduranceKey);
  if (!endurance) return { error: "Choose how far can be walked before a rest." };
  const grip = GRIP_LEVELS.find((row) => row.key === gripKey);
  if (!grip) return { error: "Choose the level of hand and arm strength." };
  const environment = ENVIRONMENTS.find((row) => row.key === environmentKey);
  if (!environment) return { error: "Choose where the aid will mostly be used." };

  let fitting = null;
  if (heightCm !== null && heightCm !== undefined && heightCm !== "") {
    const height = Number(heightCm);
    if (!Number.isFinite(height)) return { error: "Enter standing height as a number of centimetres, or leave it blank." };
    if (height < 100 || height > 230) return { error: "Enter a standing height between 100 and 230 cm." };
    fitting = {
      heightCm: height,
      gripMinCm: round1(height * GRIP_HEIGHT_FRACTION.min),
      gripMaxCm: round1(height * GRIP_HEIGHT_FRACTION.max),
      elbowFlexion: TARGET_ELBOW_FLEXION,
    };
  }

  const scored = AIDS.map((aid) => {
    const reasons = [];
    const warnings = [];
    let score = 0;

    // Walking aid versus wheelchair is a category decision, taken before any
    // fine-grained comparison of support levels.
    const aidIsAmbulatory = aid.ambulatory !== false;
    if (aidIsAmbulatory !== support.ambulatory) {
      score -= WEIGHTS.category;
      warnings.push(
        support.ambulatory
          ? "This replaces walking rather than supporting it, which is more than you described needing."
          : "This is a walking aid, and you said walking any useful distance is not possible.",
      );
    } else {
      reasons.push(support.ambulatory ? "In the right category — a walking aid." : "In the right category — a wheeled seat.");
    }

    // Aids with a single indication score badly outside it.
    if (aid.requiresNonWeightBearing && !support.nonWeightBearing) {
      score -= WEIGHTS.category;
      warnings.push("Only indicated when one lower leg must stay completely off the ground, such as after a foot or ankle fracture.");
    }

    // Non-weight-bearing on one leg needs an aid that can take real load.
    if (support.nonWeightBearing) {
      if (aid.support >= 3 && aidIsAmbulatory) {
        score += WEIGHTS.nonWeightBearing;
        reasons.push("Can take enough load for a leg that must stay off the ground.");
      } else if (aidIsAmbulatory) {
        score -= WEIGHTS.nonWeightBearing;
        warnings.push("Not enough load-bearing for a leg that cannot touch down at all.");
      }
    }

    // Support: hitting the required level scores best; falling short is heavily penalised.
    const gap = aid.support - support.level;
    if (gap < 0) {
      score -= WEIGHTS.supportMatch * Math.abs(gap) * 2;
      warnings.push("Gives less weight relief than the support level you selected.");
    } else {
      score += WEIGHTS.supportMatch * 2 - WEIGHTS.supportExcess * gap;
      if (gap >= 2) warnings.push("More support than you asked for; over-supporting can speed up loss of strength.");
      else reasons.push("Support level matches what you described.");
    }

    // Stability against the balance need.
    if (aid.stability >= balance.stabilityNeed) {
      score += WEIGHTS.stability;
      if (balance.stabilityNeed >= 3) reasons.push("Wide, stable base suits frequent unsteadiness.");
    } else {
      score -= WEIGHTS.stability * (balance.stabilityNeed - aid.stability);
      warnings.push("Narrower base than your balance really calls for.");
    }

    // Seat when stamina is the limiting factor.
    if (endurance.seatNeed > 0) {
      if (aid.hasSeat) {
        score += WEIGHTS.seat * endurance.seatNeed;
        reasons.push("Has a seat, so you can rest without looking for a bench.");
      } else {
        score -= WEIGHTS.seat * (endurance.seatNeed - 1);
      }
    }

    // Hand and arm demand.
    if (aid.gripDemand > grip.tolerance) {
      score -= WEIGHTS.grip * (aid.gripDemand - grip.tolerance);
      warnings.push("Asks for more hand and arm strength than you described.");
    } else {
      score += WEIGHTS.grip * 0.5;
    }

    // Where it will be used.
    const envFit =
      environment.key === "indoor"
        ? aid.indoorFit
        : environment.key === "outdoor"
          ? aid.outdoorFit
          : (aid.indoorFit + aid.outdoorFit) / 2;
    score += WEIGHTS.environment * envFit;
    if (envFit <= 1) warnings.push(`Awkward for ${environment.label.toLowerCase()}.`);

    // Carrying things.
    if (carriesItems) {
      if (aid.canCarry) {
        score += WEIGHTS.carry;
        reasons.push("Leaves a way to carry shopping or a bag.");
      } else {
        score -= WEIGHTS.carry;
        warnings.push("Both hands are occupied, so nothing can be carried.");
      }
    }

    // One hand free (holding a rail, a door, a grandchild).
    if (needsFreeHand) {
      if (aid.bothHands) {
        score -= WEIGHTS.oneHanded;
        warnings.push("Needs both hands, so no hand is free.");
      } else {
        score += WEIGHTS.oneHanded;
        reasons.push("Uses one hand, leaving the other free.");
      }
    }

    // Stairs.
    if (usesStairs) {
      score += WEIGHTS.stairs * aid.stairs;
      if (aid.stairs === 0) warnings.push("Cannot be used on stairs — you would need a second aid upstairs.");
    }

    // Memory or judgement problems and hand brakes.
    if (memoryConcern && aid.key === "rollator") {
      score -= WEIGHTS.cognitive;
      warnings.push("Depends on remembering to lock both brakes before sitting, which is a real risk if memory is unreliable.");
    }

    return { ...aid, score: round1(score), reasons, warnings };
  });

  const ranked = [...scored].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.key.localeCompare(b.key);
  });

  const topScore = ranked[0].score;
  const bottomScore = ranked[ranked.length - 1].score;
  const span = topScore - bottomScore;
  const withFit = ranked.map((aid) => ({
    ...aid,
    fitPercent: span > 0 ? Math.round(((aid.score - bottomScore) / span) * 100) : 100,
  }));

  return {
    support,
    balance,
    endurance,
    grip,
    environment,
    needsFreeHand: Boolean(needsFreeHand),
    carriesItems: Boolean(carriesItems),
    usesStairs: Boolean(usesStairs),
    memoryConcern: Boolean(memoryConcern),
    fitting,
    ranked: withFit,
    best: withFit[0],
    runnerUp: withFit[1],
  };
}
