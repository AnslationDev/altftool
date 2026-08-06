"use client";

import { useState } from "react";
import {
  Sun,
  Phone,
  ArrowRight,
  Check,
  Video,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  HeartPulse,
  Wallet,
  ChevronDown,
  Star,
} from "lucide-react";
import DemoBrandNotice from "../_components/DemoBrandNotice";
import "./medibright-health.css";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

const PLANS = [
  {
    name: "BrightStart",
    tag: "Solo coverage that keeps it simple",
    price: "$0",
    priceNote: "virtual visits on every plan*",
    featured: false,
    perks: [
      "Unlimited $0 virtual urgent-care visits",
      "Simple in-network doctor search",
      "Preventive checkups covered in network",
      "Plain-English benefits summary",
    ],
  },
  {
    name: "BrightFamily",
    tag: "Room for everyone under one plan",
    price: "$0",
    priceNote: "virtual pediatric visits included*",
    featured: true,
    perks: [
      "Everything in BrightStart, for the whole household",
      "24/7 nurse chat for late-night worries",
      "Kid-friendly virtual pediatric care",
      "One shared family deductible option",
    ],
  },
  {
    name: "BrightTotal",
    tag: "Fuller coverage, still zero jargon",
    price: "$0",
    priceNote: "virtual therapy intro sessions*",
    featured: false,
    perks: [
      "Everything in BrightFamily",
      "Virtual mental-health visit options",
      "Lower out-of-pocket maximum options",
      "Care-team help comparing hospital costs",
    ],
  },
];

const STEPS = [
  {
    title: "Tell us the basics",
    body: "Share your ZIP code and household size with a licensed agent — that is all it takes to start comparing options.",
  },
  {
    title: "See clear side-by-side pricing",
    body: "We show monthly premium, deductible, and copays in plain language, so you can compare plans without a glossary.",
  },
  {
    title: "Pick your plan, meet your doctor",
    body: "Enroll with agent help, then book your first $0 virtual visit — often available the same week your plan starts.",
  },
];

const GALLERY = [
  {
    img: "https://images.unsplash.com/photo-1758691463198-dc663b8a64e4?auto=format&fit=crop&w=900&q=80",
    alt: "Clinician greeting a patient with a warm smile during a consultation",
    title: "$0 virtual visits, real doctors",
    body: "Talk to a licensed clinician from your couch. Virtual urgent-care visits are $0 on every MediBright plan.",
  },
  {
    img: "https://images.unsplash.com/photo-1758691461935-202e2ef6b69f?auto=format&fit=crop&w=900&q=80",
    alt: "Doctor reviewing a treatment plan together with a smiling patient",
    title: "Networks without the maze",
    body: "One friendly directory shows who is in network near you — no surprise out-of-network letters later.",
  },
  {
    img: "https://images.unsplash.com/photo-1758691462878-6edc3d3da1be?auto=format&fit=crop&w=900&q=80",
    alt: "Care team member explaining coverage details to a relaxed patient",
    title: "Pricing you can actually read",
    body: "Every plan comes with a one-page summary: premium, deductible, copays. If it is not clear, we rewrite it.",
  },
];

const QUOTES = [
  {
    text: "The quote call took eleven minutes and nobody used the word 'coinsurance' without explaining it. Refreshing.",
    name: "Priya S., Austin TX",
  },
  {
    text: "My daughter saw a virtual pediatrician at 9pm on a Sunday. $0. I keep telling everyone about it.",
    name: "Marcus D., Columbus OH",
  },
  {
    text: "I finally understand what my deductible actually does. The one-page summary should be an industry law.",
    name: "Elena R., Tampa FL",
  },
];

const FAQS = [
  {
    q: "Are virtual visits really $0?",
    a: "Yes — virtual urgent-care visits carry a $0 copay on every MediBright plan tier. Specialist, in-person, and prescription costs vary by plan and are shown clearly before you enroll.",
  },
  {
    q: "Can I keep my current doctor?",
    a: "Often, yes. During your free quote we check your doctors against the plan network before you commit, so there are no surprises after enrollment.",
  },
  {
    q: "How much will a plan cost me?",
    a: "Premiums depend on your age, location, household size, and the tier you choose. A licensed agent can give you an exact monthly price in one short call — no obligation to enroll.",
  },
  {
    q: "Is my acceptance guaranteed?",
    a: "No plan can promise that. Eligibility depends on your state, enrollment window, and plan availability. Our agents will tell you honestly what you qualify for and when you can enroll.",
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="medibright-faq-item">
      <button
        type="button"
        className="medibright-faq-q"
        aria-expanded={open}
        onClick={onToggle}
      >
        {item.q}
        <ChevronDown size={20} aria-hidden="true" />
      </button>
      {open && <div className="medibright-faq-a">{item.a}</div>}
    </div>
  );
}

export default function MediBrightHealthPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="medibright-page">
      {/* Nav */}
      <header className="medibright-nav">
        <div className="medibright-nav-inner">
          <a href="#medibright-top" className="medibright-logo">
            <span className="medibright-logo-mark" aria-hidden="true">
              <Sun size={22} />
            </span>
            Medi<em>Bright</em>
          </a>
          <nav aria-label="Main">
            <ul className="medibright-nav-links">
              <li><a href="#medibright-plans">Plans</a></li>
              <li><a href="#medibright-how">How it works</a></li>
              <li><a href="#medibright-care">Why MediBright</a></li>
              <li><a href="#medibright-faq">FAQ</a></li>
            </ul>
          </nav>
          <div className="medibright-nav-cta">
            <a href={PHONE_TEL} className="medibright-phone-link">
              <Phone size={17} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <a
              href={QUOTE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="medibright-btn medibright-btn-mint"
            >
              Get a Free Quote
            </a>
          </div>
        </div>
      </header>

      <main id="medibright-top">
        <DemoBrandNotice brand="MediBright Health" />

        {/* Hero */}
        <section className="medibright-hero">
          <div className="medibright-wrap medibright-hero-grid">
            <div className="medibright-hero-copy">
              <span className="medibright-kicker">
                <Sparkles size={15} aria-hidden="true" />
                Health plans made friendly
              </span>
              <h1>
                Health coverage that <span>smiles back</span>.
              </h1>
              <p className="medibright-hero-sub">
                MediBright pairs $0 virtual visits with plain-English pricing
                and simple networks — so choosing a health plan finally feels
                like a good day.
              </p>
              <div className="medibright-pill-row">
                <span className="medibright-pill">
                  <Video size={15} aria-hidden="true" /> $0 virtual visits
                </span>
                <span className="medibright-pill">
                  <Wallet size={15} aria-hidden="true" /> Clear monthly pricing
                </span>
                <span className="medibright-pill">
                  <Stethoscope size={15} aria-hidden="true" /> Simple networks
                </span>
              </div>
              <div className="medibright-hero-actions">
                <a
                  href={QUOTE_URL}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="medibright-btn medibright-btn-coral"
                >
                  Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a href={PHONE_TEL} className="medibright-btn medibright-btn-ghost">
                  <Phone size={17} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
              <p className="medibright-hero-note">
                Free, no-obligation quotes from licensed agents. Availability
                and pricing vary by state and enrollment period.
              </p>
            </div>
            <div className="medibright-hero-figure">
              <div className="medibright-photo-frame">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80"
                  alt="Smiling doctor in a bright clinic ready to welcome a patient"
                />
              </div>
              <div className="medibright-float-badge">
                <span className="medibright-float-badge-icon" aria-hidden="true">
                  <Video size={22} />
                </span>
                <div>
                  <strong>$0 virtual visit</strong>
                  <span>on every plan tier</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="medibright-section" id="medibright-plans">
          <div className="medibright-wrap">
            <div className="medibright-section-head">
              <span className="medibright-kicker">
                <HeartPulse size={15} aria-hidden="true" /> Three cheerful tiers
              </span>
              <h2>Pick the plan that fits your life</h2>
              <p>
                Every tier includes $0 virtual urgent care. Exact premiums
                depend on your age, ZIP code, and household — your agent shows
                real numbers before you decide.
              </p>
            </div>
            <div className="medibright-plan-grid">
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
                  className={
                    plan.featured
                      ? "medibright-plan-card medibright-plan-card-featured"
                      : "medibright-plan-card"
                  }
                >
                  {plan.featured && (
                    <span className="medibright-plan-flag">Most popular</span>
                  )}
                  <h3>{plan.name}</h3>
                  <p className="medibright-plan-tag">{plan.tag}</p>
                  <div className="medibright-plan-price">
                    <strong>{plan.price}</strong>{" "}
                    <span>{plan.priceNote}</span>
                  </div>
                  <ul className="medibright-plan-list">
                    {plan.perks.map((perk) => (
                      <li key={perk}>
                        <Check size={17} aria-hidden="true" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={QUOTE_URL}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="medibright-btn medibright-btn-mint"
                  >
                    Get a Free Quote
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="medibright-section medibright-section-mint" id="medibright-how">
          <div className="medibright-wrap">
            <div className="medibright-section-head">
              <span className="medibright-kicker">
                <ShieldCheck size={15} aria-hidden="true" /> No-pressure process
              </span>
              <h2>From quote to first visit in three easy steps</h2>
              <p>No paperwork marathon. No jargon. Just a short, friendly call.</p>
            </div>
            <div className="medibright-steps">
              {STEPS.map((step, i) => (
                <article className="medibright-step" key={step.title}>
                  <span className="medibright-step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-page CTA band */}
        <section className="medibright-section">
          <div className="medibright-wrap">
            <div className="medibright-band">
              <div>
                <h2>Curious what your price would be?</h2>
                <p>
                  A licensed agent can quote your exact monthly premium in one
                  short call — free, and with zero obligation to enroll.
                </p>
              </div>
              <div className="medibright-band-actions">
                <a
                  href={QUOTE_URL}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="medibright-btn medibright-btn-coral"
                >
                  Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a href={PHONE_TEL} className="medibright-btn medibright-btn-ghost">
                  <Phone size={17} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery / why MediBright */}
        <section className="medibright-section" id="medibright-care">
          <div className="medibright-wrap">
            <div className="medibright-section-head">
              <span className="medibright-kicker">
                <Sun size={15} aria-hidden="true" /> Care that feels good
              </span>
              <h2>Why members smile about MediBright</h2>
              <p>
                Friendly clinicians, honest pricing, and a network you can
                navigate without a decoder ring.
              </p>
            </div>
            <div className="medibright-gallery">
              {GALLERY.map((card) => (
                <article className="medibright-gallery-card" key={card.title}>
                  <div className="medibright-gallery-media">
                    <img src={card.img} alt={card.alt} loading="lazy" />
                  </div>
                  <div className="medibright-gallery-body">
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="medibright-section medibright-section-mint">
          <div className="medibright-wrap">
            <div className="medibright-section-head">
              <span className="medibright-kicker">
                <Star size={15} aria-hidden="true" /> Member stories
              </span>
              <h2>Real people, brighter days</h2>
              <p>Illustrative member experiences. Individual results vary.</p>
            </div>
            <div className="medibright-quote-grid">
              {QUOTES.map((q) => (
                <figure className="medibright-quote-card" key={q.name}>
                  <div className="medibright-stars" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote>&ldquo;{q.text}&rdquo;</blockquote>
                  <figcaption>{q.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Wide photo interlude */}
        <section className="medibright-section">
          <div className="medibright-wrap">
            <div
              className="medibright-photo-frame"
              style={{ aspectRatio: "21 / 9" }}
            >
              <img
                src="https://images.unsplash.com/photo-1631217871099-88310a909a32?auto=format&fit=crop&w=1600&q=80"
                alt="Friendly medical professional in a sunlit modern clinic hallway"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="medibright-section" id="medibright-faq">
          <div className="medibright-wrap">
            <div className="medibright-section-head">
              <span className="medibright-kicker">
                <Sparkles size={15} aria-hidden="true" /> Good questions
              </span>
              <h2>Answers without the asterisk maze</h2>
              <p>Short, honest answers — the same ones our agents give on the phone.</p>
            </div>
            <div className="medibright-faq">
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

        {/* Final CTA band */}
        <section className="medibright-section">
          <div className="medibright-wrap">
            <div className="medibright-band medibright-band-coral">
              <div>
                <h2>Ready for a health plan that smiles back?</h2>
                <p>
                  Compare MediBright tiers with a licensed agent today. Free
                  quotes, clear pricing, and $0 virtual visits on every plan.
                </p>
              </div>
              <div className="medibright-band-actions">
                <a
                  href={QUOTE_URL}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="medibright-btn medibright-btn-mint"
                >
                  Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a href={PHONE_TEL} className="medibright-btn medibright-btn-ghost">
                  <Phone size={17} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="medibright-footer">
        <div className="medibright-wrap">
          <div className="medibright-footer-grid">
            <a href="#medibright-top" className="medibright-logo">
              <span className="medibright-logo-mark" aria-hidden="true">
                <Sun size={22} />
              </span>
              Medi<em>Bright</em>
            </a>
            <ul className="medibright-footer-links">
              <li><a href="#medibright-plans">Plans</a></li>
              <li><a href="#medibright-how">How it works</a></li>
              <li><a href="#medibright-care">Why MediBright</a></li>
              <li><a href="#medibright-faq">FAQ</a></li>
              <li>
                <a href={PHONE_TEL} className="medibright-footer-phone">
                  {PHONE_DISPLAY}
                </a>
              </li>
            </ul>
          </div>
          <p className="medibright-fineprint">
            MediBright Health is a fictional brand presented for directory
            demonstration purposes. *$0 virtual visit benefit applies to
            in-network virtual urgent-care services on eligible plans; other
            services may involve copays, deductibles, or coinsurance. Plan
            availability, benefits, and premiums vary by state, age, household,
            and enrollment period, and enrollment is subject to eligibility —
            no outcome is guaranteed. Quotes are provided by licensed agents
            free of charge and carry no obligation. Independent provider
            listing. Not financial or insurance advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
