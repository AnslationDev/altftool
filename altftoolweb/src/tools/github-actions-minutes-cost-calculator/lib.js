/**
 * GitHub Actions minutes cost estimator.
 *
 * All rates and rules from GitHub's billing docs, "About billing for GitHub
 * Actions" (docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions):
 *  - Standard GitHub-hosted runners are FREE for public repositories.
 *  - Private repos consume an included-minutes allowance, then pay per minute.
 *  - Minute multipliers: Linux 1x, Windows 2x, macOS 10x.
 *  - Per-minute overage rates (standard runners): Linux 2-core $0.008,
 *    Windows 2-core $0.016, macOS $0.08 — exactly the Linux rate times the
 *    multiplier, so overage cost = overage Linux-equivalent minutes x $0.008.
 *  - Every job's duration is rounded UP to the nearest whole minute.
 */

/** USD per Linux-equivalent minute (Linux 2-core standard runner rate). */
export const LINUX_RATE_USD = 0.008;

/** Included-minute consumption multipliers per runner OS. */
export const OS_MULTIPLIERS = { linux: 1, windows: 2, macos: 10 };

/** Per-minute USD rates per OS (= LINUX_RATE_USD x multiplier, as documented). */
export const OS_RATES_USD = {
  linux: LINUX_RATE_USD * OS_MULTIPLIERS.linux, // $0.008
  windows: LINUX_RATE_USD * OS_MULTIPLIERS.windows, // $0.016
  macos: LINUX_RATE_USD * OS_MULTIPLIERS.macos, // $0.08
};

/** Included minutes per month for private repos, by plan. */
export const PLAN_OPTIONS = [
  { id: "free", label: "GitHub Free", included: 2000 },
  { id: "pro", label: "GitHub Pro", included: 3000 },
  { id: "team", label: "GitHub Team", included: 3000 },
  { id: "enterprise", label: "GitHub Enterprise Cloud", included: 50000 },
];

export const OS_LABELS = { linux: "Linux (ubuntu-latest)", windows: "Windows", macos: "macOS" };

const OS_KEYS = ["linux", "windows", "macos"];

/**
 * Estimate the monthly bill.
 * @param {object} input
 * @param {string}  input.plan            One of PLAN_OPTIONS ids.
 * @param {boolean} input.publicRepo      True when workflows run in a public repo.
 * @param {object}  input.workload        { linux: {jobs, minutes}, windows: {...}, macos: {...} }
 *                                        jobs = jobs per month, minutes = average minutes per job.
 * @returns {object} result or { error }
 */
export function estimateActionsCost({ plan, publicRepo = false, workload }) {
  const planEntry = PLAN_OPTIONS.find((option) => option.id === plan);
  if (!planEntry) return { error: "Choose a GitHub plan." };
  if (!workload || typeof workload !== "object") return { error: "Enter your monthly workload." };

  const perOs = {};
  let multipliedTotal = 0;

  for (const os of OS_KEYS) {
    const jobs = Number(workload[os]?.jobs ?? 0);
    const minutes = Number(workload[os]?.minutes ?? 0);
    if (!Number.isFinite(jobs) || jobs < 0 || !Number.isInteger(jobs)) {
      return { error: `${OS_LABELS[os]}: jobs per month must be a whole number of 0 or more.` };
    }
    if (!Number.isFinite(minutes)) {
      return { error: `${OS_LABELS[os]}: average minutes per job must be a finite number.` };
    }
    if (minutes < 0) {
      return { error: `${OS_LABELS[os]}: average minutes per job cannot be negative.` };
    }
    if (jobs > 10000000) {
      return { error: `${OS_LABELS[os]}: more than 10 million jobs a month — check the number.` };
    }
    if (minutes > 360) {
      // GitHub-hosted jobs are killed after 6 hours = 360 min (docs.github.com billing docs).
      return { error: `${OS_LABELS[os]}: GitHub-hosted jobs are cancelled after 360 minutes — ${minutes} is not billable.` };
    }
    // Each job rounds UP to the next whole minute (GitHub billing docs).
    const billedPerJob = jobs > 0 ? Math.ceil(minutes) : 0;
    const raw = jobs * billedPerJob;
    const multiplied = raw * OS_MULTIPLIERS[os];
    perOs[os] = {
      rawMinutes: raw,
      multiplier: OS_MULTIPLIERS[os],
      multipliedMinutes: multiplied,
    };
    multipliedTotal += multiplied;
  }

  if (publicRepo) {
    return {
      publicRepo: true,
      perOs,
      multipliedTotal,
      included: 0,
      overageMinutes: 0,
      cost: 0,
      note: "Standard GitHub-hosted runners are free for public repositories — larger runners are always billed.",
      plan: planEntry,
    };
  }

  const included = planEntry.included;
  const overageMinutes = Math.max(0, multipliedTotal - included);
  // Overage rates are exactly multiplier-proportional, so the bill equals
  // Linux-equivalent overage minutes at the Linux rate regardless of which OS
  // "used up" the included allowance first.
  const cost = overageMinutes * LINUX_RATE_USD;

  return {
    publicRepo: false,
    perOs,
    multipliedTotal,
    included,
    includedUsedPercent: included === 0 ? 100 : Math.min(100, (multipliedTotal / included) * 100),
    overageMinutes,
    cost,
    plan: planEntry,
  };
}
