// Auto Loan — content file for the Loans module.
//
// Follows the canonical shape defined in personal-loan.js. Plain serialisable
// data only: no imports, no functions. Every `icon` must exist in _lib/icons.js.

export const autoLoan = {
  slug: "auto-loan",
  name: "Auto Loan",
  accent: "rose",
  icon: "Car",

  eyebrow: "Auto loans",
  headline: "Shop for your next car like a cash buyer",
  headlineAccent: "like a cash buyer",
  subheadline:
    "Get pre-approved for a new or used car before you shop, so you can lock in your rate, negotiate the price with confidence, and know exactly what you'll pay each month.",
  heroPoints: [
    "Finance a new or used car, from a dealer or private seller",
    "Get pre-approved before you visit the lot",
    "Checking your rate won't affect your credit",
  ],
  heroStats: [
    { icon: "BadgeCheck", label: "Pre-approved before you shop" },
    { icon: "Gauge", label: "No credit impact to check" },
    { icon: "CalendarClock", label: "Terms from 24 to 84 months" },
  ],

  quoteLabel: "Get pre-approved",

  featuresTitle: "Financing for however you buy",
  featuresIntro:
    "An auto loan finances the car you want, repaid in fixed monthly installments. Here's where it fits your purchase best.",
  features: [
    {
      icon: "Car",
      title: "New vehicles",
      description:
        "Finance the latest model at a competitive rate, then negotiate the purchase price separately from how you pay for it.",
    },
    {
      icon: "Gauge",
      title: "Used vehicles",
      description:
        "Buy pre-owned with financing sized to the car's age and mileage — often the smarter-value route to your next ride.",
    },
    {
      icon: "DollarSign",
      title: "Dealer or private party",
      description:
        "Arrange financing that works whether you buy from a dealership lot or directly from a private seller.",
    },
    {
      icon: "FileCheck",
      title: "Pre-approval in hand",
      description:
        "Line up financing before you shop, so you walk onto the lot ready to negotiate price like a cash buyer.",
    },
    {
      icon: "Percent",
      title: "Competitive rates",
      description:
        "Compare offers from banks and credit unions in one place to find a low rate that fits your credit profile.",
    },
    {
      icon: "CheckCircle2",
      title: "No prepayment penalty",
      description:
        "With many lenders you can pay the loan off early and save on interest, with no extra fee for doing so.",
    },
  ],

  benefitsTitle: "Why pre-approval pays off",
  benefits: [
    {
      icon: "BadgeCheck",
      title: "Negotiate like a cash buyer",
      description:
        "With financing already approved, you can focus the dealer conversation on price instead of monthly payments.",
    },
    {
      icon: "ShieldCheck",
      title: "Lock your rate before you shop",
      description:
        "Know your rate up front so a showroom finance offer can't pressure you into terms that don't suit you.",
    },
    {
      icon: "Scale",
      title: "Compare offers in one place",
      description:
        "See personalised quotes from multiple lenders side by side and choose the one with the best overall cost.",
    },
    {
      icon: "Calculator",
      title: "Terms that fit your budget",
      description:
        "Choose a repayment length that balances a comfortable monthly payment against the total interest you'll pay.",
    },
  ],

  processTitle: "From rate check to keys in four steps",
  process: [
    {
      title: "Check your rate",
      description:
        "Share a few details about you and the car you're after to see personalised pre-approval offers, with no credit impact.",
    },
    {
      title: "Shop with your budget set",
      description:
        "Head to the dealership or a private seller knowing exactly what you can spend and what your rate will be.",
    },
    {
      title: "Finalise the loan",
      description:
        "Complete the paperwork with your chosen lender, or let the dealer process the financing you've already lined up.",
    },
    {
      title: "Drive off",
      description:
        "Take delivery of your vehicle and start fixed monthly payments on a schedule you picked in advance.",
    },
  ],

  rateTitle: "What affects your auto loan rate",
  rateIntro:
    "No two auto loan quotes are the same. These are the factors a lender weighs most when pricing your car loan.",
  rateFactors: [
    {
      factor: "Credit score",
      detail:
        "Usually the biggest factor. A higher score signals lower risk and unlocks the most competitive rates lenders offer.",
    },
    {
      factor: "Vehicle age & mileage",
      detail:
        "New cars typically earn lower rates than older, higher-mileage used vehicles, which carry more risk for the lender.",
    },
    {
      factor: "Loan term",
      detail:
        "A longer term lowers your monthly payment but means you pay more total interest over the life of the loan.",
    },
    {
      factor: "Down payment / loan-to-value",
      detail:
        "A larger down payment reduces how much you finance against the car's value, which can help you qualify for a better rate.",
    },
    {
      factor: "Income & debt-to-income",
      detail:
        "Lenders check that your income comfortably covers the new payment alongside your existing monthly obligations.",
    },
  ],

  faqs: [
    {
      q: "Should I get pre-approved before going to the dealership?",
      a: "It's usually a smart move. Pre-approval shows you your real rate up front and lets you negotiate the car's price separately from the financing, so any dealer offer has to compete with a number you already hold.",
    },
    {
      q: "Are used-car rates higher than new-car rates?",
      a: "Often, yes. Used vehicles tend to carry slightly higher rates because their age and mileage add risk for the lender, though a strong credit profile can narrow the gap.",
    },
    {
      q: "How does the loan term affect my payment and total cost?",
      a: "A longer term spreads the balance over more months, so each payment is smaller but you pay more interest overall. A shorter term costs more each month yet less in total — pick the balance that suits your budget.",
    },
    {
      q: "Can I refinance my auto loan later?",
      a: "Usually. Many borrowers refinance down the road to lower their rate or payment if their credit improves or market rates fall. Just confirm your current loan has no prepayment penalty first.",
    },
    {
      q: "Do I need a down payment?",
      a: "Not always, but it helps. A down payment reduces how much you borrow against the car's value, which can lower your rate and payment — and helps you avoid owing more than the car is worth.",
    },
    {
      q: "Does checking my rate hurt my credit?",
      a: "No — checking your rate is a soft inquiry, so your credit score stays untouched. Only when you decide to formally apply with a lender does a hard inquiry appear on your report.",
    },
  ],

  ctaTitle: "See your auto loan rate",
  ctaText:
    "Tell us a little about the car you want and your budget, then compare real pre-approval offers in minutes — with no impact to your credit score.",
  fineprint:
    "Rates, terms and approval are set by the lender based on your creditworthiness and the vehicle, and are not guaranteed. AltFTool is not a lender. Checking your rate uses a soft credit inquiry; applying with a lender may involve a hard inquiry.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1777175013302-eaf4b3ef785a", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1761014586544-53fe5e1f1e25",
      alt: "Handing over the keys to a newly financed car",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1692406069831-0bb7ea297645",
      alt: "Rows of new cars in a dealership showroom",
    },
  },

  seo: {
    title: "Auto Loans — Compare New & Used Car Financing | AltFTool",
    description:
      "Get pre-approved for a new or used car loan and negotiate like a cash buyer. Compare personalised auto financing offers, no credit impact to check your rate.",
  },
};

export default autoLoan;
