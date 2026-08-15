const seo = {
  title: "Staking Rewards Calculator: Daily to Annual",
  intro:
    "The Staking Rewards Calculator projects what a crypto stake grows to by applying the standard compound interest formula FV = P × (1 + r/n)^(n×t), where n is 365, 12, 4 or 1 depending on whether rewards compound daily, monthly, quarterly or annually. Enter your stake, the advertised annual rate, the term and the compounding frequency, and it returns the final value, total rewards earned, the effective growth percentage over the whole term, and an average monthly and daily reward figure. It is built for anyone comparing validator, exchange or liquid-staking offers before locking funds up.",
  useCases: [
    "You are choosing between an exchange offering 4.8% compounded daily and a validator offering 5.1% compounded annually, and want to see which actually pays more on the same 2,000 stake.",
    "A protocol quotes an APR, not an APY, and you want to know what daily auto-compounding turns that headline rate into before you commit.",
    "You are deciding whether to keep manually claiming and restaking rewards or leave them uncompounded, and want the size of the gap in currency terms first.",
  ],
  benefits: [
    ["Frequency is a first-class input", "Daily, monthly, quarterly and annual compounding are separate buttons, so you can flip between them and watch the final value move instead of assuming they are equivalent."],
    ["Shows rewards, not just a final balance", "Interest earned is broken out from principal, plus average monthly and daily reward figures, so you can sanity-check a platform's projected payout schedule."],
    ["Recalculates as you type", "Every field updates the summary immediately, which makes it fast to test a range of rates rather than committing to one number."],
  ],
  faqs: [
    [
      "Does compounding frequency really change staking returns much?",
      "Yes, but less than most people expect at typical staking rates. At a 5% annual rate over one year, annual compounding returns exactly 5.00%, quarterly returns 5.09%, monthly 5.12% and daily 5.13% — a gap of about 13 basis points between the extremes. The difference grows with both the rate and the term, so it matters far more at 15% over five years than at 5% over one.",
    ],
    [
      "What is the difference between APR and APY in staking?",
      "APR is the simple annual rate before compounding; APY is what you actually end up with once rewards are reinvested at some frequency. This calculator takes the APR-style rate as input and shows you the compounded outcome, so if a platform advertises an APY directly, choose annual compounding to avoid compounding it a second time.",
    ],
    [
      "Are the monthly and daily reward figures a real payout schedule?",
      "No — they are the total rewards divided evenly across the term, so they are averages rather than the amount you would receive in any particular month. Real compounding pays less early and more late, so early payouts will run below the average figure and later ones above it.",
    ],
    [
      "Will I actually earn the amount this calculator shows?",
      "Rarely exactly, because staking rates are variable and the value is quoted in the staked token, not in currency. Validator commission, slashing penalties, unbonding periods and token price movement all change the real outcome, so treat the result as a rate comparison rather than a forecast, and check the specific protocol's terms and any tax treatment with a qualified adviser.",
    ],
  ],
};

export default seo;
