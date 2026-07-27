/**
 * Gaming PC electricity cost model.
 *
 * The maths
 *  1. DC load  = GPU board power x GPU load factor
 *              + CPU package power x CPU load factor
 *              + the rest of the platform (board, RAM, drives, fans, pump, RGB).
 *  2. Wall power = DC load / PSU efficiency, because the power supply itself
 *     wastes a percentage of everything it delivers as heat. The monitor is
 *     added after the PSU since it plugs into the socket on its own.
 *  3. Energy (kWh) = wall watts x hours / 1000; cost = kWh x tariff.
 *
 * PSU efficiency figures are the 80 PLUS certification thresholds at 50 %
 * load on 115 V, which is where a gaming PSU normally sits. Source: the
 * 80 PLUS program efficiency table (White 82 %, Bronze 85 %, Silver 88 %,
 * Gold 90 %, Platinum 92 %, Titanium 94 %).
 */

export const DAYS_PER_YEAR = 365;
export const DAYS_PER_MONTH = 365 / 12;

/** CEA CO2 Baseline Database for the Indian grid, combined margin ~0.71 kg/kWh. */
export const GRID_CO2_KG_PER_KWH = 0.71;

/** 80 PLUS efficiency at 50 % load, 115 V (80 PLUS certification thresholds). */
export const PSU_RATINGS = [
  { id: "none", label: "Unrated / generic PSU", efficiency: 0.75 },
  { id: "white", label: "80 PLUS White", efficiency: 0.82 },
  { id: "bronze", label: "80 PLUS Bronze", efficiency: 0.85 },
  { id: "silver", label: "80 PLUS Silver", efficiency: 0.88 },
  { id: "gold", label: "80 PLUS Gold", efficiency: 0.9 },
  { id: "platinum", label: "80 PLUS Platinum", efficiency: 0.92 },
  { id: "titanium", label: "80 PLUS Titanium", efficiency: 0.94 },
];

/**
 * Share of rated board/package power each part actually pulls in a workload.
 * A GPU sits at its power limit in a AAA game, while a game rarely saturates
 * every CPU core, so the CPU runs well below its package power limit.
 */
export const WORKLOADS = [
  { id: "aaa", label: "AAA gaming (GPU-bound)", gpuLoad: 0.95, cpuLoad: 0.6 },
  { id: "esports", label: "Esports / capped frame rate", gpuLoad: 0.55, cpuLoad: 0.45 },
  { id: "render", label: "Rendering, encoding or AI (all-core)", gpuLoad: 1.0, cpuLoad: 1.0 },
  { id: "browsing", label: "Browsing and video playback", gpuLoad: 0.1, cpuLoad: 0.2 },
];

/** Headroom multiplier over peak DC load when sizing a power supply. */
export const PSU_HEADROOM = 1.3;
/** PSUs are sold in 50 W steps. */
export const PSU_STEP_W = 50;

export const DEFAULT_OTHER_W = 60; // board + RAM + NVMe + fans + AIO pump + RGB
export const DEFAULT_IDLE_W = 60; // whole system sitting at the desktop
export const DEFAULT_SLEEP_W = 3; // ATX S3 sleep / soft-off draw
export const DEFAULT_MONITOR_W = 30;

const num = (value) => {
  if (value === "" || value === null || value === undefined) return Number.NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
};

/** Smallest PSU in 50 W steps that covers peak DC load plus headroom. */
export function suggestPsuWatts(peakDcWatts) {
  if (!(peakDcWatts > 0)) return Number.NaN;
  return Math.ceil((peakDcWatts * PSU_HEADROOM) / PSU_STEP_W) * PSU_STEP_W;
}

/**
 * @param {object} input
 * @param {number} input.gpuWatts      GPU board power (TGP/TBP) in watts.
 * @param {number} input.cpuWatts      CPU package power limit in watts.
 * @param {number} input.otherWatts    Rest-of-platform draw in watts.
 * @param {number} input.monitorWatts  Monitor draw in watts.
 * @param {string} input.psuId         PSU_RATINGS id.
 * @param {string} input.workloadId    WORKLOADS id.
 * @param {number} input.gamingHours   Hours per day under that workload.
 * @param {number} input.idleHours     Hours per day awake but idle.
 * @param {number} input.idleWatts     System draw while idle.
 * @param {number} input.sleepWatts    Draw for the remaining hours.
 * @param {number} input.tariff        Price per kWh.
 * @returns {object} result or { error }
 */
export function computeGamingPcCost({
  gpuWatts,
  cpuWatts,
  otherWatts = DEFAULT_OTHER_W,
  monitorWatts = DEFAULT_MONITOR_W,
  psuId = "gold",
  workloadId = "aaa",
  gamingHours,
  idleHours,
  idleWatts = DEFAULT_IDLE_W,
  sleepWatts = DEFAULT_SLEEP_W,
  tariff,
}) {
  const psu = PSU_RATINGS.find((p) => p.id === psuId);
  const workload = WORKLOADS.find((w) => w.id === workloadId);
  if (!psu) return { error: "Choose a power supply rating." };
  if (!workload) return { error: "Choose a workload." };

  const gpu = num(gpuWatts);
  const cpu = num(cpuWatts);
  const other = num(otherWatts);
  const monitor = num(monitorWatts);
  const gh = num(gamingHours);
  const ih = num(idleHours);
  const idle = num(idleWatts);
  const sleep = num(sleepWatts);
  const rate = num(tariff);

  const all = [gpu, cpu, other, monitor, gh, ih, idle, sleep, rate];
  if (all.some((v) => Number.isNaN(v))) return { error: "Enter a number in every field." };
  if (gpu < 0 || cpu < 0 || other < 0 || monitor < 0 || idle < 0 || sleep < 0) {
    return { error: "Wattages cannot be negative." };
  }
  if (gpu > 1500 || cpu > 1000) return { error: "GPU and CPU power look out of range for a desktop PC." };
  if (gh < 0 || ih < 0) return { error: "Hours cannot be negative." };
  if (gh + ih > 24) return { error: "Gaming hours plus idle hours cannot exceed 24 in a day." };
  if (rate <= 0) return { error: "Electricity tariff must be greater than zero." };

  const dcLoadWatts = gpu * workload.gpuLoad + cpu * workload.cpuLoad + other;
  const loadWallWatts = dcLoadWatts / psu.efficiency + monitor;
  const idleWallWatts = idle / psu.efficiency + monitor;
  const psuLossWatts = dcLoadWatts / psu.efficiency - dcLoadWatts;

  const sleepHours = Math.max(0, 24 - gh - ih);
  const loadKwhPerDay = (loadWallWatts * gh) / 1000;
  const idleKwhPerDay = (idleWallWatts * ih) / 1000;
  const sleepKwhPerDay = (sleep * sleepHours) / 1000;
  const kwhPerDay = loadKwhPerDay + idleKwhPerDay + sleepKwhPerDay;

  const kwhPerMonth = kwhPerDay * DAYS_PER_MONTH;
  const kwhPerYear = kwhPerDay * DAYS_PER_YEAR;

  const peakDcWatts = gpu + cpu + other;

  return {
    psu,
    workload,
    dcLoadWatts,
    loadWallWatts,
    idleWallWatts,
    psuLossWatts,
    sleepHours,
    loadKwhPerDay,
    idleKwhPerDay,
    sleepKwhPerDay,
    kwhPerDay,
    kwhPerMonth,
    kwhPerYear,
    costPerHourGaming: (loadWallWatts / 1000) * rate,
    costPerDay: kwhPerDay * rate,
    costPerMonth: kwhPerMonth * rate,
    costPerYear: kwhPerYear * rate,
    peakDcWatts,
    suggestedPsuWatts: suggestPsuWatts(peakDcWatts),
    co2KgPerYear: kwhPerYear * GRID_CO2_KG_PER_KWH,
  };
}
