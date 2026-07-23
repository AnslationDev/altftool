"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Shield,
  Phone,
  Check,
  CheckCircle2,
  Bug,
  Rat,
  ClipboardCheck,
  SprayCan,
  CalendarCheck,
  BadgeCheck,
  Star,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import "./bugshield-pro.css";

const QUOTE_URL = "https://example.com/quote/bugshield-pro";
const PHONE_DISPLAY = "(833) 555-0119";
const PHONE_TEL = "tel:+18335550119";

function QuoteButton({ className = "bugshield-btn bugshield-btn-solid", children = "Get a Free Quote" }) {
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={className}>
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}

export default function BugShieldProPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const pests = [
    {
      icon: <Bug size={24} aria-hidden="true" />,
      name: "Ants",
      copy: "Colony-targeted baiting that eliminates trails at the source — not just the ones you can see.",
    },
    {
      icon: <Bug size={24} aria-hidden="true" />,
      name: "Roaches",
      copy: "Crack-and-crevice treatment plus growth regulators to break the breeding cycle for good.",
    },
    {
      icon: <Rat size={24} aria-hidden="true" />,
      name: "Rodents",
      copy: "Entry-point sealing, tamper-resistant stations, and monitoring on every quarterly visit.",
    },
    {
      icon: <Shield size={24} aria-hidden="true" />,
      name: "Termites",
      copy: "Annual inspections and liquid barrier protection that guards the structure you live in.",
    },
  ];

  const plans = [
    {
      name: "Essential",
      price: "$39",
      featured: false,
      items: [
        "Quarterly perimeter treatments",
        "Ant, roach & spider coverage",
        "Interior service on request",
        "Re-treat FREE guarantee",
      ],
    },
    {
      name: "Complete",
      price: "$59",
      featured: true,
      items: [
        "Everything in Essential",
        "Rodent stations & monitoring",
        "Wasp & hornet nest removal",
        "Seasonal pest forecasting",
        "Re-treat FREE guarantee",
      ],
    },
    {
      name: "Total Shield",
      price: "$89",
      featured: false,
      items: [
        "Everything in Complete",
        "Annual termite inspection",
        "Termite barrier protection",
        "Priority 24-hr scheduling",
        "Re-treat FREE guarantee",
      ],
    },
  ];

  const reviews = [
    {
      quote:
        "We had carpenter ants every spring for years. One season with BugShield Pro and they simply never came back.",
      name: "Danielle R. — Homeowner, 2 years on Complete",
    },
    {
      quote:
        "The technician found rodent entry points two other companies missed, sealed them the same day, and set monitoring stations.",
      name: "Marcus T. — Homeowner, 1 year on Complete",
    },
    {
      quote:
        "Roaches showed up between visits. One call, they re-treated within 48 hours at no charge. The guarantee is real.",
      name: "Priya S. — Homeowner, 3 years on Total Shield",
    },
  ];

  return (
    <div className="bugshield-page">
      {/* ---------- Nav ---------- */}
      <header className="bugshield-nav">
        <div className="bugshield-shell bugshield-nav-inner">
          <a href="#bugshield-top" className="bugshield-brand">
            <span className="bugshield-brand-mark">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>
            BugShield <span className="bugshield-brand-pro">Pro</span>
          </a>

          <nav aria-label="Page sections">
            <ul className={`bugshield-nav-links ${menuOpen ? "bugshield-nav-links--open" : ""}`}>
              <li><a href="#pests" onClick={() => setMenuOpen(false)}>Pests We Stop</a></li>
              <li><a href="#process" onClick={() => setMenuOpen(false)}>How It Works</a></li>
              <li><a href="#plans" onClick={() => setMenuOpen(false)}>Plans</a></li>
              <li><a href="#guarantee" onClick={() => setMenuOpen(false)}>Guarantee</a></li>
              <li><a href="#reviews" onClick={() => setMenuOpen(false)}>Reviews</a></li>
            </ul>
          </nav>

          <div className="bugshield-nav-ctas">
            <a href={PHONE_TEL} className="bugshield-btn bugshield-btn-ghost">
              <Phone size={16} aria-hidden="true" />
              <span className="bugshield-nav-phone-label">{PHONE_DISPLAY}</span>
            </a>
            <QuoteButton />
            <button
              type="button"
              className="bugshield-menu-btn"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <main id="bugshield-top">
        {/* ---------- Hero ---------- */}
        <section className="bugshield-hero">
          <div className="bugshield-shell bugshield-hero-grid">
            <div>
              <p className="bugshield-eyebrow">
                <BadgeCheck size={15} aria-hidden="true" />
                Quarterly Protection Plans
              </p>
              <h1>
                A pest-free home, <em>guaranteed</em> every season.
              </h1>
              <p className="bugshield-hero-sub">
                BugShield Pro puts a scheduled, science-driven barrier around your home four times a
                year — stopping ants, roaches, rodents, and termites before they get inside.
              </p>
              <ul className="bugshield-hero-checks">
                <li>
                  <CheckCircle2 size={20} className="bugshield-check" aria-hidden="true" />
                  Licensed, background-checked technicians
                </li>
                <li>
                  <CheckCircle2 size={20} className="bugshield-check" aria-hidden="true" />
                  Family- and pet-conscious treatment options
                </li>
                <li>
                  <CheckCircle2 size={20} className="bugshield-check" aria-hidden="true" />
                  Pests return between visits? We re-treat FREE
                </li>
              </ul>
              <div className="bugshield-hero-ctas">
                <QuoteButton />
                <a href={PHONE_TEL} className="bugshield-btn bugshield-btn-ghost">
                  <Phone size={16} aria-hidden="true" />
                  Call {PHONE_DISPLAY}
                </a>
              </div>
              <div className="bugshield-hero-stats">
                <div className="bugshield-stat">
                  <strong>25k+</strong>
                  <span>Homes protected</span>
                </div>
                <div className="bugshield-stat">
                  <strong>4.9/5</strong>
                  <span>Average rating</span>
                </div>
                <div className="bugshield-stat">
                  <strong>48 hr</strong>
                  <span>Re-treat response</span>
                </div>
              </div>
            </div>

            <div className="bugshield-hero-visual">
              <div className="bugshield-frame">
                <div className="bugshield-media bugshield-media--tall">
                  <img
                    src="https://images.unsplash.com/photo-1527359443443-84a48aec73d2?auto=format&fit=crop&w=1600&q=80"
                    alt="BugShield Pro technician in protective gear applying a perimeter pest treatment around a home"
                  />
                </div>
              </div>
              <div className="bugshield-badge-float">
                <ShieldCheck size={30} color="#0e9f6e" aria-hidden="true" />
                <div>
                  <strong>Re-Treat FREE Guarantee</strong>
                  <span>On every quarterly plan</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Pests ---------- */}
        <section id="pests" className="bugshield-section">
          <div className="bugshield-shell">
            <div className="bugshield-section-head">
              <p className="bugshield-kicker">Full-Spectrum Coverage</p>
              <h2>The pests we stop, cold</h2>
              <p>
                Every quarterly visit targets the season&apos;s most active invaders with
                treatments matched to your home&apos;s construction and surroundings.
              </p>
            </div>
            <div className="bugshield-pest-grid">
              {pests.map((pest) => (
                <article key={pest.name} className="bugshield-pest-card">
                  <div className="bugshield-pest-icon">{pest.icon}</div>
                  <h3>{pest.name}</h3>
                  <p>{pest.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Process ---------- */}
        <section id="process" className="bugshield-section bugshield-section--tint">
          <div className="bugshield-shell bugshield-process-grid">
            <div className="bugshield-frame">
              <div className="bugshield-media">
                <img
                  src="https://images.unsplash.com/photo-1575378064390-5a323bbac5d7?auto=format&fit=crop&w=900&q=80"
                  alt="Pest control specialist inspecting the interior of a home for signs of pest activity"
                  loading="lazy"
                />
              </div>
            </div>
            <div>
              <p className="bugshield-kicker">Precise, Every Time</p>
              <h2>How quarterly protection works</h2>
              <ol className="bugshield-steps">
                <li>
                  <span className="bugshield-step-num" aria-hidden="true">1</span>
                  <div>
                    <h3><ClipboardCheck size={16} aria-hidden="true" /> Inspect</h3>
                    <p>
                      A 32-point inspection maps entry points, nesting zones, and moisture risks
                      inside and out.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="bugshield-step-num" aria-hidden="true">2</span>
                  <div>
                    <h3><SprayCan size={16} aria-hidden="true" /> Treat</h3>
                    <p>
                      We apply a targeted barrier treatment, seal gaps, and remove webs, nests, and
                      harborage areas.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="bugshield-step-num" aria-hidden="true">3</span>
                  <div>
                    <h3><CalendarCheck size={16} aria-hidden="true" /> Protect</h3>
                    <p>
                      Automatic quarterly visits keep the barrier fresh as seasons — and pest
                      pressure — change.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="bugshield-step-num" aria-hidden="true">4</span>
                  <div>
                    <h3><ShieldCheck size={16} aria-hidden="true" /> Guarantee</h3>
                    <p>
                      See covered pests between visits? We come back and re-treat at no charge.
                      Ever.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* ---------- Plans ---------- */}
        <section id="plans" className="bugshield-section">
          <div className="bugshield-shell">
            <div className="bugshield-section-head">
              <p className="bugshield-kicker">Simple Quarterly Pricing</p>
              <h2>Pick your level of protection</h2>
              <p>
                No long-term contracts. Every plan is billed per quarterly visit and backed by the
                same re-treat FREE guarantee.
              </p>
            </div>
            <div className="bugshield-plan-grid">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`bugshield-plan ${plan.featured ? "bugshield-plan--featured" : ""}`}
                >
                  {plan.featured && <span className="bugshield-plan-flag">Most Popular</span>}
                  <h3>{plan.name}</h3>
                  <p className="bugshield-plan-price">
                    {plan.price}
                    <small> / quarter*</small>
                  </p>
                  <ul className="bugshield-plan-list">
                    {plan.items.map((item) => (
                      <li key={item}>
                        <Check size={17} className="bugshield-check" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <QuoteButton
                    className={`bugshield-btn ${plan.featured ? "bugshield-btn-solid" : "bugshield-btn-ghost"}`}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Guarantee band (mid-page CTA) ---------- */}
        <section id="guarantee" className="bugshield-guarantee">
          <div className="bugshield-shell bugshield-guarantee-grid">
            <div>
              <p className="bugshield-eyebrow">
                <ShieldCheck size={15} aria-hidden="true" />
                The BugShield Promise
              </p>
              <h2>Pests return? We re-treat FREE.</h2>
              <p>
                If covered pests show up between your scheduled quarterly visits, one call brings a
                technician back within 48 hours — at zero cost, no fine print, for as long as
                you&apos;re on a plan.
              </p>
              <div className="bugshield-hero-ctas">
                <QuoteButton className="bugshield-btn bugshield-btn-invert" />
                <a href={PHONE_TEL} className="bugshield-btn bugshield-btn-invert">
                  <Phone size={16} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
            <div className="bugshield-frame">
              <div className="bugshield-media">
                <img
                  src="https://images.unsplash.com/photo-1747659629851-a92bd71149f6?auto=format&fit=crop&w=900&q=80"
                  alt="Technician sealing an exterior entry point to keep pests out of a home"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Gallery ---------- */}
        <section className="bugshield-section">
          <div className="bugshield-shell">
            <div className="bugshield-section-head">
              <p className="bugshield-kicker">On the Job</p>
              <h2>Careful work, visible results</h2>
              <p>
                From crawl spaces to rooflines, our technicians treat your home like a clinical
                site — methodical, documented, and clean.
              </p>
            </div>
            <div className="bugshield-gallery-grid">
              <figure className="bugshield-photo-card">
                <div className="bugshield-media">
                  <img
                    src="https://images.unsplash.com/photo-1588470045344-4393b295297c?auto=format&fit=crop&w=900&q=80"
                    alt="Close-up of professional pest treatment equipment used on a quarterly service visit"
                    loading="lazy"
                  />
                </div>
                <figcaption>Commercial-grade equipment on every visit</figcaption>
              </figure>
              <figure className="bugshield-photo-card">
                <div className="bugshield-media">
                  <img
                    src="https://images.unsplash.com/photo-1591735115730-4bf3a351cfe8?auto=format&fit=crop&w=900&q=80"
                    alt="BugShield Pro technician applying a precise barrier treatment along a baseboard"
                    loading="lazy"
                  />
                </div>
                <figcaption>Precision baseboard and perimeter barriers</figcaption>
              </figure>
              <figure className="bugshield-photo-card">
                <div className="bugshield-media">
                  <img
                    src="https://images.unsplash.com/photo-1647376036543-f9f543601a1d?auto=format&fit=crop&w=900&q=80"
                    alt="Well-kept family home exterior protected by a quarterly pest control plan"
                    loading="lazy"
                  />
                </div>
                <figcaption>Protection that keeps homes looking their best</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ---------- Reviews ---------- */}
        <section id="reviews" className="bugshield-section bugshield-section--tint">
          <div className="bugshield-shell">
            <div className="bugshield-section-head">
              <p className="bugshield-kicker">Rated 4.9 out of 5</p>
              <h2>Homeowners who stopped worrying</h2>
              <p>Real plan members on what changed after their first BugShield Pro season.</p>
            </div>
            <div className="bugshield-review-grid">
              {reviews.map((review) => (
                <article key={review.name} className="bugshield-review">
                  <div className="bugshield-stars" aria-label="Rated 5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={16} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
                  <cite>{review.name}</cite>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="bugshield-final">
          <div className="bugshield-shell">
            <p className="bugshield-eyebrow">
              <BadgeCheck size={15} aria-hidden="true" />
              Free Quote &middot; No Obligation
            </p>
            <h2>Start your first protected season today</h2>
            <p>
              Get a same-day quote for quarterly protection against ants, roaches, rodents, and
              termites — backed by the re-treat FREE guarantee.
            </p>
            <div className="bugshield-final-ctas">
              <QuoteButton />
              <a href={PHONE_TEL} className="bugshield-btn bugshield-btn-ghost">
                <Phone size={16} aria-hidden="true" />
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="bugshield-footer">
        <div className="bugshield-shell bugshield-footer-inner">
          <span className="bugshield-brand">
            <span className="bugshield-brand-mark">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>
            BugShield <span className="bugshield-brand-pro">Pro</span>
          </span>
          <a href={PHONE_TEL}>
            <Phone size={15} aria-hidden="true" /> {PHONE_DISPLAY}
          </a>
          <p className="bugshield-footer-note">
            BugShield Pro is a fictional brand shown for demonstration. *Pricing shown is
            illustrative; final quote depends on home size and pest pressure. Independent service
            provider listing.
          </p>
        </div>
      </footer>
    </div>
  );
}
