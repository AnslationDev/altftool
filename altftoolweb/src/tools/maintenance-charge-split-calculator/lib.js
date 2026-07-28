/**
 * Maintenance charge split between landlord (owner) and tenant.
 *
 * Head names and the convention for who normally bears each head follow the
 * heads of charge listed in Bye-law No. 68 of the Model Bye-laws for
 * Co-operative Housing Societies (Maharashtra, 2014 edition), which is the
 * template most Indian societies bill against:
 *   (a) property taxes, (b) water charges, (c) common electricity,
 *   (d) contribution to the repairs & maintenance fund,
 *   (e) expenses on repairs & maintenance of the lift,
 *   (f) contribution to the sinking fund, (g) service charges,
 *   (h) parking charges, (i) interest on defaulted charges,
 *   (j) repayment of instalment of loan and interest,
 *   (k) non-occupancy charges, (l) insurance charges, (m) lease rent,
 *   (n) non-agricultural tax, (o) education and training fund,
 *   (p) any other charge decided in general body meeting.
 *
 * The default split is the ordinary commercial convention used in Indian
 * leave-and-licence agreements: heads that are a cost of *owning* the flat
 * (statutory taxes, corpus funds, insurance, lease rent, non-occupancy)
 * stay with the landlord, while heads that are a cost of *using* the flat
 * (water, common electricity, service charges, lift, parking) go to the
 * occupant. It is a default, not a law — the signed agreement always wins.
 */

/** Repairs & maintenance fund floor: 0.75% p.a. of construction cost — Bye-law 68(d). */
export const REPAIR_FUND_MIN_RATE_PCT = 0.75;

/** Sinking fund floor: 0.25% p.a. of construction cost — Bye-law 68(f)/13(c). */
export const SINKING_FUND_MIN_RATE_PCT = 0.25;

/**
 * Non-occupancy charges may not exceed 10% of service charges (excluding
 * municipal taxes) — Government of Maharashtra Co-operation Department
 * circular dated 1 August 2001, upheld in Mont Blanc CHS v. State of
 * Maharashtra (Bombay High Court, 2007).
 */
export const NON_OCCUPANCY_CAP_RATE = 0.1;

/** Education and training fund: Rs 10 per member per month — Bye-law 68(o). */
export const EDUCATION_FUND_PER_MEMBER = 10;

export const MAINTENANCE_HEADS = [
  {
    key: "propertyTax",
    label: "Municipal property tax",
    note: "Statutory tax on the property itself — follows ownership.",
    defaultLandlordPct: 100,
    defaultAmount: 800,
  },
  {
    key: "waterCharges",
    label: "Water charges",
    note: "Billed per flat or per tap; a consumption cost of occupying.",
    defaultLandlordPct: 0,
    defaultAmount: 600,
  },
  {
    key: "commonElectricity",
    label: "Common area electricity",
    note: "Lights, pumps and common lighting consumed while you live there.",
    defaultLandlordPct: 0,
    defaultAmount: 450,
  },
  {
    key: "repairFund",
    label: "Repairs & maintenance fund",
    note: "Corpus for building repairs, minimum 0.75% p.a. of construction cost.",
    defaultLandlordPct: 100,
    defaultAmount: 1200,
  },
  {
    key: "sinkingFund",
    label: "Sinking fund",
    note: "Long-term reconstruction corpus, minimum 0.25% p.a. of construction cost.",
    defaultLandlordPct: 100,
    defaultAmount: 400,
  },
  {
    key: "serviceCharges",
    label: "Service charges",
    note: "Security, housekeeping, office and audit — charged equally per flat.",
    defaultLandlordPct: 0,
    defaultAmount: 1500,
  },
  {
    key: "liftMaintenance",
    label: "Lift maintenance",
    note: "Charged equally to every flat in the building, ground floor included.",
    defaultLandlordPct: 0,
    defaultAmount: 300,
  },
  {
    key: "nonOccupancy",
    label: "Non-occupancy charges",
    note: "Levied because the owner has let the flat out — capped at 10% of service charges.",
    defaultLandlordPct: 100,
    defaultAmount: 150,
  },
  {
    key: "parking",
    label: "Parking charges",
    note: "Payable by whoever actually parks in the allotted slot.",
    defaultLandlordPct: 0,
    defaultAmount: 500,
  },
  {
    key: "insurance",
    label: "Building insurance",
    note: "Insures the structure, an owner's risk.",
    defaultLandlordPct: 100,
    defaultAmount: 120,
  },
  {
    key: "leaseRentNaTax",
    label: "Lease rent / non-agricultural tax",
    note: "Ground lease rent and NA tax payable on the land.",
    defaultLandlordPct: 100,
    defaultAmount: 0,
  },
  {
    key: "educationFund",
    label: "Education & training fund",
    note: "Rs 10 per member per month towards member education.",
    defaultLandlordPct: 100,
    defaultAmount: EDUCATION_FUND_PER_MEMBER,
  },
  {
    key: "majorRepairLevy",
    label: "Special / major repair levy",
    note: "One-off structural repair levy voted in the general body meeting.",
    defaultLandlordPct: 100,
    defaultAmount: 0,
  },
];

export const SPLIT_PRESETS = [
  { key: "byelaw", label: "Bye-law convention" },
  { key: "tenantUsage", label: "Tenant pays all usage heads" },
  { key: "fiftyFifty", label: "50 / 50 on everything" },
  { key: "landlordAll", label: "Landlord pays everything" },
  { key: "tenantAll", label: "Tenant pays everything" },
];

/** Landlord percentage for each head under a named preset. */
export function presetLandlordPct(presetKey, head) {
  switch (presetKey) {
    case "landlordAll":
      return 100;
    case "tenantAll":
      return 0;
    case "fiftyFifty":
      return 50;
    case "tenantUsage":
      // Only the statutory / corpus heads stay with the owner.
      return ["propertyTax", "sinkingFund", "nonOccupancy", "leaseRentNaTax"].includes(head.key)
        ? 100
        : 0;
    case "byelaw":
    default:
      return head.defaultLandlordPct;
  }
}

/** Default editable rows for a fresh session. */
export function defaultRows() {
  return MAINTENANCE_HEADS.map((head) => ({
    key: head.key,
    amount: head.defaultAmount,
    landlordPct: head.defaultLandlordPct,
  }));
}

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const headByKey = (key) => MAINTENANCE_HEADS.find((head) => head.key === key) || null;

/**
 * Split every head between landlord and tenant.
 * @param {{rows: Array<{key: string, amount: number, landlordPct: number}>, months?: number}} input
 * @returns {object} totals, per-head rows and the non-occupancy cap check, or { error }
 */
export function computeSplit({ rows, months = 12 } = {}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "Add at least one maintenance head to split." };
  }
  if (!Number.isFinite(months) || months <= 0 || months > 120) {
    return { error: "Projection period must be between 1 and 120 months." };
  }

  const detailed = [];
  let total = 0;
  let landlordTotal = 0;
  let tenantTotal = 0;
  let serviceCharges = 0;
  let nonOccupancyCharged = 0;

  for (const row of rows) {
    const head = headByKey(row.key);
    if (!head) return { error: `Unknown maintenance head "${row.key}".` };

    const amount = Number(row.amount);
    const landlordPct = Number(row.landlordPct);

    if (!Number.isFinite(amount)) {
      return { error: `Enter a valid amount for ${head.label}.` };
    }
    if (amount < 0) {
      return { error: `${head.label} cannot be a negative amount.` };
    }
    if (!Number.isFinite(landlordPct) || landlordPct < 0 || landlordPct > 100) {
      return { error: `Landlord share for ${head.label} must be between 0% and 100%.` };
    }

    const landlordAmount = round2((amount * landlordPct) / 100);
    const tenantAmount = round2(amount - landlordAmount);

    total += amount;
    landlordTotal += landlordAmount;
    tenantTotal += tenantAmount;

    if (row.key === "serviceCharges") serviceCharges = amount;
    if (row.key === "nonOccupancy") nonOccupancyCharged = amount;

    detailed.push({
      key: head.key,
      label: head.label,
      note: head.note,
      amount: round2(amount),
      landlordPct,
      tenantPct: round2(100 - landlordPct),
      landlordAmount,
      tenantAmount,
    });
  }

  total = round2(total);
  landlordTotal = round2(landlordTotal);
  tenantTotal = round2(tenantTotal);

  if (total <= 0) {
    return { error: "Enter at least one maintenance head with an amount above zero." };
  }

  const nonOccupancy = checkNonOccupancy({ serviceCharges, charged: nonOccupancyCharged });

  return {
    rows: detailed,
    months,
    totalMonthly: total,
    landlordMonthly: landlordTotal,
    tenantMonthly: tenantTotal,
    landlordSharePct: round2((landlordTotal / total) * 100),
    tenantSharePct: round2((tenantTotal / total) * 100),
    landlordPeriod: round2(landlordTotal * months),
    tenantPeriod: round2(tenantTotal * months),
    totalPeriod: round2(total * months),
    nonOccupancy,
  };
}

/**
 * Non-occupancy charges cannot exceed 10% of service charges.
 * @param {{serviceCharges: number, charged: number}} input
 */
export function checkNonOccupancy({ serviceCharges, charged } = {}) {
  const service = Number(serviceCharges);
  const levied = Number(charged);
  if (!Number.isFinite(service) || service < 0 || !Number.isFinite(levied) || levied < 0) {
    return { applicable: false, cap: 0, charged: 0, excess: 0, withinCap: true };
  }
  const cap = round2(service * NON_OCCUPANCY_CAP_RATE);
  const excess = round2(Math.max(0, levied - cap));
  return {
    applicable: levied > 0 || service > 0,
    cap,
    charged: round2(levied),
    excess,
    withinCap: excess === 0,
  };
}
