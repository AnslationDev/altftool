/**
 * Laying a car up for weeks or months.
 *
 * The number that decides most of this checklist is how long the 12 V battery
 * survives, and on a car that is dominated by parasitic drain rather than by
 * self-discharge. A modern car keeps the body control module, the alarm, the
 * keyless entry receiver and often a telematics unit awake, typically drawing
 * 20-50 mA once it has gone to sleep. Both effects are added:
 *
 *   parasitic Ah per day      = milliamps / 1000 x 24
 *   self-discharge Ah per day = capacity x monthly rate / 100 / 30.44
 *
 * and the time to a given state of charge is the usable amp-hours divided by
 * the total. Self-discharge itself roughly doubles for every 10 °C rise, the
 * standard Arrhenius rule of thumb:
 *
 *   rate at T = base rate x 2^((T - 20) / 10)
 *
 * Two thresholds matter. Below about 80% state of charge a lead-acid battery
 * starts to sulfate, which permanently loses capacity. Below about 50% it will
 * not reliably turn a cold engine over, so that is the point at which the car
 * simply will not start.
 *
 * TYRES. A tyre standing under load flat-spots, and the flat spot becomes
 * permanent on a long stand. The usual measure is to inflate about 25% above
 * the normal cold pressure, never above the maximum moulded on the sidewall.
 *
 * PARKING BRAKE. A cable or drum parking brake left applied for months can
 * bond the friction material to the drum or disc, and on a car with rear discs
 * the shoes inside the hat can rust solid. Chocks plus leaving the car in gear
 * or in Park is the standard alternative.
 *
 * TRACTION BATTERY. Lithium-ion cells age faster the longer they sit at a high
 * state of charge and the warmer they are, which is calendar ageing rather
 * than cycle ageing. Manufacturers therefore recommend storing an electric or
 * plug-in hybrid at a middling charge rather than full.
 */

/** Mean days in a month: 365.25 / 12. */
export const DAYS_PER_MONTH = 30.4375;

/** State of charge below which lead-acid sulfation accelerates, percent. */
export const SULFATION_THRESHOLD_SOC = 80;

/** State of charge below which a cold engine will not reliably crank. */
export const CRANK_THRESHOLD_SOC = 50;

/** Self-discharge doubles for every this many °C above the reference. */
export const DISCHARGE_DOUBLING_INTERVAL_C = 10;
export const DISCHARGE_REFERENCE_C = 20;

/** Over-inflation used when a car is stored on its tyres. */
export const STORAGE_PRESSURE_FACTOR = 1.25;

/** Beyond this many weeks, add fuel stabiliser. */
export const STABILISER_WEEKS = 4;

/** Beyond this many weeks, change the oil before storing rather than after. */
export const OIL_CHANGE_WEEKS = 8;

/** Beyond this many weeks, treat it as long-term storage. */
export const LONG_STORAGE_WEEKS = 26;

/** Recommended traction-battery charge band for a long stand, percent. */
export const EV_STORAGE_SOC_MIN = 40;
export const EV_STORAGE_SOC_MAX = 60;

/** Typical freeze protection of a 50/50 ethylene glycol mix, °C. */
export const DEFAULT_COOLANT_PROTECTION_C = -37;

/** 12 V battery chemistries and their self-discharge at 20 °C. */
export const BATTERY_TYPES = [
  { id: "flooded", label: "Flooded lead-acid", monthlyDischarge: 4, note: "Check the electrolyte level before storing and top up with distilled water if the plates are exposed." },
  { id: "agm", label: "AGM (stop-start cars)", monthlyDischarge: 2, note: "Fitted to most stop-start cars. It needs an AGM-capable charger — a plain lead-acid charger can overcharge it." },
  { id: "efb", label: "EFB (enhanced flooded)", monthlyDischarge: 3, note: "The other common stop-start battery. Treat it like a flooded battery but expect a little less self-discharge." },
];

/** Powertrains, which change what the fuel, exhaust and traction battery need. */
export const POWERTRAINS = [
  { id: "petrol", label: "Petrol", hasFuel: true, hasTraction: false, note: "Petrol oxidises and, where it is ethanol-blended, absorbs water. Stabiliser and a nearly full tank are the answer." },
  { id: "diesel", label: "Diesel", hasFuel: true, hasTraction: false, note: "Diesel grows microbial contamination in the presence of water. A biocide-containing stabiliser is worth using on a long stand." },
  { id: "hybrid", label: "Hybrid (no plug)", hasFuel: true, hasTraction: true, note: "Both a fuel system and a traction battery to look after, and the 12 V battery is usually small and drains quickly." },
  { id: "phev", label: "Plug-in hybrid", hasFuel: true, hasTraction: true, note: "Fuel goes stale faster in a plug-in hybrid because it is used slowly. Stabiliser matters even for shorter stands." },
  { id: "ev", label: "Electric", hasFuel: false, hasTraction: true, note: "No fuel to worry about, but the 12 V battery still drains and the traction battery ages faster if left full." },
];

/** Where the car will stand. */
export const LOCATIONS = [
  { id: "garage", label: "Enclosed garage", damp: false, rodents: true, uv: false, note: "The best case. Rodents are still the main risk, especially anywhere near stored food or bedding." },
  { id: "carport", label: "Carport or open shed", damp: true, rodents: true, uv: false, note: "Shelter from rain but not from damp air. Airflow underneath matters more than the roof." },
  { id: "driveway", label: "Outdoors on a driveway", damp: true, rodents: true, uv: true, note: "UV degrades trim, wiper rubber and dashboard plastics. A breathable cover is worth more here than anywhere else." },
];

/** Transmissions, which change what to do about the clutch and the parking pawl. */
export const TRANSMISSIONS = [
  { id: "manual", label: "Manual", note: "Leave it in gear rather than on the handbrake, and never leave the clutch pedal depressed — the friction plate can bond to the flywheel." },
  { id: "auto", label: "Automatic", note: "Leave it in Park with chocks. The parking pawl holds the car without pressing pads against discs." },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

/** Self-discharge rate at a temperature, percent per month. */
export function dischargeRateAt(baseMonthlyPercent, temperatureC) {
  const base = num(baseMonthlyPercent);
  const t = num(temperatureC);
  if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(t)) return null;
  return base * 2 ** ((t - DISCHARGE_REFERENCE_C) / DISCHARGE_DOUBLING_INTERVAL_C);
}

/**
 * How long a 12 V battery lasts under parasitic drain plus self-discharge.
 *
 * @param {object} input
 * @param {number} input.capacityAh    battery capacity in amp-hours
 * @param {number} input.parasiticMa   sleeping current draw in milliamps
 * @param {string} input.batteryType   one of BATTERY_TYPES ids
 * @param {number} input.temperatureC  average storage temperature
 * @returns {object|null}
 */
export function projectBattery({ capacityAh, parasiticMa, batteryType, temperatureC }) {
  const chemistry = BATTERY_TYPES.find((b) => b.id === batteryType);
  if (!chemistry) return null;
  const capacity = num(capacityAh);
  const drain = num(parasiticMa);
  if (!Number.isFinite(capacity) || capacity <= 0) return null;
  if (!Number.isFinite(drain) || drain < 0) return null;
  const rate = dischargeRateAt(chemistry.monthlyDischarge, temperatureC);
  if (rate === null) return null;

  const parasiticAhPerDay = (drain / 1000) * 24;
  const selfAhPerDay = (capacity * rate) / 100 / DAYS_PER_MONTH;
  const totalAhPerDay = parasiticAhPerDay + selfAhPerDay;
  if (totalAhPerDay <= 0) return null;

  const daysTo = (thresholdSoc) => ((capacity * (100 - thresholdSoc)) / 100) / totalAhPerDay;

  return {
    chemistry: chemistry.label,
    chemistryNote: chemistry.note,
    capacityAh: round(capacity, 1),
    parasiticMa: round(drain, 1),
    monthlyRate: round(rate, 2),
    parasiticAhPerDay: round(parasiticAhPerDay, 3),
    selfAhPerDay: round(selfAhPerDay, 3),
    totalAhPerDay: round(totalAhPerDay, 3),
    parasiticShare: round((parasiticAhPerDay / totalAhPerDay) * 100, 1),
    daysToSulfation: round(daysTo(SULFATION_THRESHOLD_SOC), 1),
    daysToFlat: round(daysTo(CRANK_THRESHOLD_SOC), 1),
    weeksToFlat: round(daysTo(CRANK_THRESHOLD_SOC) / 7, 1),
  };
}

/** Storage pressure: 25% over normal, never above the sidewall maximum. */
export function storagePressure(normalPsi, sidewallMaxPsi) {
  const normal = num(normalPsi);
  const max = num(sidewallMaxPsi);
  if (!Number.isFinite(normal) || normal <= 0) return null;
  const target = normal * STORAGE_PRESSURE_FACTOR;
  if (!Number.isFinite(max) || max <= 0) return round(target, 1);
  return round(Math.min(target, max), 1);
}

/**
 * Build the car storage checklist.
 *
 * @param {object} input
 * @returns {object} { error } or the checklist
 */
export function buildCarStorageChecklist({
  weeks,
  powertrain = "petrol",
  transmission = "manual",
  batteryType = "agm",
  location = "garage",
  capacityAh = 60,
  parasiticMa = 30,
  averageTempC = 10,
  minimumTempC = -4,
  normalPsi = 33,
  sidewallMaxPsi = 51,
  coolantProtectionC = DEFAULT_COOLANT_PROTECTION_C,
  canPlugIn = false,
} = {}) {
  const w = num(weeks);
  if (!Number.isFinite(w) || w <= 0) {
    return { error: "Enter how many weeks the car will be standing." };
  }
  if (w > 520) {
    return { error: "Beyond ten years a car needs a full recommissioning rather than a storage checklist." };
  }
  const power = POWERTRAINS.find((p) => p.id === powertrain);
  if (!power) return { error: "Choose the powertrain." };
  const gearbox = TRANSMISSIONS.find((t) => t.id === transmission);
  if (!gearbox) return { error: "Choose whether the car is manual or automatic." };
  const place = LOCATIONS.find((l) => l.id === location);
  if (!place) return { error: "Choose where the car will be stored." };
  if (!BATTERY_TYPES.some((b) => b.id === batteryType)) {
    return { error: "Choose the 12 V battery type." };
  }

  const capacity = num(capacityAh);
  if (!Number.isFinite(capacity) || capacity <= 0 || capacity > 300) {
    return { error: "Battery capacity should be between 1 and 300 amp-hours — it is printed on the battery label." };
  }
  const drain = num(parasiticMa);
  if (!Number.isFinite(drain) || drain < 0 || drain > 5000) {
    return { error: "Parasitic drain should be between 0 and 5000 milliamps. Most modern cars settle between 20 and 50 mA once asleep." };
  }
  const avgTemp = num(averageTempC);
  const minTemp = num(minimumTempC);
  if (!Number.isFinite(avgTemp) || avgTemp < -40 || avgTemp > 60) {
    return { error: "Average storage temperature has to be between −40 °C and 60 °C." };
  }
  if (!Number.isFinite(minTemp) || minTemp > avgTemp) {
    return { error: "The minimum temperature has to be a number no higher than the average." };
  }
  const normal = num(normalPsi);
  if (!Number.isFinite(normal) || normal <= 0) {
    return { error: "Enter the normal cold tyre pressure in psi — it is on the door pillar sticker." };
  }
  const sidewall = num(sidewallMaxPsi);
  if (Number.isFinite(sidewall) && sidewall > 0 && sidewall < normal) {
    return { error: "The sidewall maximum is lower than the normal running pressure — check both figures." };
  }
  const coolantProtection = num(coolantProtectionC);

  const battery = projectBattery({ capacityAh: capacity, parasiticMa: drain, batteryType, temperatureC: avgTemp });
  const days = w * 7;
  const months = round(w / (DAYS_PER_MONTH / 7), 1);
  const storagePsi = storagePressure(normal, sidewall);

  const willGoFlat = battery ? days > battery.daysToFlat : false;
  const willSulfate = battery ? days > battery.daysToSulfation : false;
  const needsStabiliser = power.hasFuel && w > STABILISER_WEEKS;
  const needsOilChange = power.hasFuel && w > OIL_CHANGE_WEEKS;
  const isLongStorage = w > LONG_STORAGE_WEEKS;
  const coolantAtRisk = Number.isFinite(coolantProtection) && minTemp < coolantProtection;

  const tasks = [];
  const add = (phase, priority, title, detail) => {
    tasks.push({ id: `${phase}-${tasks.length}`, phase, priority, title, detail });
  };

  // --- Before ---
  add(
    "before",
    "critical",
    "Wash, dry and wax it before it goes away",
    "Road salt, tree sap and bird mess all etch clearcoat while the car stands. Wash the underside and the wheel arches too, and dry it fully — a wet car under a cover is worse than a dirty one uncovered.",
  );
  add(
    "before",
    "recommended",
    "Empty and clean the interior",
    "Crumbs and wrappers are what attract rodents in the first place. Take out anything organic, and put a moisture absorber on the floor if the space is damp.",
  );
  if (needsOilChange) {
    add(
      "before",
      "critical",
      "Change the oil and filter before storing",
      `Used oil carries acids and water from combustion that attack bearing surfaces while the engine sits. At ${months} months standing, change it now and run the engine to temperature so the fresh oil coats everything.`,
    );
  } else if (power.hasFuel) {
    add(
      "before",
      "recommended",
      "Check the oil level and condition",
      `Under ${OIL_CHANGE_WEEKS} weeks the oil can wait, but change it now anyway if it is already close to its service interval.`,
    );
  }
  if (needsStabiliser) {
    add(
      "before",
      "critical",
      powertrain === "diesel" ? "Add a diesel stabiliser with a biocide" : "Add fuel stabiliser and fill the tank",
      powertrain === "diesel"
        ? `Diesel supports microbial growth wherever water collects, and a nearly full tank leaves little air space for condensation. Fill to about 95%, add a stabiliser containing a biocide, then run the engine for ten minutes so treated fuel reaches the injectors.`
        : `Petrol oxidises and, where it is ethanol-blended, absorbs water and can phase-separate. Fill to about 95% to limit condensation, add stabiliser, and run the engine for ten minutes so it reaches the whole fuel system.`,
    );
  } else if (power.hasFuel) {
    add(
      "before",
      "recommended",
      "Leave the tank nearly full",
      "A near-full tank leaves little air space for water to condense in. Fill to about 95% so there is room for the fuel to expand.",
    );
  }
  if (battery) {
    if (willGoFlat) {
      add(
        "before",
        "critical",
        "Fit a battery maintainer or disconnect the battery",
        `With ${battery.parasiticMa} mA of parasitic drain plus ${battery.monthlyRate}% a month of self-discharge, the battery reaches ${CRANK_THRESHOLD_SOC}% — the point where it will not reliably crank — in about ${battery.daysToFlat} days, and this car is standing for ${days}. Parasitic drain is ${battery.parasiticShare}% of the loss, so a maintainer on a live circuit or a full disconnect is the only real fix.`,
      );
      add(
        "before",
        "recommended",
        "Check what disconnecting loses",
        "On many cars, pulling the negative lead loses the radio code, the steering angle sensor calibration and sometimes the throttle adaptation. If the car has memory seats or an alarm that needs power, a maintainer is the safer choice.",
      );
    } else if (willSulfate) {
      add(
        "before",
        "critical",
        "Charge it fully and plan one top-up",
        `The battery reaches the ${SULFATION_THRESHOLD_SOC}% sulfation threshold in about ${battery.daysToSulfation} days, before this ${days}-day stand ends. A full charge now plus one mid-storage top-up avoids permanent capacity loss.`,
      );
    } else {
      add(
        "before",
        "recommended",
        "Charge it fully before you park it",
        `At ${battery.totalAhPerDay} Ah a day the battery should stay above the ${SULFATION_THRESHOLD_SOC}% threshold for about ${battery.daysToSulfation} days, comfortably past this ${days}-day stand. Start from a full charge rather than from wherever the last drive left it.`,
      );
    }
  }
  if (power.hasTraction) {
    add(
      "before",
      "critical",
      `Leave the traction battery between ${EV_STORAGE_SOC_MIN}% and ${EV_STORAGE_SOC_MAX}%`,
      `Lithium-ion cells age faster the longer they sit at a high state of charge and the warmer they are — calendar ageing, not cycle ageing. A middling charge is the least damaging place to leave them${canPlugIn ? ", and leaving the car plugged in lets it manage its own state if the manufacturer says to do so" : ". Without a charge point, aim for that band on the last drive before parking"}.`,
    );
  }
  add(
    "before",
    "critical",
    `Inflate the tyres to ${storagePsi} psi`,
    `Standing under load, the contact patch flat-spots, and on a long stand that becomes permanent. About ${Math.round((STORAGE_PRESSURE_FACTOR - 1) * 100)}% above the normal ${normal} psi spreads the load${Number.isFinite(sidewall) && sidewall > 0 ? `, capped at the ${sidewall} psi moulded on the sidewall` : ""}. Reset before driving.`,
  );
  add(
    "before",
    "critical",
    "Chock the wheels — do not leave the parking brake on",
    `${gearbox.note} A parking brake left applied for months can bond the friction material to the drum or disc, and freeing it usually means dismantling the corner.`,
  );
  if (coolantAtRisk) {
    add(
      "before",
      "critical",
      "Correct the coolant mix before it freezes",
      `The space may reach ${minTemp} °C but the coolant is set for ${coolantProtection} °C. Test it with a refractometer and correct the mix — a frozen block or heater matrix is not an economic repair.`,
    );
  } else {
    add(
      "before",
      "recommended",
      "Confirm the coolant freeze protection",
      `A 50/50 ethylene glycol mix protects to roughly ${DEFAULT_COOLANT_PROTECTION_C} °C, below the ${minTemp} °C you expect. Check it with a refractometer rather than assuming, and top up the screenwash with a winter-grade mix at the same time.`,
    );
  }
  add(
    "before",
    "recommended",
    "Lift the wiper blades off the glass",
    "Wiper rubber bonds to glass over months and tears when it is first used. Lift the arms or slide a strip of card under each blade.",
  );
  if (place.rodents) {
    add(
      "before",
      "critical",
      "Block the obvious rodent routes",
      "Rodents nest on a warm engine and chew wiring insulation, which is one of the most expensive faults a stored car develops. Check the air intake and the cabin filter housing, set traps around the car rather than inside it, and open the bonnet on the monthly check.",
    );
  }
  if (place.damp) {
    add(
      "before",
      "critical",
      "Use a breathable cover and get it off wet ground",
      "A plastic tarp traps evaporating moisture against the paint, which is worse than no cover. Park on a hard surface rather than soil or grass, and leave airflow underneath.",
    );
  }
  if (place.uv) {
    add(
      "before",
      "recommended",
      "Shield the interior from sunlight",
      "UV fades and cracks dashboard plastics and leather far faster than anything else outdoors. A windscreen shade and a cover on the seats cost almost nothing.",
    );
  }
  if (isLongStorage) {
    add(
      "before",
      "recommended",
      "Change the brake fluid if it is due",
      "Brake fluid is hygroscopic and absorbs water from the air, which corrodes caliper bores and ABS units from the inside. Most manufacturers specify a two-year interval regardless of mileage — do it before a long stand rather than after.",
    );
    add(
      "before",
      "optional",
      "Note the tyre date codes and record the mileage",
      "Rubber ages whether or not it is used, and a written mileage and date makes the recommissioning decisions obvious later. The four-digit DOT code gives the week and year each tyre was made.",
    );
  }
  add(
    "before",
    "optional",
    "Sort the insurance and the road tax",
    "Many insurers offer a reduced laid-up rate, and some countries require a formal off-road declaration for an unused vehicle. Check what applies before the renewal arrives.",
  );

  // --- During ---
  add(
    "during",
    "recommended",
    "Check it monthly",
    "Fifteen minutes: look for damp and rodent signs under the bonnet, check the tyre pressures, confirm the maintainer is floating, and look at the ground underneath for fresh drips.",
  );
  add(
    "during",
    "recommended",
    "Move it a metre back and forward",
    "Rolling the car changes the tyre contact patch, which is what actually prevents a permanent flat spot, and it wipes the surface rust off the brake discs.",
  );
  if (power.hasFuel) {
    add(
      "during",
      "optional",
      "Run the air conditioning for ten minutes when you move it",
      "Refrigerant carries the oil that lubricates the compressor seals. Running the system occasionally keeps those seals from drying out and leaking.",
    );
  }
  if (power.hasTraction) {
    add(
      "during",
      "recommended",
      "Check the traction battery charge",
      `Keep it inside the ${EV_STORAGE_SOC_MIN}–${EV_STORAGE_SOC_MAX}% band. Letting a lithium pack drift down to empty over a long stand can put it into a deep-discharge state that a dealer has to recover.`,
    );
  }

  // --- Return ---
  add("return", "critical", "Look underneath and under the bonnet before turning the key", "Check for nests, chewed insulation and anything an animal has moved. This is the check that saves a wiring loom.");
  add("return", "critical", "Reset the tyre pressures and inspect the tyres", `Back to ${normal} psi, then look for flat spots, sidewall cracking and anything embedded in the tread. Drive gently for the first few kilometres — a mild flat spot often works itself out, a permanent one will not.`);
  add("return", "critical", "Test the brakes at low speed before joining traffic", "Discs surface-rust while standing and pads can stick. Make several gentle stops in a safe place to clean the discs and confirm the pedal feels normal.");
  add("return", "recommended", "Reconnect and load-test the 12 V battery", "A battery that reads 12.6 V at rest can still fail under cranking load. If it struggles even once, replace it rather than being stranded later.");
  add("return", "recommended", "Check every fluid level and look for leaks", "Seals dry out while standing. Check oil, coolant, brake fluid and power steering, and look at the ground where the car stood.");
  if (power.hasFuel) {
    add("return", "recommended", "Take a longer first drive", `Short trips after storage leave condensation in the oil and the exhaust${powertrain === "diesel" ? ", and a diesel needs a sustained run to bring the particulate filter up to regeneration temperature" : ""}. Make the first drive at least twenty minutes at road speed.`);
  }

  const counts = tasks.reduce(
    (acc, t) => ({ ...acc, [t.priority]: (acc[t.priority] || 0) + 1 }),
    { critical: 0, recommended: 0, optional: 0 },
  );

  return {
    weeks: round(w, 1),
    days: round(days),
    months,
    powertrainLabel: power.label,
    powertrainNote: power.note,
    transmissionLabel: gearbox.label,
    transmissionNote: gearbox.note,
    locationLabel: place.label,
    locationNote: place.note,
    averageTempC: round(avgTemp, 1),
    minimumTempC: round(minTemp, 1),
    normalPsi: round(normal, 1),
    storagePsi,
    sidewallMaxPsi: Number.isFinite(sidewall) && sidewall > 0 ? round(sidewall, 1) : null,
    battery,
    willGoFlat,
    willSulfate,
    needsStabiliser,
    needsOilChange,
    isLongStorage,
    coolantAtRisk,
    hasTraction: power.hasTraction,
    canPlugIn,
    tasks,
    beforeTasks: tasks.filter((t) => t.phase === "before"),
    duringTasks: tasks.filter((t) => t.phase === "during"),
    returnTasks: tasks.filter((t) => t.phase === "return"),
    counts,
    totalTasks: tasks.length,
  };
}
