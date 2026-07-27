// Debt Consolidation Loan — content file for the Loans module.
// Follows the canonical shape defined in personal-loan.js.

export const debtConsolidation = {
  slug: "debt-consolidation",
  name: "Debt Consolidation Loan",
  accent: "teal",
  icon: "Layers",

  eyebrow: "Debt consolidation loans",
  headline: "Combine your debts into one simpler payment",
  headlineAccent: "one simpler payment",
  subheadline:
    "Fold multiple high-interest balances — credit cards, store cards and other loans — into a single fixed-rate loan, with one monthly payment and a clear date your debt is gone.",
  heroPoints: [
    "Merge several balances into one payment",
    "Fixed rate with a defined payoff date",
    "Checking your rate uses a soft credit inquiry",
  ],
  heroStats: [
    { icon: "Layers", label: "Many debts, one monthly bill" },
    { icon: "Gauge", label: "Soft check to see your rate" },
    { icon: "Lock", label: "Bank-level data security" },
  ],

  quoteLabel: "See your options",

  featuresTitle: "One loan to tidy up your debt",
  featuresIntro:
    "A consolidation loan pays off your existing balances and leaves you with a single fixed-rate loan to repay. Here's what that changes day to day.",
  features: [
    {
      icon: "Layers",
      title: "Combine multiple balances",
      description:
        "Clear several credit cards, store cards and loans at once, then repay a single consolidated loan in their place.",
    },
    {
      icon: "TrendingDown",
      title: "Aim for a lower APR",
      description:
        "If your credit has improved, your new fixed rate may sit well below the double-digit APRs that cards often charge.",
    },
    {
      icon: "CalendarClock",
      title: "One fixed payment",
      description:
        "Swap a handful of shifting minimums for the same set amount every month until the balance reaches zero.",
    },
    {
      icon: "CheckCircle2",
      title: "A defined payoff date",
      description:
        "Fixed terms tell you the exact month your debt is gone, instead of an open-ended revolving balance that lingers.",
    },
    {
      icon: "Lock",
      title: "No collateral needed",
      description:
        "Consolidation loans are usually unsecured, so you don't pledge your home, car or savings to qualify.",
    },
    {
      icon: "Gauge",
      title: "Room to rebuild credit",
      description:
        "Paying cards down to zero can lower your credit utilisation, which may help your score recover over time.",
    },
  ],

  benefitsTitle: "Why borrowers consolidate",
  benefits: [
    {
      icon: "Coins",
      title: "Potential interest savings",
      description:
        "Moving high-rate card debt onto a lower fixed APR can reduce the total interest you pay over the life of the balance.",
    },
    {
      icon: "Repeat",
      title: "Simpler month to month",
      description:
        "Stop tracking several due dates and minimums — a single payment on one date is far easier to stay on top of.",
    },
    {
      icon: "Percent",
      title: "Predictable fixed rate",
      description:
        "Your rate is locked at signing, so payments never drift the way variable credit-card rates can from month to month.",
    },
    {
      icon: "Scale",
      title: "Compare offers first",
      description:
        "See personalised rates from several lenders in one place, then pick the term that best fits your budget.",
    },
  ],

  processTitle: "How consolidation works",
  process: [
    {
      title: "Check your rate",
      description:
        "Tell us roughly how much you owe and a little about your finances to see personalised offers, with no hit to your credit score.",
    },
    {
      title: "Pick your offer",
      description:
        "Compare rates, terms and the new monthly payment, then choose the loan that saves the most or suits your budget best.",
    },
    {
      title: "Pay off your debts",
      description:
        "Once you're approved, the funds clear your existing balances — some lenders pay your creditors directly on your behalf.",
    },
    {
      title: "Repay one loan",
      description:
        "From there you make a single fixed monthly payment until the consolidated balance is completely paid off.",
    },
  ],

  rateTitle: "What affects your consolidation rate",
  rateIntro:
    "Lenders price every offer individually. These are the details that shape the rate you're quoted.",
  rateFactors: [
    {
      factor: "Credit score",
      detail:
        "The biggest factor. Stronger scores earn the lowest APRs, which is where most of the interest savings come from.",
    },
    {
      factor: "Amount & term",
      detail:
        "How much you consolidate and over how long shapes both your monthly payment and the total interest you'll pay.",
    },
    {
      factor: "Debt-to-income ratio",
      detail:
        "Lenders weigh your existing debt against your income to gauge how comfortably you can carry the new payment.",
    },
    {
      factor: "Income stability",
      detail:
        "Steady, verifiable income reassures lenders and can help you qualify for a better rate and a larger amount.",
    },
    {
      factor: "Your credit habits",
      detail:
        "Keeping older cards open but paid off, and avoiding fresh balances, supports the profile lenders reward.",
    },
  ],

  faqs: [
    {
      q: "Will consolidating hurt my credit?",
      a: "Checking your rate uses a soft inquiry that doesn't affect your score. Opening the loan adds a hard inquiry and may dip your score briefly, but paying card balances down to zero often helps it recover over time.",
    },
    {
      q: "Is this a loan or a debt-relief program?",
      a: "It's a loan you repay in full — not debt settlement. You borrow to pay off your balances, then repay the new loan on agreed terms, so your accounts stay in good standing rather than being negotiated down.",
    },
    {
      q: "How much could I save?",
      a: "It depends on your current rates, the new APR you qualify for and your term. The wider the gap between your card rates and your loan rate, the more interest you stand to save.",
    },
    {
      q: "Will it lower my monthly payment?",
      a: "It often can, especially with a lower rate or a longer term. Just remember that stretching the term reduces the monthly amount while increasing the total interest you pay overall.",
    },
    {
      q: "Can I include credit cards and other loans?",
      a: "Usually yes. Most consolidation loans can cover credit cards, store cards and other unsecured personal loans, though the exact debts you can combine depend on the lender you choose.",
    },
    {
      q: "What if my credit isn't perfect?",
      a: "Options exist across the credit spectrum, though a lower score may mean a higher rate. Checking your rate first lets you see real offers before deciding whether consolidating makes sense for you.",
    },
  ],

  ctaTitle: "See what you could save",
  ctaText:
    "Check your personalised consolidation offers in minutes and see how one fixed payment could replace your high-interest balances — with no impact to your credit score to look.",
  fineprint:
    "AltFTool is not a lender. Rates, terms and approval are set by the lender based on your creditworthiness and are not guaranteed. Checking your rate uses a soft credit inquiry; formally applying may involve a hard inquiry, and a longer term can lower your payment while raising total interest.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1642043175009-5997b3a078d8", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1758522487963-1b193a2837fd",
      alt: "A couple sorting through bills and statements at the kitchen table",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1707157284454-553ef0a4ed0d",
      alt: "A desk with financial charts and a phone showing account balances",
    },
  },

  seo: {
    title: "Debt Consolidation Loans — One Fixed Payment | AltFTool",
    description:
      "Combine high-interest credit cards and loans into one fixed-rate payment. Compare personalised debt consolidation offers with no impact to your credit to check.",
  },
};

export default debtConsolidation;
