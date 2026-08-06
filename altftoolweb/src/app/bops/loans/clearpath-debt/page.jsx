"use client";

import "./clearpath-debt.css";
import {
  Waves,
  Phone,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Calculator,
  Handshake,
  Wallet,
  CalendarCheck,
  Star,
} from "lucide-react";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

function QuoteButton({ className = "clearpath-btn", children = "Get a Free Quote" }) {
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={className}>
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

export default function ClearPathDebtPage() {
  return (
    <div className="clearpath-page">
      <header className="clearpath-nav">
        <div className="clearpath-nav-inner">
          <a href="#clearpath-top" className="clearpath-logo">
            <span className="clearpath-logo-mark" aria-hidden="true">
              <Waves size={22} />
            </span>
            ClearPath Debt
          </a>
          <div className="clearpath-nav-actions">
            <a href={PHONE_TEL} className="clearpath-nav-phone">
              <Phone size={17} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <QuoteButton />
          </div>
        </div>
      </header>

      <main id="clearpath-top">
        <section className="clearpath-hero">
          <div className="clearpath-wrap clearpath-hero-grid">
            <div>
              <p className="clearpath-eyebrow">
                <Sparkles size={15} aria-hidden="true" />
                Debt consolidation, made calm
              </p>
              <h1>
                Five bills. Five due dates. <em>One quiet payment.</em>
              </h1>
              <p className="clearpath-hero-sub">
                ClearPath Debt helps you roll high-interest credit card and loan balances into a
                single monthly payment that may cost less than what you pay today — so your money,
                and your mind, get room to breathe.
              </p>
              <div className="clearpath-hero-ctas">
                <QuoteButton className="clearpath-btn clearpath-btn-lg" />
                <a href={PHONE_TEL} className="clearpath-btn clearpath-btn-ghost">
                  <Phone size={18} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
              <p className="clearpath-hero-note">
                <ShieldCheck size={16} aria-hidden="true" />
                Checking your options won&apos;t affect your credit score.
              </p>
            </div>
            <figure className="clearpath-hero-figure">
              <img
                src="https://images.unsplash.com/photo-1603464021578-f327592a89de?auto=format&fit=crop&w=1600&q=80"
                alt="Person leaning back at a bright desk, relaxed after simplifying their monthly bills"
              />
            </figure>
          </div>
        </section>

        <section className="clearpath-strip" aria-label="ClearPath at a glance">
          <div className="clearpath-wrap clearpath-strip-grid">
            <div className="clearpath-stat"><strong>1</strong><span>payment to remember each month</span></div>
            <div className="clearpath-stat"><strong>$7k–$100k</strong><span>typical balances consolidated</span></div>
            <div className="clearpath-stat"><strong>~10 min</strong><span>to request your free quote</span></div>
            <div className="clearpath-stat"><strong>0</strong><span>obligation — compare and decide</span></div>
          </div>
        </section>

        <section className="clearpath-section">
          <div className="clearpath-wrap">
            <p className="clearpath-kicker">Before &amp; after</p>
            <h2>From a pile of bills to one serene payment</h2>
            <p className="clearpath-section-lead">
              When every card carries its own rate, minimum, and due date, staying afloat becomes a
              part-time job. Consolidation gathers it all into one predictable place.
            </p>
            <div className="clearpath-beforeafter">
              <div className="clearpath-mess" aria-label="Example of scattered monthly bills before consolidation">
                <div className="clearpath-bill clearpath-bill-1">
                  <h3>Store Card</h3>
                  <p>Due the 3rd — <strong>27.9% APR</strong></p>
                </div>
                <div className="clearpath-bill clearpath-bill-2">
                  <h3>Visa Balance</h3>
                  <p>Due the 11th — <strong>24.4% APR</strong></p>
                </div>
                <div className="clearpath-bill clearpath-bill-3">
                  <h3>Personal Loan</h3>
                  <p>Due the 17th — <strong>19.6% APR</strong></p>
                </div>
                <div className="clearpath-bill clearpath-bill-4">
                  <h3>Medical Bill</h3>
                  <p>Due the 28th — collections risk</p>
                </div>
              </div>
              <div className="clearpath-flow" aria-hidden="true">
                <ArrowRight size={44} />
              </div>
              <div className="clearpath-one-card">
                <p className="clearpath-one-label">
                  <CheckCircle2 size={15} aria-hidden="true" />
                  After ClearPath
                </p>
                <h3>One ClearPath Payment</h3>
                <p className="clearpath-one-amount">
                  $412 <small>/ month</small>
                </p>
                <ul className="clearpath-one-meta">
                  <li><CheckCircle2 size={16} aria-hidden="true" /> One fixed due date — the 15th</li>
                  <li><CheckCircle2 size={16} aria-hidden="true" /> One rate, locked for the full term</li>
                  <li><CheckCircle2 size={16} aria-hidden="true" /> A clear payoff date you can circle</li>
                </ul>
                <p className="clearpath-mock-note">
                  Illustrative example only — your quote depends on your balances, credit profile,
                  and chosen term.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="clearpath-section clearpath-section-alt">
          <div className="clearpath-wrap clearpath-center">
            <p className="clearpath-kicker">How it works</p>
            <h2>Three gentle steps to simpler</h2>
            <p className="clearpath-section-lead">
              No pressure, no jargon. Just a clear look at what consolidation could do for your
              specific balances.
            </p>
            <div className="clearpath-steps">
              <div className="clearpath-step">
                <span className="clearpath-step-num" aria-hidden="true"><Calculator size={24} /></span>
                <h3>1. Request your free quote</h3>
                <p>
                  Tell a licensed specialist about your balances by phone or through our partner
                  page. It takes about ten minutes and never obligates you.
                </p>
              </div>
              <div className="clearpath-step">
                <span className="clearpath-step-num" aria-hidden="true"><Handshake size={24} /></span>
                <h3>2. Compare your options</h3>
                <p>
                  See what a single consolidated payment could look like next to what you pay now —
                  rate, term, and total cost, side by side in plain language.
                </p>
              </div>
              <div className="clearpath-step">
                <span className="clearpath-step-num" aria-hidden="true"><CalendarCheck size={24} /></span>
                <h3>3. Breathe on one due date</h3>
                <p>
                  If it makes sense for you, your qualifying balances are paid off and replaced with
                  one payment, one date, and one finish line.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="clearpath-section">
          <div className="clearpath-wrap">
            <p className="clearpath-kicker">Why people choose ClearPath</p>
            <h2>Built for the exhale, not the hard sell</h2>
            <p className="clearpath-section-lead">
              Consolidation isn&apos;t right for everyone — and we&apos;ll tell you if it isn&apos;t.
              When it fits, here&apos;s what it can feel like.
            </p>
            <div className="clearpath-cards">
              <article className="clearpath-card">
                <div className="clearpath-card-media">
                  <img
                    src="https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=900&q=80"
                    alt="Neatly organized desk with a notebook and coffee, symbolizing simplified finances"
                    loading="lazy"
                  />
                </div>
                <div className="clearpath-card-body">
                  <h3>One payment, one date</h3>
                  <p>
                    Swap a calendar full of minimums for a single predictable payment you can plan
                    your whole month around.
                  </p>
                </div>
              </article>
              <article className="clearpath-card">
                <div className="clearpath-card-media">
                  <img
                    src="https://images.unsplash.com/photo-1611095973763-414019e72400?auto=format&fit=crop&w=900&q=80"
                    alt="Person reviewing finances on a laptop with a calm, focused expression"
                    loading="lazy"
                  />
                </div>
                <div className="clearpath-card-body">
                  <h3>A rate that may be lower</h3>
                  <p>
                    Many qualified borrowers replace 20%+ card APRs with a single fixed rate —
                    your quote shows exactly what you&apos;d qualify for.
                  </p>
                </div>
              </article>
              <article className="clearpath-card">
                <div className="clearpath-card-media">
                  <img
                    src="https://images.unsplash.com/photo-1590870102494-ab6ed490f869?auto=format&fit=crop&w=900&q=80"
                    alt="Sunlit home workspace with plants, evoking a calmer financial routine"
                    loading="lazy"
                  />
                </div>
                <div className="clearpath-card-body">
                  <h3>A real payoff date</h3>
                  <p>
                    Fixed terms mean your debt has an end date — no more revolving balances that
                    drift on for years.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="clearpath-section clearpath-section-alt">
          <div className="clearpath-wrap">
            <div className="clearpath-midcta">
              <div>
                <p className="clearpath-kicker">Your free quote</p>
                <h2>See your number before you decide anything</h2>
                <ul className="clearpath-checklist">
                  <li><CheckCircle2 size={19} aria-hidden="true" /> A soft check only — no impact on your credit score to explore options.</li>
                  <li><CheckCircle2 size={19} aria-hidden="true" /> Plain-English comparison of your current payments vs. one consolidated payment.</li>
                  <li><CheckCircle2 size={19} aria-hidden="true" /> No fees to get a quote, and no obligation to accept it.</li>
                  <li><Wallet size={19} aria-hidden="true" /> Works with credit cards, store cards, medical bills, and personal loans.</li>
                </ul>
                <div className="clearpath-hero-ctas">
                  <QuoteButton className="clearpath-btn clearpath-btn-lg" />
                  <a href={PHONE_TEL} className="clearpath-btn clearpath-btn-ghost">
                    <Phone size={18} aria-hidden="true" />
                    Call {PHONE_DISPLAY}
                  </a>
                </div>
              </div>
              <figure className="clearpath-midcta-figure">
                <img
                  src="https://images.unsplash.com/photo-1615847014013-0dfa967ba04f?auto=format&fit=crop&w=1600&q=80"
                  alt="Two people talking through paperwork together at a bright kitchen table"
                  loading="lazy"
                />
              </figure>
            </div>
          </div>
        </section>

        <section className="clearpath-section">
          <div className="clearpath-wrap clearpath-center">
            <p className="clearpath-kicker">Kind words</p>
            <h2>The sound of people exhaling</h2>
            <p className="clearpath-section-lead">
              Illustrative experiences from consolidation customers. Individual results vary.
            </p>
            <div className="clearpath-quotes">
              <figure className="clearpath-quote">
                <div className="clearpath-quote-stars" aria-label="Five star rating">
                  <Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} />
                </div>
                <blockquote>
                  &ldquo;I went from juggling four due dates to one. The first month I didn&apos;t
                  check my banking app with dread was worth everything.&rdquo;
                </blockquote>
                <figcaption>Maya R. — consolidated 4 cards</figcaption>
              </figure>
              <figure className="clearpath-quote">
                <div className="clearpath-quote-stars" aria-label="Five star rating">
                  <Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} />
                </div>
                <blockquote>
                  &ldquo;They actually told me one of my loans wasn&apos;t worth consolidating.
                  That honesty is why I trusted the rest of the plan.&rdquo;
                </blockquote>
                <figcaption>Devon T. — kept one loan, merged three</figcaption>
              </figure>
              <figure className="clearpath-quote">
                <div className="clearpath-quote-stars" aria-label="Five star rating">
                  <Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} />
                </div>
                <blockquote>
                  &ldquo;Seeing an actual payoff date on paper changed how our whole house talks
                  about money. It ends. That&apos;s new.&rdquo;
                </blockquote>
                <figcaption>Priya &amp; Sam K. — five-year fixed term</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="clearpath-section" aria-label="Final call to action">
          <div className="clearpath-wrap">
            <div className="clearpath-band">
              <h2>Ready to hear one number instead of five?</h2>
              <p>
                A free, no-obligation quote takes about ten minutes. If consolidation fits, you&apos;ll
                know exactly what calmer looks like — down to the dollar.
              </p>
              <QuoteButton className="clearpath-btn clearpath-btn-lg" />
              <br />
              <a href={PHONE_TEL} className="clearpath-band-phone">
                <Phone size={18} aria-hidden="true" />
                Or call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="clearpath-footer">
        <div className="clearpath-wrap">
          <div className="clearpath-footer-inner">
            <a href="#clearpath-top" className="clearpath-logo">
              <span className="clearpath-logo-mark" aria-hidden="true">
                <Waves size={22} />
              </span>
              ClearPath Debt
            </a>
            <nav className="clearpath-footer-links" aria-label="Footer">
              <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer">Get a Free Quote</a>
              <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
            </nav>
          </div>
          <p className="clearpath-disclaimer">
            ClearPath Debt is a fictional brand presented for directory listing purposes. Quotes are
            free and carry no obligation; approval, rates, and terms depend on individual
            qualification and are never guaranteed. Independent provider listing. Not financial or
            insurance advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
