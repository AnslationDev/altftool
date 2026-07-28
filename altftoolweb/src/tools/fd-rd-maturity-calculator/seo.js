const seo = {
  title: "FD & RD Maturity Calculator with Tax — Free Online",
  h1: "FD & RD Maturity Calculator",
  metaDescription:
    "Free FD and RD maturity calculator: set amount, rate, tenure and compounding (monthly to yearly) to see maturity, interest, tax and a month-wise CSV.",
  intro:
    "The FD / RD Maturity Calculator applies the standard compound-interest formula A = P × (1 + r/n)^(n×t) in your browser, with n set by the compounding you choose — 12, 4, 2 or 1 times a year. Recurring deposits skip the closed-form shortcut: every monthly installment is compounded separately for the number of months it stays on deposit and the results are summed, so the first deposit compounds for the full tenure and the last for one month. Interest, a flat tax on that interest, net maturity and a month-by-month growth table are recalculated on every keystroke, with amounts formatted as Indian rupees through Intl.NumberFormat's en-IN locale. Nothing is sent to a server — the maths, the charts and the CSV export all run on your own device.",
  useCases: [
    "Comparing a 3-year FD of ₹5,00,000 at 7.25% compounded quarterly, which matures at ₹6,20,273, against putting ₹10,000 a month into an RD at the same rate",
    "Seeing how much of a term deposit's interest a 10% versus a 30% tax rate takes off the payout before the money is locked in",
    "Exporting the month-by-month value schedule to a spreadsheet so a deposit can sit alongside the rest of a savings plan",
  ],
  benefits: [
    [
      "FD and RD in one switch",
      "Fixed deposit runs one compounded principal; recurring deposit rebuilds the maths as 36 or more separate installments, each compounded for the months it stays on deposit.",
    ],
    [
      "Compounding you control",
      "Monthly, quarterly, half-yearly and yearly are all selectable. ₹1,00,000 at 7% for 5 years matures at ₹1,40,255 yearly, ₹1,41,478 quarterly and ₹1,41,763 monthly.",
    ],
    [
      "Gross and net side by side",
      "Enter a tax rate and the page shows tax on interest and net maturity next to the gross figure, plus the invested / interest / tax split as proportion bars.",
    ],
    [
      "A schedule you can keep",
      "Export CSV writes one row per month — month, FD or RD, invested, maturity value, interest — built locally with a Blob, no upload and no account.",
    ],
  ],
  faqs: [
    [
      "How is FD maturity amount calculated?",
      "With the compound-interest formula A = P × (1 + r/n)^(n×t), where n is how many times interest compounds each year. ₹5,00,000 at 7.25% compounded quarterly for 3 years gives ₹6,20,273, of which ₹1,20,273 is interest. This calculator applies that formula directly and does not model bank-specific rounding or payout rules.",
    ],
    [
      "How is RD maturity calculated?",
      "Installment by installment: each monthly deposit earns compound interest for the months it remains on deposit, and the calculator adds them all up. ₹10,000 a month for 36 months at 7.25% compounded quarterly comes to ₹4,02,948 on ₹3,60,000 deposited — ₹42,948 of interest. The first installment compounds for 36 months, the last for one.",
    ],
    [
      "Does quarterly compounding pay more than yearly?",
      "Yes, though the gap is small. ₹1,00,000 at 7% for 5 years matures at ₹1,40,255 with yearly compounding, ₹1,41,478 quarterly and ₹1,41,763 monthly — about ₹1,500 between the extremes. Quarterly is the default here because it is the common convention for Indian bank FDs.",
    ],
    [
      "How does the calculator handle tax on FD interest?",
      "It multiplies total interest by the rate you type in and subtracts that from the gross maturity: 10% on ₹1,20,273 of interest shows ₹12,027 tax and ₹6,08,246 net. It is a flat estimate only — no TDS threshold, Form 15G/15H, slab band or year-by-year accrual is modelled. Check your actual position with your bank or a tax professional.",
    ],
    [
      "Is this FD and RD calculator free, and is my data uploaded?",
      "It is free, needs no sign-up, and nothing leaves your device. Every figure is computed in JavaScript inside the page, the CSV is generated locally with a Blob and downloaded by the browser, and Copy Summary writes only to your clipboard.",
    ],
    [
      "Can I download the month-by-month deposit schedule?",
      "Yes. Export CSV downloads fd-rd-maturity-schedule.csv with one row per month, from month 0 to the final month, holding the month number, FD or RD, invested amount, maturity value and interest, rounded to whole rupees. Copy Summary puts the headline figures on the clipboard as plain text.",
    ],
    [
      "What are the maximum tenure, amount and rate?",
      "Tenure runs from 1 month up to 50 years plus 11 months, deposits go up to ₹10,00,00,000, and both the interest rate and the tax rate cap at 40%, with the rate adjustable in 0.05% steps. Amounts display in Indian rupees with en-IN grouping; there is no currency switch.",
    ],
    [
      "What does 'effective growth' mean on this page?",
      "Total interest divided by total invested, as a percentage — cumulative, not annualised. The sample 3-year FD shows 24.1% effective growth on ₹5,00,000, meaning the gain across all 36 months. 'Monthly growth' is that same interest divided by the number of months, a flat average rather than the real month-by-month accrual.",
    ],
  ],
  steps: [
    "Choose Fixed Deposit or Recurring Deposit, then enter the principal (or the monthly deposit) and the annual interest rate.",
    "Set the tenure in years and months, pick the compounding frequency — monthly, quarterly, half-yearly or yearly — and enter the tax rate to apply to interest.",
    "Read the maturity, interest, tax and net figures and the growth charts, then use Copy Summary for a text block or Export CSV for the full month-by-month schedule.",
  ],
};

export default seo;
