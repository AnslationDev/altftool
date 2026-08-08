const seo = {
  title: "Compare Loan Offers on True APR, Not the Quoted Rate",
  metaDescription:
    "Effective APR as the IRR of real cash flows after fees, 18% GST, bundled insurance and foreclosure penalty — the RBI Key Facts Statement method.",
  steps: [
    "Set the repayment horizon — the month you expect to clear the loan, or a Year 1 / Year 3 / Full term shortcut — and decide whether bundled insurance counts as a cost of credit.",
    "Fill each offer card: loan amount you need in hand, tenure in months, quoted rate and whether it is Reducing balance or Flat, processing fee as a percentage or a flat amount, documentation and legal charges, GST on fees, insurance premium and foreclosure penalty; Add offer takes you up to six.",
    "Read the lowest effective APR at your horizon, the offer-by-offer table of EMI, upfront charges, net disbursed and APR at full term versus horizon, and the panel that names the pairs whose ranking inverts at that month; Copy result takes the comparison.",
  ],
  intro:
    "The effective APR of a loan is the internal rate of return of its actual cash flows — the money that reaches your bank account on day one, and every rupee you pay back afterwards — and it is almost never the rate on the sanction letter. This comparator builds that cash-flow series for two to six offers: it deducts the processing fee, 18% GST on fees, documentation and legal charges and any bundled insurance premium from the sanctioned amount to get the net disbursed figure, then solves for the monthly IRR by bisection and annualises it. That is exactly the method the Reserve Bank of India prescribes in its Key Facts Statement circular (RBI/2024-25/18, DOR.STR.REC.13/13.03.00/2024-25, 15 April 2024), whose Annex B footnote 10 requires the APR to be \"computed on net disbursed amount using IRR approach and reducing balance method\". It restates any flat-rate quote as its reducing-balance equivalent, and it re-runs the whole comparison at a repayment horizon you choose, so an offer that is cheapest over the full tenure but carries a foreclosure penalty can be shown losing to a dearer one when you close in year three.",
  useCases: [
    "Checking whether a 10.25% personal loan with 0.5% processing fee and a 12,000 bundled insurance premium is really cheaper than an 11.75% offer with almost no fees",
    "Converting a two-wheeler or consumer-durable quote of \"6.75% flat\" into the reducing-balance rate that is comparable with a bank's quoted rate",
    "Working out which of two home-improvement or personal loan offers costs less if the loan is cleared in year 3 of a 5-year tenure rather than run to term",
    "Reading a lender's Key Facts Statement and reproducing the APR line to confirm the fees disclosed there account for the whole gap from the quoted rate",
  ],
  benefits: [
    [
      "IRR on real cash flows, not a rate restatement",
      "Bisection on a bracketed interval to a monthly-rate tolerance of 1e-12; it reproduces the RBI's own Annex B illustration of 17.10% to the decimal.",
    ],
    [
      "The flat-versus-reducing gap made explicit",
      "A 6.75% flat quote over 60 months is 12.09% reducing — a multiple of 1.79, which is where most mis-selling lives.",
    ],
    [
      "Foreclosure priced in, not ignored",
      "Penalty on the outstanding principal plus 18% GST on that penalty enters the cash-flow series at the exit month, and the ranking is recomputed.",
    ],
    [
      "Bundled insurance treated as cost of credit",
      "RBI's KFS circular para 7 puts third-party charges routed through the lender, insurance included, inside the APR; a toggle shows what changes if it is excluded.",
    ],
  ],
  faqs: [
    [
      "Why is my APR higher than the interest rate the bank quoted me?",
      "Because the quoted rate ignores everything you paid to get the money. The RBI's own worked example makes the gap concrete: a 20,000 loan at a quoted 15% over 24 monthly instalments of 970, with 400 of fees, disburses only 19,600 net — and its APR is 17.10%, over two percentage points above the quoted rate. Add 18% GST on the processing fee and a financed insurance premium and the gap widens further, because every one of those rupees is money you never received but are paying interest on.",
    ],
    [
      "What is a 10% flat rate in reducing-balance terms?",
      "About 17.9% on a three-year loan. On 1,00,000 at 10% flat for 36 months the total interest is 30,000, the EMI is 3,611, and the IRR of that repayment stream is 17.92% a year — a multiple of 1.79. The multiple depends on the tenure and lands roughly between 1.8 and 1.9 for typical retail tenures: a 6.75% flat quote over 60 months works out to 12.09% reducing. The old shortcut of flat multiplied by 2n/(n+1) gives 1.95 for a 36-month loan, which overstates the true IRR because it ignores payment timing.",
    ],
    [
      "Can a cheaper loan become the more expensive one if I repay early?",
      "Yes, and that is the single most common way a comparison goes wrong. Take a 5,00,000 loan over 60 months: Offer A at 10.25% with a 12,000 financed insurance premium and a 5% foreclosure penalty has an APR of 11.81%, against 12.11% for Offer B at 11.75% with almost no fees — A is cheaper over the full term. Close both in month 36 and A costs 13.07% against B's 12.18%, because the penalty on the outstanding balance plus 18% GST on it lands in a single month and the upfront fees are spread over 36 months instead of 60. The ranking inverts.",
    ],
    [
      "Are foreclosure charges still allowed in India?",
      "Not on floating rate loans to individuals for non-business purposes. Under the RBI (Pre-payment Charges on Loans) Directions, 2025, issued 2 July 2025 and applicable to all loans sanctioned or renewed on or after 1 January 2026, a regulated entity may not levy pre-payment or foreclosure charges on such loans — whatever the amount, whether there is a co-obligant, whether the repayment is full or partial, and whatever the source of the funds — and may not impose a lock-in period on them. Fixed rate loans sit outside that bar and may carry pre-payment charges under the lender's board-approved policy, and where a charge is payable it is a taxable supply under SAC heading 9971 carrying 18% GST, unlike loan interest, which is exempt.",
    ],
  ],
};

export default seo;
