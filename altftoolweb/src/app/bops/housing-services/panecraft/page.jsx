"use client";

import { useState } from "react";
import {
  Phone,
  ArrowUpRight,
  Ruler,
  Hammer,
  ShieldCheck,
  Feather,
  Plus,
  Frame,
} from "lucide-react";
import "./panecraft.css";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

const IMG = {
  hero: "https://images.unsplash.com/photo-1711006777187-2c991e1b90b2?auto=format&fit=crop&w=1600&q=80",
  cardSash: "https://images.unsplash.com/photo-1781617783301-554c857fc7ea?auto=format&fit=crop&w=900&q=80",
  cardCasement: "https://images.unsplash.com/photo-1773125465949-67e8f5c1d04e?auto=format&fit=crop&w=900&q=80",
  cardBay: "https://images.unsplash.com/photo-1697462247834-7d55761daea3?auto=format&fit=crop&w=900&q=80",
  gallery: "https://images.unsplash.com/photo-1642428670090-6da936be333a?auto=format&fit=crop&w=900&q=80",
};

const STEPS = [
  {
    label: "The site visit",
    body: "A fitter walks the opening with you first — checking reveals, sills, and how the light falls. No pressure, no rushed tape work. We note what the wall actually needs, not what a catalogue suggests.",
  },
  {
    label: "The measure",
    body: "Every opening is measured twice, at different points, because old walls are rarely square. Those numbers travel with your job from the bench to the final fit, so the frame that arrives is the frame that belongs.",
  },
  {
    label: "The fit",
    body: "Clean installs are quiet installs. Dust sheets down, frames shimmed and levelled by hand, seals run in a single pass. We tidy as we go and walk you through the finished work before we pack a single tool.",
  },
  {
    label: "The follow-up",
    body: "A short check-in after the seasons change, because timber and sealant both settle. If a latch needs a half-turn adjustment, we would rather hear about it early — and put it right.",
  },
];

const FAQS = [
  {
    q: "How soon can someone come out to measure?",
    a: "Availability varies by area and season, but most site visits can be arranged within a week or two of your quote request. The visit itself usually takes under an hour.",
  },
  {
    q: "Do you handle older or non-standard openings?",
    a: "That is much of our work. Uneven reveals, settled lintels, and heritage-style frames simply take more careful measuring — which is the part we refuse to hurry.",
  },
  {
    q: "What does a typical project cost?",
    a: "It depends on the number of openings, glazing spec, and the condition of the surrounding wall, so we quote each job individually. The quote is free, written, and carries no obligation.",
  },
  {
    q: "Is the quote really free?",
    a: "Yes. You get a written estimate after the site visit with the scope spelled out plainly. If it is not right for you, no hard feelings and no follow-up pestering.",
  },
];

function QuoteButton({ ghost, children }) {
  return (
    <a
      className={`panecraft-btn ${ghost ? "panecraft-btn-ghost" : "panecraft-btn-primary"}`}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children || "Get a Free Quote"}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}

export default function PaneCraftPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="panecraft-page">
      {/* ---------- NAV ---------- */}
      <header className="panecraft-nav">
        <div className="panecraft-shell panecraft-nav-inner">
          <a className="panecraft-brand" href="#top" aria-label="PaneCraft home">
            <span className="panecraft-brand-mark" aria-hidden="true">
              <Frame size={19} />
            </span>
            PaneCraft
          </a>
          <nav aria-label="Page sections">
            <ul className="panecraft-nav-links">
              <li><a href="#craft">The Craft</a></li>
              <li><a href="#process">Our Process</a></li>
              <li><a href="#work">Recent Work</a></li>
              <li><a href="#faq">Questions</a></li>
            </ul>
          </nav>
          <div className="panecraft-nav-actions">
            <a className="panecraft-nav-phone" href={PHONE_TEL}>
              <Phone size={16} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <QuoteButton />
          </div>
        </div>
      </header>

      <main id="top">
        {/* ---------- HERO ---------- */}
        <section className="panecraft-shell panecraft-hero">
          <div className="panecraft-hero-copy">
            <span className="panecraft-kicker">Artisan Window Fitting</span>
            <h1 className="panecraft-h1">
              Windows fitted the <span className="panecraft-script">unhurried</span> way.
            </h1>
            <p className="panecraft-lede">
              PaneCraft pairs workshop patience with modern glazing. Every opening is
              measured twice, every frame fitted once — cleanly, quietly, and left
              exactly as a room deserves. Quotes are free and written in plain English.
            </p>
            <div className="panecraft-hero-ctas">
              <QuoteButton />
              <a className="panecraft-btn panecraft-btn-ghost" href={PHONE_TEL}>
                <Phone size={17} aria-hidden="true" />
                Call {PHONE_DISPLAY}
              </a>
            </div>
            <p className="panecraft-hero-note">
              No obligation. A fitter reviews your opening before any number is quoted.
            </p>
          </div>
          <div className="panecraft-frame panecraft-hero-frame">
            <img
              src={IMG.hero}
              alt="Sunlight falling through a newly fitted window into a calm interior room"
            />
            <span className="panecraft-hero-stamp">Measured twice, fitted once.</span>
          </div>
        </section>

        {/* ---------- TRUST MARKS ---------- */}
        <section className="panecraft-shell" aria-label="Workshop principles">
          <div className="panecraft-marks">
            <div className="panecraft-mark">
              <Ruler size={20} aria-hidden="true" />
              Double-checked measures on every opening
            </div>
            <div className="panecraft-mark">
              <Hammer size={20} aria-hidden="true" />
              Hand-levelled frames, sealed in one pass
            </div>
            <div className="panecraft-mark">
              <ShieldCheck size={20} aria-hidden="true" />
              Written quotes with the scope spelled out
            </div>
            <div className="panecraft-mark">
              <Feather size={20} aria-hidden="true" />
              Dust sheets down, rooms left as found
            </div>
          </div>
        </section>

        {/* ---------- SERVICES ---------- */}
        <section className="panecraft-section panecraft-shell" id="craft">
          <div className="panecraft-section-head">
            <span className="panecraft-kicker">The Craft</span>
            <h2 className="panecraft-h2">
              Three kinds of opening, <span className="panecraft-script">one</span> standard of fit
            </h2>
            <p className="panecraft-lede">
              Whether the job is a single stubborn sash or a whole elevation, the bench
              rules are the same: honest materials, patient measuring, tidy work.
            </p>
          </div>
          <div className="panecraft-services">
            <article className="panecraft-card">
              <div className="panecraft-card-media">
                <img
                  src={IMG.cardSash}
                  alt="Detail of a classic window frame with warm daylight across the glass"
                  loading="lazy"
                />
              </div>
              <div className="panecraft-card-body">
                <h3 className="panecraft-h3">Sash &amp; heritage frames</h3>
                <p>
                  Sensitive replacements and refits for period-style openings, keeping
                  sightlines slim and proportions true to the original joinery.
                </p>
              </div>
            </article>
            <article className="panecraft-card">
              <div className="panecraft-card-media">
                <img
                  src={IMG.cardCasement}
                  alt="Modern casement window opening onto greenery outside a home"
                  loading="lazy"
                />
              </div>
              <div className="panecraft-card-body">
                <h3 className="panecraft-h3">Casement &amp; everyday windows</h3>
                <p>
                  Dependable double-glazed casements fitted square and sealed properly —
                  the workhorse window, done without shortcuts.
                </p>
              </div>
            </article>
            <article className="panecraft-card">
              <div className="panecraft-card-media">
                <img
                  src={IMG.cardBay}
                  alt="Bright bay window area with generous glass and a comfortable seat"
                  loading="lazy"
                />
              </div>
              <div className="panecraft-card-body">
                <h3 className="panecraft-h3">Bays, corners &amp; feature glass</h3>
                <p>
                  Larger spans and awkward angles that reward careful surveying — quoted
                  honestly after a site visit, never off a photograph.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* ---------- PROCESS ---------- */}
        <section className="panecraft-section panecraft-process" id="process">
          <div className="panecraft-shell">
            <div className="panecraft-section-head">
              <span className="panecraft-kicker">Our Process</span>
              <h2 className="panecraft-h2">From first tape-pull to final wipe-down</h2>
            </div>
            <div className="panecraft-steps">
              <div className="panecraft-step-list" role="group" aria-label="Process steps">
                {STEPS.map((step, i) => (
                  <button
                    key={step.label}
                    type="button"
                    className="panecraft-step-btn"
                    aria-pressed={activeStep === i}
                    onClick={() => setActiveStep(i)}
                  >
                    <span className="panecraft-step-num">{String(i + 1).padStart(2, "0")}</span>
                    {step.label}
                  </button>
                ))}
              </div>
              <div className="panecraft-step-panel" key={activeStep}>
                <h3 className="panecraft-h3">{STEPS[activeStep].label}</h3>
                <p>{STEPS[activeStep].body}</p>
                <p className="panecraft-motto">
                  &ldquo;A frame should meet its wall like it grew there.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- MID-PAGE CTA ---------- */}
        <section className="panecraft-section panecraft-shell" aria-label="Request a quote">
          <div className="panecraft-band">
            <div>
              <h2 className="panecraft-h2">Curious what your openings would cost?</h2>
              <p>
                Request a free written quote, or talk it through with a fitter first.
                Either way, the measuring tape stays in the bag until you say so.
              </p>
            </div>
            <div className="panecraft-band-actions">
              <QuoteButton />
              <a className="panecraft-band-phone" href={PHONE_TEL}>
                <Phone size={16} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        {/* ---------- GALLERY ---------- */}
        <section className="panecraft-section panecraft-shell" id="work">
          <div className="panecraft-section-head">
            <span className="panecraft-kicker">Recent Work</span>
            <h2 className="panecraft-h2">
              Light, let in <span className="panecraft-script">properly</span>
            </h2>
          </div>
          <div className="panecraft-gallery">
            <figure style={{ margin: 0 }}>
              <div className="panecraft-frame panecraft-gallery-frame">
                <img
                  src={IMG.gallery}
                  alt="Finished window installation viewed from inside, glazing catching the afternoon light"
                  loading="lazy"
                />
              </div>
              <figcaption className="panecraft-gallery-caption">
                A living-room refit — new glazing, original proportions respected.
              </figcaption>
            </figure>
            <figure style={{ margin: 0 }}>
              <div className="panecraft-frame panecraft-gallery-frame">
                <img
                  src={IMG.cardBay}
                  alt="Completed bay window seating nook filled with natural light"
                  loading="lazy"
                />
              </div>
              <figcaption className="panecraft-gallery-caption">
                A bay rebuilt square after decades of settling — measured three times, in fact.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="panecraft-section panecraft-shell" id="faq">
          <div className="panecraft-section-head">
            <span className="panecraft-kicker">Questions</span>
            <h2 className="panecraft-h2">Asked at nearly every site visit</h2>
          </div>
          <div className="panecraft-faq-list">
            {FAQS.map((item, i) => (
              <div className="panecraft-faq-item" key={item.q}>
                <button
                  type="button"
                  className="panecraft-faq-q"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  {item.q}
                  <Plus size={18} aria-hidden="true" />
                </button>
                {openFaq === i && <p className="panecraft-faq-a">{item.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ---------- FINAL CTA ---------- */}
        <section className="panecraft-section panecraft-shell" aria-label="Final call to action">
          <div className="panecraft-band">
            <div>
              <h2 className="panecraft-h2">
                Measured twice. Fitted <span className="panecraft-script">once</span>.
              </h2>
              <p>
                Start with a free quote — a fitter will review your openings and put the
                scope in writing. No deposits, no doorstep pressure.
              </p>
            </div>
            <div className="panecraft-band-actions">
              <QuoteButton />
              <a className="panecraft-band-phone" href={PHONE_TEL}>
                <Phone size={16} aria-hidden="true" />
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="panecraft-footer">
        <div className="panecraft-shell panecraft-footer-inner">
          <div>
            <a className="panecraft-brand" href="#top">
              <span className="panecraft-brand-mark" aria-hidden="true">
                <Frame size={19} />
              </span>
              PaneCraft
            </a>
            <p className="panecraft-footer-note">
              Independent service provider listing. PaneCraft is a fictional brand shown
              for illustrative purposes.
            </p>
          </div>
          <div className="panecraft-footer-links">
            <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer">
              Get a Free Quote
            </a>
            <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
