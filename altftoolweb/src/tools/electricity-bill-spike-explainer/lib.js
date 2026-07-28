/**
 * Electricity bill spike explainer.
 *
 * What this file does
 * -------------------
 * Given two billing months (units consumed and the rupee amount actually paid, for each) it
 * splits the CHANGE in the bill into components that add back up exactly to that change.
 *
 * Rules implemented
 * -----------------
 * 1. Indian domestic LT-1 supply is billed on TELESCOPIC slabs: each block of units is charged
 *    at that block's own rate, so crossing a slab boundary re-prices only the units above the
 *    boundary, not the whole bill. The slab walk itself is not re-implemented here — it is
 *    imported from the household electricity bill module (`computeSlabEnergyCharge`), which is
 *    the single copy of the slab arithmetic and of the state tariff table in this codebase.
 *
 * 2. The energy-charge change is decomposed against the MARGINAL rate that applied at the
 *    lower of the two months' consumption. Writing E(u) for the telescopic energy charge at u
 *    units, u0 for the earlier month, u1 for the later month, and m for the rate charged on the
 *    first unit above min(u0, u1):
 *
 *        E(u1) - E(u0)  =  (u1 - u0) x m            <- extra units at the rate already in force
 *                        + [ E(u1) - E(u0) - (u1 - u0) x m ]   <- slab creep
 *
 *    The bracketed remainder is exactly zero when the whole change stays inside one slab, and
 *    becomes positive only when the extra units spilled into higher-priced blocks. That is the
 *    number people mistake for "my usage doubled".
 *
 * 3. Fixed / demand charge is levied per month regardless of units, so it changes the bill only
 *    if the charge itself changed (sanctioned-load revision, tariff order). Its contribution is
 *    (fixed of later month - fixed of earlier month) and is normally zero.
 *
 * 4. A fuel / power-purchase adjustment surcharge (FPPPA, FPPCA, FCA — the name differs by
 *    state) is levied per unit and is re-notified periodically, so both the rate and the units
 *    it multiplies can change. Its contribution is (u1 x s1) - (u0 x s0).
 *
 * 5. Electricity duty / tax is a percentage of (energy charge + fixed charge + surcharge), so it
 *    rises mechanically with everything above it. It is reported on its own line so it is never
 *    confused with a rate rise.
 *
 * 6. Whatever the modelled charges do not account for in the amount actually paid — arrears,
 *    subsidy, meter rent, rebates, rounding, a DISCOM rate that differs from the indicative
 *    table — is reported as "other charges" rather than being hidden. Because of this the six
 *    components sum to the real rupee change on the two bills, not to a modelled change.
 *
 * Tariff provenance
 * -----------------
 * `STATE_TARIFFS` in the household electricity bill module carries no tariff-order date, order
 * number or DISCOM name; its own header describes the rates as indicative domestic LT-1 rates
 * "as published in the respective state regulator's retail supply tariff order", with no date.
 * No date is invented here. `TARIFF_SOURCE_NOTE` states that limitation verbatim so the page can
 * show it, and the reconciliation in rule 6 is what keeps the totals tied to the user's own bill.
 */

import {
  STATE_TARIFFS,
  computeSlabEnergyCharge,
  getStateTariff,
} from "../household-electricity-bill/lib.js";

export { STATE_TARIFFS, getStateTariff };

/**
 * Provenance of the slab rates. The source module records no tariff-order date or DISCOM, so
 * none is asserted. Stated in full so the UI can print it beside every modelled figure.
 */
export const TARIFF_SOURCE_NOTE =
  "Slab rates, fixed charge and duty percentage come from the indicative domestic LT-1 " +
  "(single phase) table shipped in AltFTool's household electricity bill module. That table " +
  "carries no tariff-order date, order number or DISCOM name, so no date is shown here. " +
  "Rates differ by DISCOM within a state and are revised each financial year — the exact rates " +
  "and the order they come from are printed on your own bill.";

/** Highest monthly consumption accepted. A domestic single-phase connection above this is not domestic. */
export const MAX_MONTHLY_UNITS = 20000;

/** Highest monthly bill amount accepted, in rupees. Guard against a stray extra digit. */
export const MAX_BILL_AMOUNT = 10000000;

/** Highest per-unit fuel surcharge accepted, in rupees per unit. FPPPA rates are in paise, never rupees-plenty. */
export const MAX_SURCHARGE_PER_UNIT = 50;

/** Highest monthly fixed / demand charge accepted, in rupees. */
export const MAX_FIXED_CHARGE = 100000;

/**
 * Share of the later bill above which the unexplained residue is called out. Chosen as a
 * reporting threshold only — it is not a tariff rule and changes no arithmetic.
 */
export const MODEL_FIT_WARNING_SHARE = 0.2;

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const round1 = (value) => Math.round((value + Number.EPSILON) * 10) / 10;

const isBadNumber = (value) => typeof value !== "number" || !Number.isFinite(value);

const ceilingOf = (slab) =>
  slab.upto === null || slab.upto === undefined ? Infinity : slab.upto;

/**
 * Rate charged on the first unit ABOVE the given consumption — the marginal rate in force.
 * At exactly a slab boundary the next unit already belongs to the next block, so 200 units in a
 * 0-200 / 200-400 tariff returns the 200-400 rate.
 *
 * @param {number} units
 * @param {Array<{upto: number|null, rate: number}>} slabs
 * @returns {{ rate: number, from: number, to: number|null, index: number }|{error: string}}
 */
export function marginalRateAt(units, slabs) {
  if (isBadNumber(units) || units < 0) {
    return { error: "Units consumed must be zero or more." };
  }
  if (!Array.isArray(slabs) || slabs.length === 0) {
    return { error: "No tariff slabs were supplied for this state." };
  }
  let previousCeiling = 0;
  for (let index = 0; index < slabs.length; index += 1) {
    const ceiling = ceilingOf(slabs[index]);
    if (ceiling > units) {
      return {
        rate: slabs[index].rate,
        from: previousCeiling,
        to: ceiling === Infinity ? null : ceiling,
        index,
      };
    }
    previousCeiling = ceiling;
  }
  const last = slabs[slabs.length - 1];
  return {
    rate: last.rate,
    from: previousCeiling,
    to: null,
    index: slabs.length - 1,
  };
}

/**
 * The slab the LAST unit billed falls in — the top block the month reached. At exactly a slab
 * boundary the 200th unit is still inside the 0-200 block, which is why this differs from
 * `marginalRateAt`. Zero units reports the first block.
 */
export function topSlabReached(units, slabs) {
  if (isBadNumber(units) || units < 0) {
    return { error: "Units consumed must be zero or more." };
  }
  if (!Array.isArray(slabs) || slabs.length === 0) {
    return { error: "No tariff slabs were supplied for this state." };
  }
  let previousCeiling = 0;
  for (let index = 0; index < slabs.length; index += 1) {
    const ceiling = ceilingOf(slabs[index]);
    if (units <= ceiling) {
      return {
        rate: slabs[index].rate,
        from: previousCeiling,
        to: ceiling === Infinity ? null : ceiling,
        index,
      };
    }
    previousCeiling = ceiling;
  }
  const last = slabs[slabs.length - 1];
  return { rate: last.rate, from: previousCeiling, to: null, index: slabs.length - 1 };
}

function readNumber(value, label, { min, max, allowZero = true }) {
  const parsed = Number(value);
  if (isBadNumber(parsed)) {
    return { error: `Enter a number for ${label}.` };
  }
  if (parsed < min) {
    return { error: `${label} cannot be less than ${min}.` };
  }
  if (!allowZero && parsed === 0) {
    return { error: `${label} must be greater than zero.` };
  }
  if (parsed > max) {
    return { error: `${label} of ${parsed} is outside the range this tool can price.` };
  }
  return { value: parsed };
}

/**
 * Model one month: telescopic energy charge, fixed charge, per-unit surcharge and duty.
 *
 * @param {object} month
 * @param {number} month.units
 * @param {number} month.fixedCharge
 * @param {number} month.surchargePerUnit
 * @param {number} month.dutyPercent
 * @param {Array} slabs
 */
function modelMonth({ units, fixedCharge, surchargePerUnit, dutyPercent }, slabs) {
  const slabResult = computeSlabEnergyCharge(units, slabs);
  if (slabResult.error) return { error: slabResult.error };

  const energyCharge = slabResult.energyCharge;
  const surcharge = round2(units * surchargePerUnit);
  const dutyBase = energyCharge + fixedCharge + surcharge;
  const duty = round2((dutyBase * dutyPercent) / 100);

  return {
    units,
    energyCharge,
    fixedCharge: round2(fixedCharge),
    surcharge,
    duty,
    modelledTotal: round2(energyCharge + fixedCharge + surcharge + duty),
    slabRows: slabResult.rows,
    topSlab: topSlabReached(units, slabs),
  };
}

/**
 * Split the change between two electricity bills into its causes.
 *
 * Every returned rupee figure is either read straight off the two bills the user typed in, or
 * produced by the rules documented at the top of this file. The six change components sum to
 * `totalChange`, which is the real difference between the two amounts paid.
 *
 * @param {object} input
 * @param {string} input.stateId              Id from STATE_TARIFFS.
 * @param {number} input.previousUnits        Units billed in the earlier month.
 * @param {number} input.previousAmount       Rupees actually paid for the earlier month.
 * @param {number} input.currentUnits         Units billed in the later month.
 * @param {number} input.currentAmount        Rupees actually paid for the later month.
 * @param {number} [input.previousFixedCharge] Defaults to the state's fixed charge.
 * @param {number} [input.currentFixedCharge]  Defaults to the state's fixed charge.
 * @param {number} [input.previousSurcharge]   Fuel surcharge, rupees per unit. Default 0.
 * @param {number} [input.currentSurcharge]    Fuel surcharge, rupees per unit. Default 0.
 * @param {number} [input.dutyPercent]         Defaults to the state's duty percentage.
 * @returns {object} the decomposition, or { error } when the input cannot produce a real answer.
 */
export function explainBillSpike(input = {}) {
  const tariff = getStateTariff(input?.stateId);
  if (!tariff) {
    return { error: "Choose a state whose indicative slab tariff is available." };
  }

  const fields = [
    ["previousUnits", "Previous month units", { min: 0, max: MAX_MONTHLY_UNITS, allowZero: false }],
    ["currentUnits", "This month units", { min: 0, max: MAX_MONTHLY_UNITS, allowZero: false }],
    ["previousAmount", "Previous month amount", { min: 0, max: MAX_BILL_AMOUNT }],
    ["currentAmount", "This month amount", { min: 0, max: MAX_BILL_AMOUNT }],
  ];
  const values = {};
  for (const [key, label, bounds] of fields) {
    const read = readNumber(input?.[key], label, bounds);
    if (read.error) {
      const raw = Number(input?.[key]);
      if (bounds.allowZero === false && Number.isFinite(raw) && raw <= 0) {
        return {
          error: `${label} must be greater than zero — a month with no units has no per-unit rate to compare.`,
        };
      }
      return { error: read.error };
    }
    values[key] = read.value;
  }

  const optional = [
    ["previousFixedCharge", "Previous month fixed charge", tariff.fixedCharge, 0, MAX_FIXED_CHARGE],
    ["currentFixedCharge", "This month fixed charge", tariff.fixedCharge, 0, MAX_FIXED_CHARGE],
    ["previousSurcharge", "Previous month fuel surcharge", 0, 0, MAX_SURCHARGE_PER_UNIT],
    ["currentSurcharge", "This month fuel surcharge", 0, 0, MAX_SURCHARGE_PER_UNIT],
    ["dutyPercent", "Electricity duty", tariff.taxPercent, 0, 100],
  ];
  for (const [key, label, fallback, min, max] of optional) {
    const raw = input?.[key];
    if (raw === undefined || raw === null || raw === "") {
      values[key] = fallback;
      continue;
    }
    const read = readNumber(raw, label, { min, max });
    if (read.error) return { error: read.error };
    values[key] = read.value;
  }

  const previous = modelMonth(
    {
      units: values.previousUnits,
      fixedCharge: values.previousFixedCharge,
      surchargePerUnit: values.previousSurcharge,
      dutyPercent: values.dutyPercent,
    },
    tariff.slabs,
  );
  if (previous.error) return { error: previous.error };

  const current = modelMonth(
    {
      units: values.currentUnits,
      fixedCharge: values.currentFixedCharge,
      surchargePerUnit: values.currentSurcharge,
      dutyPercent: values.dutyPercent,
    },
    tariff.slabs,
  );
  if (current.error) return { error: current.error };

  // Rule 2 — split the energy-charge change at the marginal rate already in force.
  const unitsChange = round1(values.currentUnits - values.previousUnits);
  const baseUnits = Math.min(values.previousUnits, values.currentUnits);
  const baseMarginal = marginalRateAt(baseUnits, tariff.slabs);
  if (baseMarginal.error) return { error: baseMarginal.error };

  const energyChange = round2(current.energyCharge - previous.energyCharge);
  const extraUsageAmount = round2(unitsChange * baseMarginal.rate);
  const slabCreepAmount = round2(energyChange - extraUsageAmount);

  // Rules 3, 4, 5, 6.
  const fixedChange = round2(current.fixedCharge - previous.fixedCharge);
  const surchargeChange = round2(current.surcharge - previous.surcharge);
  const dutyChange = round2(current.duty - previous.duty);

  const previousOther = round2(values.previousAmount - previous.modelledTotal);
  const currentOther = round2(values.currentAmount - current.modelledTotal);
  const otherChange = round2(currentOther - previousOther);

  const totalChange = round2(values.currentAmount - values.previousAmount);

  const components = [
    { id: "extra-usage", label: "Extra units at the rate already in force", amount: extraUsageAmount },
    { id: "slab-creep", label: "Slab creep — units pushed into a higher block", amount: slabCreepAmount },
    { id: "fixed", label: "Fixed / demand charge change", amount: fixedChange },
    { id: "surcharge", label: "Fuel surcharge change", amount: surchargeChange },
    { id: "duty", label: `Electricity duty at ${values.dutyPercent}%`, amount: dutyChange },
    { id: "other", label: "Other charges on your bill (arrears, subsidy, rounding)", amount: otherChange },
  ];

  const magnitudeTotal = components.reduce((sum, part) => sum + Math.abs(part.amount), 0);
  const explained = components.map((part) => ({
    ...part,
    absAmount: round2(Math.abs(part.amount)),
    // Share of the movement, measured on absolute size so offsetting components stay readable.
    sharePercent: magnitudeTotal > 0 ? round1((Math.abs(part.amount) / magnitudeTotal) * 100) : 0,
  }));

  const previousEffectiveRate = round2(values.previousAmount / values.previousUnits);
  const currentEffectiveRate = round2(values.currentAmount / values.currentUnits);

  const unitsChangePercent = round1((unitsChange / values.previousUnits) * 100);
  const amountChangePercent =
    values.previousAmount > 0 ? round1((totalChange / values.previousAmount) * 100) : null;

  const slabsCrossed = Math.abs(current.topSlab.index - previous.topSlab.index);
  const largestDriver = explained
    .filter((part) => part.amount !== 0)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0] || null;

  const fitReference = Math.max(values.currentAmount, 1);
  const modelFitOff = Math.abs(currentOther) / fitReference > MODEL_FIT_WARNING_SHARE;

  return {
    stateName: tariff.state,
    stateId: tariff.id,
    slabs: tariff.slabs,
    dutyPercent: values.dutyPercent,
    tariffNote: TARIFF_SOURCE_NOTE,

    previous: { ...previous, amountPaid: values.previousAmount, other: previousOther, effectiveRate: previousEffectiveRate },
    current: { ...current, amountPaid: values.currentAmount, other: currentOther, effectiveRate: currentEffectiveRate },

    totalChange,
    absTotalChange: round2(Math.abs(totalChange)),
    // "rose" / "fell" / "unchanged" so the page never has to test a sign itself.
    direction: totalChange > 0 ? "rose" : totalChange < 0 ? "fell" : "unchanged",
    unitsDirection: unitsChange > 0 ? "rose" : unitsChange < 0 ? "fell" : "unchanged",
    absUnitsChange: round1(Math.abs(unitsChange)),
    unitsChange,
    unitsChangePercent,
    amountChangePercent,
    energyChange,
    extraUsageAmount,
    slabCreepAmount,
    baseMarginalRate: baseMarginal.rate,
    baseMarginalBlock: { from: baseMarginal.from, to: baseMarginal.to },
    fixedChange,
    surchargeChange,
    dutyChange,
    otherChange,

    components: explained,
    largestDriver,
    slabsCrossed,
    effectiveRateChange: round2(currentEffectiveRate - previousEffectiveRate),
    modelFitOff,
  };
}
