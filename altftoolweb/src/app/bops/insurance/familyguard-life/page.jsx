"use client";

import "./familyguard-life.css";
import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Phone,
  Check,
  ChevronDown,
  Users,
  HeartHandshake,
  FileText,
  ArrowRight,
} from "lucide-react";

const QUOTE_URL = "https://example.com/quote/familyguard-life";
const PHONE_TEL = "tel:+18665550312";
const PHONE_DISPLAY = "(866) 555-0312";

const IMG = {
  hero: "https://images.unsplash.com/photo-1604251163789-4b8f70807273?auto=format&fit=crop&w=1600&q=80",
  band: "https://images.unsplash.com/photo-1626450780751-d0d764738e86?auto=format&fit=crop&w=1600&q=80",
  cardTerm: "https://images.unsplash.com/photo-1635179850613-37de539a0a4d?auto=format&fit=crop&w=900&q=80",
  cardWhole: "https://images.unsplash.com/photo-1605656816284-e3031500e190?auto=format&fit=crop&w=900&q=80",
  cardFinal: "https://images.unsplash.com/photo-1627662235844-6f5d8f54816b?auto=format&fit=crop&w=900&q=80",
};

const PLANS = [
  {
    img: IMG.cardTerm,
    alt: "Young family relaxing together at home",
    title: "Guarded Term",
    copy: "Straightforward protection for the mortgage-and-school-run years, with level premiums for the full term.",
    points: ["10, 20, or 30-year level terms", "Coverage from $100K to $2M", "Option to convert to whole life later"],
  },
  {
    img: IMG.cardWhole,
    alt: "Grandparents and grandchildren sharing a warm moment",
    title: "Heritage Whole Life",
    copy: "Lifelong cover that builds cash value quietly in the background — a policy your grandchildren may thank you for.",
    points: ["Coverage that never expires", "Fixed premiums, guaranteed cash value growth", "Dividends eligible on participating policies"],
  },
  {
    img: IMG.cardFinal,
    alt: "Adult daughter embracing her elderly mother outdoors",
    title: "Final Expense",
    copy: "A smaller, simpler policy designed to lift funeral costs and last bills off your family's shoulders.",
    points: ["Simplified application for ages 50–85", "Benefit amounts from $5K to $50K", "Rates locked in at issue"],
  },
];

const VALUES = [
  {
    icon: Users,
    title: "A Named Advisor, Not a Call Queue",
    copy: "You are assigned one licensed advisor who learns your situation and stays with your file — the same voice every time you call.",
  },
  {
    icon: FileText,
    title: "Terms That Never Surprise",
    copy: "Plain-language policy summaries, premiums stated up front, and every exclusion explained before you sign — not after.",
  },
  {
    icon: HeartHandshake,
    title: "Claims Handled Like Family",
    copy: "When a claim comes, your advisor walks your beneficiaries through it personally. Most complete claims are paid within days of approval.",
  },
];

const RATES = [
  { profile: "Female, 35, non-smoker · 20-yr term, $500K", rate: "from $24/mo" },
  { profile: "Male, 40, non-smoker · 20-yr term, $500K", rate: "from $33/mo" },
  { profile: "Female, 50, non-smoker · Whole life, $100K", rate: "from $138/mo" },
  { profile: "Male, 62 · Final expense, $15K", rate: "from $71/mo" },
];

const FAQS = [
  {
    q: "Do I have to take a medical exam?",
    a: "It depends on the policy and amount. Many term and final expense policies can be issued with a simple health questionnaire; larger amounts may require a paramedical exam. Your advisor will tell you exactly what applies before you commit to anything.",
  },
  {
    q: "Can my rates go up after I buy?",
    a: "On level term and whole life policies, your premium is fixed for the period stated in your contract. We put the premium schedule in writing before issue, so there is nothing to discover later.",
  },
  {
    q: "What if my health isn't perfect?",
    a: "Many applicants with managed conditions still qualify, though rates and availability vary by health, age, and history. An honest conversation with your advisor is the fastest way to learn what you are likely to be offered — approval is never automatic, and we will never pretend otherwise.",
  },
  {
    q: "How fast can coverage start?",
    a: "Simplified policies can often be decided within days of a completed application; fully underwritten policies typically take a few weeks. Your advisor keeps you informed at every step.",
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="familyguard-faq-item">
      <button type="button" className="familyguard-faq-q" aria-expanded={open} onClick={onToggle}>
        {item.q}
        <ChevronDown size={20} aria-hidden="true" />
      </button>
      {open && <p className="familyguard-faq-a">{item.a}</p>}
    </div>
  );
}

export default function FamilyGuardLifePage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="familyguard-page">
      {/* Nav */}
      <header className="familyguard-nav">
        <div className="familyguard-wrap familyguard-nav-inner">
          <a href="#familyguard-top" className="familyguard-brand" aria-label="FamilyGuard Life home">
            <span className="familyguard-brand-mark" aria-hidden="true">
              <Shield size={20} />
            </span>
            <span className="familyguard-brand-name">
              FamilyGuard <span>Life</span>
            </span>
          </a>
          <div className="familyguard-nav-actions">
            <a href={PHONE_TEL} className="familyguard-nav-phone">
              <Phone size={16} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              href={QUOTE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="familyguard-btn familyguard-btn--gold familyguard-btn--sm"
            >
              Get a Free Quote
            </a>
          </div>
        </div>
      </header>

      <main id="familyguard-top">
        {/* Hero */}
        <section className="familyguard-hero">
          <div className="familyguard-wrap familyguard-hero-grid">
            <div>
              <p className="familyguard-crest">
                <span className="familyguard-crest-shield" aria-hidden="true">
                  <ShieldCheck size={16} />
                </span>
                Est. legacy protection · Advisors since day one
              </p>
              <h1>
                Protection your family will feel, <em>long after the paperwork is filed.</em>
              </h1>
              <p className="familyguard-hero-lede">
                FamilyGuard Life pairs traditional life insurance with a personal advisor who knows your name, your
                goals, and your policy — so the cover you choose today reads exactly the same on the day it matters.
              </p>
              <div className="familyguard-hero-ctas">
                <a
                  href={QUOTE_URL}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="familyguard-btn familyguard-btn--gold"
                >
                  Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a href={PHONE_TEL} className="familyguard-hero-phone">
                  <Phone size={17} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
              <p className="familyguard-hero-note">No obligation. A licensed advisor reviews every quote personally.</p>
            </div>
            <div className="familyguard-arch familyguard-hero-arch">
              <img
                src={IMG.hero}
                alt="Multi-generational family gathered together, smiling"
                width="430"
                height="538"
              />
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="familyguard-strip" aria-label="FamilyGuard Life at a glance">
          <div className="familyguard-wrap familyguard-strip-inner">
            <div className="familyguard-strip-item">
              <strong>1:1</strong>
              <span>Dedicated advisor per household</span>
            </div>
            <div className="familyguard-strip-item">
              <strong>3</strong>
              <span>Plain-language plan families</span>
            </div>
            <div className="familyguard-strip-item">
              <strong>$0</strong>
              <span>Cost to get a personal quote</span>
            </div>
            <div className="familyguard-strip-item">
              <strong>50 states</strong>
              <span>Licensed advisor network</span>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="familyguard-section">
          <div className="familyguard-wrap">
            <div className="familyguard-section-head">
              <p className="familyguard-kicker">Coverage, the traditional way</p>
              <h2>Three plans. No fine-print theatrics.</h2>
              <hr className="familyguard-divider" />
              <p>Every FamilyGuard policy is explained line by line by your advisor before you apply.</p>
            </div>
            <div className="familyguard-plans">
              {PLANS.map((plan) => (
                <article key={plan.title} className="familyguard-plan">
                  <div className="familyguard-plan-media">
                    <img src={plan.img} alt={plan.alt} loading="lazy" width="900" height="600" />
                  </div>
                  <div className="familyguard-plan-body">
                    <h3>{plan.title}</h3>
                    <p>{plan.copy}</p>
                    <ul className="familyguard-plan-list">
                      {plan.points.map((point) => (
                        <li key={point}>
                          <Check size={16} aria-hidden="true" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={QUOTE_URL}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="familyguard-btn familyguard-btn--outline familyguard-btn--sm"
                    >
                      Get a Free Quote
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Sample rates (text-only mock, no inputs) */}
        <section className="familyguard-section familyguard-section--paper">
          <div className="familyguard-wrap familyguard-rates">
            <div className="familyguard-rates-copy">
              <p className="familyguard-kicker">Honest numbers first</p>
              <h2>What families like yours often pay</h2>
              <hr className="familyguard-divider familyguard-divider--left" />
              <p>
                These illustrative starting rates show typical pricing for healthy applicants. Your actual premium
                depends on age, health, coverage amount, and underwriting — your advisor will quote your exact figure
                by phone, with nothing hidden in a footnote.
              </p>
              <a href={PHONE_TEL} className="familyguard-btn familyguard-btn--outline">
                <Phone size={17} aria-hidden="true" /> Call {PHONE_DISPLAY}
              </a>
            </div>
            <div className="familyguard-rate-card" role="figure" aria-label="Illustrative sample monthly rates">
              <h3>Illustrative monthly rates</h3>
              {RATES.map((row) => (
                <div key={row.profile} className="familyguard-rate-row">
                  <span>{row.profile}</span>
                  <strong>{row.rate}</strong>
                </div>
              ))}
              <p className="familyguard-rate-foot">
                Sample figures for illustration only; not an offer of coverage. Final rates are set at underwriting.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="familyguard-section">
          <div className="familyguard-wrap">
            <div className="familyguard-section-head">
              <p className="familyguard-kicker">The FamilyGuard difference</p>
              <h2>Old-fashioned service, deliberately kept</h2>
              <hr className="familyguard-divider" />
            </div>
            <div className="familyguard-values">
              {VALUES.map((value) => (
                <article key={value.title} className="familyguard-value">
                  <span className="familyguard-value-icon" aria-hidden="true">
                    <value.icon size={24} />
                  </span>
                  <h3>{value.title}</h3>
                  <p>{value.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Quote band */}
        <section className="familyguard-band" aria-label="Client story">
          <img src={IMG.band} alt="Parents and children enjoying an afternoon together outdoors" loading="lazy" />
          <div className="familyguard-band-overlay">
            <div className="familyguard-wrap">
              <blockquote>
                “Our advisor called us by name for eleven years. When my husband passed, she called again — and the
                policy did exactly what she said it would.”
                <cite>— Margaret T., Heritage Whole Life policyholder (illustrative account)</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="familyguard-section familyguard-section--paper">
          <div className="familyguard-wrap">
            <div className="familyguard-section-head">
              <p className="familyguard-kicker">Straight answers</p>
              <h2>Questions families ask us</h2>
              <hr className="familyguard-divider" />
            </div>
            <div className="familyguard-faq">
              {FAQS.map((item, i) => (
                <FaqItem
                  key={item.q}
                  item={item}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="familyguard-final">
          <div className="familyguard-wrap">
            <h2>Leave your family certainty, not questions.</h2>
            <p>
              Speak with a licensed FamilyGuard advisor today. No pressure, no scripts — just a clear quote and terms
              you can read over Sunday dinner.
            </p>
            <div className="familyguard-final-ctas">
              <a
                href={QUOTE_URL}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="familyguard-btn familyguard-btn--gold"
              >
                Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a href={PHONE_TEL} className="familyguard-hero-phone">
                <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="familyguard-footer">
        <div className="familyguard-wrap">
          <div className="familyguard-footer-inner">
            <span>© {new Date().getFullYear()} FamilyGuard Life. A fictional brand presented for directory listing purposes.</span>
            <a href={PHONE_TEL}>Advisors: {PHONE_DISPLAY}</a>
          </div>
          <p className="familyguard-footer-disclaimer">
            Independent provider listing. Not financial or insurance advice. Coverage subject to underwriting,
            eligibility, and state availability; premiums and benefits vary by policy. Sample rates are illustrative
            only and do not constitute an offer of insurance.
          </p>
        </div>
      </footer>
    </div>
  );
}
