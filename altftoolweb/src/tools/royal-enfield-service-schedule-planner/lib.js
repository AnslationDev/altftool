/**
 * Royal Enfield periodic-maintenance planner.
 *
 * How a motorcycle service schedule actually works
 * ------------------------------------------------
 * Every manufacturer states a periodic maintenance interval as a PAIR of limits
 * — a distance and an elapsed time — and the service falls due at whichever
 * arrives first. Royal Enfield's published pattern for its current line-up is:
 *
 *   Running-in service : 500 km or 45 days from delivery (first service)
 *   Then periodic      : every 5,000 km or 6 months for the 350 J-platform and
 *                        the 650 twins; every 10,000 km or 12 months for the
 *                        Sherpa 450 platform (Himalayan 450, Guerrilla 450).
 *
 * Those figures vary by model year and by market, so every interval below is a
 * preset the rider can overwrite with the number printed in their own owner's
 * manual. Nothing here is a substitute for that manual.
 *
 * Consumable items are expressed as MULTIPLES of the service interval, which is
 * how service booklets lay them out, plus a hard calendar limit where the item
 * degrades with time rather than distance (brake fluid and coolant absorb
 * moisture whether the bike is ridden or not).
 *
 * All functions are pure: today's date is always passed in, never read from the
 * clock, and invalid input returns { error } rather than a bad number.
 */

/** 365.25 / 12 — the mean Gregorian month, used to convert km/month to days. */
export const AVG_DAYS_PER_MONTH = 365.25 / 12;

/** Royal Enfield's running-in (first) service, common to the whole range. */
export const FIRST_SERVICE_KM = 500;
export const FIRST_SERVICE_DAYS = 45;

/** A service is flagged "due soon" inside this window on either limit. */
export const DUE_SOON_KM = 500;
export const DUE_SOON_DAYS = 21;

/**
 * Model presets. `serviceKm` / `serviceMonths` are the manufacturer's stated
 * periodic-maintenance interval; `liquidCooled` decides whether a coolant task
 * appears at all. Tank capacity is the published usable+reserve figure and is
 * editable in the tool because it differs across model years.
 */
export const RE_MODELS = [
  { id: "classic-350", label: "Classic 350 (J-platform)", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 13, mileageKmpl: 35 },
  { id: "bullet-350", label: "Bullet 350 (J-platform)", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 13, mileageKmpl: 35 },
  { id: "hunter-350", label: "Hunter 350", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 13, mileageKmpl: 36 },
  { id: "meteor-350", label: "Meteor 350", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 15, mileageKmpl: 35 },
  { id: "goan-classic-350", label: "Goan Classic 350", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 13, mileageKmpl: 34 },
  { id: "interceptor-650", label: "Interceptor 650", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 13.7, mileageKmpl: 25 },
  { id: "continental-gt-650", label: "Continental GT 650", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 12.5, mileageKmpl: 25 },
  { id: "super-meteor-650", label: "Super Meteor 650", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 15.7, mileageKmpl: 24 },
  { id: "shotgun-650", label: "Shotgun 650", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 13.8, mileageKmpl: 24 },
  { id: "himalayan-411", label: "Himalayan 411 / Scram 411", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 15, mileageKmpl: 30 },
  { id: "himalayan-450", label: "Himalayan 450 (Sherpa)", serviceKm: 10000, serviceMonths: 12, liquidCooled: true, tankLitres: 17, mileageKmpl: 30 },
  { id: "guerrilla-450", label: "Guerrilla 450", serviceKm: 10000, serviceMonths: 12, liquidCooled: true, tankLitres: 11, mileageKmpl: 32 },
  { id: "custom", label: "Other / custom interval", serviceKm: 5000, serviceMonths: 6, liquidCooled: false, tankLitres: 14, mileageKmpl: 30 },
];

/**
 * Consumables. `everyServices` = how many periodic services apart the job is,
 * so it scales automatically with the model's own interval.
 * `maxMonths` is a hard calendar cap for items that age regardless of use.
 * `liquidCooledOnly` items are skipped on air/oil-cooled engines.
 */
export const MAINTENANCE_ITEMS = [
  { id: "engine-oil", label: "Engine oil + oil filter", everyServices: 1, maxMonths: 12, note: "Changed at every periodic service; oil oxidises with time as well as distance." },
  { id: "air-filter-clean", label: "Air filter — clean / inspect", everyServices: 1, maxMonths: 12, note: "Clean at every service; far more often in dusty or off-road use." },
  { id: "chain-adjust", label: "Drive chain — clean, lube and set slack", everyServices: 1, maxMonths: 6, note: "Slack and lubrication also need checking roughly every 500 km of riding." },
  { id: "brake-inspect", label: "Brake pads and discs — inspect", everyServices: 1, maxMonths: 12, note: "Replace pads on wear, not on a fixed interval." },
  { id: "air-filter-replace", label: "Air filter — replace", everyServices: 2, maxMonths: 24, note: "A clogged filter richens the mixture and costs fuel economy." },
  { id: "spark-plug", label: "Spark plug(s) — replace", everyServices: 2, maxMonths: 24, note: "Twin-plug 350s and the 650 twins carry more than one plug per engine." },
  { id: "valve-clearance", label: "Valve clearance — check and shim", everyServices: 2, maxMonths: 36, note: "A tappet check is a workshop job; noisy top end means bring it forward." },
  { id: "brake-fluid", label: "Brake fluid — replace", everyServices: 4, maxMonths: 24, note: "DOT 4 is hygroscopic: it absorbs water and loses boiling point on a shelf." },
  { id: "coolant", label: "Coolant — replace", everyServices: 2, maxMonths: 24, liquidCooledOnly: true, note: "Only on the liquid-cooled Sherpa 450 platform." },
  { id: "fork-oil", label: "Front fork oil — replace", everyServices: 4, maxMonths: 36, note: "Also do this the moment a seal starts weeping." },
];

/** Chain lubrication interval used for trip planning (km). */
export const CHAIN_LUBE_KM = 500;

/** Reserve you should never plan to use up — fraction of tank left at a stop. */
export const FUEL_RESERVE_FRACTION = 0.15;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

const round = (v, dp = 2) => {
  if (!Number.isFinite(v)) return 0;
  const f = 10 ** dp;
  return Math.round((v + Number.EPSILON) * f) / f;
};

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight timestamp, or null. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ts = Date.UTC(year, month - 1, day);
  const d = new Date(ts);
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  return ts;
}

const MS_PER_DAY = 86400000;

/** Whole days from a to b (both UTC-midnight timestamps). */
export function daysBetween(aTs, bTs) {
  return Math.round((bTs - aTs) / MS_PER_DAY);
}

/** Add whole months, clamping the day of month (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(ts, months) {
  const d = new Date(ts);
  const day = d.getUTCDate();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay));
}

/** Format a UTC timestamp back to yyyy-mm-dd. */
export function toISODate(ts) {
  if (!Number.isFinite(ts)) return "";
  return new Date(ts).toISOString().slice(0, 10);
}

export function getModel(modelId) {
  return RE_MODELS.find((m) => m.id === modelId) || RE_MODELS[0];
}

function statusFor(kmRemaining, daysRemaining) {
  if (kmRemaining <= 0 || daysRemaining <= 0) return "overdue";
  if (kmRemaining <= DUE_SOON_KM || daysRemaining <= DUE_SOON_DAYS) return "due-soon";
  return "ok";
}

/**
 * Build the forward service schedule.
 *
 * Distance due date is projected from the riding rate:
 *   days = (dueKm - odometerKm) / (monthlyKm / AVG_DAYS_PER_MONTH)
 * Calendar due date is lastServiceDate + n months.
 * The service falls due on the EARLIER of the two, which is the rule printed in
 * the maintenance schedule.
 */
export function planServiceSchedule({
  modelId,
  serviceKm,
  serviceMonths,
  odometerKm,
  lastServiceKm,
  lastServiceDate,
  monthlyKm,
  today,
  servicesAhead = 4,
}) {
  const model = getModel(modelId);

  const intervalKm = isNum(serviceKm) ? serviceKm : model.serviceKm;
  const intervalMonths = isNum(serviceMonths) ? serviceMonths : model.serviceMonths;

  if (!isNum(odometerKm) || odometerKm < 0) {
    return { error: "Enter the current odometer reading in kilometres." };
  }
  if (odometerKm > 1000000) {
    return { error: "That odometer reading is beyond any realistic mileage — check the number." };
  }
  if (!isNum(lastServiceKm) || lastServiceKm < 0) {
    return { error: "Enter the odometer reading at the last service (use 0 for a brand-new bike)." };
  }
  if (lastServiceKm > odometerKm) {
    return { error: "The last-service odometer reading cannot be higher than the current reading." };
  }
  if (!isNum(intervalKm) || intervalKm < 500 || intervalKm > 30000) {
    return { error: "Service interval should be between 500 km and 30,000 km." };
  }
  if (!isNum(intervalMonths) || intervalMonths < 1 || intervalMonths > 36) {
    return { error: "Service interval should be between 1 and 36 months." };
  }
  if (!isNum(monthlyKm) || monthlyKm <= 0) {
    return { error: "Enter how many kilometres you ride in an average month — it must be above zero." };
  }
  if (monthlyKm > 20000) {
    return { error: "Riding more than 20,000 km a month is not a realistic average — check the number." };
  }

  const todayTs = parseISODate(today);
  if (todayTs === null) return { error: "Today's date is not a valid yyyy-mm-dd date." };
  const lastTs = parseISODate(lastServiceDate);
  if (lastTs === null) return { error: "Enter the last service date as a valid calendar date." };
  if (lastTs > todayTs) return { error: "The last service date is in the future." };

  const kmPerDay = monthlyKm / AVG_DAYS_PER_MONTH;
  const isRunningIn = lastServiceKm < FIRST_SERVICE_KM && odometerKm < FIRST_SERVICE_KM * 4;

  const rows = [];
  let baseKm = lastServiceKm;
  let baseTs = lastTs;
  let serviceNumber = 0;

  // Service numbering: how many periodic intervals have already been covered.
  const completed = Math.floor(Math.max(0, lastServiceKm) / intervalKm);

  for (let i = 0; i < Math.max(1, Math.min(12, servicesAhead)); i += 1) {
    let dueKm;
    let dueByDateTs;

    if (i === 0 && isRunningIn) {
      // Running-in service: 500 km or 45 days from the delivery/last-service date.
      dueKm = FIRST_SERVICE_KM;
      dueByDateTs = baseTs + FIRST_SERVICE_DAYS * MS_PER_DAY;
      serviceNumber = 1;
    } else {
      const step = i === 0 || !isRunningIn ? i + 1 : i;
      dueKm = (completed + step) * intervalKm;
      if (dueKm <= baseKm) dueKm = baseKm + intervalKm * step;
      dueByDateTs = addMonths(baseTs, intervalMonths * step);
      serviceNumber = completed + step + (isRunningIn ? 1 : 0);
    }

    const kmRemaining = round(dueKm - odometerKm, 0);
    const daysByKm = Math.round((dueKm - odometerKm) / kmPerDay);
    const dueByKmTs = todayTs + daysByKm * MS_PER_DAY;
    const dueTs = Math.min(dueByKmTs, dueByDateTs);
    const limit = dueByKmTs <= dueByDateTs ? "distance" : "time";
    const daysRemaining = daysBetween(todayTs, dueTs);

    rows.push({
      serviceNumber,
      isFirstService: i === 0 && isRunningIn,
      dueKm: round(dueKm, 0),
      dueDate: toISODate(dueTs),
      dueByKmDate: toISODate(dueByKmTs),
      dueByTimeDate: toISODate(dueByDateTs),
      limit,
      kmRemaining,
      daysRemaining,
      status: statusFor(kmRemaining, daysRemaining),
      jobs: MAINTENANCE_ITEMS.filter((item) => {
        if (item.liquidCooledOnly && !model.liquidCooled) return false;
        // Periodic-service counter. On a running-in bike row 0 is the 500 km
        // service (counted as 1) and row 1 is periodic service 1, so the
        // multiples line up with the booklet rather than the row index.
        const n = isRunningIn ? (i === 0 ? 1 : i) : completed + i + 1;
        return n % item.everyServices === 0;
      }).map((item) => item.label),
    });
  }

  const next = rows[0];
  const kmSinceService = round(odometerKm - lastServiceKm, 0);
  const daysSinceService = daysBetween(lastTs, todayTs);
  const intervalUsedPct = round(
    Math.max(
      (kmSinceService / (next.dueKm - lastServiceKm || intervalKm)) * 100,
      (daysSinceService / (intervalMonths * AVG_DAYS_PER_MONTH)) * 100,
    ),
    1,
  );

  return {
    model: model.label,
    liquidCooled: model.liquidCooled,
    intervalKm,
    intervalMonths,
    isRunningIn,
    kmPerDay: round(kmPerDay, 1),
    kmSinceService,
    daysSinceService,
    intervalUsedPct: Math.min(999, intervalUsedPct),
    next,
    rows,
  };
}

/**
 * Consumable tracker: how much life is left on each item, in km and in months,
 * measured from the last time that specific item was done.
 */
export function planConsumables({ modelId, serviceKm, serviceMonths, odometerKm, lastServiceKm, lastServiceDate, today }) {
  const model = getModel(modelId);
  const intervalKm = isNum(serviceKm) ? serviceKm : model.serviceKm;
  const intervalMonths = isNum(serviceMonths) ? serviceMonths : model.serviceMonths;

  if (!isNum(odometerKm) || odometerKm < 0) return { error: "Enter a valid odometer reading." };
  if (!isNum(lastServiceKm) || lastServiceKm < 0 || lastServiceKm > odometerKm) {
    return { error: "Last-service odometer must be between 0 and the current reading." };
  }
  if (!isNum(intervalKm) || intervalKm <= 0) return { error: "Service interval must be above zero." };

  const todayTs = parseISODate(today);
  const lastTs = parseISODate(lastServiceDate);
  if (todayTs === null || lastTs === null) return { error: "Enter valid dates." };

  const kmSince = odometerKm - lastServiceKm;
  const daysSince = Math.max(0, daysBetween(lastTs, todayTs));

  const items = MAINTENANCE_ITEMS.filter(
    (item) => !item.liquidCooledOnly || model.liquidCooled,
  ).map((item) => {
    const dueKm = intervalKm * item.everyServices;
    const dueDays = Math.min(item.maxMonths, intervalMonths * item.everyServices) * AVG_DAYS_PER_MONTH;
    const kmLeft = round(dueKm - kmSince, 0);
    const daysLeft = Math.round(dueDays - daysSince);
    const usedPct = round(Math.max((kmSince / dueKm) * 100, (daysSince / dueDays) * 100), 0);
    return {
      id: item.id,
      label: item.label,
      note: item.note,
      dueEveryKm: round(dueKm, 0),
      dueEveryMonths: Math.min(item.maxMonths, intervalMonths * item.everyServices),
      kmLeft,
      daysLeft,
      usedPct: Math.min(999, usedPct),
      status: statusFor(kmLeft, daysLeft),
    };
  });

  return { items, kmSince: round(kmSince, 0), daysSince };
}

/**
 * Touring prep. Two pieces of real arithmetic:
 *   fuel stops  = ceil(tripKm / usable range) - 1, where usable range keeps a
 *                 15% reserve in the tank rather than running it to fumes.
 *   chain lubes = ceil(tripKm / 500), the standard chain-care interval.
 * It also warns when a periodic service will fall due mid-trip.
 */
export function planTouringPrep({
  modelId,
  tripKm,
  tankLitres,
  mileageKmpl,
  odometerKm,
  nextServiceKm,
  dailyRidingKm,
}) {
  const model = getModel(modelId);
  const tank = isNum(tankLitres) ? tankLitres : model.tankLitres;
  const kmpl = isNum(mileageKmpl) ? mileageKmpl : model.mileageKmpl;

  if (!isNum(tripKm) || tripKm <= 0) return { error: "Enter the planned trip distance in kilometres." };
  if (tripKm > 100000) return { error: "That trip distance is unrealistically long — check the number." };
  if (!isNum(tank) || tank <= 0) return { error: "Fuel tank capacity must be greater than zero litres." };
  if (!isNum(kmpl) || kmpl <= 0) return { error: "Fuel economy must be greater than zero km per litre." };
  if (!isNum(dailyRidingKm) || dailyRidingKm <= 0) {
    return { error: "Enter how many kilometres you plan to cover per riding day." };
  }

  const fullRangeKm = tank * kmpl;
  const usableRangeKm = fullRangeKm * (1 - FUEL_RESERVE_FRACTION);
  const fuelStops = Math.max(0, Math.ceil(tripKm / usableRangeKm) - 1);
  const litresNeeded = tripKm / kmpl;
  const chainLubes = Math.ceil(tripKm / CHAIN_LUBE_KM);
  const ridingDays = Math.ceil(tripKm / dailyRidingKm);

  const serviceDuringTrip =
    isNum(nextServiceKm) && isNum(odometerKm) && nextServiceKm > 0
      ? nextServiceKm <= odometerKm + tripKm
      : false;

  return {
    model: model.label,
    tankLitres: round(tank, 1),
    mileageKmpl: round(kmpl, 1),
    fullRangeKm: round(fullRangeKm, 0),
    usableRangeKm: round(usableRangeKm, 0),
    fuelStops,
    litresNeeded: round(litresNeeded, 1),
    chainLubes,
    ridingDays,
    serviceDuringTrip,
    kmAtTripEnd: isNum(odometerKm) ? round(odometerKm + tripKm, 0) : null,
  };
}

/** Items worth carrying on a long Royal Enfield run, grouped for a packing list. */
export const TOURING_CHECKLIST = [
  {
    group: "Do before you leave",
    items: [
      "Chain cleaned, lubed and slack set to the manual's figure",
      "Tyre pressures set cold, including the spare tube pressure",
      "Brake pad thickness and fluid level checked",
      "All fasteners on luggage racks and crash guards torqued",
      "Battery terminals clean and headlight/indicators working",
      "Service booklet and insurance/PUC papers on the bike",
    ],
  },
  {
    group: "Tools and spares to carry",
    items: [
      "OE tool kit plus a socket set for the axle nuts",
      "Tube puncture kit, tyre levers and a hand pump or compressor",
      "Spare clutch and accelerator cable",
      "Spare spark plug and fuses",
      "Chain lube and a rag for on-tour lubing",
      "Zip ties, M-Seal, insulation tape and steel wire",
    ],
  },
  {
    group: "Rider kit",
    items: [
      "Helmet, gloves, riding jacket with armour, boots",
      "Rain gear and waterproof bag liners",
      "Hydration bladder or bottles",
      "Torch, power bank and a phone mount that survives corrugations",
    ],
  },
];
