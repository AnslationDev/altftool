// Commercial Insurance — content file for the Insurance module.
//
// Follows the canonical shape defined in home-insurance.js. Plain serialisable
// data only: no imports, no functions. Icon strings must exist in _lib/icons.js.

export const commercialInsurance = {
  slug: "commercial-insurance",
  name: "Commercial Insurance",
  accent: "sky",
  icon: "Building2",

  eyebrow: "Business insurance",
  headline: "Cover the business you've built",
  headlineAccent: "business you've built",
  subheadline:
    "Commercial insurance is an umbrella term for the policies that shield an established business from property damage, liability lawsuits and lost income. Compare tailored quotes from multiple insurers in one place.",
  heroPoints: [
    "Protect property, liability and revenue in one program",
    "Meet client, lease and regulatory requirements",
    "Compare tailored quotes with no obligation",
  ],
  heroStats: [
    { icon: "Clock", label: "Quotes in minutes" },
    { icon: "FileCheck", label: "Certificates fast" },
    { icon: "Wallet", label: "Free to compare" },
  ],

  quoteLabel: "Compare quotes",
  quoteUrl: "https://example.com/quote/commercial-insurance",

  coverageTitle: "What commercial insurance covers",
  coverageIntro:
    "Most businesses combine several policies into one program. These are the core coverages an established company typically layers together.",
  coverage: [
    {
      icon: "ShieldCheck",
      title: "General liability",
      description:
        "Responds to third-party claims of bodily injury, property damage or advertising harm, covering legal defence and settlements up to your limits.",
    },
    {
      icon: "Building2",
      title: "Commercial property",
      description:
        "Repairs or replaces your buildings, equipment, inventory and furnishings after a covered event such as fire, theft or storm damage.",
    },
    {
      icon: "TrendingUp",
      title: "Business interruption",
      description:
        "Helps replace lost income and cover ongoing bills when a covered loss forces your operations to pause or relocate.",
    },
    {
      icon: "Truck",
      title: "Commercial auto",
      description:
        "Covers vehicles your business owns or uses for work, including liability, collision and damage to company cars, vans and trucks.",
    },
    {
      icon: "HeartPulse",
      title: "Workers' compensation",
      description:
        "Pays medical bills and a share of lost wages when an employee is injured on the job, and is legally required in most states.",
    },
    {
      icon: "FileCheck",
      title: "Professional liability",
      description:
        "Errors and omissions cover that defends against claims your professional advice or services caused a client financial loss.",
    },
  ],

  benefitsTitle: "Why compare commercial insurance here",
  benefits: [
    {
      icon: "Lock",
      title: "Protect assets and revenue",
      description:
        "A single lawsuit or major loss can drain years of profit. The right program helps shield your property, cash flow and reputation.",
    },
    {
      icon: "BadgeCheck",
      title: "Meet your obligations",
      description:
        "Clients, landlords, lenders and regulators often require proof of coverage. Comparing here helps you satisfy those terms confidently.",
    },
    {
      icon: "Scale",
      title: "Coverage built for your industry",
      description:
        "A contractor, a clinic and a software firm face very different risks. Tailor limits and policies to how your business actually operates.",
    },
    {
      icon: "PiggyBank",
      title: "Bundle into a BOP and save",
      description:
        "Many businesses combine liability and property into a Business Owner's Policy, which often costs less than buying each separately.",
    },
  ],

  processTitle: "From quote to covered",
  process: [
    {
      title: "Tell us about your business",
      description:
        "Share your industry, size, revenue and the risks you want covered — it takes only a few minutes to outline.",
    },
    {
      title: "Compare tailored quotes",
      description:
        "Review personalised quotes from multiple insurers side by side, with the coverages and limits clearly laid out.",
    },
    {
      title: "Choose your coverage",
      description:
        "Select the policies, limits and deductibles that fit your operations, your contracts and your budget.",
    },
    {
      title: "Get your certificates fast",
      description:
        "Once you bind coverage, certificates of insurance can often be issued quickly so you can share proof with clients and partners.",
    },
  ],

  factorsTitle: "What affects your commercial insurance premium",
  factorsIntro:
    "Every quote is priced to your specific operation. These are the factors insurers weigh most when pricing a commercial program.",
  factors: [
    {
      factor: "Industry & risk level",
      detail:
        "The nature of your work drives the price — a roofing crew or a busy kitchen typically carries more exposure than a quiet office.",
    },
    {
      factor: "Business size",
      detail:
        "Annual revenue, payroll and headcount all scale your premium, since a larger operation generally means more people, property and potential claims.",
    },
    {
      factor: "Coverage types & limits",
      detail:
        "The policies you combine and the limits and deductibles you choose move the cost — broader protection typically raises the premium.",
    },
    {
      factor: "Location & property value",
      detail:
        "Where you operate and the value of the buildings, equipment and inventory you insure factor into what a policy costs.",
    },
    {
      factor: "Claims history",
      detail:
        "A record of prior claims can raise your rate, while a clean loss history often helps you qualify for better pricing.",
    },
  ],

  faqs: [
    {
      q: "What is commercial insurance?",
      a: "It's an umbrella term for the policies a business combines to manage its risks — covering property damage, liability lawsuits, lost income, employee injuries and more. Most companies build a program from several coverages rather than one policy.",
    },
    {
      q: "What does general liability cover?",
      a: "General liability responds to third-party claims that your business caused bodily injury, damaged someone's property or committed certain advertising harms. It typically covers legal defence costs and settlements up to your policy limits.",
    },
    {
      q: "Do I need workers' compensation?",
      a: "In most states you're required to carry workers' compensation once you have employees, though the exact rules vary by state and industry. It covers medical costs and lost wages when a worker is injured on the job.",
    },
    {
      q: "What is a Business Owner's Policy (BOP)?",
      a: "A BOP bundles general liability and commercial property into one package, often at a lower cost than buying them separately. It's a common starting point that many businesses then extend with additional coverages.",
    },
    {
      q: "How much does commercial insurance cost?",
      a: "It varies widely with your industry, size, location, coverage choices and claims history, so there's no single price. Comparing tailored quotes is the best way to see what a program may cost for your business.",
    },
    {
      q: "Can I get a certificate of insurance quickly?",
      a: "Yes. Once your coverage is bound, a certificate of insurance can usually be issued fast, so you can provide proof to clients, landlords or partners when they request it.",
    },
  ],

  ctaTitle: "Get your commercial insurance quote",
  ctaText:
    "Compare tailored quotes from multiple insurers in minutes — free, with no obligation, and built around how your business actually operates.",
  fineprint:
    "AltFTool is not an insurance company or agency and does not sell insurance. Quotes, coverage, eligibility and pricing are set by the insurer and vary by state, industry and circumstances. Coverage examples are general; read each policy for exact terms.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1772642986691-bff3d6f9ac6b", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
      alt: "A business team meeting around a table",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1783705094622-f2c01a9787b5",
      alt: "A modern commercial office building",
    },
  },

  seo: {
    title: "Commercial Insurance — Compare Quotes | AltFTool",
    description:
      "Compare commercial insurance quotes from multiple insurers in minutes. Protect your property, liability and revenue with cover tailored to your industry.",
  },
};

export default commercialInsurance;
