/**
 * Staking Reward Calculator.
 *
 * Formulas (standard compound-interest mathematics, the same identities used
 * for APY disclosure under the US Truth in Savings Act, 12 CFR Part 1030
 * Appendix A):
 *
 *   Effective nominal rate after the validator/platform cut:
 *     r = APR × (1 − commission)
 *
 *   Compounding (rewards automatically restaked n times per year for t years):
 *     A = P × (1 + r/n)^(n·t)
 *     APY = (1 + r/n)^n − 1
 *
 *   No compounding (rewards paid out and never restaked):
 *     A = P × (1 + r·t)
 *     APY = r
 *
 *   Reward tokens = A − P.
 *
 * Nothing here reads the clock: the horizon is supplied in years so the same
 * inputs always give the same output.
 */

/** Reward-payout frequencies, expressed as compounding periods per year. */
export const COMPOUND_FREQUENCIES = [
  { id: "daily", label: "Daily", periodsPerYear: 365 },
  { id: "weekly", label: "Weekly", periodsPerYear: 52 },
  { id: "monthly", label: "Monthly", periodsPerYear: 12 },
  { id: "quarterly", label: "Quarterly", periodsPerYear: 4 },
  { id: "annually", label: "Annually", periodsPerYear: 1 },
];

/** Calendar days per year used to convert a rate into a daily figure. */
export const DAYS_PER_YEAR = 365;

/** Sanity ceilings so an unrealistic entry produces a message, not a silly number. */
export const MAX_APR_PERCENT = 1000;
export const MAX_YEARS = 50;

/**
 * Convert a nominal annual rate into the effective annual yield when rewards
 * are compounded `periodsPerYear` times a year.
 *
 * @param {number} nominalRate    e.g. 0.08 for 8 % APR
 * @param {number} periodsPerYear e.g. 365
 * @returns {number} effective annual yield as a decimal, or NaN on bad input.
 */
export function aprToApy(nominalRate, periodsPerYear) {
  const r = Number(nominalRate);
  const n = Number(periodsPerYear);
  if (!Number.isFinite(r) || !Number.isFinite(n) || n <= 0) return Number.NaN;
  return Math.pow(1 + r / n, n) - 1;
}

/**
 * Project staking rewards.
 *
 * @param {object} input
 * @param {number} input.principalTokens   Tokens staked at the start.
 * @param {number} input.aprPercent        Advertised nominal annual reward rate, in percent.
 * @param {number} [input.commissionPercent] Validator / platform commission, in percent of rewards.
 * @param {string} [input.frequencyId]     COMPOUND_FREQUENCIES[].id.
 * @param {boolean} [input.restake]        Rewards are automatically restaked.
 * @param {number} [input.years]           Staking horizon in years.
 * @param {number} [input.tokenPrice]      Token price today, in the display currency.
 * @returns {object} projection or { error }.
 */
export function computeStakingRewards({
  principalTokens,
  aprPercent,
  commissionPercent = 0,
  frequencyId = "daily",
  restake = true,
  years = 1,
  tokenPrice = 0,
}) {
  const principal = Number(principalTokens);
  if (!Number.isFinite(principal) || principal <= 0) {
    return { error: "Enter how many tokens you are staking — it must be more than zero." };
  }

  const apr = Number(aprPercent);
  if (!Number.isFinite(apr) || apr < 0) {
    return { error: "Enter the staking APR as a percentage of zero or more." };
  }
  if (apr > MAX_APR_PERCENT) {
    return { error: `An APR above ${MAX_APR_PERCENT}% is not a realistic staking rate — check the figure.` };
  }

  const commission = Number(commissionPercent);
  if (!Number.isFinite(commission) || commission < 0 || commission >= 100) {
    return { error: "Commission must be between 0% and just under 100% of rewards." };
  }

  const t = Number(years);
  if (!Number.isFinite(t) || t <= 0) {
    return { error: "Enter a staking period longer than zero years." };
  }
  if (t > MAX_YEARS) {
    return { error: `Projections beyond ${MAX_YEARS} years are not meaningful — shorten the period.` };
  }

  const freq = COMPOUND_FREQUENCIES.find((f) => f.id === frequencyId);
  if (!freq) return { error: "Choose how often rewards are paid." };

  const price = Number(tokenPrice);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Token price cannot be negative." };
  }

  const nominal = apr / 100;
  const effectiveNominal = nominal * (1 - commission / 100);
  const n = freq.periodsPerYear;

  const apy = restake ? aprToApy(effectiveNominal, n) : effectiveNominal;
  const finalTokens = restake
    ? principal * Math.pow(1 + effectiveNominal / n, n * t)
    : principal * (1 + effectiveNominal * t);

  if (!Number.isFinite(finalTokens)) {
    return { error: "Those numbers overflow the calculation — reduce the rate or the period." };
  }

  const rewardTokens = finalTokens - principal;
  // Restake branch: derive commission directly from the net reward actually
  // earned, rather than diffing against a hypothetical no-commission balance
  // (that hypothetical compounds the *gross* rate, which overstates commission
  // kept by the validator relative to a true period-by-period model — see
  // rewardTokens * commission / (100 - commission), which matches a discrete
  // per-period simulation where commission is deducted before each period's
  // net reward compounds).
  const commissionTokens = restake
    ? rewardTokens * (commission / (100 - commission))
    : principal * nominal * t - rewardTokens;

  // Year-by-year balances (whole years within the horizon, plus the end point).
  const schedule = [];
  const wholeYears = Math.min(Math.floor(t), MAX_YEARS);
  for (let year = 1; year <= wholeYears; year += 1) {
    const balance = restake
      ? principal * Math.pow(1 + effectiveNominal / n, n * year)
      : principal * (1 + effectiveNominal * year);
    schedule.push({ year, balance, reward: balance - principal });
  }
  if (t > wholeYears) {
    schedule.push({ year: t, balance: finalTokens, reward: rewardTokens, partial: true });
  }

  return {
    principal,
    finalTokens,
    rewardTokens,
    commissionTokens: Math.max(commissionTokens, 0),
    apr: nominal,
    effectiveApr: effectiveNominal,
    apy,
    frequency: freq,
    restake,
    years: t,
    tokenPrice: price,
    fiatFinal: finalTokens * price,
    fiatReward: rewardTokens * price,
    schedule,
  };
}
