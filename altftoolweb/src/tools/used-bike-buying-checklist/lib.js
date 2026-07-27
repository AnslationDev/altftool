/**
 * A structured inspection for a used motorcycle.
 *
 * Every check is weighted, because a weeping fork seal and a mismatched frame
 * number are not the same kind of problem. Two things are calculated.
 *
 * CONDITION SCORE. Only the checks you actually carried out count, so an
 * inspection you had to cut short does not silently score as perfect:
 *
 *   score = sum of weights passed / sum of weights checked x 100
 *
 * Coverage is reported alongside it — a 95% score from a third of the checks
 * is not the same statement as a 95% score from all of them.
 *
 * REPAIR ALLOWANCE. Each failed check carries a cost band rather than a fixed
 * price, since labour rates and parts prices differ everywhere. The four bands
 * are yours to set; the tool sums the bands of everything that failed and
 * subtracts the total from the asking price to give a defensible opening
 * offer. That is the number worth taking to the seller, because it is itemised.
 *
 * DEAL-BREAKERS. Some checks are not priced at all. A frame number that does
 * not match the documents, outstanding finance, or a frame that has been
 * straightened are reasons to leave regardless of what the rest of the bike is
 * like, so they short-circuit the verdict.
 *
 * MILEAGE. Annual distance is odometer / age, and both extremes carry risk: a
 * bike that has covered very little has usually stood, which perishes seals,
 * fuel and tyres, while a very high figure means wear items are due whatever
 * the service book says.
 *
 * A few checks have hard numbers attached and those are stated in the check
 * itself — a charging system should pull the battery up to roughly 13.8-14.5 V
 * at about 3,000 rpm, a rested lead-acid battery reads about 12.6 V at full
 * charge and 12.0 V at a quarter, and every tyre carries a four-digit DOT week
 * and year code that gives its true age regardless of tread depth.
 */

/** Weight scale used across the checks: 1 is cosmetic, 5 is fundamental. */
export const MAX_WEIGHT = 5;

/** Cost bands, in ascending order. Values are set by the user. */
export const COST_BANDS = [
  { id: "none", label: "No cost", defaultCost: 0 },
  { id: "minor", label: "Minor", defaultCost: 1500 },
  { id: "moderate", label: "Moderate", defaultCost: 6000 },
  { id: "major", label: "Major", defaultCost: 20000 },
  { id: "severe", label: "Severe", defaultCost: 60000 },
];

/** Verdict bands, applied to the weighted condition score. */
export const VERDICT_BANDS = [
  { min: 93, id: "good", label: "A good example", advice: "Nothing significant failed. Make a fair offer and get it in writing." },
  { min: 80, id: "solid", label: "Solid, budget for the failures", advice: "Normal wear for a used bike. Use the itemised repair allowance to set the price rather than haggling in round numbers." },
  { min: 60, id: "negotiate", label: "Negotiate hard", advice: "Enough has failed that the asking price is not the right price. Be ready to walk if the seller will not move." },
  { min: 0, id: "poor", label: "Needs a lot of work", advice: "This is a project. Only worth it if the model is what you specifically want and you are doing the work yourself." },
];

/** Below this coverage the score is not a reliable summary of the bike. */
export const MIN_COVERAGE_PERCENT = 70;

/** Annual distance bands, in kilometres per year. */
export const LOW_KM_PER_YEAR = 1500;
export const HIGH_KM_PER_YEAR = 15000;

/** Tyre age at which rubber should be inspected and replaced, in years. */
export const TYRE_INSPECT_YEARS = 5;
export const TYRE_REPLACE_YEARS = 10;

/** Charging system voltage that a healthy bike reaches at about 3,000 rpm. */
export const CHARGING_VOLTAGE_MIN = 13.8;
export const CHARGING_VOLTAGE_MAX = 14.5;

/**
 * The inspection. `weight` drives the score, `band` drives the repair
 * allowance, `dealBreaker` overrides both.
 */
export const CHECKPOINTS = [
  // Paperwork — done before you touch the bike.
  { id: "vin-match", group: "Paperwork", label: "Frame number matches the documents", what: "Read the stamped frame number yourself and compare every character with the registration document. Look for restamping, filing marks or a plate that sits proud.", weight: 5, band: "none", dealBreaker: true },
  { id: "engine-number", group: "Paperwork", label: "Engine number matches the documents", what: "A replaced engine is not automatically a problem, but it must be declared on the paperwork.", weight: 4, band: "none", dealBreaker: true },
  { id: "finance", group: "Paperwork", label: "No outstanding finance or theft marker", what: "Run a history check before money changes hands. A bike with finance owing can be repossessed from you after you buy it.", weight: 5, band: "none", dealBreaker: true },
  { id: "owner-name", group: "Paperwork", label: "Seller's name and address match the documents", what: "If they do not, ask why and get the answer in writing. Meeting at the registered address is a reasonable request.", weight: 4, band: "none", dealBreaker: true },
  { id: "service-history", group: "Paperwork", label: "Service history present and plausible", what: "Look for valve clearance checks, not just oil changes. Stamps with no invoices are worth less than invoices with no stamps.", weight: 3, band: "moderate", dealBreaker: false },
  { id: "two-keys", group: "Paperwork", label: "Two keys, and the immobiliser key if fitted", what: "A replacement coded key can cost more than a set of tyres on a modern bike.", weight: 2, band: "moderate", dealBreaker: false },

  // Frame and structure.
  { id: "frame-straight", group: "Frame", label: "Frame straight, no repairs or ripples", what: "Sight down the bike from front and rear. Look for ripples behind the headstock, fresh paint in odd places, and weld beads that do not match the factory finish.", weight: 5, band: "none", dealBreaker: true },
  { id: "crash-signs", group: "Frame", label: "No unexplained crash damage", what: "Scraped bar ends, lever nubs, footpeg feelers, exhaust and engine case scrapes. One scuff is a drop; matching scrapes down one side is a crash.", weight: 4, band: "major", dealBreaker: false },
  { id: "fork-alignment", group: "Frame", label: "Forks aligned and stanchions unpitted", what: "Sight down the front wheel from above with the bars straight. Pitted or rusty stanchions destroy fork seals repeatedly.", weight: 4, band: "major", dealBreaker: false },
  { id: "head-bearings", group: "Frame", label: "Steering head bearings smooth", what: "On the centre stand with the front wheel raised, swing the bars slowly lock to lock. Any notch at the straight-ahead position means they are worn.", weight: 3, band: "moderate", dealBreaker: false },
  { id: "swingarm", group: "Frame", label: "Swingarm and linkage bearings tight", what: "Grab the swingarm from the side and try to move it across. Any lateral play means bearings, and linkage bearings are usually the neglected ones.", weight: 3, band: "moderate", dealBreaker: false },

  // Engine — always from cold.
  { id: "cold-start", group: "Engine", label: "Started from genuinely cold", what: "Insist on this before you arrive. An engine already warm when you get there hides hard starting, smoke on start-up and rattles that only appear cold.", weight: 5, band: "none", dealBreaker: false },
  { id: "smoke", group: "Engine", label: "No smoke from the exhaust", what: "Blue smoke is oil past rings or valve stem seals; white smoke that does not clear is coolant, meaning head gasket; black is over-fuelling.", weight: 5, band: "severe", dealBreaker: false },
  { id: "engine-noise", group: "Engine", label: "No knocking, rattling or top-end tapping", what: "Listen at idle and just off idle. A regular top-end tap that does not go away with temperature usually means valve clearances at best.", weight: 4, band: "major", dealBreaker: false },
  { id: "oil-condition", group: "Engine", label: "Oil clean, correct level, no metal or milkiness", what: "Milky oil means water. Glitter on the sight glass or dipstick means something inside is wearing away.", weight: 4, band: "severe", dealBreaker: false },
  { id: "coolant", group: "Engine", label: "Coolant clean, no oil film, level correct", what: "Oil in the coolant or coolant loss with no visible leak both point at a head gasket.", weight: 4, band: "severe", dealBreaker: false },
  { id: "leaks", group: "Engine", label: "No oil leaks from cases, head or seals", what: "Look at the underside and the back of the engine, not just the shiny side. Fresh degreasing on an old bike is a question worth asking.", weight: 3, band: "moderate", dealBreaker: false },
  { id: "throttle-response", group: "Engine", label: "Pulls cleanly through the rev range", what: "On the test ride, roll on in a high gear from low revs. Hesitation, flat spots or surging point at fuelling or a blocked injector.", weight: 4, band: "moderate", dealBreaker: false },

  // Transmission.
  { id: "clutch", group: "Transmission", label: "Clutch bites correctly and does not slip", what: "In top gear at low speed, open the throttle hard. If the revs rise faster than the bike, the clutch is slipping.", weight: 4, band: "major", dealBreaker: false },
  { id: "gearbox", group: "Transmission", label: "All gears select cleanly, none jump out", what: "Work up and down the box under load. A gear that jumps out under acceleration is an engine-out repair.", weight: 5, band: "severe", dealBreaker: false },
  { id: "chain-sprockets", group: "Transmission", label: "Chain and sprockets within wear limits", what: "Pull the chain back off the rear sprocket at the three o'clock position — more than about half a tooth of gap means it is done. Hooked or pointed sprocket teeth confirm it. Replace as a set.", weight: 3, band: "moderate", dealBreaker: false },
  { id: "chain-tight-spots", group: "Transmission", label: "No tight spots in the chain", what: "Roll the wheel and check the slack at several points. A chain with a tight spot is worn unevenly and will need replacing whatever the seller says.", weight: 2, band: "minor", dealBreaker: false },

  // Brakes, wheels and tyres.
  { id: "disc-thickness", group: "Brakes and wheels", label: "Discs above the stamped minimum thickness", what: "Every disc carries a MIN TH figure on the carrier. Measure it — a disc under the minimum is not legal or safe and is not skimmable.", weight: 4, band: "major", dealBreaker: false },
  { id: "pads", group: "Brakes and wheels", label: "Pads with usable material left", what: "Look through the caliper at both pads on each disc. The inner one usually wears faster and is the one nobody checks.", weight: 2, band: "minor", dealBreaker: false },
  { id: "brake-fluid", group: "Brakes and wheels", label: "Brake fluid clear, lever firm", what: "Dark fluid means it has absorbed water and is overdue. A spongy lever that firms up on the second pull points at air or a failing master cylinder.", weight: 3, band: "minor", dealBreaker: false },
  { id: "disc-warp", group: "Brakes and wheels", label: "No pulsing through the lever", what: "Brake progressively from speed on the test ride. A pulse means a warped disc.", weight: 3, band: "major", dealBreaker: false },
  { id: "wheel-bearings", group: "Brakes and wheels", label: "Wheel bearings without play", what: "With each wheel off the ground, rock it side to side at twelve and six o'clock, then spin it and listen for rumble.", weight: 3, band: "moderate", dealBreaker: false },
  { id: "rims", group: "Brakes and wheels", label: "Rims true, no dents or cracks", what: "Spin each wheel and watch the rim edge against a fixed point. A dented rim on a tubeless wheel will not hold pressure reliably.", weight: 4, band: "major", dealBreaker: false },
  { id: "tyre-tread", group: "Brakes and wheels", label: "Tyres above the legal tread depth", what: "Check across the full width, not just the centre. A tyre worn square in the middle with plenty of edge left has done motorway miles and handles badly.", weight: 3, band: "moderate", dealBreaker: false },
  { id: "tyre-age", group: "Brakes and wheels", label: "Tyre DOT codes recent enough", what: `The four-digit code gives the week and year of manufacture. Inspect anything over ${TYRE_INSPECT_YEARS} years old and replace at ${TYRE_REPLACE_YEARS} regardless of tread.`, weight: 3, band: "moderate", dealBreaker: false },

  // Suspension.
  { id: "fork-seals", group: "Suspension", label: "Fork seals dry", what: "Look for a wet ring on the stanchion above the seal, and oil on the front of the wheel or the caliper. Push the front end down hard and check again.", weight: 3, band: "moderate", dealBreaker: false },
  { id: "rear-shock", group: "Suspension", label: "Rear shock not leaking or collapsed", what: "Sit on the bike and bounce it. It should return once and settle, not oscillate. A shock that has lost damping is a full replacement on most bikes.", weight: 3, band: "major", dealBreaker: false },

  // Electrics.
  { id: "charging", group: "Electrics", label: "Charging system reaching the right voltage", what: `Meter across the battery: about 12.6 V rested, rising to roughly ${CHARGING_VOLTAGE_MIN}–${CHARGING_VOLTAGE_MAX} V at 3,000 rpm. No rise means the regulator, rectifier or stator has failed.`, weight: 4, band: "major", dealBreaker: false },
  { id: "battery", group: "Electrics", label: "Battery holds charge and cranks strongly", what: "A rested lead-acid battery reads about 12.6 V at full charge and 12.0 V at a quarter. Watch the voltage while cranking rather than trusting a resting reading.", weight: 2, band: "minor", dealBreaker: false },
  { id: "lights", group: "Electrics", label: "Every light, indicator and switch works", what: "Both brake switches, main and dipped beam, all four indicators, horn, kill switch and the neutral light. Cheap to fix, but a pattern of failures says how the bike was kept.", weight: 2, band: "minor", dealBreaker: false },
  { id: "warning-lights", group: "Electrics", label: "No warning lights left on", what: "ABS and engine management lights should illuminate at ignition and go out. A bulb removed from the cluster is a specific kind of dishonest.", weight: 4, band: "major", dealBreaker: false },
  { id: "wiring", group: "Electrics", label: "No amateur wiring or bodged connectors", what: "Look under the seat and behind the headlight. Insulation tape, scotch locks and twisted joints are the visible part of a bigger problem.", weight: 3, band: "moderate", dealBreaker: false },

  // Test ride and finish.
  { id: "test-ride", group: "Test ride", label: "You were allowed a proper test ride", what: "A seller who will not permit a ride, having seen your licence and insurance, is telling you something. Ride it long enough to reach operating temperature.", weight: 4, band: "none", dealBreaker: false },
  { id: "straight-line", group: "Test ride", label: "Tracks straight hands-off", what: "On a quiet, flat road at moderate speed, relax your grip. Pulling to one side means alignment, wheel bearings or a bent frame.", weight: 4, band: "major", dealBreaker: false },
  { id: "cosmetics", group: "Test ride", label: "Cosmetic condition matches the mileage", what: "Worn grips, pegs and seat on a low-mileage bike are a reason to question the odometer.", weight: 2, band: "minor", dealBreaker: false },
  { id: "corrosion", group: "Test ride", label: "No serious corrosion on fasteners or frame", what: "Check the underside of the frame, the fastener heads and the swingarm pivot. Furry alloy and rusted bolt heads mean it lived outside.", weight: 2, band: "moderate", dealBreaker: false },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

/** The distinct groups, in the order they appear. */
export function checkpointGroups() {
  const seen = [];
  for (const point of CHECKPOINTS) {
    if (!seen.includes(point.group)) seen.push(point.group);
  }
  return seen;
}

/**
 * Kilometres per year and what that implies.
 * `currentYear` is passed in so the calculation stays pure.
 */
export function mileageProfile({ odometerKm, modelYear, currentYear }) {
  const km = num(odometerKm);
  const year = num(modelYear);
  const now = num(currentYear);
  if (!Number.isFinite(km) || km < 0) return null;
  if (!Number.isFinite(year) || !Number.isFinite(now)) return null;
  const age = Math.max(1, now - year);
  const perYear = km / age;
  let band = "typical";
  let note = "A normal annual distance for a road bike. Judge the service history rather than the odometer.";
  if (perYear < LOW_KM_PER_YEAR) {
    band = "low";
    note = `Under ${LOW_KM_PER_YEAR.toLocaleString("en-IN")} km a year means it has spent most of its life standing. Check fork seals, tyre dates, brake fluid, fuel condition and corrosion rather than being reassured by the low number.`;
  } else if (perYear > HIGH_KM_PER_YEAR) {
    band = "high";
    note = `Over ${HIGH_KM_PER_YEAR.toLocaleString("en-IN")} km a year. High mileage is fine if it was maintained, but chain, sprockets, tyres, brake discs and steering head bearings will all be nearer the end of their lives.`;
  }
  return {
    ageYears: age,
    kmPerYear: round(perYear),
    band,
    note,
  };
}

/**
 * Score an inspection.
 *
 * @param {object} input
 * @param {object} input.results        { [checkpointId]: "pass" | "fail" | "skip" }
 * @param {number} [input.askingPrice]
 * @param {object} [input.bandCosts]    { minor, moderate, major, severe }
 * @param {number} [input.odometerKm]
 * @param {number} [input.modelYear]
 * @param {number} [input.currentYear]
 * @returns {object} { error } or the assessment
 */
export function assessBike({
  results = {},
  askingPrice = 0,
  bandCosts = {},
  odometerKm,
  modelYear,
  currentYear,
} = {}) {
  const price = num(askingPrice);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "The asking price has to be zero or more." };
  }

  const costs = {};
  for (const band of COST_BANDS) {
    const supplied = bandCosts[band.id];
    const value = supplied === undefined || supplied === "" ? band.defaultCost : num(supplied);
    if (!Number.isFinite(value) || value < 0) {
      return { error: `The ${band.label.toLowerCase()} repair cost has to be zero or more.` };
    }
    costs[band.id] = value;
  }

  let weightChecked = 0;
  let weightPassed = 0;
  let checkedCount = 0;
  const failed = [];
  const dealBreakers = [];

  for (const point of CHECKPOINTS) {
    const state = results[point.id];
    if (state !== "pass" && state !== "fail") continue;
    checkedCount += 1;
    weightChecked += point.weight;
    if (state === "pass") {
      weightPassed += point.weight;
    } else {
      const cost = costs[point.band] ?? 0;
      const entry = { ...point, cost };
      failed.push(entry);
      if (point.dealBreaker) dealBreakers.push(entry);
    }
  }

  if (checkedCount === 0) {
    return { error: "Mark at least one check as passed or failed to see a score." };
  }

  const score = (weightPassed / weightChecked) * 100;
  const coverage = (checkedCount / CHECKPOINTS.length) * 100;
  const repairAllowance = failed.reduce((sum, f) => sum + f.cost, 0);
  const fairOffer = Math.max(0, price - repairAllowance);

  const band = VERDICT_BANDS.find((v) => score >= v.min) || VERDICT_BANDS[VERDICT_BANDS.length - 1];
  const verdict = dealBreakers.length
    ? {
        id: "walk-away",
        label: "Walk away",
        advice: `${dealBreakers.length} deal-breaker${dealBreakers.length === 1 ? "" : "s"} failed. Nothing about the rest of the bike changes that — these are the checks that decide whether you can legally and safely own it.`,
      }
    : band;

  const mileage = mileageProfile({ odometerKm, modelYear, currentYear });

  const warnings = [];
  if (coverage < MIN_COVERAGE_PERCENT) {
    warnings.push(
      `Only ${round(coverage)}% of the checks were completed, so the ${round(score)}% score describes the part of the bike you looked at, not the bike. Finish the inspection before making an offer.`,
    );
  }
  if (dealBreakers.length) {
    warnings.push(
      `Failed deal-breakers: ${dealBreakers.map((d) => d.label.toLowerCase()).join("; ")}. These are not negotiating points.`,
    );
  }
  if (mileage && mileage.band !== "typical") {
    warnings.push(mileage.note);
  }
  if (price > 0 && repairAllowance > price * 0.4) {
    warnings.push(
      `The repair allowance is more than 40% of the asking price. At that point the bike is worth what its parts are worth, not what it is advertised at.`,
    );
  }

  const byGroup = checkpointGroups().map((group) => {
    const points = CHECKPOINTS.filter((p) => p.group === group);
    const checkedInGroup = points.filter((p) => results[p.id] === "pass" || results[p.id] === "fail");
    const failedInGroup = points.filter((p) => results[p.id] === "fail");
    const wChecked = checkedInGroup.reduce((s, p) => s + p.weight, 0);
    const wPassed = checkedInGroup
      .filter((p) => results[p.id] === "pass")
      .reduce((s, p) => s + p.weight, 0);
    return {
      group,
      total: points.length,
      checked: checkedInGroup.length,
      failed: failedInGroup.length,
      score: wChecked > 0 ? round((wPassed / wChecked) * 100) : null,
    };
  });

  return {
    totalCheckpoints: CHECKPOINTS.length,
    checkedCount,
    passedCount: checkedCount - failed.length,
    failedCount: failed.length,
    coverage: round(coverage, 1),
    score: round(score, 1),
    weightChecked,
    weightPassed,
    failed,
    dealBreakers,
    repairAllowance: round(repairAllowance),
    askingPrice: round(price),
    fairOffer: round(fairOffer),
    discountPercent: price > 0 ? round((repairAllowance / price) * 100, 1) : null,
    verdictId: verdict.id,
    verdictLabel: verdict.label,
    verdictAdvice: verdict.advice,
    mileage,
    byGroup,
    warnings,
    bandCosts: costs,
  };
}
