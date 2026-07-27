/**
 * DIY vs garage service cost comparison.
 *
 * Everything here is plain arithmetic over user-supplied prices plus the two
 * Indian GST rates that apply to a routine car service invoice.
 */

/**
 * GST on motor vehicle servicing / repair labour.
 * SAC 998714 "maintenance and repair services of motor vehicles" is taxed at 18%.
 */
export const SERVICE_GST_RATE = 0.18;

/**
 * GST on the consumables used in a basic service.
 * Lubricating oils (HSN 2710 19) and vehicle filters (HSN 8421 23 / 8421 31)
 * are both in the 18% slab.
 */
export const PARTS_GST_RATE = 0.18;

/** Typical dealer/workshop markup over retail part price, as a percentage. */
export const DEFAULT_PARTS_MARKUP_PCT = 20;

/** A basic-service tool kit is usually amortised over this many services. */
export const DEFAULT_TOOL_LIFE_SERVICES = 10;

/** Sanity ceilings so an obvious typo returns an error instead of a silly number. */
export const MAX_MARKUP_PCT = 500;
export const MAX_LABOUR_HOURS = 40;

/** Starter job list for a petrol hatchback/sedan minor service. Prices are ex-GST. */
export const DEFAULT_ITEMS = [
  { id: "engine-oil", name: "Engine oil", unit: "litre", qty: 3.5, price: 550 },
  { id: "oil-filter", name: "Oil filter", unit: "piece", qty: 1, price: 350 },
  { id: "air-filter", name: "Air filter", unit: "piece", qty: 1, price: 450 },
  { id: "drain-washer", name: "Drain plug washer", unit: "piece", qty: 1, price: 30 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Compare a self-performed service against the same job at a workshop.
 *
 * @param {object} input
 * @param {Array<{name?:string, qty:number, price:number}>} input.items  parts you buy yourself, price ex-GST
 * @param {number} input.partsMarkupPct   markup the garage adds on the same parts (%)
 * @param {number} input.labourHours      hours the garage bills for
 * @param {number} input.labourRate       garage labour rate per hour (ex-GST)
 * @param {number} input.diyHours         hours the job takes you
 * @param {number} input.hourlyValue      what an hour of your time is worth (0 = ignore)
 * @param {number} input.toolCost         one-time cost of jack, spanners, oil pan, filter wrench
 * @param {number} input.toolLifeServices how many services that kit will cover
 * @param {number} input.disposalCost     used-oil disposal / rag / cleaner cost per service
 * @returns {object} breakdown, or { error } for invalid input
 */
export function compareServiceCost({
  items = [],
  partsMarkupPct = DEFAULT_PARTS_MARKUP_PCT,
  labourHours = 0,
  labourRate = 0,
  diyHours = 0,
  hourlyValue = 0,
  toolCost = 0,
  toolLifeServices = DEFAULT_TOOL_LIFE_SERVICES,
  disposalCost = 0,
} = {}) {
  const scalars = {
    partsMarkupPct,
    labourHours,
    labourRate,
    diyHours,
    hourlyValue,
    toolCost,
    toolLifeServices,
    disposalCost,
  };
  for (const value of Object.values(scalars)) {
    if (!isNum(value)) return { error: "Enter a valid number in every field." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one part or consumable to compare." };
  }
  for (const item of items) {
    if (!isNum(item?.qty) || !isNum(item?.price)) {
      return { error: "Every part needs a numeric quantity and price." };
    }
    if (item.qty < 0 || item.price < 0) {
      return { error: "Part quantities and prices cannot be negative." };
    }
  }
  if (labourHours < 0 || labourRate < 0 || diyHours < 0 || hourlyValue < 0) {
    return { error: "Hours and rates cannot be negative." };
  }
  if (toolCost < 0 || disposalCost < 0) {
    return { error: "Tool and disposal costs cannot be negative." };
  }
  if (partsMarkupPct < -100 || partsMarkupPct > MAX_MARKUP_PCT) {
    return { error: `Parts markup should be between -100% and ${MAX_MARKUP_PCT}%.` };
  }
  if (labourHours > MAX_LABOUR_HOURS) {
    return { error: `Labour hours above ${MAX_LABOUR_HOURS} are not a basic service.` };
  }
  if (!(toolLifeServices > 0)) {
    return { error: "Tool kit life must be at least one service." };
  }

  const partsNet = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  if (!(partsNet > 0)) {
    return { error: "Total parts cost is zero — enter at least one priced part." };
  }

  // --- Do it yourself -----------------------------------------------------
  const diyPartsGst = partsNet * PARTS_GST_RATE;
  const diyPartsGross = partsNet + diyPartsGst;
  const toolPerService = toolCost / toolLifeServices;
  const diyCash = diyPartsGross + toolPerService + disposalCost;
  const diyTimeValue = diyHours * hourlyValue;
  const diyTotalWithTime = diyCash + diyTimeValue;

  // --- Workshop -----------------------------------------------------------
  const garagePartsNet = partsNet * (1 + partsMarkupPct / 100);
  const garagePartsGst = garagePartsNet * PARTS_GST_RATE;
  const garageLabourNet = labourHours * labourRate;
  const garageLabourGst = garageLabourNet * SERVICE_GST_RATE;
  const garageTotal =
    garagePartsNet + garagePartsGst + garageLabourNet + garageLabourGst;

  // --- Comparison ---------------------------------------------------------
  const cashSaving = garageTotal - diyCash;
  const savingAfterTime = garageTotal - diyTotalWithTime;
  const savingPct = garageTotal > 0 ? (cashSaving / garageTotal) * 100 : 0;
  const effectiveHourly = diyHours > 0 ? cashSaving / diyHours : null;

  // Payback ignores the amortised slice so the tool kit is not counted twice.
  const diyWithoutTool = diyPartsGross + disposalCost;
  const savingPerServiceBeforeTool = garageTotal - diyWithoutTool;
  const breakEvenServices =
    toolCost <= 0
      ? 0
      : savingPerServiceBeforeTool > 0
        ? Math.ceil(toolCost / savingPerServiceBeforeTool)
        : null;

  return {
    partsNet: round2(partsNet),
    diyPartsGst: round2(diyPartsGst),
    diyPartsGross: round2(diyPartsGross),
    toolPerService: round2(toolPerService),
    disposalCost: round2(disposalCost),
    diyCash: round2(diyCash),
    diyTimeValue: round2(diyTimeValue),
    diyTotalWithTime: round2(diyTotalWithTime),
    garagePartsNet: round2(garagePartsNet),
    garagePartsGst: round2(garagePartsGst),
    garageLabourNet: round2(garageLabourNet),
    garageLabourGst: round2(garageLabourGst),
    garageTotal: round2(garageTotal),
    cashSaving: round2(cashSaving),
    savingAfterTime: round2(savingAfterTime),
    savingPct: round2(savingPct),
    effectiveHourly: effectiveHourly === null ? null : round2(effectiveHourly),
    breakEvenServices,
    cheaper: cashSaving > 0 ? "diy" : cashSaving < 0 ? "garage" : "tie",
  };
}

/** Annual picture when the same service is repeated a few times a year. */
export function annualiseSaving(cashSaving, servicesPerYear) {
  if (!isNum(cashSaving) || !isNum(servicesPerYear) || servicesPerYear < 0) {
    return { error: "Services per year must be zero or more." };
  }
  return { annualSaving: round2(cashSaving * servicesPerYear) };
}
