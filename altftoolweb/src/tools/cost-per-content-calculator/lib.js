/**
 * True cost of producing one piece of content.
 *
 * Cost model — every recurring cost is spread over the pieces published in the
 * same month, and capital equipment is spread by straight-line depreciation:
 *
 *   timeCost        = total hours x hourly rate
 *   gearPerPiece    = (gearValue / usefulLifeMonths) / piecesPerMonth
 *   softwarePerPiece= monthlySoftware / piecesPerMonth
 *   overheadPerPiece= monthlyOverhead / piecesPerMonth
 *   totalPerPiece   = timeCost + gearPerPiece + softwarePerPiece
 *                     + overheadPerPiece + directCostPerPiece
 *
 * Straight-line depreciation (cost spread evenly across the useful life) is the
 * simplest of the accepted depreciation methods and the one most creators use
 * for their own budgeting.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Straight-line depreciation spreads cost evenly, so one month is 1/life. */
export const MONTHS_PER_YEAR = 12;

/** Guard rails so absurd input returns a message instead of a nonsense number. */
export const MAX_PIECES_PER_MONTH = 1000;
export const MAX_HOURS_PER_PIECE = 2000;
export const MAX_LIFE_MONTHS = 600;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Named stages so the UI and the maths agree on what "hours" means. */
export const WORK_STAGES = [
  { key: "research", label: "Research & scripting" },
  { key: "shoot", label: "Setup & filming" },
  { key: "edit", label: "Editing" },
  { key: "publish", label: "Thumbnail, upload & promotion" },
];

export function computeCostPerContent({
  hourlyRate,
  hours = {},
  piecesPerMonth,
  gearValue = 0,
  gearLifeMonths = 36,
  monthlySoftware = 0,
  monthlyOverhead = 0,
  directCostPerPiece = 0,
  finishedMinutes = 0,
  revenuePerPiece = 0,
}) {
  const stageHours = WORK_STAGES.map((stage) => hours[stage.key] ?? 0);
  const scalars = {
    hourlyRate,
    piecesPerMonth,
    gearValue,
    gearLifeMonths,
    monthlySoftware,
    monthlyOverhead,
    directCostPerPiece,
    finishedMinutes,
    revenuePerPiece,
  };

  for (const [key, value] of Object.entries(scalars)) {
    if (!isNum(value)) return { error: `Enter a number for ${key}.` };
    if (value < 0) return { error: "Costs, rates and counts cannot be negative." };
  }
  for (const value of stageHours) {
    if (!isNum(value) || value < 0) return { error: "Hours cannot be negative." };
  }

  const totalHours = stageHours.reduce((sum, value) => sum + value, 0);
  if (totalHours > MAX_HOURS_PER_PIECE) {
    return { error: `Total hours per piece should be under ${MAX_HOURS_PER_PIECE}.` };
  }
  if (piecesPerMonth < 1) {
    return { error: "You need to publish at least 1 piece a month to spread fixed costs." };
  }
  if (piecesPerMonth > MAX_PIECES_PER_MONTH) {
    return { error: `Keep pieces per month under ${MAX_PIECES_PER_MONTH}.` };
  }
  if (gearValue > 0 && (gearLifeMonths < 1 || gearLifeMonths > MAX_LIFE_MONTHS)) {
    return { error: "Gear useful life should be between 1 and 600 months." };
  }

  const timeCost = totalHours * hourlyRate;
  const gearMonthly = gearValue > 0 ? gearValue / gearLifeMonths : 0;
  const gearPerPiece = gearMonthly / piecesPerMonth;
  const softwarePerPiece = monthlySoftware / piecesPerMonth;
  const overheadPerPiece = monthlyOverhead / piecesPerMonth;

  const totalPerPiece =
    timeCost + gearPerPiece + softwarePerPiece + overheadPerPiece + directCostPerPiece;
  const cashPerPiece = totalPerPiece - timeCost;

  const lines = [
    { key: "time", label: "Your time", amount: timeCost },
    { key: "gear", label: "Gear depreciation", amount: gearPerPiece },
    { key: "software", label: "Software & subscriptions", amount: softwarePerPiece },
    { key: "overhead", label: "Studio, storage & overheads", amount: overheadPerPiece },
    { key: "direct", label: "Direct spend on this piece", amount: directCostPerPiece },
  ].map((line) => ({
    ...line,
    share: totalPerPiece > 0 ? (line.amount / totalPerPiece) * 100 : 0,
  }));

  const perFinishedMinute = finishedMinutes > 0 ? totalPerPiece / finishedMinutes : null;
  const profitPerPiece = revenuePerPiece > 0 ? revenuePerPiece - totalPerPiece : null;
  const marginPercent =
    revenuePerPiece > 0 ? ((revenuePerPiece - totalPerPiece) / revenuePerPiece) * 100 : null;
  const effectiveHourlyRate =
    revenuePerPiece > 0 && totalHours > 0 ? (revenuePerPiece - cashPerPiece) / totalHours : null;

  return {
    totalHours,
    timeCost,
    cashPerPiece,
    gearMonthly,
    gearPerPiece,
    softwarePerPiece,
    overheadPerPiece,
    directCostPerPiece,
    totalPerPiece,
    monthlyTotal: totalPerPiece * piecesPerMonth,
    monthlyHours: totalHours * piecesPerMonth,
    lines,
    perFinishedMinute,
    profitPerPiece,
    marginPercent,
    effectiveHourlyRate,
    piecesPerMonth,
  };
}

/**
 * How many pieces a month it takes before fixed costs per piece fall below a
 * chosen ceiling. Fixed monthly cost / ceiling, rounded up.
 */
export function piecesToHitFixedCostCeiling({ monthlyFixedCost, ceilingPerPiece }) {
  if (!isNum(monthlyFixedCost) || !isNum(ceilingPerPiece)) {
    return { error: "Enter the monthly fixed cost and a per-piece ceiling." };
  }
  if (monthlyFixedCost < 0) return { error: "Monthly fixed cost cannot be negative." };
  if (ceilingPerPiece <= 0) return { error: "The per-piece ceiling must be greater than zero." };
  return { pieces: Math.ceil(monthlyFixedCost / ceilingPerPiece) };
}
