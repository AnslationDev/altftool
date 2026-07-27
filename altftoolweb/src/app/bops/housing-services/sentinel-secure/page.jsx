"use client";

import "./sentinel-secure.css";
import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Camera,
  DoorOpen,
  Lock,
  Siren,
  Flame,
  Smartphone,
  Mail,
  Menu,
  X,
  Check,
  ArrowRight,
  Star,
} from "lucide-react";

// No quote partner and no phone line are live for this page, so every
// conversion CTA points at the site's real contact route.
const CONTACT_URL = "/policypages/contact";
const CONTACT_LABEL = "Contact us";

const NAV_LINKS = [
  { href: "#protect", label: "Protection" },
  { href: "#how", label: "How it works" },
  { href: "#plans", label: "Plans" },
  { href: "#reviews", label: "Reviews" },
];

const STATS = [
  { value: "24/7", label: "Live monitoring" },
  { value: "45s", label: "Avg response" },
  { value: "0", label: "Long contracts" },
  { value: "180k+", label: "Homes secured" },
];

const PROTECT_TILES = [
  {
    icon: Camera,
    title: "AI Cameras",
    body: "4K indoor and outdoor cameras that tell a person from a package — and a threat from a raccoon.",
  },
  {
    icon: DoorOpen,
    title: "Door & Window Sensors",
    body: "Slim entry sensors on every access point. Any breach pings your app and our monitoring center instantly.",
  },
  {
    icon: Lock,
    title: "Smart Locks",
    body: "Keyless entry with rolling codes, auto-lock schedules, and remote unlock for guests and deliveries.",
  },
  {
    icon: Siren,
    title: "Siren Alarms",
    body: "105 dB deterrent sirens triggered locally or remotely — most intruders leave before they get inside.",
  },
  {
    icon: Flame,
    title: "Fire & CO Detection",
    body: "Monitored smoke and carbon-monoxide sensors dispatch help even when nobody is home to hear the alarm.",
  },
  {
    icon: Smartphone,
    title: "One App Control",
    body: "Arm, disarm, watch live feeds, manage locks and get real-time alerts from a single, fast app.",
  },
];

const STEPS = [
  {
    title: "Free security assessment",
    body: "Tell us about your home and we map every entry point, blind spot and risk — no site visit required.",
  },
  {
    title: "Pro installation, same week",
    body: "A certified technician installs and calibrates every device, then walks you through the app before leaving.",
  },
  {
    title: "Monitoring goes live",
    body: "From that moment on, our monitoring center watches every signal around the clock and dispatches in seconds.",
  },
];

const PLANS = [
  {
    name: "Essential",
    price: "19",
    cents: ".99",
    blurb: "Core protection for apartments and smaller homes.",
    features: [
      "24/7 professional monitoring",
      "App control & alerts",
      "Up to 6 entry sensors",
      "1 AI camera included",
      "No long-term contract",
    ],
    featured: false,
  },
  {
    name: "Complete",
    price: "34",
    cents: ".99",
    blurb: "Full-perimeter coverage for most family homes.",
    features: [
      "Everything in Essential",
      "Up to 14 entry sensors",
      "3 AI cameras + video storage",
      "Smart lock included",
      "Fire & CO monitoring",
      "Priority 45s dispatch",
    ],
    featured: true,
  },
  {
    name: "Fortress",
    price: "54",
    cents: ".99",
    blurb: "Maximum coverage for large or high-risk properties.",
    features: [
      "Everything in Complete",
      "Unlimited sensors & zones",
      "8 AI cameras + 60-day storage",
      "Glass-break & flood sensors",
      "Dedicated response line",
    ],
    featured: false,
  },
];

const QUOTES = [
  {
    text: "Someone tried our back door at 2am. The siren fired, the app rang, and monitoring called me before I was even out of bed.",
    who: "Dana R. — Portland, OR",
  },
  {
    text: "Install took under two hours and the app is genuinely fast. I check the cameras from work more than I'd like to admit.",
    who: "Marcus T. — Austin, TX",
  },
  {
    text: "We left a big-name provider over contract games. SentinelSecure is month-to-month and the response times are better.",
    who: "Priya K. — Columbus, OH",
  },
];

function SectionHead({ kicker, title, copy }) {
  return (
    <div className="sentinel-section-head">
      <span className="sentinel-kicker">{kicker}</span>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

export default function SentinelSecurePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMockSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="sentinel-root">
      <header className="sentinel-nav">
        <div className="sentinel-wrap sentinel-nav-inner">
          <a href="#top" className="sentinel-logo" aria-label="SentinelSecure home">
            <span className="sentinel-logo-mark" aria-hidden="true">
              <Shield size={18} />
            </span>
            Sentinel<span className="sentinel-logo-accent">Secure</span>
          </a>

          <nav aria-label="Primary">
            <ul
              id="sentinel-menu"
              className={`sentinel-nav-links${menuOpen ? " sentinel-nav-open" : ""}`}
            >
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a href="#quote" className="sentinel-btn sentinel-btn-primary sentinel-nav-cta">
            Get Protected
          </a>

          <button
            type="button"
            className="sentinel-nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="sentinel-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="sentinel-hero">
          <div className="sentinel-wrap sentinel-hero-grid">
            <div>
              <span className="sentinel-kicker">Smart Home Security</span>
              <h1>
                Every entry point. <em>Watched. Always.</em>
              </h1>
              <p className="sentinel-hero-copy">
                AI cameras, entry sensors, smart locks and 24/7 professional monitoring —
                installed in a day, controlled from one app, with a human dispatcher on
                the line in under a minute.
              </p>
              <div className="sentinel-hero-actions">
                <a href="#quote" className="sentinel-btn sentinel-btn-primary">
                  Get Protected <ArrowRight size={16} />
                </a>
                <a href={CONTACT_URL} className="sentinel-btn sentinel-btn-ghost">
                  <Mail size={16} /> {CONTACT_LABEL}
                </a>
              </div>
            </div>

            <div className="sentinel-radar" role="img" aria-label="Animated radar showing your home under active monitoring">
              <span className="sentinel-radar-ring" aria-hidden="true" />
              <span className="sentinel-radar-ring" aria-hidden="true" />
              <span className="sentinel-radar-ring" aria-hidden="true" />
              <span className="sentinel-radar-dot" aria-hidden="true" />
              <span className="sentinel-radar-dot" aria-hidden="true" />
              <span className="sentinel-radar-dot" aria-hidden="true" />
              <span className="sentinel-radar-core" aria-hidden="true">
                <ShieldCheck size={44} />
              </span>
              <span className="sentinel-radar-status">System armed</span>
            </div>
          </div>
        </section>

        <section className="sentinel-stats" aria-label="SentinelSecure by the numbers">
          <div className="sentinel-wrap sentinel-stats-grid">
            {STATS.map((stat) => (
              <div className="sentinel-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="protect" className="sentinel-section">
          <div className="sentinel-wrap">
            <SectionHead
              kicker="What we protect"
              title="One system. Every threat covered."
              copy="Six layers of hardware and software working together, monitored by humans who can dispatch police, fire or medical in seconds."
            />
            <div className="sentinel-protect-grid">
              {PROTECT_TILES.map((tile) => (
                <article className="sentinel-tile" key={tile.title}>
                  <span className="sentinel-tile-icon" aria-hidden="true">
                    <tile.icon size={22} />
                  </span>
                  <h3>{tile.title}</h3>
                  <p>{tile.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="sentinel-section">
          <div className="sentinel-wrap">
            <SectionHead
              kicker="How SentinelSecure works"
              title="Protected in three steps."
              copy="From first call to armed system in under a week — usually faster."
            />
            <ol className="sentinel-steps">
              {STEPS.map((step) => (
                <li className="sentinel-step" key={step.title}>
                  <span className="sentinel-step-num" aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="plans" className="sentinel-section">
          <div className="sentinel-wrap">
            <SectionHead
              kicker="Monitoring plans"
              title="Simple monthly pricing. Cancel anytime."
              copy="Every plan includes professional monitoring, the app, and free equipment repairs. No activation fees, no multi-year lock-in."
            />
            <div className="sentinel-plans-grid">
              {PLANS.map((plan) => (
                <article
                  className={`sentinel-plan${plan.featured ? " sentinel-plan-featured" : ""}`}
                  key={plan.name}
                >
                  {plan.featured ? (
                    <span className="sentinel-plan-badge">Most Protected</span>
                  ) : null}
                  <h3>{plan.name}</h3>
                  <p className="sentinel-plan-price">
                    <strong>
                      ${plan.price}
                      {plan.cents}
                    </strong>
                    <span>/month</span>
                  </p>
                  <p className="sentinel-plan-blurb">{plan.blurb}</p>
                  <ul className="sentinel-plan-list">
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check size={16} aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#quote"
                    className={`sentinel-btn ${
                      plan.featured ? "sentinel-btn-primary" : "sentinel-btn-ghost"
                    }`}
                  >
                    Choose {plan.name}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="sentinel-section">
          <div className="sentinel-wrap">
            <SectionHead
              kicker="Homeowners on Sentinel"
              title="Trusted when it counts."
            />
            <div className="sentinel-quotes-grid">
              {QUOTES.map((quote) => (
                <figure className="sentinel-quote" key={quote.who}>
                  <div className="sentinel-quote-stars" aria-label="Rated 5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={15} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>&ldquo;{quote.text}&rdquo;</blockquote>
                  <figcaption>{quote.who}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="quote" className="sentinel-cta">
          <div className="sentinel-wrap sentinel-cta-inner">
            <div>
              <span className="sentinel-kicker">Get Protected</span>
              <h2>Your free security assessment starts with one call.</h2>
              <p>
                Talk to a security specialist — not a sales script. We&apos;ll map your
                home&apos;s risks and quote a system in about ten minutes.
              </p>
              <a href={CONTACT_URL} className="sentinel-cta-phone">
                <Mail size={24} aria-hidden="true" /> {CONTACT_LABEL}
              </a>
            </div>

            <form className="sentinel-form" onSubmit={handleMockSubmit}>
              <h3>Request a callback</h3>
              <div className="sentinel-field">
                <label htmlFor="sentinel-name">Full name</label>
                <input
                  id="sentinel-name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  placeholder="Jordan Avery"
                />
              </div>
              <div className="sentinel-field">
                <label htmlFor="sentinel-zip">ZIP code</label>
                <input
                  id="sentinel-zip"
                  name="zip"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="97204"
                />
              </div>
              <button type="submit" className="sentinel-btn sentinel-btn-primary">
                Request my assessment <ArrowRight size={16} />
              </button>
              <p className="sentinel-form-note">
                Demo form — nothing is sent or stored.
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="sentinel-footer">
        <div className="sentinel-wrap sentinel-footer-inner">
          <a href="#top" className="sentinel-logo" aria-label="Back to top">
            <span className="sentinel-logo-mark" aria-hidden="true">
              <Shield size={18} />
            </span>
            Sentinel<span className="sentinel-logo-accent">Secure</span>
          </a>
          <ul className="sentinel-footer-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
            <li>
              <a href={CONTACT_URL}>{CONTACT_LABEL}</a>
            </li>
          </ul>
          <p className="sentinel-footer-fine">
            &copy; 2026 SentinelSecure. A fictional demonstration brand — not a real
            security provider. No monitoring services are offered.
          </p>
        </div>
      </footer>
    </div>
  );
}
