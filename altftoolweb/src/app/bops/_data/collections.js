// Business Ops collections — categories that hold pages directly (unlike
// Housing Needs, which has an extra vertical layer). Each renders a landing
// page at /bops/<slug> listing its pages. New pages are a one-line add here
// plus the page folder under src/app/bops/<slug>/<page>/.
//
// icon keys resolve to lucide components in _components/BizCollection.jsx.

export const BOPS_COLLECTIONS = {
  insurance: {
    slug: "insurance",
    name: "Insurance",
    icon: "shield",
    eyebrow: "Insurance",
    title: ["Coverage that ", "works for you"],
    lede:
      "Compare quotes and find better coverage without the runaround — across auto, home, life, health and more, from trusted, licensed providers.",
    headEyebrow: "Compare & save",
    headTitle: "Choose your coverage",
    headSub:
      "Pick a type of insurance to compare quotes — it's free, and there's no obligation.",
    comingSoon: null,
    pages: [
      {
        slug: "auto-insurance",
        name: "Auto Insurance",
        icon: "car",
        tagline: "Car insurance quotes",
        description:
          "Compare auto-insurance quotes across top carriers and see what you could save — in minutes, with no obligation.",
        href: "/bops/insurance/auto-insurance",
      },
      {
        slug: "home-insurance",
        name: "Home Insurance",
        icon: "home",
        tagline: "Homeowners coverage",
        description:
          "Protect your home, belongings and liability — and bundle with auto to save. Compare quotes from top-rated insurers.",
        href: "/bops/insurance/home-insurance",
      },
      {
        slug: "life-insurance",
        name: "Life Insurance",
        icon: "heart",
        tagline: "Protect your family",
        description:
          "Term and whole-life coverage that pays a tax-free benefit to your loved ones — lock in a low rate while you're young and healthy.",
        href: "/bops/insurance/life-insurance",
      },
      {
        slug: "medicare",
        name: "Medicare",
        icon: "pulse",
        tagline: "Plans for 65+",
        description:
          "Compare Medicare Advantage, Supplement and Part D plans with a licensed agent to find one that covers your doctors and prescriptions.",
        href: "/bops/insurance/medicare",
      },
      {
        slug: "health-insurance",
        name: "Health Insurance",
        icon: "stethoscope",
        tagline: "Individual & family",
        description:
          "Compare health plans and check whether you qualify for subsidies that lower your premium — coverage for doctors, meds and more.",
        href: "/bops/insurance/health-insurance",
      },
      {
        slug: "final-expense-insurance",
        name: "Final Expense Insurance",
        icon: "handheart",
        tagline: "Burial & final costs",
        description:
          "A small whole-life policy that covers funeral and end-of-life costs, with easy qualification and premiums that never rise.",
        href: "/bops/insurance/final-expense-insurance",
      },
      {
        slug: "renters-insurance",
        name: "Renters Insurance",
        icon: "key",
        tagline: "Protect your belongings",
        description:
          "Affordable coverage for your belongings and liability in a rented home — often just a few dollars a month.",
        href: "/bops/insurance/renters-insurance",
      },
      {
        slug: "pet-insurance",
        name: "Pet Insurance",
        icon: "paw",
        tagline: "Dogs & cats",
        description:
          "Help cover unexpected vet bills for accidents and illness, so cost never dictates your pet's care.",
        href: "/bops/insurance/pet-insurance",
      },
      {
        slug: "motorcycle-insurance",
        name: "Motorcycle Insurance",
        icon: "bike",
        tagline: "Bikes & riders",
        description:
          "Coverage for your motorcycle, your gear and your liability — ride legally and protected, with rider discounts.",
        href: "/bops/insurance/motorcycle-insurance",
      },
      {
        slug: "commercial-insurance",
        name: "Commercial Insurance",
        icon: "building",
        tagline: "Protect your business",
        description:
          "General liability, property, workers' comp and more — tailored coverage that meets client and legal requirements.",
        href: "/bops/insurance/commercial-insurance",
      },
      {
        slug: "small-business-insurance",
        name: "Small Business Insurance",
        icon: "store",
        tagline: "For small operators",
        description:
          "Simple, affordable coverage for freelancers, contractors and shops — with fast quotes and instant certificates.",
        href: "/bops/insurance/small-business-insurance",
      },
      {
        slug: "travel-insurance",
        name: "Travel Insurance",
        icon: "plane",
        tagline: "Trips & abroad",
        description:
          "Cover trip cancellation, medical emergencies abroad, lost bags and delays — and protect your trip investment.",
        href: "/bops/insurance/travel-insurance",
      },
      // Brand-style lander variants — provider-look pages whose layouts set
      // robots:noindex (page.noindex keeps them out of the sitemap).
      {
        slug: "shieldsure-auto",
        name: "ShieldSure Auto",
        icon: "car",
        tagline: "Auto cover, reimagined",
        description:
          "A modern take on car insurance — instant quotes, accident forgiveness and claims from your phone.",
        href: "/bops/insurance/shieldsure-auto",
        noindex: true,
      },
      {
        slug: "familyguard-life",
        name: "FamilyGuard Life",
        icon: "heart",
        tagline: "Legacy protection",
        description:
          "Traditional life cover with a human touch — advisors who know your name and terms that never surprise you.",
        href: "/bops/insurance/familyguard-life",
        noindex: true,
      },
      {
        slug: "homesafe-cover",
        name: "HomeSafe Cover",
        icon: "home",
        tagline: "House & contents cover",
        description:
          "Straight-talking home insurance — rebuild-cost cover, fast claims and a dedicated claim handler.",
        href: "/bops/insurance/homesafe-cover",
        noindex: true,
      },
      {
        slug: "medibright-health",
        name: "MediBright Health",
        icon: "stethoscope",
        tagline: "Health plans made friendly",
        description:
          "Clear health plans with $0 virtual visits, easy networks and pricing you can actually understand.",
        href: "/bops/insurance/medibright-health",
        noindex: true,
      },
      {
        slug: "pawcover",
        name: "PawCover",
        icon: "paw",
        tagline: "Pet insurance, simplified",
        description:
          "Accident and illness cover for dogs and cats with fast reimbursements and no surprise exclusions.",
        href: "/bops/insurance/pawcover",
        noindex: true,
      },
    ],
  },

  loans: {
    slug: "loans",
    name: "Loans",
    icon: "loan",
    eyebrow: "Loans",
    title: ["Borrow ", "smarter"],
    lede:
      "Compare loan options and rates across trusted lending partners to find the right fit — for your home, your car, your business or a personal goal.",
    headEyebrow: "Compare & save",
    headTitle: "Choose your loan type",
    headSub:
      "Pick a loan to compare personalised offers — it's free, and checking your rate won't affect your credit.",
    comingSoon: null,
    pages: [
      {
        slug: "personal-loan",
        name: "Personal Loan",
        icon: "wallet",
        tagline: "Fixed-rate, any purpose",
        description:
          "Borrow $1,000–$100,000 at a fixed rate for almost anything — consolidation, a big purchase or an emergency — funded in as little as a day.",
        href: "/bops/loans/personal-loan",
      },
      {
        slug: "debt-consolidation",
        name: "Debt Consolidation Loan",
        icon: "layers",
        tagline: "One simpler payment",
        description:
          "Roll multiple high-interest balances into a single fixed monthly payment and a clear payoff date — often at a lower rate.",
        href: "/bops/loans/debt-consolidation",
      },
      {
        slug: "home-mortgage",
        name: "Home Mortgage",
        icon: "home",
        tagline: "Buy your home",
        description:
          "Compare mortgage options and get pre-approved to shop with confidence — fixed or adjustable, with down payments to fit your budget.",
        href: "/bops/loans/home-mortgage",
      },
      {
        slug: "mortgage-refinance",
        name: "Mortgage Refinance",
        icon: "refresh",
        tagline: "Lower your rate",
        description:
          "Refinance to cut your rate, lower the payment, shorten the term, or tap your home equity with a cash-out refinance.",
        href: "/bops/loans/mortgage-refinance",
      },
      {
        slug: "heloc",
        name: "HELOC",
        icon: "piggy",
        tagline: "Tap home equity",
        description:
          "A revolving line of credit secured by your home — draw what you need, when you need it, and pay interest only on what you use.",
        href: "/bops/loans/heloc",
      },
      {
        slug: "auto-loan",
        name: "Auto Loan",
        icon: "car",
        tagline: "Finance your car",
        description:
          "Get pre-approved for a new or used car and shop like a cash buyer — compare rates and terms before you hit the lot.",
        href: "/bops/loans/auto-loan",
      },
      {
        slug: "auto-refinance",
        name: "Auto Refinance",
        icon: "repeat",
        tagline: "Cut your car payment",
        description:
          "Refinance your existing auto loan for a lower rate or payment, change the term, or remove a co-signer.",
        href: "/bops/loans/auto-refinance",
      },
      {
        slug: "business-loan",
        name: "Business Loan",
        icon: "building",
        tagline: "Fund your business",
        description:
          "Term loans, lines of credit and equipment financing for working capital, hiring or expansion — with fast decisions.",
        href: "/bops/loans/business-loan",
      },
      {
        slug: "sba-loan",
        name: "SBA Loan",
        icon: "landmark",
        tagline: "Government-backed",
        description:
          "SBA-backed financing with lower down payments, longer terms and competitive rates for real estate, expansion and more.",
        href: "/bops/loans/sba-loan",
      },
      {
        slug: "bad-credit-loan",
        name: "Bad Credit Loan",
        icon: "trending",
        tagline: "Options for lower scores",
        description:
          "Prequalify with a soft check and compare honest options across the credit spectrum — with a path to rebuild your credit.",
        href: "/bops/loans/bad-credit-loan",
      },
      {
        slug: "student-loan-refinance",
        name: "Student Loan Refinance",
        icon: "graduation",
        tagline: "Lower your student loans",
        description:
          "Combine your student loans into one payment and potentially lower your rate — choose your term, fixed or variable.",
        href: "/bops/loans/student-loan-refinance",
      },
      {
        slug: "credit-builder-loan",
        name: "Credit Builder Loan",
        icon: "gauge",
        tagline: "Build credit + savings",
        description:
          "Build payment history with small monthly payments reported to the bureaus — and get your savings back at the end.",
        href: "/bops/loans/credit-builder-loan",
      },
      // Brand-style lander variants — provider-look pages whose layouts set
      // robots:noindex (page.noindex keeps them out of the sitemap).
      {
        slug: "lendleap",
        name: "LendLeap",
        icon: "wallet",
        tagline: "Personal loans in a tap",
        description:
          "App-first personal loans — check your rate in 60 seconds and get funded as soon as today.",
        href: "/bops/loans/lendleap",
        noindex: true,
      },
      {
        slug: "homebridge-mortgage",
        name: "HomeBridge Mortgage",
        icon: "home",
        tagline: "Mortgages, minus the maze",
        description:
          "A guided path to your home loan — dedicated advisors, transparent fees and on-time closings.",
        href: "/bops/loans/homebridge-mortgage",
        noindex: true,
      },
      {
        slug: "autoloan-express",
        name: "AutoLoan Express",
        icon: "car",
        tagline: "Drive-away financing",
        description:
          "Fast-lane car financing — pre-approval in minutes, rates that beat the dealer's desk.",
        href: "/bops/loans/autoloan-express",
        noindex: true,
      },
      {
        slug: "bizfund-capital",
        name: "BizFund Capital",
        icon: "building",
        tagline: "Fuel for your business",
        description:
          "Working capital and equipment funding for makers and merchants — decisions in hours, not weeks.",
        href: "/bops/loans/bizfund-capital",
        noindex: true,
      },
      {
        slug: "clearpath-debt",
        name: "ClearPath Debt",
        icon: "layers",
        tagline: "One calm monthly payment",
        description:
          "Consolidate high-interest balances into one lower payment — and breathe again.",
        href: "/bops/loans/clearpath-debt",
        noindex: true,
      },
    ],
  },

  // Pet services — five standalone provider-style landers. `noindexPages`
  // marks the pages as noindex landers (each page's layout sets robots), so
  // the sitemap skips them.
  "pet-services": {
    slug: "pet-services",
    name: "Pet Services",
    icon: "paw",
    eyebrow: "Pet services",
    title: ["Care your pet ", "deserves"],
    lede:
      "Grooming, vet visits, walking, boarding and training — trusted local pet pros for every part of your pet's life, in one place.",
    headEyebrow: "Book & relax",
    headTitle: "Choose a service",
    headSub:
      "Pick a service to get a quote — it's free, fast and with no obligation.",
    comingSoon: null,
    noindexPages: true,
    pages: [
      {
        slug: "pawsome-grooming",
        name: "Pawsome Grooming",
        icon: "scissors",
        tagline: "Mobile pet grooming",
        description:
          "Salon-quality baths, cuts and nail trims — in a van that comes to your driveway.",
        href: "/bops/pet-services/pawsome-grooming",
      },
      {
        slug: "vetcare-plus",
        name: "VetCare+",
        icon: "stethoscope",
        tagline: "Mobile vet visits",
        description:
          "Licensed vets for checkups, vaccines and sick visits — at home, without the stressful car ride.",
        href: "/bops/pet-services/vetcare-plus",
      },
      {
        slug: "happy-tails",
        name: "Happy Tails",
        icon: "footprints",
        tagline: "Dog walking & pet sitting",
        description:
          "GPS-tracked walks and loving in-home sitting from vetted, insured walkers.",
        href: "/bops/pet-services/happy-tails",
      },
      {
        slug: "furry-stay",
        name: "FurryStay",
        icon: "bone",
        tagline: "Boarding & daycare",
        description:
          "Cage-free boarding and playful daycare with live cameras and daily report cards.",
        href: "/bops/pet-services/furry-stay",
      },
      {
        slug: "paw-academy",
        name: "PawAcademy",
        icon: "graduation",
        tagline: "Dog training & obedience",
        description:
          "Certified trainers for puppy basics, obedience and behaviour fixes — group or one-on-one.",
        href: "/bops/pet-services/paw-academy",
      },
    ],
  },

  // Legal services — provider-style landers (noindex; free-review + phone
  // leads). Copy must never promise outcomes or results.
  "legal-services": {
    slug: "legal-services",
    name: "Legal Services",
    icon: "gavel",
    eyebrow: "Legal services",
    title: ["Legal help, ", "when it matters"],
    lede:
      "From injury claims to immigration and estate planning — connect with the right legal help and get a free case review.",
    headEyebrow: "Free case reviews",
    headTitle: "Choose your legal matter",
    headSub:
      "Pick your situation to request a free, no-obligation case review.",
    comingSoon: null,
    noindexPages: true,
    pages: [
      {
        slug: "injuryadvocates",
        name: "InjuryAdvocates",
        icon: "scale",
        tagline: "Personal injury claims",
        description:
          "Hurt in an accident that wasn't your fault? Free case reviews — you pay nothing unless you win.",
        href: "/bops/legal-services/injuryadvocates",
        noindex: true,
      },
      {
        slug: "crashclaim",
        name: "CrashClaim Law",
        icon: "car",
        tagline: "Car accident lawyers",
        description:
          "After a crash, don't face the insurers alone — get your claim reviewed free within 24 hours.",
        href: "/bops/legal-services/crashclaim",
        noindex: true,
      },
      {
        slug: "shielddefense",
        name: "Shield Defense",
        icon: "shield",
        tagline: "Criminal & DUI defense",
        description:
          "Charged? Every hour counts. Confidential consultations with experienced defense attorneys.",
        href: "/bops/legal-services/shielddefense",
        noindex: true,
      },
      {
        slug: "familyfirst-law",
        name: "FamilyFirst Legal",
        icon: "heart",
        tagline: "Family law & divorce",
        description:
          "Divorce, custody and support handled with steadiness and care — talk to a family lawyer first.",
        href: "/bops/legal-services/familyfirst-law",
        noindex: true,
      },
      {
        slug: "visapath",
        name: "VisaPath Immigration",
        icon: "globe",
        tagline: "Immigration attorneys",
        description:
          "Green cards, work visas and citizenship — clear guidance for every step of your journey.",
        href: "/bops/legal-services/visapath",
        noindex: true,
      },
      {
        slug: "legacywills",
        name: "LegacyWills",
        icon: "scroll",
        tagline: "Wills & estate planning",
        description:
          "Wills, trusts and powers of attorney done properly — so your wishes are honoured.",
        href: "/bops/legal-services/legacywills",
        noindex: true,
      },
    ],
  },

  // Senior care — dignified provider-style landers (noindex; quote + phone).
  "senior-care": {
    slug: "senior-care",
    name: "Senior Care",
    icon: "handheart",
    eyebrow: "Senior care",
    title: ["Care for the people ", "who raised us"],
    lede:
      "Assisted living, in-home care, safety devices and mobility solutions — trusted options for every stage of ageing well.",
    headEyebrow: "Compassionate & vetted",
    headTitle: "Find the right support",
    headSub:
      "Pick a service to compare options and get a free consultation.",
    comingSoon: null,
    noindexPages: true,
    pages: [
      {
        slug: "goldenyears-living",
        name: "GoldenYears Living",
        icon: "home",
        tagline: "Assisted living finder",
        description:
          "Tour welcoming assisted-living communities matched to your budget, care needs and neighbourhood.",
        href: "/bops/senior-care/goldenyears-living",
        noindex: true,
      },
      {
        slug: "comfortcare-home",
        name: "ComfortCare at Home",
        icon: "handheart",
        tagline: "In-home care",
        description:
          "Kind, vetted caregivers for daily help at home — from a few hours a week to round-the-clock.",
        href: "/bops/senior-care/comfortcare-home",
        noindex: true,
      },
      {
        slug: "guardianalert",
        name: "GuardianAlert",
        icon: "bell",
        tagline: "Medical alert systems",
        description:
          "One-button help, fall detection and 24/7 response — independence with a safety net.",
        href: "/bops/senior-care/guardianalert",
        noindex: true,
      },
      {
        slug: "stairlift-solutions",
        name: "StairLift Solutions",
        icon: "accessibility",
        tagline: "Stairlifts & mobility",
        description:
          "Stairlifts, ramps and grab rails fitted fast — stay safely in the home you love.",
        href: "/bops/senior-care/stairlift-solutions",
        noindex: true,
      },
      {
        slug: "serenebaths",
        name: "SereneBaths",
        icon: "bath",
        tagline: "Walk-in tubs",
        description:
          "Low-threshold walk-in tubs with grab bars and heated seats — bathing made safe and serene.",
        href: "/bops/senior-care/serenebaths",
        noindex: true,
      },
      {
        slug: "memorylane-care",
        name: "MemoryLane Care",
        icon: "brain",
        tagline: "Memory & dementia care",
        description:
          "Specialised, patient memory-care support that honours who your loved one has always been.",
        href: "/bops/senior-care/memorylane-care",
        noindex: true,
      },
    ],
  },
};

export function getBopsCollection(slug) {
  return BOPS_COLLECTIONS[slug] ?? null;
}
