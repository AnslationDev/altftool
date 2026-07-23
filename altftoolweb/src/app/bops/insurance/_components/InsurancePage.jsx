import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDollarSign } from "lucide-react";
import HnReveal from "@/app/bops/housingneeds/_components/HnReveal";
import HnFaq from "@/app/bops/housingneeds/_components/HnFaq";
import HnHeadline from "@/app/bops/housingneeds/_components/HnHeadline";
import HnImage from "@/app/bops/housingneeds/_components/HnImage";
import JsonLd from "@/platform/seo/JsonLd";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import InsuranceHeader from "./InsuranceHeader";
import InsuranceFooter from "./InsuranceFooter";
import InsuranceQuoteButton from "./InsuranceQuoteButton";
import InsuranceIcon from "./InsuranceIcon";
import { INSURANCE, getInsurance } from "../_data/insurance";

const INSURANCE_BASE = "/bops/insurance";
const SITE_ORIGIN = "https://altftool.com";

/**
 * The single shared layout for every Insurance vertical.
 *
 * All routes render this with a different slug — only the content changes,
 * never the structure. Photography is optional per vertical: when an
 * `images.hero/benefit/detail` src is present it renders (photo hero, a split
 * beside the benefits, a wide band); when absent the page falls back to the
 * image-free accent-gradient hero. Coverage/benefit cards stay icon-driven.
 *
 * Server component. The only client islands are InsuranceHeader (theme +
 * drawer), HnReveal (scroll animation) and HnFaq (accordion).
 */
export default function InsurancePage({ slug }) {
  const item = getInsurance(slug);

  if (!item) {
    throw new Error(
      `[insurance] Unknown insurance "${slug}". Known slugs: ${INSURANCE.map((i) => i.slug).join(", ")}`,
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
    coverage = [],
    coverageTitle,
    coverageIntro,
    benefits = [],
    benefitsTitle,
    process = [],
    processTitle,
    factors = [],
    factorsTitle,
    factorsIntro,
    faqs = [],
    ctaTitle,
    ctaText,
    fineprint,
    images,
    bandTitle,
    bandText,
  } = item;

  const heroImage = images?.hero?.src;
  const benefitImage = images?.benefit?.src;
  const detailImage = images?.detail?.src;

  // Insurance CTAs are outbound quote-partner links. Static for now (from the
  // data file); the same shape the CMS will later populate.
  const quoteAction = { mode: "cta", label: quoteLabel, href: quoteUrl };

  const others = INSURANCE.filter((x) => x.slug !== slug).slice(0, 6);

  const sectionNav = [
    coverage.length > 0 && { href: "#coverage", label: "Coverage" },
    benefits.length > 0 && { href: "#benefits", label: "Benefits" },
    process.length > 0 && { href: "#how", label: "How it works" },
    factors.length > 0 && { href: "#factors", label: "Pricing" },
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
      { "@type": "ListItem", position: 1, name: "Business Ops", item: `${SITE_ORIGIN}/bops` },
      { "@type": "ListItem", position: 2, name: "Insurance", item: `${SITE_ORIGIN}${INSURANCE_BASE}` },
      { "@type": "ListItem", position: 3, name, item: `${SITE_ORIGIN}${INSURANCE_BASE}/${slug}` },
    ],
  };

  return (
    <div className="hn-app hn-shell" data-accent={accent}>
      <JsonLd
        id={`insurance-${slug}`}
        data={faqJsonLd ? [faqJsonLd, breadcrumbJsonLd] : [breadcrumbJsonLd]}
      />

      <InsuranceHeader quoteAction={quoteAction} navItems={sectionNav} />

      <main>
        {/* ---------- hero ---------- */}
        <section className="hn-hero ins-hero">
          {heroImage ? (
            <>
              <div className="hn-hero-bg">
                <HnImage src={heroImage} alt="" sizes="100vw" priority />
              </div>
              <span className="hn-hero-scrim" aria-hidden="true" />
              <span className="hn-hero-tint" aria-hidden="true" />
            </>
          ) : (
            <>
              <span className="ins-hero-glow" aria-hidden="true" />
              <span className="ins-hero-grid" aria-hidden="true" />
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
              <InsuranceQuoteButton
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
              <ul className="ins-hero-stats">
                {heroStats.map((stat) => (
                  <li key={stat.label}>
                    <InsuranceIcon name={stat.icon} size={14} strokeWidth={2.2} />
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

        {/* ---------- coverage ---------- */}
        {coverage.length > 0 && (
          <section className="hn-section" id="coverage">
            <div className="hn-wrap">
              <HnReveal className="hn-head--center">
                <p className="hn-eyebrow">What's covered</p>
                <h2 className="hn-h2">{coverageTitle || `What ${name} covers`}</h2>
                {coverageIntro && <p className="hn-lede">{coverageIntro}</p>}
              </HnReveal>

              <div className="hn-grid hn-grid--3">
                {coverage.map((c, index) => (
                  <HnReveal key={c.title} className="hn-card ins-cover" delay={index * 60}>
                    <span className="hn-card-icon">
                      <InsuranceIcon name={c.icon} size={22} strokeWidth={2} />
                    </span>
                    <h3>{c.title}</h3>
                    <p>{c.description}</p>
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
                <p className="hn-eyebrow">Why AltFTool</p>
                <h2 className="hn-h2">{benefitsTitle || "Coverage you can count on"}</h2>

                <ul className="ins-benefit-list">
                  {benefits.map((benefit) => (
                    <li className="ins-benefit" key={benefit.title}>
                      <span className="ins-benefit-icon" aria-hidden="true">
                        <InsuranceIcon name={benefit.icon} size={20} strokeWidth={2} />
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
                <h2 className="hn-h2">{processTitle || "From quote to covered"}</h2>
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

        {/* ---------- premium / pricing factors ---------- */}
        {factors.length > 0 && (
          <section className="hn-section hn-section--tint" id="factors">
            <div className="hn-wrap">
              <HnReveal>
                <p className="hn-eyebrow">Good to know</p>
                <h2 className="hn-h2">{factorsTitle || "What affects your premium"}</h2>
                <p className="hn-lede">
                  {factorsIntro ||
                    "Every quote is personalised. These are the factors insurers weigh most when they price your coverage."}
                </p>
              </HnReveal>

              <HnReveal as="dl" className="hn-factors">
                {factors.map((f) => (
                  <div className="hn-factor" key={f.factor}>
                    <dt>
                      <CircleDollarSign size={17} strokeWidth={2.2} />
                      {f.factor}
                    </dt>
                    <dd>{f.detail}</dd>
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
                  <h2>{bandTitle || `${name}, made simple`}</h2>
                  <p>
                    {bandText ||
                      "Compare real quotes from trusted providers in one place and choose the coverage that fits — no pressure, no jargon, no obligation."}
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
              <h2>{ctaTitle || `Get your ${name.toLowerCase()} quote`}</h2>
              <p>
                {ctaText ||
                  "Compare quotes in minutes. You'll be taken to our insurance partner to continue — it's free, with no obligation."}
              </p>
              <div className="hn-hero-actions">
                <InsuranceQuoteButton
                  href={quoteAction.href}
                  label={quoteAction.label}
                  mode={quoteAction.mode}
                  size="hn-btn--lg"
                />
              </div>
              {fineprint && <p className="ins-finelegal">{fineprint}</p>}
            </HnReveal>
          </div>
        </section>

        {/* ---------- other insurance types ---------- */}
        <section className="hn-section" id="other-insurance" style={{ paddingTop: 0 }}>
          <div className="hn-wrap">
            <HnReveal>
              <h2 className="hn-h2" style={{ fontSize: "1.35rem", marginTop: 0 }}>
                Other insurance types
              </h2>
            </HnReveal>

            <div className="hn-grid hn-grid--3" style={{ marginTop: "1.25rem" }}>
              {others.map((x, index) => (
                <HnReveal key={x.slug} delay={index * 40}>
                  <Link href={`${INSURANCE_BASE}/${x.slug}`} className="hn-xlink">
                    <span className="hn-xlink-icon">
                      <InsuranceIcon name={x.icon} size={18} strokeWidth={2} />
                    </span>
                    <span>
                      <strong>{x.name}</strong>
                      <span>{x.eyebrow}</span>
                    </span>
                    <ArrowRight size={16} strokeWidth={2.2} className="hn-xlink-arrow" />
                  </Link>
                </HnReveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <InsuranceFooter links={INSURANCE} activeSlug={slug} />
      <AltfLauncher />
    </div>
  );
}
