// Medicare — content file for the Insurance module.
//
// Follows the canonical shape defined in home-insurance.js. Plain serialisable
// data only (no imports, no functions). Every `icon` value must exist in
// _lib/icons.js. Medicare is a U.S. federal program — AltFTool is not the
// government, not CMS, and not affiliated with Medicare; we help people compare
// private Medicare plan options and connect with licensed insurance agents.

export const medicare = {
  slug: "medicare",
  name: "Medicare",
  accent: "teal",
  icon: "HeartPulse",

  eyebrow: "Medicare plans",
  headline: "Find the Medicare plan that fits your life",
  headlineAccent: "fits your life",
  subheadline:
    "Turning 65 or already on Medicare? Compare Medicare Advantage, Medicare Supplement and Part D options side by side, and talk it through with a licensed agent before you decide.",
  heroPoints: [
    "Compare Advantage, Supplement and drug plans in one place",
    "Guidance from licensed, independent agents",
    "No cost to compare and no obligation to enroll",
  ],
  heroStats: [
    { icon: "Clock", label: "Compare in minutes" },
    { icon: "Users", label: "Licensed agents" },
    { icon: "Wallet", label: "Free to compare" },
  ],

  quoteLabel: "Compare plans",
  quoteUrl: "https://example.com/quote/medicare",

  coverageTitle: "The parts of Medicare, explained",
  coverageIntro:
    "Medicare is built from several parts and plan types. Here's what each one does, so you can see where a private plan may fill the gaps.",
  coverage: [
    {
      icon: "Cross",
      title: "Part A — hospital",
      description:
        "Covers inpatient hospital stays, skilled nursing, hospice and some home health care. Most people pay no premium for Part A.",
    },
    {
      icon: "Stethoscope",
      title: "Part B — medical",
      description:
        "Covers doctor visits, outpatient care, preventive services and durable medical equipment, typically for a monthly premium.",
    },
    {
      icon: "ShieldCheck",
      title: "Part C — Medicare Advantage",
      description:
        "Private all-in-one plans that bundle Parts A and B, and often add drug, dental, vision and hearing coverage.",
    },
    {
      icon: "Pill",
      title: "Part D — prescription drugs",
      description:
        "Standalone drug coverage that helps pay for prescriptions. Many Advantage plans include Part D built in.",
    },
    {
      icon: "Umbrella",
      title: "Medigap — Supplement",
      description:
        "Works alongside Original Medicare to help cover out-of-pocket gaps like deductibles, copays and coinsurance.",
    },
    {
      icon: "Heart",
      title: "Extra benefits",
      description:
        "Many Advantage plans add perks Original Medicare doesn't, such as dental, vision, hearing and fitness programs.",
    },
  ],

  benefitsTitle: "Why compare Medicare plans here",
  benefits: [
    {
      icon: "Scale",
      title: "See your options together",
      description:
        "Compare Medicare Advantage, Supplement and Part D plans side by side instead of piecing it together alone.",
    },
    {
      icon: "FileCheck",
      title: "Match your doctors and drugs",
      description:
        "Look for plans that cover the doctors you see and the prescriptions you take, based on your ZIP code.",
    },
    {
      icon: "DollarSign",
      title: "$0-premium plans in some areas",
      description:
        "Depending on where you live, some Medicare Advantage plans are available with a $0 monthly premium.",
    },
    {
      icon: "HeartHandshake",
      title: "Talk to a licensed agent",
      description:
        "Independent, licensed agents can answer questions and help you weigh plans — with no pressure to enroll.",
    },
  ],

  processTitle: "From questions to enrolled in four steps",
  process: [
    {
      title: "Tell us your situation",
      description:
        "Share your ZIP code, whether you're new to Medicare, and the doctors or prescriptions that matter to you.",
    },
    {
      title: "Compare your plans",
      description:
        "Review Advantage, Supplement and Part D options side by side, with costs and coverage laid out clearly.",
    },
    {
      title: "Review with a licensed agent",
      description:
        "Ask questions and get personalised guidance from a licensed agent who can explain the trade-offs.",
    },
    {
      title: "Enroll with confidence",
      description:
        "When you're ready, enroll in the plan you choose during a valid enrollment period — often the same day.",
    },
  ],

  factorsTitle: "What to consider when choosing a plan",
  factorsIntro:
    "The right Medicare plan depends on your health, your budget and your timing. These are the things worth weighing before you enroll.",
  factors: [
    {
      factor: "Your doctors & networks",
      detail:
        "Advantage plans use provider networks, so check that your preferred doctors and hospitals are in-network before you enroll.",
    },
    {
      factor: "Your prescriptions",
      detail:
        "Each drug plan has its own formulary. Confirm your medications are covered and compare what you'd pay for them.",
    },
    {
      factor: "Extra benefits",
      detail:
        "If dental, vision, hearing or fitness perks matter to you, look at which Advantage plans include them in your area.",
    },
    {
      factor: "Total costs",
      detail:
        "Weigh the monthly premium against deductibles, copays and out-of-pocket limits — the lowest premium isn't always the cheapest overall.",
    },
    {
      factor: "Enrollment timing",
      detail:
        "Your Initial Enrollment Period around age 65, the Annual Enrollment Period (Oct 15–Dec 7), and any Special Enrollment Periods all affect when you can join or switch.",
    },
  ],

  faqs: [
    {
      q: "What are the parts of Medicare?",
      a: "Part A covers hospital care and Part B covers medical care — together they're Original Medicare. Part C (Medicare Advantage) is a private all-in-one alternative, Part D adds prescription drug coverage, and Medigap helps cover out-of-pocket gaps.",
    },
    {
      q: "What's the difference between Medicare Advantage and a Supplement?",
      a: "Medicare Advantage (Part C) replaces Original Medicare with a private plan that usually has networks and often bundles extras like drug and dental coverage. A Medicare Supplement (Medigap) instead works alongside Original Medicare to help pay its out-of-pocket costs. A licensed agent can help you compare the two.",
    },
    {
      q: "When can I enroll in Medicare?",
      a: "Most people can first enroll during the seven-month window around their 65th birthday. After that, you can generally join or switch plans during the Annual Enrollment Period (Oct 15–Dec 7), or during a Special Enrollment Period if you qualify.",
    },
    {
      q: "Does Medicare cover prescriptions?",
      a: "Original Medicare (Parts A and B) doesn't include most prescription drugs. You can add coverage with a standalone Part D plan, or choose a Medicare Advantage plan that builds drug coverage in.",
    },
    {
      q: "How much does Medicare cost?",
      a: "It depends on the parts and plans you choose. Most people pay no premium for Part A, while Part B, Part D, Advantage and Supplement plans have their own premiums and out-of-pocket costs that vary by plan, state and your circumstances.",
    },
    {
      q: "Can I keep my own doctor?",
      a: "It depends on the plan. Original Medicare and most Supplement plans let you see any provider that accepts Medicare, while Medicare Advantage plans use networks — so check that your doctor is in-network before you enroll.",
    },
  ],

  ctaTitle: "Compare your Medicare options",
  ctaText:
    "See Medicare Advantage, Supplement and Part D plans in your area and review them with a licensed agent — free to compare, with no obligation to enroll.",
  fineprint:
    "AltFTool is not an insurance company, agency or the federal government, and is not affiliated with or endorsed by Medicare or CMS. We help you compare private Medicare plan options and connect with licensed insurance agents; plan availability, coverage, eligibility and pricing vary by insurer, state and individual circumstances.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1758686253692-2d6921de12dd", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1761839257647-df30867afd54",
      alt: "A retired couple relaxing together outdoors",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1771478752039-2f80ba167fcd",
      alt: "An older couple enjoying time by the ocean",
    },
  },

  seo: {
    title: "Medicare — Compare Advantage & Part D Plans | AltFTool",
    description:
      "Compare Medicare Advantage, Supplement and Part D plans side by side and review options with a licensed agent. Free to compare, with no obligation to enroll.",
  },
};

export default medicare;
