"use client";

import { useState } from "react";
import {
  Cctv,
  Fingerprint,
  Siren,
  ShieldCheck,
  PhoneCall,
  ArrowRight,
  Check,
  Menu,
  X,
  Plus,
  Wrench,
  BadgeCheck,
  MapPin,
} from "lucide-react";
import "./irongate-security.css";

// No quote partner and no phone line are live for this page, so every
// conversion CTA points at the site's real contact route.
const CONTACT_URL = "/policypages/contact";
const CONTACT_LABEL = "Contact us";

const IMG = {
  heroCamera:
    "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=80",
  domeCamera:
    "https://images.unsplash.com/photo-1529490738614-4a83c19ed6b2?auto=format&fit=crop&w=900&q=80",
  accessPanel:
    "https://images.unsplash.com/photo-1713857297379-6fc26e70f581?auto=format&fit=crop&w=900&q=80",
  monitoring:
    "https://images.unsplash.com/photo-1665655034566-d0f219bd23b3?auto=format&fit=crop&w=900&q=80",
  installWide:
    "https://images.unsplash.com/photo-1670278458296-00ff8a63141e?auto=format&fit=crop&w=1600&q=80",
  perimeter:
    "https://images.unsplash.com/photo-1723187939911-cb1a229e5adb?auto=format&fit=crop&w=900&q=80",
  domeCameraWide:
    "https://images.unsplash.com/photo-1529490738614-4a83c19ed6b2?auto=format&fit=crop&w=1600&q=80",
};

const SERVICES = [
  {
    icon: Cctv,
    tag: "Surveillance",
    title: "Commercial Camera Systems",
    img: IMG.domeCamera,
    alt: "Dome security camera mounted on an exterior wall of a commercial building",
    body: "4K IP cameras with night vision, wide dynamic range, and 30-day onsite retention. Engineered layouts eliminate blind spots at entries, docks, and lots.",
    points: ["4K IP + thermal options", "License plate capture", "Remote viewing apps"],
  },
  {
    icon: Fingerprint,
    tag: "Access Control",
    title: "Keycard & Biometric Access",
    img: IMG.accessPanel,
    alt: "Electronic access control keypad installed beside a secured entry door",
    body: "Control every door from one dashboard. Badge, fob, mobile credential, or biometric entry with full audit trails and instant lockdown capability.",
    points: ["Cloud-managed doors", "Time-based permissions", "Instant credential revoke"],
  },
  {
    icon: Siren,
    tag: "Alarms",
    title: "24/7 Monitored Alarms",
    img: IMG.monitoring,
    alt: "Security operations monitoring station with live camera feeds on displays",
    body: "UL-listed central station monitoring with police, fire, and medical dispatch. Cellular backup keeps the line open even when power and internet fail.",
    points: ["UL-listed monitoring", "Cellular + battery backup", "Glass-break and motion"],
  },
];

const STEPS = [
  {
    title: "Site Assessment",
    body: "A licensed technician walks your property, maps vulnerabilities, and documents sight lines before anything is quoted.",
  },
  {
    title: "Fixed-Price Design",
    body: "You get a line-item system design with hardware specs and one flat installation price. No allowances, no surprises.",
  },
  {
    title: "Licensed Install",
    body: "Background-checked, factory-certified installers mount, wire, and commission every device to spec — typically in one visit.",
  },
  {
    title: "Live Monitoring",
    body: "Your system goes live on our UL-listed monitoring network the same day, with a full walkthrough of every control.",
  },
];

const FAQS = [
  {
    q: "Do you install for both businesses and homes?",
    a: "Yes. IronGate is built around commercial-grade hardware, and we install the same equipment for warehouses, storefronts, offices, multi-family buildings, and residential properties that want more than consumer gear.",
  },
  {
    q: "How fast can a system be installed?",
    a: "Most single-site installations are completed in one visit within 5 to 7 business days of the assessment. Multi-door access control and large camera counts may take two visits.",
  },
  {
    q: "Is there a long-term monitoring contract?",
    a: "Monitoring plans are month-to-month after the first year. Pricing is quoted flat during the assessment, and there are no automatic rate escalators buried in the agreement.",
  },
  {
    q: "Can you take over an existing camera or alarm system?",
    a: "In most cases, yes. Our technicians can re-commission existing wiring, panels, and compatible cameras, replacing only what fails inspection — which usually cuts the quoted price significantly.",
  },
];

function QuoteButton({ variant = "irongate-btn-red", label = "Get a Free Quote" }) {
  return (
    <a
      className={`irongate-btn ${variant}`}
      href={CONTACT_URL}
    >
      {label}
      <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}

export default function IronGateSecurityPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="irongate-root">
      {/* ================= NAV ================= */}
      <header className="irongate-nav">
        <div className="irongate-nav-inner">
          <a className="irongate-brand" href="#top" aria-label="IronGate Security home">
            <span className="irongate-brand-mark" aria-hidden="true">
              <ShieldCheck size={21} />
            </span>
            Iron<em>Gate</em>
          </a>

          <nav aria-label="Primary">
            <ul className="irongate-nav-links" data-open={navOpen}>
              <li><a href="#services" onClick={() => setNavOpen(false)}>Services</a></li>
              <li><a href="#process" onClick={() => setNavOpen(false)}>Process</a></li>
              <li><a href="#coverage" onClick={() => setNavOpen(false)}>Coverage</a></li>
              <li><a href="#faq" onClick={() => setNavOpen(false)}>FAQ</a></li>
            </ul>
          </nav>

          <div className="irongate-nav-cta">
            <a className="irongate-nav-phone" href={CONTACT_URL}>
              <PhoneCall size={17} aria-hidden="true" />
              <span>{CONTACT_LABEL}</span>
            </a>
            <QuoteButton />
            <button
              type="button"
              className="irongate-nav-toggle"
              aria-expanded={navOpen}
              aria-label={navOpen ? "Close menu" : "Open menu"}
              onClick={() => setNavOpen((v) => !v)}
            >
              {navOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ================= HERO ================= */}
        <section className="irongate-hero" aria-label="IronGate Security overview">
          <div className="irongate-hero-media">
            <img
              src={IMG.heroCamera}
              alt="Industrial security camera watching a commercial property at dusk"
            />
            <div className="irongate-hero-vignette" aria-hidden="true" />
          </div>

          <div className="irongate-wrap">
            <div className="irongate-hero-inner">
              <span className="irongate-rec">
                <span className="irongate-rec-dot" aria-hidden="true" />
                Recording 24/7
              </span>
              <h1>
                Commercial-Grade Security. <span>Installed Right.</span>
              </h1>
              <p>
                Cameras, access control, and monitored alarms engineered for
                businesses and hardened homes — designed, installed, and
                monitored by licensed professionals. One assessment. One
                fixed price. Zero blind spots.
              </p>
              <div className="irongate-hero-actions">
                <QuoteButton />
                <a className="irongate-btn irongate-btn-steel" href={CONTACT_URL}>
                  <PhoneCall size={17} aria-hidden="true" />
                  {CONTACT_LABEL}
                </a>
              </div>
              <ul className="irongate-hero-ticks">
                <li><Check size={15} aria-hidden="true" /> Licensed &amp; insured</li>
                <li><Check size={15} aria-hidden="true" /> UL-listed monitoring</li>
                <li><Check size={15} aria-hidden="true" /> Free site assessment</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="irongate-stats" aria-label="Company statistics">
          <div className="irongate-wrap">
            <div className="irongate-stats-grid">
              <div className="irongate-stat"><strong>4,200+</strong><span>Systems installed</span></div>
              <div className="irongate-stat"><strong>24/7</strong><span>Central monitoring</span></div>
              <div className="irongate-stat"><strong>60s</strong><span>Avg. dispatch time</span></div>
              <div className="irongate-stat"><strong>12 yr</strong><span>Hardware warranty</span></div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}
        <section className="irongate-section" id="services">
          <div className="irongate-wrap">
            <div className="irongate-section-head">
              <span className="irongate-kicker">What We Install</span>
              <h2>Three Layers of Defense, One Team</h2>
              <p>
                Every IronGate system is built from commercial hardware — the
                same equipment specified for warehouses and banking floors —
                scaled to your property and budget.
              </p>
            </div>

            <div className="irongate-services-grid">
              {SERVICES.map((s) => (
                <article className="irongate-card irongate-panel" key={s.title}>
                  <div className="irongate-card-media">
                    <img src={s.img} alt={s.alt} loading="lazy" />
                    <span className="irongate-card-tag">{s.tag}</span>
                  </div>
                  <div className="irongate-card-body">
                    <h3>
                      <s.icon size={20} aria-hidden="true" />
                      {s.title}
                    </h3>
                    <p>{s.body}</p>
                    <ul className="irongate-card-list">
                      {s.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= MID CTA BAND ================= */}
        <section className="irongate-band" aria-label="Request a quote">
          <div className="irongate-band-media">
            <img
              src={IMG.installWide}
              alt="Technician installing a commercial security camera on a building exterior"
              loading="lazy"
            />
            <div className="irongate-band-shade" aria-hidden="true" />
          </div>
          <div className="irongate-wrap">
            <div className="irongate-band-inner">
              <h2>
                Get a Fixed-Price System Design — <span>Free, No Obligation</span>
              </h2>
              <div className="irongate-band-actions">
                <QuoteButton />
                <a className="irongate-btn irongate-btn-steel" href={CONTACT_URL}>
                  <PhoneCall size={17} aria-hidden="true" />
                  {CONTACT_LABEL}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PROCESS ================= */}
        <section className="irongate-section" id="process">
          <div className="irongate-wrap">
            <div className="irongate-section-head">
              <span className="irongate-kicker">How It Works</span>
              <h2>From Walkthrough to Watchtower in Four Steps</h2>
              <p>
                No pushy sales calls, no vague estimates. A licensed technician
                handles your project end-to-end.
              </p>
            </div>

            <div className="irongate-process-grid">
              {STEPS.map((step, i) => (
                <article className="irongate-step irongate-panel" key={step.title}>
                  <div className="irongate-step-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= COVERAGE ================= */}
        <section className="irongate-section irongate-section-alt" id="coverage">
          <div className="irongate-wrap">
            <div className="irongate-split">
              <div>
                <span className="irongate-kicker">Built for Hard Sites</span>
                <h2 className="irongate-split-title">
                  Perimeter to Panel, Nothing Left Exposed
                </h2>
                <ul className="irongate-checklist">
                  <li>
                    <BadgeCheck size={20} aria-hidden="true" />
                    <div>
                      <strong>Licensed installers only</strong>
                      <span>
                        Every technician is state-licensed, background-checked,
                        and factory-certified on the hardware they mount.
                      </span>
                    </div>
                  </li>
                  <li>
                    <Wrench size={20} aria-hidden="true" />
                    <div>
                      <strong>Commercial-spec hardware</strong>
                      <span>
                        IK10 impact-rated housings, IP67 weather sealing, and
                        tamper detection on every exterior device.
                      </span>
                    </div>
                  </li>
                  <li>
                    <MapPin size={20} aria-hidden="true" />
                    <div>
                      <strong>Local rapid response</strong>
                      <span>
                        Service trucks stationed across the metro mean a
                        technician on site within 24 hours of any fault alert.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="irongate-split-figures">
                <figure className="irongate-figure irongate-panel">
                  <img
                    src={IMG.perimeter}
                    alt="Security camera covering a fenced perimeter of an industrial facility"
                    loading="lazy"
                  />
                  <figcaption>Perimeter Coverage</figcaption>
                </figure>
                <figure className="irongate-figure irongate-panel">
                  <img
                    src={IMG.monitoring}
                    alt="Operator reviewing multiple live surveillance feeds at a monitoring desk"
                    loading="lazy"
                  />
                  <figcaption>Live Monitoring</figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section className="irongate-section" id="faq">
          <div className="irongate-wrap">
            <div className="irongate-section-head">
              <span className="irongate-kicker">Straight Answers</span>
              <h2>Frequently Asked Questions</h2>
            </div>

            <div className="irongate-faq-list">
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div className="irongate-faq-item irongate-panel" data-open={open} key={f.q}>
                    <h3>
                      <button
                        type="button"
                        className="irongate-faq-q"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? -1 : i)}
                      >
                        {f.q}
                        <Plus size={19} aria-hidden="true" />
                      </button>
                    </h3>
                    {open && <p className="irongate-faq-a">{f.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="irongate-band" aria-label="Final call to action">
          <div className="irongate-band-media">
            <img
              src={IMG.domeCameraWide}
              alt="Security camera keeping watch over a property entrance"
              loading="lazy"
            />
            <div className="irongate-band-shade" aria-hidden="true" />
          </div>
          <div className="irongate-wrap">
            <div className="irongate-band-inner">
              <h2>
                Lock It Down Before It Becomes a Claim. <span>Talk to IronGate Today.</span>
              </h2>
              <div className="irongate-band-actions">
                <QuoteButton />
                <a className="irongate-btn irongate-btn-steel" href={CONTACT_URL}>
                  <PhoneCall size={17} aria-hidden="true" />
                  {CONTACT_LABEL}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="irongate-footer">
        <div className="irongate-wrap">
          <div className="irongate-footer-inner">
            <a className="irongate-brand" href="#top" aria-label="Back to top">
              <span className="irongate-brand-mark" aria-hidden="true">
                <ShieldCheck size={21} />
              </span>
              Iron<em>Gate</em>
            </a>
            <a className="irongate-footer-phone" href={CONTACT_URL}>
              <PhoneCall size={18} aria-hidden="true" />
              {CONTACT_LABEL}
            </a>
          </div>
          <div className="irongate-footer-fine">
            <span>&copy; {new Date().getFullYear()} IronGate Security. All rights reserved.</span>
            <span>Independent service provider listing.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
