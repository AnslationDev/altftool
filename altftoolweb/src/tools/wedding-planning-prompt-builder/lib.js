/**
 * Wedding Planning Prompt Builder — pure logic.
 *
 * Splits a total budget across categories, derives cost per guest and the
 * catering plate budget, places the couple in a planning phase from the months
 * remaining, and composes a planning prompt from those numbers.
 *
 * No React, no DOM, no Date.now(). Same input -> same output.
 */

/** OpenAI's published English rule of thumb: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

export const MIN_GUESTS = 2;
export const MAX_GUESTS = 5000;
export const MAX_MONTHS_TO_GO = 60;
export const MAX_BUDGET = 1e11;

export const CURRENCIES = [
  { id: "INR", label: "Indian rupee (INR)", locale: "en-IN" },
  { id: "USD", label: "US dollar (USD)", locale: "en-US" },
  { id: "GBP", label: "Pound sterling (GBP)", locale: "en-GB" },
  { id: "EUR", label: "Euro (EUR)", locale: "en-IE" },
  { id: "AED", label: "UAE dirham (AED)", locale: "en-AE" },
  { id: "AUD", label: "Australian dollar (AUD)", locale: "en-AU" },
];

/**
 * Category splits are planner rules of thumb, expressed as a percentage of the
 * total budget. Both models reserve a 10% contingency, which is the share most
 * planning guides recommend holding back for overruns and last-minute additions.
 * They are starting points for negotiation, not market prices.
 */
export const BUDGET_MODELS = [
  {
    id: "single-day",
    label: "Single-day wedding",
    cateringId: "venue-catering",
    split: [
      { id: "venue-catering", label: "Venue and catering", percent: 45 },
      { id: "photo-video", label: "Photography and video", percent: 12 },
      { id: "attire", label: "Attire, hair and make-up", percent: 8 },
      { id: "flowers", label: "Flowers and decor", percent: 8 },
      { id: "music", label: "Music and entertainment", percent: 7 },
      { id: "rings", label: "Rings", percent: 3 },
      { id: "transport", label: "Transport and logistics", percent: 3 },
      { id: "stationery", label: "Stationery and invitations", percent: 2 },
      { id: "cake-favours", label: "Cake and favours", percent: 2 },
      { id: "contingency", label: "Contingency", percent: 10 },
    ],
  },
  {
    id: "multi-event",
    label: "Multi-event wedding (mehndi, sangeet, ceremony, reception)",
    cateringId: "venue-catering",
    split: [
      { id: "venue-catering", label: "Venues and catering, all events", percent: 40 },
      { id: "attire", label: "Outfits and jewellery", percent: 10 },
      { id: "photo-video", label: "Photography and video", percent: 10 },
      { id: "decor", label: "Decor, stage and mandap", percent: 10 },
      { id: "music", label: "Music, DJ and processions", percent: 5 },
      { id: "transport", label: "Guest transport and stay", percent: 5 },
      { id: "rituals", label: "Rituals, priest and ceremony items", percent: 4 },
      { id: "makeup", label: "Hair, make-up and grooming", percent: 3 },
      { id: "stationery", label: "Invitations and gifting", percent: 3 },
      { id: "contingency", label: "Contingency", percent: 10 },
    ],
  },
];

/**
 * Planning phases keyed on months remaining. The task groupings follow the
 * ordering used by most published wedding planning timelines: lock the venue
 * and date first, then the vendors who take one booking per date, then paper,
 * then numbers.
 */
export const PLANNING_PHASES = [
  {
    minMonths: 12,
    id: "foundation",
    label: "Foundation",
    tasks: [
      "Agree the total budget and who is contributing what, in writing",
      "Fix the date and shortlist three venues that fit the guest count",
      "Draft the guest list in A and B tiers before booking anything",
    ],
  },
  {
    minMonths: 9,
    id: "core-vendors",
    label: "Core vendors",
    tasks: [
      "Book the vendors who take one booking per date: venue, caterer, photographer",
      "Confirm what the venue includes so you are not paying twice for the same thing",
      "Set the payment schedule and diarise every due date",
    ],
  },
  {
    minMonths: 6,
    id: "look-and-paper",
    label: "Look and paper",
    tasks: [
      "Commission outfits and allow time for at least two fittings",
      "Finalise invitation design and collect complete postal or digital contacts",
      "Book decor, music and transport",
    ],
  },
  {
    minMonths: 3,
    id: "menu-and-rsvp",
    label: "Menu and RSVP",
    tasks: [
      "Do the menu tasting and confirm dietary and allergen counts",
      "Send invitations and start RSVP tracking in one shared sheet",
      "Book accommodation blocks and share travel details with out-of-town guests",
    ],
  },
  {
    minMonths: 1,
    id: "numbers-and-payments",
    label: "Numbers and payments",
    tasks: [
      "Give the caterer the final headcount by their cut-off date",
      "Finish the seating plan and print the running order",
      "Clear outstanding vendor balances and confirm arrival times in writing",
    ],
  },
  {
    minMonths: 0,
    id: "final-stretch",
    label: "Final stretch",
    tasks: [
      "Reconfirm every vendor's arrival time, contact number and set-up window",
      "Hand each supplier a single point of contact who is not the couple",
      "Pack an emergency kit and delegate payments, gifts and returns",
    ],
  },
];

export const PRIORITIES = [
  { id: "food", label: "Food and hospitality", rule: "protect the catering line first" },
  { id: "photos", label: "Photos and video", rule: "protect the photography line first" },
  { id: "decor", label: "Decor and atmosphere", rule: "protect the decor line first" },
  { id: "music", label: "Music and energy", rule: "protect the entertainment line first" },
  { id: "guest-comfort", label: "Guest comfort and travel", rule: "protect transport and stay first" },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const round = (value) => Math.round(value);

export function planningPhaseFor(monthsToGo) {
  if (!isFiniteNumber(monthsToGo) || monthsToGo < 0) return null;
  return (
    PLANNING_PHASES.find((phase) => monthsToGo >= phase.minMonths) ||
    PLANNING_PHASES[PLANNING_PHASES.length - 1]
  );
}

/** Allocate a total across a model's percentage split. */
export function allocateBudget(total, modelId) {
  const model = BUDGET_MODELS.find((item) => item.id === modelId) || BUDGET_MODELS[0];
  if (!isFiniteNumber(total) || total <= 0) return null;
  const rows = model.split.map((item) => ({
    id: item.id,
    label: item.label,
    percent: item.percent,
    amount: round((total * item.percent) / 100),
  }));
  return { model, rows };
}

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export function buildWeddingPrompt(input) {
  const {
    totalBudget,
    currency = "INR",
    guests,
    monthsToGo,
    model = "single-day",
    priority = "food",
    city = "",
    mustHave = "",
    dealBreaker = "",
  } = input || {};

  const currencyEntry = CURRENCIES.find((item) => item.id === currency) || CURRENCIES[0];

  const total = Number(totalBudget);
  if (!isFiniteNumber(total)) return { error: "Enter the total budget as a number." };
  if (total <= 0) return { error: "Total budget must be greater than zero." };
  if (total > MAX_BUDGET) return { error: "That budget is out of range — enter a realistic figure." };

  const guestCount = Number(guests);
  if (!isFiniteNumber(guestCount) || !Number.isInteger(guestCount)) {
    return { error: "Guest count must be a whole number." };
  }
  if (guestCount < MIN_GUESTS || guestCount > MAX_GUESTS) {
    return { error: `Guest count should be between ${MIN_GUESTS} and ${MAX_GUESTS}.` };
  }

  if (typeof monthsToGo === "string" && monthsToGo.trim() === "") {
    return { error: "Enter how many months are left as a number." };
  }
  const months = Number(monthsToGo);
  if (!isFiniteNumber(months)) return { error: "Enter how many months are left as a number." };
  if (months < 0 || months > MAX_MONTHS_TO_GO) {
    return { error: `Months remaining should be between 0 and ${MAX_MONTHS_TO_GO}.` };
  }

  const allocation = allocateBudget(total, model);
  const phase = planningPhaseFor(months);
  const priorityEntry = PRIORITIES.find((item) => item.id === priority) || PRIORITIES[0];

  const cateringRow =
    allocation.rows.find((row) => row.id === allocation.model.cateringId) || allocation.rows[0];
  const contingencyRow = allocation.rows.find((row) => row.id === "contingency");

  const costPerGuest = total / guestCount;
  const plateBudget = cateringRow.amount / guestCount;
  // Sum the already-rounded rows rather than `total - contingencyRow.amount`, so this
  // figure always reconciles with what the "Budget split" table visibly adds up to —
  // each row is rounded independently, so summing raw `total` first can drift by a
  // few currency units from the sum of the displayed amounts.
  const spendableTotal = allocation.rows
    .filter((row) => row.id !== "contingency")
    .reduce((sum, row) => sum + row.amount, 0);

  const allocationLines = allocation.rows.map(
    (row) => `- ${row.label}: ${row.percent}% (${currencyEntry.id} ${round(row.amount)})`
  );

  const constraints = [
    `Total budget ${currencyEntry.id} ${round(total)} for ${guestCount} guests — that is ${currencyEntry.id} ${round(costPerGuest)} per guest all-in.`,
    `The venue-and-catering line (both bundled together) works out to about ${currencyEntry.id} ${round(plateBudget)} per head — that is higher than a caterer's food-only quote, since it also carries venue hire, staging and permits. Tell me plainly whether that is realistic ${city.trim() ? `in ${city.trim()}` : "in a typical metro"} and what it buys.`,
    contingencyRow
      ? `${contingencyRow.percent}% (${currencyEntry.id} ${round(contingencyRow.amount)}) is held back as contingency, so plan against ${currencyEntry.id} ${round(spendableTotal)} of committed spend.`
      : null,
    `${months === 0 ? "The wedding is this month" : `There are ${months} month${months === 1 ? "" : "s"} to go`}, which puts us in the "${phase.label}" phase.`,
    `My priority is ${priorityEntry.label.toLowerCase()} — ${priorityEntry.rule} and take the cut from the lowest-priority lines.`,
    city.trim() ? `Location: ${city.trim()}. Use local vendor categories and local norms.` : null,
    mustHave.trim() ? `Non-negotiable: ${mustHave.trim()}.` : null,
    dealBreaker.trim() ? `Explicitly avoid: ${dealBreaker.trim()}.` : null,
    "Do not quote specific vendor prices as fact. Give ranges and say what drives the price up or down.",
  ].filter(Boolean);

  const outputSpec = [
    `1. A verdict on whether ${currencyEntry.id} ${round(costPerGuest)} per guest is tight, comfortable or generous, and the single biggest lever to change it.`,
    `2. A prioritised action list for the "${phase.label}" phase only — nothing that belongs to a later phase.`,
    "3. Ten questions to ask the venue and ten to ask the caterer, each with the answer that should worry me.",
    "4. A guest-list cut strategy in tiers, with the rule for deciding who moves between tiers.",
    "5. The three costs couples most often forget at this budget level, with a rough share of total for each.",
  ];

  const prompt = [
    "You are a blunt, experienced wedding planner. You care about the couple not overspending.",
    "",
    "Help me plan within the numbers below. Assume the budget is fixed and cannot grow.",
    "",
    "BUDGET SPLIT I AM WORKING TO",
    ...allocationLines,
    "",
    "CONSTRAINTS",
    ...constraints.map((line) => `- ${line}`),
    "",
    "OUTPUT FORMAT",
    ...outputSpec,
    "",
    "Be specific and numerate. Where you disagree with my split, say which line is wrong and what percentage it should be instead.",
    ...(phase.tasks.length
      ? ["", `For reference, the tasks I believe belong to this phase are: ${phase.tasks.join("; ")}. Correct me if that ordering is wrong.`]
      : []),
  ].join("\n");

  const charCount = prompt.length;

  return {
    prompt,
    currency: currencyEntry.id,
    currencyLocale: currencyEntry.locale,
    total,
    guests: guestCount,
    months,
    modelLabel: allocation.model.label,
    rows: allocation.rows,
    costPerGuest,
    plateBudget,
    spendableTotal,
    contingencyAmount: contingencyRow ? contingencyRow.amount : 0,
    phaseLabel: phase.label,
    phaseTasks: phase.tasks,
    priorityLabel: priorityEntry.label,
    wordCount: countWords(prompt),
    charCount,
    tokenEstimate: Math.ceil(charCount / CHARS_PER_TOKEN),
  };
}
