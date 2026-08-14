// Health Insurance — content file for the Insurance module.
//
// Follows the canonical shape defined in home-insurance.js. Plain serialisable
// data only: no imports, no functions. Every `icon` value must exist in
// _lib/icons.js.

export const healthInsurance = {
  slug: "health-insurance",
  name: "Health Insurance",
  accent: "emerald",
  icon: "Stethoscope",

  eyebrow: "Health insurance",
  headline: "Care you can afford when you need it most",
  headlineAccent: "when you need it most",
  subheadline:
    "Health insurance helps pay for doctor visits, hospital stays, prescriptions and emergencies for a monthly premium. Compare marketplace, employer and metal-tier plans in one place — and see any subsidies you may qualify for.",
  heroPoints: [
    "See plans that cover your doctors and medications",
    "Check whether you may qualify for subsidies",
    "Compare Bronze to Platinum tiers with no obligation",
  ],
  heroStats: [
    { icon: "Clock", label: "Compare in minutes" },
    { icon: "Percent", label: "Subsidies if eligible" },
    { icon: "Wallet", label: "Free to compare" },
  ],

  quoteLabel: "Compare plans",
  quoteUrl: "#demo-only",

  coverageTitle: "What health insurance covers",
  coverageIntro:
    "Most comprehensive plans share a core set of essential benefits. Here's what a typical health plan helps pay for.",
  coverage: [
    {
      icon: "Stethoscope",
      title: "Doctor & specialist visits",
      description:
        "Helps cover appointments with your primary care doctor and specialists, so routine and follow-up care stays affordable.",
    },
    {
      icon: "Ambulance",
      title: "Hospital & emergency care",
      description:
        "Pays a share of hospital stays, surgeries and emergency-room visits — the costs that hurt most without coverage.",
    },
    {
      icon: "Pill",
      title: "Prescription drugs",
      description:
        "Covers many medications on the plan's formulary, typically with a copay or coinsurance that varies by drug tier.",
    },
    {
      icon: "HeartPulse",
      title: "Preventive care",
      description:
        "Routine screenings, vaccines and annual check-ups are often covered at $0 when you use an in-network provider.",
    },
    {
      icon: "HandHeart",
      title: "Mental-health care",
      description:
        "Includes therapy, counselling and treatment for mental-health and substance-use conditions as an essential benefit.",
    },
    {
      icon: "Baby",
      title: "Maternity & newborn care",
      description:
        "Covers pregnancy, delivery and care for your newborn, from prenatal visits through the first weeks at home.",
    },
  ],

  benefitsTitle: "Why compare health plans here",
  benefits: [
    {
      icon: "Scale",
      title: "Plans and prices side by side",
      description:
        "Compare marketplace, employer and metal-tier plans in one view — premiums, deductibles and networks laid out clearly.",
    },
    {
      icon: "Percent",
      title: "See subsidies you may qualify for",
      description:
        "Based on your income and household size, you may qualify for savings that lower your monthly marketplace premium.",
    },
    {
      icon: "CheckCircle2",
      title: "Keep your doctors and meds",
      description:
        "Filter for plans whose networks include your providers and whose formularies cover the prescriptions you take.",
    },
    {
      icon: "ShieldCheck",
      title: "Guard against big bills",
      description:
        "An out-of-pocket maximum caps what you pay in a year, protecting you from ruinous costs after a major illness.",
    },
  ],

  processTitle: "From quote to covered in four steps",
  process: [
    {
      title: "Enter your info and ZIP",
      description:
        "Share your ZIP code, age, household size and estimated income — it takes about a minute to start.",
    },
    {
      title: "Compare plans and subsidies",
      description:
        "Review available plans side by side, along with any premium subsidies you may be eligible for.",
    },
    {
      title: "Pick a plan",
      description:
        "Choose the tier, network and deductible that fit how you use care and what you can budget each month.",
    },
    {
      title: "Enroll",
      description:
        "Complete enrollment with the insurer or marketplace and your coverage starts on the plan's effective date.",
    },
  ],

  factorsTitle: "What affects your health insurance premium",
  factorsIntro:
    "Marketplace pricing follows a defined set of rules. These are the main factors insurers can use when setting your premium.",
  factors: [
    {
      factor: "Age",
      detail:
        "Premiums generally rise with age, so older applicants typically pay more than younger ones for the same plan.",
    },
    {
      factor: "Location",
      detail:
        "Rates are set by state and rating area, reflecting local care costs and the insurers competing where you live.",
    },
    {
      factor: "Plan tier",
      detail:
        "Bronze plans have lower premiums but higher out-of-pocket costs; Gold and Platinum cost more monthly but pay a larger share of care.",
    },
    {
      factor: "Tobacco use",
      detail:
        "Many insurers may charge tobacco users a higher premium, within limits set by law, than non-users of the same age.",
    },
    {
      factor: "Household size & income",
      detail:
        "Your household size and income don't raise the sticker price, but they determine whether you qualify for subsidies that lower it.",
    },
  ],

  faqs: [
    {
      q: "What does health insurance cover?",
      a: "Comprehensive plans typically cover doctor and specialist visits, hospital and emergency care, prescriptions, preventive care, mental-health treatment and maternity care. Exact benefits and cost-sharing vary by plan.",
    },
    {
      q: "What's the difference between a premium, deductible and out-of-pocket max?",
      a: "The premium is what you pay monthly to keep coverage. The deductible is what you pay before the plan starts sharing costs. The out-of-pocket maximum caps your total spending in a year, after which the plan pays 100% of covered care.",
    },
    {
      q: "Can I get a subsidy to lower my premium?",
      a: "You may qualify for a premium subsidy on a marketplace plan depending on your income and household size. Eligibility isn't guaranteed — the estimate you see when comparing plans shows what you may receive.",
    },
    {
      q: "When can I enroll?",
      a: "For marketplace plans you can usually enroll during the annual Open Enrollment period, or during a Special Enrollment Period if you have a qualifying life event like losing coverage, moving, marriage or a new baby.",
    },
    {
      q: "Are pre-existing conditions covered?",
      a: "ACA-compliant plans can't deny you coverage or charge you more because of a pre-existing condition, and they can't exclude care related to it. Some short-term plans work differently, so check the plan type.",
    },
    {
      q: "How do plan networks work?",
      a: "An HMO usually keeps costs lower but limits you to in-network providers and referrals, while a PPO costs more and offers more flexibility to see out-of-network doctors. Check that your providers are in-network before enrolling.",
    },
  ],

  ctaTitle: "Find a health plan that fits",
  ctaText:
    "Compare marketplace, employer and metal-tier plans in minutes, check the subsidies you may qualify for, and enroll during Open Enrollment or a Special Enrollment Period — free, with no obligation.",
  fineprint:
    "AltFTool is not an insurance company, agency or marketplace and does not sell insurance. Plans, coverage, subsidy eligibility, enrollment periods and pricing are set by insurers and government marketplaces and vary by state and circumstances. Coverage examples are general; read each plan for exact terms.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1758691462123-8a17ae95d203", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1666886573531-48d2e3c2b684",
      alt: "A doctor reviewing results with a patient",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1584516150909-c43483ee7932",
      alt: "Healthcare professionals in a clinic",
    },
  },

  seo: {
    title: "Health Insurance — Compare Plans | AltFTool",
    description:
      "Compare health insurance plans in minutes — marketplace, employer and metal-tier options. See doctors and meds covered and any subsidies you may qualify for.",
  },
};

export default healthInsurance;
