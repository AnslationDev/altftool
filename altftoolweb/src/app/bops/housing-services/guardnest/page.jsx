"use client";

import "./guardnest.css";
import { useState } from "react";
import {
  ShieldCheck,
  Video,
  Baby,
  PawPrint,
  Smartphone,
  Check,
  X,
  Star,
  Phone,
  ChevronDown,
  Lock,
  Moon,
  Heart,
  Sparkles,
} from "lucide-react";

const PHONE_DISPLAY = "(844) 555-0198";
const PHONE_TEL = "tel:+18445550198";

const NAV_LINKS = [
  { href: "#guardnest-features", label: "Made for families" },
  { href: "#guardnest-compare", label: "Why GuardNest" },
  { href: "#guardnest-stories", label: "Family stories" },
  { href: "#guardnest-faq", label: "FAQ" },
];

const FEATURES = [
  {
    icon: Video,
    tint: "guardnest-tint-peach",
    title: "Doorbell camera",
    body: "See who is at the door from the kitchen, the office, or the school pickup line — with a friendly two-way chat button.",
  },
  {
    icon: Baby,
    tint: "guardnest-tint-mint",
    title: "Child-safe codes",
    body: "Give each kid their own door code. Get a gentle nudge when they get home from school — no calls needed.",
  },
  {
    icon: PawPrint,
    tint: "guardnest-tint-lilac",
    title: "Pet-immune sensors",
    body: "Motion sensors that know the difference between a midnight snack run and a 90-pound golden retriever.",
  },
  {
    icon: Smartphone,
    tint: "guardnest-tint-butter",
    title: "Grandma-friendly app",
    body: "Three big buttons. Zero jargon. If Grandma can send a group text, she can arm the house.",
  },
];

const COMPARE_US = [
  "No contracts — cancel any month, no hard feelings",
  "You install it in an afternoon (we stay on the phone)",
  "Pet-immune sensors tuned for real households",
  "Kid codes, nap-time quiet mode, and gentle chimes",
  "Real humans answer in under 30 seconds",
];

const COMPARE_THEM = [
  "36-month contracts with early-exit fees",
  "Week-long waits for a technician visit",
  "False alarms every time the cat stretches",
  "One master code the whole street ends up knowing",
  "Phone trees, hold music, and 'your call is important'",
];

const TESTIMONIALS = [
  {
    initials: "MJ",
    tint: "guardnest-tint-peach",
    name: "Maya J.",
    meta: "Mom of three, Portland",
    quote:
      "The nap-time quiet mode alone is worth it. The chime softens when the baby is asleep — whoever thought of that clearly has kids.",
  },
  {
    initials: "DR",
    tint: "guardnest-tint-mint",
    name: "Dev & Rosa",
    meta: "First-home buyers, Austin",
    quote:
      "We set the whole thing up on a Saturday morning with coffee. When our sitter's code opens the door, we both get a little wave on our phones.",
  },
  {
    initials: "EW",
    tint: "guardnest-tint-lilac",
    name: "Evelyn W.",
    meta: "Grandmother of five, Tampa",
    quote:
      "I am 74 and I run this thing myself. Big buttons, plain words. My grandson checked exactly once — then never had to again.",
  },
];

const FAQS = [
  {
    q: "Is there really no contract?",
    a: "Really. GuardNest is month-to-month, and you can pause or cancel from the app in about four taps. Families change — your security should keep up, not lock you in.",
  },
  {
    q: "Will my dog set off the alarm?",
    a: "No. Our sensors are tuned to ignore pets up to 90 pounds, and you can raise that threshold in the app. Biscuit can do zoomies at 2 a.m. and nobody gets a scary phone call.",
  },
  {
    q: "Do I need a technician to install it?",
    a: "Nope — everything is peel-and-stick or plug-in, and most families finish in under an hour. If you'd like company, our setup line will stay on the phone with you the whole way through.",
  },
  {
    q: "What happens when an alarm goes off?",
    a: "Our monitoring team checks the cameras and sensors, then calls you first — in the order you chose. If it's real, we dispatch help right away. If it's a burnt pancake, we all have a laugh and reset.",
  },
];

function NotificationCard({ className, tint, icon: Icon, text }) {
  return (
    <div className={`guardnest-notif ${className}`} aria-hidden="true">
      <span className={`guardnest-notif-icon ${tint}`}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <span>{text}</span>
      <Check className="guardnest-notif-check" size={16} aria-hidden="true" />
    </div>
  );
}

function StarRow() {
  return (
    <span className="guardnest-stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={16} fill="currentColor" />
      ))}
    </span>
  );
}

export default function GuardNestPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleQuoteSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="guardnest-page">
      <a className="guardnest-skip" href="#guardnest-main">
        Skip to content
      </a>

      <header className="guardnest-nav">
        <div className="guardnest-nav-inner">
          <a className="guardnest-brand" href="#guardnest-main" aria-label="GuardNest home">
            <span className="guardnest-brand-mark">
              <ShieldCheck size={24} aria-hidden="true" />
            </span>
            GuardNest
          </a>
          <nav aria-label="Main">
            <ul className="guardnest-nav-links">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a className="guardnest-nav-link" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a className="guardnest-pill guardnest-pill-amber" href="#quote">
            Free Quote
          </a>
        </div>
      </header>

      <main id="guardnest-main">
        {/* Hero */}
        <section className="guardnest-hero" aria-labelledby="guardnest-hero-title">
          <div className="guardnest-container guardnest-hero-inner">
            <div className="guardnest-hero-copy">
              <span className="guardnest-eyebrow">
                <Heart size={15} aria-hidden="true" />
                Family-first home protection
              </span>
              <h1 id="guardnest-hero-title">
                Home security that feels like{" "}
                <span className="guardnest-highlight">home</span>.
              </h1>
              <p>
                Doorbell cameras, no-contract alarms, and gentle automations that
                know the difference between a burglar, a toddler, and the dog.
                Set up in an afternoon — loved for years.
              </p>
              <div className="guardnest-hero-ctas">
                <a className="guardnest-pill" href="#quote">
                  Get my free quote
                </a>
                <a className="guardnest-pill guardnest-pill-ghost" href={PHONE_TEL}>
                  <Phone size={17} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
              <p className="guardnest-trust">
                <StarRow />
                4.9 from 2,300+ happy households
              </p>
            </div>

            <div className="guardnest-hero-art" aria-hidden="true">
              <div className="guardnest-blob" />
              <div className="guardnest-house-card">
                <span className="guardnest-shield-badge">
                  <ShieldCheck size={30} />
                </span>
                <div className="guardnest-house">
                  <div className="guardnest-house-roof" />
                  <div className="guardnest-house-body">
                    <div className="guardnest-house-window" />
                    <div className="guardnest-house-door" />
                    <div className="guardnest-house-window" />
                  </div>
                </div>
                <p className="guardnest-house-caption">The Hendersons — all safe</p>
              </div>
              <NotificationCard
                className="guardnest-notif-1"
                tint="guardnest-tint-mint"
                icon={Lock}
                text="Front door locked"
              />
              <NotificationCard
                className="guardnest-notif-2"
                tint="guardnest-tint-lilac"
                icon={Moon}
                text="Nap time — quiet mode on"
              />
              <NotificationCard
                className="guardnest-notif-3"
                tint="guardnest-tint-butter"
                icon={PawPrint}
                text="Biscuit spotted in the yard"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="guardnest-features"
          className="guardnest-section guardnest-section-alt"
          aria-labelledby="guardnest-features-title"
        >
          <div className="guardnest-container">
            <div className="guardnest-section-head">
              <h2 id="guardnest-features-title">Made for families, not floor plans</h2>
              <p>
                Every GuardNest feature started as a real request from a real
                household — usually one with sticky fingerprints on the wall.
              </p>
            </div>
            <div className="guardnest-features">
              {FEATURES.map((feature) => (
                <article className="guardnest-feature" key={feature.title}>
                  <span className={`guardnest-feature-icon ${feature.tint}`}>
                    <feature.icon size={26} aria-hidden="true" />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Compare */}
        <section
          id="guardnest-compare"
          className="guardnest-section"
          aria-labelledby="guardnest-compare-title"
        >
          <div className="guardnest-container">
            <div className="guardnest-section-head">
              <h2 id="guardnest-compare-title">GuardNest vs. old-school alarms</h2>
              <p>
                We grew up with the beige keypad by the garage door too. We built
                the opposite of it.
              </p>
            </div>
            <div className="guardnest-compare">
              <div className="guardnest-compare-card guardnest-compare-us">
                <h3>With GuardNest</h3>
                <ul className="guardnest-compare-list">
                  {COMPARE_US.map((item) => (
                    <li key={item}>
                      <Check size={20} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="guardnest-compare-card guardnest-compare-them">
                <h3>Old-school alarms</h3>
                <ul className="guardnest-compare-list">
                  {COMPARE_THEM.map((item) => (
                    <li key={item}>
                      <X size={20} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          id="guardnest-stories"
          className="guardnest-section guardnest-section-alt"
          aria-labelledby="guardnest-stories-title"
        >
          <div className="guardnest-container">
            <div className="guardnest-section-head">
              <h2 id="guardnest-stories-title">Families who sleep easier</h2>
              <p>Unscripted, unpaid, occasionally interrupted by a toddler.</p>
            </div>
            <div className="guardnest-quotes">
              {TESTIMONIALS.map((t) => (
                <article className="guardnest-quote" key={t.name}>
                  <StarRow />
                  <blockquote>{t.quote}</blockquote>
                  <div className="guardnest-quote-who">
                    <span className={`guardnest-avatar ${t.tint}`} aria-hidden="true">
                      {t.initials}
                    </span>
                    <div>
                      <div className="guardnest-quote-name">{t.name}</div>
                      <div className="guardnest-quote-meta">{t.meta}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="guardnest-faq"
          className="guardnest-section"
          aria-labelledby="guardnest-faq-title"
        >
          <div className="guardnest-container">
            <div className="guardnest-section-head">
              <h2 id="guardnest-faq-title">Gentle answers to fair questions</h2>
              <p>Still curious? Call us — a human picks up.</p>
            </div>
            <div className="guardnest-faq-list">
              {FAQS.map((faq) => (
                <details className="guardnest-faq" key={faq.q}>
                  <summary>
                    {faq.q}
                    <ChevronDown className="guardnest-faq-chevron" size={20} aria-hidden="true" />
                  </summary>
                  <p className="guardnest-faq-body">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section id="quote" className="guardnest-cta" aria-labelledby="guardnest-cta-title">
          <div className="guardnest-container">
            <div className="guardnest-cta-card">
              <div className="guardnest-cta-copy">
                <h2 id="guardnest-cta-title">Ready to make home feel safer?</h2>
                <p>
                  Tell us a little about your place and we&apos;ll put together a
                  friendly, no-pressure quote. Or just call — we love a chat.
                </p>
                <a className="guardnest-cta-phone" href={PHONE_TEL}>
                  <Phone size={22} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
              <form className="guardnest-form" onSubmit={handleQuoteSubmit}>
                <h3>Get a free quote</h3>
                <label className="guardnest-sr" htmlFor="guardnest-name">
                  Your name
                </label>
                <input
                  className="guardnest-input"
                  id="guardnest-name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="off"
                />
                <label className="guardnest-sr" htmlFor="guardnest-zip">
                  ZIP code
                </label>
                <input
                  className="guardnest-input"
                  id="guardnest-zip"
                  name="zip"
                  type="text"
                  inputMode="numeric"
                  placeholder="ZIP code"
                  autoComplete="off"
                />
                <button className="guardnest-pill guardnest-pill-amber" type="submit">
                  <Sparkles size={17} aria-hidden="true" />
                  Send my quote request
                </button>
                {submitted ? (
                  <p className="guardnest-form-thanks" role="status">
                    <Check size={18} aria-hidden="true" />
                    Thanks! A friendly human will reach out soon.
                  </p>
                ) : (
                  <p className="guardnest-form-note">
                    No spam, no robocalls, no contracts. Promise.
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="guardnest-footer">
        <div className="guardnest-container">
          <div className="guardnest-footer-grid">
            <div>
              <span className="guardnest-brand">
                <span className="guardnest-brand-mark">
                  <ShieldCheck size={24} aria-hidden="true" />
                </span>
                GuardNest
              </span>
              <p className="guardnest-footer-blurb">
                Family-first home protection. Doorbell cameras, no-contract
                alarms, and automations gentle enough for nap time.
              </p>
            </div>
            <nav aria-label="Footer">
              <h3>Explore</h3>
              <ul>
                <li><a href="#guardnest-features">Made for families</a></li>
                <li><a href="#guardnest-compare">Why GuardNest</a></li>
                <li><a href="#guardnest-stories">Family stories</a></li>
                <li><a href="#guardnest-faq">FAQ</a></li>
              </ul>
            </nav>
            <div>
              <h3>Say hello</h3>
              <ul>
                <li>
                  <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
                </li>
                <li><a href="#quote">Request a free quote</a></li>
              </ul>
            </div>
          </div>
          <div className="guardnest-footer-bottom">
            <span>GuardNest is a fictional brand created for the AltFTool Housing Needs directory.</span>
            <span>Built with love, cocoa, and zero contracts.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
