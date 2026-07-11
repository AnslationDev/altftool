// Case studies — challenge → strategy → results

// ── Brand Icon SVGs ──────────────────────────────────────────────────────────

/** NovaCart — e-commerce shopping cart icon */
const NovaCartIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="h-6 w-6" aria-label="NovaCart">
    <path
      d="M6 8h3.5l4.8 14.5a2 2 0 0 0 1.9 1.5h13a2 2 0 0 0 1.9-1.4L34 12H11"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="32" r="2.2" fill="#fff" />
    <circle cx="27" cy="32" r="2.2" fill="#fff" />
    <path d="M16 18h10M16 22h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
  </svg>
);

/** PrimePay — fintech lightning bolt / payment flash icon */
const PrimePayIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="h-6 w-6" aria-label="PrimePay">
    <rect x="8" y="10" width="24" height="17" rx="3" stroke="#fff" strokeWidth="2.2" />
    <path d="M8 15h24" stroke="#fff" strokeWidth="2.2" />
    <rect x="12" y="20" width="6" height="3" rx="1" fill="#fff" opacity="0.7" />
    <path
      d="M22 22l3-5h3l-3 4h3l-5 7 1-6h-2z"
      fill="#fff"
    />
  </svg>
);

/** Lumio Beauty — leaf / bloom icon */
const LumioBeautyIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="h-6 w-6" aria-label="Lumio Beauty">
    <path
      d="M20 32C20 32 10 26 10 17a10 10 0 0 1 10-10 10 10 0 0 1 10 10c0 9-10 15-10 15z"
      stroke="#fff"
      strokeWidth="2.2"
      fill="none"
    />
    <path
      d="M20 32V19M20 19c0 0-4-4-4-8M20 19c0 0 4-4 4-8"
      stroke="#fff"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.7"
    />
    <circle cx="20" cy="17" r="2.5" fill="#fff" opacity="0.9" />
  </svg>
);

// ── Data ─────────────────────────────────────────────────────────────────────

export const caseStudies = [
  {
    id: 1,
    client: "NovaCart",
    industry: "E-commerce",
    Icon: NovaCartIcon,
    accent: "from-brand to-brand-cyan",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    challenge:
      "A fast-scaling marketplace was burning ad budget with a ROAS under 1.4x and rising acquisition costs.",
    strategy:
      "Rebuilt the full-funnel with creative testing, aggressive remarketing and a tiered affiliate program.",
    results: [
      { label: "ROAS", value: "7.4x" },
      { label: "Revenue Growth", value: "+218%" },
      { label: "Traffic Increase", value: "+312%" },
      { label: "Lead Growth", value: "+165%" },
    ],
  },
  {
    id: 2,
    client: "PrimePay",
    industry: "Fintech",
    Icon: PrimePayIcon,
    accent: "from-brand-purple to-brand",
    image:
      "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=800&q=80",
    challenge:
      "A neobank needed a low-CPA channel to onboard verified users without sacrificing quality.",
    strategy:
      "Launched a performance affiliate network with fraud-proof tracking and partner-tier commissions.",
    results: [
      { label: "Partner Revenue", value: "$2.4M" },
      { label: "Cost per Lead", value: "-46%" },
      { label: "Affiliate Signups", value: "1,500+" },
      { label: "Conversion Rate", value: "+92%" },
    ],
  },
  {
    id: 3,
    client: "Lumio Beauty",
    industry: "D2C Beauty",
    Icon: LumioBeautyIcon,
    accent: "from-brand-cyan to-brand-purple",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    challenge:
      "An emerging skincare brand had strong products but near-zero organic visibility and weak retention.",
    strategy:
      "Built an SEO + content engine paired with lifecycle email automation and conversion optimization.",
    results: [
      { label: "Organic Traffic", value: "+312%" },
      { label: "Email Revenue", value: "31%" },
      { label: "Repeat Orders", value: "+68%" },
      { label: "Conversion Rate", value: "+54%" },
    ],
  },
];
