const seo = {
  title: "Post Office Time Deposit Calculator: 1-5 Years",
  metaDescription:
    "Interest compounds quarterly but pays out annually. See the yearly payout, effective yield, year-by-year schedule, 80C position and early-closure penalty.",
  steps: [
    "Enter the deposit amount in rupees and pick a tenure of 1, 2, 3 or 5 years; the interest rate field fills with that tenure's notified rate and stays editable.",
    "Choose your income-tax slab rate and tick Senior citizen (higher TDS threshold) to apply the right section 194A limit.",
    "Read the interest paid each year, the effective annual yield after quarterly compounding, the year-by-year payout table and the early-closure payout, then press Copy result.",
  ],
  intro:
    "The Post Office Time Deposit Calculator projects a National Savings Time Deposit account over its 1, 2, 3 or 5 year tenure, applying the scheme's actual mechanics: interest is compounded quarterly but paid out annually, so the calculator reports the effective annual yield, the yearly payout, the year-by-year schedule and what the same money would have become had every payout been re-deposited. It also flags the ₹1,000 minimum, the ₹100 multiple rule, the section 80C position and the TDS threshold. It is for savers choosing a tenure, and is informational rather than tax advice.",
  useCases: [
    "You are choosing between a 3-year and a 5-year account and want to see the yearly interest each pays before deciding to lock the money up longer.",
    "You need income from a lump sum and want to know what lands in your savings account each year, rather than a single maturity number five years away.",
    "Something has come up and you are weighing closing a Time Deposit early, so you want the penalty-adjusted payout next to the interest you would give up.",
  ],
  benefits: [
    [
      "Models annual payout, not fake compounding",
      "Most calculators quietly compound the interest for the full term; this one pays it out annually as the scheme actually does, and shows the reinvested figure separately for comparison.",
    ],
    [
      "Premature closure has its own rules engine",
      "It encodes the real penalty ladder — nothing before six months, savings-account rate between six and twelve months, and a 2 percentage point cut thereafter.",
    ],
    [
      "Deposit rules checked as you type",
      "Amounts below the ₹1,000 minimum or off the ₹100 multiple are flagged, so the plan you build is one a post office would actually open.",
    ],
  ],
  faqs: [
    [
      "What are the Post Office Time Deposit tenures and rates?",
      "Accounts run for 1, 2, 3 or 5 years, and the calculator uses notified rates of 6.9%, 7.0%, 7.1% and 7.5% respectively. Small-savings rates are re-notified every quarter by the Ministry of Finance, so check the rate in force for your quarter and override the field if it has changed.",
    ],
    [
      "Is Post Office Time Deposit interest compounded or paid out?",
      "Both, in a sense: interest is calculated on quarterly compounding but is payable annually and credited to your post office savings account. That is why a 5-year deposit does not grow to the same figure as a five-year quarterly-compounded FD unless you re-deposit every payout yourself.",
    ],
    [
      "Does it qualify for a section 80C deduction?",
      "Only the 5-year account. The deduction is capped at ₹1.5 lakh, and that ceiling is shared across all your 80C items, so an existing PPF or insurance premium eats into it. The 1, 2 and 3 year tenures carry no 80C benefit.",
    ],
    [
      "When is TDS deducted on the interest?",
      "TDS at 10% applies once annual interest crosses ₹50,000, or ₹1,00,000 for senior citizens, where your PAN is on record. TDS is not the final tax — the interest is still taxable at your slab rate, so confirm your own position with a tax professional.",
    ],
  ],
};

export default seo;
