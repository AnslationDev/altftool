// Business Ops collections — categories that hold pages directly (unlike
// Housing Needs, which has an extra vertical layer). Each renders a landing
// page at /business-ops/<slug> listing its pages. New pages are a one-line add here
// plus the page folder under src/app/business-ops/<slug>/<page>/.
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
        href: "/business-ops/insurance/auto-insurance",
      },
      {
        slug: "home-insurance",
        name: "Home Insurance",
        icon: "home",
        tagline: "Homeowners coverage",
        description:
          "Protect your home, belongings and liability — and bundle with auto to save. Compare quotes from top-rated insurers.",
        href: "/business-ops/insurance/home-insurance",
      },
      {
        slug: "life-insurance",
        name: "Life Insurance",
        icon: "heart",
        tagline: "Protect your family",
        description:
          "Term and whole-life coverage that pays a tax-free benefit to your loved ones — lock in a low rate while you're young and healthy.",
        href: "/business-ops/insurance/life-insurance",
      },
      {
        slug: "medicare",
        name: "Medicare",
        icon: "pulse",
        tagline: "Plans for 65+",
        description:
          "Compare Medicare Advantage, Supplement and Part D plans with a licensed agent to find one that covers your doctors and prescriptions.",
        href: "/business-ops/insurance/medicare",
      },
      {
        slug: "health-insurance",
        name: "Health Insurance",
        icon: "stethoscope",
        tagline: "Individual & family",
        description:
          "Compare health plans and check whether you qualify for subsidies that lower your premium — coverage for doctors, meds and more.",
        href: "/business-ops/insurance/health-insurance",
      },
      {
        slug: "final-expense-insurance",
        name: "Final Expense Insurance",
        icon: "handheart",
        tagline: "Burial & final costs",
        description:
          "A small whole-life policy that covers funeral and end-of-life costs, with easy qualification and premiums that never rise.",
        href: "/business-ops/insurance/final-expense-insurance",
      },
      {
        slug: "renters-insurance",
        name: "Renters Insurance",
        icon: "key",
        tagline: "Protect your belongings",
        description:
          "Affordable coverage for your belongings and liability in a rented home — often just a few dollars a month.",
        href: "/business-ops/insurance/renters-insurance",
      },
      {
        slug: "pet-insurance",
        name: "Pet Insurance",
        icon: "paw",
        tagline: "Dogs & cats",
        description:
          "Help cover unexpected vet bills for accidents and illness, so cost never dictates your pet's care.",
        href: "/business-ops/insurance/pet-insurance",
      },
      {
        slug: "motorcycle-insurance",
        name: "Motorcycle Insurance",
        icon: "bike",
        tagline: "Bikes & riders",
        description:
          "Coverage for your motorcycle, your gear and your liability — ride legally and protected, with rider discounts.",
        href: "/business-ops/insurance/motorcycle-insurance",
      },
      {
        slug: "commercial-insurance",
        name: "Commercial Insurance",
        icon: "building",
        tagline: "Protect your business",
        description:
          "General liability, property, workers' comp and more — tailored coverage that meets client and legal requirements.",
        href: "/business-ops/insurance/commercial-insurance",
      },
      {
        slug: "small-business-insurance",
        name: "Small Business Insurance",
        icon: "store",
        tagline: "For small operators",
        description:
          "Simple, affordable coverage for freelancers, contractors and shops — with fast quotes and instant certificates.",
        href: "/business-ops/insurance/small-business-insurance",
      },
      {
        slug: "travel-insurance",
        name: "Travel Insurance",
        icon: "plane",
        tagline: "Trips & abroad",
        description:
          "Cover trip cancellation, medical emergencies abroad, lost bags and delays — and protect your trip investment.",
        href: "/business-ops/insurance/travel-insurance",
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
        href: "/business-ops/loans/personal-loan",
      },
      {
        slug: "debt-consolidation",
        name: "Debt Consolidation Loan",
        icon: "layers",
        tagline: "One simpler payment",
        description:
          "Roll multiple high-interest balances into a single fixed monthly payment and a clear payoff date — often at a lower rate.",
        href: "/business-ops/loans/debt-consolidation",
      },
      {
        slug: "home-mortgage",
        name: "Home Mortgage",
        icon: "home",
        tagline: "Buy your home",
        description:
          "Compare mortgage options and get pre-approved to shop with confidence — fixed or adjustable, with down payments to fit your budget.",
        href: "/business-ops/loans/home-mortgage",
      },
      {
        slug: "mortgage-refinance",
        name: "Mortgage Refinance",
        icon: "refresh",
        tagline: "Lower your rate",
        description:
          "Refinance to cut your rate, lower the payment, shorten the term, or tap your home equity with a cash-out refinance.",
        href: "/business-ops/loans/mortgage-refinance",
      },
      {
        slug: "heloc",
        name: "HELOC",
        icon: "piggy",
        tagline: "Tap home equity",
        description:
          "A revolving line of credit secured by your home — draw what you need, when you need it, and pay interest only on what you use.",
        href: "/business-ops/loans/heloc",
      },
      {
        slug: "auto-loan",
        name: "Auto Loan",
        icon: "car",
        tagline: "Finance your car",
        description:
          "Get pre-approved for a new or used car and shop like a cash buyer — compare rates and terms before you hit the lot.",
        href: "/business-ops/loans/auto-loan",
      },
      {
        slug: "auto-refinance",
        name: "Auto Refinance",
        icon: "repeat",
        tagline: "Cut your car payment",
        description:
          "Refinance your existing auto loan for a lower rate or payment, change the term, or remove a co-signer.",
        href: "/business-ops/loans/auto-refinance",
      },
      {
        slug: "business-loan",
        name: "Business Loan",
        icon: "building",
        tagline: "Fund your business",
        description:
          "Term loans, lines of credit and equipment financing for working capital, hiring or expansion — with fast decisions.",
        href: "/business-ops/loans/business-loan",
      },
      {
        slug: "sba-loan",
        name: "SBA Loan",
        icon: "landmark",
        tagline: "Government-backed",
        description:
          "SBA-backed financing with lower down payments, longer terms and competitive rates for real estate, expansion and more.",
        href: "/business-ops/loans/sba-loan",
      },
      {
        slug: "bad-credit-loan",
        name: "Bad Credit Loan",
        icon: "trending",
        tagline: "Options for lower scores",
        description:
          "Prequalify with a soft check and compare honest options across the credit spectrum — with a path to rebuild your credit.",
        href: "/business-ops/loans/bad-credit-loan",
      },
      {
        slug: "student-loan-refinance",
        name: "Student Loan Refinance",
        icon: "graduation",
        tagline: "Lower your student loans",
        description:
          "Combine your student loans into one payment and potentially lower your rate — choose your term, fixed or variable.",
        href: "/business-ops/loans/student-loan-refinance",
      },
      {
        slug: "credit-builder-loan",
        name: "Credit Builder Loan",
        icon: "gauge",
        tagline: "Build credit + savings",
        description:
          "Build payment history with small monthly payments reported to the bureaus — and get your savings back at the end.",
        href: "/business-ops/loans/credit-builder-loan",
      },
    ],
  },
};

export function getBopsCollection(slug) {
  return BOPS_COLLECTIONS[slug] ?? null;
}
