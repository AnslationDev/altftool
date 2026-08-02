/**
 * Hero motorcycle service schedule planner.
 *
 * How the schedule is built:
 *  - Hero MotoCorp two-wheelers follow a "first service early, then a fixed
 *    periodic interval" pattern. The first service is a running-in check at
 *    roughly 750 km or 1 month, the second lands at about 3,000 km or 3 months,
 *    and every service after that repeats on the same 3,000 km / 3 month cycle.
 *  - Every milestone is "whichever comes first" - distance or time. The planner
 *    therefore dates each service at the earlier of the two.
 *  - Free services are the first N visits under the standard Hero package; the
 *    rest are paid, and only paid visits carry a labour charge.
 *
 * The interval numbers are the commonly published ones and are exposed as
 * editable inputs, because Hero varies them by model and by warranty package.
 * Always confirm against the maintenance chart in your own owner's manual.
 */

export const BRAND = "Hero";

/** Running-in service: Hero's first visit is due at about 750 km or 1 month. */
export const FIRST_SERVICE_KM = 750;
export const FIRST_SERVICE_MONTHS = 1;
/** Second visit anchors the periodic cycle at about 3,000 km or 3 months. */
export const SECOND_SERVICE_KM = 3000;
export const SECOND_SERVICE_MONTHS = 3;
/** Every visit after the second repeats on this periodic interval. */
export const SERVICE_INTERVAL_KM = 3000;
export const SERVICE_INTERVAL_MONTHS = 3;
/** Standard Hero package on most models covers this many free services. */
export const FREE_SERVICE_COUNT = 5;
/** Planning more than 20 visits ahead is guesswork, not a schedule. */
export const MAX_SERVICES = 20;
/** Far above the largest real consumable interval (30,000 km); guards against date overflow. */
export const MAX_SERVICE_KM = 100000;
/** Mean length of a Gregorian calendar month in days (365.2425 / 12). */
export const DAYS_PER_MONTH = 30.436875;

/**
 * Consumables and their replacement distance, with indicative genuine-part
 * prices in INR. Prices move, so the planner scales them with a price index.
 */
export const CONSUMABLES = [
  { key: "engineOil", name: "Engine oil (10W30 SL grade)", firstKm: "first-service", intervalKm: 6000, price: 450 },
  { key: "oilFilter", name: "Oil strainer / centrifugal filter clean", firstKm: "first-service", intervalKm: 6000, price: 120 },
  { key: "airFilter", name: "Air filter element", firstKm: null, intervalKm: 12000, price: 320 },
  { key: "sparkPlug", name: "Spark plug", firstKm: null, intervalKm: 12000, price: 180 },
  { key: "brakeShoes", name: "Brake shoes / pads", firstKm: null, intervalKm: 24000, price: 650 },
  { key: "chainKit", name: "Chain and sprocket kit", firstKm: null, intervalKm: 24000, price: 1900 },
  { key: "clutchPlates", name: "Clutch plate set", firstKm: null, intervalKm: 30000, price: 950 },
];

/** Checks carried out at every visit, free or paid. */
export const ROUTINE_TASKS = [
  "Engine oil level and top-up",
  "Drive chain tension and lubrication",
  "Front and rear brake free play",
  "Clutch and throttle free play",
  "Tyre pressure and tread check",
  "Battery terminals and all lights",
];

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

/** Which consumables are replaced at a given milestone. */
export function consumablesDueAt(dueKm, previousDueKm, actualFirstKm) {
  return CONSUMABLES.filter((item) => {
    const itemFirstKm = item.firstKm === "first-service" ? actualFirstKm : item.firstKm;
    if (itemFirstKm !== null && previousDueKm < itemFirstKm && dueKm >= itemFirstKm) return true;
    if (!(item.intervalKm > 0)) return false;
    return Math.floor(dueKm / item.intervalKm) > Math.floor(previousDueKm / item.intervalKm);
  });
}

/**
 * Build the full service plan. Pure: the purchase date is an argument.
 */
export function planServiceSchedule({
  purchaseDate = "2026-01-01",
  currentOdometerKm = 0,
  monthlyKm = 800,
  servicesToPlan = 8,
  freeServices = FREE_SERVICE_COUNT,
  firstKm = FIRST_SERVICE_KM,
  firstMonths = FIRST_SERVICE_MONTHS,
  secondKm = SECOND_SERVICE_KM,
  secondMonths = SECOND_SERVICE_MONTHS,
  intervalKm = SERVICE_INTERVAL_KM,
  intervalMonths = SERVICE_INTERVAL_MONTHS,
  labourPerPaidService = 350,
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
  if (firstKm > MAX_SERVICE_KM || secondKm > MAX_SERVICE_KM || intervalKm > MAX_SERVICE_KM) {
    return { error: `Service distances should be ${MAX_SERVICE_KM.toLocaleString()} km or fewer.` };
  }
  if (secondKm <= firstKm) {
    return { error: "The second service must fall due after the first one." };
  }
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
    const msMonths = parseISODate(dateByMonths);
    const msKm = parseISODate(dateByKm);
    const useKm = msKm <= msMonths;
    const dueDate = useKm ? dateByKm : dateByMonths;

    const parts = consumablesDueAt(dueKm, previousDueKm, firstKm).map((item) => ({
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
  const completed = services.filter((service) => service.status === "done").length;

  return {
    brand: BRAND,
    services,
    next,
    completed,
    freeServices: free,
    servicesPlanned: count,
    totalCost,
    totalPartsCost,
    totalLabourCost: totalCost - totalPartsCost,
    coversKm: services.length ? services[services.length - 1].dueKm : 0,
    kmToNext: next ? Math.max(0, next.dueKm - currentOdometerKm) : 0,
    routineTasks: ROUTINE_TASKS,
  };
}
