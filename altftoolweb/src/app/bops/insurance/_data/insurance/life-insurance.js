// Life Insurance — content file for the Insurance module.
//
// Shape mirrors home-insurance.js (the canonical template). Plain serialisable
// data only: no imports, no functions. Icon names must exist in _lib/icons.js.

export const lifeInsurance = {
  slug: "life-insurance",
  name: "Life Insurance",
  accent: "rose",
  icon: "HeartHandshake",

  eyebrow: "Life insurance",
  headline: "Give the people you love a safety net",
  headlineAccent: "a safety net",
  subheadline:
    "Life insurance pays a tax-free cash benefit to the people you name when you're gone — so your income, your mortgage and your family's plans don't disappear with you. Compare quotes from trusted insurers in minutes.",
  heroPoints: [
    "Replace your income and cover big debts",
    "Term plans start surprisingly affordable",
    "Some policies need no medical exam",
  ],
  heroStats: [
    { icon: "Clock", label: "Quotes in minutes" },
    { icon: "ShieldCheck", label: "Trusted insurers" },
    { icon: "FileCheck", label: "No-exam options" },
  ],

  quoteLabel: "Compare quotes",
  quoteUrl: "#demo-only",

  coverageTitle: "What life insurance can do for your family",
  coverageIntro:
    "A policy turns into a cash benefit your loved ones can spend however they need. Here's what that money typically helps with.",
  coverage: [
    {
      icon: "Wallet",
      title: "Income replacement",
      description:
        "Steps in for the paycheck your household relies on, so day-to-day bills and long-term goals stay on track.",
    },
    {
      icon: "Home",
      title: "Mortgage & debt payoff",
      description:
        "Can clear a mortgage, car loans or credit balances so your family isn't left carrying the debt alone.",
    },
    {
      icon: "Baby",
      title: "Children's future",
      description:
        "Helps fund childcare, college tuition and the milestones you'd want to be there for, even if you can't be.",
    },
    {
      icon: "Flower2",
      title: "Final expenses",
      description:
        "Covers funeral costs, medical bills and estate expenses that can otherwise land on grieving relatives.",
    },
    {
      icon: "PiggyBank",
      title: "Cash value",
      description:
        "Permanent policies build cash value over time that you may borrow against or withdraw while you're living.",
    },
    {
      icon: "HeartPulse",
      title: "Living benefits",
      description:
        "Many policies let you access part of the benefit early if you're diagnosed with a serious or terminal illness.",
    },
  ],

  benefitsTitle: "Why shop for life insurance here",
  benefits: [
    {
      icon: "HandHeart",
      title: "Real protection for your family",
      description:
        "The benefit is theirs to use freely — for bills, the mortgage or simply keeping life steady during a hard time.",
    },
    {
      icon: "CalendarClock",
      title: "Lock in rates while you're young",
      description:
        "Premiums are largely based on your age and health today, so buying sooner typically locks in a lower cost.",
    },
    {
      icon: "DollarSign",
      title: "Term coverage is affordable",
      description:
        "A level-term policy often costs less than you'd expect for a healthy adult — meaningful coverage for a modest premium.",
    },
    {
      icon: "FileCheck",
      title: "Options without an exam",
      description:
        "Some carriers offer no-exam policies you can apply for online, with a decision that may come in minutes.",
    },
  ],

  processTitle: "From quote to covered in four steps",
  process: [
    {
      title: "Decide how much and how long",
      description:
        "Estimate the coverage amount your family would need and pick a term length that spans your key obligations.",
    },
    {
      title: "Compare quotes",
      description:
        "Review personalised quotes from trusted insurers side by side, with the coverage and price laid out clearly.",
    },
    {
      title: "Apply",
      description:
        "Complete a short application and answer health questions; some policies skip the medical exam entirely.",
    },
    {
      title: "Get approved & covered",
      description:
        "Once the insurer approves you, sign your policy and your beneficiaries are protected from day one.",
    },
  ],

  factorsTitle: "What affects your life insurance premium",
  factorsIntro:
    "Every quote is personalised. These are the factors insurers weigh most when pricing a life insurance policy.",
  factors: [
    {
      factor: "Your age",
      detail:
        "Age is the biggest lever — the younger you are when you buy, the lower your rate typically is for the same coverage.",
    },
    {
      factor: "Health & medical history",
      detail:
        "Your current health, family history and any conditions influence your rate; many conditions are still insurable at adjusted prices.",
    },
    {
      factor: "Coverage amount & term",
      detail:
        "A larger benefit or a longer term means more risk for the insurer, so both push the premium higher.",
    },
    {
      factor: "Tobacco & nicotine use",
      detail:
        "Smokers and nicotine users generally pay noticeably more, and quitting for a period can often qualify you for better rates.",
    },
    {
      factor: "Policy type",
      detail:
        "Term is the most affordable; permanent or whole life costs more because it lasts your whole life and builds cash value.",
    },
  ],

  faqs: [
    {
      q: "What's the difference between term and whole life?",
      a: "Term covers you for a set period like 10, 20 or 30 years and is the most affordable option. Whole life is permanent, lasts your entire life and builds cash value, but costs considerably more.",
    },
    {
      q: "How much coverage do I actually need?",
      a: "A common starting point is roughly 10 to 12 times your annual income, adjusted for debts, your mortgage and future needs like college. The right number depends on your family and goals.",
    },
    {
      q: "Do I need a medical exam?",
      a: "Not always. Some insurers offer no-exam policies based on health questions and data checks. A traditional exam can still unlock lower rates for many healthy applicants.",
    },
    {
      q: "Can I qualify with a health condition?",
      a: "Often, yes. Many conditions are insurable — your rate may simply be higher, and shopping several insurers helps since each one evaluates health differently.",
    },
    {
      q: "Is the payout taxed?",
      a: "In most cases the death benefit is paid income-tax-free to your beneficiaries. Some situations, such as very large estates, can have tax implications, so ask a tax professional about your circumstances.",
    },
    {
      q: "When is the best time to buy?",
      a: "Generally the sooner the better. Because pricing leans heavily on age and health, buying while you're younger and healthier usually locks in a lower rate for the life of the policy.",
    },
  ],

  ctaTitle: "Get your life insurance quote",
  ctaText:
    "Compare personalised quotes from trusted insurers in minutes — free, with no obligation, and no pressure to buy until you're ready.",
  fineprint:
    "AltFTool is not an insurance company or agency and does not sell insurance. Quotes, coverage, eligibility and pricing are set by the insurer and vary by state, insurer and your individual circumstances. Coverage examples are general; read each policy for exact terms and exclusions.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1756982477606-f943be86ca36", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1758687126877-b37052a20a4d",
      alt: "A happy family of three together on the couch",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1709216461598-018ae6307dc0",
      alt: "A family walking together on the beach at sunset",
    },
  },

  seo: {
    title: "Life Insurance — Term & Whole Life | AltFTool",
    description:
      "Compare life insurance quotes from trusted insurers in minutes. Protect your family's income, mortgage and future with term or whole life cover.",
  },
};

export default lifeInsurance;
