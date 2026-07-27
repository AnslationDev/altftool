"use client";

import { useState } from "react";
import {
  Sun,
  Mail,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  PiggyBank,
  ShieldCheck,
  BatteryCharging,
  Smartphone,
  BellRing,
  Zap,
  Home,
  Leaf,
  ChevronDown,
  ClipboardCheck,
  Wrench,
} from "lucide-react";
import "./sunyield-solar.css";

// No quote partner and no phone line are live for this page, so every
// conversion CTA points at the site's real contact route.
const CONTACT_URL = "/policypages/contact";
const CONTACT_LABEL = "Contact us";

const IMG = {
  hero: "https://images.unsplash.com/photo-1509389928833-fe62aef36deb?auto=format&fit=crop&w=1600&q=80",
  install: "https://images.unsplash.com/photo-1530951226911-640987bd484c?auto=format&fit=crop&w=900&q=80",
  battery: "https://images.unsplash.com/photo-1660330589257-813305a4a383?auto=format&fit=crop&w=900&q=80",
  galleryA: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=900&q=80",
  galleryB: "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?auto=format&fit=crop&w=900&q=80",
  galleryC: "https://images.unsplash.com/photo-1635335874521-7987db781153?auto=format&fit=crop&w=900&q=80",
};

const FAQS = [
  {
    q: "How much can I really save with home solar?",
    a: "Most SunYield households offset 50-70% of their monthly electric bill, depending on roof orientation, local rates, and system size. Your free quote includes a personalized savings projection before you commit to anything.",
  },
  {
    q: "What happens on cloudy days or at night?",
    a: "Your panels still generate on overcast days, just at reduced output. With an optional SunYield home battery, excess daytime energy is stored and released after sunset, so your home keeps running on sunshine around the clock.",
  },
  {
    q: "Do I need to replace my roof first?",
    a: "Not necessarily. Every installation starts with a structural roof assessment. If your roof has 10+ years of life left, we typically install right on top. If not, we will tell you honestly before any work begins.",
  },
  {
    q: "How long does installation take?",
    a: "Most residential systems are installed in one to two days on-site. Permitting and utility interconnection add a few weeks, and your SunYield coordinator handles all of that paperwork for you.",
  },
  {
    q: "Is there really a 25-year warranty?",
    a: "Yes. Panels carry a 25-year manufacturer performance warranty, and SunYield backs the workmanship of the installation itself, including roof penetrations, wiring, and mounting hardware.",
  },
];

function QuoteButton({ className = "sunyield-btn sunyield-btn-primary", children }) {
  return (
    <a
      className={className}
      href={CONTACT_URL}
    >
      {children}
    </a>
  );
}

export default function SunYieldSolarPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="sunyield-page">
      {/* ============ Nav ============ */}
      <header className="sunyield-nav">
        <div className="sunyield-nav-inner">
          <a className="sunyield-brand" href="#sunyield-top" aria-label="SunYield Solar home">
            <span className="sunyield-brand-badge" aria-hidden="true">
              <Sun size={22} />
            </span>
            SunYield Solar
          </a>

          <ul className="sunyield-nav-links" data-open={menuOpen} id="sunyield-nav-menu">
            <li><a href="#sunyield-why" onClick={() => setMenuOpen(false)}>Why Solar</a></li>
            <li><a href="#sunyield-how" onClick={() => setMenuOpen(false)}>How It Works</a></li>
            <li><a href="#sunyield-battery" onClick={() => setMenuOpen(false)}>Battery + App</a></li>
            <li><a href="#sunyield-gallery" onClick={() => setMenuOpen(false)}>Recent Work</a></li>
            <li><a href="#sunyield-faq" onClick={() => setMenuOpen(false)}>FAQ</a></li>
          </ul>

          <div className="sunyield-nav-cta">
            <a className="sunyield-nav-phone" href={CONTACT_URL}>
              <Mail size={17} aria-hidden="true" />
              <span>{CONTACT_LABEL}</span>
            </a>
            <QuoteButton className="sunyield-btn sunyield-btn-primary sunyield-btn-sm">
              Get a Free Quote
            </QuoteButton>
            <button
              type="button"
              className="sunyield-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="sunyield-nav-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <main id="sunyield-top">
        {/* ============ Hero ============ */}
        <section className="sunyield-hero">
          <div className="sunyield-hero-rays" aria-hidden="true" />
          <div className="sunyield-wrap sunyield-hero-inner">
            <div className="sunyield-hero-copy">
              <p className="sunyield-eyebrow">
                <Sun size={14} aria-hidden="true" /> Home solar, battery &amp; monitoring
              </p>
              <h1>
                Your roof is a <span>power plant</span> waiting to happen.
              </h1>
              <p className="sunyield-hero-sub">
                SunYield Solar designs, installs, and monitors home solar systems
                with battery backup — so you can trade rising utility bills for
                sunshine you already own.
              </p>
              <div className="sunyield-hero-actions">
                <QuoteButton>
                  Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
                </QuoteButton>
                <a className="sunyield-btn sunyield-btn-ghost" href={CONTACT_URL}>
                  <Mail size={18} aria-hidden="true" /> {CONTACT_LABEL}
                </a>
              </div>
              <ul className="sunyield-hero-ticks">
                <li><CheckCircle2 size={16} aria-hidden="true" /> $0-down options</li>
                <li><CheckCircle2 size={16} aria-hidden="true" /> Certified installers</li>
                <li><CheckCircle2 size={16} aria-hidden="true" /> No-pressure quotes</li>
              </ul>
            </div>

            <div className="sunyield-hero-figure">
              <div className="sunyield-blob">
                <img
                  src={IMG.hero}
                  alt="Rooftop solar panels glowing under a warm sunset sky"
                />
              </div>
              <div className="sunyield-hero-chip sunyield-hero-chip-a">
                <PiggyBank size={22} aria-hidden="true" />
                <span>
                  Save up to 70%
                  <small>on monthly energy bills</small>
                </span>
              </div>
              <div className="sunyield-hero-chip sunyield-hero-chip-b">
                <ShieldCheck size={22} aria-hidden="true" />
                <span>
                  25-yr warranty
                  <small>panels &amp; workmanship</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ Stats ============ */}
        <section className="sunyield-stats" aria-label="SunYield Solar highlights">
          <div className="sunyield-wrap sunyield-stats-grid">
            <div className="sunyield-stat-card">
              <div className="sunyield-stat-value">70%</div>
              <div className="sunyield-stat-label">Save up to 70% on energy bills</div>
            </div>
            <div className="sunyield-stat-card">
              <div className="sunyield-stat-value">25 yrs</div>
              <div className="sunyield-stat-label">Panel performance warranty</div>
            </div>
            <div className="sunyield-stat-card">
              <div className="sunyield-stat-value">1-2 days</div>
              <div className="sunyield-stat-label">Typical on-site installation</div>
            </div>
            <div className="sunyield-stat-card">
              <div className="sunyield-stat-value">24/7</div>
              <div className="sunyield-stat-label">App-based system monitoring</div>
            </div>
          </div>
        </section>

        {/* ============ Why Solar ============ */}
        <section className="sunyield-section" id="sunyield-why">
          <div className="sunyield-wrap sunyield-split">
            <div>
              <span className="sunyield-kicker">Why go solar with SunYield</span>
              <h2>Sunshine is the only utility that never raises its rates.</h2>
              <p className="sunyield-section-lead">
                Every system is custom-designed around your roof, your usage, and
                your goals — never a one-size-fits-all kit.
              </p>
              <ul className="sunyield-benefit-list">
                <li>
                  <span className="sunyield-benefit-icon" aria-hidden="true"><PiggyBank size={22} /></span>
                  <div>
                    <h3>Lower bills from day one</h3>
                    <p>Generate your own power and watch the meter slow down — many homes offset 50-70% of usage.</p>
                  </div>
                </li>
                <li>
                  <span className="sunyield-benefit-icon" aria-hidden="true"><Home size={22} /></span>
                  <div>
                    <h3>Add value to your home</h3>
                    <p>Owned solar systems consistently rank among the upgrades buyers pay a premium for.</p>
                  </div>
                </li>
                <li>
                  <span className="sunyield-benefit-icon" aria-hidden="true"><Leaf size={22} /></span>
                  <div>
                    <h3>Cleaner energy, quietly</h3>
                    <p>No noise, no fumes, no moving parts — just panels soaking up daylight on your roof.</p>
                  </div>
                </li>
              </ul>
              <QuoteButton>
                See my savings estimate <ArrowRight size={18} aria-hidden="true" />
              </QuoteButton>
            </div>
            <div className="sunyield-split-media">
              <img
                src={IMG.install}
                alt="Technician installing a solar panel array on a residential rooftop"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* ============ How It Works ============ */}
        <section className="sunyield-section sunyield-section-alt" id="sunyield-how">
          <div className="sunyield-wrap">
            <span className="sunyield-kicker">How it works</span>
            <h2>From free quote to first sunny kilowatt in three easy steps.</h2>
            <p className="sunyield-section-lead">
              We handle the design, permits, paperwork, and utility coordination.
              You handle enjoying a smaller electric bill.
            </p>
            <div className="sunyield-steps">
              <article className="sunyield-step-card">
                <span className="sunyield-step-num" aria-hidden="true">1</span>
                <h3><ClipboardCheck size={18} aria-hidden="true" /> Free custom quote</h3>
                <p>
                  Share your address and a recent bill. We map your roof with
                  satellite imagery and model your production, savings, and
                  payback — no site visit required to get started.
                </p>
              </article>
              <article className="sunyield-step-card">
                <span className="sunyield-step-num" aria-hidden="true">2</span>
                <h3><Wrench size={18} aria-hidden="true" /> Expert installation</h3>
                <p>
                  Certified SunYield crews complete most residential installs in
                  one to two days, with clean wiring, sealed roof penetrations,
                  and a full walkthrough before we leave.
                </p>
              </article>
              <article className="sunyield-step-card">
                <span className="sunyield-step-num" aria-hidden="true">3</span>
                <h3><Zap size={18} aria-hidden="true" /> Flip the sunshine on</h3>
                <p>
                  After utility approval, your system goes live. Track every
                  kilowatt in the SunYield app and watch your savings stack up
                  month after month.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ============ Battery + App strip ============ */}
        <section className="sunyield-section" id="sunyield-battery">
          <div className="sunyield-wrap">
            <div className="sunyield-battery">
              <div>
                <span className="sunyield-kicker">Battery + app monitoring</span>
                <h2>Keep the lights on after sundown — and during outages.</h2>
                <p>
                  Pair your panels with a SunYield home battery and the free
                  monitoring app. Store your extra afternoon sunshine, use it at
                  night, and stay powered when the grid is not.
                </p>
                <ul className="sunyield-battery-features">
                  <li>
                    <span className="sunyield-battery-icon" aria-hidden="true"><BatteryCharging size={22} /></span>
                    <div>
                      <h3>Whole-home backup</h3>
                      <p>Seamless switchover keeps essentials running through outages.</p>
                    </div>
                  </li>
                  <li>
                    <span className="sunyield-battery-icon" aria-hidden="true"><Smartphone size={22} /></span>
                    <div>
                      <h3>Live app dashboard</h3>
                      <p>Watch production, storage, and usage in real time from anywhere.</p>
                    </div>
                  </li>
                  <li>
                    <span className="sunyield-battery-icon" aria-hidden="true"><Zap size={22} /></span>
                    <div>
                      <h3>Smart peak shaving</h3>
                      <p>Automatically use stored power when utility rates spike.</p>
                    </div>
                  </li>
                  <li>
                    <span className="sunyield-battery-icon" aria-hidden="true"><BellRing size={22} /></span>
                    <div>
                      <h3>Proactive alerts</h3>
                      <p>We monitor system health 24/7 and flag issues before you notice.</p>
                    </div>
                  </li>
                </ul>
                <QuoteButton className="sunyield-btn sunyield-btn-light">
                  Add battery to my quote <ArrowRight size={18} aria-hidden="true" />
                </QuoteButton>
              </div>
              <div className="sunyield-battery-media">
                <img
                  src={IMG.battery}
                  alt="Modern home energy battery storage unit mounted on a wall"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============ Gallery ============ */}
        <section className="sunyield-section sunyield-section-alt" id="sunyield-gallery">
          <div className="sunyield-wrap">
            <span className="sunyield-kicker">Recent work</span>
            <h2>Real roofs, real sunshine, really smaller bills.</h2>
            <p className="sunyield-section-lead">
              A few of the homes we have helped switch to solar — from compact
              starter arrays to full battery-backed systems.
            </p>
            <div className="sunyield-gallery">
              <article className="sunyield-gallery-card">
                <div className="sunyield-gallery-media">
                  <img
                    src={IMG.galleryA}
                    alt="Aerial view of a suburban home with a full rooftop solar array"
                    loading="lazy"
                  />
                </div>
                <div className="sunyield-gallery-body">
                  <h3>Full-roof family system</h3>
                  <p>9.6 kW array sized to cover nearly all of a busy household's usage.</p>
                </div>
              </article>
              <article className="sunyield-gallery-card">
                <div className="sunyield-gallery-media">
                  <img
                    src={IMG.galleryB}
                    alt="Close-up of solar panel cells reflecting bright blue sky"
                    loading="lazy"
                  />
                </div>
                <div className="sunyield-gallery-body">
                  <h3>High-efficiency panels</h3>
                  <p>Premium modules that keep producing even in partial shade.</p>
                </div>
              </article>
              <article className="sunyield-gallery-card">
                <div className="sunyield-gallery-media">
                  <img
                    src={IMG.galleryC}
                    alt="Rows of solar panels installed across a sunlit residential roof"
                    loading="lazy"
                  />
                </div>
                <div className="sunyield-gallery-body">
                  <h3>Battery-backed install</h3>
                  <p>Solar plus storage for a home that stays lit through every outage.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ============ Mid-page CTA ============ */}
        <section className="sunyield-section" aria-label="Request a quote">
          <div className="sunyield-wrap">
            <div className="sunyield-midcta">
              <div>
                <h2>Curious what your roof could earn?</h2>
                <p>Free quote. Real numbers. Zero pressure.</p>
              </div>
              <div className="sunyield-midcta-actions">
                <QuoteButton className="sunyield-btn sunyield-btn-light">
                  Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
                </QuoteButton>
                <a className="sunyield-btn sunyield-btn-ghost" href={CONTACT_URL}>
                  <Mail size={18} aria-hidden="true" /> {CONTACT_LABEL}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="sunyield-section sunyield-section-alt" id="sunyield-faq">
          <div className="sunyield-wrap">
            <span className="sunyield-kicker">Good questions</span>
            <h2>Everything homeowners ask us before going solar.</h2>
            <p className="sunyield-section-lead">
              Still wondering about something? Contact us — a real person replies.
            </p>
            <div className="sunyield-faq">
              {FAQS.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div className="sunyield-faq-item" data-open={open} key={item.q}>
                    <h3 style={{ margin: 0 }}>
                      <button
                        type="button"
                        className="sunyield-faq-q"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? -1 : i)}
                      >
                        {item.q}
                        <ChevronDown size={20} className="sunyield-faq-chevron" aria-hidden="true" />
                      </button>
                    </h3>
                    {open && <p className="sunyield-faq-a">{item.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ Final CTA band ============ */}
        <section className="sunyield-final">
          <div className="sunyield-wrap">
            <h2>Ready to put your roof to work?</h2>
            <p>
              Get a free, personalized solar and battery quote from SunYield
              Solar — savings projection included, commitment not.
            </p>
            <div className="sunyield-final-actions">
              <QuoteButton className="sunyield-btn sunyield-btn-light">
                Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
              </QuoteButton>
              <a className="sunyield-btn sunyield-btn-ghost" href={CONTACT_URL}>
                <Mail size={18} aria-hidden="true" /> {CONTACT_LABEL}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ============ Footer ============ */}
      <footer className="sunyield-footer">
        <div className="sunyield-wrap sunyield-footer-inner">
          <a className="sunyield-brand" href="#sunyield-top">
            <span className="sunyield-brand-badge" aria-hidden="true">
              <Sun size={20} />
            </span>
            SunYield Solar
          </a>
          <a className="sunyield-footer-phone" href={CONTACT_URL}>
            <Mail size={16} aria-hidden="true" /> {CONTACT_LABEL}
          </a>
          <p className="sunyield-footer-note">
            Independent service provider listing. SunYield Solar is a fictional
            brand presented for directory demonstration purposes. Savings vary
            by roof, location, utility rates, and system size.
          </p>
        </div>
      </footer>
    </div>
  );
}
