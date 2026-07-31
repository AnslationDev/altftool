/**
 * Budget Prompt Builder.
 *
 * Computes a 50/30/20 allocation of monthly take-home income, an emergency-fund
 * target and the monthly saving a stated goal requires, then writes a household
 * budgeting prompt around those numbers so the model works from real figures
 * instead of inventing them.
 */

/**
 * The 50/30/20 budgeting rule — 50% of after-tax income to needs, 30% to wants,
 * 20% to savings and debt repayment — popularised by Elizabeth Warren and
 * Amelia Warren Tyagi in "All Your Worth" (2005).
 */
export const NEEDS_SHARE = 0.5;
export const WANTS_SHARE = 0.3;
export const SAVINGS_SHARE = 0.2;

/**
 * Standard financial-planning guideline: hold an emergency fund covering
 * 3 to 6 months of essential (needs) expenses in liquid savings.
 */
export const EMERGENCY_FUND_MIN_MONTHS = 3;
export const EMERGENCY_FUND_MAX_MONTHS = 6;

/** Practical input ceilings so absurd figures are rejected, not formatted. */
export const LIMITS = {
  monthlyIncome: { min: 1, max: 100000000 },
  goalMonths: { min: 1, max: 600 },
  householdSize: { min: 1, max: 20 },
};

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export const BUDGET_STYLES = [
  {
    id: "50-30-20",
    label: "50/30/20 — simple three-bucket budget",
    directive:
      "Structure the budget as three buckets — needs, wants, savings/debt — and list categories inside each bucket.",
  },
  {
    id: "zero-based",
    label: "Zero-based — every rupee gets a job",
    directive:
      "Use zero-based budgeting: allocate the entire income across categories so allocations minus income equals exactly zero, and show that check at the end.",
  },
  {
    id: "envelope",
    label: "Envelope — fixed cap per spending category",
    directive:
      "Use the envelope method: give every variable spending category a hard monthly cap and state the rule for what happens when an envelope is empty.",
  },
];

function toNumber(value) {
  const number = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
}

export function getBudgetStyle(styleId) {
  return BUDGET_STYLES.find((style) => style.id === styleId) || null;
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    approxTokens: Math.max(1, Math.ceil(text.length / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Allocate monthly take-home income by the 50/30/20 rule and size the
 * emergency fund and goal saving against it.
 * @returns {{error:string}|object}
 */
export function planBudget({
  monthlyIncome,
  essentialExpenses,
  goalAmount,
  goalMonths,
} = {}) {
  const income = toNumber(monthlyIncome);
  const essentials = toNumber(essentialExpenses ?? 0);
  const goal = toNumber(goalAmount ?? 0);
  const months = toNumber(goalMonths ?? 0);

  if (Number.isNaN(income)) return { error: "Enter your monthly take-home income as a number." };
  if (income < LIMITS.monthlyIncome.min) {
    return { error: "Monthly take-home income must be greater than zero." };
  }
  if (income > LIMITS.monthlyIncome.max) {
    return { error: "Monthly income above 10 crore is outside this tool's range." };
  }
  if (Number.isNaN(essentials) || essentials < 0) {
    return { error: "Essential expenses cannot be negative." };
  }
  if (Number.isNaN(goal) || goal < 0) {
    return { error: "The savings goal amount cannot be negative." };
  }
  if (Number.isNaN(months) || months < 0 || !Number.isInteger(months)) {
    return { error: "Months to reach the goal must be a whole number." };
  }
  if (goal > 0 && months === 0) {
    return { error: "Give the goal a deadline in months so a monthly saving can be computed." };
  }
  if (goal > 0 && months > LIMITS.goalMonths.max) {
    return { error: `Goal deadlines beyond ${LIMITS.goalMonths.max} months are outside this tool's range.` };
  }

  const needsBudget = income * NEEDS_SHARE;
  const wantsBudget = income * WANTS_SHARE;
  const savingsBudget = income * SAVINGS_SHARE;

  const essentialsShare = essentials / income;
  const emergencyFundMin = essentials * EMERGENCY_FUND_MIN_MONTHS;
  const emergencyFundMax = essentials * EMERGENCY_FUND_MAX_MONTHS;

  const requiredMonthlySaving = goal > 0 ? goal / months : 0;

  const warnings = [];
  if (essentials > income) {
    warnings.push(
      "Essential expenses exceed income — the budget must start by cutting or restructuring needs, not by trimming wants.",
    );
  } else if (essentials > needsBudget) {
    // Math.ceil (not Math.round) so the displayed percentage can never round
    // back down to "50%" while the message asserts it is above 50% — the
    // branch only fires when the true share is strictly > 50, so ceiling it
    // always reads as strictly above the threshold too.
    warnings.push(
      `Essentials take ${Math.ceil(essentialsShare * 100)}% of income, above the 50% needs share — the prompt asks the model to find reductions in needs first.`,
    );
  }
  if (requiredMonthlySaving > savingsBudget) {
    warnings.push(
      "The goal needs more per month than the 20% savings share — the prompt asks the model to either extend the deadline or reallocate from wants.",
    );
  }

  return {
    income,
    essentials,
    essentialsShare,
    needsBudget,
    wantsBudget,
    savingsBudget,
    emergencyFundMin,
    emergencyFundMax,
    goal,
    months,
    requiredMonthlySaving,
    goalFitsSavingsShare: requiredMonthlySaving <= savingsBudget,
    warnings,
  };
}

/**
 * Write the household budgeting prompt around the computed plan.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildBudgetPrompt({
  plan,
  householdSize,
  goalName,
  focusCategories,
  styleId,
  notes,
} = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid income first." };
  const style = getBudgetStyle(styleId);
  if (!style) return { error: "Choose a budgeting style." };
  const people = toNumber(householdSize);
  if (
    Number.isNaN(people) ||
    !Number.isInteger(people) ||
    people < LIMITS.householdSize.min ||
    people > LIMITS.householdSize.max
  ) {
    return {
      error: `Household size must be a whole number between ${LIMITS.householdSize.min} and ${LIMITS.householdSize.max}.`,
    };
  }

  const goalLabel = typeof goalName === "string" && goalName.trim() ? goalName.trim() : "the savings goal";
  const focus = typeof focusCategories === "string" ? focusCategories.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";
  const rupees = (value) => `Rs ${Math.round(value).toLocaleString("en-IN")}`;

  const lines = [
    "Act as a practical household budgeting coach. Build a monthly budget from the figures below. Use only these figures — do not invent income, prices or debts I have not stated.",
    "",
    `MONTHLY TAKE-HOME INCOME: ${rupees(plan.income)}`,
    `HOUSEHOLD SIZE: ${people} ${people === 1 ? "person" : "people"}`,
    `CURRENT ESSENTIAL (NEEDS) SPENDING: ${rupees(plan.essentials)} per month (${Math.round(plan.essentialsShare * 100)}% of income)`,
    "",
    "50/30/20 FRAME (Warren & Tyagi):",
    `- Needs cap: ${rupees(plan.needsBudget)} (50%)`,
    `- Wants cap: ${rupees(plan.wantsBudget)} (30%)`,
    `- Savings and debt repayment: ${rupees(plan.savingsBudget)} (20%)`,
  ];

  if (plan.essentials > plan.needsBudget && plan.essentials <= plan.income) {
    lines.push(
      "That is more than the 50% needs cap. Look for reductions in needs first — do not close the gap by cutting wants or savings instead.",
    );
  }

  lines.push(
    "",
    `EMERGENCY FUND TARGET: ${rupees(plan.emergencyFundMin)} to ${rupees(plan.emergencyFundMax)} (3 to 6 months of essential spending).`,
  );

  if (plan.goal > 0) {
    lines.push(
      "",
      `NAMED GOAL: ${goalLabel} — ${rupees(plan.goal)} in ${plan.months} months, which needs ${rupees(plan.requiredMonthlySaving)} per month.`,
    );
    if (!plan.goalFitsSavingsShare) {
      lines.push(
        "That is more than the 20% savings share. Propose the least painful fix: a longer deadline, specific cuts from wants, or both — show the arithmetic for each option.",
      );
    }
  }

  lines.push("", `BUDGET STYLE: ${style.label.split("—")[0].trim()}. ${style.directive}`);
  if (focus) lines.push("", `CATEGORIES TO DETAIL FIRST: ${focus}`);
  lines.push(
    "",
    "OUTPUT:",
    "1. A category-by-category monthly budget table with a rupee amount per category, grouped into needs, wants and savings.",
    "2. A one-line check that the categories sum to the income.",
    "3. The three largest saving opportunities you can see in these numbers, each with the monthly amount freed.",
    "4. One habit to review the budget weekly, in under 25 words.",
    "",
    "RULES:",
    "- Keep every needs category inside the needs cap; if impossible, say so and show which category breaks it.",
    "- No investment product recommendations — this is a spending plan, not investment advice.",
    "- Ask me at most 2 clarifying questions, only if an amount above is genuinely ambiguous.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, style, ...measureText(text) };
}
