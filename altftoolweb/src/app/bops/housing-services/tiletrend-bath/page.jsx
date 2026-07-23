"use client";

import { useState } from "react";
import {
  Phone, ArrowRight, Droplets, ShowerHead, Ruler, ShieldCheck, Sparkles,
  Star, ChevronDown, CheckCircle2, Layers, Menu, X,
} from "lucide-react";
import "./tiletrend-bath.css";

const QUOTE_URL = "https://example.com/quote/tiletrend-bath";
const PHONE_DISPLAY = "(855) 555-0276";
const PHONE_HREF = "tel:+18555550276";

const IMG = {
  hero: "https://images.unsplash.com/photo-1661107259637-4e1c55462428?auto=format&fit=crop&w=1600&q=80",
  mosaic: "https://images.unsplash.com/photo-1587527901949-ab0341697c1e?auto=format&fit=crop&w=900&q=80",
  spa: "https://images.unsplash.com/photo-1696987007764-7f8b85dd3033?auto=format&fit=crop&w=900&q=80",
  soak: "https://images.unsplash.com/photo-1609280069904-ab36feb3f20c?auto=format&fit=crop&w=900&q=80",
  vanity: "https://images.unsplash.com/photo-1571781418606-70265b9cce90?auto=format&fit=crop&w=900&q=80",
};

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#styles", label: "Tile Styles" },
  { href: "#process", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
];

const SERVICES = [
  { icon: Layers, title: "Statement Tile & Mosaic Walls",
    copy: "Feature walls, niches and floors in mosaic, zellige, penny round or large-format tile — laid out and levelled by tile-focused installers." },
  { icon: ShowerHead, title: "Shower & Tub Conversions",
    copy: "Tub-to-shower swaps and walk-in shower builds with curbless options, linear drains and fully tiled surrounds where the layout allows." },
  { icon: Droplets, title: "Waterproofing & Substrate Prep",
    copy: "Membrane systems, sloped pans and backer board done before the first tile goes on — the part you never see but always feel." },
];

const STYLES = [
  { img: IMG.mosaic, title: "Patterned Feature Walls",
    alt: "Bathroom sink and counter set against a patterned statement tile wall",
    copy: "One bold wall, quiet everything else — a popular way to add character without over-tiling the room." },
  { img: IMG.spa, title: "Spa-Style Wet Areas",
    alt: "Spa-style bathroom with warm lighting and floor-to-ceiling tilework",
    copy: "Floor-to-ceiling tile with warm lighting and matte fixtures for a calm, easy-to-clean wet zone." },
  { img: IMG.soak, title: "Soaking Tub Surrounds",
    alt: "Freestanding soaking tub beside a tiled wall in a modern bathroom",
    copy: "Freestanding tubs framed by durable tiled walls and floors that stand up to daily splashes." },
  { img: IMG.vanity, title: "Vanity & Backsplash Zones",
    alt: "Bright bathroom vanity area with tiled backsplash and wall-mounted mirror",
    copy: "Tiled vanity walls and backsplashes that tie the dry side of the room to the wet area." },
];

const STEPS = [
  { title: "Tell us about your bathroom",
    copy: "Tap Get a Free Quote or call. Share your rough size, current layout and the tile look you are after." },
  { title: "Get matched locally",
    copy: "We route your request to a licensed, insured bathroom remodeler in our network that serves your area, subject to availability." },
  { title: "Compare a written quote",
    copy: "Receive an itemized, no-obligation estimate covering tile, waterproofing, labor and a realistic timeline." },
  { title: "Build on your schedule",
    copy: "Work directly with the contractor you choose. Typical full-bath projects run two to four weeks depending on scope." },
];

const QUOTES = [
  { by: "Priya S. — hall bath remodel",
    text: "The estimate broke out waterproofing and tile labor separately, which made it easy to compare against two other bids. The mosaic niche came out exactly like the reference photo." },
  { by: "Marcus D. — tub-to-shower conversion",
    text: "We called on a Tuesday, had a contractor walk the space Thursday, and a written quote the following week. The tub-to-shower swap took just under three weeks start to finish." },
];

const FAQS = [
  { q: "Is the quote really free?",
    a: "Yes. Requesting a quote through TileTrend Bath costs nothing and carries no obligation. You only move forward if the contractor's written estimate works for you." },
  { q: "Who actually does the work?",
    a: "TileTrend Bath is an independent listing service. The work is performed by licensed, insured local remodelers in our network — you contract with them directly and can vet them before committing." },
  { q: "How long does a tile bathroom remodel take?",
    a: "Most full remodels run two to four weeks on site, though timelines vary with tile complexity, waterproofing scope, material lead times and permitting in your area." },
  { q: "Do you serve my area?",
    a: "Coverage varies by region and by contractor availability. The fastest way to find out is to request a quote or call — if we cannot match you, we will tell you straight away." },
];

function QuoteLink({ className, children }) {
  return (
    <a className={className} href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer">
      {children}
    </a>
  );
}

function PhoneLink({ className }) {
  return (
    <a className={className} href={PHONE_HREF} aria-label={`Call TileTrend Bath at ${PHONE_DISPLAY}`}>
      <Phone size={17} aria-hidden="true" />
      {PHONE_DISPLAY}
    </a>
  );
}

function Logo() {
  return (
    <span className="tiletrend-logo">
      <span className="tiletrend-logo-mark" aria-hidden="true">
        <span /><span /><span /><span />
      </span>
      TileTrend Bath
    </span>
  );
}

function CtaBand({ title, copy }) {
  return (
    <section className="tiletrend-band" aria-label="Request a free quote">
      <div className="tiletrend-shell">
        <div className="tiletrend-band-inner">
          <div>
            <h2>{title}</h2>
            <p>{copy}</p>
          </div>
          <div className="tiletrend-band-ctas">
            <QuoteLink className="tiletrend-btn tiletrend-btn-light">
              Get a Free Quote <ArrowRight size={17} aria-hidden="true" />
            </QuoteLink>
            <PhoneLink className="tiletrend-phone-inline tiletrend-band-phone" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TileTrendBathPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="tiletrend-page">
      <header className="tiletrend-nav">
        <div className="tiletrend-shell">
          <div className="tiletrend-nav-row">
            <Logo />
            <nav className="tiletrend-nav-links" aria-label="Main navigation">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href}>{l.label}</a>
              ))}
            </nav>
            <div className="tiletrend-nav-ctas">
              <PhoneLink className="tiletrend-phone-inline" />
              <QuoteLink className="tiletrend-btn tiletrend-btn-primary">
                Get a Free Quote
              </QuoteLink>
            </div>
            <button
              type="button"
              className="tiletrend-menu-btn"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
          {menuOpen && (
            <nav className="tiletrend-mobile-panel" aria-label="Mobile navigation">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
              ))}
              <PhoneLink className="tiletrend-phone-inline" />
              <QuoteLink className="tiletrend-btn tiletrend-btn-primary">
                Get a Free Quote <ArrowRight size={17} aria-hidden="true" />
              </QuoteLink>
            </nav>
          )}
        </div>
      </header>

      <main>
        <section className="tiletrend-hero tiletrend-gridbg">
          <div className="tiletrend-shell">
            <div className="tiletrend-hero-grid">
              <div className="tiletrend-hero-copy">
                <p className="tiletrend-eyebrow">
                  <Sparkles size={14} aria-hidden="true" /> Bathroom remodels, tile first
                </p>
                <h1>
                  Bathrooms built around <em>statement tile</em>
                </h1>
                <p className="tiletrend-hero-sub">
                  TileTrend Bath connects you with licensed, insured local remodelers who
                  specialize in mosaic work, full-tile showers and proper waterproofing.
                  Quotes are free, written and no-obligation — availability varies by area.
                </p>
                <div className="tiletrend-hero-ctas">
                  <QuoteLink className="tiletrend-btn tiletrend-btn-primary">
                    Get a Free Quote <ArrowRight size={17} aria-hidden="true" />
                  </QuoteLink>
                  <PhoneLink className="tiletrend-phone-inline" />
                </div>
                <ul className="tiletrend-hero-points">
                  <li><CheckCircle2 size={17} aria-hidden="true" /> Licensed and insured network contractors</li>
                  <li><CheckCircle2 size={17} aria-hidden="true" /> Itemized estimates — no surprise line items</li>
                  <li><CheckCircle2 size={17} aria-hidden="true" /> Waterproofing handled before the first tile</li>
                </ul>
              </div>
              <figure className="tiletrend-frame">
                <div className="tiletrend-frame-inner">
                  <img
                    src={IMG.hero}
                    alt="Modern remodeled bathroom with statement tilework, walk-in shower and clean fixtures"
                  />
                </div>
                <figcaption className="tiletrend-frame-caption">Every project starts with the tile</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <hr className="tiletrend-grout-divider" aria-hidden="true" />

        <section id="services" className="tiletrend-section">
          <div className="tiletrend-shell">
            <header className="tiletrend-section-head">
              <p className="tiletrend-kicker">What we arrange</p>
              <h2>Three trades, one finished bathroom</h2>
              <p>
                The remodelers in our network focus on the work where tile projects succeed
                or fail: layout, wet-area conversion and what goes on behind the wall.
              </p>
            </header>
            <div className="tiletrend-cards">
              {SERVICES.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="tiletrend-card">
                  <span className="tiletrend-card-icon"><Icon size={24} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <hr className="tiletrend-grout-divider" aria-hidden="true" />

        <section id="styles" className="tiletrend-section tiletrend-checker">
          <div className="tiletrend-shell">
            <header className="tiletrend-section-head">
              <p className="tiletrend-kicker">Tile styles</p>
              <h2>Looks homeowners ask us for most</h2>
              <p>
                Bring a photo, a tile sample or just a direction — your matched contractor
                quotes the look against your actual room and budget.
              </p>
            </header>
            <div className="tiletrend-gallery">
              {STYLES.map((s) => (
                <article key={s.title} className="tiletrend-gallery-item">
                  <div className="tiletrend-gallery-photo">
                    <img src={s.img} alt={s.alt} loading="lazy" />
                  </div>
                  <div className="tiletrend-gallery-meta">
                    <h3>{s.title}</h3>
                    <p>{s.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          title="Have a tile look in mind already?"
          copy="Tell us about it. A written, no-obligation estimate is the fastest way to find out what it costs in your area."
        />

        <section id="process" className="tiletrend-section">
          <div className="tiletrend-shell">
            <header className="tiletrend-section-head">
              <p className="tiletrend-kicker">How it works</p>
              <h2>From first call to final grout line</h2>
              <p>
                No forms to fill in here — one click or one call starts the match, and you
                stay in control of every decision after that.
              </p>
            </header>
            <div className="tiletrend-steps">
              {STEPS.map((s) => (
                <article key={s.title} className="tiletrend-step">
                  <h3>{s.title}</h3>
                  <p>{s.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <hr className="tiletrend-grout-divider" aria-hidden="true" />

        <section className="tiletrend-section tiletrend-gridbg" aria-label="Homeowner feedback">
          <div className="tiletrend-shell">
            <header className="tiletrend-section-head">
              <p className="tiletrend-kicker">Homeowner feedback</p>
              <h2>What matched homeowners tell us</h2>
            </header>
            <div className="tiletrend-quotes">
              {QUOTES.map((q) => (
                <figure key={q.by} className="tiletrend-quote">
                  <div className="tiletrend-quote-stars" aria-label="Rated five out of five">
                    {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={16} fill="currentColor" aria-hidden="true" />)}
                  </div>
                  <blockquote>&ldquo;{q.text}&rdquo;</blockquote>
                  <figcaption>{q.by}</figcaption>
                </figure>
              ))}
            </div>
            <p className="tiletrend-quotes-note">
              Feedback shared by homeowners matched through our network. Individual results,
              pricing and timelines vary by project and region.
            </p>
          </div>
        </section>

        <section id="faq" className="tiletrend-section">
          <div className="tiletrend-shell">
            <header className="tiletrend-section-head">
              <p className="tiletrend-kicker">FAQ</p>
              <h2>Straight answers before you commit</h2>
            </header>
            <div className="tiletrend-faq-list">
              {FAQS.map((f, i) => (
                <div key={f.q} className="tiletrend-faq-item" data-open={openFaq === i}>
                  <button
                    type="button"
                    className="tiletrend-faq-trigger"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    {f.q}
                    <ChevronDown size={18} aria-hidden="true" />
                  </button>
                  {openFaq === i && <p className="tiletrend-faq-answer">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          title="Ready to see real numbers for your bathroom?"
          copy="Get a free, itemized quote from a licensed local remodeler — or call and talk it through first. No obligation either way."
        />
      </main>

      <footer className="tiletrend-footer">
        <div className="tiletrend-shell">
          <div className="tiletrend-footer-row">
            <div>
              <Logo />
              <p style={{ margin: "12px 0 0", maxWidth: "22rem", fontSize: "0.88rem" }}>
                <ShieldCheck size={15} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 6 }} />
                Matching homeowners with licensed, insured bathroom tile specialists.
              </p>
            </div>
            <nav className="tiletrend-footer-links" aria-label="Footer navigation">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href}>{l.label}</a>
              ))}
              <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
            </nav>
          </div>
          <p className="tiletrend-footer-note">
            <Ruler size={13} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 5 }} />
            TileTrend Bath is a fictional brand shown for demonstration. Independent service
            provider listing. Quotes and services are provided by third-party contractors;
            availability, pricing and timelines vary by location.
          </p>
        </div>
      </footer>
    </div>
  );
}
