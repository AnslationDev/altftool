// Personal Loan — reference content file for the Loans module.
//
// This is the canonical shape every loan vertical follows. Fields:
//   slug            folder name under src/app/bops/loans/ and the React key
//   name            display name (used in headings, e.g. "{name} FAQs")
//   accent          hn-app accent key: violet|sky|teal|emerald|amber|rose|orange|lime
//   icon            LoanIcon name (see _lib/icons.js) — used in cross-links
//   eyebrow         small label above the hero headline + cross-link subtitle
//   headline        hero H1 (plain text)
//   headlineAccent  a literal substring of headline, drawn in the accent colour
//   subheadline     one/two-sentence hero support line
//   heroPoints      3 short trust bullets (rendered with a check)
//   heroStats       optional trust chips [{ icon, label }]
//   quoteLabel      CTA button text (the conversion action)
//   quoteUrl        outbound quote-partner URL (placeholder until CMS-wired)
//   featuresTitle   optional; defaults to `${name}s, made simple`
//   featuresIntro   optional lede under the features head
//   features        6 [{ icon, title, description }]
//   benefitsTitle   optional; defaults to "A smarter way to borrow"
//   benefits        4 [{ icon, title, description }]
//   processTitle    optional; defaults to "From application to funds"
//   process         4 [{ title, description }]
//   rateTitle       optional; defaults to "What affects your rate"
//   rateIntro       optional lede under the rate head
//   rateFactors     5 [{ factor, detail }]
//   faqs            6 [{ q, a }]
//   ctaTitle/ctaText optional CTA band overrides
//   fineprint       optional small legal line under the CTA
//   seo             { title, description }

export const personalLoan = {
  slug: "personal-loan",
  name: "Personal Loan",
  accent: "violet",
  icon: "Wallet",

  eyebrow: "Personal loans",
  headline: "Funds for life's big moments, without the wait",
  headlineAccent: "without the wait",
  subheadline:
    "Consolidate debt, cover an emergency or finance a major purchase with a fixed-rate personal loan — one predictable payment, no collateral, and funds as soon as tomorrow.",
  heroPoints: [
    "Borrow $1,000 to $100,000",
    "Fixed rates and set monthly payments",
    "Checking your rate won't affect your credit",
  ],
  heroStats: [
    { icon: "Zap", label: "Funds as fast as 1 business day" },
    { icon: "Gauge", label: "No credit impact to check" },
    { icon: "Lock", label: "Bank-level encryption" },
  ],

  quoteLabel: "Check your rate",
  quoteUrl: "https://example.com/quote/personal-loan",

  featuresTitle: "One loan, plenty of reasons",
  featuresIntro:
    "A personal loan is money you can use for almost anything, repaid in fixed monthly installments. Here's where it helps most.",
  features: [
    {
      icon: "CreditCard",
      title: "Consolidate debt",
      description:
        "Roll multiple high-interest balances into one lower fixed payment — and a clear payoff date.",
    },
    {
      icon: "Home",
      title: "Home improvements",
      description:
        "Fund a renovation or repair without tapping your home equity or touching your savings.",
    },
    {
      icon: "Receipt",
      title: "Major purchases",
      description:
        "Spread the cost of a big-ticket buy over predictable monthly payments instead of a credit card.",
    },
    {
      icon: "ShieldCheck",
      title: "Unexpected expenses",
      description:
        "Cover a medical bill, car repair or other emergency quickly, without derailing your budget.",
    },
    {
      icon: "HeartHandshake",
      title: "Life's milestones",
      description:
        "A wedding, a move or a once-in-a-lifetime trip — finance it on terms you set in advance.",
    },
    {
      icon: "CalendarClock",
      title: "Predictable payments",
      description:
        "The same amount every month for the life of the loan — no variable rates, no surprises.",
    },
  ],

  benefitsTitle: "Why a personal loan works",
  benefits: [
    {
      icon: "Lock",
      title: "No collateral required",
      description:
        "Most personal loans are unsecured, so your home or car is never on the line to borrow.",
    },
    {
      icon: "Percent",
      title: "Fixed, transparent rates",
      description:
        "Your APR and monthly payment are locked at the start, so the total cost is clear up front.",
    },
    {
      icon: "Zap",
      title: "Fast funding",
      description:
        "Many borrowers receive their money within one business day of final approval.",
    },
    {
      icon: "Scale",
      title: "Compare in one place",
      description:
        "See personalised offers from multiple lenders side by side and pick the one that fits.",
    },
  ],

  processTitle: "From rate check to funds in four steps",
  process: [
    {
      title: "Check your rate",
      description:
        "Answer a few questions and see personalised offers in minutes — with no impact to your credit score.",
    },
    {
      title: "Compare offers",
      description:
        "Weigh rates, terms and monthly payments side by side, and choose the option that suits your budget.",
    },
    {
      title: "Get approved",
      description:
        "Finish your application with the lender you picked. Most decisions come back fast, often the same day.",
    },
    {
      title: "Receive your funds",
      description:
        "Once you're approved, the money is deposited straight into your bank account — frequently within a day.",
    },
  ],

  rateTitle: "What affects your personal loan rate",
  rateIntro:
    "Every offer is personalised. These are the factors lenders weigh most when they price your loan.",
  rateFactors: [
    {
      factor: "Credit score",
      detail:
        "The single biggest lever. Higher scores unlock the lowest APRs; strong credit can mean single-digit rates.",
    },
    {
      factor: "Loan amount & term",
      detail:
        "Larger balances and longer repayment terms lower the monthly payment but raise the total interest you pay.",
    },
    {
      factor: "Income & debt-to-income",
      detail:
        "Lenders confirm your income comfortably covers the new payment on top of your existing obligations.",
    },
    {
      factor: "Loan purpose",
      detail:
        "Some lenders price debt consolidation or home projects differently from general-purpose borrowing.",
    },
    {
      factor: "Co-signer or co-borrower",
      detail:
        "Adding a creditworthy co-signer can improve the rate you're offered — and help if your own credit is thin.",
    },
  ],

  faqs: [
    {
      q: "Does checking my rate hurt my credit?",
      a: "No. Seeing your personalised rate uses a soft credit inquiry, which doesn't affect your score. A hard inquiry only happens if you choose to formally apply with a lender.",
    },
    {
      q: "How much can I borrow?",
      a: "Personal loans typically range from $1,000 to $100,000. Your actual limit depends on your income, credit profile and the individual lender.",
    },
    {
      q: "How fast can I get the money?",
      a: "After you accept an offer and the lender approves you, funds are often deposited within one to a few business days — some lenders fund the same day.",
    },
    {
      q: "What can I use a personal loan for?",
      a: "Almost anything: debt consolidation, home improvements, medical bills, moving costs or a large purchase. A few lenders restrict use for business or post-secondary education.",
    },
    {
      q: "Is a personal loan better than a credit card?",
      a: "For a fixed, one-off expense it often is. Personal loans usually carry lower fixed rates and a set payoff date, versus a credit card's variable rate and open-ended revolving balance.",
    },
    {
      q: "What credit score do I need?",
      a: "Many lenders look for fair credit and above, but options exist across the credit spectrum. A higher score simply earns you a lower rate and a larger borrowing limit.",
    },
  ],

  ctaTitle: "See your personal loan rate",
  ctaText:
    "Answer a few quick questions and compare real, personalised offers in minutes — with no impact to your credit score.",
  fineprint:
    "Rates, terms and approval are set by the lender based on your creditworthiness and are not guaranteed. AltFTool is not a lender. Checking your rate uses a soft credit inquiry; applying with a lender may involve a hard inquiry.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1758523419540-035814b85c80", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1598979072814-fa8af5d80de8",
      alt: "A couple reviewing their finances together on laptops at home",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1725258080098-727051947997",
      alt: "A calculator resting on a stack of banknotes",
    },
  },

  seo: {
    title: "Personal Loans — Compare Fixed Rates | AltFTool",
    description:
      "Compare personalised personal-loan offers from top lenders. Borrow $1,000–$100,000 at fixed rates, with no impact to your credit to check your rate.",
  },
};

export default personalLoan;
