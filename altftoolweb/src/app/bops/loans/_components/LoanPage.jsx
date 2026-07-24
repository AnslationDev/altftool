import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDollarSign } from "lucide-react";
import HnReveal from "@/app/bops/housingneeds/_components/HnReveal";
import HnFaq from "@/app/bops/housingneeds/_components/HnFaq";
import HnHeadline from "@/app/bops/housingneeds/_components/HnHeadline";
import HnImage from "@/app/bops/housingneeds/_components/HnImage";
import JsonLd from "@/platform/seo/JsonLd";
import { absoluteUrl } from "@/platform/seo/generateMetadata";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import LoanHeader from "./LoanHeader";
import LoanFooter from "./LoanFooter";
import LoanQuoteButton from "./LoanQuoteButton";
import LoanIcon from "./LoanIcon";
import { LOANS, getLoan } from "../_data/loans";

const LOANS_BASE = "/bops/loans";

/**
 * The single shared layout for every Loans vertical.
 *
 * All twelve routes render this with a different slug — only the content
 * changes, never the structure. Photography is optional per vertical: when a
 * `images.hero/benefit/detail` src is present it renders (photo hero, a split
 * beside the benefits, a wide band); when absent the page falls back to the
 * image-free accent-gradient hero and the plain benefit grid. Feature cards
 * stay icon-driven either way.
 *
 * Server component. The only client islands are LoanHeader (theme + drawer),
 * HnReveal (scroll animation) and HnFaq (accordion).
 */
export default function LoanPage({ slug }) {
  const loan = getLoan(slug);

  if (!loan) {
    throw new Error(
      `[loans] Unknown loan "${slug}". Known slugs: ${LOANS.map((l) => l.slug).join(", ")}`,
    );
  }

  const {
    name,
    accent,
    eyebrow,
    headline,
    headlineAccent,
    subheadline,
    heroPoints = [],
    heroStats = [],
    quoteLabel,
    quoteUrl,
    features = [],
    featuresTitle,
    featuresIntro,
    benefits = [],
    benefitsTitle,
    process = [],
    processTitle,
    rateFactors = [],
    rateTitle,
    rateIntro,
    faqs = [],
    ctaTitle,
    ctaText,
    fineprint,
    images,
    bandTitle,
    bandText,
  } = loan;

  const heroImage = images?.hero?.src;
  const benefitImage = images?.benefit?.src;
  const detailImage = images?.detail?.src;

  // Loan CTAs are outbound quote-partner links. Static for now (from the data
  // file); the same shape the CMS will later populate, so the pages don't
  // change when that lands.
  const quoteAction = { mode: "cta", label: quoteLabel, href: quoteUrl };

  const others = LOANS.filter((item) => item.slug !== slug).slice(0, 6);

  const sectionNav = [
    features.length > 0 && { href: "#features", label: "Overview" },
    benefits.length > 0 && { href: "#benefits", label: "Benefits" },
    process.length > 0 && { href: "#how", label: "How it works" },
    rateFactors.length > 0 && { href: "#rates", label: "Rates" },
    faqs.length > 0 && { href: "#faq", label: "FAQs" },
  ].filter(Boolean);

  const faqJsonLd = faqs.length > 0 && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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
      { "@type": "ListItem", position: 2, name: "Loans", item: absoluteUrl(LOANS_BASE) },
      { "@type": "ListItem", position: 3, name, item: absoluteUrl(`${LOANS_BASE}/${slug}`) },
    ],
  };

  return (
    <div className="hn-app hn-shell" data-accent={accent}>
      <JsonLd
        id={`loan-${slug}`}
        data={faqJsonLd ? [faqJsonLd, breadcrumbJsonLd] : [breadcrumbJsonLd]}
      />

      <LoanHeader quoteAction={quoteAction} navItems={sectionNav} />

      <main>
        {/* ---------- hero ---------- */}
        <section className="hn-hero loan-hero">
          {heroImage ? (
            <>
              {/* Photo hero: the accent gradient (.loan-hero) sits behind as the
                  load-in fallback; the scrim + accent tint keep the light-on-
                  dark hero type legible over any photo. */}
              <div className="hn-hero-bg">
                <HnImage src={heroImage} alt="" sizes="100vw" priority />
              </div>
              <span className="hn-hero-scrim" aria-hidden="true" />
              <span className="hn-hero-tint" aria-hidden="true" />
            </>
          ) : (
            <>
              <span className="loan-hero-glow" aria-hidden="true" />
              <span className="loan-hero-grid" aria-hidden="true" />
            </>
          )}

          <div className="hn-hero-inner">
            <p className="hn-hero-eyebrow">{eyebrow}</p>

            <h1>
              <HnHeadline text={headline} accent={headlineAccent} />
            </h1>

            <p className="hn-hero-sub">{subheadline}</p>

            {heroPoints.length > 0 && (
              <ul className="hn-hero-points">
                {heroPoints.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={15} strokeWidth={2.4} />
                    {point}
                  </li>
                ))}
              </ul>
            )}

            <div className="hn-hero-actions">
              <LoanQuoteButton
                href={quoteAction.href}
                label={quoteAction.label}
                mode={quoteAction.mode}
                size="hn-btn--lg"
              />
              <a className="hn-btn hn-btn--ghost hn-btn--lg" href="#how">
                See how it works
              </a>
            </div>

            {heroStats.length > 0 && (
              <ul className="loan-hero-stats">
                {heroStats.map((stat) => (
                  <li key={stat.label}>
                    <LoanIcon name={stat.icon} size={14} strokeWidth={2.2} />
                    {stat.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <span className="hn-hero-scroll" aria-hidden="true">
            <span />
          </span>
        </section>

        {/* ---------- features / overview ---------- */}
        {features.length > 0 && (
          <section className="hn-section" id="features">
            <div className="hn-wrap">
              <HnReveal className="hn-head--center">
                <p className="hn-eyebrow">What you get</p>
                <h2 className="hn-h2">{featuresTitle || `${name}s, made simple`}</h2>
                {featuresIntro && <p className="hn-lede">{featuresIntro}</p>}
              </HnReveal>

              <div className="hn-grid hn-grid--3">
                {features.map((feature, index) => (
                  <HnReveal
                    key={feature.title}
                    className="hn-card loan-feature"
                    delay={index * 60}
                  >
                    <span className="hn-card-icon">
                      <LoanIcon name={feature.icon} size={22} strokeWidth={2} />
                    </span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </HnReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- benefits (photo beside the payoff when available) ---------- */}
        {benefits.length > 0 && (
          <section className="hn-section hn-section--tint" id="benefits">
            <div className={`hn-wrap${benefitImage ? " hn-split" : ""}`}>
              {benefitImage && (
                <HnReveal className="hn-split-media">
                  <HnImage
                    src={benefitImage}
                    alt={images?.benefit?.alt}
                    ratio="portrait"
                    sizes="(max-width: 899px) 100vw, 50vw"
                  />
                </HnReveal>
              )}

              <HnReveal
                delay={benefitImage ? 80 : 0}
                className={benefitImage ? "" : "hn-head--center"}
              >
                <p className="hn-eyebrow">Why borrow with us</p>
                <h2 className="hn-h2">{benefitsTitle || "A smarter way to borrow"}</h2>

                <ul className="loan-benefit-list">
                  {benefits.map((benefit) => (
                    <li className="loan-benefit" key={benefit.title}>
                      <span className="loan-benefit-icon" aria-hidden="true">
                        <LoanIcon name={benefit.icon} size={20} strokeWidth={2} />
                      </span>
                      <div>
                        <h3>{benefit.title}</h3>
                        <p>{benefit.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </HnReveal>
            </div>
          </section>
        )}

        {/* ---------- process ---------- */}
        {process.length > 0 && (
          <section className="hn-section" id="how">
            <div className="hn-wrap">
              <HnReveal className="hn-head--center">
                <p className="hn-eyebrow">How it works</p>
                <h2 className="hn-h2">{processTitle || `From application to funds`}</h2>
              </HnReveal>

              <div className="hn-steps">
                {process.map((step, index) => (
                  <HnReveal key={step.title} className="hn-step" delay={index * 80}>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </HnReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- rate / eligibility factors ---------- */}
        {rateFactors.length > 0 && (
          <section className="hn-section hn-section--tint" id="rates">
            <div className="hn-wrap">
              <HnReveal>
                <p className="hn-eyebrow">Good to know</p>
                <h2 className="hn-h2">{rateTitle || "What affects your rate"}</h2>
                <p className="hn-lede">
                  {rateIntro ||
                    "Every offer is personalised. These are the factors lenders weigh most when they price your loan."}
                </p>
              </HnReveal>

              <HnReveal as="dl" className="hn-factors">
                {rateFactors.map((item) => (
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
        )}

        {/* ---------- wide photo band ---------- */}
        {detailImage && (
          <section className="hn-section" style={{ paddingBottom: 0 }}>
            <div className="hn-wrap">
              <HnReveal className="hn-band">
                <HnImage src={detailImage} alt={images?.detail?.alt} ratio="wide" sizes="100vw" />
                <div className="hn-band-copy">
                  <h2>{bandTitle || `${name}, without the guesswork`}</h2>
                  <p>
                    {bandText ||
                      "Compare real, personalised offers in one place and move forward with confidence — no pressure, no surprises, and no impact to your credit just to look."}
                  </p>
                </div>
              </HnReveal>
            </div>
          </section>
        )}

        {/* ---------- faq ---------- */}
        {faqs.length > 0 && (
          <section className="hn-section" id="faq">
            <div className="hn-wrap">
              <HnReveal className="hn-head--center">
                <p className="hn-eyebrow">Questions</p>
                <h2 className="hn-h2">{name} FAQs</h2>
              </HnReveal>

              <HnFaq faqs={faqs} />
            </div>
          </section>
        )}

        {/* ---------- cta ---------- */}
        <section className="hn-section hn-section--tint">
          <div className="hn-wrap">
            <HnReveal className="hn-cta">
              <h2>{ctaTitle || `See your ${name.toLowerCase()} options`}</h2>
              <p>
                {ctaText ||
                  "Check your rate in minutes. You'll be taken to our lending partner to continue — comparing options won't affect your credit score."}
              </p>
              <div className="hn-hero-actions">
                <LoanQuoteButton
                  href={quoteAction.href}
                  label={quoteAction.label}
                  mode={quoteAction.mode}
                  size="hn-btn--lg"
                />
              </div>
              {fineprint && <p className="loan-finelegal">{fineprint}</p>}
            </HnReveal>
          </div>
        </section>

        {/* ---------- other loan types ---------- */}
        <section className="hn-section" id="other-loans" style={{ paddingTop: 0 }}>
          <div className="hn-wrap">
            <HnReveal>
              <h2 className="hn-h2" style={{ fontSize: "1.35rem", marginTop: 0 }}>
                Other loan types
              </h2>
            </HnReveal>

            <div className="hn-grid hn-grid--3" style={{ marginTop: "1.25rem" }}>
              {others.map((item, index) => (
                <HnReveal key={item.slug} delay={index * 40}>
                  <Link href={`${LOANS_BASE}/${item.slug}`} className="hn-xlink">
                    <span className="hn-xlink-icon">
                      <LoanIcon name={item.icon} size={18} strokeWidth={2} />
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

      <LoanFooter links={LOANS} activeSlug={slug} />
      <AltfLauncher />
    </div>
  );
}
