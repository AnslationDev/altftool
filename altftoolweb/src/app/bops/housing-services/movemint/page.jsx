"use client";

import { useState } from "react";
import {
  Truck,
  Smartphone,
  Package,
  Boxes,
  Clock,
  ShieldCheck,
  Star,
  Phone,
  ArrowRight,
  CheckCircle2,
  Recycle,
  MapPin,
  Leaf,
  BadgeDollarSign,
  BellRing,
  Plus,
  Menu,
  X,
} from "lucide-react";
import "./movemint.css";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

const IMG = {
  hero: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1600&q=80",
  packing:
    "https://images.unsplash.com/photo-1581573833610-487d80de9aab?auto=format&fit=crop&w=900&q=80",
  longDistance:
    "https://images.unsplash.com/photo-1694715669993-ea0022b470f7?auto=format&fit=crop&w=900&q=80",
  boxes:
    "https://images.unsplash.com/photo-1600725935160-f67ee4f6084a?auto=format&fit=crop&w=900&q=80",
  crates:
    "https://images.unsplash.com/photo-1663625318264-695d2d04f11a?auto=format&fit=crop&w=900&q=80",
  carry:
    "https://images.unsplash.com/photo-1710749093416-1e9cdde8d080?auto=format&fit=crop&w=900&q=80",
};

function QuoteButton({ className = "movemint-btn movemint-btn-primary", children }) {
  return (
    <a
      className={className}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children || (
        <>
          Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
        </>
      )}
    </a>
  );
}

export default function MoveMintPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="movemint-page">
      {/* ================= NAV ================= */}
      <header className="movemint-nav">
        <div className="movemint-nav-inner">
          <a className="movemint-brand" href="#movemint-top" onClick={closeMenu}>
            <span className="movemint-brand-badge">
              <Truck size={20} aria-hidden="true" />
            </span>
            Move<em>Mint</em>
          </a>

          <ul
            id="movemint-menu"
            className={`movemint-nav-links${menuOpen ? " movemint-nav-open" : ""}`}
          >
            <li><a href="#movemint-services" onClick={closeMenu}>Services</a></li>
            <li><a href="#movemint-moveday" onClick={closeMenu}>Move Day</a></li>
            <li><a href="#movemint-crates" onClick={closeMenu}>Crates</a></li>
            <li><a href="#movemint-reviews" onClick={closeMenu}>Reviews</a></li>
            <li><a href="#movemint-faq" onClick={closeMenu}>FAQ</a></li>
          </ul>

          <div className="movemint-nav-cta">
            <a className="movemint-nav-phone" href={PHONE_TEL}>
              <Phone size={17} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <QuoteButton />
            <button
              type="button"
              className="movemint-nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="movemint-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <main id="movemint-top">
        {/* ================= HERO ================= */}
        <section className="movemint-hero" aria-labelledby="movemint-hero-title">
          <div className="movemint-wrap movemint-hero-grid">
            <div className="movemint-hero-copy">
              <p className="movemint-kicker">
                <Smartphone size={15} aria-hidden="true" /> App-tracked moving
              </p>
              <h1 id="movemint-hero-title">
                Moving day, <span>minted fresh.</span> Track every box from door to door.
              </h1>
              <p className="movemint-hero-sub">
                MoveMint pairs vetted crews with live app tracking, upfront flat pricing,
                and reusable zero-tape crates — so your move feels less like chaos and
                more like a checkout screen.
              </p>
              <div className="movemint-hero-actions">
                <QuoteButton />
                <a className="movemint-btn movemint-btn-ghost" href={PHONE_TEL}>
                  <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
              <ul className="movemint-chips">
                <li className="movemint-chip">
                  <Star size={15} aria-hidden="true" /> 4.9 average rating
                </li>
                <li className="movemint-chip">
                  <Truck size={15} aria-hidden="true" /> 12,400+ tracked moves
                </li>
                <li className="movemint-chip">
                  <BadgeDollarSign size={15} aria-hidden="true" /> Flat upfront pricing
                </li>
                <li className="movemint-chip">
                  <ShieldCheck size={15} aria-hidden="true" /> Licensed &amp; insured
                </li>
              </ul>
            </div>

            <div className="movemint-hero-media">
              <div className="movemint-figure movemint-figure-hero">
                <img
                  src={IMG.hero}
                  alt="MoveMint crew loading labeled moving boxes into a truck on move day"
                />
              </div>
              <div className="movemint-notify" role="status">
                <span className="movemint-notify-dot">
                  <BellRing size={19} aria-hidden="true" />
                </span>
                <span>
                  <span className="movemint-notify-app">MoveMint App</span>
                  <span className="movemint-notify-msg">Crew arriving 9:40 &#10003;</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}
        <section
          id="movemint-services"
          className="movemint-section"
          aria-labelledby="movemint-services-title"
        >
          <div className="movemint-wrap">
            <div className="movemint-section-head">
              <p className="movemint-kicker">
                <Package size={15} aria-hidden="true" /> What we move
              </p>
              <h2 id="movemint-services-title">One app. Every kind of move.</h2>
              <p>
                Studio hop or five-bedroom haul, each service ships with the same live
                tracking, the same trained crews, and the same no-surprises invoice.
              </p>
            </div>

            <div className="movemint-cards">
              <article className="movemint-card">
                <div className="movemint-figure">
                  <img
                    src={IMG.packing}
                    alt="Couple packing their belongings into moving boxes at home"
                    loading="lazy"
                  />
                </div>
                <div className="movemint-card-body">
                  <h3>
                    <Boxes size={19} aria-hidden="true" /> Local moves
                  </h3>
                  <p>
                    Same-city moves with hourly crews, crate drop-off two days before,
                    and a live ETA that updates like a rideshare.
                  </p>
                  <span className="movemint-card-note">
                    <CheckCircle2 size={15} aria-hidden="true" /> Most booked
                  </span>
                </div>
              </article>

              <article className="movemint-card">
                <div className="movemint-figure">
                  <img
                    src={IMG.longDistance}
                    alt="Moving truck parked outside a home, ready for a long-distance move"
                    loading="lazy"
                  />
                </div>
                <div className="movemint-card-body">
                  <h3>
                    <MapPin size={19} aria-hidden="true" /> Long distance
                  </h3>
                  <p>
                    State-to-state with GPS checkpoints, one dedicated truck for your
                    goods only, and a delivery window you pick in the app.
                  </p>
                  <span className="movemint-card-note">
                    <CheckCircle2 size={15} aria-hidden="true" /> Dedicated truck
                  </span>
                </div>
              </article>

              <article className="movemint-card">
                <div className="movemint-figure">
                  <img
                    src={IMG.boxes}
                    alt="Neatly stacked and labeled moving boxes prepared by professional packers"
                    loading="lazy"
                  />
                </div>
                <div className="movemint-card-body">
                  <h3>
                    <Package size={19} aria-hidden="true" /> Full packing
                  </h3>
                  <p>
                    Pro packers with QR-labeled crates — scan any crate in the app to
                    see exactly what is inside and which room it lands in.
                  </p>
                  <span className="movemint-card-note">
                    <CheckCircle2 size={15} aria-hidden="true" /> QR inventory
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ================= MOVE DAY TIMELINE ================= */}
        <section
          id="movemint-moveday"
          className="movemint-section movemint-section-alt"
          aria-labelledby="movemint-moveday-title"
        >
          <div className="movemint-wrap">
            <div className="movemint-section-head">
              <p className="movemint-kicker">
                <Clock size={15} aria-hidden="true" /> Move day, minute by minute
              </p>
              <h2 id="movemint-moveday-title">You always know what happens next.</h2>
              <p>
                A typical MoveMint morning — every step pings your phone the moment it
                happens, no wondering where the truck is.
              </p>
            </div>

            <ol className="movemint-timeline">
              <li className="movemint-step">
                <span className="movemint-step-time">9:15 AM</span>
                <h3>Crew en route</h3>
                <p>
                  Your app shows the truck on a live map with names and photos of your
                  three-person crew.
                </p>
              </li>
              <li className="movemint-step">
                <span className="movemint-step-time">9:40 AM</span>
                <h3>Doorstep check-in</h3>
                <p>
                  Crew lead walks the home with you, confirms the crate count, and locks
                  your flat price — it cannot go up after this.
                </p>
              </li>
              <li className="movemint-step">
                <span className="movemint-step-time">12:30 PM</span>
                <h3>Loaded &amp; rolling</h3>
                <p>
                  Every crate is scanned onto the truck. You watch the route to the new
                  place in real time, coffee in hand.
                </p>
              </li>
              <li className="movemint-step">
                <span className="movemint-step-time">3:05 PM</span>
                <h3>Placed, not piled</h3>
                <p>
                  Crates land in the rooms they belong to. Tap &quot;done&quot; in the
                  app and we schedule the crate pickup for next week.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* ================= MID CTA BAND ================= */}
        <section className="movemint-section" aria-label="Get a quote">
          <div className="movemint-wrap">
            <div className="movemint-band">
              <div>
                <h2>Your flat price in about 90 seconds.</h2>
                <p>
                  No home visit needed — or talk it through at{" "}
                  <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>.
                </p>
              </div>
              <div className="movemint-band-actions">
                <QuoteButton />
                <a className="movemint-btn movemint-btn-ghost" href={PHONE_TEL} style={{ color: "#fff", borderColor: "#4a545e" }}>
                  <Phone size={18} aria-hidden="true" /> Call us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CRATES ================= */}
        <section
          id="movemint-crates"
          className="movemint-section movemint-section-alt"
          aria-labelledby="movemint-crates-title"
        >
          <div className="movemint-wrap movemint-split">
            <div className="movemint-split-stack">
              <div className="movemint-figure">
                <img
                  src={IMG.crates}
                  alt="Stacks of reusable moving crates ready for an eco-friendly move"
                  loading="lazy"
                />
              </div>
              <div className="movemint-figure movemint-figure-sm">
                <img
                  src={IMG.carry}
                  alt="Professional mover carefully carrying boxes into a new home"
                  loading="lazy"
                />
              </div>
            </div>

            <div>
              <p className="movemint-kicker">
                <Recycle size={15} aria-hidden="true" /> The MintCrate system
              </p>
              <h2 id="movemint-crates-title">Zero tape. Zero cardboard runs. Zero landfill.</h2>
              <ul className="movemint-feature-list">
                <li>
                  <Leaf size={20} aria-hidden="true" />
                  <div>
                    <strong>Reusable crates, delivered flat-out free</strong>
                    <span>
                      We drop stackable crates before your move and collect them after —
                      the average move skips about 40 cardboard boxes.
                    </span>
                  </div>
                </li>
                <li>
                  <ShieldCheck size={20} aria-hidden="true" />
                  <div>
                    <strong>Crush-proof and rain-proof</strong>
                    <span>
                      Rigid shells protect glassware and electronics better than
                      double-walled cardboard ever did.
                    </span>
                  </div>
                </li>
                <li>
                  <Smartphone size={20} aria-hidden="true" />
                  <div>
                    <strong>QR labels tied to your app inventory</strong>
                    <span>
                      Scan any crate to see its contents and destination room — unpacking
                      stops being a guessing game.
                    </span>
                  </div>
                </li>
              </ul>
              <QuoteButton className="movemint-btn movemint-btn-dark" />
            </div>
          </div>
        </section>

        {/* ================= REVIEWS ================= */}
        <section
          id="movemint-reviews"
          className="movemint-section"
          aria-labelledby="movemint-reviews-title"
        >
          <div className="movemint-wrap">
            <div className="movemint-section-head">
              <p className="movemint-kicker">
                <Star size={15} aria-hidden="true" /> Fresh reviews
              </p>
              <h2 id="movemint-reviews-title">People keep the app after the move.</h2>
              <p>Real notes from recent MoveMint customers across the country.</p>
            </div>

            <div className="movemint-reviews">
              {[
                {
                  quote:
                    "Watched the truck the whole way like a food delivery. The 9:40 arrival ping was accurate to the minute.",
                  name: "Priya S.",
                  meta: "2-bed apartment, Austin",
                },
                {
                  quote:
                    "The quote on my screen was the number on my invoice. After two moves with surprise fees, that alone earned five stars.",
                  name: "Marcus D.",
                  meta: "Townhouse, Denver",
                },
                {
                  quote:
                    "The crates were the sleeper hit — no tape gun, no box mountain in the garage afterward. They just picked them up.",
                  name: "Elena R.",
                  meta: "3-bed house, Raleigh",
                },
              ].map((r) => (
                <figure className="movemint-review" key={r.name}>
                  <div className="movemint-stars" aria-label="Rated 5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={16} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                  <figcaption>
                    {r.name}
                    <span>{r.meta}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section
          id="movemint-faq"
          className="movemint-section movemint-section-alt"
          aria-labelledby="movemint-faq-title"
        >
          <div className="movemint-wrap">
            <div className="movemint-section-head">
              <p className="movemint-kicker">
                <CheckCircle2 size={15} aria-hidden="true" /> Good to know
              </p>
              <h2 id="movemint-faq-title">Quick answers</h2>
            </div>

            <div className="movemint-faq">
              <details>
                <summary>
                  How does upfront pricing actually work?
                  <Plus size={18} aria-hidden="true" />
                </summary>
                <p>
                  You get a flat number before booking, based on home size and distance.
                  The crew lead confirms it at your door on move day — after that
                  check-in, the price is locked and cannot increase.
                </p>
              </details>
              <details>
                <summary>
                  When do the reusable crates arrive and leave?
                  <Plus size={18} aria-hidden="true" />
                </summary>
                <p>
                  Crates arrive two to three days before your move so you can pack at
                  your own pace, and we schedule a free pickup about a week after
                  delivery — whenever you have finished unpacking.
                </p>
              </details>
              <details>
                <summary>
                  What can I see in the tracking app?
                  <Plus size={18} aria-hidden="true" />
                </summary>
                <p>
                  Live crew location and ETA, your crew members&apos; names and photos,
                  a scan log of every crate on and off the truck, and your locked price
                  and receipt — all in one timeline.
                </p>
              </details>
              <details>
                <summary>
                  Are my belongings insured during the move?
                  <Plus size={18} aria-hidden="true" />
                </summary>
                <p>
                  Yes. Every MoveMint move includes standard valuation coverage, and you
                  can add full-value protection when you get your quote.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="movemint-section" aria-label="Book your move">
          <div className="movemint-wrap">
            <div className="movemint-band movemint-band-final">
              <div>
                <h2>Ready for a mint-condition move?</h2>
                <p>
                  Lock a flat price today, or call{" "}
                  <a href={PHONE_TEL}>{PHONE_DISPLAY}</a> — real humans, seven days a
                  week.
                </p>
              </div>
              <div className="movemint-band-actions">
                <QuoteButton />
                <a className="movemint-btn movemint-btn-dark" href={PHONE_TEL}>
                  <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="movemint-footer">
        <div className="movemint-wrap">
          <div className="movemint-footer-grid">
            <div>
              <a className="movemint-brand" href="#movemint-top">
                <span className="movemint-brand-badge">
                  <Truck size={20} aria-hidden="true" />
                </span>
                Move<em>Mint</em>
              </a>
              <p className="movemint-footer-tag">
                App-tracked moving with upfront flat pricing and reusable MintCrates.
                Serving homes and apartments nationwide.
              </p>
            </div>
            <div className="movemint-footer-contact">
              <a href={PHONE_TEL}>
                <Phone size={19} aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
              <p>Open 7 days, 7am&ndash;9pm local time</p>
            </div>
          </div>
          <div className="movemint-footer-base">
            <span>&copy; {new Date().getFullYear()} MoveMint. All rights reserved.</span>
            <span>Independent service provider listing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
