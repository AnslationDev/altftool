// Home Insurance — reference content file for the Insurance module.
//
// This is the canonical shape every insurance vertical follows. Fields:
//   slug            folder name under src/app/bops/insurance/ and the React key
//   name            display name (used in headings, e.g. "{name} FAQs")
//   accent          hn-app accent key: sky|teal|violet|emerald|amber|rose|orange|lime
//   icon            InsuranceIcon name (see _lib/icons.js) — used in cross-links
//   eyebrow         small label above the hero headline + cross-link subtitle
//   headline        hero H1 (plain text)
//   headlineAccent  a literal substring of headline, drawn in the accent colour
//   subheadline     one/two-sentence hero support line
//   heroPoints      3 short trust bullets
//   heroStats       3 trust chips [{ icon, label }]
//   quoteLabel      CTA button text (the conversion action)
//   quoteUrl        outbound quote-partner URL (placeholder until CMS-wired)
//   coverageTitle   optional; defaults to `What ${name} covers`
//   coverageIntro   optional lede under the coverage head
//   coverage        6 [{ icon, title, description }]
//   benefitsTitle   optional; defaults to "Coverage you can count on"
//   benefits        4 [{ icon, title, description }]
//   processTitle    optional; defaults to "From quote to covered"
//   process         4 [{ title, description }]
//   factorsTitle    optional; defaults to "What affects your premium"
//   factorsIntro    optional lede under the factors head
//   factors         5 [{ factor, detail }]
//   faqs            6 [{ q, a }]
//   ctaTitle/ctaText optional CTA band overrides
//   fineprint       small legal line under the CTA
//   images          optional { hero, benefit, detail } (added after sourcing)
//   seo             { title, description }

export const homeInsurance = {
  slug: "home-insurance",
  name: "Home Insurance",
  accent: "sky",
  icon: "Home",

  eyebrow: "Homeowners insurance",
  headline: "Protect the place that matters most",
  headlineAccent: "matters most",
  subheadline:
    "Homeowners insurance covers your house, your belongings and your liability — so a storm, a break-in or an accident doesn't turn into a financial disaster. Compare quotes from top-rated insurers in minutes.",
  heroPoints: [
    "Cover your home, belongings and liability",
    "Bundle with auto to save even more",
    "Compare quotes with no obligation",
  ],
  heroStats: [
    { icon: "Clock", label: "Quotes in minutes" },
    { icon: "ShieldCheck", label: "Top-rated insurers" },
    { icon: "Wallet", label: "Free to compare" },
  ],

  quoteLabel: "Get quotes",
  quoteUrl: "https://example.com/quote/home-insurance",

  coverageTitle: "What home insurance covers",
  coverageIntro:
    "A standard homeowners policy protects far more than the building itself. Here's what a typical policy includes.",
  coverage: [
    {
      icon: "Home",
      title: "Your home's structure",
      description:
        "Rebuilds or repairs the walls, roof and built-ins after a covered event like fire, wind or a burst pipe.",
    },
    {
      icon: "Sofa",
      title: "Personal belongings",
      description:
        "Covers furniture, electronics and clothing if they're stolen or damaged — at home and often while you travel.",
    },
    {
      icon: "ShieldCheck",
      title: "Liability protection",
      description:
        "Pays legal and medical costs if someone is injured on your property or you accidentally damage someone else's.",
    },
    {
      icon: "KeyRound",
      title: "Other structures",
      description:
        "Extends to detached structures on your lot, like a garage, fence or shed, that aren't attached to the house.",
    },
    {
      icon: "CalendarClock",
      title: "Loss of use",
      description:
        "Covers hotel bills and extra living costs if a covered loss makes your home temporarily uninhabitable.",
    },
    {
      icon: "HeartPulse",
      title: "Guest medical",
      description:
        "Pays minor medical bills for guests injured at your home, regardless of who was at fault.",
    },
  ],

  benefitsTitle: "Why compare home insurance here",
  benefits: [
    {
      icon: "Scale",
      title: "Compare top insurers",
      description:
        "See personalised quotes from multiple highly rated carriers side by side, all in one place.",
    },
    {
      icon: "PiggyBank",
      title: "Bundle and save",
      description:
        "Combine home and auto with the same insurer for one of the biggest discounts available.",
    },
    {
      icon: "BadgeCheck",
      title: "Coverage that fits",
      description:
        "Tailor your deductible and limits to your home's value and your budget — not a one-size policy.",
    },
    {
      icon: "Wallet",
      title: "Free, no obligation",
      description:
        "Comparing quotes is always free, and you're never locked in until you choose a policy.",
    },
  ],

  processTitle: "Covered in four simple steps",
  process: [
    {
      title: "Tell us about your home",
      description:
        "Share a few details about your property — its age, size and features take just a minute.",
    },
    {
      title: "Compare quotes",
      description:
        "Review personalised quotes from top-rated insurers side by side, with coverage clearly laid out.",
    },
    {
      title: "Choose your coverage",
      description:
        "Pick the policy, limits and deductible that fit your needs and your budget.",
    },
    {
      title: "Get covered",
      description:
        "Finalise with the insurer and your home is protected — often the very same day.",
    },
  ],

  factorsTitle: "What affects your home insurance premium",
  factorsIntro:
    "Every quote is personalised. These are the factors insurers weigh most when pricing a homeowners policy.",
  factors: [
    {
      factor: "Rebuild cost",
      detail:
        "Insurers price around what it would cost to rebuild your home today — not its market or resale value.",
    },
    {
      factor: "Location",
      detail:
        "Local risk of storms, wildfire, flooding and crime, plus how far you are from a fire station, all move the premium.",
    },
    {
      factor: "Age & condition",
      detail:
        "Older roofs, wiring and plumbing raise the odds of a claim, so a newer or well-maintained home usually costs less to insure.",
    },
    {
      factor: "Coverage & deductible",
      detail:
        "Higher limits raise the premium; choosing a higher deductible lowers it, but means paying more out of pocket per claim.",
    },
    {
      factor: "Claims history & credit",
      detail:
        "Your past claims and, in most states, your credit-based insurance score can both influence your rate.",
    },
  ],

  faqs: [
    {
      q: "What does home insurance actually cover?",
      a: "A standard policy covers your home's structure, your belongings, liability for injuries or damage you're responsible for, and extra living costs if your home becomes uninhabitable after a covered loss.",
    },
    {
      q: "Are floods and earthquakes covered?",
      a: "Usually not. Standard homeowners policies exclude flood and earthquake damage; those need a separate policy or endorsement, which you can also compare through us.",
    },
    {
      q: "How much coverage do I need?",
      a: "Enough to fully rebuild your home and replace your belongings, plus liability protection. Base your dwelling coverage on rebuild cost rather than market value.",
    },
    {
      q: "Will bundling with auto really save money?",
      a: "Often, yes. Bundling home and auto with one insurer is among the largest discounts available and frequently lowers the cost of both policies.",
    },
    {
      q: "Does my credit affect my rate?",
      a: "In most states insurers use a credit-based insurance score as one pricing factor, so a stronger score can mean a lower premium. A few states restrict or prohibit this.",
    },
    {
      q: "How fast can I get covered?",
      a: "Once you choose a policy you can often be covered the same day, with your documents delivered electronically.",
    },
  ],

  ctaTitle: "Get your home insurance quote",
  ctaText:
    "Compare personalised quotes from top-rated insurers in minutes — free, with no obligation, and no impact to your credit to look.",
  fineprint:
    "AltFTool is not an insurance company or agency and does not sell insurance. Quotes, coverage, eligibility and pricing are set by the insurer and vary by state and circumstances. Coverage examples are general; read each policy for exact terms.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1781269986378-a2f366df4d0f", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1780965149537-9ff475543fa6",
      alt: "A parent holding their baby outside a family home",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1773427657182-4776c4f5b363",
      alt: "A large family home with a manicured lawn",
    },
  },

  seo: {
    title: "Home Insurance — Compare Homeowners Quotes | AltFTool",
    description:
      "Compare homeowners insurance quotes from top-rated insurers in minutes. Protect your home, belongings and liability — free to compare, with no obligation.",
  },
};

export default homeInsurance;
