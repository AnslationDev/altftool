// Renters Insurance — content file for the Insurance module.
//
// Follows the canonical shape defined in home-insurance.js. Plain serialisable
// data only: no imports, no functions. Icon strings must exist in _lib/icons.js.

export const rentersInsurance = {
  slug: "renters-insurance",
  name: "Renters Insurance",
  accent: "amber",
  icon: "KeyRound",

  eyebrow: "Renters insurance",
  headline: "Your landlord's policy won't cover your stuff",
  headlineAccent: "won't cover your stuff",
  subheadline:
    "Your landlord insures the building — not your laptop, your couch or a guest's injury. Renters insurance fills that gap for the price of a couple of coffees a month. Compare quotes and get proof of coverage fast.",
  heroPoints: [
    "Protects your belongings at home and away",
    "Liability cover if you're held responsible",
    "Often just $10-20 a month",
  ],
  heroStats: [
    { icon: "Wallet", label: "Budget-friendly cover" },
    { icon: "Clock", label: "Same-day proof" },
    { icon: "ShieldCheck", label: "Compare trusted insurers" },
  ],

  quoteLabel: "Compare quotes",
  quoteUrl: "#demo-only",

  coverageTitle: "What renters insurance covers",
  coverageIntro:
    "A renters policy is built around your belongings and your liability as a tenant. Here's what's typically included.",
  coverage: [
    {
      icon: "Sofa",
      title: "Personal belongings",
      description:
        "Replaces furniture, electronics and clothing if they're stolen or damaged by fire, smoke or certain water events.",
    },
    {
      icon: "ShieldCheck",
      title: "Liability protection",
      description:
        "Helps cover legal and repair costs if you're found responsible for injuring someone or damaging their property.",
    },
    {
      icon: "KeyRound",
      title: "Loss of use",
      description:
        "Pays for temporary housing and extra living costs if a covered event makes your rental unlivable for a while.",
    },
    {
      icon: "HeartPulse",
      title: "Guest medical",
      description:
        "Covers minor medical bills if a visitor is hurt in your home, regardless of who was at fault.",
    },
    {
      icon: "Luggage",
      title: "Belongings away from home",
      description:
        "Your covered items are often protected even while travelling or stored outside the rental, subject to limits.",
    },
    {
      icon: "Sparkles",
      title: "High-value items",
      description:
        "Jewellery, cameras or instruments can be scheduled with an endorsement so their full value is properly covered.",
    },
  ],

  benefitsTitle: "Why renters choose to compare here",
  benefits: [
    {
      icon: "PiggyBank",
      title: "Big peace of mind, small cost",
      description:
        "For roughly the price of a takeout meal each month, you can protect thousands of dollars of belongings.",
    },
    {
      icon: "Scale",
      title: "Compare trusted insurers",
      description:
        "See personalised renters quotes from several rated carriers side by side, without repeating your details.",
    },
    {
      icon: "BadgeCheck",
      title: "Meet your lease requirement",
      description:
        "Many landlords now require renters cover; a policy gives you the proof of insurance they ask for.",
    },
    {
      icon: "Wallet",
      title: "Bundle to save more",
      description:
        "Pairing renters with an auto policy from the same insurer can unlock a discount on both.",
    },
  ],

  processTitle: "Covered in four simple steps",
  process: [
    {
      title: "Estimate your belongings",
      description:
        "Add up roughly what it would cost to replace your furniture, electronics and other essentials.",
    },
    {
      title: "Compare quotes",
      description:
        "Review personalised renters quotes from multiple insurers, with limits and deductibles laid out clearly.",
    },
    {
      title: "Choose your coverage",
      description:
        "Pick the personal-property and liability limits that fit your belongings and your budget.",
    },
    {
      title: "Get your policy",
      description:
        "Finish with the insurer and download instant proof of coverage — often the very same day.",
    },
  ],

  factorsTitle: "What affects your renters premium",
  factorsIntro:
    "Renters insurance is affordable, but a few things still nudge your price up or down. These are the main ones.",
  factors: [
    {
      factor: "Coverage amount",
      detail:
        "The more personal-property coverage you choose, the higher the premium — so it pays to estimate your belongings realistically.",
    },
    {
      factor: "Deductible",
      detail:
        "A higher deductible usually lowers your monthly cost, but means paying more out of pocket before a claim kicks in.",
    },
    {
      factor: "Location",
      detail:
        "Your city, neighbourhood and local risk of theft, fire or weather all influence what an insurer charges.",
    },
    {
      factor: "Liability limit",
      detail:
        "Raising your liability protection adds a little to the premium but can shield you from far larger costs.",
    },
    {
      factor: "Bundling & history",
      detail:
        "Bundling with auto can lower your rate, while past claims may raise it, depending on the insurer.",
    },
  ],

  faqs: [
    {
      q: "What does renters insurance actually cover?",
      a: "It typically covers your personal belongings against theft, fire and certain water damage, your liability if you're held responsible for injury or damage, temporary living costs if your rental becomes unlivable, and minor guest medical bills.",
    },
    {
      q: "Doesn't my landlord's insurance cover my belongings?",
      a: "No. Your landlord's policy covers the building itself, not your personal property or your liability. If your things are stolen or damaged, only your own renters policy would help replace them.",
    },
    {
      q: "How much does renters insurance cost?",
      a: "It's one of the most affordable policies out there — often around $10 to $20 a month, though your exact price depends on your coverage amount, deductible and location.",
    },
    {
      q: "Is renters insurance required?",
      a: "It isn't required by law, but many landlords and property managers make it a condition of your lease. Even when it's optional, the low cost makes it worth considering.",
    },
    {
      q: "Does my policy cover my roommate?",
      a: "Usually only the named policyholder is covered. A roommate typically needs their own policy or to be added by name — check with the insurer before assuming they're protected.",
    },
    {
      q: "Does renters insurance cover floods?",
      a: "No. Standard renters policies exclude flood damage, which needs separate flood insurance. Some water damage, such as from a burst pipe, may be covered — read the policy for details.",
    },
  ],

  ctaTitle: "Get your renters insurance quote",
  ctaText:
    "Compare personalised renters quotes from trusted insurers in minutes — protect your belongings and liability for just a few dollars a month, with no obligation.",
  fineprint:
    "AltFTool is not an insurance company or agency and does not sell insurance. Quotes, coverage, eligibility and pricing are set by the insurer and vary by state and circumstances. Coverage examples are general; read each policy for exact terms.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1737737210863-387afd35344e", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1758523670969-dd1b1254062d",
      alt: "A couple carrying boxes into their new apartment",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1738168246881-40f35f8aba0a",
      alt: "A comfortably furnished apartment living room",
    },
  },

  seo: {
    title: "Renters Insurance — Compare Quotes | AltFTool",
    description:
      "Compare renters insurance quotes in minutes. Protect your belongings and liability for often $10-20 a month — your landlord's policy won't cover your stuff.",
  },
};

export default rentersInsurance;
