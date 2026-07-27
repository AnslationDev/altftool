import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDollarSign } from "lucide-react";
import HnReveal from "@/app/bops/housingneeds/_components/HnReveal";
import HnFaq from "@/app/bops/housingneeds/_components/HnFaq";
import JsonLd from "@/platform/seo/JsonLd";
import { absoluteUrl, createPageMetadata } from "@/platform/seo/generateMetadata";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import InsuranceHeader from "../_components/InsuranceHeader";
import InsuranceFooter from "../_components/InsuranceFooter";
import InsuranceIcon from "../_components/InsuranceIcon";
import { INSURANCE } from "../_data/insurance";
import "@/app/bops/housingneeds/housingneeds.css";
import "../insurance.css";
import "@/app/_altf/altf-brand.css";

const INSURANCE_BASE = "/bops/insurance";
const SLUG = "auto-insurance";

export const metadata = createPageMetadata({
  title: "Compare Auto Insurance Coverage and Costs",
  description:
    "Compare auto insurance coverage options, common discounts, cost factors, and quote considerations before choosing a policy.",
  path: `${INSURANCE_BASE}/${SLUG}`,
  keywords: [
    "auto insurance",
    "car insurance comparison",
    "auto insurance coverage",
    "car insurance costs",
  ],
  pageType: "business-ops-insurance",
});

// Neutral, general explanations of standard US auto coverage. No pricing, no
// savings figures and no provider claims: AltFTool does not sell insurance and
// has no rate data of its own, so nothing here may imply otherwise.
const COVERAGE = [
  {
    icon: "Scale",
    title: "Liability",
    description:
      "Pays for injuries and property damage you cause to other people. Nearly every state sets a required minimum, and those minimums are often lower than the cost of a serious accident.",
  },
  {
    icon: "Car",
    title: "Collision",
    description:
      "Pays to repair or replace your own vehicle after a collision, whoever was at fault, minus your deductible. Lenders and leasing companies usually require it.",
  },
  {
    icon: "Umbrella",
    title: "Comprehensive",
    description:
      "Covers damage that is not a collision — theft, fire, hail, flood, vandalism, falling objects and animal strikes — again subject to a deductible.",
  },
  {
    icon: "ShieldCheck",
    title: "Uninsured & underinsured motorist",
    description:
      "Steps in when the at-fault driver has no insurance, or not enough of it, to cover your costs. It is mandatory in some states and optional in others.",
  },
  {
    icon: "Ambulance",
    title: "Medical payments & PIP",
    description:
      "Pays medical costs for you and your passengers regardless of fault. Personal injury protection is the standard version in no-fault states and can extend to lost income.",
  },
  {
    icon: "Wrench",
    title: "Roadside & rental add-ons",
    description:
      "Optional extras such as towing, jump-starts, lockout help and a rental car while your vehicle is being repaired. They are priced separately from your core coverage.",
  },
];

const FACTORS = [
  {
    factor: "Your driving record",
    detail:
      "At-fault accidents, moving violations and a DUI conviction all raise premiums, and most insurers look back three to five years.",
  },
  {
    factor: "The vehicle itself",
    detail:
      "Repair and parts costs, theft rates, and safety and driver-assistance features all feed into what a given make, model and year costs to insure.",
  },
  {
    factor: "Where you keep it",
    detail:
      "Rating is local: claim frequency, theft, weather exposure, repair labour rates and litigation costs vary street by street, not just state by state.",
  },
  {
    factor: "Limits and deductible",
    detail:
      "Higher liability limits cost more. A higher deductible lowers the premium but raises what you pay out of pocket on every comprehensive or collision claim.",
  },
  {
    factor: "How much you drive",
    detail:
      "Annual mileage and whether the car is used for commuting, business or rideshare change the price. Some insurers offer low-mileage or pay-per-mile options.",
  },
  {
    factor: "Discounts and rating rules",
    detail:
      "Multi-policy, multi-car, safe-driver, good-student, telematics and paid-in-full discounts are common. Which rating factors an insurer may use is set by state law.",
  },
];

const PROCESS = [
  {
    title: "Decide your coverage first",
    description:
      "Pick your liability limits and deductible before you shop, then price that exact package everywhere. Quotes built on different limits are not comparable.",
  },
  {
    title: "Gather your details",
    description:
      "You will need the VIN, approximate annual mileage, licence numbers for every driver, and the declarations page of your current policy.",
  },
  {
    title: "Quote more than one source",
    description:
      "Rates for the same driver differ between insurers. Checking carriers directly, an independent agent and a comparison service gives you a real spread.",
  },
  {
    title: "Check the insurer, not just the price",
    description:
      "Confirm the company is licensed in your state with your state insurance department, and look at its complaint record and claims-handling reputation.",
  },
  {
    title: "Switch without a gap",
    description:
      "Start the new policy before you cancel the old one. Even a one-day lapse can raise future premiums and, in most states, is a licensing problem.",
  },
];

const FAQS = [
  {
    q: "How much auto insurance do I need?",
    a: "State minimums are a legal floor, not a recommendation — a single serious injury claim can exceed them. Many people carry liability limits high enough to cover the assets they would have to defend, and add collision and comprehensive if replacing the car out of pocket would hurt. Your state insurance department publishes the current required minimums.",
  },
  {
    q: "Does a higher deductible really lower my premium?",
    a: "Usually yes, because you are absorbing more of each claim. The trade-off is that you pay that amount every time you make a comprehensive or collision claim, so a deductible only makes sense if you could cover it immediately.",
  },
  {
    q: "Will my rate go up after a claim?",
    a: "It often does after an at-fault accident, though the effect varies by insurer, by state and by whether the claim was comprehensive or collision. Some insurers sell accident forgiveness that waives the first at-fault surcharge for qualifying drivers.",
  },
  {
    q: "Can I switch insurers in the middle of a policy term?",
    a: "In most cases yes. Cancelling early usually earns a pro-rata refund of unused premium, though some policies apply a short-rate cancellation fee — check your policy documents. Set the new policy's start date first so there is no day without coverage.",
  },
  {
    q: "Does AltFTool sell auto insurance?",
    a: "No. AltFTool is not an insurance company, agency or broker, and does not sell policies or quote rates. This page is general background reading so you can compare licensed insurers on your own terms.",
  },
];

const OTHER_INSURANCE = INSURANCE.slice(0, 6);

const SECTION_NAV = [
  { href: "#coverage", label: "Coverage" },
  { href: "#factors", label: "Pricing" },
  { href: "#how", label: "How to compare" },
  { href: "#faq", label: "FAQs" },
];

export default function AutoInsurancePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Business Ops", item: absoluteUrl("/bops") },
      { "@type": "ListItem", position: 2, name: "Insurance", item: absoluteUrl(INSURANCE_BASE) },
      {
        "@type": "ListItem",
        position: 3,
        name: "Auto Insurance",
        item: absoluteUrl(`${INSURANCE_BASE}/${SLUG}`),
      },
    ],
  };

  return (
    <div className="hn-app hn-shell" data-accent="sky">
      <JsonLd id={`insurance-${SLUG}`} data={[faqJsonLd, breadcrumbJsonLd]} />

      <InsuranceHeader navItems={SECTION_NAV} />

      <main>
        {/* ---------- hero ---------- */}
        <section className="hn-hero ins-hero">
          <span className="ins-hero-glow" aria-hidden="true" />
          <span className="ins-hero-grid" aria-hidden="true" />

          <div className="hn-hero-inner">
            <p className="hn-hero-eyebrow">Auto insurance</p>

            <h1>Auto insurance, explained before you shop</h1>

            <p className="hn-hero-sub">
              What each coverage type actually pays for, what moves the price, and what to check
              before you buy or switch. AltFTool does not sell insurance — this is background
              reading, not a quote.
            </p>

            <ul className="hn-hero-points">
              <li>
                <CheckCircle2 size={15} strokeWidth={2.4} />
                What each coverage type covers
              </li>
              <li>
                <CheckCircle2 size={15} strokeWidth={2.4} />
                The factors insurers price on
              </li>
              <li>
                <CheckCircle2 size={15} strokeWidth={2.4} />
                How to compare quotes fairly
              </li>
            </ul>

            <div className="hn-hero-actions">
              <a className="hn-btn hn-btn--ghost hn-btn--lg" href="#coverage">
                Start with coverage
              </a>
            </div>
          </div>

          <span className="hn-hero-scroll" aria-hidden="true">
            <span />
          </span>
        </section>

        {/* ---------- coverage ---------- */}
        <section className="hn-section" id="coverage">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">What&apos;s covered</p>
              <h2 className="hn-h2">The parts of an auto policy</h2>
              <p className="hn-lede">
                A car insurance policy is a bundle of separate coverages. Which ones are required,
                and which are worth buying, depends on your state, your vehicle and your finances.
              </p>
            </HnReveal>

            <div className="hn-grid hn-grid--3">
              {COVERAGE.map((item, index) => (
                <HnReveal key={item.title} className="hn-card ins-cover" delay={index * 60}>
                  <span className="hn-card-icon">
                    <InsuranceIcon name={item.icon} size={22} strokeWidth={2} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </HnReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- pricing factors ---------- */}
        <section className="hn-section hn-section--tint" id="factors">
          <div className="hn-wrap">
            <HnReveal>
              <p className="hn-eyebrow">Good to know</p>
              <h2 className="hn-h2">What affects your premium</h2>
              <p className="hn-lede">
                Every quote is personalised, and no two insurers weigh these the same way — which is
                why the cheapest company for one driver is rarely the cheapest for the next.
              </p>
            </HnReveal>

            <HnReveal as="dl" className="hn-factors">
              {FACTORS.map((item) => (
                <div className="hn-factor" key={item.factor}>
                  <dt>
                    <CircleDollarSign size={17} strokeWidth={2.2} />
                    {item.factor}
                  </dt>
                  <dd>{item.detail}</dd>
                </div>
              ))}
            </HnReveal>
          </div>
        </section>

        {/* ---------- how to compare ---------- */}
        <section className="hn-section" id="how">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">How to compare</p>
              <h2 className="hn-h2">Comparing quotes without guesswork</h2>
            </HnReveal>

            <div className="hn-steps">
              {PROCESS.map((step, index) => (
                <HnReveal key={step.title} className="hn-step" delay={index * 80}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </HnReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section className="hn-section hn-section--tint" id="faq">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">Questions</p>
              <h2 className="hn-h2">Auto insurance FAQs</h2>
            </HnReveal>

            <HnFaq faqs={FAQS} />

            <HnReveal>
              <p className="ins-finelegal">
                General information only — not insurance, legal or financial advice. Coverage
                requirements, availability, rating rules and pricing vary by state, by insurer and
                by your own circumstances. Check your policy documents and your state insurance
                department before making a decision.
              </p>
            </HnReveal>
          </div>
        </section>

        {/* ---------- other insurance types ---------- */}
        <section className="hn-section" id="other-insurance">
          <div className="hn-wrap">
            <HnReveal>
              <h2 className="hn-h2" style={{ fontSize: "1.35rem", marginTop: 0 }}>
                Other insurance types
              </h2>
            </HnReveal>

            <div className="hn-grid hn-grid--3" style={{ marginTop: "1.25rem" }}>
              {OTHER_INSURANCE.map((item, index) => (
                <HnReveal key={item.slug} delay={index * 40}>
                  <Link href={`${INSURANCE_BASE}/${item.slug}`} className="hn-xlink">
                    <span className="hn-xlink-icon">
                      <InsuranceIcon name={item.icon} size={18} strokeWidth={2} />
                    </span>
                    <span>
                      <strong>{item.name}</strong>
                      <span>{item.eyebrow}</span>
                    </span>
                    <ArrowRight size={16} strokeWidth={2.2} className="hn-xlink-arrow" />
                  </Link>
                </HnReveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <InsuranceFooter links={INSURANCE} activeSlug={SLUG} />
      <AltfLauncher />
    </div>
  );
}
