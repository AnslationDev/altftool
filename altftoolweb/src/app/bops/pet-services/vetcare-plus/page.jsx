"use client";

import { useState } from "react";
import {
  Stethoscope, Syringe, Microscope, HeartPulse, Phone, ShieldCheck, BadgeCheck,
  PawPrint, Star, Clock, MapPin, ChevronDown, ArrowRight, Check, Plus, Menu, X,
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
    text: "Nose-to-tail exams, weight and dental checks, and a written care plan — all from your living room floor.",
    meta: "45–60 min visit",
  },
  {
    icon: Syringe,
    title: "Vaccinations",
    text: "Core and lifestyle vaccines for dogs and cats, with digital records you can share with groomers and boarders.",
    meta: "Same-visit records",
  },
  {
    icon: Microscope,
    title: "In-Home Diagnostics",
    text: "Bloodwork, urinalysis, skin and ear cytology collected at home and processed at our partner lab.",
    meta: "Results in 24–48 hrs",
  },
  {
    icon: HeartPulse,
    title: "Sick Visits",
    text: "Limping, tummy trouble, itching or just not themselves? A licensed vet comes to you — often the same week.",
    meta: "Priority scheduling",
  },
];

const STEPS = [
  {
    title: "Request a quote",
    text: "Tell us your pet, ZIP code and what you need. We reply with clear flat-rate pricing — no surprise line items.",
  },
  {
    title: "Pick a window",
    text: "Choose a 2-hour arrival window that fits your day, including evenings and Saturdays in most areas.",
  },
  {
    title: "Meet your vet at home",
    text: "A licensed veterinarian and assistant arrive with everything needed. Your pet never leaves the couch.",
  },
];

const REVIEWS = [
  {
    quote:
      "My senior lab shakes the whole drive to the clinic. VetCare+ did his annual exam on our porch and he wagged the entire time.",
    name: "Priya S.",
    detail: "Dog parent — annual wellness visit",
  },
  {
    quote:
      "Two cats, zero carriers, zero yowling. The vet was patient, thorough, and emailed the vaccine records before she left the driveway.",
    name: "Marcus T.",
    detail: "Cat parent — vaccines for two",
  },
  {
    quote:
      "They caught an ear infection early during a routine visit and treated it on the spot. The flat quote was exactly what we paid.",
    name: "Elena R.",
    detail: "Dog parent — sick visit",
  },
];

const FAQS = [
  {
    q: "Which areas do you cover?",
    a: "VetCare+ vets serve most neighborhoods within our metro service map, typically within a 25-mile radius of the city center. Request a quote with your ZIP code and we will confirm coverage right away.",
  },
  {
    q: "What does a home visit cost?",
    a: "Visits are flat-rate quoted up front based on your location and the services needed. A typical wellness exam with core vaccines costs about the same as a clinic visit once you factor in your time and travel — with zero stress for your pet.",
  },
  {
    q: "Are your veterinarians licensed?",
    a: "Yes. Every VetCare+ visit is performed by a state-licensed veterinarian, supported by a trained veterinary assistant. We are fully insured and follow Fear-Free handling practices.",
  },
  {
    q: "What if my pet needs X-rays or surgery?",
    a: "We handle checkups, vaccines, diagnostics and most sick visits at home. If your pet needs imaging, surgery or emergency care, your vet will refer you to a trusted local hospital and send your records ahead.",
  },
];

function QuoteButton({ big, ghost, label = "Get a Free Quote" }) {
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
            <a className="vetcare-nav-link" href="#reviews" onClick={() => setMenuOpen(false)}>Reviews</a>
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
                Mobile Veterinary Care
              </span>
              <h1>
                The vet comes to <em>your pet</em> — not the other way around
              </h1>
              <p className="vetcare-hero-sub">
                Licensed veterinarians for checkups, vaccines, diagnostics and sick
                visits, delivered at home. No car rides, no waiting rooms, no
                white-knuckle carriers.
              </p>
              <div className="vetcare-hero-actions">
                <QuoteButton big />
                <a href={PHONE_TEL} className="vetcare-btn vetcare-btn--ghost">
                  <Phone size={18} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
              <ul className="vetcare-hero-points">
                <li><Check size={17} aria-hidden="true" /> Flat-rate quotes before you book</li>
                <li><Check size={17} aria-hidden="true" /> Evening and Saturday windows available</li>
                <li><Check size={17} aria-hidden="true" /> Digital records emailed after every visit</li>
              </ul>
            </div>
            <div className="vetcare-frame vetcare-frame--hero">
              <img
                src={IMG.hero}
                alt="Veterinarian gently examining a calm dog during a home visit"
              />
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="vetcare-trust" aria-label="Trust and credentials">
          <div className="vetcare-wrap vetcare-trust-row">
            <span className="vetcare-trust-item">
              <BadgeCheck size={21} aria-hidden="true" /> Licensed Veterinarians
            </span>
            <span className="vetcare-trust-item">
              <ShieldCheck size={21} aria-hidden="true" /> Fully Insured
            </span>
            <span className="vetcare-trust-item">
              <HeartPulse size={21} aria-hidden="true" /> Fear-Free Handling
            </span>
            <span className="vetcare-trust-item">
              <Clock size={21} aria-hidden="true" /> 2-Hour Arrival Windows
            </span>
          </div>
        </section>

        {/* Services */}
        <section className="vetcare-section" id="services">
          <div className="vetcare-wrap">
            <div className="vetcare-section-head">
              <span className="vetcare-kicker">
                <Stethoscope size={14} aria-hidden="true" />
                What We Do
              </span>
              <h2 className="vetcare-h2">Clinic-grade care, couch-side delivery</h2>
              <p className="vetcare-lead">
                Everything a routine clinic visit covers — performed where your pet
                already feels safe.
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
        <section className="vetcare-section vetcare-section--tint" aria-label="Home visit photos">
          <div className="vetcare-wrap">
            <div className="vetcare-section-head">
              <span className="vetcare-kicker">
                <PawPrint size={14} aria-hidden="true" />
                Calm Patients
              </span>
              <h2 className="vetcare-h2">What a home visit actually looks like</h2>
            </div>
            <div className="vetcare-card-grid">
              <div className="vetcare-frame vetcare-frame--card">
                <img
                  src={IMG.exam}
                  alt="Vet listening to a dog's heartbeat with a stethoscope at home"
                  loading="lazy"
                />
              </div>
              <div className="vetcare-frame vetcare-frame--card">
                <img
                  src={IMG.vaccine}
                  alt="Veterinarian preparing a vaccine while a relaxed pet waits nearby"
                  loading="lazy"
                />
              </div>
              <div className="vetcare-frame vetcare-frame--card">
                <img
                  src={IMG.cat}
                  alt="Cat being gently examined in familiar home surroundings"
                  loading="lazy"
                />
              </div>
              <div className="vetcare-frame vetcare-frame--card">
                <img
                  src={IMG.comfort}
                  alt="Pet relaxing on a blanket at home after a stress-free checkup"
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
                Simple Process
              </span>
              <h2 className="vetcare-h2">Booked in minutes, done in one visit</h2>
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
        <section className="vetcare-section vetcare-section--tint" aria-label="Get a quote">
          <div className="vetcare-wrap">
            <div className="vetcare-midcta">
              <div className="vetcare-midcta-copy">
                <h2>Due for a checkup? Skip the car ride.</h2>
                <p>
                  Get a flat-rate quote for your pet's next wellness exam, vaccines
                  or sick visit. Quotes are free and take under a minute to request.
                </p>
                <QuoteButton big />
                <a href={PHONE_TEL} className="vetcare-midcta-phone">
                  <Phone size={17} aria-hidden="true" />
                  Or call {PHONE_DISPLAY}
                </a>
              </div>
              <div className="vetcare-midcta-media">
                <img
                  src={IMG.midband}
                  alt="Happy dog resting comfortably at home after a vet visit"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="vetcare-section" id="reviews">
          <div className="vetcare-wrap">
            <div className="vetcare-section-head">
              <span className="vetcare-kicker">
                <Star size={14} aria-hidden="true" />
                Pet Parents Say
              </span>
              <h2 className="vetcare-h2">Less stress for them, less hassle for you</h2>
            </div>
            <div className="vetcare-review-grid">
              {REVIEWS.map((r) => (
                <article className="vetcare-review" key={r.name}>
                  <div className="vetcare-stars" aria-label="Rated 5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} size={17} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                  <cite>
                    {r.name}
                    <span>{r.detail}</span>
                  </cite>
                </article>
              ))}
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
            <h2>Your pet's happiest vet visit yet</h2>
            <p>
              Request a free flat-rate quote for a home visit, or call and talk to a
              real person about your pet's needs. No obligation, no waiting room.
            </p>
            <div className="vetcare-final-actions">
              <QuoteButton big />
              <a href={PHONE_TEL} className="vetcare-final-phone">
                <Phone size={19} aria-hidden="true" />
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="vetcare-footer">
        <div className="vetcare-wrap vetcare-footer-inner">
          <p>
            <strong>VetCare+</strong> — Mobile veterinary visits at home. Call{" "}
            <a href={PHONE_TEL} className="vetcare-nav-phone">{PHONE_DISPLAY}</a>
          </p>
          <p className="vetcare-footer-note">Independent service provider listing.</p>
        </div>
      </footer>
    </div>
  );
}
