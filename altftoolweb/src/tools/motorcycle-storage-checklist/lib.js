/**
 * Preparing a motorcycle for storage.
 *
 * The checklist is generated rather than fixed, because what a bike needs
 * depends on how long it is standing, how cold it gets, what the fuel system
 * is and what chemistry the battery uses. Three parts are calculated.
 *
 * BATTERY SELF-DISCHARGE. A battery left disconnected loses charge at a rate
 * that roughly doubles for every 10 °C rise in storage temperature, which is
 * the standard Arrhenius rule of thumb applied to battery self-discharge:
 *
 *   rate at T = base rate x 2^((T - 20) / 10)
 *
 * Base rates at 20 °C are about 4% a month for a flooded lead-acid battery,
 * 2% for AGM and 2% for LiFePO4. Lead-acid sulfation accelerates once state of
 * charge falls below roughly 80%, which is the threshold used here to decide
 * whether a maintainer is needed. LiFePO4 behaves differently: it prefers to
 * sit at partial charge, it does not sulfate, and it must never be charged
 * below 0 °C, so the advice for it is to disconnect rather than to float.
 *
 * TYRE PRESSURE. A tyre standing under load for months develops a flat spot.
 * The usual measures are to raise the bike on stands so the tyres carry no
 * load, or to over-inflate. Where over-inflation is used the convention is
 * about 25% above the normal cold pressure, never above the maximum moulded on
 * the sidewall.
 *
 * FUEL. Petrol oxidises and, where it is ethanol-blended, absorbs water and
 * can phase-separate. Stabiliser is worth adding beyond about a month; a
 * carburettor's float bowls should be drained beyond about two months because
 * evaporating fuel leaves varnish that blocks the pilot jets. A steel tank is
 * best left nearly full so there is little air space for condensation.
 *
 * Everything else is a fixed sequence with the reason attached, so it can be
 * followed without needing to know why each step is there.
 */

/** Mean weeks in a calendar month: 365.25 / 12 / 7. */
export const WEEKS_PER_MONTH = 4.348;

/** State of charge below which lead-acid sulfation accelerates, percent. */
export const SULFATION_THRESHOLD_SOC = 80;

/** Self-discharge doubles for every this many °C above the reference. */
export const DISCHARGE_DOUBLING_INTERVAL_C = 10;
export const DISCHARGE_REFERENCE_C = 20;

/** Over-inflation used when a bike is stored on its tyres. */
export const STORAGE_PRESSURE_FACTOR = 1.25;

/** Beyond this many weeks, fuel stabiliser is worth adding. */
export const STABILISER_WEEKS = 4;

/** Beyond this many weeks, a carburettor's float bowls should be drained. */
export const CARB_DRAIN_WEEKS = 8;

/** Beyond this many weeks, change the oil before storing rather than after. */
export const OIL_CHANGE_WEEKS = 8;

/** Beyond this many weeks, the tyres and brake fluid need a dated check. */
export const LONG_STORAGE_WEEKS = 26;

/** Typical freeze protection of a 50/50 ethylene glycol coolant mix, °C. */
export const DEFAULT_COOLANT_PROTECTION_C = -37;

/** Battery chemistries and their self-discharge at the reference temperature. */
export const BATTERY_TYPES = [
  { id: "flooded", label: "Flooded lead-acid", monthlyDischarge: 4, sulfates: true, note: "The most self-discharge and the most to lose from sulfation. Check the electrolyte level before storing." },
  { id: "agm", label: "AGM / sealed lead-acid", monthlyDischarge: 2, sulfates: true, note: "Sealed, but still sulfates once it falls below about 80% charge." },
  { id: "lithium", label: "Lithium (LiFePO4)", monthlyDischarge: 2, sulfates: false, note: "Prefers to sit at partial charge and does not sulfate. Never charge it below 0 °C." },
];

/** Fuel systems, which change what happens to the fuel while standing. */
export const FUEL_SYSTEMS = [
  { id: "carb", label: "Carburettor", drainBowls: true, note: "Float bowls hold a small amount of fuel that evaporates and leaves varnish in the pilot jets." },
  { id: "efi", label: "Fuel injection", drainBowls: false, note: "A sealed system, so the fuel in the tank is the only concern." },
];

/** Where the bike will stand, which sets the temperature and damp exposure. */
export const LOCATIONS = [
  { id: "heated", label: "Heated indoor garage", damp: false, rodents: false, note: "The easiest case. Condensation is the only real risk if the space cycles in temperature." },
  { id: "unheated", label: "Unheated garage or shed", damp: true, rodents: true, note: "Temperature swings drive condensation onto cold metal. A breathable cover matters more than a thick one." },
  { id: "outdoor", label: "Outdoors under a cover", damp: true, rodents: true, note: "The hardest case. Raise the bike off soil or grass and never use a non-breathable tarp." },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Self-discharge rate at a storage temperature, percent per month.
 * Doubles every DISCHARGE_DOUBLING_INTERVAL_C above the reference.
 */
export function dischargeRateAt(baseMonthlyPercent, temperatureC) {
  const base = num(baseMonthlyPercent);
  const t = num(temperatureC);
  if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(t)) return null;
  return base * 2 ** ((t - DISCHARGE_REFERENCE_C) / DISCHARGE_DOUBLING_INTERVAL_C);
}

/**
 * Projected state of charge after a number of weeks, and how long it takes to
 * reach the sulfation threshold.
 */
export function projectBattery({ batteryType, weeks, temperatureC, startingSoc = 100 }) {
  const chemistry = BATTERY_TYPES.find((b) => b.id === batteryType);
  if (!chemistry) return null;
  const w = num(weeks);
  const start = num(startingSoc);
  if (!Number.isFinite(w) || w < 0 || !Number.isFinite(start) || start <= 0 || start > 100) return null;
  const rate = dischargeRateAt(chemistry.monthlyDischarge, temperatureC);
  if (rate === null) return null;
  const months = w / WEEKS_PER_MONTH;
  const projected = Math.max(0, start - rate * months);
  const weeksToThreshold =
    start <= SULFATION_THRESHOLD_SOC ? 0 : ((start - SULFATION_THRESHOLD_SOC) / rate) * WEEKS_PER_MONTH;
  return {
    chemistry: chemistry.label,
    sulfates: chemistry.sulfates,
    monthlyRate: round(rate, 2),
    months: round(months, 1),
    projectedSoc: round(projected, 1),
    weeksToThreshold: round(weeksToThreshold, 1),
    needsMaintainer: chemistry.sulfates && projected < SULFATION_THRESHOLD_SOC,
    note: chemistry.note,
  };
}

/** Storage pressure: 25% over normal cold pressure, never over the sidewall max. */
export function storagePressure(normalPsi, sidewallMaxPsi) {
  const normal = num(normalPsi);
  const max = num(sidewallMaxPsi);
  if (!Number.isFinite(normal) || normal <= 0) return null;
  const target = normal * STORAGE_PRESSURE_FACTOR;
  if (!Number.isFinite(max) || max <= 0) return round(target, 1);
  return round(Math.min(target, max), 1);
}

/**
 * Build the storage checklist.
 *
 * @param {object} input
 * @param {number} input.weeks              how long the bike will stand
 * @param {string} [input.fuelSystem]       one of FUEL_SYSTEMS ids
 * @param {boolean}[input.ethanolBlend]     is the petrol ethanol-blended
 * @param {string} [input.batteryType]      one of BATTERY_TYPES ids
 * @param {string} [input.location]         one of LOCATIONS ids
 * @param {number} [input.averageTempC]     average storage temperature
 * @param {number} [input.minimumTempC]     coldest the space is likely to get
 * @param {number} [input.frontPsi]         normal cold front tyre pressure
 * @param {number} [input.rearPsi]          normal cold rear tyre pressure
 * @param {number} [input.sidewallMaxPsi]   maximum moulded on the sidewall
 * @param {boolean}[input.useStands]        will it stand on paddock stands
 * @param {number} [input.coolantProtectionC] freeze protection of the coolant
 * @returns {object} { error } or the checklist
 */
export function buildStorageChecklist({
  weeks,
  fuelSystem = "efi",
  ethanolBlend = true,
  batteryType = "agm",
  location = "unheated",
  averageTempC = 12,
  minimumTempC = -2,
  frontPsi = 33,
  rearPsi = 36,
  sidewallMaxPsi = 42,
  useStands = false,
  coolantProtectionC = DEFAULT_COOLANT_PROTECTION_C,
} = {}) {
  const w = num(weeks);
  if (!Number.isFinite(w) || w <= 0) {
    return { error: "Enter how many weeks the bike will be standing." };
  }
  if (w > 520) {
    return { error: "Ten years of storage is beyond what a preparation checklist covers — a bike standing that long needs a full recommissioning instead." };
  }
  const fuel = FUEL_SYSTEMS.find((f) => f.id === fuelSystem);
  if (!fuel) return { error: "Choose whether the bike is carburetted or fuel injected." };
  const battery = BATTERY_TYPES.find((b) => b.id === batteryType);
  if (!battery) return { error: "Choose the battery type." };
  const place = LOCATIONS.find((l) => l.id === location);
  if (!place) return { error: "Choose where the bike will be stored." };

  const avgTemp = num(averageTempC);
  const minTemp = num(minimumTempC);
  if (!Number.isFinite(avgTemp) || avgTemp < -40 || avgTemp > 60) {
    return { error: "Average storage temperature has to be between −40 °C and 60 °C." };
  }
  if (!Number.isFinite(minTemp) || minTemp > avgTemp) {
    return { error: "The minimum temperature has to be a number no higher than the average." };
  }

  const front = num(frontPsi);
  const rear = num(rearPsi);
  const sidewall = num(sidewallMaxPsi);
  if (!Number.isFinite(front) || front <= 0 || !Number.isFinite(rear) || rear <= 0) {
    return { error: "Enter both normal cold tyre pressures in psi." };
  }
  if (Number.isFinite(sidewall) && sidewall > 0 && (sidewall < front || sidewall < rear)) {
    return { error: "The sidewall maximum is lower than a normal running pressure — check the figures." };
  }

  const coolantProtection = num(coolantProtectionC);

  const batteryPlan = projectBattery({ batteryType, weeks: w, temperatureC: avgTemp });
  const frontStorage = storagePressure(front, sidewall);
  const rearStorage = storagePressure(rear, sidewall);

  const months = round(w / WEEKS_PER_MONTH, 1);
  const needsStabiliser = w > STABILISER_WEEKS;
  const needsCarbDrain = fuel.drainBowls && w > CARB_DRAIN_WEEKS;
  const needsOilChange = w > OIL_CHANGE_WEEKS;
  const isLongStorage = w > LONG_STORAGE_WEEKS;
  const coolantAtRisk =
    Number.isFinite(coolantProtection) && Number.isFinite(minTemp) && minTemp < coolantProtection;
  const lithiumColdRisk = battery.id === "lithium" && minTemp < 0;

  const tasks = [];
  const add = (phase, priority, title, detail) => {
    tasks.push({ id: `${phase}-${tasks.length}`, phase, priority, title, detail });
  };

  // --- Before it goes away ---
  add(
    "before",
    "critical",
    "Wash and dry it completely",
    "Road salt, chain lube fling and bird mess all etch paint and alloy while a bike stands. Dry it properly — a wet bike under a cover is worse than a dirty one uncovered.",
  );
  if (needsOilChange) {
    add(
      "before",
      "critical",
      "Change the oil and filter before storing, not after",
      `Used oil carries acidic combustion by-products and water, which attack bearing surfaces while the engine sits. At ${months} months standing, change it now and ride it for a few minutes to distribute the fresh oil.`,
    );
  } else {
    add(
      "before",
      "recommended",
      "Check the oil level and condition",
      `Under ${OIL_CHANGE_WEEKS} weeks the oil can wait, but top it up if it is low and change it now anyway if it is already near its service interval.`,
    );
  }
  if (needsStabiliser) {
    add(
      "before",
      "critical",
      ethanolBlend ? "Add fuel stabiliser rated for ethanol blends" : "Add fuel stabiliser",
      ethanolBlend
        ? `Ethanol-blended petrol absorbs water and can phase-separate, leaving a corrosive layer in the bottom of the tank. Beyond ${STABILISER_WEEKS} weeks add a stabiliser rated for ethanol and run the engine for five minutes so treated fuel reaches the whole fuel system.`
        : `Petrol oxidises and gums up beyond about ${STABILISER_WEEKS} weeks. Add stabiliser and run the engine for five minutes so it reaches the injectors or carburettors.`,
    );
  }
  add(
    "before",
    "recommended",
    "Leave a steel tank nearly full",
    "A near-full tank leaves little air space for condensation, which is what rusts the inside of a steel tank. Fill to about 95% so there is room for the fuel to expand.",
  );
  if (needsCarbDrain) {
    add(
      "before",
      "critical",
      "Drain the carburettor float bowls",
      `Beyond ${CARB_DRAIN_WEEKS} weeks the small amount of fuel in each bowl evaporates and leaves varnish that blocks the pilot jets. Turn the fuel tap off, run the engine until it stalls, then open each drain screw.`,
    );
  }
  if (batteryPlan) {
    if (battery.id === "lithium") {
      add(
        "before",
        "critical",
        "Disconnect the lithium battery and store it at partial charge",
        `LiFePO4 does not sulfate and is happiest sitting around 50–60% charge. At ${batteryPlan.monthlyRate}% a month it will be near ${batteryPlan.projectedSoc}% after ${months} months. Do not leave a lead-acid trickle charger on it, and do not charge it below 0 °C.`,
      );
    } else if (batteryPlan.needsMaintainer) {
      add(
        "before",
        "critical",
        "Put the battery on a smart maintainer",
        `At ${avgTemp} °C this battery self-discharges about ${batteryPlan.monthlyRate}% a month, reaching the ${SULFATION_THRESHOLD_SOC}% sulfation threshold in roughly ${batteryPlan.weeksToThreshold} weeks and about ${batteryPlan.projectedSoc}% by the end of ${months} months. Use a maintainer that floats rather than a plain trickle charger.`,
      );
    } else {
      add(
        "before",
        "recommended",
        "Charge fully and disconnect the negative lead",
        `At ${avgTemp} °C this battery should still be around ${batteryPlan.projectedSoc}% after ${months} months, so a full charge and a disconnected negative terminal is enough. Top it up if the bike stays away longer than planned.`,
      );
    }
  }
  if (useStands) {
    add(
      "before",
      "critical",
      "Put it on front and rear paddock stands",
      `Both wheels off the ground removes all load from the tyres, which is the only complete answer to flat-spotting, and it takes the weight off the suspension seals. Keep the tyres at their normal ${front} psi front and ${rear} psi rear.`,
    );
  } else {
    add(
      "before",
      "critical",
      `Inflate to ${frontStorage} psi front and ${rearStorage} psi rear`,
      `Standing on its tyres, the contact patch flat-spots. Around ${Math.round((STORAGE_PRESSURE_FACTOR - 1) * 100)}% above normal spreads the load${Number.isFinite(sidewall) && sidewall > 0 ? `, capped at the ${sidewall} psi moulded on the sidewall` : ""}. Reset to normal before riding, and roll the bike a little every few weeks if you can.`,
    );
  }
  add(
    "before",
    "recommended",
    "Clean and lubricate the chain",
    "A dry chain rusts where the rollers touch the sprockets. Clean it, lube it, and if the bike will stand on its wheels, roll it forward occasionally so the same links are not always loaded.",
  );
  if (coolantAtRisk) {
    add(
      "before",
      "critical",
      "Check the coolant freeze protection",
      `The space may reach ${minTemp} °C but the coolant is set for ${coolantProtection} °C. Test it with a refractometer and correct the mix before storing — a frozen engine block is not repairable.`,
    );
  } else {
    add(
      "before",
      "recommended",
      "Confirm the coolant mix",
      `A 50/50 ethylene glycol mix protects to roughly ${DEFAULT_COOLANT_PROTECTION_C} °C, comfortably below the ${minTemp} °C you expect. Check it with a refractometer rather than assuming.`,
    );
  }
  if (isLongStorage) {
    add(
      "before",
      "recommended",
      "Change the brake fluid if it is due",
      "DOT 4 fluid is hygroscopic and absorbs moisture from the air, which lowers its boiling point and corrodes caliper bores from the inside. Most manufacturers specify a two-year change interval regardless of mileage — do it now rather than after a long stand.",
    );
    add(
      "before",
      "optional",
      "Note the tyre date codes",
      "Rubber ages whether or not it is used. Record the four-digit DOT week-and-year code on each tyre so you know their real age when the bike comes back out.",
    );
  }
  if (place.rodents) {
    add(
      "before",
      "critical",
      "Block the exhaust and airbox intake",
      "Rodents nest in warm, sheltered tubes and chew wiring looms. Plug the silencer and the airbox intake with clean rag, and hang a bright tag on the bars so you cannot forget them.",
    );
  }
  if (place.damp) {
    add(
      "before",
      "critical",
      "Use a breathable cover, never a plastic tarp",
      "A non-breathable cover traps evaporating moisture against the paint and the alloy, which is worse than no cover at all. If the floor is concrete or soil, put a sheet or boards under the bike so ground damp cannot rise into it.",
    );
  }
  add(
    "before",
    "recommended",
    "Leave it out of gear with the stand down on a solid surface",
    "A side stand can sink into hot tarmac or soft ground over months. Put a pad or a board under the foot, and leave the gearbox in neutral so the clutch plates are not held apart or stuck together.",
  );
  add(
    "before",
    "optional",
    "Tell your insurer and check the paperwork",
    "Many insurers offer a reduced laid-up rate, and some countries require a formal off-road declaration for an unused vehicle. Check what applies where you are before the renewal lands.",
  );

  // --- While it is standing ---
  add(
    "during",
    "recommended",
    "Check it monthly",
    "Ten minutes a month: look for damp under the cover, check the tyre pressures, confirm the maintainer is still showing a float charge and that nothing has moved in.",
  );
  if (!useStands) {
    add(
      "during",
      "recommended",
      "Roll it a few centimetres every few weeks",
      "Moving the contact patch is what actually prevents a permanent flat spot. A quarter turn of the wheel is enough.",
    );
  }
  if (battery.id !== "lithium" && batteryPlan && !batteryPlan.needsMaintainer) {
    add(
      "during",
      "recommended",
      "Top the battery up once",
      `Without a maintainer the projected charge is ${batteryPlan.projectedSoc}% at the end. One charge halfway through keeps it comfortably above the ${SULFATION_THRESHOLD_SOC}% threshold.`,
    );
  }
  if (lithiumColdRisk) {
    add(
      "during",
      "critical",
      "Keep the lithium battery above freezing",
      `The space may fall to ${minTemp} °C. LiFePO4 tolerates cold storage but must not be charged below 0 °C — bring it indoors rather than leaving it on a charger in the cold.`,
    );
  }

  // --- Bringing it back ---
  add("return", "critical", "Remove the exhaust and intake plugs", "Before anything else, and before the engine is turned over. This is why the tag on the bars matters.");
  add("return", "critical", "Reset the tyre pressures and inspect the tyres", `Back to ${front} psi front and ${rear} psi rear, then look for flat spots, cracking in the sidewall and anything embedded in the tread.`);
  add("return", "critical", "Check the brakes before the first ride", "Discs surface-rust while standing and pads can stick to them. Check the fluid level, work the levers, and take the first few stops gently in a safe place.");
  add("return", "recommended", "Reconnect and load-test the battery", "A battery that reads 12.6 V with no load can still fail under cranking. If it struggles once, it will strand you later.");
  add("return", "recommended", "Check the chain tension and lubricate again", "Chains tighten and slacken as the suspension settles. Re-tension to the manual's figure before riding.");
  if (needsCarbDrain) {
    add("return", "recommended", "Refill the float bowls and check for leaks", "Turn the fuel on and let the bowls fill before pressing the starter. Look underneath for weeping before you ride away.");
  }
  add("return", "recommended", "Look for leaks and check every fluid level", "Fork seals, water pump weep hole, and the ground under where it stood. A drip that appears after storage is telling you something.");

  const counts = tasks.reduce(
    (acc, t) => ({ ...acc, [t.priority]: (acc[t.priority] || 0) + 1 }),
    { critical: 0, recommended: 0, optional: 0 },
  );

  return {
    weeks: round(w, 1),
    months,
    fuelSystemLabel: fuel.label,
    fuelSystemNote: fuel.note,
    batteryLabel: battery.label,
    locationLabel: place.label,
    locationNote: place.note,
    averageTempC: round(avgTemp, 1),
    minimumTempC: round(minTemp, 1),
    ethanolBlend,
    useStands,
    frontPsi: round(front, 1),
    rearPsi: round(rear, 1),
    frontStoragePsi: frontStorage,
    rearStoragePsi: rearStorage,
    sidewallMaxPsi: Number.isFinite(sidewall) && sidewall > 0 ? round(sidewall, 1) : null,
    needsStabiliser,
    needsCarbDrain,
    needsOilChange,
    isLongStorage,
    coolantAtRisk,
    lithiumColdRisk,
    battery: batteryPlan,
    tasks,
    beforeTasks: tasks.filter((t) => t.phase === "before"),
    duringTasks: tasks.filter((t) => t.phase === "during"),
    returnTasks: tasks.filter((t) => t.phase === "return"),
    counts,
    totalTasks: tasks.length,
  };
}
