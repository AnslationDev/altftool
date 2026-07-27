/**
 * Two-wheeler fuel log — the tank-to-tank method.
 *
 * The only honest way to measure mileage from a fuel log is to bracket a
 * distance between two FULL tanks. The litres you put in at the second fill are
 * exactly the litres burnt since the first, because the tank starts and ends at
 * the same level:
 *
 *      segment distance = odometer(full fill) - odometer(previous full fill)
 *      segment litres   = every litre added since that previous full fill
 *      segment mileage  = distance / litres
 *
 * Partial top-ups do not close a segment. Their litres are carried forward and
 * counted against the distance when the next full tank closes it, which is why
 * a log that mixes full and partial fills still gives correct numbers.
 *
 * The first fill in a log establishes the baseline only. Its fuel paid for
 * distance ridden before the log started, so it is excluded from mileage and
 * from cost per kilometre (it is still shown in total spend).
 *
 * OVERALL AVERAGE — this is where most spreadsheets go wrong. The fleet average
 * is total distance divided by total litres, not the arithmetic mean of the
 * per-tank km/l figures. Averaging ratios over-weights the small tanks; the
 * distance-weighted figure is the one that predicts your fuel bill.
 */

/** Sanity ceilings: nothing on two wheels does better than this on petrol. */
const MAX_PLAUSIBLE_KMPL = 200;
const MAX_ODOMETER_KM = 1_000_000;
const MAX_LITRES_PER_FILL = 40;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {Array<{odometer:number, litres:number, pricePerLitre:number, fullTank:boolean, label?:string}>} input.entries
 *        fill-ups in the order they happened, oldest first
 * @param {number} [input.monthlyKm] optional monthly distance, to project running cost
 */
export function computeFuelLog({ entries = [], monthlyKm = 0 }) {
  if (!Array.isArray(entries) || entries.length < 2)
    return { error: "Log at least two fill-ups — mileage is measured between them, not from one." };
  if (!isNum(monthlyKm) || monthlyKm < 0)
    return { error: "Monthly distance must be zero or more." };

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    if (![entry.odometer, entry.litres, entry.pricePerLitre].every(isNum))
      return { error: `Fill-up ${i + 1}: enter a valid odometer reading, litres and price.` };
    if (entry.odometer < 0 || entry.odometer > MAX_ODOMETER_KM)
      return { error: `Fill-up ${i + 1}: odometer must be between 0 and ${MAX_ODOMETER_KM.toLocaleString("en-IN")} km.` };
    if (entry.litres <= 0) return { error: `Fill-up ${i + 1}: litres must be greater than zero.` };
    if (entry.litres > MAX_LITRES_PER_FILL)
      return { error: `Fill-up ${i + 1}: ${MAX_LITRES_PER_FILL} litres is more than any two-wheeler tank holds.` };
    if (entry.pricePerLitre < 0)
      return { error: `Fill-up ${i + 1}: price per litre cannot be negative.` };
    if (i > 0 && entry.odometer <= entries[i - 1].odometer)
      return { error: `Fill-up ${i + 1}: the odometer must be higher than the fill-up before it.` };
  }

  if (!entries[0].fullTank)
    return { error: "Start the log with a full tank — a partial first fill has no level to measure from." };

  const segments = [];
  let anchorOdo = entries[0].odometer;
  let pendingLitres = 0;
  let pendingCost = 0;
  let carriedFills = 0;

  for (let i = 1; i < entries.length; i += 1) {
    const entry = entries[i];
    pendingLitres += entry.litres;
    pendingCost += entry.litres * entry.pricePerLitre;
    carriedFills += 1;

    if (!entry.fullTank) continue;

    const distance = entry.odometer - anchorOdo;
    const kmpl = distance / pendingLitres;
    if (kmpl > MAX_PLAUSIBLE_KMPL)
      return {
        error: `Fill-up ${i + 1} works out to ${Math.round(kmpl)} km/l — check the odometer reading or the litres.`,
      };

    segments.push({
      index: segments.length + 1,
      fromOdo: anchorOdo,
      toOdo: entry.odometer,
      distance,
      litres: pendingLitres,
      cost: pendingCost,
      kmpl,
      costPerKm: pendingCost / distance,
      fillsCounted: carriedFills,
      label: entry.label ?? "",
    });

    anchorOdo = entry.odometer;
    pendingLitres = 0;
    pendingCost = 0;
    carriedFills = 0;
  }

  if (segments.length === 0)
    return {
      error: "Every fill after the first is a partial top-up — add one full tank to close a measurable stretch.",
    };

  const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
  const totalLitres = segments.reduce((sum, seg) => sum + seg.litres, 0);
  const measuredCost = segments.reduce((sum, seg) => sum + seg.cost, 0);

  // Distance-weighted average — the figure that predicts the fuel bill.
  const averageKmpl = totalDistance / totalLitres;
  // Plain mean of the per-tank figures, shown only to expose the difference.
  const meanOfTanksKmpl = segments.reduce((sum, seg) => sum + seg.kmpl, 0) / segments.length;

  const costPerKm = measuredCost / totalDistance;
  const costPer100Km = costPerKm * 100;
  const averagePricePerLitre = measuredCost / totalLitres;

  const best = segments.reduce((a, b) => (b.kmpl > a.kmpl ? b : a));
  const worst = segments.reduce((a, b) => (b.kmpl < a.kmpl ? b : a));
  const latest = segments[segments.length - 1];
  const latestVsAveragePct = ((latest.kmpl - averageKmpl) / averageKmpl) * 100;
  const spreadPct = ((best.kmpl - worst.kmpl) / worst.kmpl) * 100;

  // Trend across the log: compare the newer half of the segments with the older
  // half, distance-weighted within each half so one short tank cannot skew it.
  let trend = null;
  if (segments.length >= 4) {
    const half = Math.floor(segments.length / 2);
    const older = segments.slice(0, half);
    const newer = segments.slice(segments.length - half);
    const weighted = (list) =>
      list.reduce((sum, seg) => sum + seg.distance, 0) / list.reduce((sum, seg) => sum + seg.litres, 0);
    const olderKmpl = weighted(older);
    const newerKmpl = weighted(newer);
    trend = {
      olderKmpl,
      newerKmpl,
      changePct: ((newerKmpl - olderKmpl) / olderKmpl) * 100,
      direction: newerKmpl > olderKmpl ? "improving" : newerKmpl < olderKmpl ? "worsening" : "flat",
    };
  }

  const loggedSpend = entries.reduce((sum, entry) => sum + entry.litres * entry.pricePerLitre, 0);
  const openLitres = pendingLitres;

  const monthlyRunningCost = monthlyKm > 0 ? monthlyKm * costPerKm : 0;
  const monthlyLitres = monthlyKm > 0 ? monthlyKm / averageKmpl : 0;
  const annualRunningCost = monthlyRunningCost * 12;

  const notes = [];
  if (openLitres > 0) {
    notes.push(
      `${openLitres.toFixed(2)} L from partial top-ups after the last full tank are not counted yet — they will be, once you next fill to the brim.`,
    );
  }
  if (Math.abs(averageKmpl - meanOfTanksKmpl) >= 0.5) {
    notes.push(
      `Your true average is ${averageKmpl.toFixed(1)} km/l. Simply averaging the per-tank figures would say ${meanOfTanksKmpl.toFixed(1)} km/l — that shortcut over-weights the small tanks.`,
    );
  }
  if (spreadPct >= 15) {
    notes.push(
      `Best and worst tanks differ by ${spreadPct.toFixed(0)}%. That much spread usually means inconsistent filling (the nozzle cut-off point) rather than a real change in the engine — always fill to the same brim.`,
    );
  }
  if (trend && Math.abs(trend.changePct) >= 5) {
    notes.push(
      `Mileage is ${trend.direction}: ${trend.newerKmpl.toFixed(1)} km/l over the recent tanks against ${trend.olderKmpl.toFixed(1)} km/l earlier, a ${Math.abs(trend.changePct).toFixed(0)}% change. Tyre pressure, chain slack and a clogged air filter are the usual causes of a drop.`,
    );
  }

  return {
    segments,
    totalDistance,
    totalLitres,
    measuredCost,
    loggedSpend,
    averageKmpl,
    meanOfTanksKmpl,
    costPerKm,
    costPer100Km,
    averagePricePerLitre,
    best,
    worst,
    latest,
    latestVsAveragePct,
    spreadPct,
    trend,
    openLitres,
    monthlyKm,
    monthlyLitres,
    monthlyRunningCost,
    annualRunningCost,
    notes,
  };
}
