"use client";

import "./lendleap.css";
import {
  Zap,
  Phone,
  Smartphone,
  Timer,
  BadgeCheck,
  Wallet,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Gauge,
  FileX2,
} from "lucide-react";

const QUOTE_URL = "https://example.com/quote/lendleap";
const PHONE_DISPLAY = "(811) 555-0201";
const PHONE_TEL = "tel:+18115550201";

const IMG = {
  hero: "https://images.unsplash.com/photo-1681826292838-c37fbd22263a?auto=format&fit=crop&w=1600&q=80",
  split: "https://images.unsplash.com/photo-1567978597387-4591473b0a06?auto=format&fit=crop&w=1600&q=80",
  card1: "https://images.unsplash.com/photo-1599202875854-23b7cd490ff4?auto=format&fit=crop&w=900&q=80",
  card2: "https://images.unsplash.com/photo-1694057336527-fbc3e7c84890?auto=format&fit=crop&w=900&q=80",
  card3: "https://images.unsplash.com/photo-1651573090587-750163a41ce1?auto=format&fit=crop&w=900&q=80",
};

function QuoteButton({ className = "lendleap-btn lendleap-btn-primary", children }) {
  return (
    <a
      className={className}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

export default function LendLeapPage() {
  return (
    <div className="lendleap-page">
      {/* ---------- Nav ---------- */}
      <header className="lendleap-nav">
        <div className="lendleap-wrap lendleap-nav-inner">
          <a href="#lendleap-top" className="lendleap-logo">
            <span className="lendleap-logo-mark" aria-hidden="true">
              <Zap size={20} />
            </span>
            LendLeap
          </a>
          <div className="lendleap-nav-actions">
            <a className="lendleap-nav-phone" href={PHONE_TEL}>
              <Phone size={17} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <QuoteButton>Get a Free Quote</QuoteButton>
          </div>
        </div>
      </header>

      <main id="lendleap-top">
        {/* ---------- Hero ---------- */}
        <section className="lendleap-hero">
          <div className="lendleap-wrap lendleap-hero-inner">
            <div>
              <p className="lendleap-eyebrow">
                <Smartphone size={15} aria-hidden="true" />
                App-first personal loans
              </p>
              <h1>Personal loans in a tap. Funded as soon as today.</h1>
              <p className="lendleap-hero-sub">
                Check your rate in about 60 seconds with no impact to your
                credit score. If you qualify, sign in the app and skip the
                paperwork — many approved borrowers see funds the same day.
              </p>
              <div className="lendleap-hero-ctas">
                <QuoteButton>Get a Free Quote</QuoteButton>
                <a className="lendleap-btn lendleap-btn-ghost" href={PHONE_TEL}>
                  <Phone size={18} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
              <div className="lendleap-chips">
                <span className="lendleap-chip">
                  <Timer size={15} aria-hidden="true" /> 60-sec rate check
                </span>
                <span className="lendleap-chip">
                  <Wallet size={15} aria-hidden="true" /> Same-day funding*
                </span>
                <span className="lendleap-chip">
                  <FileX2 size={15} aria-hidden="true" /> Zero paperwork
                </span>
              </div>
            </div>

            <div className="lendleap-phone-zone">
              <div className="lendleap-hero-img-frame">
                <img
                  src={IMG.hero}
                  alt="Person checking a personal loan offer on a smartphone"
                />
              </div>

              {/* Pure visual mock — no inputs */}
              <div className="lendleap-phone" role="img" aria-label="Illustration of the LendLeap app showing a sample rate-check screen">
                <div className="lendleap-phone-head">
                  <span>Rate check</span>
                  <span>Sample</span>
                </div>
                <div className="lendleap-ring" aria-hidden="true">
                  <div className="lendleap-ring-inner">
                    <span className="lendleap-ring-value">81%</span>
                    <span className="lendleap-ring-label">Complete</span>
                  </div>
                </div>
                <div className="lendleap-phone-row">
                  <span>Amount</span>
                  <strong>$12,000</strong>
                </div>
                <div className="lendleap-phone-row">
                  <span>Term</span>
                  <strong>36 months</strong>
                </div>
                <div className="lendleap-phone-row">
                  <span>Est. APR</span>
                  <strong>from 8.49%</strong>
                </div>
                <div className="lendleap-phone-cta" aria-hidden="true">
                  See my offers
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section className="lendleap-section">
          <div className="lendleap-wrap">
            <p className="lendleap-kicker">How it works</p>
            <h2>Three taps between you and your money</h2>
            <p className="lendleap-section-lead">
              LendLeap was built for your phone, not a branch office. The whole
              journey — from rate check to funding — happens in one clean app
              flow.
            </p>
            <div className="lendleap-steps">
              <article className="lendleap-step">
                <span className="lendleap-step-num" aria-hidden="true">
                  <Gauge size={22} />
                </span>
                <h3>1. Check your rate</h3>
                <p>
                  A soft credit check shows the rates you may qualify for in
                  about 60 seconds — with no effect on your score.
                </p>
              </article>
              <article className="lendleap-step">
                <span className="lendleap-step-num" aria-hidden="true">
                  <BadgeCheck size={22} />
                </span>
                <h3>2. Pick your offer</h3>
                <p>
                  Compare amounts from $1,000 to $50,000 and terms from 12 to
                  60 months. Choose the payment that fits your budget.
                </p>
              </article>
              <article className="lendleap-step">
                <span className="lendleap-step-num" aria-hidden="true">
                  <Wallet size={22} />
                </span>
                <h3>3. Get funded fast</h3>
                <p>
                  E-sign in the app and, if approved, money can hit your
                  account as soon as the same business day.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- Feature cards ---------- */}
        <section className="lendleap-section lendleap-section-alt">
          <div className="lendleap-wrap">
            <p className="lendleap-kicker">Built for real life</p>
            <h2>One loan, a thousand uses</h2>
            <p className="lendleap-section-lead">
              Whether you are consolidating cards, covering a big moment, or
              smoothing out a surprise expense, a fixed-rate personal loan
              keeps the payment predictable.
            </p>
            <div className="lendleap-cards">
              <article className="lendleap-card">
                <div className="lendleap-card-img">
                  <img
                    src={IMG.card1}
                    alt="Couple reviewing finances together at home"
                    loading="lazy"
                  />
                </div>
                <div className="lendleap-card-body">
                  <h3>Debt consolidation</h3>
                  <p>
                    Roll multiple high-interest balances into one fixed monthly
                    payment and a single payoff date.
                  </p>
                </div>
              </article>
              <article className="lendleap-card">
                <div className="lendleap-card-img">
                  <img
                    src={IMG.card2}
                    alt="Contractor planning a home improvement project"
                    loading="lazy"
                  />
                </div>
                <div className="lendleap-card-body">
                  <h3>Home projects</h3>
                  <p>
                    Fund the kitchen refresh or roof repair without touching
                    your home equity or your emergency savings.
                  </p>
                </div>
              </article>
              <article className="lendleap-card">
                <div className="lendleap-card-img">
                  <img
                    src={IMG.card3}
                    alt="Person managing bills and expenses on a laptop"
                    loading="lazy"
                  />
                </div>
                <div className="lendleap-card-body">
                  <h3>Life's surprises</h3>
                  <p>
                    Medical bills, car repairs, moving costs — handle the
                    unexpected with clear, fixed terms.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- Split + mid-page CTA ---------- */}
        <section className="lendleap-section">
          <div className="lendleap-wrap lendleap-split">
            <div className="lendleap-split-img">
              <img
                src={IMG.split}
                alt="Smiling customer using a banking app on a mobile phone"
                loading="lazy"
              />
            </div>
            <div>
              <p className="lendleap-kicker">Why LendLeap</p>
              <h2>No branches. No fax machines. No drama.</h2>
              <ul className="lendleap-ticks">
                <li>
                  <CheckCircle2 className="lendleap-tick-icon" size={20} aria-hidden="true" />
                  Soft-pull rate check that never dings your score
                </li>
                <li>
                  <CheckCircle2 className="lendleap-tick-icon" size={20} aria-hidden="true" />
                  Fixed rates and no prepayment penalties
                </li>
                <li>
                  <CheckCircle2 className="lendleap-tick-icon" size={20} aria-hidden="true" />
                  256-bit encryption and biometric app login
                </li>
                <li>
                  <CheckCircle2 className="lendleap-tick-icon" size={20} aria-hidden="true" />
                  Human support 7 days a week, right from the app
                </li>
              </ul>
              <div className="lendleap-split-ctas">
                <QuoteButton>Get a Free Quote</QuoteButton>
                <a className="lendleap-btn lendleap-btn-dark" href={PHONE_TEL}>
                  <Phone size={18} aria-hidden="true" />
                  Call {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Stats ---------- */}
        <section className="lendleap-section lendleap-section-alt">
          <div className="lendleap-wrap">
            <p className="lendleap-kicker">By the numbers</p>
            <h2>Fast is kind of our thing</h2>
            <p className="lendleap-section-lead">
              Typical experience for qualified applicants who complete the
              in-app flow.
            </p>
            <div className="lendleap-stats">
              <div className="lendleap-stat">
                <strong>60 sec</strong>
                <span>Average rate check</span>
              </div>
              <div className="lendleap-stat">
                <strong>$50K</strong>
                <span>Maximum loan amount</span>
              </div>
              <div className="lendleap-stat">
                <strong>Same day</strong>
                <span>Fastest funding*</span>
              </div>
              <div className="lendleap-stat">
                <strong>4.8★</strong>
                <span>Average app rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="lendleap-section">
          <div className="lendleap-wrap">
            <div className="lendleap-final">
              <p className="lendleap-eyebrow">
                <Sparkles size={15} aria-hidden="true" />
                Ready when you are
              </p>
              <h2>See your rate before your coffee cools</h2>
              <p>
                Checking takes about a minute, costs nothing, and won't affect
                your credit score. Approval is subject to eligibility and
                credit review.
              </p>
              <div className="lendleap-final-ctas">
                <QuoteButton>Get a Free Quote</QuoteButton>
                <a className="lendleap-btn lendleap-btn-ghost" href={PHONE_TEL}>
                  <Phone size={18} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="lendleap-footer">
        <div className="lendleap-wrap">
          <div className="lendleap-footer-inner">
            <a href="#lendleap-top" className="lendleap-logo">
              <span className="lendleap-logo-mark" aria-hidden="true">
                <Zap size={20} />
              </span>
              LendLeap
            </a>
            <a className="lendleap-footer-phone" href={PHONE_TEL}>
              <Phone size={16} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <span>
              <ShieldCheck size={16} aria-hidden="true" style={{ verticalAlign: "-3px", marginRight: 6 }} />
              Secure, encrypted experience
            </span>
          </div>
          <p className="lendleap-disclaimer">
            LendLeap is a fictional brand shown for demonstration. *Same-day
            funding depends on approval time, your bank, and time of day.
            Rates, amounts, and terms shown are illustrative samples, vary by
            applicant, and are subject to credit approval. Independent provider
            listing. Not financial or insurance advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
