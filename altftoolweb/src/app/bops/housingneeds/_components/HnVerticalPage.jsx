import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDollarSign, Star } from "lucide-react";
import HnHeader from "./HnHeader";
import HnTrustBar from "./HnTrustBar";
import HnEmailCapture from "./HnEmailCapture";
import HnHeroOffer from "./HnHeroOffer";
import HnSubscribedGate from "./HnSubscribedGate";
import HnFaq from "./HnFaq";
import HnReveal from "./HnReveal";
import HnFooter from "./HnFooter";
import HnQuoteButton from "./HnQuoteButton";
import HnIcon from "./HnIcon";
import HnImage from "./HnImage";
import HnHeadline from "./HnHeadline";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import JsonLd from "@/platform/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "../_lib/seo";
import { VERTICALS, getVertical } from "../_data/verticals";
import { hnVerticalUrl } from "../_data/site";
import { fetchQuoteConfig, resolveQuoteAction } from "../_data/quoteConfig";

/**
 * The single shared layout for every HousingNeeds vertical.
 *
 * All seven routes render this component with a different slug — only the
 * route and the content change, never the structure. Section order is fixed
 * here so the pages stay visually identical.
 *
 * Server component. The only client islands are HnHeader (theme + drawer),
 * HnFaq (accordion) and HnReveal (scroll animation).
 */
export default async function HnVerticalPage({ slug }) {
  const vertical = getVertical(slug);

  if (!vertical) {
    throw new Error(
      `[housingneeds] Unknown vertical "${slug}". Known slugs: ${VERTICALS.map((v) => v.slug).join(", ")}`,
    );
  }

  const {
    name,
    accent,
    icon,
    eyebrow,
    headline,
    headlineAccent,
    subheadline,
    heroPoints = [],
    services = [],
    benefits = [],
    options,
    process = [],
    costFactors = [],
    faqs = [],
    images,
  } = vertical;

  // Quote action comes from the CMS Business Ops module when an admin has
  // configured this vertical, otherwise from the vertical's own content file.
  // fetchQuoteConfig never throws — it returns defaults on any failure — so an
  // unreachable Firestore degrades to the compiled-in CTA rather than breaking
  // the page or blanking its conversion element.
  const quoteConfig = await fetchQuoteConfig();
  const quoteAction = resolveQuoteAction(vertical, quoteConfig);

  const others = VERTICALS.filter((item) => item.slug !== slug);

  // In-page anchors rather than sibling verticals: navigation without an exit
  // from the funnel. Built from the same conditions that decide whether each
  // section renders at all, so a vertical missing a section never gets a link
  // to an id that isn't on the page.
  const sectionNav = [
    services.length > 0 && { href: "#services", label: "Services" },
    options?.items?.length > 0 && { href: "#options", label: "Options" },
    benefits.length > 0 && { href: "#benefits", label: "Benefits" },
    process.length > 0 && { href: "#process", label: "Process" },
    costFactors.length > 0 && { href: "#cost", label: "Costs" },
    faqs.length > 0 && { href: "#faq", label: "FAQs" },
  ].filter(Boolean);


  return (
    <div className="hn-app hn-shell" data-accent={accent}>
      <JsonLd id={`hn-faq-${slug}`} data={[buildFaqJsonLd(slug), buildBreadcrumbJsonLd(slug)]} />

      {/* Anchors, not sibling verticals: these are paid-campaign landing pages,
          so the header navigates WITHIN the page rather than offering exits.
          Cross-links to other verticals still exist for crawlers and browsing
          users, but only below the conversion CTA. */}
      <HnHeader quoteAction={quoteAction} navItems={sectionNav} />

      <main>
        {/* ---------- hero ---------- */}
        <section className="hn-hero">
          <div className="hn-hero-bg">
            <HnImage
              src={images?.hero?.src}
              /* Decorative here: the h1 and subheadline immediately below
                 already describe the subject, so alt would be duplicative. */
              alt=""
              sizes="100vw"
              priority
            />
          </div>
          <span className="hn-hero-scrim" aria-hidden="true" />
          <span className="hn-hero-tint" aria-hidden="true" />

          <HnHeroOffer
            pageKey={`vertical:${slug}`}
            source={`hero-${slug}`}
            heading={`Free ${name.toLowerCase()} quotes + savings kit — today`}
            subtext={`Enter your email for free ${name.toLowerCase()} quotes from vetted local pros, our home maintenance calendar, and limited-time offers — before you pay a cent.`}
          >
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
              <HnQuoteButton
                href={quoteAction.href}
                label={quoteAction.label}
                mode={quoteAction.mode}
                size="hn-btn--lg"
              />
              <a className="hn-btn hn-btn--ghost hn-btn--lg" href="#services">
                What this covers
              </a>
            </div>
          </HnHeroOffer>

          <span className="hn-hero-scroll" aria-hidden="true">
            <span />
          </span>
        </section>

        {/* ---------- trust bar ---------- */}
        <HnTrustBar />

        {/* ---------- services ---------- */}
        {services.length > 0 && (
          <section className="hn-section" id="services">
            <div className="hn-wrap">
              <HnReveal className="hn-head--center">
                <p className="hn-eyebrow">What this covers</p>
                <h2 className="hn-h2">{name} work, end to end</h2>
                <p className="hn-lede">
                  The jobs that fall under {name.toLowerCase()}, and what each one actually involves.
                </p>
              </HnReveal>

              <div className="hn-grid hn-grid--3">
                {services.map((service, index) => (
                  <HnReveal key={service.title} className="hn-card hn-card--service" delay={index * 60}>
                    {service.image?.src ? (
                      <HnImage
                        src={service.image.src}
                        alt={service.image.alt || ""}
                        ratio="landscape"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="hn-card-media"
                      >
                        <span className="hn-img-badge" aria-hidden="true">
                          <HnIcon name={service.icon} size={18} strokeWidth={2} />
                        </span>
                      </HnImage>
                    ) : (
                      // No photo sourced yet for this service — fall back to the
                      // icon tile so the card never renders a blank frame.
                      <span className="hn-card-icon">
                        <HnIcon name={service.icon} size={22} strokeWidth={2} />
                      </span>
                    )}

                    <div className="hn-card-body">
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>

                    {/* Same admin-configured action as the page CTA, so a
                        vertical set to phone mode gets tel: links here too. */}
                    <div className="hn-card-foot">
                      <HnQuoteButton
                        href={quoteAction.href}
                        label="Book Service"
                        mode={quoteAction.mode}
                        className="hn-btn hn-btn--primary hn-card-cta"
                      />
                    </div>
                  </HnReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- options / materials ---------- */}
        {options?.items?.length > 0 && (
          <section className="hn-section hn-section--tint" id="options">
            <div className="hn-wrap">
              <HnReveal className="hn-head--center">
                <p className="hn-eyebrow">Compare options</p>
                <h2 className="hn-h2">{options.title}</h2>
                <p className="hn-lede">{options.intro}</p>
              </HnReveal>

              <div className="hn-grid hn-grid--options">
                {options.items.slice(0, 4).map((item, index) => (
                  <HnReveal key={item.name} className="hn-option" delay={index * 70}>
                    <div className="hn-option-head">
                      <h3>{item.name}</h3>
                      <p className="hn-option-summary">{item.summary}</p>
                    </div>

                    <dl className="hn-option-meta">
                      <dt>Best for</dt>
                      <dd>{item.bestFor}</dd>
                      <dt>Typical life</dt>
                      <dd>{item.lifespan}</dd>
                    </dl>

                    {item.considerations?.length > 0 && (
                      <div className="hn-option-consider">
                        <p className="hn-option-consider-label">Good to know</p>
                        <ul>
                          {item.considerations.map((consideration) => (
                            <li key={consideration}>{consideration}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </HnReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- benefits: photo beside the payoff ---------- */}
        {benefits.length > 0 && (
          <section className="hn-section" id="benefits">
            <div className="hn-wrap hn-split">
              <HnReveal className="hn-split-media">
                <HnImage
                  src={images?.benefit?.src}
                  alt={images?.benefit?.alt}
                  ratio="portrait"
                  sizes="(max-width: 899px) 100vw, 50vw"
                />
              </HnReveal>

              <HnReveal delay={80}>
                <p className="hn-eyebrow">Why it matters</p>
                <h2 className="hn-h2">What good {name.toLowerCase()} work buys you</h2>

                <ul className="hn-split-list">
                  {benefits.map((benefit) => (
                    <li className="hn-split-item" key={benefit.title}>
                      <span className="hn-split-icon">
                        <HnIcon name={benefit.icon} size={19} strokeWidth={2} />
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

        {/* ---------- email capture: lead magnet beside the payoff ----------
            Wrapped so it disappears once the visitor has already given us their
            email (via this band or the hero offer) — no double ask. */}
        <HnSubscribedGate>
          <section className="hn-section" id="newsletter">
            <div className="hn-wrap">
              <HnReveal className="hn-email-band">
                <div>
                  <p className="hn-eyebrow">Free homeowner resource</p>
                  <h2>Planning a {name.toLowerCase()} project? Don&rsquo;t overpay.</h2>
                  <p className="hn-lede" style={{ margin: "0.75rem 0 0" }}>
                    Before you accept a single {name.toLowerCase()} quote, know
                    what fair really looks like. Our free maintenance calendar and
                    honest cost guides land straight in your inbox — so you spend
                    smart and never get talked into work you don&rsquo;t need.
                  </p>
                </div>
                {/* announce=false: this band showing its own success shouldn't
                    fire the event that would remove it mid-confirmation. */}
                <HnEmailCapture source={`vertical-${slug}`} announce={false} />
              </HnReveal>
            </div>
          </section>
        </HnSubscribedGate>

        {/* ---------- process ---------- */}
        {process.length > 0 && (
          <section className="hn-section hn-section--tint" id="process">
            <div className="hn-wrap">
              <HnReveal className="hn-head--center">
                <p className="hn-eyebrow">How the work happens</p>
                <h2 className="hn-h2">From first look to finished job</h2>
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

        {/* ---------- wide photo band ----------
            Only renders when the vertical has a third image; four of the seven
            do. Everything below reflows cleanly without it. */}
        {images?.detail?.src && (
          <section className="hn-section" style={{ paddingBottom: 0 }}>
            <div className="hn-wrap">
              <HnReveal className="hn-band">
                <HnImage
                  src={images.detail.src}
                  alt={images.detail.alt}
                  ratio="wide"
                  sizes="100vw"
                />
                <div className="hn-band-copy">
                  <h2>{name} done properly is invisible</h2>
                  <p>
                    Good work on a home is rarely the thing you notice — it is the leak that
                    never happens, the draught you stop feeling, the bill that stops climbing.
                  </p>
                </div>
              </HnReveal>
            </div>
          </section>
        )}

        {/* ---------- cost factors ---------- */}
        {costFactors.length > 0 && (
          <section className="hn-section" id="cost">
            <div className="hn-wrap">
              <HnReveal>
                <p className="hn-eyebrow">Budgeting</p>
                <h2 className="hn-h2">What moves the price</h2>
                <p className="hn-lede">
                  {name} quotes vary widely. These are the variables that explain most of the
                  difference between one estimate and another.
                </p>
              </HnReveal>

              <HnReveal as="dl" className="hn-factors">
                {costFactors.map((item) => (
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

        {/* ---------- social proof ---------- */}
        <section className="hn-section">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">Homeowners like you</p>
              <h2 className="hn-h2">Trusted for {name.toLowerCase()} projects across the U.S.</h2>
            </HnReveal>

            <div className="hn-testimonials">
              {[
                {
                  quote: `Compared three ${name.toLowerCase()} quotes in a day and picked the one that actually explained the work. Painless.`,
                  who: "Sarah K. — Ohio",
                },
                {
                  quote: "The guide told me exactly what drives the price, so I knew the quote I got was fair before I said yes.",
                  who: "Marcus T. — Texas",
                },
                {
                  quote: "Free to use, no pushy calls, and the pro we hired showed up when they said they would.",
                  who: "Linda R. — Florida",
                },
              ].map((t, index) => (
                <HnReveal key={t.who} className="hn-testimonial" delay={index * 60}>
                  <span className="hn-testimonial-stars" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={13} strokeWidth={0} fill="currentColor" />
                    ))}
                  </span>
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <footer>{t.who}</footer>
                </HnReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        {faqs.length > 0 && (
          <section className="hn-section hn-section--tint" id="faq">
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
        <section className="hn-section">
          <div className="hn-wrap">
            <HnReveal className="hn-cta">
              <h2>Ready to price up your {name.toLowerCase()} project?</h2>
              {/* Copy has to follow the mode: promising a redirect is wrong when
                  the configured action is a phone number. */}
              <p>
                {quoteAction.mode === "phone"
                  ? `Talk through the work described on this page and get a price for your ${name.toLowerCase()} project.`
                  : "Get a quote for the work described on this page. You will be taken to our quote partner to continue."}
              </p>
              <div className="hn-hero-actions">
                <HnQuoteButton
                  href={quoteAction.href}
                  label={quoteAction.label}
                  mode={quoteAction.mode}
                  size="hn-btn--lg"
                />
              </div>
            </HnReveal>
          </div>
        </section>

        {/* ---------- other verticals ---------- */}
        <section className="hn-section" id="other-services" style={{ paddingTop: 0 }}>
          <div className="hn-wrap">
            <HnReveal>
              <h2 className="hn-h2" style={{ fontSize: "1.35rem", marginTop: 0 }}>
                Other services
              </h2>
            </HnReveal>

            <div className="hn-grid hn-grid--3" style={{ marginTop: "1.25rem" }}>
              {others.map((item, index) => {
                return (
                  <HnReveal key={item.slug} delay={index * 40}>
                    <Link href={hnVerticalUrl(item.slug)} className="hn-xlink">
                      <span className="hn-xlink-icon">
                        <HnIcon name={item.icon} size={18} strokeWidth={2} />
                      </span>
                      <span>
                        <strong>{item.name}</strong>
                        <span>{item.eyebrow}</span>
                      </span>
                      <ArrowRight size={16} strokeWidth={2.2} className="hn-xlink-arrow" />
                    </Link>
                  </HnReveal>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <HnFooter activeSlug={slug} />
      <AltfLauncher />
    </div>
  );
}
