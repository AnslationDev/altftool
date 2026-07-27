/**
 * Utility transfer planner for a house move.
 *
 * The electricity lead time is not a rule of thumb. The Electricity (Rights of
 * Consumers) Rules, 2020 set a maximum period for a distribution licensee to
 * give a new connection or modify an existing one:
 *
 *   metropolitan areas      7 days
 *   other municipal areas  15 days
 *   rural areas            30 days
 *
 * Those are ceilings on the licensee, not on you, so this planner adds a
 * PAPERWORK_BUFFER_DAYS allowance for gathering documents, paying the security
 * deposit and getting an inspection slot, and starts the countdown from there.
 *
 * The other lead times are the service windows the providers themselves quote:
 * a fibre or landline relocation can need a fresh line pull, which is why it
 * carries the longest lead of the set; LPG is the shortest because a
 * termination voucher is issued over the counter.
 *
 * Every date is derived from the moving date you pass in, so the module stays
 * pure and testable.
 */

export const MS_PER_DAY = 86400000;

/**
 * Maximum period for a new electricity connection or modification under the
 * Electricity (Rights of Consumers) Rules, 2020.
 */
export const ELECTRICITY_SLA_DAYS = {
  metro: 7,
  urban: 15,
  rural: 30,
};

export const AREA_TYPES = [
  { id: "metro", label: "Metropolitan area (7-day electricity SLA)" },
  { id: "urban", label: "Other municipal area (15-day electricity SLA)" },
  { id: "rural", label: "Rural area (30-day electricity SLA)" },
];

/** Days added on top of a provider SLA for documents, deposit and inspection. */
export const PAPERWORK_BUFFER_DAYS = 7;

/**
 * Utilities. newLeadDays / closeLeadDays are days BEFORE moving day that the
 * action has to start. Electricity uses the statutory SLA instead of a fixed
 * newLeadDays.
 */
export const UTILITIES = [
  {
    id: "electricity",
    name: "Electricity",
    usesElectricitySla: true,
    closeLeadDays: 7,
    newSteps: [
      "Apply to the discom for a new connection, or for a name transfer if the meter stays",
      "Pay the security deposit and connection charges",
      "Book the inspection or meter installation slot",
      "Photograph the opening meter reading on the day you take possession",
    ],
    closeSteps: [
      "Photograph the final meter reading with the date visible",
      "Apply for closure or name transfer and clear every outstanding unit",
      "Claim the security deposit refund and note the reference number",
    ],
    docs: ["Photo ID and Aadhaar", "Sale deed, rent agreement or allotment letter", "Last paid bill for the premises", "Owner NOC if you are a tenant"],
  },
  {
    id: "water",
    name: "Water and sewerage",
    newLeadDays: 15,
    closeLeadDays: 7,
    newSteps: [
      "Apply to the municipal water board for a connection or a name change",
      "Confirm whether the flat is metered or billed at a flat rate",
      "Record the opening meter reading",
    ],
    closeSteps: [
      "Take the final reading and settle the bill",
      "Apply for transfer or disconnection so later bills are not raised in your name",
    ],
    docs: ["Property tax receipt or rent agreement", "Photo ID", "Previous water bill"],
  },
  {
    id: "pipedGas",
    name: "Piped natural gas",
    newLeadDays: 15,
    closeLeadDays: 10,
    newSteps: [
      "Check the city gas distributor actually serves the new address",
      "Apply for a connection and pay the refundable deposit",
      "Book the meter and appliance connection visit",
    ],
    closeSteps: [
      "Book a final reading and disconnection",
      "Get the deposit refund request logged before you hand back the keys",
    ],
    docs: ["Photo ID", "Proof of occupancy", "Previous PNG bill"],
  },
  {
    id: "lpg",
    name: "LPG cylinder connection",
    newLeadDays: 7,
    closeLeadDays: 7,
    newSteps: [
      "Register with a distributor serving the new address",
      "Surrender the termination voucher and get the connection reissued",
      "Re-link the connection to your bank account for the subsidy",
    ],
    closeSteps: [
      "Return the cylinder and regulator to the old distributor",
      "Collect the termination voucher — without it the deposit and connection are lost",
    ],
    docs: ["Subscription voucher", "Photo ID", "Proof of new address"],
  },
  {
    id: "broadband",
    name: "Broadband / fibre",
    newLeadDays: 21,
    closeLeadDays: 14,
    newSteps: [
      "Check which providers have a live line at the new address before you commit",
      "Book the shift or a new installation for the day after you move in",
      "Confirm whether the existing router and ONT travel with you",
    ],
    closeSteps: [
      "Give notice within the plan's notice period to avoid a further billing cycle",
      "Return leased equipment and get an acknowledgement",
    ],
    docs: ["Account number", "Photo ID", "Proof of new address"],
  },
  {
    id: "dth",
    name: "DTH / cable TV",
    newLeadDays: 7,
    closeLeadDays: 3,
    newSteps: [
      "Book a relocation visit and confirm the new building allows a dish or has a common feed",
      "Pause the subscription for the gap between addresses",
    ],
    closeSteps: ["Book dish removal", "Note the box and card numbers before it is dismantled"],
    docs: ["Customer ID", "Registered mobile number"],
  },
  {
    id: "landline",
    name: "Landline",
    newLeadDays: 21,
    closeLeadDays: 14,
    newSteps: ["Request a shift and check whether the number can be retained in the new exchange area"],
    closeSteps: ["Give notice and clear the final bill", "Return the instrument if it is leased"],
    docs: ["Account number", "Photo ID"],
  },
];

/** Parse YYYY-MM-DD to a UTC midnight timestamp, or NaN. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return NaN;
  }
  return ms;
}

/** Format a UTC timestamp as YYYY-MM-DD. */
export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Widest planning window, in days either side of today. */
export const MAX_WINDOW_DAYS = 730;

/**
 * Lead time in days for connecting a utility at the new address.
 *
 * @param {object} utility  An entry from UTILITIES.
 * @param {string} areaType One of AREA_TYPES ids.
 * @returns {number} whole days before moving day the application must start.
 */
export function newConnectionLeadDays(utility, areaType) {
  if (!utility) return 0;
  if (utility.usesElectricitySla) {
    const sla = ELECTRICITY_SLA_DAYS[areaType];
    if (!sla) return 0;
    return sla + PAPERWORK_BUFFER_DAYS;
  }
  return utility.newLeadDays ?? 0;
}

/**
 * Build the dated utility plan.
 *
 * @param {object} input
 * @param {string} input.moveDate  Moving day, YYYY-MM-DD.
 * @param {string} input.today     Reference date, YYYY-MM-DD.
 * @param {string} input.areaType  One of AREA_TYPES ids — sets the electricity SLA.
 * @param {string[]} input.selected Utility ids that apply.
 * @param {string[]} input.done     Ticked action keys, "<utilityId>:new" / ":close".
 * @returns {object} plan, or { error }.
 */
export function buildUtilityPlan({
  moveDate,
  today,
  areaType = "urban",
  selected = [],
  done = [],
} = {}) {
  const moveMs = parseIsoDate(moveDate);
  if (Number.isNaN(moveMs)) return { error: "Enter your moving date as a real calendar date." };

  const todayMs = parseIsoDate(today);
  if (Number.isNaN(todayMs)) return { error: "Enter today's date as a real calendar date." };

  const daysUntilMove = Math.round((moveMs - todayMs) / MS_PER_DAY);
  if (Math.abs(daysUntilMove) > MAX_WINDOW_DAYS) {
    return { error: "Keep the moving date within two years of today." };
  }

  if (!ELECTRICITY_SLA_DAYS[areaType]) {
    return { error: "Choose whether the new address is metropolitan, other municipal, or rural." };
  }

  const chosen = UTILITIES.filter((utility) => selected.includes(utility.id));
  if (chosen.length === 0) {
    return { error: "Select at least one utility to plan." };
  }

  const doneSet = new Set(Array.isArray(done) ? done.filter((id) => typeof id === "string") : []);

  const makeAction = (utility, kind, leadDays, steps) => {
    const startMs = moveMs - leadDays * MS_PER_DAY;
    const daysLeft = Math.round((startMs - todayMs) / MS_PER_DAY);
    const key = `${utility.id}:${kind}`;
    const isDone = doneSet.has(key);
    return {
      key,
      kind,
      utilityId: utility.id,
      utilityName: utility.name,
      leadDays,
      startBy: toIsoDate(startMs),
      daysLeft,
      done: isDone,
      late: daysLeft < 0 && !isDone,
      steps,
    };
  };

  const rows = chosen.map((utility) => {
    const newLead = newConnectionLeadDays(utility, areaType);
    const newAction = makeAction(utility, "new", newLead, utility.newSteps);
    const closeAction = makeAction(utility, "close", utility.closeLeadDays, utility.closeSteps);
    return {
      id: utility.id,
      name: utility.name,
      docs: utility.docs,
      slaNote: utility.usesElectricitySla
        ? `${ELECTRICITY_SLA_DAYS[areaType]}-day statutory SLA plus a ${PAPERWORK_BUFFER_DAYS}-day paperwork buffer`
        : `${utility.newLeadDays}-day provider lead time`,
      newAction,
      closeAction,
    };
  });

  const actions = rows.flatMap((row) => [row.newAction, row.closeAction]);
  const sorted = [...actions].sort((a, b) => a.daysLeft - b.daysLeft);
  const openActions = sorted.filter((action) => !action.done);
  const lateCount = actions.filter((action) => action.late).length;
  const doneCount = actions.filter((action) => action.done).length;
  const longestLead = rows.reduce((max, row) => Math.max(max, row.newAction.leadDays), 0);

  return {
    rows,
    actions: sorted,
    nextAction: openActions[0] ?? null,
    totalActions: actions.length,
    doneCount,
    // actions.length is at least 2 here, because at least one utility was chosen.
    percentDone: Math.round((doneCount / actions.length) * 100),
    lateCount,
    daysUntilMove,
    moveDate: toIsoDate(moveMs),
    longestLead,
    startEverythingBy: toIsoDate(moveMs - longestLead * MS_PER_DAY),
    electricitySlaDays: ELECTRICITY_SLA_DAYS[areaType],
  };
}
