// Mortgage Refinance — content file for the Loans module.
//
// Follows the canonical shape defined in personal-loan.js. Plain serialisable
// data only (no imports, no functions). Icon strings must exist in _lib/icons.js.

export const mortgageRefinance = {
  slug: "mortgage-refinance",
  name: "Mortgage Refinance",
  accent: "emerald",
  icon: "RefreshCw",

  eyebrow: "Mortgage refinance",
  headline: "Lower your rate, shrink your payment, own your home sooner",
  headlineAccent: "own your home sooner",
  subheadline:
    "Replace your current home loan with one built for today's goals — a better rate, a lighter monthly payment, a shorter term, or cash drawn from the equity you've already earned.",
  heroPoints: [
    "Aim for a lower rate or a smaller monthly payment",
    "Shorten your term or take cash from your equity",
    "See estimated savings before you commit to anything",
  ],
  heroStats: [
    { icon: "TrendingDown", label: "Target a lower interest rate" },
    { icon: "Calculator", label: "Estimate your break-even point" },
    { icon: "Scale", label: "Compare offers side by side" },
  ],

  quoteLabel: "Check refi savings",
  quoteUrl: "#demo-only",

  featuresTitle: "One refinance, many goals",
  featuresIntro:
    "Refinancing swaps your existing mortgage for a new one. Homeowners do it for very different reasons — here are the ones that matter most.",
  features: [
    {
      icon: "TrendingDown",
      title: "Lower your interest rate",
      description:
        "Swap a higher rate for a lower one when the market or your credit has improved since you first borrowed.",
    },
    {
      icon: "DollarSign",
      title: "Reduce your monthly payment",
      description:
        "A lower rate or a longer term can free up room in your budget every single month.",
    },
    {
      icon: "CalendarClock",
      title: "Shorten your term",
      description:
        "Move from a 30-year loan to a 15-year one to clear the balance faster and pay less interest overall.",
    },
    {
      icon: "Repeat",
      title: "Switch to a fixed rate",
      description:
        "Trade an adjustable-rate mortgage for a fixed one and lock a predictable payment for the life of the loan.",
    },
    {
      icon: "PiggyBank",
      title: "Cash out your equity",
      description:
        "Convert part of the equity you've built into cash for renovations, debt consolidation, or other big goals.",
    },
    {
      icon: "Percent",
      title: "Drop mortgage insurance",
      description:
        "With enough equity, refinancing can remove PMI from a conventional loan and trim your payment further.",
    },
  ],

  benefitsTitle: "Why homeowners refinance",
  benefits: [
    {
      icon: "TrendingDown",
      title: "Real monthly savings",
      description:
        "Even a modest rate cut can lower your payment and free up cash you can use elsewhere each month.",
    },
    {
      icon: "PiggyBank",
      title: "Less interest over time",
      description:
        "A lower rate or shorter term can save a meaningful amount across the full life of the loan.",
    },
    {
      icon: "CalendarClock",
      title: "A sooner payoff date",
      description:
        "Refinancing to a shorter term brings your mortgage-free finish line years closer.",
    },
    {
      icon: "Home",
      title: "Equity you can use",
      description:
        "A cash-out refinance turns home equity into funds for renovations, consolidation, or major expenses.",
    },
  ],

  processTitle: "How refinancing works, step by step",
  process: [
    {
      title: "Set your goal",
      description:
        "Decide what matters most — a lower payment, a shorter term, a fixed rate, or cash from your equity. Your goal shapes the loan.",
    },
    {
      title: "Check your rate and savings",
      description:
        "See estimated offers and use a break-even calculation to weigh the monthly savings against the closing costs.",
    },
    {
      title: "Apply and share documents",
      description:
        "Submit income, asset, and property details. Your lender typically orders an appraisal to confirm your home's value.",
    },
    {
      title: "Underwriting and closing",
      description:
        "The lender verifies everything, then you sign at closing. Your new loan pays off the old one and the terms take over.",
    },
  ],

  rateTitle: "What shapes your refinance rate",
  rateIntro:
    "Refinance pricing is personal. Lenders weigh several things when they set the rate and terms they offer you.",
  rateFactors: [
    {
      factor: "Credit score",
      detail:
        "Higher scores generally earn lower rates. Strong credit is one of the clearest ways to improve the offer you receive.",
    },
    {
      factor: "Home equity & loan-to-value",
      detail:
        "The more equity you hold, the lower your loan-to-value ratio — and the better the pricing lenders tend to offer.",
    },
    {
      factor: "Loan type & term",
      detail:
        "Fixed versus adjustable, and 15- versus 30-year, each price differently. Shorter terms often carry lower rates.",
    },
    {
      factor: "Debt-to-income ratio",
      detail:
        "Lenders check that your income comfortably covers the new payment alongside your other monthly obligations.",
    },
    {
      factor: "Current rates vs. your existing rate",
      detail:
        "The gap between today's market rates and the rate on your current mortgage drives how much you might save.",
    },
  ],

  faqs: [
    {
      q: "How do I know if refinancing is worth it?",
      a: "Compare your monthly savings against the closing costs to find your break-even point — the month when the savings finally outweigh the upfront cost. If you plan to stay in the home past that point, refinancing often makes sense.",
    },
    {
      q: "Does refinancing cost money?",
      a: "Yes. Refinancing carries closing costs — often a few percent of the loan amount — covering the appraisal, title, and lender fees. Some loans let you roll these into the balance instead of paying up front.",
    },
    {
      q: "What is a cash-out refinance?",
      a: "It replaces your mortgage with a larger loan and gives you the difference in cash, drawn from your home equity. Homeowners commonly use it for renovations, debt consolidation, or other major expenses.",
    },
    {
      q: "Will refinancing reset my loan term?",
      a: "It can. A new 30-year loan restarts a 30-year clock, which may raise total interest even at a lower rate. Choosing a shorter term, or one that matches your remaining years, helps avoid that.",
    },
    {
      q: "Does refinancing hurt my credit?",
      a: "Checking estimated rates usually uses a soft inquiry with no impact. Formally applying triggers a hard inquiry, which may lower your score slightly for a short time.",
    },
    {
      q: "How much equity do I need to refinance?",
      a: "Requirements vary by loan program and lender, but many look for at least a modest cushion of equity. Cash-out refinances and dropping mortgage insurance generally call for more.",
    },
  ],

  ctaTitle: "See what refinancing could save you",
  ctaText:
    "Answer a few quick questions to view estimated refinance offers and your potential break-even — with no impact to your credit score to check.",
  fineprint:
    "AltFTool is not a lender or mortgage broker. Rates, terms, closing costs, and approval are determined by the lender based on your circumstances and are not guaranteed. Estimated savings depend on your final loan terms. Checking your rate uses a soft credit inquiry; applying with a lender may involve a hard inquiry.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1706164971309-fb4785fe6ceb", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1707902665498-a202981fb5ac",
      alt: "A homeowner reviewing refinance numbers with a calculator and notebook",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1628744448839-a475cc0e90c3",
      alt: "A house surrounded by trees under a blue sky",
    },
  },

  seo: {
    title: "Mortgage Refinance — Compare Rates | AltFTool",
    description:
      "Refinance your mortgage to lower your rate, cut your monthly payment, shorten your term, or take cash out. Compare estimated offers and savings in minutes.",
  },
};

export default mortgageRefinance;
