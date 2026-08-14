/*
 * AltF Persona — user-supplied quote and production worksheets.
 *
 * This module intentionally contains no market rates, platform benchmarks,
 * niche multipliers, or claims about what another creator charges. Those
 * figures change quickly and need a named source. The arithmetic below only
 * organises values supplied by the user.
 */

const MAX_MONEY = 1_000_000_000;
const MAX_HOURS = 100_000;
const MAX_POSTS = 10_000;

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, finiteNumber(value, min)));
}

function money(value) {
  return Math.round(clamp(value, 0, MAX_MONEY) * 100) / 100;
}

export const QUOTE_FIELDS = Object.freeze([
  { id: "creativeFee", label: "Creative and production fee" },
  { id: "usageRightsFee", label: "Usage-rights fee" },
  { id: "exclusivityFee", label: "Exclusivity fee" },
  { id: "rushFee", label: "Rush or additional-revision fee" },
  { id: "expenses", label: "Approved expenses" },
]);

export function buildQuote(input = {}) {
  const lines = QUOTE_FIELDS.map((field) => ({
    ...field,
    value: money(input[field.id]),
  }));

  return {
    currency: String(input.currency || "USD").trim().toUpperCase().slice(0, 8) || "USD",
    lines,
    total: money(lines.reduce((sum, line) => sum + line.value, 0)),
  };
}

export function buildProductionBudget(input = {}) {
  const posts = Math.round(clamp(input.posts, 1, MAX_POSTS));
  const tools = money(input.tools);
  const training = money(input.training);
  const storage = money(input.storage);
  const other = money(input.other);
  const hours = clamp(input.hours, 0, MAX_HOURS);
  const hourlyRate = money(input.hourlyRate);
  const labour = money(hours * hourlyRate);
  const cash = money(tools + training + storage + other);
  const total = money(cash + labour);

  return {
    currency: String(input.currency || "USD").trim().toUpperCase().slice(0, 8) || "USD",
    posts,
    hours,
    hourlyRate,
    cash,
    labour,
    total,
    perPost: money(total / posts),
    lines: [
      { id: "tools", label: "Generation tools", value: tools },
      { id: "training", label: "Training or setup", value: training },
      { id: "storage", label: "Storage", value: storage },
      { id: "other", label: "Other costs", value: other },
      { id: "labour", label: `Production time (${hours}h × ${hourlyRate})`, value: labour },
    ],
  };
}
