const seo = {
  title: "FD Premature Withdrawal Penalty Calculator",
  metaDescription:
    "See your FD's net payout on early closure: the rate reset to the card rate, the 0.5-1% penalty cut, quarterly compounding, and break-or-wait compared.",
  steps: [
    "Enter the Deposit amount (INR), booked rate, Original tenure (months) and the card rate for the completed period.",
    "Set Completed months held and Extra days held (0-30), pick a penalty with the 0% / 0.5% / 1% penalty buttons, and choose Cumulative (quarterly compounding) or simple interest.",
    "Read Net payout on premature closure with the rate-reset and penalty losses split out, compare \"Break now or wait for maturity?\", and press Copy result.",
  ],
  intro:
    "Breaking a fixed deposit before maturity costs you twice: the bank re-prices the deposit at the card rate for the period it actually ran, and then deducts a premature-withdrawal penalty (usually 0.5%–1% per annum) from that rate. This calculator applies both steps the way banks do — quarterly compounding for cumulative deposits, simple interest on the broken period — and shows the exact net payout you will receive. It is built for savers deciding whether to break an FD now or wait for maturity.",
  useCases: [
    "You booked a 3-year FD at 7.25% and need the money after 18 months — see the payout after the rate is reset to the 18-month card rate minus a 1% penalty.",
    "Comparing breaking an existing FD against taking a loan (overdraft) against it, by putting a rupee value on the interest you would forfeit.",
    "Checking a bank's closure figure before you sign the premature-closure form, so you can query the applied rate if it looks wrong.",
  ],
  benefits: [
    ["Both penalties, not one", "Separates the rate-reset loss from the penalty-rate loss so you see where the money actually goes."],
    ["Bank-style compounding", "Compounds quarterly for completed quarters and applies simple interest to the leftover broken period."],
    ["Break-or-wait clarity", "Shows the interest you would have earned by holding to maturity next to the amount you get today."],
  ],
  faqs: [
    [
      "How much penalty do banks charge on premature FD withdrawal?",
      "Most Indian banks levy 0.5% to 1% per annum, deducted from the applicable rate rather than from your principal. The penalty is often waived on small-value deposits or when the money is reinvested into a longer FD with the same bank — check your bank's schedule of charges.",
    ],
    [
      "Which interest rate applies if I close my FD early?",
      "Not your booked rate. Banks pay the card rate that was applicable, on the date of booking, for the period the deposit actually stayed with the bank — and then subtract the penalty. If that rate is higher than your booked rate, banks generally cap the payout at the booked rate.",
    ],
    [
      "Can I lose money on a premature FD closure?",
      "Your principal is safe; you only lose interest. However, if you close within the minimum lock-in (typically 7 days), many banks pay no interest at all, so the payout equals the deposit amount.",
    ],
    [
      "Does TDS already deducted get refunded if I break the FD?",
      "No. TDS deducted and deposited in earlier quarters is not reversed by the bank; the recalculated lower interest is adjusted in the final payout, and any excess tax is claimed back when you file your income tax return. This tool is informational and not tax advice.",
    ],
  ],
};

export default seo;
