// SBA Loan — content file for the Loans module.
//
// Follows the canonical shape defined in personal-loan.js. Plain serialisable
// data only (no imports, no functions). Icon names must exist in _lib/icons.js.

export const sbaLoan = {
  slug: "sba-loan",
  name: "SBA Loan",
  accent: "sky",
  icon: "Landmark",

  eyebrow: "SBA loans",
  headline: "Fund your next big move with an SBA-backed loan",
  headlineAccent: "SBA-backed loan",
  subheadline:
    "Issued by SBA-approved lenders and partially guaranteed by the U.S. Small Business Administration, an SBA loan can put lower down payments, longer terms and competitive rates within reach — so you can fund bigger goals for your business.",
  heroPoints: [
    "Partially guaranteed by the U.S. Small Business Administration",
    "Lower down payments and longer repayment terms",
    "Fund real estate, equipment, working capital or expansion",
  ],
  heroStats: [
    { icon: "Landmark", label: "Partially guaranteed by the SBA" },
    { icon: "CalendarClock", label: "Terms up to 25 years" },
    { icon: "Percent", label: "Competitive, capped rates" },
  ],

  quoteLabel: "Check my eligibility",
  quoteUrl: "#demo-only",

  featuresTitle: "One guarantee, many ways to grow",
  featuresIntro:
    "SBA loans are issued by approved lenders and partially backed by the government, so they can fund bigger goals on friendlier terms. Here's where they fit.",
  features: [
    {
      icon: "Banknote",
      title: "Working capital",
      description:
        "Cover payroll, inventory and seasonal cash-flow gaps with a flexible 7(a) loan built to keep operations running.",
    },
    {
      icon: "Building2",
      title: "Commercial real estate",
      description:
        "Buy, build or renovate owner-occupied commercial property with an SBA 504 loan made for major fixed assets.",
    },
    {
      icon: "TrendingUp",
      title: "Expansion & growth",
      description:
        "Open a new location, add capacity or grow your team with financing sized for long-term plans.",
    },
    {
      icon: "Scale",
      title: "Business acquisition",
      description:
        "Purchase an existing business or fund a partner buyout with repayment terms structured for the long haul.",
    },
    {
      icon: "Percent",
      title: "Refinance costly debt",
      description:
        "Roll eligible high-interest business debt into a single lower-cost payment that frees up monthly cash flow.",
    },
    {
      icon: "Landmark",
      title: "Two flagship programs",
      description:
        "Choose 7(a) for flexible general financing or 504 for real estate and major equipment — matched to your goal.",
    },
  ],

  benefitsTitle: "Why owners choose SBA financing",
  benefits: [
    {
      icon: "CalendarClock",
      title: "Longer terms, lower payments",
      description:
        "Repayment spread over many years keeps monthly payments manageable, so funding a big goal won't strain daily cash flow.",
    },
    {
      icon: "Percent",
      title: "Competitive, capped rates",
      description:
        "Because the SBA guarantee lowers lender risk, rates stay competitive and are capped within published SBA program limits.",
    },
    {
      icon: "Banknote",
      title: "Lower down payments",
      description:
        "SBA programs often require a smaller upfront contribution than conventional loans, leaving more capital working inside your business.",
    },
    {
      icon: "ShieldCheck",
      title: "Backed by a federal guarantee",
      description:
        "A partial government guarantee makes approved lenders more willing to extend larger amounts to qualified small businesses.",
    },
  ],

  processTitle: "How your SBA loan comes together",
  process: [
    {
      title: "Check eligibility & goals",
      description:
        "Tell us about your business, time in operation and what you need funding for, and we'll confirm the program that fits.",
    },
    {
      title: "Match with an approved lender",
      description:
        "We connect you with an SBA-approved lender suited to your industry, loan size and goals — no cold-calling required.",
    },
    {
      title: "Prepare your documentation",
      description:
        "Gather business financials, tax returns and a simple plan. Your lender guides you through exactly what the SBA needs.",
    },
    {
      title: "Underwriting, approval & funding",
      description:
        "The lender underwrites your file and, once approved, finalizes the SBA guarantee and disburses funds for your project.",
    },
  ],

  rateTitle: "What shapes your SBA loan terms",
  rateIntro:
    "SBA-approved lenders price every loan on the strength of you and your business. These are the factors they weigh most heavily.",
  rateFactors: [
    {
      factor: "Personal & business credit",
      detail:
        "Lenders review both your personal credit history and any business credit profile to gauge how reliably debts are repaid.",
    },
    {
      factor: "Business financials & cash flow",
      detail:
        "Consistent revenue and healthy cash flow show you can comfortably cover the new payment alongside existing costs.",
    },
    {
      factor: "Time in business",
      detail:
        "A longer operating track record generally strengthens your application; newer businesses may need extra documentation.",
    },
    {
      factor: "Collateral & down payment",
      detail:
        "Available collateral and the size of your down payment affect both your approval odds and the terms you're offered.",
    },
    {
      factor: "Loan program & amount",
      detail:
        "Whether you choose 7(a) or 504, and how much you borrow, influences the rate, term length and overall structure.",
    },
  ],

  faqs: [
    {
      q: "What is an SBA loan?",
      a: "An SBA loan is business financing issued by a bank or approved lender and partially guaranteed by the U.S. Small Business Administration. That government guarantee reduces the lender's risk, which can translate into lower down payments, longer terms and competitive rates.",
    },
    {
      q: "Does the SBA lend the money directly?",
      a: "No. For its main programs the SBA guarantees a portion of loans made by approved lenders rather than funding them itself. AltFTool is not the SBA — we help connect you with SBA-approved lenders.",
    },
    {
      q: "What's the difference between 7(a) and 504 loans?",
      a: "The 7(a) program is the most common and most flexible, covering working capital, expansion, refinancing and acquisitions. The 504 program is designed for major fixed assets such as commercial real estate and heavy equipment.",
    },
    {
      q: "How long does SBA approval take?",
      a: "SBA loans involve more paperwork than fast online loans, so funding commonly takes several weeks. Gathering your financials and business documents early helps keep the process moving.",
    },
    {
      q: "What can I use an SBA loan for?",
      a: "Depending on the program, uses include working capital, buying or renovating commercial property, equipment, business acquisition and refinancing eligible business debt. Some uses, such as speculative investing, are not permitted.",
    },
    {
      q: "Do I need a down payment or collateral?",
      a: "Many SBA loans ask for a down payment and available collateral, though requirements vary by program, loan size and lender. Strong credit and solid business financials generally improve your terms.",
    },
  ],

  ctaTitle: "See if an SBA loan fits your business",
  ctaText:
    "Answer a few quick questions about your business and goals, and we'll help match you with an SBA-approved lender — with no obligation to proceed.",
  fineprint:
    "AltFTool is not a lender and is not affiliated with or endorsed by the U.S. Small Business Administration or any government agency. Eligibility, rates and terms are set by SBA-approved lenders, vary by program, and are not guaranteed. Approval is subject to the lender's underwriting.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1761783536272-2fb78dd52c76", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1761370571806-886404629697",
      alt: "A small-business owner standing inside their shop",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1758599543278-32d9d073941e",
      alt: "Two people shaking hands outside a modern commercial building",
    },
  },

  seo: {
    title: "SBA Loans — Government-Backed Business Financing | AltFTool",
    description:
      "Compare SBA 7(a) and 504 loans: government-backed business financing with lower down payments, longer terms and competitive rates. See if you qualify today.",
  },
};

export default sbaLoan;
