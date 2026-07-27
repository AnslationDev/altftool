/**
 * Motorcycle chain slack, stretch and lubrication.
 *
 * THREE INDEPENDENT RULES, none of them guesswork:
 *
 * 1. PITCH. A roller chain's size code encodes its pitch: the first digit is the
 *    pitch in eighths of an inch. 4 -> 4/8 in = 12.70 mm (420, 428);
 *    5 -> 5/8 in = 15.875 mm (520, 525, 530); 6 -> 6/8 in = 19.05 mm (630).
 *    The remaining digits describe roller width, not length.
 *
 * 2. STRETCH. Chains do not stretch — the pins and bushes wear, so the pitch
 *    grows. The standard workshop check is to measure across 20 links (21 pins)
 *    with the chain pulled taut and compare with the nominal length:
 *
 *        nominal 20-link length = 20 x pitch
 *        elongation %           = (measured - nominal) / nominal x 100
 *
 *    Manufacturers' service limits cluster around 2%; past that the chain no
 *    longer sits in the sprocket valleys and starts eating the sprockets, so
 *    chain and both sprockets get replaced together.
 *
 * 3. SLACK. Free play is measured at the midpoint of the lower chain run,
 *    between the sprockets, with the bike unladen. The correct figure depends on
 *    the suspension layout: a linkage monoshock pulls the swingarm through a
 *    bigger arc than a twin-shock commuter, so it needs more free play at rest.
 *    Too tight is far more damaging than slightly loose — it loads the gearbox
 *    output shaft bearing continuously and can snap the chain over a bump.
 *
 * Every figure here is a typical range. The swingarm sticker or the owner's
 * manual for your specific model always wins.
 */

/** Pitch in mm, derived from the chain size code (first digit = eighths of an inch). */
export const CHAIN_SIZES = [
  { id: "420", label: "420", pitchMm: 12.7 },
  { id: "428", label: "428", pitchMm: 12.7 },
  { id: "520", label: "520", pitchMm: 15.875 },
  { id: "525", label: "525", pitchMm: 15.875 },
  { id: "530", label: "530", pitchMm: 15.875 },
  { id: "630", label: "630", pitchMm: 19.05 },
];

/** Workshop standard: measure across 20 links, i.e. 21 pins. */
export const LINKS_MEASURED = 20;

/** Elongation bands, percent of nominal length. */
export const WEAR_MONITOR_PCT = 1;
export const WEAR_REPLACE_PCT = 2;
/** Above this the measurement is almost certainly wrong, not the chain. */
const WEAR_IMPLAUSIBLE_PCT = 10;

/** Typical free-play ranges at the midpoint of the lower run, bike unladen. */
export const SLACK_SPECS = [
  { id: "commuter", label: "Commuter, twin rear shocks", minMm: 20, maxMm: 30 },
  { id: "monoshock", label: "Monoshock without linkage", minMm: 25, maxMm: 35 },
  { id: "linkage", label: "Sport / linkage monoshock", minMm: 30, maxMm: 40 },
  { id: "offroad", label: "Off-road / long-travel", minMm: 40, maxMm: 55 },
];

/** Base clean-and-lube intervals in km. O-ring and X-ring chains hold their own grease. */
export const LUBE_INTERVAL_KM = {
  standard: 500,
  sealed: 800,
};

/** Riding through rain, dust or slush roughly halves the interval. */
export const HARSH_CONDITION_FACTOR = 0.5;

/** Slack should be re-checked at least this often, whatever the lube interval. */
export const SLACK_CHECK_INTERVAL_KM = 500;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Nominal length of a 20-link span for a chain size, in mm. */
export function nominalSpanMm(pitchMm, links = LINKS_MEASURED) {
  return pitchMm * links;
}

/**
 * @param {object} input
 * @param {string} input.chainSize        one of CHAIN_SIZES ids
 * @param {number} input.measuredSpanMm   measured length across 20 links, taut
 * @param {string} input.bikeType         one of SLACK_SPECS ids
 * @param {number} input.measuredSlackMm  free play you measured at the lower run
 * @param {boolean} input.sealedChain     O-ring / X-ring chain
 * @param {boolean} input.harshConditions rain, dust, slush or coastal salt
 * @param {number} input.lastLubeOdo      odometer at the last clean and lube
 * @param {number} input.currentOdo       odometer now
 */
export function assessChain({
  chainSize,
  measuredSpanMm,
  bikeType,
  measuredSlackMm,
  sealedChain = true,
  harshConditions = false,
  lastLubeOdo,
  currentOdo,
}) {
  const size = CHAIN_SIZES.find((entry) => entry.id === chainSize);
  if (!size) return { error: "Pick your chain size — it is stamped on the side plates." };
  const spec = SLACK_SPECS.find((entry) => entry.id === bikeType);
  if (!spec) return { error: "Pick the suspension layout that matches your bike." };

  if (![measuredSpanMm, measuredSlackMm, lastLubeOdo, currentOdo].every(isNum))
    return { error: "Enter a valid number for the chain measurement, slack and both odometer readings." };
  if (measuredSpanMm <= 0) return { error: "Enter the measured length across 20 links, in millimetres." };
  if (measuredSlackMm < 0) return { error: "Free play cannot be negative." };
  if (measuredSlackMm > 120) return { error: "Free play above 120 mm means the chain is off, not slack." };
  if (lastLubeOdo < 0 || currentOdo < 0) return { error: "Odometer readings cannot be negative." };
  if (currentOdo < lastLubeOdo)
    return { error: "The current odometer reading cannot be lower than the reading at the last lube." };

  // --- stretch ---
  const nominal = nominalSpanMm(size.pitchMm);
  const elongationMm = measuredSpanMm - nominal;
  const elongationPct = (elongationMm / nominal) * 100;

  if (elongationPct < -0.5)
    return {
      error: `${measuredSpanMm} mm is shorter than a brand-new ${size.label} chain (${nominal.toFixed(1)} mm across 20 links) — re-measure with the chain pulled taut, pin centre to pin centre.`,
    };
  if (elongationPct > WEAR_IMPLAUSIBLE_PCT)
    return {
      error: `That works out to ${elongationPct.toFixed(0)}% elongation. Check you measured exactly ${LINKS_MEASURED} links and picked the right chain size.`,
    };

  let wearStatus;
  if (elongationPct >= WEAR_REPLACE_PCT) wearStatus = "replace";
  else if (elongationPct >= WEAR_MONITOR_PCT) wearStatus = "monitor";
  else wearStatus = "healthy";

  const wearUsedPct = Math.max(0, (elongationPct / WEAR_REPLACE_PCT) * 100);
  const spanAtServiceLimit = nominal * (1 + WEAR_REPLACE_PCT / 100);
  const mmLeftToLimit = Math.max(0, spanAtServiceLimit - measuredSpanMm);

  // --- slack ---
  const targetMidMm = (spec.minMm + spec.maxMm) / 2;
  let slackStatus;
  if (measuredSlackMm < spec.minMm) slackStatus = "too tight";
  else if (measuredSlackMm > spec.maxMm) slackStatus = "too loose";
  else slackStatus = "in range";
  const slackAdjustMm = targetMidMm - measuredSlackMm;

  // --- lubrication ---
  const baseInterval = sealedChain ? LUBE_INTERVAL_KM.sealed : LUBE_INTERVAL_KM.standard;
  const lubeIntervalKm = harshConditions ? baseInterval * HARSH_CONDITION_FACTOR : baseInterval;
  const kmSinceLube = currentOdo - lastLubeOdo;
  const nextLubeAtOdo = lastLubeOdo + lubeIntervalKm;
  const kmToNextLube = nextLubeAtOdo - currentOdo;
  const lubeOverdue = kmToNextLube < 0;
  const lubeDuePct = (kmSinceLube / lubeIntervalKm) * 100;
  const nextSlackCheckAtOdo = lastLubeOdo + Math.min(lubeIntervalKm, SLACK_CHECK_INTERVAL_KM);

  // --- headline verdict ---
  let verdict;
  let tone;
  if (wearStatus === "replace") {
    verdict = `Chain is past the ${WEAR_REPLACE_PCT}% service limit — replace it with both sprockets`;
    tone = "danger";
  } else if (slackStatus === "too tight") {
    verdict = "Chain is too tight — slacken it before you ride, this is the setting that breaks things";
    tone = "danger";
  } else if (slackStatus === "too loose" || lubeOverdue || wearStatus === "monitor") {
    verdict = "Needs attention before the next long ride";
    tone = "warn";
  } else {
    verdict = "Chain is set correctly and in date";
    tone = "success";
  }

  const notes = [];
  notes.push(
    `A new ${size.label} chain measures ${nominal.toFixed(1)} mm across ${LINKS_MEASURED} links (pitch ${size.pitchMm} mm); the service limit is ${spanAtServiceLimit.toFixed(1)} mm.`,
  );
  if (slackStatus !== "in range") {
    notes.push(
      `${slackAdjustMm > 0 ? "Loosen" : "Tighten"} the adjusters until free play reads about ${targetMidMm} mm — a ${Math.abs(slackAdjustMm).toFixed(0)} mm change from where it is now.`,
    );
  }
  if (slackStatus === "too tight") {
    notes.push(
      "An over-tight chain loads the gearbox output shaft bearing every time the suspension compresses, and leaves nothing in reserve when the swingarm reaches the point of maximum chain run — err loose, never tight.",
    );
  }
  if (wearStatus === "monitor") {
    notes.push(
      `At ${elongationPct.toFixed(2)}% elongation you have roughly ${mmLeftToLimit.toFixed(1)} mm of measurement left before the limit. Check tight spots by rotating the wheel — an unevenly worn chain must go even if the average looks fine.`,
    );
  }
  if (lubeOverdue) {
    notes.push(
      `Lube is overdue by ${Math.abs(Math.round(kmToNextLube))} km. Clean first with paraffin or a chain cleaner and a soft brush, never a wire brush or petrol on a sealed chain, then lube the inside run of the lower stretch while the chain is warm.`,
    );
  } else {
    notes.push(
      `Next clean and lube at ${Math.round(nextLubeAtOdo).toLocaleString("en-IN")} km — ${Math.round(kmToNextLube).toLocaleString("en-IN")} km away — and re-check free play at the same time.`,
    );
  }
  if (harshConditions) {
    notes.push(
      "Wet, dusty or coastal riding halves the interval here, and any ride through rain should be followed by a clean and lube regardless of the odometer.",
    );
  }

  return {
    size,
    spec,
    nominal,
    elongationMm,
    elongationPct,
    wearStatus,
    wearUsedPct,
    spanAtServiceLimit,
    mmLeftToLimit,
    targetMidMm,
    slackStatus,
    slackAdjustMm,
    lubeIntervalKm,
    kmSinceLube,
    nextLubeAtOdo,
    kmToNextLube,
    lubeOverdue,
    lubeDuePct,
    nextSlackCheckAtOdo,
    verdict,
    tone,
    notes,
  };
}
