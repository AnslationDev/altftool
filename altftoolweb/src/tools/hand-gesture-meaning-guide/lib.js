/**
 * Cross-cultural hand gesture reference.
 *
 * The tool is a lookup over a fixed matrix of gesture x cultural region.
 * Every cell records what the gesture is read as in that region and how risky
 * it is to use. Where a region is not listed for a gesture, the gesture's
 * default (broadly Western / international) reading applies.
 *
 * Sourcing note: the entries below describe widely documented etiquette
 * conventions reported in travel-etiquette and intercultural-communication
 * literature (for example Desmond Morris's gesture-mapping work and the
 * standard destination etiquette briefings used by tour operators). They are
 * generalisations about a region, not rules about any individual, and customs
 * shift between generations and between cities and villages.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Ordered from most to least serious. The weight drives the risk index. */
export const RISK_LEVELS = {
  offensive: { id: "offensive", label: "Offensive", rank: 3, weight: 2 },
  caution: { id: "caution", label: "Means something else", rank: 2, weight: 1 },
  safe: { id: "safe", label: "Reads as intended", rank: 1, weight: 0 },
};

/** Maximum weight any single gesture can contribute to the risk index. */
export const MAX_RISK_WEIGHT = RISK_LEVELS.offensive.weight;

/** Cultural regions grouped by shared gesture conventions rather than by
 * geography alone — Greece and Turkey sit apart from their neighbours because
 * several gestures are read very differently there. */
export const REGIONS = [
  {
    id: "north-america",
    label: "North America",
    countries: "United States, Canada",
  },
  {
    id: "uk-ireland-anz",
    label: "UK, Ireland, Australia, NZ, South Africa",
    countries: "United Kingdom, Ireland, Australia, New Zealand, South Africa",
  },
  {
    id: "france-benelux",
    label: "France & the Benelux",
    countries: "France, Belgium, Netherlands, Luxembourg",
  },
  {
    id: "italy",
    label: "Italy & Malta",
    countries: "Italy, Malta, San Marino",
  },
  {
    id: "greece",
    label: "Greece & Cyprus",
    countries: "Greece, Cyprus",
  },
  {
    id: "iberia",
    label: "Spain & Portugal",
    countries: "Spain, Portugal",
  },
  {
    id: "russia-east-europe",
    label: "Russia & Eastern Europe",
    countries: "Russia, Ukraine, Bulgaria, Serbia, Romania",
  },
  {
    id: "turkey",
    label: "Turkey",
    countries: "Turkey",
  },
  {
    id: "middle-east",
    label: "Middle East & the Gulf",
    countries: "Saudi Arabia, UAE, Qatar, Kuwait, Iraq, Iran, Jordan, Egypt",
  },
  {
    id: "india-subcontinent",
    label: "Indian subcontinent",
    countries: "India, Pakistan, Bangladesh, Nepal, Sri Lanka",
  },
  {
    id: "buddhist-southeast-asia",
    label: "Thailand, Laos, Cambodia, Myanmar",
    countries: "Thailand, Laos, Cambodia, Myanmar",
  },
  {
    id: "maritime-southeast-asia",
    label: "Indonesia, Malaysia, Philippines",
    countries: "Indonesia, Malaysia, Philippines, Brunei, Singapore",
  },
  {
    id: "vietnam",
    label: "Vietnam",
    countries: "Vietnam",
  },
  {
    id: "east-asia",
    label: "Japan, Korea, China",
    countries: "Japan, South Korea, China, Taiwan",
  },
  {
    id: "brazil",
    label: "Brazil",
    countries: "Brazil",
  },
  {
    id: "spanish-latin-america",
    label: "Spanish-speaking Latin America",
    countries: "Mexico, Colombia, Venezuela, Argentina, Chile, Peru",
  },
  {
    id: "west-africa",
    label: "West Africa",
    countries: "Nigeria, Ghana, Senegal, Liberia, Côte d'Ivoire",
  },
];

/**
 * The gesture matrix.
 * `defaultRisk` / `defaultMeaning` apply to any region not named in `byRegion`.
 */
export const GESTURES = [
  {
    id: "thumbs-up",
    name: "Thumbs up",
    howItLooks: "Fist closed, thumb pointing straight up.",
    defaultRisk: "safe",
    defaultMeaning: "Approval — 'good', 'yes', 'all set'. The most widely understood positive sign.",
    alternative: "Say the word, nod, or give an open-palm wave with a smile.",
    byRegion: {
      "middle-east": {
        risk: "offensive",
        meaning:
          "Traditionally a crude insult on a par with the middle finger, especially in Iraq and Iran. Younger, more internationally exposed speakers read it as approval, but older people may not.",
      },
      "west-africa": {
        risk: "offensive",
        meaning: "Read as an insult in several West African countries rather than as praise.",
      },
      greece: {
        risk: "caution",
        meaning:
          "Can land as a rude 'up yours' with older Greeks, because it belongs to the same family of thrusting insults as the moútza.",
      },
      italy: {
        risk: "caution",
        meaning:
          "Fine in most of Italy, but historically rude in Sardinia and parts of the south.",
      },
      "france-benelux": {
        risk: "caution",
        meaning:
          "Not rude, but counting starts on the thumb — holding up a thumb at a bar orders one drink, and adding the index finger orders two, not one.",
      },
      "east-asia": {
        risk: "caution",
        meaning:
          "Understood as approval, though in Japanese finger-counting the thumb is five, and it has also been used to mean 'boyfriend'.",
      },
    },
  },
  {
    id: "ok-ring",
    name: "OK sign (thumb and index in a ring)",
    howItLooks: "Thumb and index fingertip touching in a circle, other three fingers raised.",
    defaultRisk: "safe",
    defaultMeaning: "'Fine', 'correct', 'perfect'.",
    alternative: "Say 'that's right', give a thumbs-up where that is safe, or a simple nod.",
    byRegion: {
      brazil: {
        risk: "offensive",
        meaning: "An obscene reference to the anus — roughly as rude as the middle finger.",
      },
      turkey: {
        risk: "offensive",
        meaning: "Obscene, and also used as a slur about someone's sexuality.",
      },
      greece: {
        risk: "offensive",
        meaning: "Read as a vulgar insult rather than approval.",
      },
      "russia-east-europe": {
        risk: "offensive",
        meaning: "Treated as a crude bodily insult.",
      },
      "spanish-latin-america": {
        risk: "offensive",
        meaning:
          "Obscene in Venezuela and offensive in parts of Colombia and Mexico; safest to avoid across the region.",
      },
      "france-benelux": {
        risk: "caution",
        meaning:
          "Means zero or 'worthless'. Telling a chef the meal was 'OK' this way says the food was nothing.",
      },
      "east-asia": {
        risk: "caution",
        meaning: "In Japan the ring shape stands for a coin, so it commonly reads as 'money'.",
      },
      "middle-east": {
        risk: "caution",
        meaning: "In some Gulf usage it signals a threat or the evil eye rather than approval.",
      },
      "north-america": {
        risk: "caution",
        meaning:
          "Still means 'fine' in everyday use, but since 2017 the sign has also been circulated online as an extremist in-joke, so it can be misread in photographs.",
      },
    },
  },
  {
    id: "v-sign-palm-in",
    name: "V sign with the palm turned inward",
    howItLooks: "Index and middle finger raised in a V, back of the hand facing the other person.",
    defaultRisk: "safe",
    defaultMeaning: "Peace or victory; in East Asia it is the standard photo pose.",
    alternative: "Turn your palm outward, or use a thumbs-up where that is safe.",
    byRegion: {
      "uk-ireland-anz": {
        risk: "offensive",
        meaning:
          "Palm inward it is the two-fingered salute — as insulting as the middle finger. Palm outward is peace and perfectly fine.",
      },
    },
  },
  {
    id: "beckon-index",
    name: "Beckoning with a curled index finger",
    howItLooks: "Palm up, index finger curling toward you to say 'come here'.",
    defaultRisk: "safe",
    defaultMeaning: "'Come here' — casual and unremarkable.",
    alternative:
      "Hold the whole hand out palm down and scoop all four fingers toward yourself — the standard summoning gesture across Asia.",
    byRegion: {
      "maritime-southeast-asia": {
        risk: "offensive",
        meaning:
          "In the Philippines this is how you call a dog; using it on a person is a serious insult and has been reported as grounds for arrest.",
      },
      "east-asia": {
        risk: "offensive",
        meaning: "Demeaning — reserved for animals, not people.",
      },
      "india-subcontinent": {
        risk: "caution",
        meaning: "Curt and slightly rude toward anyone who is not a child.",
      },
      "spanish-latin-america": {
        risk: "caution",
        meaning: "Reads as summoning an animal or a subordinate.",
      },
    },
  },
  {
    id: "point-index",
    name: "Pointing with the index finger",
    howItLooks: "Arm out, index finger aimed at a person or object.",
    defaultRisk: "caution",
    defaultMeaning:
      "Fine for directions and objects; pointing at a person is considered rude almost everywhere.",
    alternative:
      "Indicate with the whole open hand, palm up. In Indonesia and Malaysia use the right thumb with the fingers folded.",
    byRegion: {
      "maritime-southeast-asia": {
        risk: "offensive",
        meaning: "Openly rude; the polite form is a right thumb, never the index finger.",
      },
      "middle-east": { risk: "caution", meaning: "Aggressive when aimed at a person." },
      "west-africa": { risk: "caution", meaning: "Confrontational when directed at someone." },
      "east-asia": { risk: "caution", meaning: "Impolite; an open hand is expected." },
      "north-america": { risk: "safe", meaning: "Normal for objects and directions." },
      "uk-ireland-anz": { risk: "safe", meaning: "Normal for objects and directions." },
    },
  },
  {
    id: "touch-head",
    name: "Touching or patting someone's head",
    howItLooks: "Ruffling a child's hair or patting an adult on the head.",
    defaultRisk: "caution",
    defaultMeaning: "Affectionate toward children, presumptuous toward adults.",
    alternative:
      "Do not touch anyone's head, children included. A smile, a wai or a namaste conveys the same warmth.",
    byRegion: {
      "buddhist-southeast-asia": {
        risk: "offensive",
        meaning:
          "The head is the most sacred part of the body in Thai, Lao, Khmer and Burmese custom. Touching it — even a child's — is a real offence, not a minor slip.",
      },
      "india-subcontinent": {
        risk: "offensive",
        meaning:
          "The head carries the same sacred association, strongly so in Sri Lanka and Nepal.",
      },
    },
  },
  {
    id: "show-sole",
    name: "Showing the sole of your foot or shoe",
    howItLooks: "Crossing your legs so a sole faces someone, or propping feet on furniture.",
    defaultRisk: "caution",
    defaultMeaning: "Casual in much of Europe and the Americas, careless-looking in formal settings.",
    alternative:
      "Keep both feet on the floor, or cross at the ankle so the sole points down. Never move anything with your foot.",
    byRegion: {
      "middle-east": {
        risk: "offensive",
        meaning:
          "The foot is the lowest and least clean part of the body; showing its sole is a deliberate insult.",
      },
      "buddhist-southeast-asia": {
        risk: "offensive",
        meaning:
          "Deeply rude, and pointing your feet at a Buddha image or a monk is worse still.",
      },
      "india-subcontinent": {
        risk: "offensive",
        meaning:
          "Offensive, and touching a person or a book with your foot calls for an apology.",
      },
      turkey: { risk: "offensive", meaning: "Read as a direct insult." },
    },
  },
  {
    id: "left-hand",
    name: "Using the left hand to eat, give or receive",
    howItLooks: "Handing over money, a card or food with the left hand.",
    defaultRisk: "safe",
    defaultMeaning: "No meaning at all in Europe or the Americas.",
    alternative:
      "Use the right hand, or both hands together — two hands is the most respectful form in much of Asia.",
    byRegion: {
      "middle-east": {
        risk: "offensive",
        meaning: "The left hand is reserved for washing, so it is unclean for food and greetings.",
      },
      "india-subcontinent": {
        risk: "offensive",
        meaning: "The same convention applies; eat and hand things over with the right hand.",
      },
      "west-africa": {
        risk: "offensive",
        meaning: "Handing something over left-handed reads as an insult.",
      },
      "maritime-southeast-asia": {
        risk: "offensive",
        meaning: "Left-handed giving and eating is avoided in Indonesia, Malaysia and Brunei.",
      },
    },
  },
  {
    id: "corna-horns",
    name: "Horns / 'rock on' (index and little finger up)",
    howItLooks: "Index and little finger extended, middle two folded under the thumb.",
    defaultRisk: "safe",
    defaultMeaning: "A rock-concert salute; in southern Italy, pointed downward, a charm against the evil eye.",
    alternative: "Applaud, or give a thumbs-up where that reads safely.",
    byRegion: {
      italy: {
        risk: "offensive",
        meaning:
          "Aimed at a person it calls him a cornuto — a man whose partner is unfaithful. A serious insult.",
      },
      iberia: {
        risk: "offensive",
        meaning: "Carries the same 'your partner is cheating' meaning in Spain and Portugal.",
      },
      brazil: { risk: "offensive", meaning: "Read as the cuckold insult when aimed at someone." },
      "spanish-latin-america": {
        risk: "offensive",
        meaning: "The cuckold reading is standard in Colombia and much of the region.",
      },
    },
  },
  {
    id: "fig-sign",
    name: "Fig sign (thumb between index and middle finger)",
    howItLooks: "Fist closed with the thumb pushed out between the first two fingers.",
    defaultRisk: "caution",
    defaultMeaning: "A charm in some countries, an obscenity in others — there is no neutral middle.",
    alternative: "Wish someone luck out loud instead of gesturing.",
    byRegion: {
      iberia: { risk: "safe", meaning: "The figa — a good-luck and anti-evil-eye charm in Portugal." },
      brazil: { risk: "safe", meaning: "A good-luck charm, sold as jewellery." },
      turkey: { risk: "offensive", meaning: "An explicit obscenity." },
      greece: { risk: "offensive", meaning: "An explicit obscenity." },
      "russia-east-europe": {
        risk: "offensive",
        meaning: "Means a flat, mocking refusal — 'you get nothing'.",
      },
      "maritime-southeast-asia": { risk: "offensive", meaning: "Obscene in Indonesia." },
    },
  },
  {
    id: "moutza-open-palm",
    name: "Open palm pushed toward someone (moútza)",
    howItLooks: "All five fingers spread, palm thrust forward at arm's length.",
    defaultRisk: "caution",
    defaultMeaning: "Usually reads as 'stop' — but the thrust is what makes it rude, not the shape.",
    alternative:
      "Wave with the palm turned side-on and the fingers together, and keep the hand close rather than thrusting it.",
    byRegion: {
      greece: {
        risk: "offensive",
        meaning:
          "The moútza is one of the strongest insults in Greece. Waving at someone with a flat open palm can be mistaken for it.",
      },
      "west-africa": { risk: "offensive", meaning: "Read as a deliberate insult in Nigeria." },
      "india-subcontinent": {
        risk: "caution",
        meaning: "In Pakistan a spread palm is used as an insult in some contexts.",
      },
    },
  },
  {
    id: "crossed-fingers",
    name: "Crossed fingers",
    howItLooks: "Middle finger crossed over the index finger.",
    defaultRisk: "safe",
    defaultMeaning: "Wishing for luck.",
    alternative: "Say 'good luck' — no gesture needed.",
    byRegion: {
      vietnam: {
        risk: "offensive",
        meaning: "Read as a crude reference to female genitalia.",
      },
    },
  },
  {
    id: "chin-flick",
    name: "Chin flick",
    howItLooks: "Backs of the fingers brushed forward from under the chin.",
    defaultRisk: "safe",
    defaultMeaning: "Meaningless in most countries.",
    alternative: "There is no polite version — simply do not use it.",
    byRegion: {
      italy: { risk: "offensive", meaning: "'Get lost' or 'I couldn't care less'." },
      "france-benelux": { risk: "offensive", meaning: "A dismissive brush-off in Belgium." },
      "middle-east": { risk: "offensive", meaning: "A dismissive insult in Tunisia and nearby." },
    },
  },
  {
    id: "nod-and-shake",
    name: "Nodding for yes, shaking for no",
    howItLooks: "Head moved up and down, or side to side.",
    defaultRisk: "safe",
    defaultMeaning: "Nod means yes, shake means no.",
    alternative: "Add the word — say 'yes' or 'no' as well as moving your head.",
    byRegion: {
      "russia-east-europe": {
        risk: "caution",
        meaning:
          "Bulgarians traditionally nod for no and shake for yes, so the two can be exactly reversed.",
      },
      "india-subcontinent": {
        risk: "caution",
        meaning:
          "The side-to-side head wobble usually means 'yes, understood' or 'fine' — not refusal.",
      },
      greece: {
        risk: "caution",
        meaning:
          "A single upward tilt of the head with raised eyebrows, sometimes with a tongue click, means no.",
      },
    },
  },
  {
    id: "snap-for-service",
    name: "Snapping, clicking or whistling for a waiter",
    howItLooks: "Fingers snapped, or a whistle, to get staff attention.",
    defaultRisk: "caution",
    defaultMeaning: "Reads as summoning rather than asking.",
    alternative: "Catch the server's eye and raise a hand, or say 'excuse me' as they pass.",
    byRegion: {
      "france-benelux": { risk: "offensive", meaning: "Openly rude; expect to be ignored." },
      italy: { risk: "offensive", meaning: "Treated as contemptuous." },
      greece: { risk: "offensive", meaning: "Treated as contemptuous." },
      iberia: { risk: "offensive", meaning: "Treated as contemptuous." },
    },
  },
  {
    id: "wink",
    name: "Winking",
    howItLooks: "Closing one eye at someone.",
    defaultRisk: "safe",
    defaultMeaning: "Playful or conspiratorial.",
    alternative: "A smile carries the same warmth with none of the ambiguity.",
    byRegion: {
      "india-subcontinent": {
        risk: "offensive",
        meaning: "Read as flirtation or as rude, particularly toward a woman.",
      },
      "middle-east": { risk: "offensive", meaning: "Read as an improper advance." },
      "east-asia": {
        risk: "caution",
        meaning: "Uncommon between strangers and easily read as flirting.",
      },
    },
  },
  {
    id: "middle-finger",
    name: "Middle finger",
    howItLooks: "Middle finger raised alone.",
    defaultRisk: "offensive",
    defaultMeaning: "Obscene essentially everywhere it is recognised — there is no local reading that makes it acceptable.",
    alternative: "None.",
    byRegion: {},
  },
];

const REGION_BY_ID = new Map(REGIONS.map((region) => [region.id, region]));
const GESTURE_BY_ID = new Map(GESTURES.map((gesture) => [gesture.id, gesture]));

/** @returns {object|null} */
export function getRegion(regionId) {
  return REGION_BY_ID.get(regionId) ?? null;
}

/** @returns {object|null} */
export function getGesture(gestureId) {
  return GESTURE_BY_ID.get(gestureId) ?? null;
}

/**
 * How a single gesture reads in a single region.
 * @returns {{ gestureId: string, gestureName: string, regionId: string, risk: string,
 *             meaning: string, alternative: string, isRegionSpecific: boolean } | { error: string }}
 */
export function assessGestureInRegion(gestureId, regionId) {
  const gesture = GESTURE_BY_ID.get(gestureId);
  if (!gesture) return { error: "That gesture is not in the guide." };
  const region = REGION_BY_ID.get(regionId);
  if (!region) return { error: "That destination is not in the guide." };

  const cell = gesture.byRegion[regionId];
  return {
    gestureId: gesture.id,
    gestureName: gesture.name,
    howItLooks: gesture.howItLooks,
    regionId: region.id,
    regionLabel: region.label,
    risk: cell ? cell.risk : gesture.defaultRisk,
    meaning: cell ? cell.meaning : gesture.defaultMeaning,
    alternative: gesture.alternative,
    isRegionSpecific: Boolean(cell),
  };
}

function riskRank(risk) {
  return RISK_LEVELS[risk] ? RISK_LEVELS[risk].rank : RISK_LEVELS.safe.rank;
}

/**
 * Combined briefing for an itinerary of one or more regions.
 * Each gesture is reported at its worst reading across the selected regions.
 *
 * riskIndexPercent = sum(worst-case weight per gesture) / (2 * gesture count) * 100,
 * where offensive = 2, means-something-else = 1, reads-as-intended = 0. It is a
 * relative measure of how much of this guide actually applies to the trip.
 *
 * @param {string[]} regionIds
 * @returns {object | { error: string }}
 */
export function buildTripBriefing(regionIds) {
  if (!Array.isArray(regionIds)) {
    return { error: "Pick at least one destination to build a briefing." };
  }
  const regions = [];
  for (const id of regionIds) {
    const region = REGION_BY_ID.get(id);
    if (!region) return { error: `Unknown destination: ${String(id)}.` };
    if (!regions.some((existing) => existing.id === region.id)) regions.push(region);
  }
  if (regions.length === 0) {
    return { error: "Pick at least one destination to build a briefing." };
  }

  const entries = GESTURES.map((gesture) => {
    let worst = { risk: "safe", meaning: gesture.defaultMeaning, regionLabel: null };
    const readings = regions.map((region) => {
      const cell = gesture.byRegion[region.id];
      const risk = cell ? cell.risk : gesture.defaultRisk;
      const meaning = cell ? cell.meaning : gesture.defaultMeaning;
      if (riskRank(risk) > riskRank(worst.risk)) {
        worst = { risk, meaning, regionLabel: region.label };
      }
      return { regionId: region.id, regionLabel: region.label, risk, meaning };
    });

    const flaggedIn = readings
      .filter((reading) => reading.risk !== "safe")
      .map((reading) => reading.regionLabel);

    return {
      id: gesture.id,
      name: gesture.name,
      howItLooks: gesture.howItLooks,
      alternative: gesture.alternative,
      risk: worst.risk,
      meaning: worst.meaning,
      flaggedIn,
      readings,
    };
  });

  const counts = { offensive: 0, caution: 0, safe: 0 };
  let weight = 0;
  for (const entry of entries) {
    counts[entry.risk] += 1;
    weight += RISK_LEVELS[entry.risk].weight;
  }

  const maxWeight = MAX_RISK_WEIGHT * entries.length;
  const riskIndexPercent = maxWeight === 0 ? 0 : Math.round((weight / maxWeight) * 1000) / 10;

  const sorted = entries
    .slice()
    .sort((a, b) => riskRank(b.risk) - riskRank(a.risk) || a.name.localeCompare(b.name));

  return {
    regions,
    entries: sorted,
    counts,
    gestureCount: entries.length,
    avoidCount: counts.offensive + counts.caution,
    riskIndexPercent,
  };
}

/**
 * Every region where a given gesture is not simply read as intended.
 * @returns {object | { error: string }}
 */
export function buildGestureBriefing(gestureId) {
  const gesture = GESTURE_BY_ID.get(gestureId);
  if (!gesture) return { error: "That gesture is not in the guide." };

  const readings = REGIONS.map((region) => {
    const cell = gesture.byRegion[region.id];
    return {
      regionId: region.id,
      regionLabel: region.label,
      countries: region.countries,
      risk: cell ? cell.risk : gesture.defaultRisk,
      meaning: cell ? cell.meaning : gesture.defaultMeaning,
    };
  }).sort((a, b) => riskRank(b.risk) - riskRank(a.risk) || a.regionLabel.localeCompare(b.regionLabel));

  const counts = { offensive: 0, caution: 0, safe: 0 };
  for (const reading of readings) counts[reading.risk] += 1;

  return {
    gesture: {
      id: gesture.id,
      name: gesture.name,
      howItLooks: gesture.howItLooks,
      alternative: gesture.alternative,
      defaultMeaning: gesture.defaultMeaning,
    },
    readings,
    counts,
    offensiveRegions: readings.filter((r) => r.risk === "offensive").map((r) => r.regionLabel),
  };
}
