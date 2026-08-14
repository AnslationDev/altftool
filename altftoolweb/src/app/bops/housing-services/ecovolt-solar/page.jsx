"use client";

import { useState } from "react";
import {
  Zap, Phone, ArrowRight, Activity, BatteryCharging, Sun, Gauge,
  ShieldCheck, Wrench, CheckCircle2, Menu, X,
} from "lucide-react";
import "./ecovolt-solar.css";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_TEXT = "Demo only";

const STATS = [
  { num: "25 yr", cap: "panel performance warranty on installed modules" },
  { num: "1,200+", cap: "residential systems commissioned to date" },
  { num: "98.6%", cap: "avg. fleet uptime across monitored arrays" },
  { num: "24/7", cap: "production telemetry in the owner app" },
];

const CARDS = [
  {
    img: "https://images.unsplash.com/photo-1605980413988-9ff24c537935?auto=format&fit=crop&w=900&q=80",
    alt: "Rows of solar panels mounted on a residential rooftop",
    icon: Sun,
    title: "Rooftop arrays",
    body: "High-efficiency modules with panel-level optimizers, laid out to work around vents, dormers, and partial shade instead of pretending they are not there.",
  },
  {
    img: "https://images.unsplash.com/photo-1637417494521-78b4d1d33029?auto=format&fit=crop&w=900&q=80",
    alt: "Home battery storage unit installed on a wall",
    icon: BatteryCharging,
    title: "Battery-ready builds",
    body: "Conduit, breaker space, and inverter capacity provisioned on day one, so adding storage later is an afternoon job — not a re-wire.",
  },
  {
    img: "https://images.unsplash.com/photo-1583345237708-add35a664d77?auto=format&fit=crop&w=900&q=80",
    alt: "Electrician working on solar equipment wiring",
    icon: Wrench,
    title: "Service & upgrades",
    body: "Panel cleaning, inverter swaps, and system health checks for existing arrays — including ones we did not install.",
  },
];

const STEPS = [
  ["Remote assessment", "Satellite shade study plus a usage review from your recent utility bills."],
  ["Engineered design", "Stamped plans with production modeling you can compare line by line."],
  ["Install day", "Most residential arrays are mounted and wired in one to two days on site."],
  ["Inspection & PTO", "We handle inspection and utility permission-to-operate before switch-on."],
];

const MONITOR_POINTS = [
  { icon: CheckCircle2, strong: "Panel-level telemetry", rest: " — spot a shaded or faulted module without climbing on the roof." },
  { icon: CheckCircle2, strong: "Production alerts", rest: " — automatic flags when output drops below the modeled baseline." },
  { icon: CheckCircle2, strong: "Plain-language reports", rest: " — monthly summaries in kWh and dollars, not jargon." },
  { icon: ShieldCheck, strong: "Workmanship coverage", rest: " — 10-year labor warranty on every EcoVolt installation." },
];

const FAQS = [
  ["Will solar eliminate my electric bill?", "Usually not entirely. Most customers offset a large share of usage, but grid fees, weather, and rate structures mean some bill typically remains. Your quote models this for your utility."],
  ["Do I need a battery right away?", "No. Every EcoVolt system is wired battery-ready, so you can start with panels and add storage later if backup power or time-of-use rates make it worthwhile."],
  ["What happens on cloudy days?", "Output drops but does not stop — arrays still generate in diffuse light. Annual production modeling accounts for your local weather history."],
  ["Is my roof suitable?", "It depends on age, orientation, and shading. If a roof is a poor candidate, we say so in the assessment rather than designing around a bad fit."],
];

function QuoteButton({ ghost = false, small = false }) {
  return (
    <a
      className={`ecovolt-btn${ghost ? " ecovolt-btn--ghost" : ""}${small ? " ecovolt-btn--sm" : ""}`}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      Get a Free Quote <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}

function PhoneButton({ label = PHONE_TEXT }) {
  return (
    <a className="ecovolt-btn ecovolt-btn--ghost" href={PHONE_TEL}>
      <Phone size={17} aria-hidden="true" /> {label}
    </a>
  );
}

function Logo() {
  return (
    <>
      <span className="ecovolt-logo-badge">
        <Zap size={18} aria-hidden="true" />
      </span>
      Eco<em>Volt</em> Solar
    </>
  );
}

function Readout({ label, value, unit }) {
  return (
    <div className="ecovolt-readout" role="presentation">
      <div className="ecovolt-readout-label">
        <span className="ecovolt-readout-dot" /> {label}
      </div>
      <div className="ecovolt-readout-value">
        {value} <small>{unit}</small>
      </div>
    </div>
  );
}

export default function EcoVoltSolarPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="ecovolt-page">
      <header className="ecovolt-nav">
        <div className="ecovolt-nav-inner">
          <a href="#ecovolt-top" className="ecovolt-logo" aria-label="EcoVolt Solar home">
            <Logo />
          </a>
          <nav
            className={`ecovolt-nav-links${menuOpen ? " ecovolt-nav-links--open" : ""}`}
            aria-label="Primary"
          >
            {[["#ecovolt-systems", "Systems"], ["#ecovolt-process", "Process"], ["#ecovolt-monitoring", "Monitoring"], ["#ecovolt-faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </nav>
          <div className="ecovolt-nav-actions">
            <a className="ecovolt-nav-phone" href={PHONE_TEL}>
              <Phone size={15} aria-hidden="true" />
              <span>{PHONE_TEXT}</span>
            </a>
            <QuoteButton small />
            <button
              type="button"
              className="ecovolt-menu-btn"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <main id="ecovolt-top">
        {/* HERO */}
        <section className="ecovolt-hero">
          <div className="ecovolt-wrap ecovolt-hero-grid">
            <div>
              <span className="ecovolt-kicker">
                <Activity size={13} aria-hidden="true" /> Performance-first solar
              </span>
              <h1>
                Rooftop power, engineered like a <span>grid asset</span>
              </h1>
              <p className="ecovolt-hero-sub">
                EcoVolt Solar designs residential systems around measured output —
                panel-level monitoring, battery-ready wiring, and production
                estimates based on your actual roof, not a brochure average.
              </p>
              <div className="ecovolt-hero-ctas">
                <QuoteButton />
                <PhoneButton />
              </div>
              <div className="ecovolt-track" aria-hidden="true" />
            </div>
            <figure className="ecovolt-hero-figure">
              <div className="ecovolt-img-frame">
                <img
                  src="https://images.unsplash.com/photo-1655300256335-beef51a914fe?auto=format&fit=crop&w=1600&q=80"
                  alt="Technician inspecting a rooftop solar panel array under clear sky"
                />
              </div>
              <Readout label="LIVE ARRAY OUTPUT" value="7.42" unit="kW · sample dashboard" />
            </figure>
          </div>
        </section>

        {/* STATS */}
        <section className="ecovolt-section" aria-label="EcoVolt performance figures">
          <span className="ecovolt-node ecovolt-node--tl" aria-hidden="true" />
          <span className="ecovolt-node ecovolt-node--tr" aria-hidden="true" />
          <div className="ecovolt-wrap ecovolt-stats">
            {STATS.map((s) => (
              <div className="ecovolt-stat" key={s.num}>
                <div className="ecovolt-stat-num">{s.num}</div>
                <div className="ecovolt-stat-cap">{s.cap}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SYSTEMS */}
        <section className="ecovolt-section" id="ecovolt-systems">
          <span className="ecovolt-node ecovolt-node--tl" aria-hidden="true" />
          <span className="ecovolt-node ecovolt-node--br" aria-hidden="true" />
          <div className="ecovolt-wrap">
            <div className="ecovolt-head">
              <span className="ecovolt-kicker">
                <Sun size={13} aria-hidden="true" /> What we build
              </span>
              <h2>Systems sized to your roof and your bill</h2>
              <p>
                Every design starts with shade analysis and 12 months of usage
                data. Actual savings vary by roof, rates, and local incentives —
                your quote spells out the assumptions.
              </p>
            </div>
            <div className="ecovolt-cards">
              {CARDS.map((c) => (
                <article className="ecovolt-card" key={c.title}>
                  <div className="ecovolt-card-media">
                    <img src={c.img} alt={c.alt} loading="lazy" />
                  </div>
                  <div className="ecovolt-card-body">
                    <h3>
                      <c.icon size={19} aria-hidden="true" /> {c.title}
                    </h3>
                    <p>{c.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="ecovolt-section" id="ecovolt-process">
          <span className="ecovolt-node ecovolt-node--tl" aria-hidden="true" />
          <span className="ecovolt-node ecovolt-node--tr" aria-hidden="true" />
          <div className="ecovolt-wrap">
            <div className="ecovolt-head">
              <span className="ecovolt-kicker">
                <Gauge size={13} aria-hidden="true" /> How it works
              </span>
              <h2>From site survey to switch-on</h2>
              <p>
                Typical projects run four to ten weeks end to end, depending on
                your utility and local permitting timelines.
              </p>
            </div>
            <div className="ecovolt-steps">
              {STEPS.map(([title, body], i) => (
                <div className="ecovolt-step" key={title}>
                  <div className="ecovolt-step-idx">STEP_0{i + 1}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MID CTA */}
        <section className="ecovolt-section" aria-label="Get a quote">
          <div className="ecovolt-wrap">
            <div className="ecovolt-band">
              <div>
                <h2>See what your roof can actually produce</h2>
                <p>
                  A free, no-obligation quote with shade analysis and a
                  production estimate — numbers, not sales pressure.
                </p>
              </div>
              <div className="ecovolt-band-actions">
                <QuoteButton />
                <PhoneButton label={`Call ${PHONE_TEXT}`} />
              </div>
            </div>
          </div>
        </section>

        {/* MONITORING */}
        <section className="ecovolt-section" id="ecovolt-monitoring">
          <span className="ecovolt-node ecovolt-node--tl" aria-hidden="true" />
          <span className="ecovolt-node ecovolt-node--br" aria-hidden="true" />
          <div className="ecovolt-wrap ecovolt-split">
            <figure className="ecovolt-hero-figure">
              <div className="ecovolt-img-frame">
                <img
                  src="https://images.unsplash.com/photo-1630608354129-6a7704150401?auto=format&fit=crop&w=1600&q=80"
                  alt="Solar panels catching sunlight, seen at a low angle"
                  loading="lazy"
                />
              </div>
              <Readout label="TODAY · SAMPLE" value="31.8" unit="kWh generated" />
            </figure>
            <div>
              <span className="ecovolt-kicker">
                <Activity size={13} aria-hidden="true" /> Live monitoring
              </span>
              <h2 style={{ margin: "18px 0 6px", fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
                If a panel underperforms, you both know first
              </h2>
              <ul className="ecovolt-split-list">
                {MONITOR_POINTS.map((m) => (
                  <li key={m.strong}>
                    <m.icon size={18} aria-hidden="true" />
                    <span>
                      <strong>{m.strong}</strong>
                      {m.rest}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="ecovolt-track ecovolt-track--slow" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="ecovolt-section" id="ecovolt-faq">
          <span className="ecovolt-node ecovolt-node--tl" aria-hidden="true" />
          <div className="ecovolt-wrap">
            <div className="ecovolt-head">
              <h2>Straight answers</h2>
              <p>The questions homeowners actually ask, answered without the pitch.</p>
            </div>
            <div className="ecovolt-faq">
              {FAQS.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="ecovolt-section" aria-label="Final call to action">
          <div className="ecovolt-wrap">
            <div className="ecovolt-band">
              <div>
                <h2>Ready for a number, not a pitch?</h2>
                <p>
                  Request your free EcoVolt quote or talk to a system designer.
                  No door-knockers, no obligation.
                </p>
              </div>
              <div className="ecovolt-band-actions">
                <QuoteButton />
                <PhoneButton />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="ecovolt-footer">
        <div className="ecovolt-wrap">
          <div className="ecovolt-footer-grid">
            <a href="#ecovolt-top" className="ecovolt-logo" aria-label="Back to top">
              <Logo />
            </a>
            <a href={PHONE_TEL} className="ecovolt-nav-phone">
              <Phone size={15} aria-hidden="true" />
              <span>{PHONE_TEXT}</span>
            </a>
          </div>
          <div className="ecovolt-track ecovolt-track--slow" aria-hidden="true" />
          <p className="ecovolt-footer-note" style={{ marginTop: 22 }}>
            © {new Date().getFullYear()} EcoVolt Solar · Independent service provider listing ·
            Production figures are illustrative samples; actual results vary by site, weather, and utility rates.
          </p>
        </div>
      </footer>
    </div>
  );
}
