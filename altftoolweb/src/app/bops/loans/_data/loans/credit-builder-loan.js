// Credit Builder Loan — content file for the Loans module.
//
// Follows the canonical shape defined in personal-loan.js. Plain serialisable
// data only (no imports, no functions). Icon strings must exist in _lib/icons.js.
//
// This product has no traditional "rate": you don't receive money up front —
// the loan amount is held in a locked/secured savings account while you make
// fixed monthly payments that are reported to the credit bureaus, then the
// savings are released at the end. The rate section is therefore repurposed
// into "what to look for". Copy is deliberately honest: no promised score
// increase and no "guaranteed" results — improvement depends on on-time
// payments and the borrower's broader credit behaviour.

export const creditBuilderLoan = {
  slug: "credit-builder-loan",
  name: "Credit Builder Loan",
  accent: "emerald",
  icon: "Gauge",

  eyebrow: "Credit builder loans",
  headline: "Build credit and savings, one payment at a time",
  headlineAccent: "one payment at a time",
  subheadline:
    "A credit builder loan flips the usual order: you make small fixed payments first, each one is reported to the credit bureaus, and you collect the saved-up funds at the end — no existing credit or upfront cash required.",
  heroPoints: [
    "No credit history or collateral needed to start",
    "On-time payments reported to the credit bureaus",
    "Your savings are returned when you finish",
  ],
  heroStats: [
    { icon: "TrendingUp", label: "Builds a positive payment history" },
    { icon: "PiggyBank", label: "Doubles as forced savings" },
    { icon: "ShieldCheck", label: "Funds held in a secured account" },
  ],

  quoteLabel: "Start building",
  quoteUrl: "#demo-only",

  featuresTitle: "A loan built to grow your credit",
  featuresIntro:
    "With a credit builder loan you pay before you receive. Every on-time payment builds your history while your money quietly grows in a locked account.",
  features: [
    {
      icon: "Gauge",
      title: "Start with no credit",
      description:
        "Ideal if you have a thin or empty credit file — it builds the track record lenders look for.",
    },
    {
      icon: "Award",
      title: "Rebuild after setbacks",
      description:
        "Recovering from missed payments or a rough patch? Steady on-time payments help you move forward.",
    },
    {
      icon: "PiggyBank",
      title: "Save without trying",
      description:
        "Your payments quietly build a lump sum you collect at the end — forced savings with a purpose.",
    },
    {
      icon: "CalendarClock",
      title: "Payments that fit",
      description:
        "Small fixed amounts each month make it easy to stay consistent and never miss a due date.",
    },
    {
      icon: "BadgeCheck",
      title: "Reported where it counts",
      description:
        "Look for a loan that reports to all three major bureaus so every payment can shape your score.",
    },
    {
      icon: "Lock",
      title: "No cash upfront",
      description:
        "You don't need existing good credit or collateral — your future payments do the building.",
    },
  ],

  benefitsTitle: "Why a credit builder loan works",
  benefits: [
    {
      icon: "TrendingUp",
      title: "Builds payment history",
      description:
        "Payment history is the biggest factor in your credit score, and this loan is built to create it.",
    },
    {
      icon: "CheckCircle2",
      title: "No good credit needed",
      description:
        "There's usually no minimum score and no collateral — a great fit when you're just getting started.",
    },
    {
      icon: "Coins",
      title: "Savings at the end",
      description:
        "Every payment sets money aside, so you finish with a cash cushion, not just a stronger file.",
    },
    {
      icon: "BadgeCheck",
      title: "Reported to all three bureaus",
      description:
        "Many lenders report to all three major bureaus, so your effort shows up wherever credit is checked.",
    },
  ],

  processTitle: "How a credit builder loan works",
  process: [
    {
      title: "Pick an amount you can afford",
      description:
        "Choose a small loan and monthly payment that fits your budget — the goal is consistency, not size.",
    },
    {
      title: "Your funds are secured",
      description:
        "The loan amount is placed in a locked savings account instead of being paid to you upfront.",
    },
    {
      title: "Make on-time payments",
      description:
        "Pay the same fixed amount each month; the lender reports every payment to the credit bureaus.",
    },
    {
      title: "Collect your savings",
      description:
        "When the term ends, the money is released to you — now with a stronger payment history behind it.",
    },
  ],

  rateTitle: "What to look for in a credit builder loan",
  rateIntro:
    "There's no interest rate to shop here in the usual sense, but not all credit builder loans are equal. Compare these details so you get the most from every payment.",
  rateFactors: [
    {
      factor: "Reports to all three bureaus",
      detail:
        "Confirm it reports to Equifax, Experian and TransUnion — payments only help where they're actually reported.",
    },
    {
      factor: "Monthly payment amount",
      detail:
        "Pick an amount you can comfortably cover every month; affordability is what keeps your payments on time.",
    },
    {
      factor: "Loan term length",
      detail:
        "Shorter terms finish faster; longer ones build a longer payment record. Match the term to your goal.",
    },
    {
      factor: "Fees, APR and returned interest",
      detail:
        "Check any setup or monthly fees and the interest charged — some providers even return part of the interest at the end.",
    },
    {
      factor: "Lender legitimacy",
      detail:
        "Use a reputable provider with an insured savings account so your locked funds stay safe until you finish.",
    },
  ],

  faqs: [
    {
      q: "How does a credit builder loan actually work?",
      a: "You make fixed monthly payments first, while the loan amount stays in a locked savings account. Once you've paid it off, that money is released to you — and your on-time payments have been reported to the bureaus along the way.",
    },
    {
      q: "Will it guarantee my credit score goes up?",
      a: "No. No one can promise a specific increase. Your score depends on paying on time every month and the rest of your credit behaviour — and missed payments can actually set you back.",
    },
    {
      q: "Who is a credit builder loan for?",
      a: "It's designed for people with little or no credit history, those rebuilding after setbacks, and newcomers or young adults establishing credit for the first time.",
    },
    {
      q: "Do I get the money upfront?",
      a: "No. Unlike a regular loan, the funds are held in a secured savings account while you pay. You receive the money at the end, sometimes with interest returned or minus small fees.",
    },
    {
      q: "How long before I see results?",
      a: "Many people notice movement after a few months of on-time payments, since activity is reported monthly. Building a strong credit history is a gradual, ongoing process.",
    },
    {
      q: "Do I need good credit to qualify?",
      a: "Usually not. Most credit builder loans involve little or no credit check, because your money is secured — that's what makes them accessible when you're starting out or rebuilding.",
    },
  ],

  ctaTitle: "Start building your credit today",
  ctaText:
    "Make small, steady payments, watch your history grow, and collect your savings at the end. It's a simple first step toward stronger credit.",
  fineprint:
    "AltFTool is not a lender. Results are not guaranteed and depend on on-time payments and your overall credit profile. Terms, fees and bureau reporting vary by provider, and missed payments can harm your credit.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1633158829875-e5316a358c6f", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1585143790814-b40d4b829e4a",
      alt: "A glass jar filling with saved coins",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1594738262231-b0d2ce0275df",
      alt: "Stacks of coins on a wooden table",
    },
  },

  seo: {
    title: "Credit Builder Loans — Build Credit | AltFTool",
    description:
      "Build or rebuild credit with a credit builder loan. Make small monthly payments reported to the credit bureaus, then collect your savings when you finish.",
  },
};

export default creditBuilderLoan;
