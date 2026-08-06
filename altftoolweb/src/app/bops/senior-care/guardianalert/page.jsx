"use client";

import "./guardianalert.css";
import {
  Bell,
  Check,
  Clock,
  Heart,
  Home,
  Phone,
  Radio,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";

const QUOTE_URL = "#demo-only";
const PHONE_DISPLAY = "Demo only";
const PHONE_TEL = "#demo-only";

const IMG = {
  heroCouple:
    "https://images.unsplash.com/photo-1587556930799-8dca6fad6d41?auto=format&fit=crop&w=1600&q=80",
  companionship:
    "https://images.unsplash.com/photo-1609113006359-1e9c378ab54d?auto=format&fit=crop&w=1600&q=80",
  activeSenior:
    "https://images.unsplash.com/photo-1758686253992-62c9c69dfe61?auto=format&fit=crop&w=900&q=80",
  wristDevice:
    "https://images.unsplash.com/photo-1620862242704-93e77e90a83e?auto=format&fit=crop&w=900&q=80",
  familyCall:
    "https://images.unsplash.com/photo-1583777458845-047acbeb7d21?auto=format&fit=crop&w=900&q=80",
};

function CtaButton({ className = "guardianalert-btn guardianalert-btn-primary", children }) {
  return (
    <a
      className={className}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children}
    </a>
  );
}

export default function GuardianAlertPage() {
  return (
    <div className="guardianalert-page">
      {/* ===== Header ===== */}
      <header className="guardianalert-header">
        <div className="guardianalert-wrap guardianalert-header-inner">
          <a href="#guardianalert-top" className="guardianalert-brand">
            <span className="guardianalert-brand-badge" aria-hidden="true">
              <Bell size={24} strokeWidth={2.5} />
            </span>
            GuardianAlert
          </a>
          <a className="guardianalert-header-phone" href={PHONE_TEL}>
            <Phone size={30} strokeWidth={2.5} aria-hidden="true" />
            <span>
              <span className="guardianalert-header-phone-label">
                Talk to a real person
              </span>
              <span className="guardianalert-header-phone-number">
                {PHONE_DISPLAY}
              </span>
            </span>
          </a>
          <CtaButton className="guardianalert-btn guardianalert-btn-primary guardianalert-header-cta">
            Get a Free Consultation
          </CtaButton>
        </div>
      </header>

      <main id="guardianalert-top">
        {/* ===== Hero ===== */}
        <section className="guardianalert-hero" aria-labelledby="guardianalert-hero-h">
          <div className="guardianalert-wrap guardianalert-hero-grid">
            <div>
              <span className="guardianalert-eyebrow">
                Medical Alert Pendants &amp; Watches
              </span>
              <h1 id="guardianalert-hero-h">
                Help is one button away. Independence is everything else.
              </h1>
              <p className="guardianalert-hero-sub">
                GuardianAlert connects you to a trained, caring response team
                24 hours a day — from a lightweight pendant or watch you barely
                notice until the moment you need it.
              </p>
              <div className="guardianalert-hero-actions">
                <CtaButton>Get a Free Consultation</CtaButton>
                <a className="guardianalert-btn guardianalert-btn-outline" href={PHONE_TEL}>
                  <Phone size={24} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
              <p className="guardianalert-hero-note">
                <Sparkles size={20} aria-hidden="true" />
                No long-term contracts. Free, friendly advice — no pressure.
              </p>
            </div>
            <div className="guardianalert-device">
              <div className="guardianalert-help-button" role="img" aria-label="Illustration of the GuardianAlert one-touch help button">
                <div className="guardianalert-help-button-face">
                  <strong>HELP</strong>
                  <span>Press &amp; hold</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Trust strip ===== */}
        <section className="guardianalert-strip" aria-label="Service highlights">
          <div className="guardianalert-wrap">
            <ul className="guardianalert-strip-items">
              <li>
                <Clock size={22} aria-hidden="true" /> 24/7 U.S.-based response
              </li>
              <li>
                <Zap size={22} aria-hidden="true" /> Optional fall detection
              </li>
              <li>
                <Home size={22} aria-hidden="true" /> At-home &amp; on-the-go plans
              </li>
              <li>
                <Truck size={22} aria-hidden="true" /> Free shipping &amp; easy setup
              </li>
            </ul>
          </div>
        </section>

        {/* ===== Benefit tiles ===== */}
        <section className="guardianalert-section" aria-labelledby="guardianalert-benefits-h">
          <div className="guardianalert-wrap">
            <div className="guardianalert-section-head">
              <h2 id="guardianalert-benefits-h">
                Three big reasons families choose GuardianAlert
              </h2>
              <p>
                Simple to wear, simple to use, and someone kind on the line
                whenever it matters.
              </p>
            </div>
            <div className="guardianalert-tiles">
              <article className="guardianalert-tile">
                <div className="guardianalert-tile-media">
                  <img
                    src={IMG.activeSenior}
                    alt="A smiling older adult enjoying an active day outdoors"
                    loading="lazy"
                  />
                </div>
                <div className="guardianalert-tile-body">
                  <span className="guardianalert-tile-icon" aria-hidden="true">
                    <Bell size={30} strokeWidth={2.5} />
                  </span>
                  <h3>One-button help</h3>
                  <p>
                    Press the button and a trained responder answers, stays on
                    the line, and sends exactly the help you want — a neighbor,
                    a family member, or emergency services.
                  </p>
                </div>
              </article>
              <article className="guardianalert-tile">
                <div className="guardianalert-tile-media">
                  <img
                    src={IMG.wristDevice}
                    alt="A wrist-worn alert device with a clear, easy-to-read display"
                    loading="lazy"
                  />
                </div>
                <div className="guardianalert-tile-body">
                  <span className="guardianalert-tile-icon" aria-hidden="true">
                    <Zap size={30} strokeWidth={2.5} />
                  </span>
                  <h3>Automatic fall detection</h3>
                  <p>
                    Optional built-in sensors can place the call for you if a
                    fall is detected — a quiet extra layer of reassurance for
                    you and the people who love you.
                  </p>
                </div>
              </article>
              <article className="guardianalert-tile">
                <div className="guardianalert-tile-media">
                  <img
                    src={IMG.familyCall}
                    alt="An older adult talking warmly on the phone at home"
                    loading="lazy"
                  />
                </div>
                <div className="guardianalert-tile-body">
                  <span className="guardianalert-tile-icon" aria-hidden="true">
                    <Clock size={30} strokeWidth={2.5} />
                  </span>
                  <h3>24/7 caring response</h3>
                  <p>
                    Day or night, holidays included — a real person answers,
                    knows your name and your preferences, and follows your
                    personal response plan.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section className="guardianalert-section guardianalert-section-alt" aria-labelledby="guardianalert-how-h">
          <div className="guardianalert-wrap">
            <div className="guardianalert-section-head">
              <h2 id="guardianalert-how-h">How it works — three easy steps</h2>
              <p>Most households are up and running in under ten minutes.</p>
            </div>
            <div className="guardianalert-steps">
              <div className="guardianalert-step">
                <span className="guardianalert-step-num" aria-hidden="true" />
                <h3>Choose your device</h3>
                <p>
                  A classic pendant, a discreet wristband, or a watch-style
                  device — whichever feels most like you.
                </p>
              </div>
              <div className="guardianalert-step">
                <span className="guardianalert-step-num" aria-hidden="true" />
                <h3>Plug in and wear it</h3>
                <p>
                  Setup is as simple as plugging in the base or charging the
                  watch. No installers, no tools, no tech skills needed.
                </p>
              </div>
              <div className="guardianalert-step">
                <span className="guardianalert-step-num" aria-hidden="true" />
                <h3>Live your life</h3>
                <p>
                  Garden, travel, see friends. If you ever need a hand, help is
                  the press of a button away.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Mid CTA band ===== */}
        <section className="guardianalert-band" aria-labelledby="guardianalert-band-h">
          <div className="guardianalert-wrap guardianalert-band-inner">
            <div>
              <h2 id="guardianalert-band-h">Questions? Just call — we love to chat.</h2>
              <p>
                Our advisors will help you pick the right device and plan for
                your home, your lifestyle and your budget. No scripts, no rush.
              </p>
            </div>
            <div className="guardianalert-band-actions">
              <a className="guardianalert-band-phone" href={PHONE_TEL}>
                <Phone size={32} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
              <CtaButton>Get a Free Consultation</CtaButton>
            </div>
          </div>
        </section>

        {/* ===== Devices split ===== */}
        <section className="guardianalert-section" aria-labelledby="guardianalert-devices-h">
          <div className="guardianalert-wrap guardianalert-split">
            <div className="guardianalert-split-media">
              <img
                src={IMG.heroCouple}
                alt="An older couple laughing together at home, relaxed and at ease"
                loading="lazy"
              />
            </div>
            <div>
              <h2 id="guardianalert-devices-h">
                Designed for real life, not just emergencies
              </h2>
              <p>
                GuardianAlert devices are light, water-resistant and made to be
                forgotten about — until the one moment they become the most
                important thing you own.
              </p>
              <ul className="guardianalert-checklist">
                <li>
                  <span className="guardianalert-check" aria-hidden="true">
                    <Check size={20} strokeWidth={3} />
                  </span>
                  Pendant, wristband and watch styles to suit you
                </li>
                <li>
                  <span className="guardianalert-check" aria-hidden="true">
                    <Check size={20} strokeWidth={3} />
                  </span>
                  Shower-safe, with long battery life
                </li>
                <li>
                  <span className="guardianalert-check" aria-hidden="true">
                    <Check size={20} strokeWidth={3} />
                  </span>
                  Nationwide coverage at home and on the go
                </li>
                <li>
                  <span className="guardianalert-check" aria-hidden="true">
                    <Check size={20} strokeWidth={3} />
                  </span>
                  Family notifications, if and when you want them
                </li>
              </ul>
              <CtaButton>Get a Free Consultation</CtaButton>
            </div>
          </div>
        </section>

        {/* ===== Pricing note ===== */}
        <section className="guardianalert-section guardianalert-section-alt" aria-labelledby="guardianalert-price-h">
          <div className="guardianalert-wrap">
            <div className="guardianalert-pricing">
              <h2 id="guardianalert-price-h">Simple, honest pricing</h2>
              <p>Straightforward monthly service. That&apos;s the whole story.</p>
              <div className="guardianalert-pricing-figure">
                From $29<small>.95 / month</small>
              </div>
              <ul className="guardianalert-pricing-points">
                <li>
                  <ShieldCheck size={24} aria-hidden="true" /> No long-term
                  contracts — cancel anytime
                </li>
                <li>
                  <Radio size={24} aria-hidden="true" /> No equipment purchase
                  required on most plans
                </li>
                <li>
                  <Heart size={24} aria-hidden="true" /> No hidden fees,
                  activation charges or surprises
                </li>
              </ul>
              <CtaButton>Get a Free Consultation</CtaButton>
            </div>
          </div>
        </section>

        {/* ===== Companionship reassurance ===== */}
        <section className="guardianalert-section" aria-labelledby="guardianalert-family-h">
          <div className="guardianalert-wrap guardianalert-split">
            <div>
              <h2 id="guardianalert-family-h">Peace of mind for the whole family</h2>
              <p>
                A medical alert system isn&apos;t about limits — it&apos;s about
                freedom. When everyone knows help is close by, daughters worry
                less, sons call to chat instead of to check in, and independence
                stays right where it belongs: with you.
              </p>
              <ul className="guardianalert-checklist">
                <li>
                  <span className="guardianalert-check" aria-hidden="true">
                    <Check size={20} strokeWidth={3} />
                  </span>
                  Your response plan, your choices, your privacy
                </li>
                <li>
                  <span className="guardianalert-check" aria-hidden="true">
                    <Check size={20} strokeWidth={3} />
                  </span>
                  Friendly check-ins available on request
                </li>
                <li>
                  <span className="guardianalert-check" aria-hidden="true">
                    <Check size={20} strokeWidth={3} />
                  </span>
                  Advisors who listen first and recommend second
                </li>
              </ul>
              <a className="guardianalert-btn guardianalert-btn-outline" href={PHONE_TEL}>
                <Phone size={24} aria-hidden="true" />
                Call {PHONE_DISPLAY}
              </a>
            </div>
            <div className="guardianalert-split-media">
              <img
                src={IMG.companionship}
                alt="Two generations holding hands, sharing a quiet moment together"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* ===== Final CTA ===== */}
        <section className="guardianalert-final" aria-labelledby="guardianalert-final-h">
          <div className="guardianalert-wrap">
            <h2 id="guardianalert-final-h">
              Ready when you are. We&apos;ll be here.
            </h2>
            <p>
              Speak with a friendly GuardianAlert advisor today. Get honest
              answers, clear pricing and a recommendation that fits your life —
              in one relaxed phone call.
            </p>
            <div className="guardianalert-final-actions">
              <a className="guardianalert-final-phone" href={PHONE_TEL}>
                <Phone size={34} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
              <CtaButton>Get a Free Consultation</CtaButton>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="guardianalert-footer">
        <div className="guardianalert-wrap guardianalert-footer-inner">
          <div>
            <a href="#guardianalert-top" className="guardianalert-brand">
              <span className="guardianalert-brand-badge" aria-hidden="true">
                <Bell size={22} strokeWidth={2.5} />
              </span>
              GuardianAlert
            </a>
            <p>
              One-button help, fall detection and 24/7 response — independence
              with a safety net.
            </p>
            <p className="guardianalert-footer-disclaimer">
              Independent provider listing. Not medical advice.
            </p>
          </div>
          <div>
            <a className="guardianalert-header-phone" href={PHONE_TEL}>
              <Phone size={28} strokeWidth={2.5} aria-hidden="true" />
              <span>
                <span className="guardianalert-header-phone-label">
                  Call anytime
                </span>
                <span className="guardianalert-header-phone-number">
                  {PHONE_DISPLAY}
                </span>
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
