"use client";

import "./goldenyears-living.css";
import { useState } from "react";
import {
  Phone,
  Heart,
  MapPin,
  Home,
  Users,
  Utensils,
  Flower2,
  Star,
  ArrowRight,
  Check,
  ChevronDown,
  Sun,
} from "lucide-react";

const QUOTE_URL = "#demo-only";
const PHONE_DISPLAY = "Demo only";
const PHONE_TEL = "#demo-only";

const STEPS = [
  {
    icon: Heart,
    title: "Share what matters",
    text: "Tell an advisor about daily routines, care preferences and the budget that feels comfortable — a friendly conversation, never a questionnaire.",
  },
  {
    icon: MapPin,
    title: "See matched communities",
    text: "We hand-pick nearby residences that fit — from garden cottages to vibrant social communities — and explain pricing in plain language.",
  },
  {
    icon: Sun,
    title: "Tour at your own pace",
    text: "Visit together, stay for lunch, meet the residents. There is never pressure to decide — the right home reveals itself.",
  },
];

const FEATURES = [
  {
    icon: Utensils,
    img: "https://images.unsplash.com/photo-1703627775484-95289b546d1b?auto=format&fit=crop&w=900&q=80",
    alt: "Residents sharing a warm meal together at a beautifully set dining table",
    title: "Dining that feels like home",
    text: "Chef-prepared meals served at a real table, with familiar favourites and room for every dietary preference.",
  },
  {
    icon: Flower2,
    img: "https://images.unsplash.com/photo-1588680281884-5e694f9e9e52?auto=format&fit=crop&w=900&q=80",
    alt: "A senior resident tending flowers in a sunlit community garden",
    title: "Gardens and green space",
    text: "Walking paths, raised planting beds and shaded patios — because a good afternoon often starts outdoors.",
  },
  {
    icon: Users,
    img: "https://images.unsplash.com/photo-1704475686860-ab71b444df6b?auto=format&fit=crop&w=900&q=80",
    alt: "Friends enjoying conversation and activities in a bright community lounge",
    title: "Genuine companionship",
    text: "Book clubs, music evenings, card tables and quiet corners — daily life shaped around real friendship.",
  },
];

const FAQS = [
  {
    q: "How much does assisted living usually cost?",
    a: "Pricing varies by neighbourhood, apartment size and the level of daily support included. Your advisor walks through each community's fee structure line by line, so there are no surprises — and helps you compare options within your budget.",
  },
  {
    q: "Is the consultation really free?",
    a: "Yes. Our advisory service is free for families. We are compensated by participating communities, and we will always tell you clearly which communities are partners.",
  },
  {
    q: "How quickly can we tour a community?",
    a: "Often within a few days. Many families call in the morning and have a tour arranged for the same week — including a shared lunch so you can experience daily life first-hand.",
  },
  {
    q: "What if my parent's needs change over time?",
    a: "Many communities offer flexible levels of daily support, and your advisor will point out which ones can adapt as needs evolve, so a move can be a lasting one.",
  },
];

function CtaButtons({ variant }) {
  return (
    <div className={`goldenyears-cta-group goldenyears-cta-group--${variant}`}>
      <a
        className="goldenyears-btn goldenyears-btn--primary"
        href={QUOTE_URL}
        target="_blank"
        rel="sponsored noopener noreferrer"
      >
        Get a Free Consultation
        <ArrowRight className="goldenyears-btn-icon" aria-hidden="true" />
      </a>
      <a className="goldenyears-btn goldenyears-btn--phone" href={PHONE_TEL}>
        <Phone className="goldenyears-btn-icon" aria-hidden="true" />
        {PHONE_DISPLAY}
      </a>
    </div>
  );
}

export default function GoldenYearsLivingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="goldenyears-page">
      {/* ── Navigation ─────────────────────────────── */}
      <header className="goldenyears-nav">
        <div className="goldenyears-nav-inner">
          <span className="goldenyears-brand">
            <Home className="goldenyears-brand-icon" aria-hidden="true" />
            GoldenYears <em>Living</em>
          </span>
          <div className="goldenyears-nav-actions">
            <a
              className="goldenyears-nav-phone"
              href={PHONE_TEL}
              aria-label={`Call GoldenYears Living at ${PHONE_DISPLAY}`}
            >
              <Phone className="goldenyears-nav-phone-icon" aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              className="goldenyears-btn goldenyears-btn--primary goldenyears-btn--nav"
              href={QUOTE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
            >
              Get a Free Consultation
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────── */}
        <section className="goldenyears-hero">
          <div className="goldenyears-hero-copy">
            <p className="goldenyears-eyebrow">Assisted-living community finder</p>
            <h1 className="goldenyears-h1">
              A warm new chapter, in a community that feels like{" "}
              <span className="goldenyears-accent">home</span>
            </h1>
            <p className="goldenyears-lede">
              Our local advisors help your family tour welcoming assisted-living
              communities matched to your budget, care preferences and favourite
              neighbourhoods — thoughtfully, and entirely at your pace.
            </p>
            <CtaButtons variant="hero" />
            <ul className="goldenyears-hero-points">
              <li>
                <Check aria-hidden="true" /> Free, unhurried guidance for families
              </li>
              <li>
                <Check aria-hidden="true" /> Local advisors who know each community
              </li>
              <li>
                <Check aria-hidden="true" /> Tours arranged around your schedule
              </li>
            </ul>
          </div>
          <figure className="goldenyears-hero-frame">
            <img
              src="https://images.unsplash.com/photo-1504004030892-d06adf9ffbcf?auto=format&fit=crop&w=1600&q=80"
              alt="An older couple sitting close together on a bench, enjoying a golden evening view"
              className="goldenyears-hero-img"
            />
            <figcaption className="goldenyears-hero-badge">
              <Star className="goldenyears-badge-star" aria-hidden="true" />
              Trusted by families across 200+ neighbourhoods
            </figcaption>
          </figure>
        </section>

        {/* ── Three-step band ──────────────────────── */}
        <section className="goldenyears-steps" aria-labelledby="goldenyears-steps-title">
          <h2 id="goldenyears-steps-title" className="goldenyears-h2">
            Find your community in three gentle steps
          </h2>
          <p className="goldenyears-section-lede">
            No paperwork to start, no obligation ever — just a conversation with
            someone who knows senior living well.
          </p>
          <ol className="goldenyears-steps-grid">
            {STEPS.map((step, i) => (
              <li className="goldenyears-step" key={step.title}>
                <span className="goldenyears-step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <step.icon className="goldenyears-step-icon" aria-hidden="true" />
                <h3 className="goldenyears-h3">{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Community life cards ─────────────────── */}
        <section className="goldenyears-life" aria-labelledby="goldenyears-life-title">
          <h2 id="goldenyears-life-title" className="goldenyears-h2">
            Daily life, beautifully lived
          </h2>
          <p className="goldenyears-section-lede">
            The communities we recommend are chosen for warmth first — places
            where mornings are easy and afternoons are full.
          </p>
          <div className="goldenyears-life-grid">
            {FEATURES.map((f) => (
              <article className="goldenyears-card" key={f.title}>
                <div className="goldenyears-card-frame">
                  <img src={f.img} alt={f.alt} loading="lazy" className="goldenyears-card-img" />
                </div>
                <div className="goldenyears-card-body">
                  <f.icon className="goldenyears-card-icon" aria-hidden="true" />
                  <h3 className="goldenyears-h3">{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Mid-page CTA ─────────────────────────── */}
        <section className="goldenyears-midcta">
          <div className="goldenyears-midcta-inner">
            <h2 className="goldenyears-h2 goldenyears-h2--light">
              Prefer to talk it through with a person?
            </h2>
            <p className="goldenyears-midcta-text">
              Advisors answer seven days a week. Call, and a real person picks
              up — happy to listen for as long as you need.
            </p>
            <CtaButtons variant="mid" />
          </div>
        </section>

        {/* ── Testimonial ──────────────────────────── */}
        <section className="goldenyears-story" aria-labelledby="goldenyears-story-title">
          <figure className="goldenyears-story-frame">
            <img
              src="https://images.unsplash.com/photo-1668701065787-2605db5e4938?auto=format&fit=crop&w=900&q=80"
              alt="A mother and her adult daughter smiling together in the afternoon light"
              loading="lazy"
              className="goldenyears-story-img"
            />
          </figure>
          <div className="goldenyears-story-copy">
            <h2 id="goldenyears-story-title" className="goldenyears-h2">
              “Mum calls it her home now — and means it.”
            </h2>
            <blockquote className="goldenyears-quote">
              <p>
                After Dad passed, the big house felt too quiet for Mum. Our
                advisor listened more than she talked, then showed us three
                communities near my sister. The second one had a garden club and
                a pianist on Fridays — Mum lit up on the tour. Six months on,
                she has a fuller social calendar than I do.
              </p>
              <footer className="goldenyears-quote-source">
                <span className="goldenyears-quote-name">Priya S.</span>
                <span className="goldenyears-quote-role">
                  Daughter of a GoldenYears resident
                </span>
              </footer>
            </blockquote>
            <div className="goldenyears-stars" role="img" aria-label="Rated five out of five stars">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} className="goldenyears-star" aria-hidden="true" />
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────── */}
        <section className="goldenyears-faq" aria-labelledby="goldenyears-faq-title">
          <h2 id="goldenyears-faq-title" className="goldenyears-h2">
            Questions families often ask
          </h2>
          <div className="goldenyears-faq-list">
            {FAQS.map((item, i) => (
              <div className="goldenyears-faq-item" key={item.q}>
                <button
                  type="button"
                  className="goldenyears-faq-toggle"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`goldenyears-faq-chevron${openFaq === i ? " goldenyears-faq-chevron--open" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {openFaq === i && <p className="goldenyears-faq-answer">{item.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA band ───────────────────────── */}
        <section className="goldenyears-final">
          <h2 className="goldenyears-h2 goldenyears-h2--light">
            The right community is closer than you think
          </h2>
          <p className="goldenyears-final-text">
            One conversation is all it takes to begin. Free for families, always
            unhurried, never any obligation.
          </p>
          <CtaButtons variant="final" />
          <p className="goldenyears-final-phone-note">
            Or call now — advisors are available seven days a week:{" "}
            <a href={PHONE_TEL} className="goldenyears-final-phone">
              {PHONE_DISPLAY}
            </a>
          </p>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="goldenyears-footer">
        <div className="goldenyears-footer-inner">
          <span className="goldenyears-brand goldenyears-brand--footer">
            <Home className="goldenyears-brand-icon" aria-hidden="true" />
            GoldenYears <em>Living</em>
          </span>
          <p className="goldenyears-footer-disclaimer">
            Independent provider listing. Not medical advice.
          </p>
          <p className="goldenyears-footer-fine">
            GoldenYears Living is a fictional demonstration brand. Community
            availability, amenities and pricing vary by location.
          </p>
          <a href={PHONE_TEL} className="goldenyears-footer-phone">
            <Phone aria-hidden="true" /> {PHONE_DISPLAY}
          </a>
        </div>
      </footer>
    </div>
  );
}
