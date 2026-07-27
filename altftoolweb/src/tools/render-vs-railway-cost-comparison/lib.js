/**
 * Render vs Railway hosting cost model.
 *
 * Render prices fixed instance tiers (render.com/pricing, USD, last checked
 * mid-2025) billed per second and capped at the monthly instance price.
 * Railway prices raw usage (railway.com/pricing): per-GB RAM and per-vCPU
 * rates prorated by active time, plus metered egress and volume storage,
 * on top of a small subscription that includes an equal usage credit.
 * Both providers change prices; treat results as planning estimates.
 */

/** Hours Render and Railway use for a full month of always-on usage (730 = 8,760 h / 12). */
export const HOURS_PER_MONTH = 730;

/** Render web service instance tiers — render.com/pricing "Services" table. */
export const RENDER_INSTANCES = [
  { id: "starter", label: "Starter — 0.5 CPU, 512 MB", cpu: 0.5, ramGb: 0.5, usd: 7 },
  { id: "standard", label: "Standard — 1 CPU, 2 GB", cpu: 1, ramGb: 2, usd: 25 },
  { id: "pro", label: "Pro — 2 CPU, 4 GB", cpu: 2, ramGb: 4, usd: 85 },
  { id: "pro-plus", label: "Pro Plus — 4 CPU, 8 GB", cpu: 4, ramGb: 8, usd: 175 },
  { id: "pro-max", label: "Pro Max — 4 CPU, 16 GB", cpu: 4, ramGb: 16, usd: 225 },
  { id: "pro-ultra", label: "Pro Ultra — 8 CPU, 32 GB", cpu: 8, ramGb: 32, usd: 450 },
];

/** Render: 100 GB of bandwidth included per workspace each month. */
export const RENDER_FREE_BANDWIDTH_GB = 100;
/** Render bandwidth overage: billed at $30 per additional 100 GB block = $0.30/GB. */
export const RENDER_BANDWIDTH_OVERAGE_PER_GB = 0.3;
/** Render persistent disk price — $0.25 per GB per month. */
export const RENDER_DISK_PER_GB_MONTH = 0.25;

/** Railway usage rates — railway.com/pricing resource pricing table. */
export const RAILWAY_RATES = {
  perVcpuMonth: 20, // $20 per vCPU per month, prorated by the minute
  perGbRamMonth: 10, // $10 per GB RAM per month, prorated by the minute
  egressPerGb: 0.05, // $0.05 per GB of network egress
  volumePerGbMonth: 0.15, // $0.15 per GB per month of volume storage
};

/** Railway subscription plans; each includes the same amount of usage credit. */
export const RAILWAY_PLANS = [
  { id: "hobby", label: "Hobby — $5/mo incl. $5 usage", baseUsd: 5, includedUsageUsd: 5 },
  { id: "pro", label: "Pro — $20/seat incl. $20 usage", baseUsd: 20, includedUsageUsd: 20 },
];

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Compare the monthly cost of one service on Render vs Railway.
 *
 * @param {object} input
 * @param {number} input.vcpu           vCPUs the app needs.
 * @param {number} input.ramGb          RAM in GB the app needs.
 * @param {number} input.hoursPerMonth  Hours per month the service actually runs (max 730).
 * @param {number} input.egressGb       Outbound bandwidth in GB per month.
 * @param {number} input.diskGb         Persistent disk / volume size in GB.
 * @param {string} input.railwayPlanId  One of RAILWAY_PLANS ids.
 * @returns {object} comparison, or { error }.
 */
export function compareRenderVsRailway({
  vcpu,
  ramGb,
  hoursPerMonth,
  egressGb,
  diskGb,
  railwayPlanId = "hobby",
}) {
  const fields = [
    ["vCPU", vcpu],
    ["RAM", ramGb],
    ["Hours per month", hoursPerMonth],
    ["Egress", egressGb],
    ["Disk size", diskGb],
  ];
  for (const [label, value] of fields) {
    const n = Number(value);
    if (!Number.isFinite(n)) return { error: `${label} must be a number.` };
    if (n < 0) return { error: `${label} cannot be negative.` };
  }
  const cpuNeed = Number(vcpu);
  const ramNeed = Number(ramGb);
  const hours = Math.min(Number(hoursPerMonth), HOURS_PER_MONTH);
  const egress = Number(egressGb);
  const disk = Number(diskGb);

  if (cpuNeed === 0 && ramNeed === 0) {
    return { error: "Enter the CPU or RAM the app needs — both cannot be zero." };
  }
  if (hours === 0) return { error: "Hours per month must be greater than zero." };

  const plan = RAILWAY_PLANS.find((p) => p.id === railwayPlanId);
  if (!plan) return { error: "Choose a valid Railway plan." };

  // Render: smallest fixed instance that satisfies both CPU and RAM.
  const instance = RENDER_INSTANCES.find((t) => t.cpu >= cpuNeed && t.ramGb >= ramNeed) ?? null;
  const runFraction = hours / HOURS_PER_MONTH;

  let render = null;
  if (instance) {
    const compute = round2(instance.usd * runFraction);
    const bandwidth = round2(
      Math.max(0, egress - RENDER_FREE_BANDWIDTH_GB) * RENDER_BANDWIDTH_OVERAGE_PER_GB,
    );
    const diskCost = round2(disk * RENDER_DISK_PER_GB_MONTH);
    render = {
      instance: instance.label,
      instanceUsd: instance.usd,
      compute,
      bandwidth,
      disk: diskCost,
      total: round2(compute + bandwidth + diskCost),
    };
  }

  // Railway: pure usage, prorated by run time, plus subscription minus credit.
  const railwayCompute = round2(
    (cpuNeed * RAILWAY_RATES.perVcpuMonth + ramNeed * RAILWAY_RATES.perGbRamMonth) * runFraction,
  );
  const railwayEgress = round2(egress * RAILWAY_RATES.egressPerGb);
  const railwayDisk = round2(disk * RAILWAY_RATES.volumePerGbMonth);
  const railwayUsage = round2(railwayCompute + railwayEgress + railwayDisk);
  const railwayTotal = round2(
    plan.baseUsd + Math.max(0, railwayUsage - plan.includedUsageUsd),
  );

  const railway = {
    plan: plan.label,
    compute: railwayCompute,
    egress: railwayEgress,
    disk: railwayDisk,
    usage: railwayUsage,
    base: plan.baseUsd,
    credit: Math.min(railwayUsage, plan.includedUsageUsd),
    total: railwayTotal,
  };

  let cheaper = null;
  let savings = 0;
  if (render) {
    cheaper = render.total === railway.total ? "tie" : render.total < railway.total ? "render" : "railway";
    savings = round2(Math.abs(render.total - railway.total));
  }

  return {
    render,
    renderFits: Boolean(instance),
    renderNote: instance
      ? null
      : "No single Render instance offers this much CPU/RAM — the largest tier is Pro Ultra (8 CPU, 32 GB). You would need multiple instances.",
    railway,
    cheaper,
    savings,
    hoursUsed: hours,
  };
}
