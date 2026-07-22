// Auto Refinance — content file for the Loans module.
//
// Follows the canonical shape defined in personal-loan.js. Plain serialisable
// data only (no imports, no functions). See _lib/icons.js for valid icon names.

export const autoRefinance = {
  slug: "auto-refinance",
  name: "Auto Refinance",
  accent: "orange",
  icon: "Repeat",

  eyebrow: "Auto refinancing",
  headline: "Refinance your car loan and pay less every month",
  headlineAccent: "pay less every month",
  subheadline:
    "Swap the auto loan you already have for a new one with a potentially lower rate or a payment that better fits your budget — and checking your options won't touch your credit.",
  heroPoints: [
    "Refinance most cars, trucks and SUVs",
    "Aim for a lower rate or a smaller payment",
    "Checking your options won't affect your credit",
  ],
  heroStats: [
    { icon: "TrendingDown", label: "Chase a lower rate" },
    { icon: "Gauge", label: "Soft check to see offers" },
    { icon: "PiggyBank", label: "Free up monthly cash" },
  ],

  quoteLabel: "Check my savings",
  quoteUrl: "https://example.com/quote/auto-refinance",

  featuresTitle: "Why drivers refinance their car",
  featuresIntro:
    "Refinancing replaces your current auto loan with a new one. Here's where making the switch tends to pay off most.",
  features: [
    {
      icon: "TrendingDown",
      title: "Lower your interest rate",
      description:
        "If rates have fallen or your credit has improved since you bought, a new loan could carry a noticeably lower APR.",
    },
    {
      icon: "PiggyBank",
      title: "Shrink your monthly payment",
      description:
        "A better rate or a longer term can lower what you owe each month, freeing up cash for everything else in your budget.",
    },
    {
      icon: "Car",
      title: "Escape a dealer rate",
      description:
        "Financing arranged at the dealership is often marked up. Refinancing lets you shop the rate entirely on its own.",
    },
    {
      icon: "CalendarClock",
      title: "Reshape your term",
      description:
        "Shorten the term to clear the balance sooner, or extend it to ease the monthly squeeze — the choice is yours.",
    },
    {
      icon: "Users",
      title: "Remove a co-signer",
      description:
        "Refinancing in your own name can release a co-signer from the loan once your credit is strong enough to stand alone.",
    },
    {
      icon: "Calculator",
      title: "Cut total interest",
      description:
        "A lower rate or a shorter term can reduce the total interest you pay across the whole life of the loan.",
    },
  ],

  benefitsTitle: "The upside of refinancing",
  benefits: [
    {
      icon: "Percent",
      title: "A shot at a lower rate",
      description:
        "When your credit or the wider market has improved, a fresh loan can be priced well below your original APR.",
    },
    {
      icon: "DollarSign",
      title: "More room in your budget",
      description:
        "A smaller monthly payment keeps more money in your pocket without changing the car sitting in your driveway.",
    },
    {
      icon: "Repeat",
      title: "Flexible new terms",
      description:
        "Pick a term that matches your goal — pay the car off faster, or spread the balance to lower each payment.",
    },
    {
      icon: "Scale",
      title: "Compare offers in one place",
      description:
        "See refinance quotes from multiple lenders side by side, then choose the rate and term that suit you best.",
    },
  ],

  processTitle: "Refinancing, step by step",
  process: [
    {
      title: "Check your rate and savings",
      description:
        "Share a few basics and preview estimated offers in minutes. This soft check won't affect your credit score.",
    },
    {
      title: "Add your vehicle and loan details",
      description:
        "Tell us about your car and current loan so lenders can tailor a refinance quote to your exact situation.",
    },
    {
      title: "Get approved and sign",
      description:
        "Choose the offer that fits, finish the lender's application and sign your new loan agreement online.",
    },
    {
      title: "Your old loan is paid off",
      description:
        "The new lender pays off your existing balance, and you begin making your new — often lower — monthly payment.",
    },
  ],

  rateTitle: "What affects your refinance rate",
  rateIntro:
    "Every quote is personalised. These are the things lenders weigh most when they price an auto refinance.",
  rateFactors: [
    {
      factor: "Credit score",
      detail:
        "The biggest lever. If your score has climbed since you first financed, you're far more likely to qualify for a lower rate.",
    },
    {
      factor: "Vehicle age & mileage",
      detail:
        "Newer cars with lower mileage are easier to refinance; many lenders cap how old or high-mileage a vehicle can be.",
    },
    {
      factor: "Loan-to-value & equity",
      detail:
        "How your balance compares with the car's value matters. Owing less than it's worth strengthens your options.",
    },
    {
      factor: "Remaining term",
      detail:
        "How much time is left on your current loan shapes the rates and terms lenders are willing to offer on a refinance.",
    },
    {
      factor: "Income & debt-to-income",
      detail:
        "Lenders confirm your income comfortably covers the new payment alongside your other monthly obligations.",
    },
  ],

  faqs: [
    {
      q: "When does refinancing my car make sense?",
      a: "It often makes sense when your credit has improved, interest rates have dropped, or you financed at a high rate through a dealer. If a new loan offers a lower rate or a payment that fits your budget better, it can be worth exploring.",
    },
    {
      q: "Will checking my rate hurt my credit?",
      a: "No. Previewing refinance offers uses a soft credit inquiry, which doesn't affect your score. A hard inquiry only happens if you choose to formally apply with a lender.",
    },
    {
      q: "Can I refinance if I owe more than the car is worth?",
      a: "It's harder. When you're underwater on the loan, fewer lenders will refinance and your choices may be limited. Some still consider it, depending on how large the gap is between your balance and the car's value.",
    },
    {
      q: "Is there a fee to refinance my auto loan?",
      a: "Many auto refinances cost little or nothing, but some lenders or states charge title, registration or lien fees. Always check the details of an offer before you sign.",
    },
    {
      q: "Will refinancing extend my loan?",
      a: "It can, if you choose a longer term to lower the monthly payment. That eases your budget now but may increase the total interest you pay, so it's worth weighing both sides.",
    },
    {
      q: "How much could I save?",
      a: "It depends entirely on your new rate and term versus your current loan. A lower rate or shorter term cuts total interest, while a longer term lowers the monthly payment — savings are never guaranteed.",
    },
  ],

  ctaTitle: "See your auto refinance offers",
  ctaText:
    "Answer a few quick questions and compare real refinance quotes in minutes — with no impact to your credit score to check.",
  fineprint:
    "Rates, terms and approval are set by the lender based on your creditworthiness, your vehicle and other factors, and are not guaranteed. AltFTool is not a lender. Checking your rate uses a soft credit inquiry; applying with a lender may involve a hard inquiry. Refinancing may extend your loan term and increase the total interest you pay.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1594852352010-63d76b89f85f", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1643792801605-1f8081811439",
      alt: "A driver holding the key beside their car",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1636012474705-b91610743811",
      alt: "A driver's hand on the steering wheel out on the road",
    },
  },

  seo: {
    title: "Auto Loan Refinancing — Compare Rates & Lower Your Payment | AltFTool",
    description:
      "Refinance your car loan for a lower rate or a smaller monthly payment. Compare personalised auto refinance offers in minutes, with no credit impact to check.",
  },
};

export default autoRefinance;
