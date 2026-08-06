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
  title: "Auto Insurance Coverage Guide",
  description:
    "Learn how auto insurance coverage works, what affects premiums, and how to compare licensed insurers without sharing personal information with ALTFTool.",
  path: `${INSURANCE_BASE}/${SLUG}`,
  keywords: ["auto insurance", "car insurance coverage", "insurance comparison guide"],
  pageType: "business-ops-insurance",
  noindex: true,
});

const COVERAGE = [
  {
    icon: "Scale",
    title: "Liability",
    description:
      "Pays for injuries or property damage you cause to other people, subject to policy limits and state rules.",
  },
  {
    icon: "Car",
    title: "Collision",
    description:
      "Pays to repair or replace your vehicle after a covered collision, minus your deductible.",
  },
  {
    icon: "Umbrella",
    title: "Comprehensive",
    description:
      "Covers eligible non-collision losses such as theft, fire, hail, vandalism, or animal strikes.",
  },
  {
    icon: "ShieldCheck",
    title: "Uninsured motorist",
    description:
      "May help when an at-fault driver has no insurance or insufficient coverage; availability varies by state.",
  },
  {
    icon: "Ambulance",
    title: "Medical payments and PIP",
    description:
      "Can cover eligible medical costs for you and passengers regardless of fault, depending on your state and policy.",
  },
  {
    icon: "Wrench",
    title: "Optional add-ons",
    description:
      "Roadside assistance, rental reimbursement, and similar extras are separate from core coverage.",
  },
];

const FACTORS = [
  ["Driving history", "Accidents and violations can affect pricing, although insurers and state rules differ."],
  ["Vehicle", "Repair costs, theft rates, safety features, make, model, and year can influence premiums."],
  ["Location", "Claim frequency, weather, theft, repair costs, and local regulations vary by area."],
  ["Limits and deductible", "Higher limits generally cost more; a higher deductible shifts more claim cost to you."],
  ["Vehicle use", "Annual mileage and personal, commuting, business, or rideshare use may be rated differently."],
  ["Discount rules", "Eligibility for multi-policy, safe-driver, telematics, and other discounts varies by insurer."],
];

const PROCESS = [
  ["Choose coverage first", "Use the same limits, deductibles, and optional coverages for every comparison."],
  ["Gather accurate details", "Keep vehicle, mileage, driver, and current-policy information ready, but share it only with a provider you choose."],
  ["Compare multiple sources", "Review written terms from licensed insurers or agents instead of relying on a headline price."],
  ["Verify the provider", "Check licensing and complaint information with your state insurance regulator."],
  ["Avoid a coverage gap", "Confirm the new policy is active before cancelling an existing policy."],
];

const FAQS = [
  {
    q: "How much auto insurance do I need?",
    a: "State minimums are legal requirements, not personalised recommendations. Consider your assets, vehicle value, ability to pay a deductible, and the cost of a serious claim, then confirm current rules with your state insurance regulator or a licensed professional.",
  },
  {
    q: "Does a higher deductible lower the premium?",
    a: "It often does, but it also increases what you pay after a covered collision or comprehensive loss. Choose an amount you could afford at short notice.",
  },
  {
    q: "Can I switch insurers during a policy term?",
    a: "Often yes, though fees and refunds depend on the policy. Make the new policy effective before cancelling the old one so coverage does not lapse.",
  },
  {
    q: "How can I verify an insurer?",
    a: "Use your state insurance department's official website to confirm licensing and review complaint information. Read the policy documents before paying.",
  },
  {
    q: "Does ALTFTool sell auto insurance or provide quotes?",
    a: "No. ALTFTool is not an insurer, insurance agency, or broker. It does not sell policies, provide rates, collect quote requests, or connect visitors with providers on this page.",
  },
];

const SECTION_NAV = [
  { href: "#coverage", label: "Coverage" },
  { href: "#factors", label: "Cost factors" },
  { href: "#compare", label: "Compare" },
  { href: "#faq", label: "FAQs" },
];

export default function AutoInsurancePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
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
        name: "Auto Insurance Guide",
        item: absoluteUrl(`${INSURANCE_BASE}/${SLUG}`),
      },
    ],
  };

  return (
    <div className="hn-app hn-shell" data-accent="sky">
      <JsonLd id={`insurance-${SLUG}`} data={[faqJsonLd, breadcrumbJsonLd]} />
      <InsuranceHeader navItems={SECTION_NAV} />

      <main>
        <section className="hn-hero ins-hero">
          <span className="ins-hero-glow" aria-hidden="true" />
          <span className="ins-hero-grid" aria-hidden="true" />
          <div className="hn-hero-inner">
            <p className="hn-hero-eyebrow">Independent educational guide</p>
            <h1>Auto insurance, explained before you shop</h1>
            <p className="hn-hero-sub">
              Learn what common coverage types mean, which factors can affect cost, and how to
              compare licensed providers. ALTFTool does not sell insurance or provide quotes.
            </p>
            <ul className="hn-hero-points">
              <li><CheckCircle2 size={15} strokeWidth={2.4} />Coverage basics</li>
              <li><CheckCircle2 size={15} strokeWidth={2.4} />Common pricing factors</li>
              <li><CheckCircle2 size={15} strokeWidth={2.4} />A safer comparison checklist</li>
            </ul>
            <div className="hn-hero-actions">
              <a className="hn-btn hn-btn--ghost hn-btn--lg" href="#coverage">Read the guide</a>
            </div>
          </div>
          <span className="hn-hero-scroll" aria-hidden="true"><span /></span>
        </section>

        <section className="hn-section" id="coverage">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">Coverage basics</p>
              <h2 className="hn-h2">The parts of an auto policy</h2>
              <p className="hn-lede">Requirements and availability depend on your state and policy.</p>
            </HnReveal>
            <div className="hn-grid hn-grid--3">
              {COVERAGE.map((item, index) => (
                <HnReveal key={item.title} className="hn-card ins-cover" delay={index * 60}>
                  <span className="hn-card-icon"><InsuranceIcon name={item.icon} size={22} strokeWidth={2} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </HnReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="hn-section hn-section--tint" id="factors">
          <div className="hn-wrap">
            <HnReveal>
              <p className="hn-eyebrow">Good to know</p>
              <h2 className="hn-h2">What can affect a premium</h2>
              <p className="hn-lede">Insurers weigh these factors differently and state rules vary.</p>
            </HnReveal>
            <HnReveal as="dl" className="hn-factors">
              {FACTORS.map(([factor, detail]) => (
                <div className="hn-factor" key={factor}>
                  <dt><CircleDollarSign size={17} strokeWidth={2.2} />{factor}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </HnReveal>
          </div>
        </section>

        <section className="hn-section" id="compare">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">Comparison checklist</p>
              <h2 className="hn-h2">Compare like with like</h2>
            </HnReveal>
            <div className="hn-steps">
              {PROCESS.map(([title, description], index) => (
                <HnReveal key={title} className="hn-step" delay={index * 80}>
                  <h3>{title}</h3><p>{description}</p>
                </HnReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="hn-section hn-section--tint" id="faq">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">Questions</p><h2 className="hn-h2">Auto insurance FAQs</h2>
            </HnReveal>
            <HnFaq faqs={FAQS} />
            <HnReveal>
              <p className="ins-finelegal">
                General educational information only — not insurance, legal, or financial advice.
                Verify current requirements with your state regulator and read the policy itself.
              </p>
            </HnReveal>
          </div>
        </section>

        <section className="hn-section" aria-labelledby="other-insurance-heading">
          <div className="hn-wrap">
            <HnReveal><h2 className="hn-h2" id="other-insurance-heading">Other insurance guides</h2></HnReveal>
            <div className="hn-grid hn-grid--3">
              {INSURANCE.slice(0, 6).map((item, index) => (
                <HnReveal key={item.slug} delay={index * 40}>
                  <Link href={`${INSURANCE_BASE}/${item.slug}`} className="hn-xlink">
                    <span className="hn-xlink-icon"><InsuranceIcon name={item.icon} size={18} strokeWidth={2} /></span>
                    <span><strong>{item.name}</strong><span>{item.eyebrow}</span></span>
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
