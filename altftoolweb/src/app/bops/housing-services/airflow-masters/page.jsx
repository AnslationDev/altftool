"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  MapPin,
  Mail,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  ThermometerSun,
  Wind,
  Wrench,
} from "lucide-react";
import "./airflow-masters.css";

// No quote partner and no phone line are live for this page, so every
// conversion CTA points at the site's real contact route.
const CONTACT_URL = "/policypages/contact";
const CONTACT_LABEL = "Contact us";

const img = (id, w) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const HERO_IMG = img("1698479603408-1a66a6d9e80f", 1600);

const SERVICES = [
  {
    tone: "cool",
    icon: Snowflake,
    title: "AC Installation",
    text: "High-efficiency cooling systems sized to your home's real load — not a guess.",
    image: img("1732395805034-e0bf859665e5", 900),
    alt: "Technician installing a modern outdoor air-conditioning condenser beside a home",
    points: ["Room-by-room load calculation", "SEER2-rated equipment options", "Old-unit haul-away included"],
  },
  {
    tone: "warm",
    icon: Flame,
    title: "Furnace Repair",
    text: "Same-day diagnostics and flat-rate repairs on every major furnace brand.",
    image: img("1601659404194-97d2daca8383", 900),
    alt: "HVAC technician servicing a residential furnace with diagnostic tools",
    points: ["Same-day diagnostic visits", "All major brands serviced", "Carbon-monoxide safety check"],
  },
  {
    tone: "cool",
    icon: Gauge,
    title: "Smart-Thermostat Tune-Ups",
    text: "Setup, calibration, and schedules that quietly trim your energy bill.",
    image: img("1642749776312-aa42ce20c9f5", 900),
    alt: "Smart thermostat mounted on a wall showing the indoor temperature setting",
    points: ["Wi-Fi pairing and app setup", "Seasonal schedule programming", "Personal energy-savings report"],
  },
];

const GALLERY = [
  {
    tone: "cool",
    image: img("1705444509014-fed54b6191bf", 900),
    alt: "Newly installed high-efficiency condenser unit outside a suburban house",
    caption: "Condenser replacement — Maple Grove",
  },
  {
    tone: "warm",
    image: img("1630481721508-5d37097dd8fc", 900),
    alt: "Technician completing a furnace swap in a tidy utility room",
    caption: "High-efficiency furnace swap — Cedar Falls",
  },
  {
    tone: "cool",
    image: img("1698479603408-1a66a6d9e80f", 900),
    alt: "Rooftop HVAC unit and ductwork after a whole-home airflow rebalance",
    caption: "Whole-home airflow balancing — Lakeside",
  },
];

const REVIEWS = [
  {
    tone: "warm",
    name: "Marisa T.",
    area: "Maple Grove",
    quote:
      "Our furnace died on the coldest night of January. AirFlow had heat back on by noon the next day — and the invoice matched the quote to the dollar.",
  },
  {
    tone: "cool",
    name: "Devon R.",
    area: "Cedar Falls",
    quote:
      "The crew measured every room before recommending a unit. The new AC is whisper-quiet and the upstairs finally cools as evenly as the main floor.",
  },
  {
    tone: "warm",
    name: "Priya S.",
    area: "Lakeside",
    quote:
      "The thermostat tune-up paid for itself in two billing cycles. They even programmed a vacation schedule for us before packing up.",
  },
];

const STEPS = [
  {
    tone: "warm",
    title: "Tell us what's going on",
    text: "Two minutes on the quote page or one quick call — describe the symptom and we'll handle the rest.",
  },
  {
    tone: "cool",
    title: "Get a flat, upfront price",
    text: "A real number before any work begins. No hourly meters running, no surprise line items.",
  },
  {
    tone: "warm",
    title: "We install, test, and tidy up",
    text: "Licensed techs, drop cloths and shoe covers, and a full system test before we pull out of the driveway.",
  },
];

const MODES = {
  heating: {
    label: "Heating",
    tone: "warm",
    temp: "72°F",
    angle: "54deg",
    items: [
      { icon: Flame, text: "Burners cleaned and calibrated for a steady, even flame" },
      { icon: ShieldCheck, text: "Heat-exchanger inspection with carbon-monoxide check" },
      { icon: Wind, text: "Warm-air balancing so every room heats at the same pace" },
    ],
  },
  cooling: {
    label: "Cooling",
    tone: "cool",
    temp: "69°F",
    angle: "-54deg",
    items: [
      { icon: Snowflake, text: "Refrigerant charge verified against factory spec" },
      { icon: Wrench, text: "Coils washed and condensate line cleared" },
      { icon: Wind, text: "Airflow balanced for even cooling on every floor" },
    ],
  },
};

function QuoteButton({ variant = "airflow-btn--warm" }) {
  return (
    <a
      className={`airflow-btn ${variant}`}
      href={CONTACT_URL}
    >
      Get a Free Quote
      <ArrowRight className="airflow-btn-icon" size={18} aria-hidden="true" />
    </a>
  );
}

function PhoneButton({ variant = "airflow-btn--ghost" }) {
  return (
    <a className={`airflow-btn ${variant}`} href={CONTACT_URL}>
      <Mail size={17} aria-hidden="true" />
      {CONTACT_LABEL}
    </a>
  );
}

function Stars({ size = 15 }) {
  return (
    <span className="airflow-stars" role="img" aria-label="Rated 5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} fill="currentColor" aria-hidden="true" />
      ))}
    </span>
  );
}

export default function AirFlowMastersPage() {
  const [mode, setMode] = useState("cooling");
  const active = MODES[mode];

  return (
    <div className="airflow-page" id="airflow-top">
      <header className="airflow-nav">
        <div className="airflow-shell airflow-nav-inner">
          <a className="airflow-brand" href="#airflow-top">
            <span className="airflow-brand-mark" aria-hidden="true">
              <Wind size={20} />
            </span>
            AirFlow Masters
          </a>
          <nav className="airflow-nav-links" aria-label="Page sections">
            <a className="airflow-nav-link" href="#airflow-services">Services</a>
            <a className="airflow-nav-link" href="#airflow-comfort">Tune-Ups</a>
            <a className="airflow-nav-link" href="#airflow-gallery">Recent Work</a>
            <a className="airflow-nav-link" href="#airflow-reviews">Reviews</a>
          </nav>
          <a className="airflow-nav-phone" href={CONTACT_URL}>
            <Mail size={16} aria-hidden="true" />
            <span className="airflow-nav-phone-text">{CONTACT_LABEL}</span>
          </a>
          <a
            className="airflow-btn airflow-btn--warm airflow-nav-cta"
            href={CONTACT_URL}
          >
            Get a Free Quote
          </a>
        </div>
      </header>

      <main>
        <section className="airflow-hero" aria-labelledby="airflow-hero-title">
          <div className="airflow-shell airflow-hero-inner">
            <div className="airflow-hero-copy">
              <p className="airflow-kicker">
                <Sparkles size={14} aria-hidden="true" />
                Licensed &amp; insured — heating and cooling under one roof
              </p>
              <h1 className="airflow-hero-title" id="airflow-hero-title">
                The right temperature, every month of the year.
              </h1>
              <p className="airflow-hero-sub">
                AC installs, furnace repair, and smart-thermostat tune-ups from one
                certified crew. Upfront pricing, same-week scheduling, and a comfort
                guarantee in writing.
              </p>
              <div className="airflow-hero-ctas">
                <QuoteButton variant="airflow-btn--light airflow-btn--pulse" />
                <PhoneButton />
              </div>
              <ul className="airflow-hero-points">
                <li className="airflow-hero-point">
                  <ShieldCheck size={16} aria-hidden="true" /> 10-year parts warranty
                </li>
                <li className="airflow-hero-point">
                  <Clock size={16} aria-hidden="true" /> Same-week installs
                </li>
                <li className="airflow-hero-point">
                  <ThermometerSun size={16} aria-hidden="true" /> Free in-home estimates
                </li>
              </ul>
            </div>
            <div className="airflow-hero-media">
              <div className="airflow-frame airflow-frame--hero">
                <img
                  src={HERO_IMG}
                  alt="AirFlow Masters technician completing a rooftop HVAC installation at golden hour"
                />
              </div>
              <p className="airflow-hero-badge">
                <Stars size={14} />
                <span>
                  <strong>4.9 rating</strong> &middot; 2,300+ homes served
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="airflow-section airflow-section--cream" id="airflow-services" aria-labelledby="airflow-services-title">
          <div className="airflow-shell">
            <div className="airflow-section-head">
              <span className="airflow-eyebrow airflow-eyebrow--warm">What we do</span>
              <h2 className="airflow-section-title" id="airflow-services-title">
                Three specialties. Zero runaround.
              </h2>
              <p className="airflow-lede">
                We don't dabble. Installs, repairs, and tune-ups are the whole business —
                which is why each one comes with a written guarantee.
              </p>
            </div>
            <div className="airflow-card-grid">
              {SERVICES.map(({ tone, icon: Icon, title, text, image, alt, points }) => (
                <article className="airflow-card" key={title}>
                  <div className="airflow-card-media">
                    <img src={image} alt={alt} loading="lazy" />
                    <span className={`airflow-tint airflow-tint--${tone}`} aria-hidden="true" />
                  </div>
                  <div className="airflow-card-body">
                    <span className={`airflow-card-icon airflow-card-icon--${tone}`} aria-hidden="true">
                      <Icon size={22} />
                    </span>
                    <h3 className="airflow-card-title">{title}</h3>
                    <p className="airflow-card-text">{text}</p>
                    <ul className="airflow-card-list">
                      {points.map((point) => (
                        <li key={point}>
                          <CheckCircle2
                            size={16}
                            className={`airflow-card-check airflow-card-check--${tone}`}
                            aria-hidden="true"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="airflow-section airflow-section--cool" id="airflow-comfort" aria-labelledby="airflow-comfort-title">
          <div className="airflow-shell airflow-comfort">
            <div>
              <span className="airflow-eyebrow airflow-eyebrow--cool">Seasonal tune-ups</span>
              <h2 className="airflow-section-title" id="airflow-comfort-title">
                Dial in your perfect degree.
              </h2>
              <p className="airflow-lede">
                Every tune-up covers both sides of the dial. Pick a mode to see what our
                21-point inspection checks before the season hits.
              </p>
              <div className="airflow-toggle" role="group" aria-label="Preview heating or cooling tune-up">
                <button
                  type="button"
                  className={`airflow-toggle-btn airflow-toggle-btn--warm${mode === "heating" ? " airflow-is-on" : ""}`}
                  aria-pressed={mode === "heating"}
                  onClick={() => setMode("heating")}
                >
                  <Flame size={16} aria-hidden="true" /> Heating
                </button>
                <button
                  type="button"
                  className={`airflow-toggle-btn airflow-toggle-btn--cool${mode === "cooling" ? " airflow-is-on" : ""}`}
                  aria-pressed={mode === "cooling"}
                  onClick={() => setMode("cooling")}
                >
                  <Snowflake size={16} aria-hidden="true" /> Cooling
                </button>
              </div>
              <ul className="airflow-mode-list" key={mode}>
                {active.items.map(({ icon: Icon, text }) => (
                  <li className="airflow-mode-item" key={text}>
                    <Icon size={18} className={`airflow-mode-icon airflow-mode-icon--${active.tone}`} aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
              <div className="airflow-comfort-stats">
                <div className="airflow-stat"><strong>15+</strong><span>years in the metro</span></div>
                <div className="airflow-stat"><strong>2,300+</strong><span>systems installed</span></div>
                <div className="airflow-stat"><strong>4.9</strong><span>average review score</span></div>
              </div>
            </div>
            <div className="airflow-dial-wrap">
              <div
                className="airflow-dial"
                role="img"
                aria-label={`Thermostat dial illustration set to ${active.temp} in ${active.label.toLowerCase()} mode`}
              >
                <span className="airflow-dial-arc" aria-hidden="true" />
                <span className="airflow-dial-ticks" aria-hidden="true" />
                <span
                  className="airflow-dial-pivot"
                  aria-hidden="true"
                  style={{ transform: `rotate(${active.angle})` }}
                >
                  <span className="airflow-dial-needle" />
                </span>
                <span className="airflow-dial-face">
                  <span className={`airflow-dial-temp airflow-dial-temp--${active.tone}`}>{active.temp}</span>
                  <span className="airflow-dial-mode">{active.label} mode</span>
                </span>
                <span className="airflow-dial-label airflow-dial-label--cool" aria-hidden="true">
                  <Snowflake size={18} />
                </span>
                <span className="airflow-dial-label airflow-dial-label--warm" aria-hidden="true">
                  <Flame size={18} />
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="airflow-band airflow-band--warm" aria-label="Request a quote">
          <div className="airflow-shell airflow-band-inner">
            <div>
              <h2 className="airflow-band-title">Comfort shouldn't wait for a season change.</h2>
              <p className="airflow-band-note">
                Free quotes today — most visits scheduled within 48 hours.
              </p>
            </div>
            <div className="airflow-band-ctas">
              <QuoteButton variant="airflow-btn--light" />
              <PhoneButton />
            </div>
          </div>
        </section>

        <section className="airflow-section" id="airflow-gallery" aria-labelledby="airflow-gallery-title">
          <div className="airflow-shell">
            <div className="airflow-section-head">
              <span className="airflow-eyebrow airflow-eyebrow--cool">Recent work</span>
              <h2 className="airflow-section-title" id="airflow-gallery-title">
                Real installs, real homes.
              </h2>
              <p className="airflow-lede">
                A few of the projects our crews wrapped up this quarter across the metro.
              </p>
            </div>
            <div className="airflow-gallery-grid">
              {GALLERY.map(({ tone, image, alt, caption }) => (
                <figure className="airflow-shot" key={caption}>
                  <div className="airflow-shot-media">
                    <img src={image} alt={alt} loading="lazy" />
                    <span className={`airflow-tint airflow-tint--${tone}`} aria-hidden="true" />
                  </div>
                  <figcaption className="airflow-shot-caption">
                    <MapPin size={15} aria-hidden="true" />
                    {caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="airflow-section airflow-section--warm" id="airflow-reviews" aria-labelledby="airflow-reviews-title">
          <div className="airflow-shell">
            <div className="airflow-section-head">
              <span className="airflow-eyebrow airflow-eyebrow--warm">Homeowner reviews</span>
              <h2 className="airflow-section-title" id="airflow-reviews-title">
                Neighbors who stopped sweating the weather.
              </h2>
            </div>
            <div className="airflow-review-grid">
              {REVIEWS.map(({ tone, name, area, quote }) => (
                <figure className="airflow-review" key={name}>
                  <Stars />
                  <blockquote className="airflow-review-quote">
                    <p>&ldquo;{quote}&rdquo;</p>
                  </blockquote>
                  <figcaption className="airflow-review-meta">
                    <span className={`airflow-review-avatar airflow-review-avatar--${tone}`} aria-hidden="true">
                      {name.charAt(0)}
                    </span>
                    <span>
                      <span className="airflow-review-name">{name}</span>
                      {area}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="airflow-section airflow-section--cool" id="airflow-process" aria-labelledby="airflow-process-title">
          <div className="airflow-shell">
            <div className="airflow-section-head">
              <span className="airflow-eyebrow airflow-eyebrow--cool">How it works</span>
              <h2 className="airflow-section-title" id="airflow-process-title">
                From first call to steady comfort in three steps.
              </h2>
            </div>
            <div className="airflow-steps">
              {STEPS.map(({ tone, title, text }, index) => (
                <article className="airflow-step" key={title}>
                  <span className={`airflow-step-num airflow-step-num--${tone}`} aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3 className="airflow-step-title">{title}</h3>
                  <p className="airflow-step-text">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="airflow-band airflow-band--split airflow-band--final" aria-label="Final call to action">
          <div className="airflow-shell airflow-band-inner">
            <div>
              <h2 className="airflow-band-title">Ready for a house that holds its temperature?</h2>
              <p className="airflow-band-note">
                Free quotes, no-obligation visits, and a phone line that's answered around the clock.
              </p>
            </div>
            <div className="airflow-band-ctas">
              <QuoteButton variant="airflow-btn--light" />
              <PhoneButton />
            </div>
          </div>
        </section>
      </main>

      <footer className="airflow-footer">
        <div className="airflow-shell">
          <div className="airflow-footer-inner">
            <div>
              <a className="airflow-brand" href="#airflow-top">
                <span className="airflow-brand-mark" aria-hidden="true">
                  <Wind size={20} />
                </span>
                AirFlow Masters
              </a>
              <p className="airflow-footer-tag">
                Heating and cooling done right the first time — installs, repairs,
                and tune-ups across the metro.
              </p>
              <a className="airflow-footer-phone" href={CONTACT_URL}>
                <Mail size={17} aria-hidden="true" /> {CONTACT_LABEL}
              </a>
            </div>
            <nav aria-label="Footer">
              <ul className="airflow-footer-links">
                <li><a className="airflow-footer-link" href="#airflow-services">Services</a></li>
                <li><a className="airflow-footer-link" href="#airflow-comfort">Tune-Ups</a></li>
                <li><a className="airflow-footer-link" href="#airflow-gallery">Recent Work</a></li>
                <li><a className="airflow-footer-link" href="#airflow-reviews">Reviews</a></li>
              </ul>
            </nav>
          </div>
          <div className="airflow-fineprint">
            <span>&copy; 2026 AirFlow Masters. Independent service provider listing.</span>
            <span>Licensed &amp; insured &middot; HVAC License #HM-20419</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
