"use client";

import { useState } from "react";
import {
  Stethoscope, Syringe, Microscope, HeartPulse, Phone, ShieldCheck, BadgeCheck,
  PawPrint, Clock, MapPin, ChevronDown, ArrowRight, Check, Plus, Menu, X,
} from "lucide-react";
import "./vetcare-plus.css";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

const IMG = {
  hero: "https://images.unsplash.com/photo-1644675443401-ea4c14bad0e6?auto=format&fit=crop&w=1600&q=80",
  exam: "https://images.unsplash.com/photo-1771304873117-7509c5521e1a?auto=format&fit=crop&w=900&q=80",
  vaccine: "https://images.unsplash.com/photo-1644675272883-0c4d582528d8?auto=format&fit=crop&w=900&q=80",
  cat: "https://images.unsplash.com/photo-1770836037793-95bdbf190f71?auto=format&fit=crop&w=900&q=80",
  midband: "https://images.unsplash.com/photo-1725419876939-f8f9987cf0d2?auto=format&fit=crop&w=1600&q=80",
  comfort: "https://images.unsplash.com/photo-1770836037816-4445dbd449fd?auto=format&fit=crop&w=900&q=80",
};

const SERVICES = [
  {
    icon: Stethoscope,
    title: "Wellness Checkups",
    text: "Illustrative copy showing where a mobile-vet provider could describe a wellness visit.",
    meta: "Example duration field",
  },
  {
    icon: Syringe,
    title: "Vaccinations",
    text: "Illustrative copy showing where a licensed provider could explain vaccine and record policies.",
    meta: "Example record field",
  },
  {
    icon: Microscope,
    title: "In-Home Diagnostics",
    text: "Illustrative copy showing where a provider could describe available tests and laboratory arrangements.",
    meta: "Example result-time field",
  },
  {
    icon: HeartPulse,
    title: "Sick Visits",
    text: "Illustrative copy showing where a provider could define appointment scope and urgent-care exclusions.",
    meta: "Availability placeholder",
  },
];

const STEPS = [
  {
    title: "Example enquiry step",
    text: "This demo shows where an enquiry step could appear; it does not collect pet, location, or contact details.",
  },
  {
    title: "Pick a window",
    text: "A real provider could publish verified scheduling and arrival-window policies here.",
  },
  {
    title: "Meet your vet at home",
    text: "This illustrative step does not arrange a visit or represent a licensed veterinary team.",
  },
];

const FAQS = [
  {
    q: "Which areas do you cover?",
    a: "This fictional page has no service area. Contact a licensed local veterinary practice directly to confirm availability and travel policies.",
  },
  {
    q: "What does a home visit cost?",
    a: "This demo does not provide pricing. Ask a licensed practice for a written estimate covering the visit, tests, medicines, travel, and follow-up care.",
  },
  {
    q: "Are your veterinarians licensed?",
    a: "VetCare+ is fictional and has no clinicians or credentials. Verify a real professional's current licence and practice details with the appropriate veterinary authority.",
  },
  {
    q: "What if my pet needs X-rays or surgery?",
    a: "This page does not provide triage, referrals, diagnostics, or emergency care. Contact a licensed veterinarian or emergency animal hospital for medical advice and treatment.",
  },
];

function QuoteButton({ big, ghost, label = "Preview Quote CTA" }) {
  const cls = [
    "vetcare-btn",
    big ? "vetcare-btn--big" : "",
    ghost ? "vetcare-btn--ghost" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={cls}>
      {label}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

export default function VetCarePlusPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="vetcare-page">
      {/* Navigation */}
      <header className="vetcare-nav">
        <div className="vetcare-nav-inner">
          <a href="#vetcare-top" className="vetcare-logo">
            <span className="vetcare-logo-mark" aria-hidden="true">
              <Plus size={20} strokeWidth={3} />
            </span>
            VetCare+
          </a>
          <nav
            className={`vetcare-nav-links${menuOpen ? " vetcare-nav-links--open" : ""}`}
            aria-label="Main navigation"
          >
            <a className="vetcare-nav-link" href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a className="vetcare-nav-link" href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a className="vetcare-nav-link" href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          </nav>
          <div className="vetcare-nav-cta">
            <a href={PHONE_TEL} className="vetcare-nav-phone">
              <Phone size={17} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <QuoteButton />
            <button
              type="button"
              className="vetcare-menu-toggle"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <main id="vetcare-top">
        {/* Hero */}
        <section className="vetcare-hero">
          <div className="vetcare-wrap vetcare-hero-grid">
            <div className="vetcare-hero-copy">
              <span className="vetcare-kicker">
                <PawPrint size={14} aria-hidden="true" />
                Fictional mobile-vet layout
              </span>
              <h1>
                The vet comes to <em>your pet</em> — not the other way around
              </h1>
              <p className="vetcare-hero-sub">
                A design demonstration showing how a verified mobile veterinary
                provider could organize service, scheduling, and care information.
              </p>
              <div className="vetcare-hero-actions">
                <QuoteButton big />
                <a href={PHONE_TEL} className="vetcare-btn vetcare-btn--ghost">
                  <Phone size={18} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
              <ul className="vetcare-hero-points">
                <li><Check size={17} aria-hidden="true" /> Example pricing-policy placement</li>
                <li><Check size={17} aria-hidden="true" /> Example scheduling-policy placement</li>
                <li><Check size={17} aria-hidden="true" /> Example records-policy placement</li>
              </ul>
            </div>
            <div className="vetcare-frame vetcare-frame--hero">
              <img
                src={IMG.hero}
                alt="Licensed stock photo illustrating a veterinarian examining a dog"
              />
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="vetcare-trust" aria-label="Trust and credentials">
          <div className="vetcare-wrap vetcare-trust-row">
            <span className="vetcare-trust-item">
              <BadgeCheck size={21} aria-hidden="true" /> Credential Placeholder
            </span>
            <span className="vetcare-trust-item">
              <ShieldCheck size={21} aria-hidden="true" /> Insurance Placeholder
            </span>
            <span className="vetcare-trust-item">
              <HeartPulse size={21} aria-hidden="true" /> Handling-Policy Example
            </span>
            <span className="vetcare-trust-item">
              <Clock size={21} aria-hidden="true" /> Scheduling Example
            </span>
          </div>
        </section>

        {/* Services */}
        <section className="vetcare-section" id="services">
          <div className="vetcare-wrap">
            <div className="vetcare-section-head">
              <span className="vetcare-kicker">
                <Stethoscope size={14} aria-hidden="true" />
                Example Service Cards
              </span>
              <h2 className="vetcare-h2">Preview a mobile-vet service menu</h2>
              <p className="vetcare-lead">
                These cards demonstrate content structure only; no veterinary service,
                diagnosis, booking, or medical advice is provided.
              </p>
            </div>
            <div className="vetcare-card-grid">
              {SERVICES.map(({ icon: Icon, title, text, meta }) => (
                <article className="vetcare-card" key={title}>
                  <span className="vetcare-card-icon" aria-hidden="true">
                    <Icon size={24} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="vetcare-card-meta">
                    <Clock size={14} aria-hidden="true" /> {meta}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Photo trio */}
        <section className="vetcare-section vetcare-section--tint" aria-label="Illustrative stock photos">
          <div className="vetcare-wrap">
            <div className="vetcare-section-head">
              <span className="vetcare-kicker">
                <PawPrint size={14} aria-hidden="true" />
                Illustrative Gallery
              </span>
              <h2 className="vetcare-h2">Licensed stock imagery for the layout</h2>
            </div>
            <div className="vetcare-card-grid">
              <div className="vetcare-frame vetcare-frame--card">
                <img
                  src={IMG.exam}
                  alt="Licensed stock photo illustrating a veterinary examination"
                  loading="lazy"
                />
              </div>
              <div className="vetcare-frame vetcare-frame--card">
                <img
                  src={IMG.vaccine}
                  alt="Licensed stock photo illustrating veterinary supplies near a pet"
                  loading="lazy"
                />
              </div>
              <div className="vetcare-frame vetcare-frame--card">
                <img
                  src={IMG.cat}
                  alt="Licensed stock photo illustrating a cat examination"
                  loading="lazy"
                />
              </div>
              <div className="vetcare-frame vetcare-frame--card">
                <img
                  src={IMG.comfort}
                  alt="Licensed stock photo of a pet relaxing on a blanket"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="vetcare-section" id="how">
          <div className="vetcare-wrap">
            <div className="vetcare-section-head">
              <span className="vetcare-kicker">
                <MapPin size={14} aria-hidden="true" />
                Example Workflow
              </span>
              <h2 className="vetcare-h2">Preview a three-step visit flow</h2>
            </div>
            <div className="vetcare-steps">
              {STEPS.map((step, i) => (
                <article className="vetcare-step" key={step.title}>
                  <span className="vetcare-step-num" aria-hidden="true">{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-page CTA band */}
        <section className="vetcare-section vetcare-section--tint" aria-label="Preview quote call to action">
          <div className="vetcare-wrap">
            <div className="vetcare-midcta">
              <div className="vetcare-midcta-copy">
                <h2>Preview a mobile-vet call to action</h2>
                <p>
                  This disabled component does not collect pet details, request a quote,
                  contact a clinic, or promise availability.
                </p>
                <QuoteButton big />
                <a href={PHONE_TEL} className="vetcare-midcta-phone">
                  <Phone size={17} aria-hidden="true" />
                  Demo Call · {PHONE_DISPLAY}
                </a>
              </div>
              <div className="vetcare-midcta-media">
                <img
                  src={IMG.midband}
                  alt="Licensed stock photo of a dog resting comfortably at home"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="vetcare-section vetcare-section--tint" id="faq">
          <div className="vetcare-wrap">
            <div className="vetcare-section-head">
              <span className="vetcare-kicker">
                <ShieldCheck size={14} aria-hidden="true" />
                Good To Know
              </span>
              <h2 className="vetcare-h2">Frequently asked questions</h2>
            </div>
            <div className="vetcare-faq-list">
              {FAQS.map((f, i) => (
                <div className="vetcare-faq-item" key={f.q}>
                  <h3>
                    <button
                      type="button"
                      className="vetcare-faq-q"
                      aria-expanded={openFaq === i}
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    >
                      {f.q}
                      <ChevronDown size={20} aria-hidden="true" />
                    </button>
                  </h3>
                  {openFaq === i && (
                    <div className="vetcare-faq-a">
                      <p>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA band */}
        <section className="vetcare-final" aria-label="Final call to action">
          <div className="vetcare-wrap">
            <h2>Preview the final call-to-action band</h2>
            <p>
              VetCare+ is fictional. The disabled controls do not request a visit,
              contact a clinician, or provide veterinary advice.
            </p>
            <div className="vetcare-final-actions">
              <QuoteButton big />
              <a href={PHONE_TEL} className="vetcare-final-phone">
                <Phone size={19} aria-hidden="true" />
                Demo Call · {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="vetcare-footer">
        <div className="vetcare-wrap vetcare-footer-inner">
          <p>
            <strong>VetCare+</strong> — Fictional mobile-vet design preview. Demo control:{" "}
            <a href={PHONE_TEL} className="vetcare-nav-phone">{PHONE_DISPLAY}</a>
          </p>
          <p className="vetcare-footer-note">Design demonstration, not a provider listing.</p>
        </div>
      </footer>
    </div>
  );
}
