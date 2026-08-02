// Small Business Insurance — content file for the Insurance module.
// Follows the canonical shape defined in home-insurance.js.

export const smallBusinessInsurance = {
  slug: "small-business-insurance",
  name: "Small Business Insurance",
  accent: "violet",
  icon: "Store",

  eyebrow: "Small business insurance",
  headline: "Big protection, sized for a small business",
  headlineAccent: "sized for a small business",
  subheadline:
    "Right-sized commercial cover for sole proprietors, freelancers, LLCs and startups — liability, property and more, without enterprise cost or complexity. Compare small-business quotes and get your certificate fast.",
  heroPoints: [
    "Coverage built for small budgets",
    "Instant certificates to win contracts",
    "Compare quotes with no obligation",
  ],
  heroStats: [
    { icon: "Clock", label: "Quotes in minutes" },
    { icon: "FileCheck", label: "Instant certificates" },
    { icon: "Wallet", label: "Free to compare" },
  ],

  quoteLabel: "Compare quotes",
  quoteUrl: "https://example.com/quote/small-business-insurance",

  coverageTitle: "What small business insurance covers",
  coverageIntro:
    "The essentials most small operators need, bundled and priced for lean budgets. Here's what a typical small-business policy can include.",
  coverage: [
    {
      icon: "ShieldCheck",
      title: "General liability",
      description:
        "Covers third-party claims for bodily injury, property damage and advertising harm — the cover most clients ask to see.",
    },
    {
      icon: "Briefcase",
      title: "Business Owner's Policy (BOP)",
      description:
        "Bundles general liability and commercial property into one convenient policy, often at a lower combined price for small firms.",
    },
    {
      icon: "FileCheck",
      title: "Professional liability (E&O)",
      description:
        "Protects consultants and service providers against claims of mistakes, missed deadlines or advice that caused a client loss.",
    },
    {
      icon: "HandHeart",
      title: "Workers' compensation",
      description:
        "Helps pay medical bills and lost wages if an employee is hurt on the job — typically required once you hire staff.",
    },
    {
      icon: "Building2",
      title: "Commercial property",
      description:
        "Covers your shop, tools, inventory and equipment against fire, theft and many other covered events, at home or on-site.",
    },
    {
      icon: "Truck",
      title: "Commercial auto",
      description:
        "Insures vehicles used for work — deliveries, service calls or hauling gear — that a personal auto policy may exclude.",
    },
  ],

  benefitsTitle: "Why small businesses compare here",
  benefits: [
    {
      icon: "Wallet",
      title: "Built for small budgets",
      description:
        "Cover scaled to a solo operator or small team, so you pay for what you actually need — not enterprise extras.",
    },
    {
      icon: "FileCheck",
      title: "Fast quotes, instant certificates",
      description:
        "Get quotes online in minutes and download a certificate of insurance to share with clients, often on the spot.",
    },
    {
      icon: "BadgeCheck",
      title: "Meet client requirements",
      description:
        "Landlords, platforms and contracts often demand proof of cover — the right policy helps you qualify and win the work.",
    },
    {
      icon: "PiggyBank",
      title: "Bundle a BOP to save",
      description:
        "Combining liability and property in a Business Owner's Policy can lower your total cost versus buying each separately.",
    },
  ],

  processTitle: "Covered in four simple steps",
  process: [
    {
      title: "Tell us about your business",
      description:
        "Share your trade, rough revenue and team size — a couple of minutes is usually all it takes.",
    },
    {
      title: "Compare small-business quotes",
      description:
        "Review right-sized quotes side by side, with the coverages and limits laid out in plain English.",
    },
    {
      title: "Choose your coverage",
      description:
        "Pick the policy, limits and options that match how you work and what your contracts require.",
    },
    {
      title: "Get insured and covered",
      description:
        "Finalise with the insurer, then download your policy and certificate of insurance — often the same day.",
    },
  ],

  factorsTitle: "What affects your small business premium",
  factorsIntro:
    "Every quote is personalised. These are the details insurers weigh most when pricing a small-business policy.",
  factors: [
    {
      factor: "Industry & risk",
      detail:
        "A desk-based consultant is usually priced very differently from a contractor or food business, since the day-to-day risk isn't the same.",
    },
    {
      factor: "Revenue & employees",
      detail:
        "Higher sales and a bigger payroll generally raise premiums, since there's more activity and more people to cover.",
    },
    {
      factor: "Coverage & limits",
      detail:
        "The mix of policies you choose and how high you set your limits and deductibles both move the price up or down.",
    },
    {
      factor: "Location",
      detail:
        "Your state and even your neighbourhood affect rates through local rules, crime, weather and regional claim trends.",
    },
    {
      factor: "Claims history",
      detail:
        "A clean record often earns lower rates, while past claims may signal more risk and nudge premiums higher.",
    },
  ],

  faqs: [
    {
      q: "What insurance does a small business need?",
      a: "It depends on what you do, but general liability is the common starting point. Many small firms add a Business Owner's Policy, professional liability, or workers' compensation as they grow.",
    },
    {
      q: "What is a Business Owner's Policy (BOP)?",
      a: "A BOP bundles general liability and commercial property into a single policy. For many small businesses it's a simple, cost-effective way to buy two core coverages together.",
    },
    {
      q: "Do freelancers and sole proprietors need it?",
      a: "Often, yes. Clients and platforms frequently require proof of liability cover before they'll hire you, and a claim can hit personal finances hard without a policy in place.",
    },
    {
      q: "Do I need workers' compensation?",
      a: "Usually once you have employees. Most states require workers' comp when you hire staff, though the exact rules and thresholds vary, so check your state's requirements.",
    },
    {
      q: "How much does small business insurance cost?",
      a: "It varies with your industry, revenue, team size and coverage, but many small policies are affordable on a monthly basis. Comparing quotes is the best way to see your real price.",
    },
    {
      q: "How fast can I get a certificate of insurance?",
      a: "Often instantly. Once your policy is active you can typically download a certificate online and share it with a client or landlord right away.",
    },
  ],

  ctaTitle: "Get your small business insurance quote",
  ctaText:
    "Compare right-sized quotes for your trade in minutes, then download the certificate your clients need — free to compare, with no obligation.",
  fineprint:
    "AltFTool is not an insurance company or agency and does not sell insurance. Quotes, coverage, eligibility and pricing are set by the insurer and vary by state, industry and circumstances. Coverage examples are general; read each policy for exact terms.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1753351052617-62818ffc9173", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1753351052363-53ce102830eb",
      alt: "A small-business owner smiling in her coffee shop",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1753351052277-a7ff634f0bd5",
      alt: "Baristas ready for service behind the counter",
    },
  },

  seo: {
    title: "Small Business Insurance — Compare Quotes | AltFTool",
    description:
      "Compare small business insurance quotes for freelancers, LLCs and startups. Liability, BOP, workers' comp and more, with instant certificates.",
  },
};

export default smallBusinessInsurance;
