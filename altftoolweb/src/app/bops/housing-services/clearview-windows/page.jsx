"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Clock,
  Leaf,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Thermometer,
  Volume2,
  Wind,
} from "lucide-react";
import "./clearview-windows.css";

// No quote partner and no phone line are live for this page, so every
// conversion CTA points at the site's real contact route.
const CONTACT_URL = "/policypages/contact";
const CONTACT_LABEL = "Contact us";

const IMG_HERO =
  "https://images.unsplash.com/photo-1464519586905-a8c004d307cc?auto=format&fit=crop&w=1600&q=80";
const IMG_MIDCTA =
  "https://images.unsplash.com/photo-1721902024148-287438cf3e05?auto=format&fit=crop&w=1600&q=80";

const STYLE_CARDS = [
  { img: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=900&q=80",
    alt: "Modern facade with tall panes of glass flooding the interior with daylight",
    tag: "Most popular", name: "Double-Pane Comfort Series",
    blurb: "Argon-filled double glazing with warm-edge spacers — the everyday workhorse that cuts drafts and quiets the street." },
  { img: "https://images.unsplash.com/photo-1514994792087-578fe80d0ff9?auto=format&fit=crop&w=900&q=80",
    alt: "Bright window corner with plants soaking up soft natural light",
    tag: "Best insulation", name: "Triple-Pane Summit Series",
    blurb: "Three panes, two insulating chambers, Low-E on both faces. Built for hard winters and sun-baked summers alike." },
  { img: "https://images.unsplash.com/photo-1694161375074-e11da93b199e?auto=format&fit=crop&w=900&q=80",
    alt: "Floor-to-ceiling picture windows framing an expansive outdoor view",
    tag: "Statement glass", name: "Panorama Picture Windows",
    blurb: "Wall-sized fixed glass with slim frames for the views you bought the house for — engineered to stay condensation-free." },
];

const RINGS = [
  { value: 38, label: "Average heating and cooling savings after full replacement" },
  { value: 52, label: "Typical reduction in outside noise with triple-pane glass" },
  { value: 95, label: "Of fading UV rays blocked by our Low-E coatings" },
];

const FEATURES = [
  { icon: Clock, title: "Installed in a day",
    text: "Most whole-home projects are measured once and installed in a single visit — no week of plastic sheeting." },
  { icon: Thermometer, title: "ENERGY STAR rated glass",
    text: "Every unit meets or beats the certification thresholds for your climate zone." },
  { icon: ShieldCheck, title: "Lifetime transferable warranty",
    text: "Glass, frame, and workmanship covered for as long as you own the home — and it moves with the deed." },
  { icon: Volume2, title: "Noticeably quieter rooms",
    text: "Laminated and triple-pane options tame traffic, trains, and early lawnmowers." },
];

const STEPS = [
  { title: "Free window checkup",
    text: "A specialist measures every opening and thermal-scans for leaks. No cost, no obligation." },
  { title: "Clear same-day pricing",
    text: "One written price covering glass, frames, install, and haul-away. It never changes later." },
  { title: "Built to the millimeter",
    text: "Each window is custom manufactured for its exact opening — no shims-and-foam approximations." },
  { title: "One-day installation",
    text: "Our certified crew installs, seals, cleans up, and walks you through it before dinner." },
];

const QUOTES = [
  { text: "Twelve windows swapped between breakfast and school pickup. The house was warmer that same night.",
    name: "Priya M. — full-home replacement" },
  { text: "Our February bill dropped by about a third. I keep checking it because I don't quite believe it.",
    name: "Dan & Leslie R. — triple-pane upgrade" },
  { text: "The crew treated the trim like it was their own house. You cannot tell anyone was here, except it's quiet now.",
    name: "Harold T. — bedroom and bay windows" },
];

const FAQS = [
  { q: "How long does a typical installation take?",
    a: "Most homes are completed in a single day. Very large projects or specialty shapes may take two. Your quote includes the exact schedule before you commit." },
  { q: "Double-pane or triple-pane — which do I need?",
    a: "Double-pane suits moderate climates and quieter streets. Triple-pane earns its keep in harsh winters, on busy roads, or in bedrooms facing the sun. Your free checkup includes a room-by-room recommendation." },
  { q: "Will new windows really lower my energy bills?",
    a: "If your current windows are single-pane or over 20 years old, replacements typically cut heating and cooling costs by 25-40%. We show you the projected numbers for your home during the quote." },
  { q: "What happens to my old windows?",
    a: "We remove, haul away, and recycle them as part of every installation — glass, frames, and packaging included. Nothing is left at the curb." },
  { q: "Is the quote really free?",
    a: "Yes. The in-home checkup, thermal scan, and written quote cost nothing and carry no obligation. The price you receive is locked for 12 months." },
];

function QuoteLink({ className, children }) {
  return (
    <a
      className={className}
      href={CONTACT_URL}
    >
      {children}
    </a>
  );
}

function PhoneLink({ className, withIcon = true }) {
  return (
    <a className={className} href={CONTACT_URL}>
      {withIcon && <Mail size={16} aria-hidden="true" />}
      <span>{CONTACT_LABEL}</span>
    </a>
  );
}

export default function ClearViewWindowsPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="clearview-page">
      <nav className="clearview-nav" aria-label="ClearView Windows">
        <div className="clearview-shell clearview-nav-inner">
          <a className="clearview-brand" href="#clearview-top">
            <span className="clearview-brand-mark" aria-hidden="true">
              <Sun size={18} />
            </span>
            ClearView Windows
          </a>
          <ul className="clearview-nav-links">
            <li><a href="#clearview-styles">Window styles</a></li>
            <li><a href="#clearview-savings">Savings</a></li>
            <li><a href="#clearview-why">Why ClearView</a></li>
            <li><a href="#clearview-process">Process</a></li>
            <li><a href="#clearview-faq">FAQ</a></li>
          </ul>
          <div className="clearview-nav-cta">
            <PhoneLink className="clearview-nav-phone" />
            <QuoteLink className="clearview-btn clearview-btn-primary">
              Get a Free Quote
            </QuoteLink>
          </div>
        </div>
      </nav>

      <header className="clearview-hero" id="clearview-top">
        <div className="clearview-hero-media">
          <img
            src={IMG_HERO}
            alt="Wide daylight vista of sky and rolling landscape — the kind of view ClearView glass keeps crystal clear"
          />
        </div>
        <div className="clearview-shell clearview-hero-inner">
          <div className="clearview-glass clearview-hero-card">
            <span className="clearview-eyebrow">
              <Sparkles size={14} aria-hidden="true" /> Replacement windows, done in a day
            </span>
            <h1>
              Let the light in.
              <br />
              Keep the <strong>weather out.</strong>
            </h1>
            <p className="clearview-hero-sub">
              Energy-efficient double and triple-pane replacement windows, custom
              built for your home and professionally installed in a single day —
              backed by a lifetime transferable warranty.
            </p>
            <div className="clearview-hero-actions">
              <QuoteLink className="clearview-btn clearview-btn-primary">
                Get a Free Quote <ArrowRight size={16} aria-hidden="true" />
              </QuoteLink>
              <PhoneLink className="clearview-btn clearview-btn-ghost" />
            </div>
            <div className="clearview-hero-proof">
              <span><BadgeCheck size={16} aria-hidden="true" /> Licensed and insured</span>
              <span><Clock size={16} aria-hidden="true" /> One-day installs</span>
              <span><Leaf size={16} aria-hidden="true" /> ENERGY STAR rated</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="clearview-section" id="clearview-styles" aria-labelledby="clearview-styles-h">
          <div className="clearview-shell">
            <div className="clearview-section-head">
              <span className="clearview-eyebrow">Our glass</span>
              <h2 id="clearview-styles-h">Windows for every room and climate</h2>
              <p>
                Three core lines, endless configurations — every one custom
                manufactured to the millimeter for your openings.
              </p>
            </div>
            <div className="clearview-style-grid">
              {STYLE_CARDS.map((card) => (
                <article key={card.name} className="clearview-glass clearview-style-card">
                  <div className="clearview-style-media">
                    <img src={card.img} alt={card.alt} loading="lazy" />
                  </div>
                  <div className="clearview-style-body">
                    <span className="clearview-style-tag">{card.tag}</span>
                    <h3>{card.name}</h3>
                    <p>{card.blurb}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="clearview-section" id="clearview-savings" aria-labelledby="clearview-savings-h">
          <div className="clearview-shell">
            <div className="clearview-section-head">
              <span className="clearview-eyebrow">The numbers</span>
              <h2 id="clearview-savings-h">What better glass actually saves you</h2>
              <p>
                Old single-pane windows leak money every month. Here is what our
                customers typically see after replacement.
              </p>
            </div>
            <div className="clearview-glass clearview-savings-band">
              <div className="clearview-ring-row">
                {RINGS.map((ring) => (
                  <div key={ring.label}>
                    <div
                      className="clearview-ring"
                      style={{ "--clearview-p": ring.value }}
                      role="img"
                      aria-label={`${ring.value} percent: ${ring.label}`}
                    >
                      <span className="clearview-ring-value" aria-hidden="true">
                        {ring.value}<sup>%</sup>
                      </span>
                    </div>
                    <p className="clearview-ring-label">{ring.label}</p>
                  </div>
                ))}
              </div>
              <p className="clearview-ring-foot">
                Typical results for homes replacing single-pane or 20-year-old
                windows. Your free quote includes projections for your home.
              </p>
            </div>
          </div>
        </section>

        <section className="clearview-section" id="clearview-why" aria-labelledby="clearview-why-h">
          <div className="clearview-shell clearview-split">
            <div className="clearview-split-media">
              <img
                src="https://images.unsplash.com/photo-1714963810770-1506ea5806b7?auto=format&fit=crop&w=900&q=80"
                alt="Sunlight streaming through crisp new glazing into a calm, airy interior"
                loading="lazy"
              />
            </div>
            <div className="clearview-split-copy">
              <span className="clearview-eyebrow">Why ClearView</span>
              <h2 id="clearview-why-h">Built for comfort you can feel the first night</h2>
              <ul className="clearview-feature-list">
                {FEATURES.map((f) => (
                  <li key={f.title}>
                    <f.icon size={20} aria-hidden="true" />
                    <div>
                      <h3>{f.title}</h3>
                      <p>{f.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="clearview-section" aria-label="Request a quote">
          <div className="clearview-shell">
            <div className="clearview-midcta">
              <div className="clearview-midcta-media">
                <img
                  src={IMG_MIDCTA}
                  alt="Contemporary home exterior with generous, energy-efficient window walls"
                  loading="lazy"
                />
              </div>
              <div className="clearview-midcta-inner">
                <div>
                  <h2>See your savings before you spend a cent</h2>
                  <p>
                    A written, fixed quote with room-by-room recommendations —
                    free, and locked in for 12 months.
                  </p>
                </div>
                <div className="clearview-midcta-actions">
                  <QuoteLink className="clearview-btn clearview-btn-primary">
                    Get a Free Quote <ArrowRight size={16} aria-hidden="true" />
                  </QuoteLink>
                  <PhoneLink className="clearview-btn clearview-btn-ghost" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="clearview-section" id="clearview-process" aria-labelledby="clearview-process-h">
          <div className="clearview-shell">
            <div className="clearview-section-head">
              <span className="clearview-eyebrow">How it works</span>
              <h2 id="clearview-process-h">From first call to final walkthrough</h2>
              <p>Four steps, one visit day, zero surprises.</p>
            </div>
            <div className="clearview-step-grid">
              {STEPS.map((step, i) => (
                <article key={step.title} className="clearview-glass clearview-step">
                  <span className="clearview-step-num" aria-hidden="true">{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="clearview-section" aria-labelledby="clearview-reviews-h">
          <div className="clearview-shell">
            <div className="clearview-section-head">
              <span className="clearview-eyebrow">Homeowners say</span>
              <h2 id="clearview-reviews-h">Quiet houses, lighter bills</h2>
            </div>
            <div className="clearview-quote-grid">
              {QUOTES.map((q) => (
                <figure key={q.name} className="clearview-glass clearview-quote-card">
                  <div className="clearview-quote-stars" aria-label="Rated 5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} size={15} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>&ldquo;{q.text}&rdquo;</blockquote>
                  <figcaption>{q.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="clearview-section" id="clearview-faq" aria-labelledby="clearview-faq-h">
          <div className="clearview-shell">
            <div className="clearview-section-head">
              <span className="clearview-eyebrow">Good to know</span>
              <h2 id="clearview-faq-h">Frequently asked questions</h2>
            </div>
            <div className="clearview-faq-list">
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={faq.q}
                    className="clearview-glass clearview-faq-item"
                    data-open={isOpen}
                  >
                    <button
                      type="button"
                      className="clearview-faq-trigger"
                      aria-expanded={isOpen}
                      aria-controls={`clearview-faq-panel-${i}`}
                      onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    >
                      {faq.q}
                      <ChevronDown size={18} aria-hidden="true" />
                    </button>
                    <div className="clearview-faq-panel" id={`clearview-faq-panel-${i}`}>
                      <p>{faq.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="clearview-section" aria-labelledby="clearview-final-h">
          <div className="clearview-shell">
            <div className="clearview-glass clearview-final">
              <span className="clearview-eyebrow">
                <Wind size={14} aria-hidden="true" /> Stop heating the outdoors
              </span>
              <h2 id="clearview-final-h">Ready for windows that pull their weight?</h2>
              <p>
                Get a free, no-obligation quote with projected energy savings for
                your exact home — or talk to a real window specialist right now.
              </p>
              <div className="clearview-final-actions">
                <QuoteLink className="clearview-btn clearview-btn-primary">
                  Get a Free Quote <ArrowRight size={16} aria-hidden="true" />
                </QuoteLink>
                <PhoneLink className="clearview-btn clearview-btn-ghost" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="clearview-footer">
        <div className="clearview-shell clearview-footer-inner">
          <a className="clearview-brand" href="#clearview-top">
            <span className="clearview-brand-mark" aria-hidden="true">
              <Sun size={18} />
            </span>
            ClearView Windows
          </a>
          <PhoneLink className="clearview-nav-phone" />
          <p className="clearview-footer-fine">
            Independent service provider listing. &copy; {new Date().getFullYear()} ClearView Windows.
          </p>
        </div>
      </footer>
    </div>
  );
}
