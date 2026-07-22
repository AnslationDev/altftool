// HELOC — content file for the Loans module.
//
// Follows the canonical shape defined in personal-loan.js. Plain serialisable
// data only: no imports, no functions. Icon strings must exist in _lib/icons.js.

export const heloc = {
  slug: "heloc",
  name: "HELOC",
  accent: "amber",
  icon: "PiggyBank",

  eyebrow: "Home equity lines of credit",
  headline: "Tap your home's equity, only when you need it",
  headlineAccent: "only when you need it",
  subheadline:
    "A HELOC (home equity line of credit) turns the equity you've built into a flexible, reusable credit line — draw what you need, pay interest only on what you use, and borrow again as you repay.",
  heroPoints: [
    "Borrow against the equity you've already built",
    "Pay interest only on what you actually draw",
    "A reusable credit line during the draw period",
  ],
  heroStats: [
    { icon: "RefreshCw", label: "Reusable during the draw period" },
    { icon: "Percent", label: "Interest only on what you draw" },
    { icon: "Lock", label: "Secured by your home equity" },
  ],

  quoteLabel: "Check your equity",
  quoteUrl: "https://example.com/quote/heloc",

  featuresTitle: "What you can do with a HELOC",
  featuresIntro:
    "A HELOC (home equity line of credit) lets you borrow against your home's value and draw funds as needs arise. Here's where it fits best.",
  features: [
    {
      icon: "Home",
      title: "Home renovations",
      description:
        "Fund a remodel or repair in stages, drawing only what each phase of the project actually costs.",
    },
    {
      icon: "RefreshCw",
      title: "Debt consolidation",
      description:
        "Move higher-interest balances onto a lower secured rate, then reuse the line as you pay it down.",
    },
    {
      icon: "ShieldCheck",
      title: "Emergency safety net",
      description:
        "Keep an open line on standby, so an unexpected cost never forces you toward high-rate credit.",
    },
    {
      icon: "DollarSign",
      title: "Big one-off expenses",
      description:
        "Cover tuition, a wedding or a major purchase, and pay interest only on the amount you draw.",
    },
    {
      icon: "Wallet",
      title: "Ongoing projects",
      description:
        "Access funds again and again through the draw period instead of taking a single fixed lump sum.",
    },
    {
      icon: "CalendarClock",
      title: "Flexible repayment",
      description:
        "During the draw period, many lenders let you make interest-only payments to keep costs manageable.",
    },
  ],

  benefitsTitle: "Why borrowers choose a HELOC",
  benefits: [
    {
      icon: "RefreshCw",
      title: "Reusable credit line",
      description:
        "Borrow, repay and borrow again during the draw period — like a credit card secured by your home.",
    },
    {
      icon: "Percent",
      title: "Pay only for what you use",
      description:
        "Interest applies to the balance you actually draw, not to your full approved credit limit.",
    },
    {
      icon: "Scale",
      title: "Often lower rates",
      description:
        "Because a HELOC is secured by your home, rates are typically below unsecured cards or loans.",
    },
    {
      icon: "Layers",
      title: "Flexible access to funds",
      description:
        "Draw money as needs arise over several years, rather than committing to one fixed amount up front.",
    },
  ],

  processTitle: "From equity check to funds in four steps",
  process: [
    {
      title: "Check your equity and rate",
      description:
        "Share your home's value and mortgage balance to estimate available equity and see indicative rates.",
    },
    {
      title: "Apply with your details",
      description:
        "Submit income, employment and property information so the lender can confirm what you qualify for.",
    },
    {
      title: "Appraisal and approval",
      description:
        "The lender verifies your home's value, often with an appraisal, then sets your credit limit and terms.",
    },
    {
      title: "Draw funds as you need them",
      description:
        "Once your line is open, pull money during the draw period and repay to free up available credit again.",
    },
  ],

  rateTitle: "What affects your HELOC rate",
  rateIntro:
    "HELOC rates are usually variable and priced to your profile. These factors weigh most on the rate and limit you're offered.",
  rateFactors: [
    {
      factor: "Home equity & CLTV",
      detail:
        "Your combined loan-to-value — total mortgage debt against your home's value — shapes both your limit and rate.",
    },
    {
      factor: "Credit score",
      detail:
        "Stronger credit generally earns a lower margin over the index and access to a higher credit line.",
    },
    {
      factor: "Income & debt-to-income",
      detail:
        "Lenders check that your income comfortably covers new draws alongside your existing monthly obligations.",
    },
    {
      factor: "Property type",
      detail:
        "A primary residence is usually priced better than a second home, condo or investment property.",
    },
    {
      factor: "Prevailing index rates",
      detail:
        "Most HELOCs are variable, so your rate tracks a benchmark index and can rise or fall over time.",
    },
  ],

  faqs: [
    {
      q: "What's the difference between a HELOC and a home equity loan?",
      a: "A HELOC is a revolving line you draw from as needed, usually at a variable rate. A home equity loan pays a single lump sum up front at a fixed rate. Both are secured by your home.",
    },
    {
      q: "What is the draw period?",
      a: "The draw period is the window — often around 10 years — when you can borrow from your line, repay and borrow again. After it ends, a repayment period begins and new draws stop.",
    },
    {
      q: "Is a HELOC rate fixed or variable?",
      a: "Most HELOCs carry a variable rate that moves with a benchmark index, so your payment can change over time. Some lenders let you lock part of your balance at a fixed rate.",
    },
    {
      q: "How much can I borrow with a HELOC?",
      a: "Your limit depends on your available equity and the lender's maximum combined loan-to-value, along with your credit and income. Lenders commonly cap total borrowing at a share of your home's value.",
    },
    {
      q: "Can I use a HELOC for anything?",
      a: "Generally yes — renovations, debt consolidation, tuition or an emergency fund are all common uses. Because your home is the collateral, it's wise to borrow with a clear repayment plan in mind.",
    },
    {
      q: "What happens after the draw period ends?",
      a: "You enter the repayment period, when you can no longer draw and instead pay down the outstanding balance, typically with principal and interest. Payments often rise once interest-only draws end.",
    },
  ],

  ctaTitle: "See what your home's equity can do",
  ctaText:
    "Estimate your available equity and compare indicative HELOC offers in minutes — with no obligation to move forward.",
  fineprint:
    "A HELOC is secured by your home, which you could lose if you fail to repay. Rates are typically variable, so your payment can rise or fall over time. Credit limits, rates and terms are set by the lender based on your equity, creditworthiness and property, and are not guaranteed. AltFTool is not a lender.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1656122381069-9ec666d95cf1", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
      alt: "A well-kept home whose equity can be tapped with a line of credit",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1649083048770-82e8ffd80431",
      alt: "A renovated living room with a fireplace and comfortable seating",
    },
  },

  seo: {
    title: "HELOC — Compare Home Equity Line of Credit Offers | AltFTool",
    description:
      "Compare HELOC offers and put your home equity to work with a flexible, reusable credit line. Draw only what you need and pay interest only on what you use.",
  },
};

export default heloc;
