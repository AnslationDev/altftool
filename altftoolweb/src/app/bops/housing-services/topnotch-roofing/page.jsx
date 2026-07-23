"use client";

import { useState } from "react";
import {
  Phone,
  Star,
  ShieldCheck,
  ClipboardCheck,
  Hammer,
  Droplets,
  ArrowRight,
  Menu,
  X,
  BadgeCheck,
} from "lucide-react";
import "./topnotch-roofing.css";

const QUOTE_URL = "https://example.com/quote/topnotch-roofing";
const PHONE_TEL = "tel:+18555550210";
const PHONE_DISPLAY = "(855) 555-0210";

const IMG = {
  hero: "https://images.unsplash.com/photo-1633759593085-1eaeb724fc88?auto=format&fit=crop&w=1600&q=80",
  crew: "https://images.unsplash.com/photo-1625512208347-8b6e3423b174?auto=format&fit=crop&w=1600&q=80",
  cardRepair: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=900&q=80",
  cardReplace: "https://images.unsplash.com/photo-1635424824800-692767998d07?auto=format&fit=crop&w=900&q=80",
  cardInspect: "https://images.unsplash.com/photo-1635424710928-0544e8512eae?auto=format&fit=crop&w=900&q=80",
};

function Crest({ big = false }) {
  return (
    <span className={big ? "topnotch-crest topnotch-crest--big" : "topnotch-crest"} aria-hidden="true">
      <span className="topnotch-crest-stars">&#9733; &#9733; &#9733;</span>
      <span className="topnotch-crest-name">TOPNOTCH</span>
      <span className="topnotch-crest-est">EST. 1962</span>
    </span>
  );
}

function QuoteButton({ variant = "red", className = "", children }) {
  return (
    <a
      className={`topnotch-btn topnotch-btn--${variant} ${className}`.trim()}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children || "Get a Free Quote"}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

function PhoneLink({ light = false }) {
  return (
    <a className={light ? "topnotch-phone-link topnotch-phone-link--light" : "topnotch-phone-link"} href={PHONE_TEL}>
      <Phone size={18} aria-hidden="true" />
      {PHONE_DISPLAY}
    </a>
  );
}

export default function TopNotchRoofingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const services = [
    {
      icon: Droplets,
      img: IMG.cardRepair,
      alt: "Roofer repairing shingles near a leak point on a residential roof",
      title: "Leak & Storm Repair",
      copy: "We trace leaks to the source before we quote, so you pay to fix the actual problem. Most straightforward repairs are completed in a single visit, weather permitting.",
    },
    {
      icon: Hammer,
      img: IMG.cardReplace,
      alt: "Crew installing new architectural shingles across a full roof slope",
      title: "Full Roof Replacement",
      copy: "Tear-off, deck check, underlayment, and shingles installed to manufacturer spec. We walk you through material options and honest trade-offs before any work begins.",
    },
    {
      icon: ClipboardCheck,
      img: IMG.cardInspect,
      alt: "Inspector examining roof flashing and shingle condition up close",
      title: "Honest Inspections",
      copy: "A photo-documented condition report of your roof, flashing, and gutters. If your roof has years left in it, we will tell you so — no invented urgency.",
    },
  ];

  const steps = [
    { num: "01", title: "Call or Request", copy: "Reach out by phone or the quote form. We ask a few questions about your roof and schedule a visit that suits you." },
    { num: "02", title: "Roof Walkthrough", copy: "A crew lead — not a salesperson — inspects your roof and shows you photos of what we find, good and bad." },
    { num: "03", title: "Clear Written Quote", copy: "Line-item pricing with material options. No pressure tactics; the quote is typically valid for 30 days." },
    { num: "04", title: "Tidy Build & Sweep", copy: "Magnetic nail sweeps and daily cleanup are standard. We treat your yard like our grandfather taught us to." },
  ];

  const reviews = [
    { quote: "They found that only one slope needed work and quoted exactly that. The crew was gone by dinner and the yard was spotless.", name: "Marta D., Homeowner" },
    { quote: "Third roofer we called, first one who put a ladder up before quoting. The written estimate matched the final bill to the dollar.", name: "Ray & June P." },
    { quote: "Storm damage handled fast, photos of everything, and they walked our insurance adjuster through the report. Old-school service.", name: "Deshawn W." },
  ];

  return (
    <div className="topnotch-page">
      <header className="topnotch-nav">
        <nav className="topnotch-nav-inner" aria-label="Main">
          <a className="topnotch-nav-brand" href="#top">
            <Crest />
            <span className="topnotch-nav-wordmark">
              TopNotch Roofing Co.
              <small>Third-Generation Craft</small>
            </span>
          </a>
          <button
            type="button"
            className="topnotch-nav-toggle"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          <div className={menuOpen ? "topnotch-nav-links topnotch-nav-links--open" : "topnotch-nav-links"}>
            <a className="topnotch-nav-link" href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a className="topnotch-nav-link" href="#process" onClick={() => setMenuOpen(false)}>Our Process</a>
            <a className="topnotch-nav-link" href="#reviews" onClick={() => setMenuOpen(false)}>Reviews</a>
            <PhoneLink />
            <QuoteButton className="topnotch-nav-cta" />
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="topnotch-hero">
          <div className="topnotch-wrap topnotch-hero-grid">
            <div>
              <p className="topnotch-kicker">&#9733; Family Roofers Since 1962 &#9733;</p>
              <h1>
                A Roof Built Like They <em>Used To Be</em>
              </h1>
              <p className="topnotch-hero-copy">
                TopNotch Roofing Co. is a third-generation family crew. We give honest inspections,
                keep job sites tidy, and build roofs meant to outlast the mortgage. Quotes are free,
                written, and typically in your hands within 24 hours of the roof walkthrough.
              </p>
              <div className="topnotch-hero-actions">
                <QuoteButton />
                <PhoneLink />
              </div>
              <ul className="topnotch-hero-points">
                <li><BadgeCheck size={16} aria-hidden="true" /> Licensed &amp; insured</li>
                <li><BadgeCheck size={16} aria-hidden="true" /> Photo-documented inspections</li>
                <li><BadgeCheck size={16} aria-hidden="true" /> Workmanship warranty included</li>
              </ul>
            </div>
            <div className="topnotch-hero-media">
              <Crest big />
              <figure className="topnotch-frame topnotch-frame--hero" style={{ margin: 0 }}>
                <div className="topnotch-frame-inner">
                  <img src={IMG.hero} alt="Roofing crew laying new shingle courses across a residential rooftop" />
                </div>
                <figcaption className="topnotch-frame-caption">On the ridge — the TopNotch crew at work</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <div className="topnotch-stripes" role="presentation" />

        <section className="topnotch-section topnotch-section--paper" id="services">
          <div className="topnotch-wrap">
            <header className="topnotch-section-head">
              <p className="topnotch-star-rule" aria-hidden="true">&#9733; &#9733; &#9733;</p>
              <h2>What We Do Best</h2>
              <p>Residential roofing, done right the first time. Every job starts with an honest look, not a sales pitch.</p>
            </header>
            <div className="topnotch-services-grid">
              {services.map(({ icon: Icon, img, alt, title, copy }) => (
                <article className="topnotch-service-card" key={title}>
                  <div className="topnotch-frame topnotch-frame--card">
                    <div className="topnotch-frame-inner">
                      <img src={img} alt={alt} loading="lazy" />
                    </div>
                  </div>
                  <div className="topnotch-service-body">
                    <h3><Icon size={22} aria-hidden="true" /> {title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="topnotch-band">
          <div className="topnotch-wrap topnotch-band-inner">
            <div>
              <h2>Not Sure What Your Roof Needs?</h2>
              <p>Start with a no-obligation quote. If a repair will do the job, that is what we will recommend.</p>
            </div>
            <div className="topnotch-band-actions">
              <QuoteButton variant="cream" />
              <PhoneLink light />
            </div>
          </div>
        </section>

        <section className="topnotch-section">
          <div className="topnotch-wrap topnotch-hero-grid">
            <figure className="topnotch-frame topnotch-frame--card" style={{ margin: 0 }}>
              <div className="topnotch-frame-inner">
                <img src={IMG.crew} alt="Experienced roofer fastening shingles by hand the traditional way" loading="lazy" />
              </div>
              <figcaption className="topnotch-frame-caption">Craft passed down since 1962</figcaption>
            </figure>
            <div>
              <p className="topnotch-kicker">&#9733; The Family Standard &#9733;</p>
              <h2 style={{ margin: "14px 0 16px", fontSize: "clamp(1.7rem, 3vw, 2.3rem)" }}>
                Three Generations. One Way of Working.
              </h2>
              <p className="topnotch-hero-copy">
                Grandpa started this outfit with a ladder, a level, and a rule: never sell a roof a
                house does not need. Sixty years on, our crew leads still climb every roof themselves,
                photograph what they find, and put every price in writing before a single shingle moves.
              </p>
              <div className="topnotch-hero-actions">
                <QuoteButton />
              </div>
            </div>
          </div>
        </section>

        <div className="topnotch-stripes" role="presentation" />

        <section className="topnotch-section topnotch-section--paper" id="process">
          <div className="topnotch-wrap">
            <header className="topnotch-section-head">
              <p className="topnotch-star-rule" aria-hidden="true">&#9733; &#9733; &#9733;</p>
              <h2>How a TopNotch Job Runs</h2>
              <p>Four steps, no surprises. You will know what is happening on your roof at every stage.</p>
            </header>
            <div className="topnotch-process-grid">
              {steps.map(({ num, title, copy }) => (
                <article className="topnotch-step" key={num}>
                  <p className="topnotch-step-num" aria-hidden="true">{num}</p>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="topnotch-section">
          <div className="topnotch-wrap">
            <header className="topnotch-section-head">
              <p className="topnotch-star-rule" aria-hidden="true">&#9733; &#9733; &#9733;</p>
              <h2>Our Stamped Promises</h2>
              <p>Plain-language commitments, honored on every job we take.</p>
            </header>
            <div className="topnotch-seals">
              <div className="topnotch-seal">
                <ShieldCheck size={26} aria-hidden="true" />
                <strong>Workmanship Warranty</strong>
                <span>In writing, every job</span>
              </div>
              <div className="topnotch-seal">
                <ClipboardCheck size={26} aria-hidden="true" />
                <strong>Honest Inspections</strong>
                <span>Photos, not pressure</span>
              </div>
              <div className="topnotch-seal">
                <Hammer size={26} aria-hidden="true" />
                <strong>Tidy Job Sites</strong>
                <span>Nail sweep guaranteed</span>
              </div>
            </div>
          </div>
        </section>

        <section className="topnotch-section topnotch-section--paper" id="reviews">
          <div className="topnotch-wrap">
            <header className="topnotch-section-head">
              <p className="topnotch-star-rule" aria-hidden="true">&#9733; &#9733; &#9733;</p>
              <h2>Word Around the Neighborhood</h2>
              <p>What homeowners tell us matters more than any ad we could run.</p>
            </header>
            <div className="topnotch-reviews-grid">
              {reviews.map(({ quote, name }) => (
                <article className="topnotch-review" key={name}>
                  <div className="topnotch-review-stars" aria-label="Five star review">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={16} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>&ldquo;{quote}&rdquo;</blockquote>
                  <cite>&mdash; {name}</cite>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="topnotch-band topnotch-band--final">
          <div className="topnotch-wrap topnotch-band-inner" style={{ flexDirection: "column", justifyContent: "center" }}>
            <h2>Ready for a Roof You Can Forget About?</h2>
            <p>
              Get a free written quote from a crew that shows up on time, tells the truth about your
              roof, and sweeps up before they leave.
            </p>
            <div className="topnotch-band-actions">
              <QuoteButton />
              <PhoneLink light />
            </div>
          </div>
        </section>
      </main>

      <footer className="topnotch-footer">
        <div className="topnotch-wrap">
          <div className="topnotch-footer-inner">
            <div className="topnotch-footer-brand">
              <Crest />
              <span>TopNotch Roofing Co. &mdash; Est. 1962</span>
            </div>
            <div className="topnotch-footer-links">
              <a href="#services">Services</a>
              <a href="#process">Our Process</a>
              <a href="#reviews">Reviews</a>
              <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
            </div>
          </div>
          <p className="topnotch-footer-note">Independent service provider listing</p>
        </div>
      </footer>
    </div>
  );
}
