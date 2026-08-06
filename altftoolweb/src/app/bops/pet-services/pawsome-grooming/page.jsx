"use client";

import { useState } from "react";
import {
  PawPrint,
  Phone,
  Sparkles,
  Scissors,
  Bath,
  Wind,
  Check,
  Star,
  Menu,
  X,
  Truck,
  ArrowRight,
} from "lucide-react";
import "./pawsome-grooming.css";

const QUOTE_URL = "#demo-only";
const PHONE_HREF = "#demo-only";
const PHONE_LABEL = "Demo only";

function QuoteButton({ className = "pawsome-btn pawsome-btn-pink", children }) {
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={className}>
      {children || "Get a Free Quote"}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

function PawDivider() {
  return (
    <div className="pawsome-divider" aria-hidden="true">
      <PawPrint size={26} />
      <PawPrint size={20} />
      <PawPrint size={30} />
      <PawPrint size={20} />
      <PawPrint size={26} />
    </div>
  );
}

export default function PawsomeGroomingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const services = [
    {
      icon: <Bath size={20} aria-hidden="true" />,
      title: "Bubble Baths",
      text: "Warm water, gentle hypoallergenic shampoo and a fluffy blow-dry — all inside our cozy van.",
      tag: "Most loved",
      img: "https://images.unsplash.com/photo-1597603413826-cd1c06b05222?auto=format&fit=crop&w=900&q=80",
      alt: "Freshly bathed dog wrapped in a towel after grooming",
    },
    {
      icon: <Scissors size={20} aria-hidden="true" />,
      title: "Haircuts & Styling",
      text: "Breed-standard trims or fully custom looks, finished with a bandana and a happy-tail photo.",
      tag: "All breeds",
      img: "https://images.unsplash.com/photo-1597852075145-6e31afc637a7?auto=format&fit=crop&w=900&q=80",
      alt: "Small dog getting a careful haircut from a groomer",
    },
    {
      icon: <Sparkles size={20} aria-hidden="true" />,
      title: "Nail Trims & Paws",
      text: "Stress-free nail trims, filing and paw-pad tidying so every step home is click-free.",
      tag: "5-minute add-on",
      img: "https://images.unsplash.com/photo-1778072831257-fa0338457329?auto=format&fit=crop&w=900&q=80",
      alt: "Groomer gently holding a dog's paw for a nail trim",
    },
    {
      icon: <Wind size={20} aria-hidden="true" />,
      title: "De-shedding Spa",
      text: "Undercoat rake, conditioning mask and high-velocity dry that keeps fur off your sofa for weeks.",
      tag: "Shed less",
      img: "https://images.unsplash.com/photo-1779899833023-d2f608715ffd?auto=format&fit=crop&w=900&q=80",
      alt: "Fluffy dog being brushed during a de-shedding session",
    },
  ];

  const steps = [
    {
      num: "1",
      title: "Request your quote",
      text: "Tell us about your pup (or kitty!) and pick a time that suits your day.",
    },
    {
      num: "2",
      title: "The van rolls up",
      text: "Our fully equipped spa-on-wheels parks right in your driveway. No car rides, no cages.",
    },
    {
      num: "3",
      title: "One happy floof",
      text: "Bath, cut, trim and cuddles — your best friend struts back inside smelling amazing.",
    },
  ];

  const quotes = [
    {
      text: "Biscuit used to shake at the salon. Now he sprints to the pink van the second it pulls up. Total game changer.",
      name: "Priya M. & Biscuit",
    },
    {
      text: "They de-shedded my husky before summer and I genuinely forgot what dog hair on the couch looked like.",
      name: "Daniel R. & Luna",
    },
    {
      text: "Nail trims done in my driveway during nap time. As a new mom with a senior lab, this is priceless.",
      name: "Aisha K. & Cooper",
    },
  ];

  return (
    <div className="pawsome-page">
      {/* ===== Nav ===== */}
      <header className="pawsome-nav">
        <div className="pawsome-nav-inner">
          <a href="#pawsome-top" className="pawsome-logo">
            <span className="pawsome-logo-badge">
              <PawPrint size={24} aria-hidden="true" />
            </span>
            Pawsome Grooming
          </a>
          <button
            type="button"
            className="pawsome-menu-btn"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
          <ul className={`pawsome-nav-links${menuOpen ? " pawsome-open" : ""}`}>
            <li><a href="#pawsome-services" onClick={() => setMenuOpen(false)}>Services</a></li>
            <li><a href="#pawsome-how" onClick={() => setMenuOpen(false)}>How it works</a></li>
            <li><a href="#pawsome-love" onClick={() => setMenuOpen(false)}>Happy tails</a></li>
            <li>
              <a href={PHONE_HREF} className="pawsome-nav-phone">
                <Phone size={16} aria-hidden="true" />
                {PHONE_LABEL}
              </a>
            </li>
            <li>
              <QuoteButton className="pawsome-btn pawsome-btn-pink pawsome-nav-cta" />
            </li>
          </ul>
        </div>
      </header>

      <main id="pawsome-top">
        {/* ===== Hero ===== */}
        <section className="pawsome-hero">
          <span className="pawsome-bubble pawsome-bubble-1" />
          <span className="pawsome-bubble pawsome-bubble-2" />
          <span className="pawsome-bubble pawsome-bubble-3" />
          <span className="pawsome-bubble pawsome-bubble-4" />
          <span className="pawsome-bubble pawsome-bubble-5" />
          <div className="pawsome-wrap pawsome-hero-inner">
            <div>
              <span className="pawsome-kicker">
                <Truck size={16} aria-hidden="true" />
                The spa comes to you
              </span>
              <h1>
                Squeaky-clean pets, <span className="pawsome-wiggle">zero stress</span>, right in your driveway
              </h1>
              <p>
                Pawsome Grooming brings salon-quality baths, haircuts, nail trims and de-shedding
                to your doorstep in a bubbly pink van your pet will actually love.
              </p>
              <div className="pawsome-hero-ctas">
                <QuoteButton />
                <a href={PHONE_HREF} className="pawsome-btn pawsome-btn-ghost">
                  <Phone size={18} aria-hidden="true" />
                  Call {PHONE_LABEL}
                </a>
              </div>
              <ul className="pawsome-hero-perks">
                {["One-on-one grooming", "No cages, ever", "Dogs & cats welcome"].map((p) => (
                  <li key={p}><Check size={16} aria-hidden="true" /> {p}</li>
                ))}
              </ul>
            </div>
            <div className="pawsome-hero-art">
              <span className="pawsome-blob" aria-hidden="true" />
              <div className="pawsome-hero-photo">
                <img
                  src="https://images.unsplash.com/photo-1581887936036-3f4f7f0b6679?auto=format&fit=crop&w=1600&q=80"
                  alt="Happy dog enjoying a sudsy bath during a mobile grooming session"
                />
              </div>
            </div>
          </div>
        </section>

        <PawDivider />

        {/* ===== Services ===== */}
        <section className="pawsome-section" id="pawsome-services">
          <div className="pawsome-wrap">
            <div className="pawsome-section-head">
              <h2>
                Everything fluffy, <span>handled</span>
              </h2>
              <p>
                Four spa treatments, one visit, zero trips across town. Every appointment is
                one pet at a time with the same gentle groomer.
              </p>
            </div>
            <div className="pawsome-services">
              {services.map((s) => (
                <article className="pawsome-card" key={s.title}>
                  <div className="pawsome-card-photo">
                    <img src={s.img} alt={s.alt} loading="lazy" />
                  </div>
                  <div className="pawsome-card-body">
                    <h3>
                      {s.icon}
                      {s.title}
                    </h3>
                    <p>{s.text}</p>
                    <span className="pawsome-card-tag">{s.tag}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <PawDivider />

        {/* ===== How it works ===== */}
        <section className="pawsome-section" id="pawsome-how">
          <div className="pawsome-wrap">
            <div className="pawsome-steps-band">
              <div className="pawsome-section-head">
                <h2>
                  Three wags to <span>wonderful</span>
                </h2>
                <p>From "who's a messy boy?" to "who's a gorgeous boy!" in about 90 minutes.</p>
              </div>
              <div className="pawsome-steps">
                {steps.map((st) => (
                  <div className="pawsome-step" key={st.num}>
                    <span className="pawsome-step-num">{st.num}</span>
                    <h3>{st.title}</h3>
                    <p>{st.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== Mid-page CTA ===== */}
        <section className="pawsome-section">
          <div className="pawsome-wrap">
            <div className="pawsome-cta-band">
              <span className="pawsome-bubble pawsome-bubble-1" />
              <span className="pawsome-bubble pawsome-bubble-3" />
              <h2>Fresh fur Fridays fill up fast</h2>
              <p>
                Weekend slots are the first to go. Grab a free, no-pressure quote today and
                lock in a time that works for your pack.
              </p>
              <div className="pawsome-cta-actions">
                <QuoteButton />
                <a href={PHONE_HREF} className="pawsome-btn pawsome-btn-ghost">
                  <Phone size={18} aria-hidden="true" />
                  {PHONE_LABEL}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Why mobile ===== */}
        <section className="pawsome-section">
          <div className="pawsome-wrap pawsome-duo">
            <div className="pawsome-duo-art">
              <span className="pawsome-blob pawsome-blob-lav" aria-hidden="true" />
              <div className="pawsome-photo-frame">
                <img
                  src="https://images.unsplash.com/photo-1766947910763-5a9465ff3f21?auto=format&fit=crop&w=1600&q=80"
                  alt="Relaxed pet being pampered by a groomer inside the mobile spa van"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="pawsome-duo-copy">
              <h2>Why pets pick the pink van</h2>
              <p>
                Traditional salons mean car rides, crowded kennels and hours of waiting.
                Our van flips the whole day into a house call your pet looks forward to.
              </p>
              <ul className="pawsome-checks">
                {[
                  "Warm water and climate control in every season",
                  "Anxious, senior and special-needs pets are our specialty",
                  "You are steps away the entire appointment",
                  "Sparkling-clean van sanitized between every visit",
                ].map((line) => (
                  <li key={line}>
                    <Check size={18} aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
              <QuoteButton />
            </div>
          </div>
        </section>

        <PawDivider />

        {/* ===== Testimonials ===== */}
        <section className="pawsome-section" id="pawsome-love">
          <div className="pawsome-wrap">
            <div className="pawsome-section-head">
              <h2>
                Happy tails, <span>happier humans</span>
              </h2>
              <p>Real neighbors, real floofs, really good hair days.</p>
            </div>
            <div className="pawsome-quotes">
              {quotes.map((q) => (
                <figure className="pawsome-quote" key={q.name}>
                  <div className="pawsome-stars" aria-label="Rated 5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={16} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>“{q.text}”</blockquote>
                  <figcaption>{q.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Final CTA ===== */}
        <section className="pawsome-section">
          <div className="pawsome-wrap">
            <div className="pawsome-cta-band">
              <span className="pawsome-bubble pawsome-bubble-2" />
              <span className="pawsome-bubble pawsome-bubble-4" />
              <span className="pawsome-bubble pawsome-bubble-5" />
              <h2>Ready for the fluffiest glow-up ever?</h2>
              <p>
                Get your free quote in under a minute — no account, no commitment,
                just one very pampered pet in your near future.
              </p>
              <div className="pawsome-cta-actions">
                <QuoteButton>Get My Free Quote</QuoteButton>
                <a href={PHONE_HREF} className="pawsome-btn pawsome-btn-ghost">
                  <Phone size={18} aria-hidden="true" />
                  Call {PHONE_LABEL}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="pawsome-footer">
        <div className="pawsome-wrap">
          <div className="pawsome-footer-inner">
            <a href="#pawsome-top" className="pawsome-logo">
              <span className="pawsome-logo-badge">
                <PawPrint size={24} aria-hidden="true" />
              </span>
              Pawsome Grooming
            </a>
            <a href={PHONE_HREF} className="pawsome-nav-phone">
              <Phone size={16} aria-hidden="true" />
              {PHONE_LABEL}
            </a>
            <QuoteButton className="pawsome-btn pawsome-btn-ghost" />
          </div>
          <p className="pawsome-footer-note">
            Pawsome Grooming is a fictional brand shown for demonstration. Independent service
            provider listing. © 2026 Pawsome Grooming.
          </p>
        </div>
      </footer>
    </div>
  );
}
