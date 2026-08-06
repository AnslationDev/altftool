"use client";

import "./autoloan-express.css";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  CheckCircle2,
  Gauge,
  PhoneCall,
  Route,
  ShieldCheck,
  TimerReset,
  Zap,
} from "lucide-react";

const QUOTE_URL = "#demo-only";
const PHONE_DISPLAY = "Demo only";
const PHONE_HREF = "#demo-only";

function QuoteButton({ ghost, children }) {
  return (
    <a
      className={ghost ? "autoexpress-btn autoexpress-btn--ghost" : "autoexpress-btn"}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children || "Get a Free Quote"}
      <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}

function PhoneLink() {
  return (
    <a className="autoexpress-tel" href={PHONE_HREF}>
      <PhoneCall size={17} aria-hidden="true" />
      <span>{PHONE_DISPLAY}</span>
    </a>
  );
}

function Odometer({ digits, unit }) {
  return (
    <div className="autoexpress-odometer" aria-hidden="true">
      {digits.split("").map((d, i) => (
        <span key={i}>{d}</span>
      ))}
      {unit ? <span className="autoexpress-odometer-unit">{unit}</span> : null}
    </div>
  );
}

export default function AutoLoanExpressPage() {
  return (
    <div className="autoexpress-page">
      <header className="autoexpress-nav">
        <div className="autoexpress-nav-inner">
          <div className="autoexpress-logo">
            <span className="autoexpress-logo-flag" aria-hidden="true">
              <span /><span /><span /><span />
            </span>
            AutoLoan <em>Express</em>
          </div>
          <div className="autoexpress-nav-actions">
            <PhoneLink />
            <QuoteButton />
          </div>
        </div>
      </header>

      <main>
        <section className="autoexpress-hero" aria-label="AutoLoan Express overview">
          <div className="autoexpress-hero-copy">
            <div className="autoexpress-speedline" aria-hidden="true" />
            <p className="autoexpress-kicker">
              <Gauge size={15} aria-hidden="true" /> Drive-away financing
            </p>
            <h1>
              Pre-approval in minutes. <em>Rates built to race</em> the dealer desk.
            </h1>
            <p className="autoexpress-hero-sub">
              Walk into the showroom with financing already in gear. AutoLoan Express
              connects qualified buyers with competitive auto loan offers — new, used,
              or refinance — so the F&amp;I office never sets your pace.
            </p>
            <div className="autoexpress-hero-ctas">
              <QuoteButton />
              <PhoneLink />
            </div>
            <p className="autoexpress-hero-note">
              Checking options won&apos;t obligate you. Offers subject to credit approval.
            </p>
          </div>
          <div className="autoexpress-hero-media">
            <div className="autoexpress-frame autoexpress-frame--hero">
              <img src="https://images.unsplash.com/photo-1772893854519-89b9a6c9f2aa?auto=format&fit=crop&w=1600&q=80" alt="Sleek sports car on an open road at dusk, headlights on" />
              <span className="autoexpress-frame-stripe" aria-hidden="true" />
            </div>
          </div>
        </section>

        <div className="autoexpress-checker" aria-hidden="true" />

        <section className="autoexpress-stats" aria-label="AutoLoan Express by the numbers">
          <div className="autoexpress-stats-grid">
            <div className="autoexpress-stat">
              <Odometer digits="90" unit="sec" />
              <p className="autoexpress-stat-label">Typical decision time</p>
            </div>
            <div className="autoexpress-stat">
              <Odometer digits="72" unit="mo" />
              <p className="autoexpress-stat-label">Terms up to</p>
            </div>
            <div className="autoexpress-stat">
              <Odometer digits="40" unit="+" />
              <p className="autoexpress-stat-label">Lender partners</p>
            </div>
            <div className="autoexpress-stat">
              <Odometer digits="0" unit="$" />
              <p className="autoexpress-stat-label">Cost to compare</p>
            </div>
          </div>
        </section>

        <section className="autoexpress-section">
          <div className="autoexpress-wrap">
            <div className="autoexpress-section-head">
              <h2>
                Three lanes to <em>the fast lane</em>
              </h2>
              <p>
                A simple route from quote to keys — no detours through the dealership
                back office.
              </p>
            </div>
            <div className="autoexpress-lanes">
              <article className="autoexpress-lane">
                <p className="autoexpress-lane-num">01</p>
                <h3>
                  <Zap size={19} aria-hidden="true" /> Request your quote
                </h3>
                <p>
                  Tap the quote button and tell our partner desk what you&apos;re driving
                  toward — new purchase, used, or a refinance of your current loan.
                </p>
              </article>
              <article className="autoexpress-lane">
                <p className="autoexpress-lane-num">02</p>
                <h3>
                  <TimerReset size={19} aria-hidden="true" /> Get matched fast
                </h3>
                <p>
                  Qualified applicants typically see pre-approval decisions in minutes,
                  with offers lined up side by side so the numbers stay transparent.
                </p>
              </article>
              <article className="autoexpress-lane">
                <p className="autoexpress-lane-num">03</p>
                <h3>
                  <CarFront size={19} aria-hidden="true" /> Drive away
                </h3>
                <p>
                  Arrive at the lot as a cash-strength buyer. Sign, collect the keys,
                  and let the dealer&apos;s finance pitch watch you leave.
                </p>
              </article>
            </div>
          </div>
        </section>

        <div className="autoexpress-checker" aria-hidden="true" />

        <section className="autoexpress-section autoexpress-section--panel">
          <div className="autoexpress-wrap">
            <div className="autoexpress-board">
              <div className="autoexpress-board-card">
                <p className="autoexpress-board-title">
                  <Gauge size={15} aria-hidden="true" /> Sample rate board
                </p>
                <dl>
                  <div className="autoexpress-board-row">
                    <dt>New auto, strong credit</dt>
                    <dd>
                      from 5.4% <small>APR</small>
                    </dd>
                  </div>
                  <div className="autoexpress-board-row">
                    <dt>Used auto, strong credit</dt>
                    <dd>
                      from 6.1% <small>APR</small>
                    </dd>
                  </div>
                  <div className="autoexpress-board-row">
                    <dt>Refinance existing loan</dt>
                    <dd>
                      from 5.8% <small>APR</small>
                    </dd>
                  </div>
                  <div className="autoexpress-board-row">
                    <dt>Terms available</dt>
                    <dd>
                      36–72 <small>months</small>
                    </dd>
                  </div>
                </dl>
                <p className="autoexpress-board-fine">
                  Illustrative sample figures only — not an offer of credit. Your rate
                  depends on credit profile, vehicle, term, and lender. On approved credit.
                </p>
              </div>
              <div className="autoexpress-board-copy">
                <div className="autoexpress-speedline" aria-hidden="true" />
                <h2>
                  Built to <em>beat the dealer desk</em>
                </h2>
                <p>
                  Dealer financing marks up the middle. Comparing independent offers
                  first puts the leverage back in your hands — many qualified drivers
                  find a lower APR before they ever test drive.
                </p>
                <ul className="autoexpress-ticks">
                  <li><CheckCircle2 size={18} aria-hidden="true" /> Compare multiple lender offers in one pass</li>
                  <li><CheckCircle2 size={18} aria-hidden="true" /> New, used, private-party, and refinance options</li>
                  <li><CheckCircle2 size={18} aria-hidden="true" /> No fee to request a quote, no obligation to accept</li>
                  <li><CheckCircle2 size={18} aria-hidden="true" /> Real humans on the line at {PHONE_DISPLAY}</li>
                </ul>
                <div className="autoexpress-hero-ctas">
                  <QuoteButton />
                  <PhoneLink />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="autoexpress-checker" aria-hidden="true" />

        <section className="autoexpress-section">
          <div className="autoexpress-wrap">
            <div className="autoexpress-section-head">
              <h2>
                Financing for <em>every kind of driver</em>
              </h2>
              <p>
                From first cars to weekend machines, the route to fair financing looks
                the same: compare first, then commit.
              </p>
            </div>
            <div className="autoexpress-gallery">
              <article className="autoexpress-gcard">
                <div className="autoexpress-frame">
                  <img src="https://images.unsplash.com/photo-1778942855226-c3c2634db10b?auto=format&fit=crop&w=900&q=80" alt="Modern car parked in city surroundings, ready for a new owner" loading="lazy" />
                  <span className="autoexpress-frame-stripe" aria-hidden="true" />
                </div>
                <h3>New rides</h3>
                <p>
                  Lock financing before the showroom visit and negotiate on the price
                  of the car — not the payment.
                </p>
              </article>
              <article className="autoexpress-gcard">
                <div className="autoexpress-frame">
                  <img src="https://images.unsplash.com/photo-1771340042917-20213a50b574?auto=format&fit=crop&w=900&q=80" alt="Well-kept used car photographed outdoors in natural light" loading="lazy" />
                  <span className="autoexpress-frame-stripe" aria-hidden="true" />
                </div>
                <h3>Quality used</h3>
                <p>
                  Used-car rates that reward smart shopping, including dealer and
                  private-party purchases.
                </p>
              </article>
              <article className="autoexpress-gcard">
                <div className="autoexpress-frame">
                  <img src="https://images.unsplash.com/photo-1708791149644-5146954ba931?auto=format&fit=crop&w=900&q=80" alt="Driver's hands on the steering wheel heading down the highway" loading="lazy" />
                  <span className="autoexpress-frame-stripe" aria-hidden="true" />
                </div>
                <h3>Refinance &amp; save</h3>
                <p>
                  Already financed at the dealer? A refinance quote takes minutes and
                  could trim your monthly payment.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="autoexpress-cta-band" aria-label="Get started with AutoLoan Express">
          <div className="autoexpress-wrap autoexpress-cta-inner">
            <div>
              <h2>Green flag. Your move.</h2>
              <p>
                <ShieldCheck size={16} aria-hidden="true" style={{ verticalAlign: "-3px" }} />{" "}
                Free quote, fast decision, zero pressure — on approved credit.
              </p>
            </div>
            <div className="autoexpress-cta-actions">
              <QuoteButton />
              <PhoneLink />
            </div>
          </div>
        </section>
      </main>

      <footer className="autoexpress-footer">
        <div className="autoexpress-wrap autoexpress-footer-inner">
          <div className="autoexpress-logo">
            <span className="autoexpress-logo-flag" aria-hidden="true">
              <span /><span /><span /><span />
            </span>
            AutoLoan <em>Express</em>
          </div>
          <p>
            <BadgeCheck size={14} aria-hidden="true" style={{ verticalAlign: "-2px" }} />{" "}
            Questions? Call <a className="autoexpress-tel" href={PHONE_HREF} style={{ display: "inline" }}>{PHONE_DISPLAY}</a>
          </p>
          <p>
            <Route size={14} aria-hidden="true" style={{ verticalAlign: "-2px" }} />{" "}
            &copy; {new Date().getFullYear()} AutoLoan Express. All financing subject to
            credit approval; rates and terms vary by applicant and lender.
          </p>
          <p className="autoexpress-footer-disclaimer">
            Independent provider listing. Not financial or insurance advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
