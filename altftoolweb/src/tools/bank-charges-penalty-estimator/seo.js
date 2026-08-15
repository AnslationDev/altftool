const seo = {
  title: "Bank Charges Calculator: Balance Penalty and ATM Fees",
  metaDescription:
    "A year of Indian savings-account cost: the RBI percentage-of-shortfall penalty, ATM uses past the free limit, return charges and 18% GST.",
  steps: [
    "Enter Required monthly average balance, Average balance you actually keep, Months below the requirement (0-12) and the Bank's penalty, as % of the shortfall.",
    "Add Own-bank ATM uses per month, Other-bank ATM uses per month, Charge per excess ATM use, cheque return charges and the debit card and SMS fees.",
    "Read Cost of this account for a year with its GST line and Of which you could avoid entirely, then press Copy result.",
  ],
  intro:
    "This estimator totals a year of Indian savings account charges: the non-maintenance penalty on your minimum balance shortfall, ATM uses beyond the RBI free allowance, cheque and NACH return charges, debit card and SMS fees, and 18% GST on the lot. It follows the RBI rule that a minimum balance penalty must be a fixed percentage of the shortfall rather than a flat fee, and the free-transaction allowance of five own-bank and three metro or five non-metro other-bank ATM uses a month. The result separates the charges you can eliminate by changing habits from the ones that are baked into the account.",
  useCases: [
    "Someone whose balance dipped below ₹10,000 for six months working out whether the accumulated penalty is worth more than the interest they earn on the account.",
    "A frequent cash user counting ATM visits to see how much the sixth own-bank withdrawal each month costs once ₹23 plus GST is applied twelve times over.",
    "Comparing a regular savings account against a zero-balance Basic Savings Bank Deposit Account, where no minimum balance penalty can be levied at all.",
  ],
  benefits: [
    ["Uses the RBI shortfall rule", "Charges a percentage of the gap, with your bank's floor and cap, instead of guessing a flat fee."],
    ["Separates avoidable cost", "Shows how much of the year's total disappears if you keep the balance and stay inside the free ATM limits."],
    ["GST included", "Adds the 18% GST that applies to banking services so the figure matches your statement."],
  ],
  faqs: [
    [
      "How do banks calculate the minimum balance penalty?",
      "Since the RBI circular of 20 November 2014, the penalty must be a fixed percentage of the shortfall between the required balance and the balance you held, not a flat charge. The bank must also notify you and give one month to restore the balance before levying anything, and the charge cannot push the account into a negative balance.",
    ],
    [
      "How many free ATM transactions do I get each month?",
      "Five at your own bank's ATMs, and three at other banks' ATMs if you are in Bengaluru, Chennai, Hyderabad, Kolkata, Mumbai or New Delhi, or five elsewhere. Balance enquiries and mini statements count towards the free limit, not just cash withdrawals.",
    ],
    [
      "What is the maximum a bank can charge for an ATM transaction beyond the free limit?",
      "₹23 per transaction plus applicable taxes, with effect from 1 May 2025 under the RBI circular of 28 March 2025. The earlier ceiling was ₹21 from 1 January 2022. A bank may charge less, but not more, and the same ceiling covers Cash Recycler Machine transactions.",
    ],
    [
      "How do I stop paying a minimum balance penalty altogether?",
      "Convert to a Basic Savings Bank Deposit Account, which by RBI rule has no minimum balance requirement and therefore no non-maintenance penalty. The trade-off is a capped number of free withdrawals a month and no cheque book by default, so check what you actually use before switching.",
    ],
  ],
};

export default seo;
