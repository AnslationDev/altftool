// Home Mortgage — content file for the Loans module.
//
// Follows the canonical shape defined in personal-loan.js. Plain serialisable
// data only (no imports, no functions). Icon strings must exist in _lib/icons.js.

export const homeMortgage = {
  slug: "home-mortgage",
  name: "Home Mortgage",
  accent: "sky",
  icon: "Home",

  eyebrow: "Home purchase loans",
  headline: "Buy your home with confidence, from pre-approval to keys",
  headlineAccent: "from pre-approval to keys",
  subheadline:
    "Compare mortgage options for buying a home, get pre-approved before you shop, and lock a competitive rate — whether it's your first place or your next move.",
  heroPoints: [
    "Fixed and adjustable rates from 15 to 30 years",
    "Low-down-payment and first-time buyer programs",
    "Get pre-approved before you house-hunt",
  ],
  heroStats: [
    { icon: "FileCheck", label: "Pre-approval before you shop" },
    { icon: "Percent", label: "Compare rates from multiple lenders" },
    { icon: "Home", label: "First-time buyer friendly" },
  ],

  quoteLabel: "Get pre-approved",
  quoteUrl: "#demo-only",

  featuresTitle: "Financing built around buying a home",
  featuresIntro:
    "A mortgage is a long-term loan secured by the home you buy, repaid in monthly installments. Here's what to weigh as you choose one.",
  features: [
    {
      icon: "Percent",
      title: "Fixed-rate mortgages",
      description:
        "Lock one interest rate for the full term, so your principal-and-interest payment stays the same every month.",
    },
    {
      icon: "Gauge",
      title: "Adjustable-rate (ARM)",
      description:
        "Start with a lower fixed introductory rate that later adjusts with the market — often a fit for shorter stays.",
    },
    {
      icon: "Landmark",
      title: "Program choices",
      description:
        "Conventional, FHA, VA and jumbo options cover different budgets, down payments and eligibility at a high level.",
    },
    {
      icon: "DollarSign",
      title: "Flexible down payments",
      description:
        "Put down as little as 3% on some programs, or 20% or more to reduce your monthly cost and skip PMI.",
    },
    {
      icon: "CalendarClock",
      title: "Choose your term",
      description:
        "A 30-year term lowers the monthly payment; a 15-year term costs less interest overall and builds equity faster.",
    },
    {
      icon: "Home",
      title: "First-time buyer friendly",
      description:
        "Dedicated programs, lower down payments and buyer education help you get into your first home sooner.",
    },
  ],

  benefitsTitle: "Why smart buyers get pre-approved first",
  benefits: [
    {
      icon: "BadgeCheck",
      title: "Shop with confidence",
      description:
        "A pre-approval shows sellers you're a serious, qualified buyer and tells you the price range you can shop in.",
    },
    {
      icon: "Scale",
      title: "Terms that fit your budget",
      description:
        "Compare 15- versus 30-year and fixed versus adjustable options, then choose the monthly payment your budget supports.",
    },
    {
      icon: "Percent",
      title: "Competitive rates",
      description:
        "Comparing offers from several lenders on the same loan can meaningfully lower the rate and fees you pay.",
    },
    {
      icon: "Users",
      title: "Guidance you can lean on",
      description:
        "Buying a home involves many moving parts; clear steps and support help you go from offer to closing without surprises.",
    },
  ],

  processTitle: "From pre-approval to closing day",
  process: [
    {
      title: "Get pre-approved",
      description:
        "Share your income, assets and credit so a lender can estimate how much you can borrow and issue a pre-approval letter.",
    },
    {
      title: "Shop and make an offer",
      description:
        "House-hunt within your budget, then submit an offer backed by your pre-approval to stand out to sellers.",
    },
    {
      title: "Apply and submit documents",
      description:
        "Complete your full application for the chosen property and provide income, asset and identity documents for review.",
    },
    {
      title: "Underwriting and closing",
      description:
        "The lender verifies your details and orders an appraisal; once cleared, you sign, fund and collect the keys.",
    },
  ],

  rateTitle: "What shapes your mortgage rate",
  rateIntro:
    "Mortgage pricing is personal to you and the property. These are the main factors lenders weigh when they quote your rate.",
  rateFactors: [
    {
      factor: "Credit score",
      detail:
        "Higher scores generally earn lower rates. Strengthening your credit before you apply can reduce what you pay over the loan.",
    },
    {
      factor: "Down payment & loan-to-value",
      detail:
        "A larger down payment lowers your loan-to-value ratio, which can improve your rate and help you avoid mortgage insurance.",
    },
    {
      factor: "Loan type & term",
      detail:
        "Conventional, FHA, VA and jumbo loans price differently, and shorter terms usually carry lower rates than longer ones.",
    },
    {
      factor: "Debt-to-income ratio",
      detail:
        "Lenders compare your monthly debts to your income to confirm the payment is affordable; a lower ratio helps your terms.",
    },
    {
      factor: "Property type & location",
      detail:
        "A primary home, second home or investment property, and where it sits, all influence the rate a lender offers.",
    },
  ],

  faqs: [
    {
      q: "How much do I need for a down payment?",
      a: "It depends on the loan program. Some conventional loans start at 3% down and certain government-backed loans allow less, while putting down 20% or more can lower your payment and help you avoid private mortgage insurance.",
    },
    {
      q: "What's the difference between pre-qualified and pre-approved?",
      a: "Pre-qualification is a quick estimate based on information you share. Pre-approval is more thorough — the lender verifies your finances and issues a letter that carries more weight with sellers.",
    },
    {
      q: "Should I choose a fixed or adjustable rate?",
      a: "A fixed rate keeps your principal-and-interest payment the same for the whole term, which suits longer stays. An ARM starts lower but can change later, which may fit if you plan to move or refinance sooner.",
    },
    {
      q: "What is PMI, and can I avoid it?",
      a: "Private mortgage insurance protects the lender and is often required on conventional loans when you put down less than 20%. A larger down payment can avoid it, and it can usually be removed later as you build equity.",
    },
    {
      q: "How much home can I afford?",
      a: "That depends on your income, existing debts, down payment and current rates. A pre-approval gives you a realistic price range, and a mortgage calculator can help you estimate a comfortable monthly payment.",
    },
    {
      q: "What documents will I need to apply?",
      a: "Lenders typically ask for recent pay stubs, W-2s or tax returns, bank and asset statements, and identification. Self-employed buyers may need additional income documentation.",
    },
  ],

  ctaTitle: "Get pre-approved for your mortgage",
  ctaText:
    "Answer a few questions to compare mortgage options and get pre-approved — so you can shop for your home knowing exactly what you can spend.",
  fineprint:
    "AltFTool is not a lender or mortgage broker. Rates, terms, programs and approval are set by the lender based on your finances and the property and are not guaranteed; a pre-approval is not a commitment to lend.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1748063578185-3d68121b11ff", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1729855637715-99192904aac5",
      alt: "A hand holding the keys to a new home",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
      alt: "A modern family home on a sunny day",
    },
  },

  seo: {
    title: "Home Mortgage — Compare Rates & Pre-Approval | AltFTool",
    description:
      "Compare home mortgage options and get pre-approved before you house-hunt. Fixed and adjustable rates, plus low-down-payment and first-time buyer programs.",
  },
};

export default homeMortgage;
