"use client";

import { useState } from "react";
import {
  Bath,
  Phone,
  ShieldCheck,
  ThermometerSun,
  Droplets,
  Waves,
  HeartHandshake,
  CalendarCheck,
  Wrench,
} from "lucide-react";
import "./serenebaths.css";

const QUOTE_URL = "#demo-only";
const PHONE_DISPLAY = "Demo only";
const PHONE_TEL = "#demo-only";

const HERO_IMG =
  "https://images.unsplash.com/photo-1521783593447-5702b9bfd267?auto=format&fit=crop&w=1600&q=80";
const CALLOUT_IMG =
  "https://images.unsplash.com/photo-1625801882109-032ad88edeb3?auto=format&fit=crop&w=1600&q=80";
const CARD_IMGS = [
  "https://images.unsplash.com/photo-1662624914003-9bb2095ca7a0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1613849925594-415a32298f54?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1575245122563-776ff6af7411?auto=format&fit=crop&w=900&q=80",
];

const SAFETY_FEATURES = [
  {
    title: "Low step-in threshold",
    text: "A gentle, ultra-low entry replaces the high tub wall, so stepping in feels as natural as walking through a doorway.",
    top: "72%",
    left: "16%",
  },
  {
    title: "Built-in grab bars",
    text: "Sturdy, warm-touch grab bars are placed exactly where a steadying hand wants them — entering, seated, and rising.",
    top: "30%",
    left: "40%",
  },
  {
    title: "Heated contoured seat",
    text: "A full-height heated seat keeps the water's warmth with you from the first minute to the last.",
    top: "54%",
    left: "63%",
  },
  {
    title: "Quick-drain system",
    text: "Fast-flow drains empty the tub in minutes, so there is no long, cool wait before the door opens.",
    top: "78%",
    left: "78%",
  },
];

function WaveDivider({ deep = false }) {
  return (
    <svg
      className={deep ? "serenebaths-wave serenebaths-wave-deep" : "serenebaths-wave"}
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0,30 C180,58 360,6 540,28 C720,50 900,8 1080,28 C1260,48 1350,20 1440,30"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ConsultButton({ children = "Get a Free Consultation" }) {
  return (
    <a
      className="serenebaths-btn serenebaths-btn-primary"
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children}
    </a>
  );
}

export default function SereneBathsPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="serenebaths-page">
      {/* ---------- Nav ---------- */}
      <header className="serenebaths-nav">
        <div className="serenebaths-nav-inner">
          <a className="serenebaths-brand" href="#top" aria-label="SereneBaths home">
            <span className="serenebaths-brand-mark" aria-hidden="true">
              <Bath size={24} strokeWidth={2} />
            </span>
            SereneBaths
          </a>
          <div className="serenebaths-nav-actions">
            <a className="serenebaths-nav-phone" href={PHONE_TEL}>
              <Phone size={22} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <ConsultButton />
          </div>
        </div>
      </header>

      <main id="top">
        {/* ---------- Hero ---------- */}
        <section className="serenebaths-hero" aria-labelledby="serenebaths-hero-heading">
          <div className="serenebaths-hero-inner">
            <div>
              <span className="serenebaths-eyebrow">AltFTool Senior Care Directory</span>
              <h1 className="serenebaths-hero-title" id="serenebaths-hero-heading">
                Bathing made safe, serene, and entirely yours again
              </h1>
              <p className="serenebaths-hero-lede">
                SereneBaths walk-in tubs pair a low step-in door with heated seating,
                built-in grab bars, and a quick-drain system — so a long, warm soak
                stays a simple everyday pleasure.
              </p>
              <div className="serenebaths-hero-actions">
                <ConsultButton />
                <a className="serenebaths-btn serenebaths-btn-phone" href={PHONE_TEL}>
                  <Phone size={22} aria-hidden="true" />
                  Call {PHONE_DISPLAY}
                </a>
              </div>
              <p className="serenebaths-hero-note">
                <ShieldCheck size={20} aria-hidden="true" />
                Free in-home consultation · No obligation, ever
              </p>
            </div>
            <div className="serenebaths-hero-media">
              <img
                className="serenebaths-hero-img"
                src={HERO_IMG}
                alt="A calm, spa-like bathroom filled with soft natural light"
              />
              <span className="serenebaths-hero-badge">
                <Bath size={22} aria-hidden="true" />
                Low step-in door
              </span>
            </div>
          </div>
        </section>

        <WaveDivider />

        {/* ---------- Annotated tub ---------- */}
        <section className="serenebaths-section" aria-labelledby="serenebaths-safety-heading">
          <div className="serenebaths-inner">
            <div className="serenebaths-section-head">
              <span className="serenebaths-eyebrow">Designed around you</span>
              <h2 className="serenebaths-section-title" id="serenebaths-safety-heading">
                Every detail placed for a confident step in
              </h2>
              <p>
                Tap a numbered point on the tub — or a card beside it — to see how
                each feature quietly does its part.
              </p>
            </div>
            <div className="serenebaths-callout">
              <div className="serenebaths-callout-media">
                <img
                  className="serenebaths-callout-img"
                  src={CALLOUT_IMG}
                  alt="Walk-in style bathtub in a bright, uncluttered bathroom"
                />
                {SAFETY_FEATURES.map((feature, i) => (
                  <button
                    key={feature.title}
                    type="button"
                    className={
                      i === activeFeature
                        ? "serenebaths-dot serenebaths-dot-active"
                        : "serenebaths-dot"
                    }
                    style={{ top: feature.top, left: feature.left }}
                    onClick={() => setActiveFeature(i)}
                    aria-pressed={i === activeFeature}
                    aria-label={`Highlight feature ${i + 1}: ${feature.title}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <ul className="serenebaths-callout-list">
                {SAFETY_FEATURES.map((feature, i) => (
                  <li key={feature.title}>
                    <button
                      type="button"
                      className={
                        i === activeFeature
                          ? "serenebaths-callout-item serenebaths-callout-item-active"
                          : "serenebaths-callout-item"
                      }
                      onClick={() => setActiveFeature(i)}
                      aria-pressed={i === activeFeature}
                    >
                      <span className="serenebaths-callout-item-num" aria-hidden="true">
                        {i + 1}
                      </span>
                      <span>
                        <span className="serenebaths-callout-item-title">
                          {feature.title}
                        </span>
                        <span className="serenebaths-callout-item-text">
                          {feature.text}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <WaveDivider />

        {/* ---------- Comfort cards ---------- */}
        <section
          className="serenebaths-section serenebaths-section-mist"
          aria-labelledby="serenebaths-comfort-heading"
        >
          <div className="serenebaths-inner">
            <div className="serenebaths-section-head">
              <span className="serenebaths-eyebrow">Comfort, not compromise</span>
              <h2 className="serenebaths-section-title" id="serenebaths-comfort-heading">
                A tub that feels like a small spa at home
              </h2>
            </div>
            <div className="serenebaths-cards">
              <article className="serenebaths-card">
                <div className="serenebaths-card-media">
                  <img
                    className="serenebaths-card-img"
                    src={CARD_IMGS[0]}
                    alt="Serene modern bathroom with warm, gentle tones"
                    loading="lazy"
                  />
                </div>
                <div className="serenebaths-card-body">
                  <h3>
                    <ThermometerSun size={24} aria-hidden="true" />
                    Warmth that stays
                  </h3>
                  <p>
                    The heated seat and backrest hold a gentle warmth while the tub
                    fills and while it drains — no chilly bookends to a good soak.
                  </p>
                </div>
              </article>
              <article className="serenebaths-card">
                <div className="serenebaths-card-media">
                  <img
                    className="serenebaths-card-img"
                    src={CARD_IMGS[1]}
                    alt="Bathtub detail in a clean, light-filled bathroom"
                    loading="lazy"
                  />
                </div>
                <div className="serenebaths-card-body">
                  <h3>
                    <Waves size={24} aria-hidden="true" />
                    A soothing soak
                  </h3>
                  <p>
                    Optional air and water jets add a soft, swirling massage you can
                    set to exactly the intensity you like — or switch off entirely.
                  </p>
                </div>
              </article>
              <article className="serenebaths-card">
                <div className="serenebaths-card-media">
                  <img
                    className="serenebaths-card-img"
                    src={CARD_IMGS[2]}
                    alt="Relaxed, comfortable home bathing space"
                    loading="lazy"
                  />
                </div>
                <div className="serenebaths-card-body">
                  <h3>
                    <Droplets size={24} aria-hidden="true" />
                    Quick, quiet drain
                  </h3>
                  <p>
                    Fast-flow drains empty the tub in minutes, so the door opens
                    promptly and the whole ritual keeps its easy rhythm.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <WaveDivider />

        {/* ---------- How it works + mid CTA ---------- */}
        <section className="serenebaths-section" aria-labelledby="serenebaths-steps-heading">
          <div className="serenebaths-inner">
            <div className="serenebaths-section-head">
              <span className="serenebaths-eyebrow">Simple from start to soak</span>
              <h2 className="serenebaths-section-title" id="serenebaths-steps-heading">
                Three easy steps to your new tub
              </h2>
            </div>
            <div className="serenebaths-steps">
              <div className="serenebaths-step">
                <span className="serenebaths-step-num" aria-hidden="true">1</span>
                <h3>
                  <Phone size={20} aria-hidden="true" /> Say hello
                </h3>
                <p>
                  Call {PHONE_DISPLAY} or request a free consultation online.
                  A friendly specialist answers your questions — no scripts, no rush.
                </p>
              </div>
              <div className="serenebaths-step">
                <span className="serenebaths-step-num" aria-hidden="true">2</span>
                <h3>
                  <CalendarCheck size={20} aria-hidden="true" /> Free home visit
                </h3>
                <p>
                  We measure your bathroom, listen to how you like to bathe, and
                  leave you a clear, exact quote to consider at your own pace.
                </p>
              </div>
              <div className="serenebaths-step">
                <span className="serenebaths-step-num" aria-hidden="true">3</span>
                <h3>
                  <Wrench size={20} aria-hidden="true" /> Tidy installation
                </h3>
                <p>
                  Most installations finish in one to two days, with your bathroom
                  left clean and your new tub ready for its first warm fill.
                </p>
              </div>
            </div>
          </div>

          <div className="serenebaths-inner" style={{ marginTop: "56px" }}>
            <div className="serenebaths-midcta">
              <div>
                <h2>Curious what it would look like in your bathroom?</h2>
                <p>A quick, friendly call is all it takes to find out.</p>
              </div>
              <div className="serenebaths-midcta-actions">
                <ConsultButton />
                <a className="serenebaths-btn serenebaths-btn-phone" href={PHONE_TEL}>
                  <Phone size={22} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>

        <WaveDivider />

        {/* ---------- Testimonials ---------- */}
        <section
          className="serenebaths-section serenebaths-section-mist"
          aria-labelledby="serenebaths-quotes-heading"
        >
          <div className="serenebaths-inner">
            <div className="serenebaths-section-head">
              <span className="serenebaths-eyebrow">
                <HeartHandshake size={18} aria-hidden="true" /> Kind words
              </span>
              <h2 className="serenebaths-section-title" id="serenebaths-quotes-heading">
                Quiet confidence, back in the daily routine
              </h2>
            </div>
            <div className="serenebaths-quotes">
              <blockquote className="serenebaths-quote">
                “The heated seat is my favorite part. I take my time now instead of
                rushing, and the low door means I never think twice about getting in.”
                <cite className="serenebaths-quote-name">— Margaret L., Tucson</cite>
              </blockquote>
              <blockquote className="serenebaths-quote">
                “They installed it in a day and left everything spotless. Mom calls
                it her little spa, and honestly, we are a bit jealous.”
                <cite className="serenebaths-quote-name">— Robert T., Portland</cite>
              </blockquote>
            </div>
            <p className="serenebaths-quotes-note">Individual experiences vary.</p>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="serenebaths-finalcta" aria-labelledby="serenebaths-final-heading">
          <div className="serenebaths-inner">
            <h2 id="serenebaths-final-heading">Ready to love your bath again?</h2>
            <p>
              Talk with a SereneBaths specialist about the right walk-in tub for
              your home. The consultation is free, unhurried, and obligation-free.
            </p>
            <div className="serenebaths-finalcta-actions">
              <ConsultButton />
              <a className="serenebaths-finalcta-phone" href={PHONE_TEL}>
                <Phone size={26} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="serenebaths-footer">
        <div className="serenebaths-footer-inner">
          <p>
            <strong>SereneBaths</strong> · Walk-in tubs with low thresholds, grab
            bars, heated seats, and quick-drain comfort.
          </p>
          <p>
            Questions? Call <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          </p>
          <p className="serenebaths-footer-disclaimer">
            Independent provider listing. Not medical advice.
          </p>
          <p className="serenebaths-footer-disclaimer">
            © {new Date().getFullYear()} SereneBaths. Featured in the AltFTool
            Senior Care directory.
          </p>
        </div>
      </footer>
    </div>
  );
}
