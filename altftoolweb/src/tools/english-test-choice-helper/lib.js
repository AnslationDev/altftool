/**
 * English proficiency test comparison model — IELTS Academic, TOEFL iBT,
 * PTE Academic and the Duolingo English Test (DET).
 *
 * Fact base (fees, durations, result times, acceptance) reflects the tests as
 * publicly documented by their operators (IDP/British Council, ETS, Pearson,
 * Duolingo) as of 2025. Fees vary by country, so they are stored as
 * approximate USD figures and flagged as approximate in the UI.
 */

/** Priority weight applied to a "low / medium / high" importance choice. */
export const PRIORITY_WEIGHTS = { low: 1, medium: 2, high: 3 };

/**
 * Acceptance always matters more than comfort factors, so it carries a fixed
 * weight equal to the maximum user-adjustable weight (3).
 */
export const ACCEPTANCE_WEIGHT = 3;

/**
 * Study purposes. Acceptance notes:
 * - UK below-degree student visas require a UKVI-approved SELT: IELTS for UKVI
 *   and PTE Academic UKVI qualify; TOEFL and DET are not on the Home Office SELT list.
 *   For degree-level study UK universities can self-assess and most accept all four.
 * - Australian student visas accept IELTS, TOEFL iBT and PTE Academic;
 *   the Department of Home Affairs does not accept DET.
 * - US universities accept all four widely; DET is accepted by 5,000+ institutions.
 * - Canadian universities accept IELTS, TOEFL and PTE broadly; DET acceptance
 *   is narrower and institution-specific.
 */
export const PURPOSES = [
  { id: "us-study", label: "Study in the USA" },
  { id: "uk-study", label: "Study in the UK (degree level)" },
  { id: "uk-visa", label: "UK visa route needing an approved SELT" },
  { id: "canada-study", label: "Study in Canada" },
  { id: "australia-study", label: "Study in Australia (incl. visa)" },
];

/**
 * Test fact table.
 * feeUsd        — approximate 2025 exam fee in USD (varies by country).
 * durationMin   — sitting length in minutes (TOEFL iBT shortened to ~2 h in
 *                 July 2023; PTE shortened to 2 h in Nov 2021; DET is ~1 h).
 * resultDays    — typical days until scores are released.
 * homeTesting   — an at-home edition exists that institutions commonly accept
 *                 (TOEFL Home Edition, DET; IELTS Online and PTE Online exist
 *                 but are excluded from visa routes, so they score partial).
 * scale         — reported score scale.
 * speaking      — who assesses the speaking section.
 * acceptance    — per purpose: 2 = accepted for this route, 1 = accepted by
 *                 some institutions only, 0 = not accepted for this route.
 */
export const TESTS = [
  {
    id: "ielts",
    name: "IELTS Academic",
    feeUsd: 250,
    durationMin: 165,
    resultDays: 4, // computer-delivered: 3-5 days (paper takes ~13)
    homeTesting: 1, // IELTS Online exists but is not valid for UKVI/visa routes
    scale: "Band 0-9",
    speaking: "Live human examiner",
    acceptance: {
      "us-study": 2,
      "uk-study": 2,
      "uk-visa": 2, // IELTS for UKVI is an approved SELT
      "canada-study": 2,
      "australia-study": 2,
    },
  },
  {
    id: "toefl",
    name: "TOEFL iBT",
    feeUsd: 220,
    durationMin: 116,
    resultDays: 6, // ETS: 4-8 days
    homeTesting: 2, // TOEFL iBT Home Edition is widely accepted by universities
    scale: "0-120",
    speaking: "Recorded, human + AI scored",
    acceptance: {
      "us-study": 2,
      "uk-study": 2,
      "uk-visa": 0, // TOEFL is not on the UK Home Office SELT list
      "canada-study": 2,
      "australia-study": 2,
    },
  },
  {
    id: "pte",
    name: "PTE Academic",
    feeUsd: 210,
    durationMin: 120,
    resultDays: 2, // Pearson: typically within 48 hours
    homeTesting: 1, // PTE Academic Online is not accepted for visas
    scale: "10-90",
    speaking: "Computer, AI scored",
    acceptance: {
      "us-study": 2,
      "uk-study": 2,
      "uk-visa": 2, // PTE Academic UKVI is an approved SELT
      "canada-study": 2,
      "australia-study": 2,
    },
  },
  {
    id: "det",
    name: "Duolingo English Test",
    feeUsd: 65,
    durationMin: 60,
    resultDays: 2,
    homeTesting: 2, // taken entirely at home
    scale: "10-160",
    speaking: "Computer, AI scored",
    acceptance: {
      "us-study": 2, // accepted by 5,000+ institutions, strongest in the US
      "uk-study": 1, // many UK universities accept it for degree-level study
      "uk-visa": 0, // not an approved SELT
      "canada-study": 1,
      "australia-study": 0, // not accepted for Australian student visas
    },
  },
];

const clampScore = (value) => Math.max(0, Math.min(100, value));

/** Scale a value where the best (lowest) input earns 100 and the worst earns 0. */
function inverseScale(value, best, worst) {
  if (worst === best) return 100;
  return clampScore(((worst - value) / (worst - best)) * 100);
}

/**
 * Rank the four tests for a purpose and set of priorities.
 *
 * Score = weighted mean of cost, speed, convenience and acceptance sub-scores
 * (each 0-100). Tests not accepted for the chosen route are excluded from the
 * ranking and listed separately with the reason.
 */
export function rankTests({ purpose, costPriority, speedPriority, homePriority }) {
  const validPurpose = PURPOSES.some((p) => p.id === purpose);
  if (!validPurpose) return { error: "Choose the destination or route you are applying for." };

  const wCost = PRIORITY_WEIGHTS[costPriority];
  const wSpeed = PRIORITY_WEIGHTS[speedPriority];
  const wHome = PRIORITY_WEIGHTS[homePriority];
  if (!wCost || !wSpeed || !wHome) {
    return { error: "Set each priority to low, medium or high." };
  }

  const fees = TESTS.map((t) => t.feeUsd);
  const days = TESTS.map((t) => t.resultDays);
  const minFee = Math.min(...fees);
  const maxFee = Math.max(...fees);
  const minDays = Math.min(...days);
  const maxDays = Math.max(...days);

  const totalWeight = wCost + wSpeed + wHome + ACCEPTANCE_WEIGHT;

  const scored = TESTS.map((test) => {
    const acceptanceLevel = test.acceptance[purpose];
    const costScore = inverseScale(test.feeUsd, minFee, maxFee);
    const speedScore = inverseScale(test.resultDays, minDays, maxDays);
    // Convenience: home-testing availability (0/1/2 -> 0/50/100).
    const homeScore = clampScore(test.homeTesting * 50);
    const acceptanceScore = clampScore(acceptanceLevel * 50);
    const score =
      (wCost * costScore +
        wSpeed * speedScore +
        wHome * homeScore +
        ACCEPTANCE_WEIGHT * acceptanceScore) /
      totalWeight;
    return {
      id: test.id,
      name: test.name,
      feeUsd: test.feeUsd,
      durationMin: test.durationMin,
      resultDays: test.resultDays,
      scale: test.scale,
      speaking: test.speaking,
      acceptanceLevel,
      costScore: Math.round(costScore),
      speedScore: Math.round(speedScore),
      homeScore: Math.round(homeScore),
      acceptanceScore: Math.round(acceptanceScore),
      score: Math.round(score * 10) / 10,
    };
  });

  const eligible = scored
    .filter((t) => t.acceptanceLevel > 0)
    .sort((a, b) => b.score - a.score);
  const excluded = scored.filter((t) => t.acceptanceLevel === 0);

  if (eligible.length === 0) {
    return { error: "No test in this comparison is accepted for that route." };
  }

  return { purpose, ranking: eligible, excluded, best: eligible[0] };
}
