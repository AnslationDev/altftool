"use client";

import { useState } from "react";
import {
  Droplets,
  Phone,
  ArrowRight,
  Wrench,
  Search,
  Flame,
  ShieldCheck,
  Clock,
  BadgeCheck,
  Check,
  ChevronDown,
  Zap,
} from "lucide-react";
import "./draindoctors.css";

const QUOTE_URL = "https://example.com/quote/draindoctors";
const PHONE_DISPLAY = "(855) 555-0265";
const PHONE_TEL = "tel:+18555550265";

const IMG = {
  hero: "https://images.unsplash.com/photo-1766330977065-4458b54c6d1a?auto=format&fit=crop&w=1600&q=80",
  drains: "https://images.unsplash.com/photo-1773177930292-463ca3c5b86a?auto=format&fit=crop&w=900&q=80",
  leaks: "https://images.unsplash.com/photo-1761353854551-361b1c804849?auto=format&fit=crop&w=900&q=80",
  heaters: "https://images.unsplash.com/photo-1779366034018-46311978eb66?auto=format&fit=crop&w=900&q=80",
  pricing: "https://images.unsplash.com/photo-1784790601912-b30717b805b8?auto=format&fit=crop&w=900&q=80",
};

const SERVICES = [
  {
    icon: Wrench,
    img: IMG.drains,
    alt: "Plumber clearing a clogged household drain with professional tools",
    title: "Drain Cleaning",
    copy: "Slow sinks, backed-up tubs, gurgling toilets — network pros use augers and hydro-jetting where appropriate to clear most residential clogs in a single visit.",
  },
  {
    icon: Search,
    img: IMG.leaks,
    alt: "Technician inspecting pipes under a sink to locate a water leak",
    title: "Leak Detection & Repair",
    copy: "Mystery water bills or damp spots? Pros locate hidden leaks with diagnostic tools and quote the repair before any wrench turns.",
  },
  {
    icon: Flame,
    img: IMG.heaters,
    alt: "Residential water heater installed and connected in a utility space",
    title: "Water Heaters",
    copy: "Repair, replacement, and tank-to-tankless upgrades. Get options at different price points with the trade-offs explained in plain English.",
  },
];

const STEPS = [
  {
    title: "Tell us the symptom",
    copy: "Tap a button, describe the drip, clog, or cold shower. It takes about two minutes and costs nothing.",
  },
  {
    title: "Get an upfront quote",
    copy: "A licensed local pro reviews the job and quotes a price before work begins — no meter running, no surprise line items.",
  },
  {
    title: "Fixed, on your schedule",
    copy: "Book a window that suits you. Same-week appointments are available in most service areas, subject to local demand.",
  },
];

const FAQS = [
  {
    q: "Is the quote really free?",
    a: "Yes. Requesting a quote costs nothing and carries no obligation. You only pay if you approve the quoted work and a pro completes it.",
  },
  {
    q: "Who actually does the work?",
    a: "DrainDoctors is an independent listing that connects you with licensed, insured local plumbing professionals in its network. The pro who takes your job handles scheduling, work, and billing directly.",
  },
  {
    q: "How fast can someone come out?",
    a: "In most covered areas, same-week appointments are typical and urgent slots are often available sooner. Exact timing depends on your location and current demand.",
  },
  {
    q: "What does upfront pricing mean here?",
    a: "The pro quotes the full price for the diagnosed job before starting. If something unexpected turns up mid-job, they stop and re-quote — you approve any change before extra work happens.",
  },
];

function CtaPair({ variant }) {
  return (
    <div className="draindoctors-band-actions">
      <a
        className={`draindoctors-btn ${variant === "light" ? "draindoctors-btn-yellow" : "draindoctors-btn-blue"}`}
        href={QUOTE_URL}
        target="_blank"
        rel="sponsored noopener noreferrer"
      >
        <Zap size={18} aria-hidden="true" /> Get a Free Quote
      </a>
      <a className="draindoctors-btn draindoctors-btn-white" href={PHONE_TEL}>
        <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
      </a>
    </div>
  );
}

export default function DrainDoctorsPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="draindoctors-page">
      <header className="draindoctors-nav">
        <div className="draindoctors-wrap draindoctors-nav-row">
          <a className="draindoctors-logo" href="#top" aria-label="DrainDoctors home">
            <span className="draindoctors-logo-mark" aria-hidden="true">
              <Droplets size={22} />
            </span>
            DrainDoctors
          </a>
          <nav aria-label="Primary">
            <ul className="draindoctors-nav-links">
              <li><a href="#services">Services</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#how">How it works</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </nav>
          <div className="draindoctors-nav-cta">
            <a className="draindoctors-nav-phone" href={PHONE_TEL}>
              <Phone size={17} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              className="draindoctors-btn draindoctors-btn-yellow"
              href={QUOTE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
            >
              Get a Free Quote
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="draindoctors-hero draindoctors-dots-blue">
          <div className="draindoctors-wrap draindoctors-hero-grid">
            <div>
              <span className="draindoctors-sticker draindoctors-sticker-yellow">
                <Clock size={15} aria-hidden="true" /> Same-week visits in most areas
              </span>
              <h1>
                Clogged drain? <span className="draindoctors-hero-pow">Unclogged.</span> Priced before we start.
              </h1>
              <p className="draindoctors-hero-sub">
                DrainDoctors connects you with licensed local plumbing pros for drains, leaks, and water
                heaters — with the full price quoted up front, so the only surprise is how smooth it goes.
              </p>
              <CtaPair variant="light" />
              <div className="draindoctors-hero-chips">
                <span className="draindoctors-sticker"><ShieldCheck size={14} aria-hidden="true" /> Licensed &amp; insured pros</span>
                <span className="draindoctors-sticker"><BadgeCheck size={14} aria-hidden="true" /> No-obligation quotes</span>
              </div>
            </div>
            <div className="draindoctors-hero-figure">
              <span className="draindoctors-sticker draindoctors-sticker-yellow draindoctors-hero-float draindoctors-hero-float-a">
                <Droplets size={15} aria-hidden="true" /> Drips? Handled.
              </span>
              <div className="draindoctors-hero-frame">
                <img
                  src={IMG.hero}
                  alt="Professional plumber at work on a residential plumbing job"
                  width="640"
                  height="800"
                />
              </div>
              <span className="draindoctors-sticker draindoctors-hero-float draindoctors-hero-float-b">
                <Zap size={15} aria-hidden="true" /> Upfront pricing
              </span>
            </div>
          </div>
        </section>

        <section className="draindoctors-stats draindoctors-dots-paper" aria-label="Why homeowners pick DrainDoctors">
          <div className="draindoctors-wrap draindoctors-stats-grid">
            <div className="draindoctors-stat">
              <div className="draindoctors-burst"><span>$0</span></div>
              <h3>Free quotes, always</h3>
              <p>Ask for a price, get a price. No visit fees for quotes, no obligation to book.</p>
            </div>
            <div className="draindoctors-stat">
              <div className="draindoctors-burst"><span>100%</span></div>
              <h3>Price before work</h3>
              <p>Every job in the network is quoted in full before tools come out of the truck.</p>
            </div>
            <div className="draindoctors-stat">
              <div className="draindoctors-burst"><span>7-day</span></div>
              <h3>Scheduling window</h3>
              <p>Most covered areas offer appointments within the week, including weekends.</p>
            </div>
          </div>
        </section>

        <section id="services" className="draindoctors-section">
          <div className="draindoctors-wrap">
            <span className="draindoctors-kicker">What we fix</span>
            <h2>Three headaches. One friendly fix.</h2>
            <p className="draindoctors-section-sub">
              From a slow bathroom sink to a water heater that quit on a Monday morning, network pros
              handle the residential plumbing jobs homeowners actually call about.
            </p>
            <div className="draindoctors-cards">
              {SERVICES.map(({ icon: Icon, img, alt, title, copy }) => (
                <article className="draindoctors-card" key={title}>
                  <div className="draindoctors-card-img">
                    <img src={img} alt={alt} loading="lazy" width="900" height="563" />
                  </div>
                  <div className="draindoctors-card-body">
                    <span className="draindoctors-card-icon" aria-hidden="true"><Icon size={22} /></span>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                    <a
                      className="draindoctors-card-link"
                      href={QUOTE_URL}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                    >
                      Get a Free Quote <ArrowRight size={16} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="draindoctors-band draindoctors-dots-blue">
          <div className="draindoctors-wrap draindoctors-band-inner">
            <div>
              <h2>Water where it shouldn&apos;t be?</h2>
              <p>Describe the problem in two minutes and get a no-obligation quote from a licensed local pro.</p>
            </div>
            <CtaPair variant="light" />
          </div>
        </section>

        <section id="pricing" className="draindoctors-section">
          <div className="draindoctors-wrap draindoctors-split">
            <div className="draindoctors-split-figure">
              <img
                src={IMG.pricing}
                alt="Plumbing professional reviewing job details with a homeowner"
                loading="lazy"
                width="900"
                height="675"
              />
            </div>
            <div>
              <span className="draindoctors-kicker">Upfront pricing</span>
              <h2>The price you approve is the price you pay.</h2>
              <ul className="draindoctors-checks">
                <li>
                  <span className="draindoctors-check-dot" aria-hidden="true"><Check size={16} /></span>
                  <div>
                    <strong>Quoted before work begins</strong>
                    <span>The pro diagnoses first, quotes the whole job, and starts only after you say go.</span>
                  </div>
                </li>
                <li>
                  <span className="draindoctors-check-dot" aria-hidden="true"><Check size={16} /></span>
                  <div>
                    <strong>Changes need your OK</strong>
                    <span>If the job grows mid-repair, work pauses for a re-quote — nothing extra without approval.</span>
                  </div>
                </li>
                <li>
                  <span className="draindoctors-check-dot" aria-hidden="true"><Check size={16} /></span>
                  <div>
                    <strong>Options, not upsells</strong>
                    <span>Where repair vs. replace is a real choice, you get both prices and the honest trade-offs.</span>
                  </div>
                </li>
              </ul>
              <CtaPair variant="dark" />
            </div>
          </div>
        </section>

        <section id="how" className="draindoctors-section draindoctors-dots-paper">
          <div className="draindoctors-wrap">
            <span className="draindoctors-kicker">How it works</span>
            <h2>From &quot;uh-oh&quot; to fixed in three easy steps.</h2>
            <p className="draindoctors-section-sub">No phone trees, no vague estimates — just a quick path to a quoted, scheduled repair.</p>
            <div className="draindoctors-steps">
              {STEPS.map((step, i) => (
                <div className="draindoctors-step" key={step.title}>
                  <span className="draindoctors-step-num" aria-hidden="true">{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="draindoctors-section">
          <div className="draindoctors-wrap">
            <span className="draindoctors-kicker">Good questions</span>
            <h2>Frequently asked, honestly answered.</h2>
            <p className="draindoctors-section-sub">The short version of everything homeowners ask before booking.</p>
            <div className="draindoctors-faq-list">
              {FAQS.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div className="draindoctors-faq-item" data-open={open} key={item.q}>
                    <button
                      type="button"
                      className="draindoctors-faq-q"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : i)}
                    >
                      {item.q}
                      <ChevronDown size={20} aria-hidden="true" />
                    </button>
                    {open && <p className="draindoctors-faq-a">{item.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="draindoctors-band draindoctors-dots-blue">
          <div className="draindoctors-wrap draindoctors-band-inner">
            <div>
              <h2>Ready when your drain isn&apos;t.</h2>
              <p>Free quote, upfront price, licensed local pros. That&apos;s the whole pitch.</p>
            </div>
            <CtaPair variant="light" />
          </div>
        </section>
      </main>

      <footer className="draindoctors-footer draindoctors-dots-blue">
        <div className="draindoctors-wrap">
          <div className="draindoctors-footer-row">
            <a className="draindoctors-logo" href="#top">
              <span className="draindoctors-logo-mark" aria-hidden="true"><Droplets size={20} /></span>
              DrainDoctors
            </a>
            <a className="draindoctors-footer-phone" href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          </div>
          <p className="draindoctors-footer-note">
            Independent service provider listing. DrainDoctors is a fictional brand shown for
            directory purposes; availability, timing, and pricing are set by the licensed local
            professionals who perform the work.
          </p>
        </div>
      </footer>
    </div>
  );
}
