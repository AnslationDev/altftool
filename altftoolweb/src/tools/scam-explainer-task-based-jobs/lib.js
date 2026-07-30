/**
 * Work-from-home task scam explainer.
 *
 * The script: an unsolicited message offers paid "tasks" — liking videos,
 * rating hotels, writing reviews. The first few tasks really do pay, and the
 * money really does withdraw. Then the tasks become "prepaid": you must put in
 * your own money to unlock a higher commission, and each round is larger than
 * the last. The wallet balance on screen keeps climbing; the money in your
 * bank account only goes one way.
 *
 * The module models exactly that:
 *  - the seed payouts, which are real and are the entire cost of the con,
 *  - the deposit ladder as a geometric series with a chosen multiplier,
 *  - the on-screen wallet, which adds promised commission to your own money,
 *  - the true cash position, which is what actually left your bank.
 *
 * Pure functions: no DOM, no network, no clock.
 */

/* ------------------------------------------------------------------ */
/* The rule                                                            */
/* ------------------------------------------------------------------ */

export const CORE_RULE =
  "A job pays you. The moment you have to put your own money in to keep earning, it is not a job — the early payouts were the advertising budget.";

/** Guard so an absurd ladder cannot produce a meaningless number. */
export const MAX_SIMULATED_TOTAL = 1e12;

/* ------------------------------------------------------------------ */
/* The ladder                                                          */
/* ------------------------------------------------------------------ */

/**
 * Deposits follow a geometric progression: d_k = firstDeposit * m^(k-1).
 * The sum of the first n terms is firstDeposit * (m^n - 1) / (m - 1), and
 * firstDeposit * n when m is exactly 1. The on-screen wallet adds the promised
 * commission on every deposit, which is the number victims chase and which
 * never withdraws.
 */
export function simulateTaskScam({
  seedPayout,
  seedTaskCount,
  firstDeposit,
  depositMultiplier,
  depositRounds,
  commissionRate,
}) {
  const payout = Number(seedPayout);
  const tasks = Number(seedTaskCount);
  const first = Number(firstDeposit);
  const multiplier = Number(depositMultiplier);
  const rounds = Number(depositRounds);
  const commission = Number(commissionRate);

  if (!Number.isFinite(payout) || payout < 0) return { error: "Seed payout must be zero or more." };
  if (!Number.isInteger(tasks) || tasks < 0 || tasks > 500) {
    return { error: "Number of paid starter tasks should be a whole number between 0 and 500." };
  }
  if (!Number.isFinite(first) || first < 0) return { error: "The first deposit must be zero or more." };
  if (!Number.isFinite(multiplier) || multiplier < 1 || multiplier > 10) {
    return { error: "Each deposit is normally 1 to 10 times the one before it." };
  }
  if (!Number.isInteger(rounds) || rounds < 1 || rounds > 20) {
    return { error: "Deposit rounds should be a whole number between 1 and 20." };
  }
  if (!Number.isFinite(commission) || commission < 0 || commission > 5) {
    return { error: "Promised commission should be between 0 and 500 percent (0 to 5)." };
  }

  const received = payout * tasks;

  const steps = [];
  let deposited = 0;
  let promised = 0;
  for (let round = 1; round <= rounds; round += 1) {
    const amount = first * Math.pow(multiplier, round - 1);
    if (!Number.isFinite(amount) || deposited + amount > MAX_SIMULATED_TOTAL) {
      return { error: "That ladder runs past any realistic amount — lower the multiplier or the rounds." };
    }
    deposited += amount;
    const roundCommission = amount * commission;
    promised += roundCommission;
    steps.push({
      round,
      deposit: amount,
      commission: roundCommission,
      depositedSoFar: deposited,
      walletShown: deposited + promised,
      cashPosition: received - deposited,
    });
  }

  const walletShown = deposited + promised;
  const cashPosition = received - deposited;

  return {
    steps,
    received,
    deposited,
    promised,
    walletShown,
    cashPosition,
    gap: walletShown - cashPosition,
    payoutToDepositRatio: deposited > 0 ? received / deposited : null,
    rounds,
  };
}

/**
 * How much the first payouts cost the operation compared with what it takes.
 * Expressed as the share of the total deposits that the seed money represents.
 */
export function seedCostShare({ received, deposited }) {
  const seed = Number(received);
  const total = Number(deposited);
  if (!Number.isFinite(seed) || seed < 0) return { error: "Seed payouts must be zero or more." };
  if (!Number.isFinite(total) || total <= 0) return { error: "Deposits must be greater than zero." };
  return { percent: (seed / total) * 100 };
}

/* ------------------------------------------------------------------ */
/* The script                                                          */
/* ------------------------------------------------------------------ */

export const SCRIPT_STAGES = [
  {
    id: "recruit",
    said: "Part-time work from home, Rs 2,000 to Rs 5,000 a day, no experience needed. Reply for details.",
    truth:
      "An unsolicited message to a number they bought. The pay figure is set high enough to be interesting and low enough to be believable.",
    move: "No genuine employer recruits by cold message and pays by the task on day one.",
  },
  {
    id: "warm-up",
    said: "Complete three tasks — like these videos and send screenshots.",
    truth:
      "The tasks are trivial and the small commission is paid and withdrawn successfully. This is the only real money in the whole scheme.",
    move: "Notice that the work is meaningless. Nobody pays for it in a real market.",
  },
  {
    id: "group",
    said: "Join the group. See how much the others earned today.",
    truth:
      "Most of the group are part of the operation, posting fabricated payout screenshots to make the next step feel normal.",
    move: "Screenshots cost nothing to fake. Group enthusiasm is part of the product.",
  },
  {
    id: "prepaid",
    said: "This is a merchant task: deposit Rs 1,000 and get Rs 1,300 back on completion.",
    truth:
      "The first deposit where your own money enters. It may be returned once, to establish that deposits come back.",
    move: "This is the line. Once your money is in, every later rule exists to keep it there.",
  },
  {
    id: "combo",
    said: "You picked the tasks out of order, so the set is incomplete — finish the combination to withdraw.",
    truth:
      "A manufactured rule that appears only after the deposit. There is no combination that completes.",
    move: "Stop depositing. Nothing recovers earlier money by adding more.",
  },
  {
    id: "unlock",
    said: "Your account is frozen. Pay the tax, the upgrade fee or the credit-score charge to release the balance.",
    truth:
      "The final squeeze, aimed at people who have already lost enough to be desperate. No withdrawal ever happens.",
    move: "The balance on screen is a number in their database. Walk away and report.",
  },
];

/* ------------------------------------------------------------------ */
/* Red flags                                                           */
/* ------------------------------------------------------------------ */

export const RED_FLAGS = [
  { id: "pay-to-earn", weight: 5, label: "You must deposit your own money to unlock earnings" },
  { id: "unsolicited", weight: 3, label: "The offer arrived unsolicited on WhatsApp, Telegram or SMS" },
  { id: "no-contract", weight: 3, label: "No written contract, company address or verifiable employer" },
  { id: "withdrawal-blocked", weight: 5, label: "A withdrawal was refused until a further payment was made" },
  { id: "fake-earnings", weight: 3, label: "A group posts screenshots of other people's earnings" },
  { id: "meaningless-work", weight: 2, label: "The tasks produce nothing anyone would pay for" },
  { id: "mentor", weight: 2, label: "A 'mentor' or 'manager' guides you personally through each step" },
  { id: "crypto-transfer", weight: 4, label: "You were asked to pay in cryptocurrency or to a personal account" },
  { id: "receive-and-forward", weight: 5, label: "You were asked to receive money and pass it on to someone else" },
  { id: "id-documents", weight: 3, label: "You handed over identity documents or a bank account for 'registration'" },
];

export const MAX_FLAG_SCORE = RED_FLAGS.reduce((sum, flag) => sum + flag.weight, 0);

export const RISK_BANDS = [
  {
    min: 8,
    label: "This is the scam",
    tone: "danger",
    advice: "Stop paying, leave the group, and report it. Nothing you add now brings anything back.",
  },
  {
    min: 3,
    label: "Strong warning signs",
    tone: "warning",
    advice: "Do not deposit anything. Ask for a written contract and a verifiable employer, and expect neither.",
  },
  {
    min: 0,
    label: "Nothing ticked yet",
    tone: "muted",
    advice: "Tick what has actually happened. One item — paying to earn — is enough on its own.",
  },
];

export function scoreOffer(selectedIds) {
  const ids = Array.isArray(selectedIds) ? selectedIds : [];
  const matched = RED_FLAGS.filter((flag) => ids.includes(flag.id));
  const score = matched.reduce((sum, flag) => sum + flag.weight, 0);
  const band = RISK_BANDS.find((item) => score >= item.min) || RISK_BANDS[RISK_BANDS.length - 1];
  return {
    score,
    max: MAX_FLAG_SCORE,
    percent: MAX_FLAG_SCORE > 0 ? (score / MAX_FLAG_SCORE) * 100 : 0,
    band,
    matched,
    muleRisk: ids.includes("receive-and-forward") || ids.includes("id-documents"),
  };
}

/* ------------------------------------------------------------------ */
/* Consequences beyond the money                                       */
/* ------------------------------------------------------------------ */

export const MULE_WARNING =
  "Letting someone route money through your account, or lending your account and documents for 'registration', can make you the visible link in someone else's fraud — the account can be frozen and you can be questioned as a participant, whatever you believed at the time. If this has happened, report it yourself rather than waiting to be found, and take legal advice.";

export const WHY_WITHDRAWAL_FAILS = [
  "The balance you can see is a number in their own database, not money held anywhere for you.",
  "Each new rule — wrong task order, incomplete set, tax, VIP upgrade — appears only after a deposit, never before.",
  "Small early withdrawals succeed because they are the cost of making the large deposits feel safe.",
  "Once the deposits stop, the account is frozen: there was never anything to release.",
];

export const CYBERCRIME_HELPLINE = "1930";
export const CYBERCRIME_PORTAL = "cybercrime.gov.in";

export const AFTER_STEPS = [
  `Call ${CYBERCRIME_HELPLINE} and file at ${CYBERCRIME_PORTAL}, keeping the acknowledgement number.`,
  "Save the chat history, the group, the app, the payment references and every screenshot before leaving.",
  "Tell your bank in writing, using the number in its official app, especially if your account received money from strangers.",
  "Stop all further payments — there is no round that returns what has gone.",
  "If identity documents were shared, watch for accounts or loans opened in your name.",
];

export function formatBriefing({ simulation, risk }) {
  const lines = ["WORK-FROM-HOME TASK SCAM", CORE_RULE, ""];
  if (simulation && !simulation.error) {
    lines.push(
      `Starter payouts actually received: ${simulation.received}`,
      `Your own money deposited over ${simulation.rounds} rounds: ${simulation.deposited}`,
      `Balance the app shows: ${simulation.walletShown}`,
      `Real cash position: ${simulation.cashPosition}`,
      `Gap between the screen and your bank: ${simulation.gap}`,
      "",
    );
  }
  if (risk) {
    lines.push(`Red-flag score: ${risk.score} of ${risk.max} — ${risk.band.label}`, risk.band.advice, "");
    if (risk.muleRisk) lines.push(MULE_WARNING, "");
  }
  lines.push("Why the withdrawal never works:", ...WHY_WITHDRAWAL_FAILS.map((item) => `- ${item}`));
  return lines.join("\n");
}
