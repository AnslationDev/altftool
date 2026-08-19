/**
 * Bajaj motorcycle service schedule planner.
 *
 * How the schedule is built:
 *  - Bajaj two-wheelers use a running-in service at about 750 km or 1 month,
 *    a second visit near 4,500 km, and a repeating periodic interval of roughly
 *    4,500-5,000 km after that.
 *  - Every milestone is "whichever comes first" - distance or elapsed time - so
 *    each visit is dated at the earlier of the two triggers.
 *  - Free-service coupons cover the first N visits; later visits are paid and
 *    carry labour on top of consumables.
 *  - Liquid-cooled models (Pulsar 220F, RS200, Dominar and similar) add coolant
 *    replacement and a radiator check that air-cooled models do not need.
 *
 * Interval and price figures are the commonly published values and are exposed
 * as editable inputs, because Bajaj varies them by model and package. Always
 * confirm against the maintenance chart in your own owner's manual.
 */

export const BRAND = "Bajaj";

/** Running-in service: Bajaj's first visit is due at about 750 km or 1 month. */
export const FIRST_SERVICE_KM = 750;
export const FIRST_SERVICE_MONTHS = 1;
/** Second visit anchors the periodic cycle at about 4,500 km or 5 months. */
export const SECOND_SERVICE_KM = 4500;
export const SECOND_SERVICE_MONTHS = 5;
/** Every visit after the second repeats on this periodic interval. */
export const SERVICE_INTERVAL_KM = 4500;
export const SERVICE_INTERVAL_MONTHS = 5;
/** Standard Bajaj package on most models covers this many free services. */
export const FREE_SERVICE_COUNT = 5;
/** Planning more than 20 visits ahead is guesswork, not a schedule. */
export const MAX_SERVICES = 20;
/** Mean length of a Gregorian calendar month in days (365.2425 / 12). */
export const DAYS_PER_MONTH = 30.436875;

export const COOLING_TYPES = [
  { value: "air", label: "Air / oil cooled (Platina, CT, most Pulsars)" },
  { value: "liquid", label: "Liquid cooled (Pulsar 220F, RS200, Dominar)" },
];

/**
 * Consumables shared by every Bajaj model, with replacement distance and an
 * indicative genuine-part price in INR, scaled at run time by a price index.
 */
export const BASE_CONSUMABLES = [
  { key: "engineOil", name: "Engine oil (20W50 API SL)", firstKm: FIRST_SERVICE_KM, intervalKm: 5000, price: 550 },
  { key: "oilFilter", name: "Oil filter element", firstKm: null, intervalKm: 10000, price: 250 },
  { key: "airFilter", name: "Air filter element", firstKm: null, intervalKm: 10000, price: 400 },
  { key: "sparkPlug", name: "Spark plug (twin-plug models need two)", firstKm: null, intervalKm: 10000, price: 220 },
  { key: "brakePads", name: "Brake pads / shoes", firstKm: null, intervalKm: 20000, price: 800 },
  { key: "chainKit", name: "Chain and sprocket kit", firstKm: null, intervalKm: 24000, price: 2200 },
  { key: "clutchPlates", name: "Clutch plate set", firstKm: null, intervalKm: 30000, price: 1100 },
];

/** Extra item fitted only to liquid-cooled Bajaj models. */
export const COOLANT_CONSUMABLE = {
  key: "coolant",
  name: "Engine coolant replacement",
  firstKm: null,
  intervalKm: 24000,
  price: 500,
};

/** Checks carried out at every visit, free or paid. */
export const ROUTINE_TASKS = [
  "Engine oil level and top-up",
  "Drive chain slack and lubrication",
  "Front and rear brake performance",
  "Clutch and throttle free play",
  "Tyre pressure and tread depth",
  "Battery, headlamp aim and all lights",
];

/** Additional check for liquid-cooled models. */
export const LIQUID_COOLED_TASK = "Coolant level, radiator fins and fan operation";

/**
 * Build the consumable list for a cooling type. `firstKm` overrides the
 * engine oil's first-change trigger with the caller's actual runtime value
 * (planServiceSchedule's `firstKm` parameter) instead of always using the
 * module-level FIRST_SERVICE_KM default baked into BASE_CONSUMABLES.
 */
export function consumableList(coolingType, firstKm = FIRST_SERVICE_KM) {
  const base = BASE_CONSUMABLES.map((item) =>
    item.key === "engineOil" ? { ...item, firstKm } : item,
  );
  return coolingType === "liquid" ? [...base, COOLANT_CONSUMABLE] : base;
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Parse a YYYY-MM-DD string into a UTC timestamp. Returns NaN if unusable. */
export function parseISODate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return NaN;
  }
  return ms;
}

const toISO = (ms) => new Date(ms).toISOString().slice(0, 10);

/** Add whole calendar months, clamping to the last valid day of the target month. */
export function addMonthsISO(value, months) {
  const ms = parseISODate(value);
  if (!Number.isFinite(ms) || !Number.isFinite(months)) return "";
  const base = new Date(ms);
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth() + Math.round(months);
  const day = base.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return toISO(Date.UTC(year, month, Math.min(day, lastDay)));
}

/** Add whole days to a YYYY-MM-DD string. */
export function addDaysISO(value, days) {
  const ms = parseISODate(value);
  if (!Number.isFinite(ms) || !Number.isFinite(days)) return "";
  return toISO(ms + Math.round(days) * 86400000);
}

/** Distance at which service number n falls due. */
export function serviceDueKm(index, { firstKm, secondKm, intervalKm }) {
  if (index <= 1) return firstKm;
  return secondKm + intervalKm * (index - 2);
}

/** Age in months at which service number n falls due. */
export function serviceDueMonths(index, { firstMonths, secondMonths, intervalMonths }) {
  if (index <= 1) return firstMonths;
  return secondMonths + intervalMonths * (index - 2);
}

/** Which consumables are replaced between two milestones. */
export function consumablesDueAt(dueKm, previousDueKm, list) {
  return list.filter((item) => {
    if (item.firstKm !== null && previousDueKm < item.firstKm && dueKm >= item.firstKm) return true;
    if (!(item.intervalKm > 0)) return false;
    return Math.floor(dueKm / item.intervalKm) > Math.floor(previousDueKm / item.intervalKm);
  });
}

/** Build the full service plan. Pure: the purchase date is an argument. */
export function planServiceSchedule({
  purchaseDate = "2026-01-01",
  currentOdometerKm = 0,
  monthlyKm = 900,
  coolingType = "air",
  servicesToPlan = 8,
  freeServices = FREE_SERVICE_COUNT,
  firstKm = FIRST_SERVICE_KM,
  firstMonths = FIRST_SERVICE_MONTHS,
  secondKm = SECOND_SERVICE_KM,
  secondMonths = SECOND_SERVICE_MONTHS,
  intervalKm = SERVICE_INTERVAL_KM,
  intervalMonths = SERVICE_INTERVAL_MONTHS,
  labourPerPaidService = 450,
  partsPriceIndex = 100,
  prepaidPackagePrice = 0,
} = {}) {
  const numbers = [
    currentOdometerKm,
    monthlyKm,
    servicesToPlan,
    freeServices,
    firstKm,
    firstMonths,
    secondKm,
    secondMonths,
    intervalKm,
    intervalMonths,
    labourPerPaidService,
    partsPriceIndex,
    prepaidPackagePrice,
  ];
  if (!numbers.every(isNum)) return { error: "Enter valid numbers in every field." };
  if (!Number.isFinite(parseISODate(purchaseDate))) return { error: "Enter a valid purchase date." };
  if (coolingType !== "air" && coolingType !== "liquid") {
    return { error: "Choose either an air-cooled or a liquid-cooled model." };
  }
  if (currentOdometerKm < 0) return { error: "Odometer reading cannot be negative." };
  if (currentOdometerKm > 500000) return { error: "Odometer reading looks too high for a motorcycle." };
  if (monthlyKm <= 0) return { error: "Monthly running must be greater than zero km." };
  if (monthlyKm > 10000) return { error: "Monthly running above 10,000 km is out of range." };

  const count = Math.round(servicesToPlan);
  if (count < 1 || count > MAX_SERVICES) {
    return { error: `Plan between 1 and ${MAX_SERVICES} services ahead.` };
  }
  const free = Math.round(freeServices);
  if (free < 0 || free > MAX_SERVICES) {
    return { error: `Free services must be between 0 and ${MAX_SERVICES}.` };
  }
  if (firstKm <= 0 || secondKm <= 0 || intervalKm <= 0) {
    return { error: "Service distances must be greater than zero." };
  }
  if (secondKm <= firstKm) return { error: "The second service must fall due after the first one." };
  if (firstMonths <= 0 || secondMonths <= 0 || intervalMonths <= 0) {
    return { error: "Service intervals in months must be greater than zero." };
  }
  if (secondMonths < firstMonths) {
    return { error: "The second service cannot be due before the first one." };
  }
  if (labourPerPaidService < 0) return { error: "Labour charge cannot be negative." };
  if (prepaidPackagePrice < 0) return { error: "Prepaid package price cannot be negative." };
  if (partsPriceIndex < 0 || partsPriceIndex > 500) {
    return { error: "Parts price index should be between 0 and 500 percent." };
  }

  const list = consumableList(coolingType, firstKm);
  const priceFactor = partsPriceIndex / 100;
  const kmPerDay = monthlyKm / DAYS_PER_MONTH;
  const services = [];
  let previousDueKm = 0;
  let totalCost = 0;
  let totalPartsCost = 0;
  // Cost of only the not-yet-due visits, kept separate from totalCost (the
  // full plan, including services already behind the odometer reading) —
  // a prepaid package purchased today can only ever cover what's still ahead.
  let upcomingCost = 0;

  for (let index = 1; index <= count; index += 1) {
    const dueKm = serviceDueKm(index, { firstKm, secondKm, intervalKm });
    const dueMonths = serviceDueMonths(index, { firstMonths, secondMonths, intervalMonths });

    const dateByMonths = addMonthsISO(purchaseDate, dueMonths);
    const dateByKm = addDaysISO(purchaseDate, dueKm / kmPerDay);
    const useKm = parseISODate(dateByKm) <= parseISODate(dateByMonths);
    const dueDate = useKm ? dateByKm : dateByMonths;

    const parts = consumablesDueAt(dueKm, previousDueKm, list).map((item) => ({
      key: item.key,
      name: item.name,
      price: Math.round(item.price * priceFactor),
    }));
    const partsCost = parts.reduce((sum, item) => sum + item.price, 0);
    const isFree = index <= free;
    const labour = isFree ? 0 : Math.round(labourPerPaidService);
    // Free-service coupons cover labour only; consumables are always chargeable.
    const cost = labour + partsCost;

    totalCost += cost;
    totalPartsCost += partsCost;
    const status = currentOdometerKm >= dueKm ? "done" : "upcoming";
    if (status === "upcoming") upcomingCost += cost;

    services.push({
      index,
      dueKm,
      dueMonths,
      dueDate,
      dueBasis: useKm ? "distance" : "time",
      isFree,
      status,
      parts,
      partsCost,
      labour,
      cost,
    });

    previousDueKm = dueKm;
  }

  const next = services.find((service) => service.status === "upcoming") || null;
  // Compare the package price against only the remaining/upcoming visits —
  // services already done are sunk cost and irrelevant to whether a package
  // bought NOW is worth it.
  const packageSaving = prepaidPackagePrice > 0 ? upcomingCost - prepaidPackagePrice : 0;

  return {
    brand: BRAND,
    coolingType,
    services,
    next,
    completed: services.filter((service) => service.status === "done").length,
    freeServices: free,
    servicesPlanned: count,
    totalCost,
    totalPartsCost,
    totalLabourCost: totalCost - totalPartsCost,
    coversKm: services.length ? services[services.length - 1].dueKm : 0,
    kmToNext: next ? Math.max(0, next.dueKm - currentOdometerKm) : 0,
    prepaidPackagePrice: Math.round(prepaidPackagePrice),
    packageSaving: Math.round(packageSaving),
    packageWorthIt: prepaidPackagePrice > 0 ? packageSaving > 0 : null,
    routineTasks:
      coolingType === "liquid" ? [...ROUTINE_TASKS, LIQUID_COOLED_TASK] : ROUTINE_TASKS,
  };
}
