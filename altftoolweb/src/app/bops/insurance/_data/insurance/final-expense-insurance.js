// Final Expense Insurance — content file for the Insurance module.
// Follows the canonical shape defined in home-insurance.js.

export const finalExpenseInsurance = {
  slug: "final-expense-insurance",
  name: "Final Expense Insurance",
  accent: "violet",
  icon: "Heart",

  eyebrow: "Burial & funeral insurance",
  headline: "A small policy that says I've got you covered",
  headlineAccent: "I've got you covered",
  subheadline:
    "Final expense insurance is a whole-life policy that helps pay for a funeral, remaining bills and other end-of-life costs — so the people you love inherit memories, not a stack of invoices. Compare plans built for exactly this.",
  heroPoints: [
    "Coverage sized for funeral and end-of-life costs",
    "Simplified and guaranteed-issue options for seniors",
    "Compare plans free, with no obligation",
  ],
  heroStats: [
    { icon: "HandHeart", label: "Made for peace of mind" },
    { icon: "BadgeCheck", label: "Often no medical exam" },
    { icon: "Wallet", label: "Free to compare" },
  ],

  quoteLabel: "Compare plans",
  quoteUrl: "https://example.com/quote/final-expense-insurance",

  coverageTitle: "What final expense insurance helps pay for",
  coverageIntro:
    "This is a smaller whole-life policy designed around one job: covering the costs that arrive at the end of life. Here's what the benefit typically goes toward.",
  coverage: [
    {
      icon: "Flower2",
      title: "Funeral & burial costs",
      description:
        "Helps pay for the service, casket or cremation, plot and other arrangements so your family isn't planning around a budget.",
    },
    {
      icon: "Stethoscope",
      title: "Remaining medical bills",
      description:
        "Covers hospital, hospice and other care costs that may be left behind, easing the paperwork during a hard time.",
    },
    {
      icon: "Receipt",
      title: "Small outstanding debts",
      description:
        "Can settle lingering credit-card balances, personal loans or other modest debts so they don't fall to loved ones.",
    },
    {
      icon: "HeartHandshake",
      title: "Cash for the family",
      description:
        "Any benefit left over goes to your beneficiary to use however they need — rent, travel or simply breathing room.",
    },
    {
      icon: "ShieldCheck",
      title: "Lifelong coverage",
      description:
        "As whole life, the policy never expires as long as premiums are paid — it won't lapse just because you grow older.",
    },
    {
      icon: "Lock",
      title: "Fixed premiums",
      description:
        "Your rate is locked in when you buy, so the payment you start with is typically the payment you keep for life.",
    },
  ],

  benefitsTitle: "Why people choose final expense cover",
  benefits: [
    {
      icon: "Wallet",
      title: "Coverage sized right",
      description:
        "Smaller amounts, often $5,000 to $25,000, keep premiums affordable while still covering the costs that matter here.",
    },
    {
      icon: "BadgeCheck",
      title: "Easier to qualify",
      description:
        "Simplified and guaranteed-issue plans ask few or no health questions and often skip the medical exam entirely.",
    },
    {
      icon: "Lock",
      title: "Premiums that hold steady",
      description:
        "Rates are typically fixed for life, so your budget stays predictable no matter how the years add up.",
    },
    {
      icon: "HandHeart",
      title: "A benefit paid quickly",
      description:
        "Once a claim is approved, the benefit is usually paid to your family fast — when the timing matters most.",
    },
  ],

  processTitle: "How coverage comes together",
  process: [
    {
      title: "Choose a coverage amount",
      description:
        "Pick a benefit that reflects the costs you want handled — from a modest funeral to a fuller cushion for family.",
    },
    {
      title: "Answer a few questions",
      description:
        "Simplified plans ask a short set of health questions; guaranteed-issue plans often ask none at all.",
    },
    {
      title: "Get your decision",
      description:
        "Many applicants are approved quickly, and guaranteed-issue options are built to accept most people who apply.",
    },
    {
      title: "Coverage is in place",
      description:
        "Once approved and your first premium is paid, your policy is active and your beneficiary is on file.",
    },
  ],

  factorsTitle: "What affects your final expense rate",
  factorsIntro:
    "Every quote is personal. These are the details insurers weigh most when pricing a final expense policy.",
  factors: [
    {
      factor: "Age",
      detail:
        "Age is the biggest driver — buying earlier generally locks in a lower monthly premium than waiting a few years.",
    },
    {
      factor: "Coverage amount",
      detail:
        "A larger benefit means a higher premium, so choosing a figure that matches actual costs keeps the payment manageable.",
    },
    {
      factor: "Health & tobacco use",
      detail:
        "On simplified plans, health history and tobacco use can affect the rate; guaranteed-issue plans skip health questions but usually cost more.",
    },
    {
      factor: "Gender",
      detail:
        "Because life expectancy differs on average, insurers often price policies slightly differently for men and women.",
    },
    {
      factor: "Simplified vs guaranteed issue",
      detail:
        "Guaranteed-issue plans accept nearly everyone but typically carry higher premiums and a waiting period before the full benefit is paid.",
    },
  ],

  faqs: [
    {
      q: "What is final expense insurance?",
      a: "It's a small whole-life policy — often $5,000 to $25,000 — designed to cover funeral costs, leftover medical bills and other end-of-life expenses. Because it's whole life, it doesn't expire and can build a little cash value over time.",
    },
    {
      q: "How much coverage do I need?",
      a: "Enough to cover a funeral and any bills you'd rather not leave behind. Many people start by estimating funeral costs in their area, then add a cushion for medical bills or small debts.",
    },
    {
      q: "Do I need a medical exam?",
      a: "Often not. Simplified-issue plans ask a few health questions with no exam, and guaranteed-issue plans usually ask no health questions at all — though skipping the exam can mean a higher premium.",
    },
    {
      q: "Can I be turned down for health reasons?",
      a: "You may be declined or rated higher on some simplified plans. Guaranteed-issue policies are built to accept most applicants regardless of health, which is why they exist as an option.",
    },
    {
      q: "When does the policy pay out?",
      a: "After a claim is approved the benefit is usually paid to your beneficiary fairly quickly. Be aware that guaranteed-issue policies often include a graded or waiting period, typically two to three years, before the full benefit is payable.",
    },
    {
      q: "Can my family use the money for anything?",
      a: "Yes. The benefit is paid as cash to your beneficiary, who can put it toward funeral costs, bills, debts or anything else — it isn't restricted to funeral expenses.",
    },
  ],

  ctaTitle: "Compare final expense plans",
  ctaText:
    "See plans built for funeral and end-of-life costs, including simplified and guaranteed-issue options — free to compare, with no obligation.",
  fineprint:
    "AltFTool is not an insurance company or agency and does not sell insurance. Plans, coverage, eligibility, waiting periods and pricing are set by the insurer and vary by state and circumstances. Guaranteed-issue policies commonly include a graded benefit period; read each policy for exact terms.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1739932885175-5fdaa1bd5989", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1576560665905-28b4d4ea3380",
      alt: "An adult holding the hand of an elderly loved one",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1747330201652-dbebf32eceb7",
      alt: "An elderly person's hands resting on a cane",
    },
  },

  seo: {
    title: "Final Expense Insurance — Compare Burial Plans | AltFTool",
    description:
      "Compare final expense insurance plans that help cover funeral, burial and end-of-life costs. Simplified and guaranteed-issue options, often no medical exam.",
  },
};

export default finalExpenseInsurance;
