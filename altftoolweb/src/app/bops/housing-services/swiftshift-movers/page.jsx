"use client";

import { useState } from "react";
import {
  Truck,
  Phone,
  Star,
  ArrowRight,
  Menu,
  X,
  MapPin,
  Route,
  Building2,
  Warehouse,
  Boxes,
  Sofa,
  Piano,
  Lamp,
  Bike,
  Monitor,
  Refrigerator,
  Sprout,
  ClipboardCheck,
  CalendarCheck,
  PackageCheck,
  ShieldCheck,
  Clock,
  BadgeDollarSign,
} from "lucide-react";
import "./swiftshift-movers.css";

const PHONE_DISPLAY = "Demo only";
const PHONE_TEL = "#demo-only";

const MARQUEE_ITEMS = [
  { icon: Sofa, label: "Sectionals" },
  { icon: Piano, label: "Pianos" },
  { icon: Monitor, label: "Home offices" },
  { icon: Refrigerator, label: "Appliances" },
  { icon: Boxes, label: "200 boxes" },
  { icon: Lamp, label: "That one lamp" },
  { icon: Bike, label: "Bikes & gear" },
  { icon: Sprout, label: "Houseplants" },
];

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Lock your flat quote",
    copy: "Five-minute call or form. We price the whole move up front — no weight games, no fuel surprises.",
  },
  {
    icon: CalendarCheck,
    title: "Pick your day",
    copy: "Same-week slots on most routes. We confirm your crew and truck the moment you book.",
  },
  {
    icon: PackageCheck,
    title: "Crew packs & loads",
    copy: "Uniformed, trained movers wrap, pad and load with a room-by-room labeling system.",
  },
  {
    icon: Route,
    title: "Track the truck",
    copy: "Live GPS link from pickup to your new door. You always know where your stuff is.",
  },
];

const SERVICES = [
  {
    icon: MapPin,
    title: "Local moves",
    copy: "Across town before dinner. Hourly crews with a hard cap — the quote is the ceiling, period.",
  },
  {
    icon: Route,
    title: "Long-distance",
    copy: "Dedicated trucks coast to coast. Your load never shares a trailer and never gets re-handled.",
  },
  {
    icon: Building2,
    title: "Office relocation",
    copy: "After-hours and weekend moves so your team logs off Friday and logs on Monday — new address.",
  },
  {
    icon: Warehouse,
    title: "Storage bridge",
    copy: "Gap between homes? Climate-controlled storage with the same flat-rate promise, week to week.",
  },
];

const REVIEWS = [
  {
    quote:
      "Quoted Tuesday, moved Saturday. The crew finished forty minutes early and the price never moved a cent.",
    name: "Dana R.",
    detail: "3-bed house, Austin to Dallas",
  },
  {
    quote:
      "They labeled every box by room and the GPS link meant no 'where's the truck' panic. Easiest move of my life.",
    name: "Marcus T.",
    detail: "Apartment, cross-town",
  },
  {
    quote:
      "Our whole office moved over one weekend. Desks up, monitors on, zero downtime on Monday morning.",
    name: "Priya S.",
    detail: "22-person office relocation",
  },
];

function MarqueeRow({ ariaHidden }) {
  return (
    <ul className="swiftshift-marquee-row" aria-hidden={ariaHidden || undefined}>
      {MARQUEE_ITEMS.map(({ icon: Icon, label }) => (
        <li key={label}>
          <Icon size={22} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}

function StarRow() {
  return (
    <span className="swiftshift-review-stars" aria-label="5 out of 5 stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={18} className="swiftshift-star" aria-hidden="true" />
      ))}
    </span>
  );
}

export default function SwiftShiftMoversPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleQuoteSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="swiftshift-page">
      {/* ============ TOP BAR ============ */}
      <header className="swiftshift-topbar">
        <div className="swiftshift-topbar-inner">
          <a href="#top" className="swiftshift-brand">
            <span className="swiftshift-brand-mark" aria-hidden="true">
              <Truck size={22} />
            </span>
            Swift<em>Shift</em>&nbsp;Movers
          </a>

          <nav
            className={`swiftshift-nav-links${menuOpen ? " swiftshift-nav-links--open" : ""}`}
            aria-label="Main"
          >
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#playbook" onClick={() => setMenuOpen(false)}>Playbook</a>
            <a href="#reviews" onClick={() => setMenuOpen(false)}>Reviews</a>
            <a href="#quote" onClick={() => setMenuOpen(false)}>Get a flat quote</a>
          </nav>

          <a href="#quote" className="swiftshift-btn swiftshift-btn--yellow">
            Get a flat quote
          </a>

          <button
            type="button"
            className="swiftshift-menu-toggle"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <main id="top">
        {/* ============ HERO ============ */}
        <section className="swiftshift-hero">
          <div className="swiftshift-wrap">
            <div className="swiftshift-hero-grid">
              <div>
                <p className="swiftshift-kicker">Same-week moves · Flat quotes</p>
                <h1 className="swiftshift-display swiftshift-hero-title">
                  <span className="swiftshift-slab">Moving day?</span>
                  <br />
                  <span className="swiftshift-slab swiftshift-slab--yellow">Handled.</span>
                </h1>
                <p className="swiftshift-hero-copy">
                  Trained crews, one flat price locked before we lift a box, and a live
                  GPS link on every truck. Local or cross-country — we move fast so you
                  can too.
                </p>
                <div className="swiftshift-hero-ctas">
                  <a href="#quote" className="swiftshift-btn swiftshift-btn--yellow">
                    Get my flat quote <ArrowRight size={18} aria-hidden="true" />
                  </a>
                  <a href={PHONE_TEL} className="swiftshift-btn swiftshift-btn--ghost">
                    <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
                  </a>
                </div>
              </div>

              <div className="swiftshift-truck-stage" aria-hidden="true">
                <div className="swiftshift-truck">
                  <div className="swiftshift-truck-box">
                    SwiftShift
                    <div className="swiftshift-truck-wheels">
                      <span className="swiftshift-wheel" />
                      <span className="swiftshift-wheel" />
                    </div>
                  </div>
                  <div className="swiftshift-truck-cab">
                    <Truck size={34} />
                  </div>
                </div>
                <div className="swiftshift-road" />
                <div className="swiftshift-speedlines">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>

            <ul className="swiftshift-stats">
              <li className="swiftshift-stat">
                <strong>2,400+</strong>
                <span>moves completed</span>
              </li>
              <li className="swiftshift-stat">
                <strong>
                  4.9 <Star size={22} className="swiftshift-star" aria-hidden="true" />
                </strong>
                <span>average crew rating</span>
              </li>
              <li className="swiftshift-stat">
                <strong>$0</strong>
                <span>hidden fees, ever</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ============ MARQUEE ============ */}
        <div className="swiftshift-marquee" role="presentation">
          <div className="swiftshift-marquee-track">
            <MarqueeRow />
            <MarqueeRow ariaHidden />
          </div>
        </div>

        {/* ============ PLAYBOOK ============ */}
        <section id="playbook" className="swiftshift-section">
          <div className="swiftshift-wrap">
            <div className="swiftshift-section-head">
              <p className="swiftshift-kicker">How it works</p>
              <h2 className="swiftshift-display">The move-day playbook</h2>
              <p>
                Four steps, zero chaos. The same drill on every SwiftShift move, whether
                it&rsquo;s one studio or a whole office floor.
              </p>
            </div>

            <ol className="swiftshift-steps">
              {STEPS.map(({ icon: Icon, title, copy }, index) => (
                <li key={title} className="swiftshift-step">
                  <span className="swiftshift-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3>
                      <Icon size={20} aria-hidden="true" /> {title}
                    </h3>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ SERVICES ============ */}
        <section id="services" className="swiftshift-section swiftshift-section--gray">
          <div className="swiftshift-wrap">
            <div className="swiftshift-section-head">
              <p className="swiftshift-kicker">What we do</p>
              <h2 className="swiftshift-display">Pick your move</h2>
              <p>
                Every service comes with the same promise: a flat quote up front, a
                trained crew and a truck you can track.
              </p>
            </div>

            <div className="swiftshift-services">
              {SERVICES.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="swiftshift-card">
                  <span className="swiftshift-card-icon" aria-hidden="true">
                    <Icon size={28} />
                  </span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <a href="#quote" className="swiftshift-card-link">
                    Price this move <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ QUOTE FORM ============ */}
        <section id="quote" className="swiftshift-section">
          <div className="swiftshift-wrap">
            <div className="swiftshift-quote-grid">
              <div>
                <p className="swiftshift-kicker">60-second quote</p>
                <h2 className="swiftshift-display">One flat price. Locked.</h2>
                <ul className="swiftshift-quote-points">
                  <li>
                    <BadgeDollarSign size={22} aria-hidden="true" />
                    The number we quote is the number you pay — in writing.
                  </li>
                  <li>
                    <Clock size={22} aria-hidden="true" />
                    Same-week slots available on most local and regional routes.
                  </li>
                  <li>
                    <ShieldCheck size={22} aria-hidden="true" />
                    Every move covered by full-value protection at no extra cost.
                  </li>
                </ul>
              </div>

              <form className="swiftshift-form-card" onSubmit={handleQuoteSubmit}>
                <h3>Get your flat quote</h3>
                <div className="swiftshift-form-fields">
                  <div className="swiftshift-field">
                    <label htmlFor="swiftshift-name">Your name</label>
                    <input
                      id="swiftshift-name"
                      name="name"
                      type="text"
                      autoComplete="off"
                      placeholder="Jordan Blake"
                    />
                  </div>
                  <div className="swiftshift-field">
                    <label htmlFor="swiftshift-date">Move date</label>
                    <input id="swiftshift-date" name="date" type="date" />
                  </div>
                  <div className="swiftshift-field">
                    <label htmlFor="swiftshift-from">Moving from</label>
                    <input
                      id="swiftshift-from"
                      name="from"
                      type="text"
                      autoComplete="off"
                      placeholder="ZIP or city"
                    />
                  </div>
                  <div className="swiftshift-field">
                    <label htmlFor="swiftshift-to">Moving to</label>
                    <input
                      id="swiftshift-to"
                      name="to"
                      type="text"
                      autoComplete="off"
                      placeholder="ZIP or city"
                    />
                  </div>
                </div>
                <button type="submit" className="swiftshift-btn swiftshift-btn--yellow">
                  Lock my flat quote <ArrowRight size={20} aria-hidden="true" />
                </button>
                <p className="swiftshift-form-note">
                  Demo form — nothing is sent. Call {PHONE_DISPLAY} instead.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* ============ REVIEWS ============ */}
        <section id="reviews" className="swiftshift-section swiftshift-section--gray">
          <div className="swiftshift-wrap">
            <div className="swiftshift-section-head">
              <p className="swiftshift-kicker">Crew receipts</p>
              <h2 className="swiftshift-display">Moved &amp; on record</h2>
              <p>Real moving days, straight from the people whose stuff we carried.</p>
            </div>

            <div className="swiftshift-reviews">
              {REVIEWS.map(({ quote, name, detail }) => (
                <figure key={name} className="swiftshift-review">
                  <StarRow />
                  <blockquote>&ldquo;{quote}&rdquo;</blockquote>
                  <figcaption>
                    {name}
                    <span>{detail}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA BAND ============ */}
        <section className="swiftshift-cta-band">
          <div className="swiftshift-wrap swiftshift-cta-inner">
            <h2 className="swiftshift-display">
              One call. <em>One flat price.</em>
            </h2>
            <a href={PHONE_TEL} className="swiftshift-cta-phone">
              <Phone size={26} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
            <p className="swiftshift-cta-sub">
              Lines open 7 days · Same-week slots on most routes
            </p>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="swiftshift-footer">
        <div className="swiftshift-wrap">
          <div className="swiftshift-footer-grid">
            <div>
              <a href="#top" className="swiftshift-brand">
                <span className="swiftshift-brand-mark" aria-hidden="true">
                  <Truck size={22} />
                </span>
                Swift<em>Shift</em>&nbsp;Movers
              </a>
              <p>
                Fast local and long-distance moving with flat quotes, trained crews and
                trackable trucks. A fictional demo brand in the AltFTool Housing Needs
                directory.
              </p>
            </div>
            <nav aria-label="Footer services">
              <h3>Services</h3>
              <div className="swiftshift-footer-links">
                <a href="#services">Local moves</a>
                <a href="#services">Long-distance</a>
                <a href="#services">Office relocation</a>
                <a href="#services">Storage bridge</a>
              </div>
            </nav>
            <nav aria-label="Footer company">
              <h3>Company</h3>
              <div className="swiftshift-footer-links">
                <a href="#playbook">Move-day playbook</a>
                <a href="#reviews">Reviews</a>
                <a href="#quote">Flat quote</a>
                <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
              </div>
            </nav>
          </div>
          <div className="swiftshift-footer-bottom">
            <span>SwiftShift Movers — fictional brand, demo lander</span>
            <span>USDOT #000000 (not real) · Fully insured (in this demo)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
