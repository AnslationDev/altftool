const seo = {
  title: "Staking Reward Calculator — APR to APY After",
  metaDescription:
    "Turns an advertised APR into effective APY and end balance, deducting validator commission before compounding at your payout frequency.",
  steps: [
    "Enter Tokens staked, the Advertised APR (%) and the Validator commission (% of rewards).",
    "Pick a Reward payout frequency and Staking period in years; untick 'Automatically restake rewards (compound)' to model withdrawn payouts.",
    "Read the final balance, Effective APY, rewards earned and the Balance year by year table, then click Copy result.",
  ],
  intro:
    "This staking reward calculator turns an advertised APR into the tokens you would actually hold at the end of a staking period, after the validator's commission and with rewards compounded at your payout frequency. It uses the standard compound-interest identity A = P(1 + r/n)^(nt), and reports the effective APY as (1 + r/n)^n − 1 — the same conversion banks use for APY disclosure. It is for anyone comparing validators, exchanges or chains where one quotes APR and another quotes APY.",
  useCases: [
    "Comparing a validator charging 5% commission with one charging 10% on the same 10% network APR",
    "Working out what an exchange's '10% APR, paid daily' actually becomes as an APY before committing tokens",
    "Estimating two years of rewards on a fixed stake to decide whether the unbonding period is worth it",
  ],
  benefits: [
    ["APR and APY separated", "Shows the nominal rate and the compounded yield side by side, so quotes from different platforms compare like for like."],
    ["Commission taken off first", "The validator's cut is deducted from the reward rate before compounding, which is how delegation actually works."],
    ["Compound or payout modes", "Turn restaking off to model rewards that are withdrawn, which grows the balance linearly instead of exponentially."],
  ],
  faqs: [
    [
      "What is the difference between staking APR and APY?",
      "APR is the simple annual rate before compounding; APY is what you earn once rewards are restaked. At 10% APR compounded daily the APY is 10.52%, because (1 + 0.10/365)^365 − 1 = 0.1052 — so 1,000 tokens become 1,105.16 rather than 1,100 after a year.",
    ],
    [
      "How does validator commission affect staking rewards?",
      "Commission is taken as a percentage of the rewards, not of your stake, so a 10% network APR with a 5% commission leaves you an effective 9.5% APR. On 1,000 tokens compounded daily for a year that is about 99.6 tokens instead of 105.2.",
    ],
    [
      "Does compounding frequency change how much I earn from staking?",
      "Yes, but less than most people expect. At 10% APR, annual compounding yields 10.00%, monthly 10.47% and daily 10.52% — the gap between monthly and daily is only about half a token per 1,000 staked per year.",
    ],
    [
      "Can I lose money staking even with a positive APY?",
      "Yes. Rewards are paid in the token, so a fall in the token's price can outweigh them, and validators can be slashed for downtime or double-signing, which burns part of the delegated stake. Unbonding periods also mean you may not be able to exit for days or weeks.",
    ],
  ],
};

export default seo;
