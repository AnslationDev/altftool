const seo = {
  title: "Cash Denomination Calculator: Fewest ₹ Notes and Coins",
  metaDescription:
    "Round an amount to a ₹1, ₹5, ₹10, ₹50 or ₹100 step, then split it into the fewest notes and coins — correct even with denominations switched off.",
  steps: [
    "Enter Amount per packet (₹) and how many Identical packets you are preparing.",
    "Pick Round to the nearest (₹1 to ₹100) and a Rounding direction of Nearest, Round up or Round down, then untick anything missing under Denominations available.",
    "Read the cash to hand over, the Rounding difference and the per-denomination table, then press Copy result.",
  ],
  intro:
    "This calculator does the two jobs a cashier does before opening the cash box: it rounds an amount to a figure that can physically be paid — a whole rupee, or a ₹5, ₹10, ₹50 or ₹100 step — and then splits that figure into the smallest possible number of notes and coins. The split uses a minimum-piece dynamic program rather than simple largest-first counting, so it still returns a correct answer when a denomination has run out; ₹600 with only ₹500 and ₹200 notes available comes back as three ₹200 notes instead of failing. Denominations follow the Reserve Bank of India series in circulation.",
  useCases: [
    "Preparing 40 identical wage envelopes of ₹8,750 and knowing exactly how many ₹500 notes to withdraw.",
    "Rounding a ₹2,547.30 reimbursement up to ₹2,550 so it can be paid in notes, with the ₹2.70 posted to rounding off.",
    "Working out a payout when the branch has no ₹100 notes left and everything has to come from ₹500 and ₹200.",
  ],
  benefits: [
    [
      "Fewest pieces, not just largest first",
      "A minimum-piece search finds the true smallest count, including when you switch denominations off.",
    ],
    [
      "Rounding difference shown",
      "The gap between the amount due and the amount paid is stated separately so it can be booked to a rounding account.",
    ],
    [
      "Scales to many packets",
      "Enter the number of identical envelopes and get both the per-packet count and the total notes to draw from the bank.",
    ],
  ],
  faqs: [
    [
      "What notes and coins are currently in circulation in India?",
      "Banknotes of ₹10, ₹20, ₹50, ₹100, ₹200 and ₹500, and circulating coins of ₹1, ₹2, ₹5, ₹10 and ₹20. The ₹2000 note was withdrawn from circulation on 19 May 2023: it remains legal tender but is no longer issued, so most cash boxes no longer hold it.",
    ],
    [
      "Why is cash rounded to the nearest rupee?",
      "Coins of 25 paise and below ceased to be legal tender on 30 June 2011, and the 50 paise coin is rarely available at a counter, so a paise balance cannot be handed over. Settling to the whole rupee and booking the small difference to a rounding-off account is the standard practice.",
    ],
    [
      "How do I work out the fewest notes for an amount?",
      "Take the largest denomination that fits, repeat on what is left, and keep going down. That largest-first method gives the fewest pieces for the standard Indian set because it is a canonical system, but it can fail on a restricted set — ₹600 from only ₹500 and ₹200 notes needs three ₹200 notes, which largest-first never finds.",
    ],
    [
      "Is the ₹2000 note still valid?",
      "Yes. The Reserve Bank withdrew it from circulation on 19 May 2023 under its clean note policy, and it continues to be legal tender; deposits and exchange at RBI issue offices remained available after the initial bank window closed. It is simply no longer printed or dispensed, so payouts are planned without it.",
    ],
  ],
};

export default seo;
