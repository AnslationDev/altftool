// Motorcycle Insurance — content file for the Insurance module.
//
// Follows the canonical shape defined in home-insurance.js. Plain serialisable
// data only: no imports, no functions. Icon strings must exist in _lib/icons.js.

export const motorcycleInsurance = {
  slug: "motorcycle-insurance",
  name: "Motorcycle Insurance",
  accent: "lime",
  icon: "Bike",

  eyebrow: "Motorcycle insurance",
  headline: "Ride protected, wherever the road takes you",
  headlineAccent: "wherever the road takes you",
  subheadline:
    "Motorcycle insurance protects your bike, your gear and your wallet if a crash, theft or claim comes your way — and keeps you legal to ride in most states. Compare quotes built for riders in minutes.",
  heroPoints: [
    "Cover your bike, yourself and your liability",
    "Add protection for custom parts and riding gear",
    "Compare rider-friendly quotes with no obligation",
  ],
  heroStats: [
    { icon: "Clock", label: "Quotes in minutes" },
    { icon: "ShieldCheck", label: "Highly rated insurers" },
    { icon: "Wallet", label: "Free to compare" },
  ],

  quoteLabel: "Compare quotes",
  quoteUrl: "#demo-only",

  coverageTitle: "What motorcycle insurance covers",
  coverageIntro:
    "A motorcycle policy works much like auto insurance, tailored to bikes, scooters and some powersports. Here's what a typical policy can include.",
  coverage: [
    {
      icon: "ShieldCheck",
      title: "Liability coverage",
      description:
        "Pays for injuries or property damage you cause to others in an at-fault accident — the part most states require to ride legally.",
    },
    {
      icon: "Bike",
      title: "Collision coverage",
      description:
        "Helps repair or replace your motorcycle after a crash with another vehicle or object, whoever was at fault.",
    },
    {
      icon: "Umbrella",
      title: "Comprehensive coverage",
      description:
        "Covers non-crash losses like theft, vandalism, fire and severe weather damage to your bike.",
    },
    {
      icon: "Users",
      title: "Uninsured motorist",
      description:
        "Steps in when a driver who hits you has no insurance or too little to cover your injuries and damage.",
    },
    {
      icon: "HeartPulse",
      title: "Medical payments",
      description:
        "Helps with medical bills for you and often a passenger after an accident, regardless of who caused it.",
    },
    {
      icon: "Wrench",
      title: "Custom parts & accessories",
      description:
        "Extends protection to upgrades, chrome, saddlebags and other add-ons that a standard policy may not fully cover.",
    },
  ],

  benefitsTitle: "Why riders compare here",
  benefits: [
    {
      icon: "BadgeCheck",
      title: "Ride legal and protected",
      description:
        "Meet your state's requirements and cover yourself, your bike and others in one straightforward policy.",
    },
    {
      icon: "Award",
      title: "Rider discounts",
      description:
        "Safety course completion, insuring multiple bikes and membership perks can often lower what you pay.",
    },
    {
      icon: "CalendarClock",
      title: "Seasonal lay-up options",
      description:
        "Many insurers offer lay-up coverage so you can adjust protection while your bike is stored for winter.",
    },
    {
      icon: "PiggyBank",
      title: "Bundle and save",
      description:
        "Combining your motorcycle with auto or home through one insurer may unlock some of the biggest discounts.",
    },
  ],

  processTitle: "From quote to covered in four steps",
  process: [
    {
      title: "Tell us about your bike",
      description:
        "Share your motorcycle's make, model and a little about your riding history — it takes just a minute.",
    },
    {
      title: "Compare quotes",
      description:
        "Review personalised quotes from highly rated insurers side by side, with coverage clearly laid out.",
    },
    {
      title: "Choose your coverage",
      description:
        "Pick the limits, deductible and extras that fit how and where you ride — and your budget.",
    },
    {
      title: "Get covered",
      description:
        "Finalise with the insurer and hit the road protected, often with documents delivered the same day.",
    },
  ],

  factorsTitle: "What affects your motorcycle premium",
  factorsIntro:
    "Every quote is personalised. These are the factors insurers typically weigh most when pricing a motorcycle policy.",
  factors: [
    {
      factor: "Riding record & experience",
      detail:
        "A clean record and years of riding experience usually help; recent accidents, tickets or claims tend to raise your rate.",
    },
    {
      factor: "Your bike",
      detail:
        "Engine size, type and value all matter — a sport bike or high-performance model often costs more to insure than a cruiser or scooter.",
    },
    {
      factor: "Age & location",
      detail:
        "Your age and where you live and store the bike affect risk, since theft rates, weather and traffic vary widely by area.",
    },
    {
      factor: "Coverage & deductible",
      detail:
        "Higher limits and add-ons raise the premium, while choosing a higher deductible lowers it but means paying more per claim.",
    },
    {
      factor: "Mileage & storage",
      detail:
        "How much you ride each year and whether the bike is garaged can move your rate up or down.",
    },
  ],

  faqs: [
    {
      q: "Is motorcycle insurance required?",
      a: "In most states you need at least liability coverage to ride legally. Requirements vary, so check the minimums where you live before you ride.",
    },
    {
      q: "What does motorcycle insurance cover?",
      a: "A typical policy can include liability, collision, comprehensive, uninsured motorist and medical payments. You can add coverage for custom parts, accessories and gear depending on the insurer.",
    },
    {
      q: "Does it cover my gear and accessories?",
      a: "Often, with the right coverage. Custom parts and accessories coverage can protect upgrades and riding gear that a base policy may not fully include — limits vary by insurer.",
    },
    {
      q: "How can I lower my premium?",
      a: "Completing an approved safety course, choosing a higher deductible, insuring multiple bikes and bundling with auto or home may all help reduce what you pay. Savings depend on the insurer and your situation.",
    },
    {
      q: "Does it cover passengers?",
      a: "It can, typically through your medical payments and liability coverage, though details and limits vary by policy and state. Confirm passenger protection with the insurer before you ride two-up.",
    },
    {
      q: "Can I pause coverage in winter?",
      a: "Many insurers offer lay-up options that reduce coverage while your bike is stored for the season. Keeping some comprehensive coverage can still protect against theft or damage during storage.",
    },
  ],

  ctaTitle: "Get your motorcycle insurance quote",
  ctaText:
    "Compare personalised quotes from highly rated insurers in minutes — free, with no obligation, and built around how you ride.",
  fineprint:
    "AltFTool is not an insurance company or agency and does not sell insurance. Quotes, coverage, eligibility and pricing are set by the insurer and vary by state and circumstances. Coverage examples are general; read each policy for exact terms.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1558981806-ec527fa84c39", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1590507022928-b8db9b188154",
      alt: "A motorcyclist riding on an open road",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1504160820508-da86e9dc8a28",
      alt: "A rider on a motorcycle along a scenic route",
    },
  },

  seo: {
    title: "Motorcycle Insurance — Compare Rider Quotes | AltFTool",
    description:
      "Compare motorcycle insurance quotes from highly rated insurers in minutes. Protect your bike, gear and liability — free to compare, with no obligation.",
  },
};

export default motorcycleInsurance;
