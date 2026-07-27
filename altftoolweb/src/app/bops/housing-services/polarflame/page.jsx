"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Gauge,
  Mail,
  Ruler,
  ShieldCheck,
  Snowflake,
  Thermometer,
  Wind,
  Wrench,
} from "lucide-react";
import "./polarflame.css";

// No quote partner and no phone line are live for this page, so every
// conversion CTA points at the site's real contact route.
const CONTACT_URL = "/policypages/contact";
const CONTACT_LABEL = "Contact us";
const TAGLINE = "Cold done hot. Heat done cool.";

const IMG = {
  hero: "https://images.unsplash.com/photo-1700124113583-81aa99ea2aa2?auto=format&fit=crop&w=1600&q=80",
  heatPump: "https://images.unsplash.com/photo-1757219525975-03b5984bc6e8?auto=format&fit=crop&w=900&q=80",
  cooling: "https://images.unsplash.com/photo-1776860150305-108ed577d7d4?auto=format&fit=crop&w=900&q=80",
  furnace: "https://images.unsplash.com/photo-1758798157512-f0a864c696c9?auto=format&fit=crop&w=900&q=80",
  comfort: "https://images.unsplash.com/photo-1780445392462-b7761551820c?auto=format&fit=crop&w=1600&q=80",
};

const MODES = {
  cold: { angle: -62, label: "Cooling mode — sized for humid July afternoons, not just the nameplate." },
  right: { angle: 0, label: "Right-sized — a Manual J load calculation puts the needle here." },
  heat: { angle: 62, label: "Heating mode — steady warmth without short-cycling on mild days." },
};

function QuoteButton({ className = "polarflame-btn", children }) {
  return (
    <a className={className} href={CONTACT_URL}>
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

function MarqueeRow() {
  return (
    <span className="polarflame-marquee-item">
      <span>{TAGLINE}</span>
      <Flame size={20} aria-hidden="true" />
      <span>Heat pumps</span>
      <Snowflake size={20} aria-hidden="true" />
      <span>AC</span>
      <Flame size={20} aria-hidden="true" />
      <span>Furnaces</span>
      <Snowflake size={20} aria-hidden="true" />
    </span>
  );
}

export default function PolarFlamePage() {
  const [mode, setMode] = useState("right");
  const ticks = [-80, -60, -40, -20, 0, 20, 40, 60, 80];

  return (
    <div className="polarflame-page">
      <header className="polarflame-nav">
        <div className="polarflame-nav-inner">
          <a href="#top" className="polarflame-logo polarflame-display" aria-label="PolarFlame HVAC home">
            <span className="polarflame-logo-mark" aria-hidden="true">
              <Thermometer size={20} />
            </span>
            Polar<b>Flame</b>
          </a>
          <nav className="polarflame-nav-links" aria-label="Sections">
            <a href="#services">Services</a>
            <a href="#sizing">Right-sizing</a>
            <a href="#why">Why PolarFlame</a>
          </nav>
          <a className="polarflame-nav-phone" href={CONTACT_URL}>
            <Mail size={16} aria-hidden="true" />
            {CONTACT_LABEL}
          </a>
          <QuoteButton>Get a Free Quote</QuoteButton>
        </div>
      </header>

      <main id="top">
        <section className="polarflame-hero">
          <div className="polarflame-wrap polarflame-hero-grid">
            <div>
              <p className="polarflame-kicker">
                <Gauge size={14} aria-hidden="true" /> PolarFlame HVAC — Housing Needs Directory
              </p>
              <h1 className="polarflame-display polarflame-h1">
                <span>Two extremes.</span>
                <span className="polarflame-h1-cold">One right size.</span>
              </h1>
              <p className="polarflame-tagline">{TAGLINE}</p>
              <p className="polarflame-hero-copy">
                Heat pumps, air conditioners, and furnaces matched to your home with a real
                load calculation — not a guess off the old unit&apos;s sticker. Licensed local
                pros, upfront written quotes, and honest advice on repair vs. replace.
              </p>
              <div className="polarflame-hero-ctas">
                <QuoteButton>Get a Free Quote</QuoteButton>
                <a className="polarflame-btn polarflame-btn--ghost" href={CONTACT_URL}>
                  <Mail size={18} aria-hidden="true" />
                  {CONTACT_LABEL}
                </a>
              </div>
              <ul className="polarflame-hero-chips">
                <li><ShieldCheck size={14} aria-hidden="true" /> Licensed &amp; insured</li>
                <li><Ruler size={14} aria-hidden="true" /> Manual J sizing</li>
                <li><Wrench size={14} aria-hidden="true" /> Repair-first honesty</li>
              </ul>
            </div>
            <figure className="polarflame-hero-figure">
              <div className="polarflame-duo polarflame-duo--split polarflame-hero-frame polarflame-ratio-hero">
                <img
                  src={IMG.hero}
                  alt="Modern home comfort system — the kind of installation PolarFlame sizes and fits"
                />
              </div>
              <p className="polarflame-hero-badge" aria-hidden="true">
                <span>Sized right or we re-run the math</span>
              </p>
            </figure>
          </div>
        </section>

        <div className="polarflame-marquee" aria-hidden="true">
          <div className="polarflame-marquee-track">
            <MarqueeRow />
            <MarqueeRow />
            <MarqueeRow />
            <MarqueeRow />
          </div>
        </div>

        <section id="services" className="polarflame-section">
          <div className="polarflame-wrap">
            <p className="polarflame-kicker"><Wind size={14} aria-hidden="true" /> What we do</p>
            <h2 className="polarflame-display polarflame-h2">Both ends of the dial</h2>
            <p className="polarflame-lede">
              Every job starts with your home&apos;s actual heating and cooling load. Then we
              quote equipment that fits it — nothing oversized, nothing underpowered.
            </p>
            <div className="polarflame-cards">
              <article className="polarflame-card">
                <div className="polarflame-duo polarflame-duo--heat polarflame-ratio-card">
                  <img src={IMG.heatPump} alt="Outdoor heat pump unit installed beside a home" loading="lazy" />
                </div>
                <div className="polarflame-card-body">
                  <h3 className="polarflame-display"><Flame size={22} aria-hidden="true" /> Heat pumps</h3>
                  <p>
                    Cold-climate heat pump installs and replacements, with backup-heat planning
                    for the coldest snaps. We&apos;ll tell you plainly if your home and rates
                    make a heat pump the smart move — or not.
                  </p>
                  <a className="polarflame-card-link" href={CONTACT_URL}>
                    Quote a heat pump <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </div>
              </article>
              <article className="polarflame-card polarflame-card--cold">
                <div className="polarflame-duo polarflame-duo--cold polarflame-ratio-card">
                  <img src={IMG.cooling} alt="Air conditioning equipment keeping a residence cool" loading="lazy" />
                </div>
                <div className="polarflame-card-body">
                  <h3 className="polarflame-display"><Snowflake size={22} aria-hidden="true" /> Air conditioning</h3>
                  <p>
                    Central AC and ductless mini-split installs, tune-ups, and refrigerant-safe
                    repairs. Right-sized systems dehumidify properly instead of blasting and
                    stopping — that&apos;s where comfort actually comes from.
                  </p>
                  <a className="polarflame-card-link" href={CONTACT_URL}>
                    Quote cooling <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </div>
              </article>
              <article className="polarflame-card">
                <div className="polarflame-duo polarflame-duo--heat polarflame-ratio-card">
                  <img src={IMG.furnace} alt="Residential furnace and ductwork in a utility space" loading="lazy" />
                </div>
                <div className="polarflame-card-body">
                  <h3 className="polarflame-display"><Flame size={22} aria-hidden="true" /> Furnaces</h3>
                  <p>
                    High-efficiency gas furnace replacement and repair, combustion safety checks
                    included. If a repair buys your current unit a few more good winters,
                    that&apos;s what we&apos;ll recommend first.
                  </p>
                  <a className="polarflame-card-link" href={CONTACT_URL}>
                    Quote a furnace <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="sizing" className="polarflame-section polarflame-section--paper">
          <div className="polarflame-wrap">
            <p className="polarflame-kicker"><Ruler size={14} aria-hidden="true" /> The PolarFlame dial</p>
            <h2 className="polarflame-display polarflame-h2">Sized right beats sized big</h2>
            <div className="polarflame-gauge-grid">
              <div className="polarflame-gauge-figure">
                <svg
                  className="polarflame-gauge-svg"
                  viewBox="0 0 400 230"
                  role="img"
                  aria-label={`Half-dial thermometer gauge, currently showing: ${MODES[mode].label}`}
                >
                  <defs>
                    <linearGradient id="polarflameArc" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#00b7e8" />
                      <stop offset="42%" stopColor="#2b2e83" />
                      <stop offset="58%" stopColor="#e6007e" />
                      <stop offset="100%" stopColor="#ff6a00" />
                    </linearGradient>
                  </defs>
                  <path d="M 40 200 A 160 160 0 0 1 360 200" fill="none" stroke="#151121" strokeWidth="34" strokeLinecap="round" />
                  <path d="M 40 200 A 160 160 0 0 1 360 200" fill="none" stroke="url(#polarflameArc)" strokeWidth="22" strokeLinecap="round" />
                  {ticks.map((a) => (
                    <line
                      key={a}
                      x1="200" y1="52" x2="200" y2="66"
                      stroke="#151121" strokeWidth={a === 0 ? 6 : 3}
                      transform={`rotate(${a} 200 200)`}
                    />
                  ))}
                  <g className="polarflame-gauge-needle" style={{ "--polarflame-needle": `${MODES[mode].angle}deg` }}>
                    <polygon points="194,204 200,64 206,204" fill="#151121" />
                    <circle cx="200" cy="200" r="16" fill="#151121" />
                    <circle cx="200" cy="200" r="7" fill="#f7f3ec" />
                  </g>
                  <text x="52" y="228" fontSize="15" fontWeight="800" fill="#2b2e83">COLD</text>
                  <text x="306" y="228" fontSize="15" fontWeight="800" fill="#e6007e">HEAT</text>
                </svg>
                <div className="polarflame-gauge-modes" role="group" aria-label="Preview gauge modes">
                  <button type="button" aria-pressed={mode === "cold"} onClick={() => setMode("cold")}>Cold</button>
                  <button type="button" aria-pressed={mode === "right"} onClick={() => setMode("right")}>Sized right</button>
                  <button type="button" aria-pressed={mode === "heat"} onClick={() => setMode("heat")}>Heat</button>
                </div>
                <p className="polarflame-gauge-readout">{MODES[mode].label}</p>
              </div>
              <div>
                <p className="polarflame-lede">
                  An oversized system short-cycles, leaves humidity behind, and wears out early.
                  An undersized one never catches up. Our fix is boring and effective:
                </p>
                <ul className="polarflame-checklist">
                  <li>
                    <CheckCircle2 size={20} aria-hidden="true" />
                    <span><b>Room-by-room load calculation</b> Insulation, windows, ductwork, and
                    orientation — measured, not assumed from square footage alone.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={20} aria-hidden="true" />
                    <span><b>Options in plain numbers</b> Good, better, and best quotes with
                    operating-cost estimates, so the trade-offs are yours to judge.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={20} aria-hidden="true" />
                    <span><b>Commissioning, not just installing</b> Airflow, refrigerant charge,
                    and thermostat staging verified before we call the job done.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="polarflame-band" aria-label="Quote call to action">
          <div className="polarflame-wrap polarflame-band-inner">
            <div>
              <h2 className="polarflame-display">{TAGLINE}</h2>
              <p>Tell us about your home and get a no-pressure quote — usually within one business day.</p>
            </div>
            <div className="polarflame-band-actions">
              <QuoteButton className="polarflame-btn polarflame-btn--paper">Get a Free Quote</QuoteButton>
              <a className="polarflame-btn polarflame-btn--ghost" href={CONTACT_URL}>
                <Mail size={18} aria-hidden="true" /> {CONTACT_LABEL}
              </a>
            </div>
          </div>
        </section>

        <section id="why" className="polarflame-section">
          <div className="polarflame-wrap polarflame-why-grid">
            <div className="polarflame-duo polarflame-duo--cold polarflame-ratio-wide">
              <img
                src={IMG.comfort}
                alt="Comfortable, evenly conditioned living space"
                loading="lazy"
              />
            </div>
            <div>
              <p className="polarflame-kicker"><ShieldCheck size={14} aria-hidden="true" /> Why homeowners choose us</p>
              <h2 className="polarflame-display polarflame-h2">Comfort you can measure</h2>
              <p className="polarflame-lede">
                We&apos;re a fictional-sounding name with a very unfictional habit: writing
                everything down. Scope, price, timeline, and what happens if we find a surprise
                behind the wall.
              </p>
              <div className="polarflame-stats">
                <div className="polarflame-stat"><b>100%</b><span>of installs quoted in writing before work begins</span></div>
                <div className="polarflame-stat"><b>Load calc</b><span>performed on every replacement we propose</span></div>
                <div className="polarflame-stat"><b>Same week</b><span>appointments available in most service areas</span></div>
                <div className="polarflame-stat"><b>No pressure</b><span>repair-first recommendations when repair makes sense</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="polarflame-band polarflame-final" aria-label="Final call to action">
          <div className="polarflame-wrap">
            <p className="polarflame-tagline">{TAGLINE}</p>
            <h2 className="polarflame-display">Ready when your thermostat isn&apos;t</h2>
            <div className="polarflame-final-actions">
              <QuoteButton className="polarflame-btn polarflame-btn--paper">Get a Free Quote</QuoteButton>
              <a className="polarflame-btn polarflame-btn--ghost" href={CONTACT_URL}>
                <Mail size={18} aria-hidden="true" /> {CONTACT_LABEL}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="polarflame-footer">
        <div className="polarflame-wrap polarflame-footer-inner">
          <span className="polarflame-display" style={{ fontSize: "1.2rem" }}>PolarFlame HVAC</span>
          <a href={CONTACT_URL}>{CONTACT_LABEL}</a>
          <a href={CONTACT_URL}>Get a Free Quote</a>
          <span className="polarflame-footer-note">
            Independent service provider listing. PolarFlame is a fictional brand shown for
            directory purposes; availability, pricing, and timelines vary by location and season.
          </span>
        </div>
      </footer>
    </div>
  );
}
