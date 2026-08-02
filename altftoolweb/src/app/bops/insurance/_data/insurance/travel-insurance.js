// Travel Insurance — content file for the Insurance module.
//
// Follows the canonical shape defined in home-insurance.js. Plain serialisable
// data only (no imports, no functions). Icon strings must exist in _lib/icons.js.

export const travelInsurance = {
  slug: "travel-insurance",
  name: "Travel Insurance",
  accent: "teal",
  icon: "Plane",

  eyebrow: "Travel insurance",
  headline: "Travel with a safety net, not your fingers crossed",
  headlineAccent: "a safety net",
  subheadline:
    "Travel insurance steps in when a trip goes sideways — a cancelled flight, a medical emergency abroad or a bag that never arrives. Compare plans from trusted providers and protect what you've already paid for.",
  heroPoints: [
    "Refund prepaid costs for covered cancellations",
    "Medical cover where your home plan may not reach",
    "Single-trip or annual multi-trip plans",
  ],
  heroStats: [
    { icon: "Clock", label: "Quotes in minutes" },
    { icon: "Globe", label: "Cover worldwide" },
    { icon: "Wallet", label: "Free to compare" },
  ],

  quoteLabel: "Compare quotes",
  quoteUrl: "https://example.com/quote/travel-insurance",

  coverageTitle: "What travel insurance covers",
  coverageIntro:
    "A typical plan bundles several protections into one policy. Covered reasons vary by plan, so it's worth reading the details before you buy.",
  coverage: [
    {
      icon: "CalendarClock",
      title: "Trip cancellation & interruption",
      description:
        "Reimburses prepaid, non-refundable costs if you have to cancel or cut a trip short for a covered reason.",
    },
    {
      icon: "Stethoscope",
      title: "Emergency medical & dental",
      description:
        "Helps pay for treatment if you fall ill or get hurt abroad, where your home health plan often won't apply.",
    },
    {
      icon: "Ambulance",
      title: "Medical evacuation",
      description:
        "Covers emergency transport to adequate care or back home when a serious situation calls for it.",
    },
    {
      icon: "Luggage",
      title: "Lost & delayed baggage",
      description:
        "Reimburses your belongings if bags are lost, stolen or damaged, and covers essentials while they're delayed.",
    },
    {
      icon: "Timer",
      title: "Travel-delay expenses",
      description:
        "Picks up meals, accommodation and other costs when a covered delay leaves you stranded en route.",
    },
    {
      icon: "LifeBuoy",
      title: "24/7 travel assistance",
      description:
        "Connects you to a live help line for medical referrals, rebooking and emergencies, any hour, anywhere.",
    },
  ],

  benefitsTitle: "Why travellers compare plans here",
  benefits: [
    {
      icon: "Wallet",
      title: "Protect your trip investment",
      description:
        "Flights, hotels and tours add up fast — cover lets you recover prepaid costs when a covered reason forces a change.",
    },
    {
      icon: "HeartPulse",
      title: "Medical cover abroad",
      description:
        "Get protection for emergencies overseas, where domestic health plans frequently offer little or no coverage.",
    },
    {
      icon: "Scale",
      title: "Single-trip or annual",
      description:
        "Choose one-off cover for a single holiday or a multi-trip plan if you travel several times a year.",
    },
    {
      icon: "ShieldCheck",
      title: "Add Cancel For Any Reason",
      description:
        "Many plans let you bolt on CFAR, an optional upgrade for a partial refund even outside standard covered reasons.",
    },
  ],

  processTitle: "From trip details to insured",
  process: [
    {
      title: "Enter your trip details",
      description:
        "Share destinations, dates, traveller ages and roughly what you've prepaid — it only takes a minute.",
    },
    {
      title: "Compare plans",
      description:
        "See quotes from trusted providers side by side, with limits and covered reasons laid out clearly.",
    },
    {
      title: "Choose your coverage",
      description:
        "Pick the level that fits your trip and add options like CFAR or adventure-sports cover if you need them.",
    },
    {
      title: "Get insured before you go",
      description:
        "Buy your plan and receive documents electronically — ideally soon after booking to unlock time-sensitive benefits.",
    },
  ],

  factorsTitle: "What affects your price",
  factorsIntro:
    "Every quote is tailored to your trip. These are the factors that most influence what a travel plan costs.",
  factors: [
    {
      factor: "Trip cost",
      detail:
        "Cancellation and interruption benefits are usually based on the prepaid amount you insure, so a pricier trip costs more to cover.",
    },
    {
      factor: "Traveller ages",
      detail:
        "Rates typically rise with age, since the likelihood and cost of a medical claim tend to increase.",
    },
    {
      factor: "Trip length & destination",
      detail:
        "Longer trips and higher-cost or higher-risk regions generally raise the premium compared with a short, nearby getaway.",
    },
    {
      factor: "Coverage level",
      detail:
        "Higher medical and baggage limits or lower deductibles increase the price; leaner limits bring it down.",
    },
    {
      factor: "Add-ons",
      detail:
        "Optional extras like Cancel For Any Reason or adventure-sports coverage add protection — and cost — on top of the base plan.",
    },
  ],

  faqs: [
    {
      q: "What does travel insurance cover?",
      a: "Most plans bundle trip cancellation and interruption, emergency medical and dental care abroad, medical evacuation, lost or delayed baggage, travel-delay costs and 24/7 assistance. The exact covered reasons vary by policy, so read the details.",
    },
    {
      q: "Is travel insurance worth it?",
      a: "It's usually worth it when you've prepaid a lot or are travelling internationally, where your home health plan may not apply. For a cheap, fully refundable domestic trip, the case is weaker.",
    },
    {
      q: "Does it cover illness or COVID-19?",
      a: "Many plans cover trip cancellation and emergency medical care for covered illnesses, and a lot now treat COVID-19 like any other sickness. Coverage varies, so confirm it in the policy before you buy.",
    },
    {
      q: "What is Cancel For Any Reason (CFAR)?",
      a: "CFAR is an optional upgrade that lets you cancel for reasons a standard plan wouldn't cover, usually for a partial refund. It typically must be added soon after booking and has its own rules.",
    },
    {
      q: "Are pre-existing conditions covered?",
      a: "Often yes, if you qualify for a pre-existing condition waiver — which many plans grant when you buy shortly after your first trip payment. Terms and time limits vary by insurer.",
    },
    {
      q: "When should I buy travel insurance?",
      a: "Soon after you book and make your first payment. Buying early unlocks time-sensitive benefits like pre-existing condition waivers and CFAR, and starts cancellation cover right away.",
    },
  ],

  ctaTitle: "Get your travel insurance quote",
  ctaText:
    "Compare travel plans from trusted providers in minutes — free to compare, with no obligation. Cover your next trip before you take off.",
  fineprint:
    "AltFTool is not an insurance company or agency and does not sell insurance. Quotes, coverage, covered reasons, eligibility and pricing are set by the insurer and vary by state and circumstances. Coverage examples are general; read each policy for exact terms.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1603792835233-f4f7c2497d4f", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1558413203-528a11565bf4",
      alt: "A traveler pulling a suitcase through the terminal",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1549894595-4698795b38ee",
      alt: "A traveler walking through the airport",
    },
  },

  seo: {
    title: "Travel Insurance — Trip Protection | AltFTool",
    description:
      "Compare travel insurance plans from trusted providers in minutes. Cover trip cancellation, emergency medical care abroad, lost baggage and delays.",
  },
};

export default travelInsurance;
