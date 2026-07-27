/**
 * Guided suspension diagnosis.
 *
 * This is a weighted symptom-to-cause matrix, the same reasoning a workshop
 * uses on a road test: each symptom points at several components with
 * different strengths, and the component that accumulates the most weight
 * across everything you observed is the one to inspect first.
 *
 * Weights are on a 1-5 scale where 5 means the symptom is close to diagnostic
 * on its own (a wet, oily damper body is a leaking damper) and 1 means the
 * symptom is only weakly suggestive.
 */

export const CAUSES = [
  {
    id: "damper",
    label: "Shock absorber / strut (damper)",
    check:
      "Bounce test: push down hard on one corner and release. More than one and a half rebounds means the damper is not controlling the spring. Then look for oil streaks down the body.",
    fix: "Replace in axle pairs. Never fit one new damper alone — the car will pull under braking.",
    safety: "medium",
  },
  {
    id: "strutMount",
    label: "Strut top mount / bearing",
    check:
      "With the car parked, turn the steering lock to lock slowly with the window down and listen at the top of the wheel arch for a clunk or grinding.",
    fix: "Replace the mount and bearing together, usually while the strut is off for other work.",
    safety: "medium",
  },
  {
    id: "spring",
    label: "Coil spring",
    check:
      "Measure the gap from wheel arch lip to tyre top on both sides. A difference over about 15 mm on the same axle points at a broken or settled spring; then inspect the bottom coil for a snapped end.",
    fix: "Replace in axle pairs so ride height stays even.",
    safety: "high",
  },
  {
    id: "ballJoint",
    label: "Lower ball joint",
    check:
      "Jack the wheel clear, hold it at 6 and 12 o'clock and rock it. Play with the brake pedal pressed usually means the joint, not the bearing. Also look for a split rubber boot.",
    fix: "Replace the joint or the whole control arm, then get the alignment reset.",
    safety: "critical",
  },
  {
    id: "tieRod",
    label: "Tie rod end / rack end",
    check:
      "Hold the wheel at 3 and 9 o'clock and rock it. Play here with the steering held still points at the tie rod end or the rack end.",
    fix: "Replace the joint and reset toe alignment — it always changes.",
    safety: "critical",
  },
  {
    id: "controlArmBush",
    label: "Control arm bush",
    check:
      "Look for cracked, split or displaced rubber where the arm bolts to the subframe. Levering gently with a bar shows up movement the eye misses.",
    fix: "Press in new bushes or replace the arm complete; realign afterwards.",
    safety: "medium",
  },
  {
    id: "arbLink",
    label: "Anti-roll bar link (drop link)",
    check:
      "Grip the link and try to move it by hand with the car on the ground. Any perceptible knock or free play is a failed link.",
    fix: "Cheap and quick to replace in pairs; the single most common cause of low-speed knocking.",
    safety: "low",
  },
  {
    id: "arbBush",
    label: "Anti-roll bar mounting bush",
    check:
      "Inspect the D-shaped rubber bushes clamping the bar to the subframe for splits, or a polished bar surface where the rubber has worn away.",
    fix: "Replace both bushes; often sold with the clamps.",
    safety: "low",
  },
  {
    id: "wheelBearing",
    label: "Wheel bearing",
    check:
      "Drive at a steady 50-60 km/h and weave gently. A hum that gets louder loading one side and quieter loading the other is that side's bearing.",
    fix: "Replace the bearing or hub assembly; a bearing that has started growling only gets worse.",
    safety: "high",
  },
  {
    id: "bumpStop",
    label: "Bump stop / dust boot",
    check:
      "Pull the boot back at the top of the damper rod. Crumbling foam or a boot full of debris means the stop has disintegrated.",
    fix: "Replace with the damper; a missing bump stop lets the damper bottom out and fail early.",
    safety: "low",
  },
  {
    id: "alignment",
    label: "Wheel alignment",
    check:
      "Look at tyre wear across the tread. Wear concentrated on one edge only is an alignment angle, not a suspension part.",
    fix: "Four-wheel alignment. Fix any worn joint first, or the settings will not hold.",
    safety: "low",
  },
  {
    id: "balance",
    label: "Wheel balance",
    check:
      "A vibration that appears in a narrow speed band, typically 80-110 km/h, and is felt in the steering wheel is almost always balance.",
    fix: "Rebalance all four wheels; check for missing weights and mud packed inside the rim.",
    safety: "low",
  },
];

/**
 * Each symptom points at causes with a weight of 1-5.
 * `urgent` marks symptoms that should not be driven on for long.
 */
export const SYMPTOMS = [
  {
    id: "clunkSpeedBreaker",
    label: "Knock or clunk going slowly over speed breakers",
    causes: { arbLink: 3, controlArmBush: 2, strutMount: 2, ballJoint: 2, bumpStop: 1 },
  },
  {
    id: "bounceTest",
    label: "Car keeps bouncing after a bump (fails the bounce test)",
    causes: { damper: 4, spring: 1 },
  },
  {
    id: "oilLeak",
    label: "Oily film or wet streaks down the shock absorber body",
    causes: { damper: 5 },
  },
  {
    id: "clunkOnTurn",
    label: "Clunk or grind when turning the steering while parked",
    causes: { strutMount: 3, ballJoint: 2, tieRod: 2 },
  },
  {
    id: "cuppedTyre",
    label: "Cupped or scalloped patches around the tyre tread",
    causes: { damper: 3, ballJoint: 1 },
  },
  {
    id: "edgeWear",
    label: "Tyre worn on one edge only",
    causes: { alignment: 3, controlArmBush: 2, ballJoint: 2 },
  },
  {
    id: "wander",
    label: "Steering wanders or feels vague in a straight line",
    causes: { tieRod: 3, ballJoint: 2, controlArmBush: 1, alignment: 1 },
    urgent: true,
  },
  {
    id: "humCornering",
    label: "Humming or growling that changes as you corner",
    causes: { wheelBearing: 5 },
    urgent: true,
  },
  {
    id: "squeakSlow",
    label: "Squeak or creak over slow undulations and driveways",
    causes: { controlArmBush: 3, arbBush: 2, ballJoint: 2 },
  },
  {
    id: "sitsLow",
    label: "One corner of the car sits visibly lower",
    causes: { spring: 4, damper: 1 },
    urgent: true,
  },
  {
    id: "rattleRough",
    label: "Rattle only over rough surfaces at low speed",
    causes: { arbLink: 3, arbBush: 2, bumpStop: 1 },
  },
  {
    id: "noseDive",
    label: "Nose dives heavily under braking, tail squats on acceleration",
    causes: { damper: 3, spring: 1 },
  },
  {
    id: "vibrationSpeed",
    label: "Steering wheel vibrates in a narrow speed band",
    causes: { balance: 3, wheelBearing: 1, tieRod: 1 },
  },
  {
    id: "clonkMoveOff",
    label: "Single clonk as you move off or brake gently",
    causes: { controlArmBush: 3, ballJoint: 2, arbLink: 1 },
  },
  {
    id: "wheelPlayVertical",
    label: "Wheel rocks when gripped at 6 and 12 o'clock, jacked up",
    causes: { ballJoint: 4, wheelBearing: 3 },
    urgent: true,
  },
  {
    id: "wheelPlayHorizontal",
    label: "Wheel rocks when gripped at 3 and 9 o'clock, jacked up",
    causes: { tieRod: 4, ballJoint: 1 },
    urgent: true,
  },
];

export const SAFETY_RANK = { critical: 3, high: 2, medium: 1, low: 0 };

export function getCause(id) {
  return CAUSES.find((cause) => cause.id === id) || null;
}

export function getSymptom(id) {
  return SYMPTOMS.find((symptom) => symptom.id === id) || null;
}

/**
 * Score the selected symptoms against the cause matrix.
 * @param {string[]} selectedIds SYMPTOMS[].id values
 */
export function diagnoseSuspension(selectedIds) {
  if (!Array.isArray(selectedIds)) {
    return { error: "Pass the list of symptoms you have observed." };
  }
  const selected = SYMPTOMS.filter((symptom) => selectedIds.includes(symptom.id));
  if (selected.length === 0) {
    return { error: "Tick at least one symptom to get a diagnosis." };
  }

  const scores = new Map();
  for (const symptom of selected) {
    for (const [causeId, weight] of Object.entries(symptom.causes)) {
      scores.set(causeId, (scores.get(causeId) || 0) + weight);
    }
  }

  const totalScore = [...scores.values()].reduce((acc, value) => acc + value, 0);
  const topScore = Math.max(...scores.values());

  const ranked = [...scores.entries()]
    .map(([causeId, score]) => {
      const cause = getCause(causeId);
      return {
        id: causeId,
        label: cause.label,
        check: cause.check,
        fix: cause.fix,
        safety: cause.safety,
        score,
        // Confidence is this cause's score relative to the strongest one found.
        sharePercent: Math.round((score / topScore) * 100),
        totalSharePercent: Math.round((score / totalScore) * 100),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return SAFETY_RANK[b.safety] - SAFETY_RANK[a.safety];
    });

  const urgentSymptoms = selected.filter((symptom) => symptom.urgent).map((s) => s.label);
  // Only flag a safety-critical component when it is a leading candidate, not a
  // weak secondary hit — otherwise every low-speed knock reads as an emergency.
  const CRITICAL_SHARE_PERCENT = 70;
  const CRITICAL_MIN_SCORE = 3;
  const criticalCauses = ranked
    .filter(
      (cause) =>
        cause.safety === "critical" &&
        cause.sharePercent >= CRITICAL_SHARE_PERCENT &&
        cause.score >= CRITICAL_MIN_SCORE,
    )
    .map((cause) => cause.label);

  return {
    selectedCount: selected.length,
    selectedLabels: selected.map((symptom) => symptom.label),
    totalScore,
    topCause: ranked[0],
    ranked,
    urgentSymptoms,
    criticalCauses,
    driveWithCaution: urgentSymptoms.length > 0 || criticalCauses.length > 0,
  };
}
