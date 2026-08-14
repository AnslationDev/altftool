// Bad Credit Loan — content file for the Loans module.
//
// Follows the canonical shape defined in personal-loan.js. Plain serialisable
// data only (no imports, no functions). Icon strings must exist in _lib/icons.js.
//
// Sensitive category: copy is deliberately honest and non-predatory — no
// "guaranteed approval" or "no credit check" framing. It is transparent that
// lower credit usually means higher rates and steers borrowers toward
// legitimate paths (soft-check prequalification, secured loans, co-signers)
// and rebuilding credit through on-time repayment.

export const badCreditLoan = {
  slug: "bad-credit-loan",
  name: "Bad Credit Loan",
  accent: "lime",
  icon: "TrendingUp",

  eyebrow: "Bad credit loans",
  headline: "Loan options that look beyond your credit score",
  headlineAccent: "beyond your credit score",
  subheadline:
    "A lower score doesn't have to close the door. Compare lenders that also weigh your income and employment, prequalify with a soft check, and find the most affordable, legitimate way to borrow — and rebuild — responsibly.",
  heroPoints: [
    "Options for fair, poor and limited credit",
    "Prequalify with a soft check — no score impact",
    "Higher rates are typical, so compare the APR",
  ],
  heroStats: [
    { icon: "Gauge", label: "Soft check to see your options" },
    { icon: "Users", label: "Co-signer options available" },
    { icon: "TrendingUp", label: "Build credit with on-time payments" },
  ],

  quoteLabel: "See my options",
  quoteUrl: "#demo-only",

  featuresTitle: "More than a number on a credit report",
  featuresIntro:
    "Approval with imperfect credit is possible. These are the legitimate levers that widen your options and lower what you ultimately pay.",
  features: [
    {
      icon: "Users",
      title: "Lenders look past your score",
      description:
        "Many weigh steady income and employment alongside your credit, so a thin or bruised history isn't the whole story.",
    },
    {
      icon: "Gauge",
      title: "Prequalify with a soft check",
      description:
        "See estimated rates and offers using a soft inquiry that leaves your credit score untouched — before you formally apply.",
    },
    {
      icon: "Lock",
      title: "Secured loan options",
      description:
        "Backing a loan with collateral, like a vehicle or savings, can improve your odds of approval and earn a lower rate.",
    },
    {
      icon: "HeartHandshake",
      title: "Add a co-signer",
      description:
        "A creditworthy co-signer shares responsibility for the loan, which can unlock approval or a noticeably better rate.",
    },
    {
      icon: "TrendingUp",
      title: "Rebuild as you repay",
      description:
        "On-time payments are reported to the bureaus, so a well-managed loan can steadily strengthen your credit over time.",
    },
    {
      icon: "ShieldCheck",
      title: "Steer clear of predatory offers",
      description:
        "Favour lenders with clear, disclosed APRs over 'no credit check' deals, whose sky-high costs can trap you deeper in debt.",
    },
  ],

  benefitsTitle: "Why compare your options here",
  benefits: [
    {
      icon: "Users",
      title: "Options across the spectrum",
      description:
        "See lenders that work with fair, poor and limited credit, instead of being turned away by a single hard cutoff.",
    },
    {
      icon: "Gauge",
      title: "No-risk prequalification",
      description:
        "A soft check reveals the offers you're likely to qualify for without denting your score or committing you to anything.",
    },
    {
      icon: "TrendingUp",
      title: "A route to rebuild",
      description:
        "Repaid responsibly, the right loan becomes a track record of on-time payments that can lift your credit going forward.",
    },
    {
      icon: "Scale",
      title: "Honest side-by-side offers",
      description:
        "Compare real APRs, fees and terms in one place so you judge the total cost, not just the monthly payment.",
    },
  ],

  processTitle: "Four steps to borrow responsibly",
  process: [
    {
      title: "Prequalify with a soft check",
      description:
        "Share a few details to see the offers you may qualify for. It's a soft inquiry, so your credit score stays intact.",
    },
    {
      title: "Compare real offers",
      description:
        "Review the APR, fees and total repayment on each option side by side — the full cost matters far more than the headline rate.",
    },
    {
      title: "Pick what you can repay",
      description:
        "Choose the most affordable loan that fits your budget comfortably, borrowing only the amount you're confident you can pay back.",
    },
    {
      title: "Pay on time, build credit",
      description:
        "Make every payment on schedule. Those on-time payments are reported and can steadily rebuild your credit for better rates later.",
    },
  ],

  rateTitle: "What shapes the rate you're offered",
  rateIntro:
    "Lower credit usually means a higher rate, but several factors move the needle. Here's what lenders weigh — and where you can improve your offer.",
  rateFactors: [
    {
      factor: "Credit score & history",
      detail:
        "Your score and past payment behaviour set the starting point; recent on-time payments help offset older blemishes.",
    },
    {
      factor: "Income & employment stability",
      detail:
        "Steady, verifiable income and a reliable job reassure lenders you can handle the payments, which can soften a lower score.",
    },
    {
      factor: "Debt-to-income ratio",
      detail:
        "The share of your income already committed to debt matters; lowering existing balances leaves more room for a better rate.",
    },
    {
      factor: "Collateral or a co-signer",
      detail:
        "Pledging collateral or adding a creditworthy co-signer reduces the lender's risk and can meaningfully improve your offer.",
    },
    {
      factor: "Loan amount & term",
      detail:
        "Smaller amounts and shorter terms cost less overall; a longer term lowers the payment but adds to the total interest paid.",
    },
  ],

  faqs: [
    {
      q: "Can I get a loan with bad credit?",
      a: "Yes. Lenders exist for fair, poor and limited credit, and some weigh your income and employment as well as your score. Expect higher rates than a top-tier borrower, so compare offers carefully.",
    },
    {
      q: "Will checking my options hurt my score?",
      a: "No. Prequalifying uses a soft credit inquiry, which has no effect on your credit score. A hard inquiry only happens if you decide to formally apply with a lender.",
    },
    {
      q: "What interest rate can I expect?",
      a: "Rates are generally higher when credit is weaker, though they vary widely by lender. Compare the APR rather than the monthly payment, and borrow only what you can comfortably repay.",
    },
    {
      q: "Does adding a co-signer help?",
      a: "Often, yes. A creditworthy co-signer lowers the lender's risk, which can improve your chances of approval or earn a better rate. Remember that they're equally responsible if you miss payments.",
    },
    {
      q: "Are 'no credit check' loans a good idea?",
      a: "Usually not. Loans advertised with no credit check often carry very high costs and predatory terms. Favour lenders that run a transparent check and clearly disclose the full APR.",
    },
    {
      q: "How can I improve my odds and my rate?",
      a: "Prequalify to compare offers, consider a secured loan or a co-signer, and pay down existing debt where you can. Over time, consistent on-time payments help rebuild your credit for better terms.",
    },
  ],

  ctaTitle: "See the options open to you",
  ctaText:
    "Prequalify in minutes to view real offers you may qualify for — a soft check with no impact to your score and no obligation to accept.",
  fineprint:
    "AltFTool is not a lender and does not guarantee approval. Rates and terms are set by the lender based on your credit and finances, and lower credit typically means higher rates. Review the full APR and terms before accepting, and borrow only what you can responsibly repay.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1758523419091-b48deb56d7b9", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1762427355235-dd22e5cb010c",
      alt: "A desk with a calculator and paperwork for weighing loan options",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1521791136064-7986c2920216",
      alt: "Two people shaking hands after agreeing on a loan",
    },
  },

  seo: {
    title: "Bad Credit Loans — Compare Real Options | AltFTool",
    description:
      "Have fair, poor or limited credit? Compare bad-credit loan options with a soft check that won't affect your score. See offers, compare APRs and borrow wisely.",
  },
};

export default badCreditLoan;
