"use client";

import { useState } from "react";
import {
  TrendingUp,
  Phone,
  ArrowRight,
  CheckCircle2,
  BadgeCheck,
  Hammer,
  Store,
  Package,
  ChevronDown,
  Clock,
  ShieldCheck,
} from "lucide-react";
import "./bizfund-capital.css";

const QUOTE_URL = "https://example.com/quote/bizfund-capital";
const PHONE_TEL = "tel:+18115550234";
const PHONE_DISPLAY = "(811) 555-0234";
const IMG = {
  hero: "https://images.unsplash.com/photo-1608613304899-ea8098577e38?auto=format&fit=crop&w=1600&q=80",
  workshop: "https://images.unsplash.com/photo-1547609434-b732edfee020?auto=format&fit=crop&w=900&q=80",
  merchant: "https://images.unsplash.com/photo-1631396326646-c06a935ff3a6?auto=format&fit=crop&w=900&q=80",
  equipment: "https://images.unsplash.com/photo-1679797850019-3d0d8659a695?auto=format&fit=crop&w=900&q=80",
  story: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=900&q=80",
};

function QuoteButton({ className, children }) {
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

const PRODUCTS = [
  {
    icon: Store, img: IMG.merchant, title: "Working Capital", range: "$10k – $250k · 3–18 months",
    alt: "Shop owner reviewing stock on the counter of a small retail store",
    copy: "Bridge slow seasons, cover payroll, or grab a bulk-discount moment. Short, predictable terms with no surprises buried in the fine print.",
  },
  {
    icon: Hammer, img: IMG.equipment, title: "Equipment Funding", range: "$15k – $500k · up to 60 months",
    alt: "Industrial workshop machinery ready for a production run",
    copy: "Kilns, CNC routers, espresso machines, delivery vans — finance the gear that grows output, with the equipment itself doing the heavy lifting as collateral.",
  },
  {
    icon: Package, img: IMG.workshop, title: "Inventory Lines", range: "$5k – $150k · revolving",
    alt: "Craftsperson assembling handmade goods at a wooden workbench",
    copy: "A revolving line sized to your sales history, so you can stock up before the rush and draw only what you actually use.",
  },
];

const STEPS = [
  { t: "Tell us your shape", c: "A short call or online quote request covers your revenue, time in business, and what the capital is for. Soft credit pull only." },
  { t: "Get a clear offer", c: "Qualified applicants typically see a decision within a few business hours — one page, every cost itemized, valid for 7 days." },
  { t: "Fund and build", c: "Accept when you are ready and funds usually arrive in 1–2 business days. Pay early any time without penalty." },
];

const FAQS = [
  { q: "How fast can I actually get funds?", a: "Most complete applications receive a decision within a few business hours, and approved funds typically land in 1–2 business days. Complex equipment deals can take a little longer." },
  { q: "Will checking my rate affect my credit?", a: "The initial rate check uses a soft inquiry that does not affect your credit score. A hard inquiry only happens if you decide to move forward with a full application." },
  { q: "What do I need to qualify?", a: "Typically 6+ months in business, roughly $8k+ in monthly revenue, and a business bank account. Every file is reviewed individually — approval is never guaranteed and depends on your business profile." },
  { q: "Are there prepayment penalties?", a: "No. Pay your balance early and you stop accruing cost from that day forward. We would rather earn your next round of growth than a penalty fee." },
];

export default function BizFundCapitalPage() {
  const [open, setOpen] = useState(0);

  return (
    <div className="bizfund-page">
      <header className="bizfund-nav">
        <div className="bizfund-nav-inner">
          <a href="#bizfund-top" className="bizfund-logo">
            <span className="bizfund-logo-mark"><TrendingUp size={18} aria-hidden="true" /></span>
            BizFund&nbsp;<em>Capital</em>
          </a>
          <nav className="bizfund-nav-links" aria-label="Main navigation">
            <a href="#bizfund-products">Funding</a>
            <a href="#bizfund-how">How It Works</a>
            <a href="#bizfund-story">Stories</a>
            <a href="#bizfund-faq">FAQ</a>
          </nav>
          <div className="bizfund-nav-cta">
            <a href={PHONE_TEL} className="bizfund-phone-link">
              <Phone size={15} aria-hidden="true" /><span>{PHONE_DISPLAY}</span>
            </a>
            <QuoteButton className="bizfund-btn bizfund-btn-solid">Get a Free Quote</QuoteButton>
          </div>
        </div>
      </header>

      <main id="bizfund-top">
        <section className="bizfund-hero">
          <div className="bizfund-wrap bizfund-hero-inner">
            <div>
              <p className="bizfund-eyebrow">
                <BadgeCheck size={14} aria-hidden="true" /> Built for makers &amp; merchants
              </p>
              <h1>Fuel for the business you built <span>by hand.</span></h1>
              <p className="bizfund-lede">
                BizFund Capital puts working capital and equipment funding within reach of small
                workshops, studios, and storefronts — with plain-English terms and decisions in
                hours, not weeks.
              </p>
              <div className="bizfund-hero-actions">
                <QuoteButton className="bizfund-btn bizfund-btn-solid">
                  Get a Free Quote <ArrowRight size={17} aria-hidden="true" />
                </QuoteButton>
                <a href={PHONE_TEL} className="bizfund-btn bizfund-btn-ghost">
                  <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
              <ul className="bizfund-hero-points">
                <li><CheckCircle2 size={15} aria-hidden="true" /> Soft-pull rate check</li>
                <li><CheckCircle2 size={15} aria-hidden="true" /> No prepayment penalties</li>
                <li><CheckCircle2 size={15} aria-hidden="true" /> Funding often in 1–2 days</li>
              </ul>
              <div className="bizfund-bars" role="img" aria-label="Ascending bar chart representing steady business growth">
                {[30, 42, 55, 68, 84, 100].map((h) => (
                  <div key={h} className="bizfund-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="bizfund-hero-media">
              <div className="bizfund-frame">
                <img
                  src={IMG.hero}
                  alt="Maker working with tools at a bench in a small workshop"
                />
              </div>
              <div className="bizfund-stamp" aria-label="Decisions in as little as four hours">
                Decided<span>in as little as 4 hrs</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bizfund-stats" aria-label="BizFund Capital at a glance">
          <div className="bizfund-wrap bizfund-stats-grid">
            {/*
              BizFund Capital is a sample provider, not a lender. The stats here
              claimed "$310M+ funded to small businesses", "6,200+ makers &
              merchants served", a four-hour decision time and a 4.8/5 client
              rating. Lending figures are a regulated claim in most places and
              none of these had anything behind them.
            */}
            <div className="bizfund-stat"><strong>Template</strong><small>sample provider page</small></div>
            <div className="bizfund-stat"><strong>No lending</strong><small>nothing is offered here</small></div>
            <div className="bizfund-stat"><strong>No data sent</strong><small>the form is display-only</small></div>
          </div>
        </section>

        <section className="bizfund-ledger" id="bizfund-products">
          <div className="bizfund-wrap">
            <p className="bizfund-kicker">Funding, three ways</p>
            <h2 className="bizfund-h2">Capital shaped to how you actually earn</h2>
            <p className="bizfund-section-intro">
              Whether you throw pots, roast beans, or stock shelves, your cash flow has its own
              rhythm. Pick the structure that matches it.
            </p>
            <div className="bizfund-cards">
              {PRODUCTS.map(({ icon: Icon, img, alt, title, copy, range }) => (
                <article key={title} className="bizfund-card">
                  <div className="bizfund-card-media">
                    <img src={img} alt={alt} loading="lazy" />
                  </div>
                  <div className="bizfund-card-body">
                    <h3><Icon size={20} aria-hidden="true" /> {title}</h3>
                    <p>{copy}</p>
                    <div className="bizfund-card-range">{range}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bizfund-ledger" aria-label="Request a quote">
          <div className="bizfund-wrap">
            <div className="bizfund-midcta">
              <div>
                <h2>Know your number before lunch.</h2>
                <p>A five-minute call or a free online quote — no obligation, no hard credit pull.</p>
              </div>
              <div className="bizfund-midcta-actions">
                <QuoteButton className="bizfund-btn bizfund-btn-mint">
                  Get a Free Quote <ArrowRight size={17} aria-hidden="true" />
                </QuoteButton>
                <a href={PHONE_TEL} className="bizfund-btn bizfund-btn-ghost">
                  <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bizfund-ledger" aria-labelledby="bizfund-sample-h">
          <div className="bizfund-wrap bizfund-quote-grid">
            <div>
              <p className="bizfund-kicker">See it on paper</p>
              <h2 className="bizfund-h2" id="bizfund-sample-h">What a BizFund offer looks like</h2>
              <p className="bizfund-section-intro" style={{ marginBottom: 18 }}>
                No teaser rates, no decoder ring. Every offer is a single page that reads like a
                ledger entry: what you get, what it costs, when it is paid. Here is an illustrative
                example for a working-capital loan.
              </p>
              <QuoteButton className="bizfund-btn bizfund-btn-solid">
                Get Your Own Quote <ArrowRight size={17} aria-hidden="true" />
              </QuoteButton>
            </div>
            <aside className="bizfund-ledger-sheet" aria-label="Illustrative sample offer">
              <h3>Sample Offer — Illustrative Only</h3>
              <dl>
                <div className="bizfund-ledger-row"><dt>Funding amount</dt><dd>$60,000</dd></div>
                <div className="bizfund-ledger-row"><dt>Term</dt><dd>12 months</dd></div>
                <div className="bizfund-ledger-row"><dt>Est. weekly payment</dt><dd>$1,290</dd></div>
                <div className="bizfund-ledger-row"><dt>Origination fee</dt><dd>2.5%</dd></div>
                <div className="bizfund-ledger-row"><dt>Prepayment penalty</dt><dd>None</dd></div>
                <div className="bizfund-ledger-row bizfund-ledger-row-total"><dt>Total repayment</dt><dd>$67,080</dd></div>
              </dl>
              <p className="bizfund-ledger-note">
                Example for illustration only — not an offer. Actual amounts, rates, and terms vary
                by business profile and are subject to underwriting review.
              </p>
            </aside>
          </div>
        </section>

        <section className="bizfund-ledger" id="bizfund-how">
          <div className="bizfund-wrap">
            <p className="bizfund-kicker">How it works</p>
            <h2 className="bizfund-h2">Three steps, zero mystery</h2>
            <p className="bizfund-section-intro">
              We keep the process as tidy as your workbench.
            </p>
            <div className="bizfund-steps">
              {STEPS.map(({ t, c }) => (
                <div key={t} className="bizfund-step">
                  <h3>{t}</h3>
                  <p>{c}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bizfund-ledger" id="bizfund-story">
          <div className="bizfund-wrap bizfund-story-grid">
            <div className="bizfund-story-media">
              <div className="bizfund-frame">
                <img
                  src={IMG.story}
                  alt="Small-business owner packing customer orders in their studio"
                  loading="lazy"
                />
              </div>
            </div>
            <div>
              <p className="bizfund-kicker">From the ledger</p>
              <h2 className="bizfund-h2">Real growth, one line item at a time</h2>
              <p className="bizfund-section-intro" style={{ marginBottom: 0 }}>
                Our favorite entries are not ours — they are the second kiln, the third employee,
                the first wholesale order our clients could finally say yes to.
              </p>
              <blockquote className="bizfund-blockquote">
                “The equipment loan paid for our new roaster, and the roaster paid for itself by
                month five. The paperwork took less time than my morning cupping session.”
                <footer>— Priya S., specialty coffee roaster</footer>
              </blockquote>
              <blockquote className="bizfund-blockquote">
                “I checked my rate on a Tuesday and stocked my whole holiday inventory that same
                week. The terms were exactly what the quote said.”
                <footer>— Marcus T., independent toy store owner</footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="bizfund-ledger" id="bizfund-faq">
          <div className="bizfund-wrap">
            <p className="bizfund-kicker">Questions</p>
            <h2 className="bizfund-h2">Asked often, answered plainly</h2>
            <div className="bizfund-faq-list">
              {FAQS.map((item, i) => (
                <div key={item.q} className="bizfund-faq-item">
                  <button
                    type="button"
                    className="bizfund-faq-q"
                    aria-expanded={open === i}
                    onClick={() => setOpen(open === i ? -1 : i)}
                  >
                    {item.q}
                    <ChevronDown size={19} aria-hidden="true" />
                  </button>
                  {open === i && <p className="bizfund-faq-a">{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bizfund-ledger bizfund-final">
          <div className="bizfund-wrap">
            <h2>Your next growth entry starts here.</h2>
            <p>
              Get a free, no-obligation quote online, or talk to a funding specialist who knows the
              difference between a slow month and a slow business.
            </p>
            <div className="bizfund-final-actions">
              <QuoteButton className="bizfund-btn bizfund-btn-mint">
                Get a Free Quote <ArrowRight size={17} aria-hidden="true" />
              </QuoteButton>
              <a href={PHONE_TEL} className="bizfund-btn bizfund-btn-ghost">
                <Phone size={16} aria-hidden="true" /> Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bizfund-footer">
        <div className="bizfund-wrap">
          <div className="bizfund-footer-inner">
            <span className="bizfund-logo">
              <span className="bizfund-logo-mark"><TrendingUp size={16} aria-hidden="true" /></span>
              BizFund&nbsp;<em>Capital</em>
            </span>
            <span className="bizfund-footer-meta">
              <Clock size={14} aria-hidden="true" /> Mon–Fri 8am–7pm ET ·{" "}
              <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
            </span>
            <span className="bizfund-footer-meta">
              <ShieldCheck size={14} aria-hidden="true" /> Soft-pull rate checks only
            </span>
          </div>
          <p className="bizfund-disclaimer">
            BizFund Capital is a fictional brand shown for directory demonstration. All figures are
            illustrative; funding amounts, rates, and terms vary and are subject to underwriting
            review. Approval is not guaranteed. Independent provider listing. Not financial or
            insurance advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
