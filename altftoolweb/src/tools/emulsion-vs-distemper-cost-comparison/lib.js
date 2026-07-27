/**
 * Emulsion vs distemper - upfront cost and repaint-cycle economics.
 *
 * One paint job costs
 *
 *   jobCost = (area x coats / spreadingRate) x pricePerLitre + area x labourRate
 *
 * Over a planning horizon of H years, with a repaint every c years, the wall is
 * painted at t = 0, c, 2c, ... for every t < H, which is ceil(H / c) jobs.
 * Each job is discounted back to today at the real discount rate r:
 *
 *   PV = one-time prep + SUM over jobs of jobCost / (1 + r)^t
 *
 * The two options are then compared on equivalent annual cost, the level yearly
 * amount with the same present value over H years:
 *
 *   EAC = PV x r / (1 - (1 + r)^-H)        (r > 0)
 *   EAC = PV / H                           (r = 0)
 *
 * Prices are user inputs. Discounting is the honest way to compare a cheap
 * paint repainted often against a costly paint repainted rarely, because money
 * spent in year 9 is not the same as money spent today.
 */

/** Longest planning horizon accepted, in years. */
export const MAX_HORIZON_YEARS = 50;

/** Bounds on a sensible repaint interval, in years. */
export const MIN_CYCLE_YEARS = 0.5;
export const MAX_CYCLE_YEARS = 25;

/**
 * Starting figures for the two systems.
 *
 * Spreading rate is square feet per litre per coat on a smooth puttied wall:
 * manufacturers quote roughly 130-150 for interior acrylic emulsion and 90-110
 * for oil-bound distemper. Repaint intervals reflect common Indian residential
 * practice - an interior acrylic emulsion is usually good for 5 to 7 years,
 * while distemper is normally refreshed every 2 to 3 years because it chalks,
 * marks easily and cannot be washed. Prices are indicative rupee rates and are
 * meant to be replaced with your own quotes.
 */
export const SYSTEM_DEFAULTS = {
  emulsion: {
    id: "emulsion",
    label: "Acrylic emulsion",
    spreadingRate: 140,
    pricePerLitre: 250,
    coats: 2,
    cycleYears: 6,
    labourRatePerSqft: 18,
  },
  distemper: {
    id: "distemper",
    label: "Oil-bound distemper",
    spreadingRate: 100,
    pricePerLitre: 110,
    coats: 2,
    cycleYears: 3,
    labourRatePerSqft: 10,
  },
};

const isNum = (v) => Number.isFinite(v);

/** Material plus labour for one full repaint of the area. */
export function jobCost({ area, coats, spreadingRate, pricePerLitre, labourRatePerSqft }) {
  const litres = (area * coats) / spreadingRate;
  const material = litres * pricePerLitre;
  const labour = area * labourRatePerSqft;
  return { litres, material, labour, total: material + labour };
}

/** Years at which the wall is painted inside a horizon of H years. */
export function repaintYears(horizonYears, cycleYears) {
  const years = [];
  if (!(horizonYears > 0) || !(cycleYears > 0)) return years;
  const count = Math.ceil(horizonYears / cycleYears);
  for (let i = 0; i < count; i += 1) years.push(i * cycleYears);
  return years;
}

/** Equivalent annual cost of a present value over H years at rate r. */
export function equivalentAnnualCost(presentValue, rate, horizonYears) {
  if (!(horizonYears > 0)) return null;
  if (Math.abs(rate) < 1e-12) return presentValue / horizonYears;
  const factor = rate / (1 - Math.pow(1 + rate, -horizonYears));
  return Number.isFinite(factor) ? presentValue * factor : null;
}

/** Full lifecycle costing for one paint system. */
export function computeSystemLifecycle({
  area,
  coats,
  spreadingRate,
  pricePerLitre,
  labourRatePerSqft,
  cycleYears,
  horizonYears,
  discountRate,
  prepCost = 0,
}) {
  const per = jobCost({ area, coats, spreadingRate, pricePerLitre, labourRatePerSqft });
  const years = repaintYears(horizonYears, cycleYears);

  const schedule = years.map((year) => {
    const discountFactor = Math.pow(1 + discountRate, -year);
    return {
      year,
      cost: per.total,
      discountFactor,
      discountPct: discountFactor * 100,
      presentValue: per.total * discountFactor,
    };
  });

  const paintingPv = schedule.reduce((sum, row) => sum + row.presentValue, 0);
  const presentValue = paintingPv + prepCost;
  const nominalTotal = per.total * schedule.length + prepCost;

  return {
    perJob: per,
    jobs: schedule.length,
    repaints: Math.max(0, schedule.length - 1),
    schedule,
    prepCost,
    presentValue,
    nominalTotal,
    eac: equivalentAnnualCost(presentValue, discountRate, horizonYears),
    pvPerSqft: area > 0 ? presentValue / area : null,
  };
}

/**
 * Compare the two systems over one horizon.
 *
 * @returns {object} { emulsion, distemper, cheaper, breakEvenYear, ... } or { error }.
 */
export function compareEmulsionDistemper({
  area,
  horizonYears = 12,
  discountRatePct = 6,
  prepCost = 0,
  emulsion = {},
  distemper = {},
}) {
  const a = Number(area);
  const h = Number(horizonYears);
  const rPct = Number(discountRatePct);
  const prep = Number(prepCost);

  if (![a, h, rPct, prep].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (a <= 0) return { error: "Paintable area must be greater than zero." };
  if (a > 200000) return { error: "Paintable area above 2,00,000 sq ft is out of range." };
  if (h <= 0 || h > MAX_HORIZON_YEARS) {
    return { error: `The planning horizon should be between 1 and ${MAX_HORIZON_YEARS} years.` };
  }
  if (rPct <= -100 || rPct > 50) {
    return { error: "The discount rate should be between 0% and 50% a year." };
  }
  if (prep < 0) return { error: "One-time preparation cost cannot be negative." };

  const merged = {};
  for (const key of ["emulsion", "distemper"]) {
    const source = key === "emulsion" ? emulsion : distemper;
    const base = SYSTEM_DEFAULTS[key];
    const spec = {
      id: base.id,
      label: base.label,
      spreadingRate: Number(source.spreadingRate ?? base.spreadingRate),
      pricePerLitre: Number(source.pricePerLitre ?? base.pricePerLitre),
      coats: Number(source.coats ?? base.coats),
      cycleYears: Number(source.cycleYears ?? base.cycleYears),
      labourRatePerSqft: Number(source.labourRatePerSqft ?? base.labourRatePerSqft),
    };
    if (
      ![spec.spreadingRate, spec.pricePerLitre, spec.coats, spec.cycleYears, spec.labourRatePerSqft].every(
        isNum,
      )
    ) {
      return { error: `Enter valid numbers for the ${base.label.toLowerCase()} column.` };
    }
    if (spec.spreadingRate <= 0 || spec.spreadingRate > 500) {
      return { error: `${base.label}: spreading rate should be between 1 and 500 sq ft per litre per coat.` };
    }
    if (spec.pricePerLitre <= 0 || spec.pricePerLitre > 5000) {
      return { error: `${base.label}: price should be between 1 and 5,000 per litre.` };
    }
    if (spec.coats < 1 || spec.coats > 5) {
      return { error: `${base.label}: coats should be between 1 and 5.` };
    }
    if (spec.cycleYears < MIN_CYCLE_YEARS || spec.cycleYears > MAX_CYCLE_YEARS) {
      return {
        error: `${base.label}: the repaint interval should be between ${MIN_CYCLE_YEARS} and ${MAX_CYCLE_YEARS} years.`,
      };
    }
    if (spec.labourRatePerSqft < 0 || spec.labourRatePerSqft > 500) {
      return { error: `${base.label}: labour should be between 0 and 500 per sq ft.` };
    }
    merged[key] = spec;
  }

  const rate = rPct / 100;

  const build = (spec, horizon) =>
    computeSystemLifecycle({
      area: a,
      coats: spec.coats,
      spreadingRate: spec.spreadingRate,
      pricePerLitre: spec.pricePerLitre,
      labourRatePerSqft: spec.labourRatePerSqft,
      cycleYears: spec.cycleYears,
      horizonYears: horizon,
      discountRate: rate,
      prepCost: prep,
    });

  const emul = { ...merged.emulsion, ...build(merged.emulsion, h) };
  const dist = { ...merged.distemper, ...build(merged.distemper, h) };

  // First whole year at which emulsion's present value stops being the dearer
  // of the two. Null when distemper stays cheaper across the whole range.
  let breakEvenYear = null;
  for (let year = 1; year <= MAX_HORIZON_YEARS; year += 1) {
    const e = build(merged.emulsion, year).presentValue;
    const d = build(merged.distemper, year).presentValue;
    if (e <= d) {
      breakEvenYear = year;
      break;
    }
  }

  const saving = dist.presentValue - emul.presentValue;

  const rows = [];
  const seen = new Set();
  for (const entry of [...emul.schedule, ...dist.schedule]) seen.add(entry.year);
  for (const year of [...seen].sort((x, y) => x - y)) {
    const eRow = emul.schedule.find((s) => s.year === year) ?? null;
    const dRow = dist.schedule.find((s) => s.year === year) ?? null;
    rows.push({
      year,
      emulsion: eRow,
      distemper: dRow,
      discountPct: (eRow ?? dRow)?.discountPct ?? 0,
    });
  }

  return {
    emulsion: emul,
    distemper: dist,
    area: a,
    horizonYears: h,
    discountRatePct: rPct,
    prepCost: prep,
    cheaper: saving > 0 ? "emulsion" : saving < 0 ? "distemper" : "tie",
    savingWithEmulsion: saving,
    upfrontExtraForEmulsion: emul.perJob.total - dist.perJob.total,
    breakEvenYear,
    rows,
  };
}
