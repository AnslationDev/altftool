/**
 * International roaming privacy comparison — home roaming vs travel eSIM vs local SIM vs Wi-Fi only.
 *
 * What the model encodes is how mobile networks actually work, not marketing claims:
 *
 *  - Every SIM, eSIM or roaming device registers with the visited network, so the local
 *    operator always learns which cells you use. Changing SIM changes WHO holds that record,
 *    never whether the record exists.
 *  - While you roam, your home operator also sees your location at country and network
 *    level, because inter-operator signalling (SS7 / Diameter) has to route calls and SMS
 *    to wherever you have registered.
 *  - The IMEI is a property of the handset, not the SIM. Swapping to a local SIM presents
 *    the same device identifier to the new network.
 *  - Prepaid SIM registration is mandatory in most countries — India, Spain, Germany, Italy,
 *    Thailand, the UAE and many more require a passport or national ID before activation —
 *    so "buy a local SIM to stay anonymous" is false in most destinations.
 *  - Consumer travel eSIMs are overwhelmingly DATA-ONLY: they carry no voice and no SMS, so
 *    they cannot receive a bank OTP. Only a line that keeps your home number can do that.
 *  - Turning the cellular radio off is the only setting that stops the location trail, and
 *    it moves the exposure to whichever Wi-Fi you join instead. A VPN relocates trust to the
 *    VPN operator; it does not remove it.
 *
 * Ratings are 1-5 (5 = better on that dimension) and are consistent editorial judgements
 * about the mechanics above. Importance weights come from the user. Pure module: no React,
 * no DOM, no clocks.
 */

/** Importance is 0 (do not care) to 3 (critical). */
export const MIN_IMPORTANCE = 0;
export const MAX_IMPORTANCE = 3;
export const MAX_RATING = 5;

export const DIMENSIONS = [
  {
    id: "otpAccess",
    label: "Keep receiving OTPs on my home number",
    hint: "Indian bank, UPI and government OTPs go to the registered home number and nowhere else.",
  },
  {
    id: "identityMinimisation",
    label: "Hand over as little new identity data as possible",
    hint: "Every new line means a new organisation holding a passport scan or a payment card linked to your movements.",
  },
  {
    id: "costControl",
    label: "Predictable, capped spending",
    hint: "Pay-as-you-go roaming is where bill shock comes from; prepaid plans cannot overrun.",
  },
  {
    id: "coverage",
    label: "Works on landing and across borders",
    hint: "Matters most for multi-country trips and for arriving after the airport kiosks have shut.",
  },
  {
    id: "simplicity",
    label: "Nothing to set up or queue for",
    hint: "Setup friction is what makes people abandon the safer option halfway through a trip.",
  },
];

/**
 * keepsHomeNumber:
 *   "always"        – the home line stays registered, so SMS OTPs arrive.
 *   "with-dual-sim" – only if the handset can run this line alongside the home line.
 *   "never"         – the cellular radio is off; no SMS can arrive at all.
 */
export const OPTIONS = [
  {
    id: "home-roaming",
    label: "Home SIM on international roaming",
    keepsHomeNumber: "always",
    needsEsim: false,
    needsUnlocked: false,
    ratings: { identityMinimisation: 5, costControl: 2, coverage: 4, simplicity: 5 },
    pros: [
      "No new organisation gets your identity documents — your home operator already has them.",
      "Your number keeps working for OTPs, two-factor SMS and anyone calling the number they know.",
      "Nothing to install; it works the moment the plane lands.",
    ],
    cons: [
      "Pay-as-you-go roaming is the classic source of bill shock; buy a defined roaming pack before you fly.",
      "Your home operator has a country-by-country record of the trip, and shares signalling with every visited network.",
      "Some operators disable international roaming by default, so it has to be switched on in advance.",
    ],
  },
  {
    id: "travel-esim",
    label: "Prepaid travel eSIM for data",
    keepsHomeNumber: "with-dual-sim",
    needsEsim: true,
    needsUnlocked: true,
    ratings: { identityMinimisation: 3, costControl: 5, coverage: 4, simplicity: 3 },
    pros: [
      "Prepaid and capped, so there is no bill to argue about afterwards.",
      "Regional plans span many countries, which suits multi-stop trips.",
      "Installed before departure, so you are online before you reach immigration.",
    ],
    cons: [
      "Almost all consumer travel eSIMs are data-only — no voice, no SMS, so no bank OTPs.",
      "The reseller holds an account, a payment method and a record of every country you activate in.",
      "Needs an eSIM-capable, carrier-unlocked handset, and the QR code must be installed while you still have internet.",
    ],
  },
  {
    id: "local-sim",
    label: "Local physical SIM bought at the destination",
    keepsHomeNumber: "with-dual-sim",
    needsEsim: false,
    needsUnlocked: true,
    ratings: { identityMinimisation: 1, costControl: 4, coverage: 2, simplicity: 2 },
    pros: [
      "Local rates are usually the cheapest per gigabyte for a long stay in one country.",
      "Gives you a local number, which some delivery, banking and ride-hailing apps insist on.",
      "Good domestic coverage, since you are on the home network rather than a roaming partner.",
    ],
    cons: [
      "Prepaid registration requires a passport in most countries, so it links your travel documents to a local carrier's database.",
      "Only useful in one country; a multi-country trip means repeating the process at each border.",
      "Your home SIM has to come out unless the handset takes two lines, and a loose SIM is easy to lose.",
    ],
  },
  {
    id: "wifi-only",
    label: "Cellular off — Wi-Fi only, with a VPN",
    keepsHomeNumber: "never",
    needsEsim: false,
    needsUnlocked: false,
    ratings: { identityMinimisation: 5, costControl: 5, coverage: 1, simplicity: 3 },
    pros: [
      "The only option that stops the cell-by-cell location trail, because the radio is off.",
      "Costs nothing and cannot generate a roaming bill.",
      "App-based push two-factor still works whenever you are on Wi-Fi.",
    ],
    cons: [
      "No SMS at all, so any account that only sends codes by text becomes unreachable.",
      "Nothing works between hotspots — no maps, no ride-hailing, no calls in an emergency.",
      "Shifts the risk to hotel, café and airport networks; a VPN moves that trust to the VPN provider rather than removing it.",
    ],
  },
];

/** Facts that hold no matter which option you pick. */
export const RESIDUAL_EXPOSURE = [
  "The visited network logs which cells your handset used, whichever SIM is in it.",
  "Your handset's IMEI is presented to every network you attach to; changing SIM does not change it.",
  "While you roam, your home operator can see the country and network you registered on.",
  "Apps keep reporting location over any data connection, including a travel eSIM or hotel Wi-Fi.",
  "Airline, hotel and card records already place you in the country, independently of your phone.",
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

function otpRating(option, dualSim) {
  if (option.keepsHomeNumber === "always") return 5;
  if (option.keepsHomeNumber === "with-dual-sim") return dualSim ? 5 : 1;
  return 1;
}

/**
 * Compare the four connectivity options for one trip.
 *
 * @param {object} input
 * @param {number}  input.tripDays        Nights away, 1-365.
 * @param {number}  input.dataGb          Data you expect to use over the whole trip.
 * @param {number}  input.countries       Number of countries on the itinerary.
 * @param {boolean} input.mustKeepHomeNumber  True if bank or work OTPs go to the home number.
 * @param {boolean} input.hasEsim         Handset supports eSIM.
 * @param {boolean} input.dualSim         Handset can run two lines at once.
 * @param {boolean} input.unlocked        Handset is not carrier-locked.
 * @param {object}  input.importance      { [dimensionId]: 0-3 }
 * @returns {object} comparison, or { error } when the input cannot be used.
 */
export function compareConnectivity({
  tripDays,
  dataGb,
  countries,
  mustKeepHomeNumber,
  hasEsim,
  dualSim,
  unlocked,
  importance,
}) {
  if (!isFiniteNumber(tripDays)) return { error: "Enter the trip length as a plain number of days." };
  if (tripDays < 1 || tripDays > 365) return { error: "Trip length should be between 1 and 365 days." };
  if (!isFiniteNumber(dataGb)) return { error: "Enter the expected data use as a plain number." };
  if (dataGb < 0 || dataGb > 2000) return { error: "Expected data should be between 0 and 2000 GB." };
  if (!isFiniteNumber(countries)) return { error: "Enter the number of countries as a plain number." };
  if (countries < 1 || countries > 50) return { error: "Number of countries should be between 1 and 50." };
  if (!importance || typeof importance !== "object") {
    return { error: "Importance weights must be supplied." };
  }

  const weights = {};
  let weightTotal = 0;
  for (const dimension of DIMENSIONS) {
    const value = importance[dimension.id];
    if (!isFiniteNumber(value)) return { error: `Set an importance for "${dimension.label}".` };
    if (value < MIN_IMPORTANCE || value > MAX_IMPORTANCE) {
      return { error: `Importance must be between ${MIN_IMPORTANCE} and ${MAX_IMPORTANCE}.` };
    }
    weights[dimension.id] = value;
    weightTotal += value;
  }
  if (weightTotal === 0) {
    return { error: "Give at least one priority an importance above zero, or nothing can be ranked." };
  }

  const maxScore = weightTotal * MAX_RATING;
  const dailyGb = dataGb / tripDays;
  const multiCountry = countries > 1;

  const scored = OPTIONS.map((option) => {
    const ratings = {
      ...option.ratings,
      otpAccess: otpRating(option, Boolean(dualSim)),
    };

    // Coverage penalty for a single-country line on a multi-country itinerary.
    if (multiCountry && option.id === "local-sim") {
      ratings.coverage = 1;
    }

    let raw = 0;
    for (const dimension of DIMENSIONS) raw += weights[dimension.id] * ratings[dimension.id];
    const fitPercent = Math.round((raw / maxScore) * 100);

    const blockers = [];
    if (option.needsEsim && !hasEsim) blockers.push("Your handset does not support eSIM.");
    if (option.needsUnlocked && !unlocked) blockers.push("Your handset is carrier-locked.");
    if (mustKeepHomeNumber && ratings.otpAccess < 5) {
      blockers.push(
        option.keepsHomeNumber === "never"
          ? "The cellular radio is off, so SMS OTPs cannot arrive."
          : "This replaces your home line, and your handset cannot run two lines at once.",
      );
    }

    return {
      id: option.id,
      label: option.label,
      ratings,
      raw,
      fitPercent,
      blocked: blockers.length > 0,
      blockers,
      pros: option.pros,
      cons: option.cons,
    };
  });

  const available = scored.filter((option) => !option.blocked);
  const ordered = [...available].sort(
    (a, b) =>
      b.fitPercent - a.fitPercent ||
      b.ratings.identityMinimisation - a.ratings.identityMinimisation ||
      a.label.localeCompare(b.label),
  );
  const blocked = scored.filter((option) => option.blocked);

  const best = ordered[0] || null;
  const runnerUp = ordered[1] || null;

  const notes = [];
  if (mustKeepHomeNumber) {
    notes.push(
      "Because you need home-number OTPs, any data line you add has to sit alongside the home line, not replace it. Keep data roaming off on the home line so it only carries SMS.",
    );
  }
  if (dailyGb > 1.5) {
    notes.push(
      `You are planning about ${dailyGb.toFixed(1)} GB a day, which is above the 1 GB/day tier most travel eSIMs are sold in — price the larger bundle before assuming it is cheap.`,
    );
  }
  if (multiCountry) {
    notes.push(
      `With ${countries} countries on the itinerary, a single-country local SIM has to be repurchased at each border, and each purchase means another ID registration.`,
    );
  }
  if (!dualSim) {
    notes.push(
      "A single-line handset forces an either/or choice between your home number and a local data line. A cheap second handset for the home SIM is often the simplest fix.",
    );
  }

  let verdict;
  if (!best) {
    verdict =
      "Every option is ruled out by your handset and OTP requirements. The usual fix is to carry a second, unlocked handset for the data line and keep the home SIM in your normal phone for SMS.";
  } else if (runnerUp && best.fitPercent - runnerUp.fitPercent <= 5) {
    verdict = `${best.label} edges ahead, but ${runnerUp.label} scores within five points — pick on the practical difference between them rather than the number.`;
  } else {
    verdict = `${best.label} fits your priorities best. Read its trade-offs below before you commit; none of these options hides your location from the network you connect to.`;
  }

  return {
    ordered,
    blocked,
    best,
    runnerUp,
    dailyGb,
    maxScore,
    weightTotal,
    notes,
    residual: RESIDUAL_EXPOSURE,
    verdict,
  };
}
