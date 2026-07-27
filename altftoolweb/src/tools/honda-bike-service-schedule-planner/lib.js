/**
 * Honda two-wheeler service schedule planner.
 *
 * How the schedule is built:
 *  - Honda two-wheelers sold in India follow a running-in service at about
 *    1,000 km or 1 month, a second visit near 4,000 km or 4 months, and a
 *    repeating 3,000 km / 3 month cycle after that.
 *  - Each milestone is "whichever comes first" - distance or elapsed time - so
 *    every visit is dated at the earlier of the two triggers.
 *  - The standard package covers the first few visits free; the rest are paid
 *    and carry a labour charge on top of the consumables.
 *  - Motorcycles and scooters share the visit schedule but not the parts list:
 *    a chain-drive motorcycle needs a chain and sprocket kit, while a CVT
 *    scooter needs a drive belt, roller weights and final gear oil.
 *
 * The interval numbers are the commonly published values and are editable,
 * because Honda varies them by model and warranty package. Confirm against the
 * maintenance chart in your own owner's manual.
 */

export const BRAND = "Honda";

/** Running-in service: Honda's first visit is due at about 1,000 km or 1 month. */
export const FIRST_SERVICE_KM = 1000;
export const FIRST_SERVICE_MONTHS = 1;
/** Second visit anchors the periodic cycle at about 4,000 km or 4 months. */
export const SECOND_SERVICE_KM = 4000;
export const SECOND_SERVICE_MONTHS = 4;
/** Every visit after the second repeats on this periodic interval. */
export const SERVICE_INTERVAL_KM = 3000;
export const SERVICE_INTERVAL_MONTHS = 3;
/** Standard Honda package on most models covers this many free services. */
export const FREE_SERVICE_COUNT = 3;
/** Planning more than 20 visits ahead is guesswork, not a schedule. */
export const MAX_SERVICES = 20;
/** Mean length of a Gregorian calendar month in days (365.2425 / 12). */
export const DAYS_PER_MONTH = 30.436875;

export const VEHICLE_TYPES = [
  { value: "motorcycle", label: "Motorcycle (chain drive)" },
  { value: "scooter", label: "Scooter (CVT / belt drive)" },
];

/**
 * Consumables by vehicle type, with replacement distance and an indicative
 * genuine-part price in INR. Prices move, so they are scaled by a price index.
 */
export const CONSUMABLES_BY_TYPE = {
  motorcycle: [
    { key: "engineOil", name: "Engine oil (10W30 SL grade)", firstKm: FIRST_SERVICE_KM, intervalKm: 6000, price: 480 },
    { key: "oilStrainer", name: "Oil strainer / centrifugal filter clean", firstKm: FIRST_SERVICE_KM, intervalKm: 6000, price: 130 },
    { key: "airFilter", name: "Air filter (viscous paper element, replace only)", firstKm: null, intervalKm: 12000, price: 350 },
    { key: "sparkPlug", name: "Spark plug", firstKm: null, intervalKm: 12000, price: 200 },
    { key: "brakeShoes", name: "Brake shoes / pads", firstKm: null, intervalKm: 24000, price: 700 },
    { key: "chainKit", name: "Chain and sprocket kit", firstKm: null, intervalKm: 24000, price: 2100 },
    { key: "clutchPlates", name: "Clutch plate set", firstKm: null, intervalKm: 30000, price: 1000 },
  ],
  scooter: [
    { key: "engineOil", name: "Engine oil (10W30 SL grade)", firstKm: FIRST_SERVICE_KM, intervalKm: 6000, price: 480 },
    { key: "gearOil", name: "Final transmission gear oil", firstKm: null, intervalKm: 12000, price: 160 },
    { key: "airFilter", name: "Air filter (viscous paper element, replace only)", firstKm: null, intervalKm: 12000, price: 350 },
    { key: "sparkPlug", name: "Spark plug", firstKm: null, intervalKm: 12000, price: 200 },
    { key: "brakeShoes", name: "Brake shoes / pads", firstKm: null, intervalKm: 24000, price: 650 },
    { key: "driveBelt", name: "CVT drive belt", firstKm: null, intervalKm: 24000, price: 1400 },
    { key: "rollerWeights", name: "Variator roller weight set", firstKm: null, intervalKm: 24000, price: 550 },
  ],
};

/** Checks carried out at every visit, free or paid. */
export const ROUTINE_TASKS_BY_TYPE = {
  motorcycle: [
    "Engine oil level and top-up",
    "Drive chain slack and lubrication",
    "Front and rear brake free play",
    "Clutch and throttle free play",
    "Tyre pressure and tread depth",
    "Battery, headlamp aim and all lights",
  ],
  scooter: [
    "Engine oil level and top-up",
    "CVT drive belt condition check",
    "Front and rear brake free play",
    "Throttle free play and idle speed",
    "Tyre pressure and tread depth",
    "Battery, headlamp aim and all lights",
  ],
};

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
  monthlyKm = 700,
  vehicleType = "motorcycle",
  servicesToPlan = 8,
  freeServices = FREE_SERVICE_COUNT,
  firstKm = FIRST_SERVICE_KM,
  firstMonths = FIRST_SERVICE_MONTHS,
  secondKm = SECOND_SERVICE_KM,
  secondMonths = SECOND_SERVICE_MONTHS,
  intervalKm = SERVICE_INTERVAL_KM,
  intervalMonths = SERVICE_INTERVAL_MONTHS,
  labourPerPaidService = 400,
  partsPriceIndex = 100,
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
  ];
  if (!numbers.every(isNum)) return { error: "Enter valid numbers in every field." };
  if (!Number.isFinite(parseISODate(purchaseDate))) return { error: "Enter a valid purchase date." };
  if (!CONSUMABLES_BY_TYPE[vehicleType]) {
    return { error: "Choose either a motorcycle or a scooter." };
  }
  if (currentOdometerKm < 0) return { error: "Odometer reading cannot be negative." };
  if (currentOdometerKm > 500000) return { error: "Odometer reading looks too high for a two-wheeler." };
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
  if (partsPriceIndex < 0 || partsPriceIndex > 500) {
    return { error: "Parts price index should be between 0 and 500 percent." };
  }

  const list = CONSUMABLES_BY_TYPE[vehicleType];
  const priceFactor = partsPriceIndex / 100;
  const kmPerDay = monthlyKm / DAYS_PER_MONTH;
  const services = [];
  let previousDueKm = 0;
  let totalCost = 0;
  let totalPartsCost = 0;

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
    // Free services cover labour only; consumables are always chargeable.
    const cost = labour + partsCost;

    totalCost += cost;
    totalPartsCost += partsCost;

    services.push({
      index,
      dueKm,
      dueMonths,
      dueDate,
      dueBasis: useKm ? "distance" : "time",
      isFree,
      status: currentOdometerKm >= dueKm ? "done" : "upcoming",
      parts,
      partsCost,
      labour,
      cost,
    });

    previousDueKm = dueKm;
  }

  const next = services.find((service) => service.status === "upcoming") || null;

  return {
    brand: BRAND,
    vehicleType,
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
    routineTasks: ROUTINE_TASKS_BY_TYPE[vehicleType],
  };
}
