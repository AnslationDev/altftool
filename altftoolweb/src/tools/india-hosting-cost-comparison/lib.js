/**
 * Hosting cost comparison for an Indian workload.
 *
 * Pure arithmetic. All unit rates are arguments so the tool never depends on a
 * price list that could go stale; the UI seeds editable defaults.
 */

/**
 * Cloud providers bill a "month" as 730 hours (365 x 24 / 12 = 730), so an
 * always-on instance costs hourlyRate x 730, not hourlyRate x 24 x 30.
 */
export const HOURS_PER_MONTH = 730;

/**
 * GST on hosting supplied to an Indian business is 18% (SAC 998315, information
 * technology infrastructure and hosting services). Registered businesses can
 * usually claim input tax credit, so both the ex-GST and inclusive figures are
 * reported.
 */
export const GST_RATE_PCT = 18;

/**
 * Network transfer is quoted in decimal terabytes by essentially every host:
 * 1 TB of bandwidth means 1000 GB, not 1024 GB.
 */
export const GB_PER_TB = 1000;

export const MONTHS_PER_YEAR = 12;
export const TCO_YEARS = 3;

export const PRICING_MODELS = [
  { id: "flat", label: "Flat monthly plan (VPS / managed)" },
  { id: "hourly", label: "Hourly on-demand (cloud IaaS)" },
];

/**
 * Illustrative starting points for a small production workload, chosen to show
 * the shape of each model rather than to quote any particular vendor. Replace
 * every number with the one on your own quote or invoice.
 */
export const PROVIDER_DEFAULTS = [
  {
    id: "vps",
    name: "Indian VPS, self-managed",
    model: "flat",
    currency: "INR",
    flatMonthly: 1400,
    hourlyRate: 0,
    storagePerGbMonth: 0,
    includedStorageGb: 200,
    freeEgressGb: 2000,
    egressPerGb: 0.5,
    backupMonthly: 150,
    managementMonthly: 0,
    commitmentDiscountPct: 0,
  },
  {
    id: "cloud",
    name: "Cloud IaaS, on-demand",
    model: "hourly",
    currency: "USD",
    flatMonthly: 0,
    hourlyRate: 0.08,
    storagePerGbMonth: 0.1,
    includedStorageGb: 0,
    freeEgressGb: 100,
    egressPerGb: 0.09,
    backupMonthly: 3,
    managementMonthly: 0,
    commitmentDiscountPct: 0,
  },
  {
    id: "managed",
    name: "Managed hosting with support",
    model: "flat",
    currency: "INR",
    flatMonthly: 3500,
    hourlyRate: 0,
    storagePerGbMonth: 0,
    includedStorageGb: 250,
    freeEgressGb: 1000,
    egressPerGb: 2,
    backupMonthly: 0,
    managementMonthly: 2500,
    commitmentDiscountPct: 0,
  },
];

export const DEFAULT_WORKLOAD = {
  vcpu: 4,
  ramGb: 8,
  storageGb: 160,
  egressGb: 500,
  hoursPerMonth: HOURS_PER_MONTH,
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

/** Convert a provider-currency amount into rupees. */
export function toInr(amount, currency, usdToInr) {
  if (currency === "USD") return amount * usdToInr;
  return amount;
}

/**
 * Monthly cost of one provider for one workload.
 * @returns {{error:string}|object}
 */
export function providerMonthlyCost({ provider, workload, usdToInr }) {
  if (!provider || typeof provider !== "object") return { error: "Provider rate card is missing." };
  if (!workload || typeof workload !== "object") return { error: "Workload is missing." };

  const { storageGb, egressGb, hoursPerMonth } = workload;
  if (!isNum(storageGb) || storageGb < 0) return { error: "Storage must be zero or more GB." };
  if (!isNum(egressGb) || egressGb < 0) return { error: "Monthly egress must be zero or more GB." };
  if (!isNum(hoursPerMonth) || hoursPerMonth <= 0 || hoursPerMonth > HOURS_PER_MONTH) {
    return { error: `Running hours must be between 1 and ${HOURS_PER_MONTH} per month.` };
  }
  if (!isNum(usdToInr) || usdToInr <= 0) {
    return { error: "Enter the USD to INR rate you want to price with." };
  }

  const fields = [
    "flatMonthly",
    "hourlyRate",
    "storagePerGbMonth",
    "includedStorageGb",
    "freeEgressGb",
    "egressPerGb",
    "backupMonthly",
    "managementMonthly",
    "commitmentDiscountPct",
  ];
  for (const field of fields) {
    const value = Number(provider[field]);
    if (!isNum(value) || value < 0) {
      return { error: `"${provider.name}" needs a non-negative number for every rate.` };
    }
  }
  if (Number(provider.commitmentDiscountPct) > 90) {
    return { error: "A commitment discount above 90% is not realistic — check the figure." };
  }

  const compute =
    provider.model === "hourly"
      ? Number(provider.hourlyRate) * hoursPerMonth
      : Number(provider.flatMonthly);

  const billableStorage = Math.max(0, storageGb - Number(provider.includedStorageGb));
  const storage = billableStorage * Number(provider.storagePerGbMonth);

  const billableEgress = Math.max(0, egressGb - Number(provider.freeEgressGb));
  const egress = billableEgress * Number(provider.egressPerGb);

  const addOns = Number(provider.backupMonthly) + Number(provider.managementMonthly);

  // Commitment discounts (reserved instances, annual prepay) normally apply to
  // the compute line only, not to transfer or managed-service charges.
  const discount = (compute * Number(provider.commitmentDiscountPct)) / 100;
  const nativeExGst = compute - discount + storage + egress + addOns;

  const exGst = toInr(nativeExGst, provider.currency, usdToInr);
  const gst = (exGst * GST_RATE_PCT) / 100;
  const total = exGst + gst;

  return {
    id: provider.id,
    name: provider.name,
    currency: provider.currency,
    computeInr: toInr(compute - discount, provider.currency, usdToInr),
    storageInr: toInr(storage, provider.currency, usdToInr),
    egressInr: toInr(egress, provider.currency, usdToInr),
    addOnsInr: toInr(addOns, provider.currency, usdToInr),
    discountInr: toInr(discount, provider.currency, usdToInr),
    billableEgressGb: billableEgress,
    billableStorageGb: billableStorage,
    exGst,
    gst,
    total,
    annual: total * MONTHS_PER_YEAR,
    tco: total * MONTHS_PER_YEAR * TCO_YEARS,
    perVcpu: isNum(workload.vcpu) && workload.vcpu > 0 ? total / workload.vcpu : 0,
  };
}

/**
 * Egress volume at which two providers cost the same, in GB per month.
 * Returns null when the lines never cross in the positive region.
 */
export function egressBreakEvenGb(a, b, { workload, usdToInr }) {
  const cost = (provider, egressGb) =>
    providerMonthlyCost({ provider, workload: { ...workload, egressGb }, usdToInr });

  const rateA = toInr(Number(a.egressPerGb), a.currency, usdToInr);
  const rateB = toInr(Number(b.egressPerGb), b.currency, usdToInr);
  if (!isNum(rateA) || !isNum(rateB) || rateA === rateB) return null;

  const floor = Math.max(Number(a.freeEgressGb) || 0, Number(b.freeEgressGb) || 0);
  const atFloorA = cost(a, floor);
  const atFloorB = cost(b, floor);
  if (atFloorA.error || atFloorB.error) return null;

  // Above the larger free allowance both curves are straight lines in egress.
  const crossing = floor + (atFloorB.total - atFloorA.total) / (rateA - rateB) / (1 + GST_RATE_PCT / 100);
  if (!Number.isFinite(crossing) || crossing < floor) return null;
  return Math.round(crossing);
}

/**
 * Rank providers for one workload.
 * @returns {{error:string}|{results:Array,cheapest:object,dearest:object,spread:number,annualSpread:number,breakEven:number|null}}
 */
export function compareHosting({ providers, workload, usdToInr }) {
  if (!Array.isArray(providers) || providers.length === 0) {
    return { error: "Select at least one hosting option to compare." };
  }
  if (!workload || !isNum(workload.vcpu) || workload.vcpu <= 0) {
    return { error: "vCPU count must be greater than zero." };
  }
  if (!isNum(workload.ramGb) || workload.ramGb <= 0) {
    return { error: "RAM must be greater than zero." };
  }

  const results = [];
  for (const provider of providers) {
    const result = providerMonthlyCost({ provider, workload, usdToInr });
    if (result.error) return result;
    results.push(result);
  }

  results.sort((a, b) => a.total - b.total);
  const cheapest = results[0];
  const dearest = results[results.length - 1];

  let breakEven = null;
  if (providers.length >= 2) {
    const first = providers.find((p) => p.id === results[0].id);
    const second = providers.find((p) => p.id === results[1]?.id);
    if (first && second) breakEven = egressBreakEvenGb(first, second, { workload, usdToInr });
  }

  return {
    results,
    cheapest,
    dearest,
    spread: dearest.total - cheapest.total,
    annualSpread: (dearest.total - cheapest.total) * MONTHS_PER_YEAR,
    savingsPct: dearest.total > 0 ? round2(((dearest.total - cheapest.total) / dearest.total) * 100) : 0,
    breakEven,
  };
}

/** Convenience: terabytes of transfer to gigabytes, decimal as hosts quote it. */
export function tbToGb(tb) {
  return isNum(tb) && tb >= 0 ? tb * GB_PER_TB : 0;
}
