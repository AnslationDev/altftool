"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Home,
  Moon,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Sunrise,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import "./comfortcare-home.css";

const QUOTE_URL = "#demo-only";
const PHONE_DISPLAY = "Demo only";
const PHONE_TEL = "#demo-only";

const SERVICES = [
  {
    icon: HeartHandshake,
    title: "Friendly companionship",
    text: "Conversation, card games, walks around the block — a warm presence that makes the day brighter.",
  },
  {
    icon: UtensilsCrossed,
    title: "Meals made with care",
    text: "Grocery planning and home-cooked meals that match tastes, routines, and dietary preferences.",
  },
  {
    icon: ShoppingBag,
    title: "Errands & rides",
    text: "Pharmacy pickups, grocery runs, and friendly rides to appointments or the hair salon.",
  },
  {
    icon: Sparkles,
    title: "Light housekeeping",
    text: "Laundry, tidying, fresh linens, and watering the plants — keeping home feeling like home.",
  },
  {
    icon: Users,
    title: "Personal care support",
    text: "Respectful help with bathing, dressing, and grooming, always at your loved one's pace.",
  },
  {
    icon: Home,
    title: "Peace of mind at home",
    text: "Gentle reminders, a steady routine, and regular updates for the whole family.",
  },
];

const HOURS = {
  morning: {
    icon: Sunrise,
    label: "Mornings",
    tag: "A bright start to the day",
    title: "Morning visits",
    text: "A caregiver arrives with the sunrise to help the day begin gently and on schedule.",
    points: ["Help getting up and ready", "A good breakfast together", "Gentle daily reminders", "Tidying up for the day"],
  },
  afternoon: {
    icon: Sun,
    label: "Afternoons",
    tag: "Company through the day",
    title: "Afternoon visits",
    text: "Midday support keeps the day moving — lunch, errands, and good company through the afternoon.",
    points: ["Lunch and conversation", "Errands and appointments", "Walks and light activity", "An update for the family"],
  },
  overnight: {
    icon: Moon,
    label: "Overnight",
    tag: "Restful, watchful nights",
    title: "Overnight care",
    text: "A calm, attentive caregiver stays through the night so everyone can rest a little easier.",
    points: ["A settled bedtime routine", "Someone nearby all night", "Help if the night gets restless", "A smooth morning handoff"],
  },
};

const STEPS = [
  {
    title: "Call for a friendly chat",
    text: "Tell us about your loved one, their routine, and what kind of help would make life easier.",
  },
  {
    title: "Meet a matched caregiver",
    text: "We suggest a vetted caregiver whose experience and personality fit your family.",
  },
  {
    title: "Start with hours that fit",
    text: "Begin with a few hours a week and adjust anytime — more help, fewer visits, your call.",
  },
];

export default function ComfortCareHomePage() {
  const [slot, setSlot] = useState("morning");
  const active = HOURS[slot];

  return (
    <div className="comfortcare-page">
      <header className="comfortcare-nav">
        <div className="comfortcare-nav-inner">
          <a href="#comfortcare-top" className="comfortcare-logo">
            <span className="comfortcare-logo-mark" aria-hidden="true">
              <HeartHandshake size={26} />
            </span>
            ComfortCare at Home
          </a>
          <div className="comfortcare-nav-actions">
            <a href={PHONE_TEL} className="comfortcare-nav-phone">
              <Phone size={22} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <a
              href={QUOTE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="comfortcare-btn comfortcare-btn-primary"
            >
              Get a Free Consultation
            </a>
          </div>
        </div>
      </header>

      <main id="comfortcare-top">
        <section className="comfortcare-hero">
          <div className="comfortcare-container comfortcare-hero-grid">
            <div className="comfortcare-hero-copy">
              <span className="comfortcare-eyebrow">
                <HeartHandshake size={18} aria-hidden="true" />
                In-home care, done kindly
              </span>
              <h1>Kind, trusted help at home — so home can stay home.</h1>
              <p className="comfortcare-hero-sub">
                Vetted, compassionate caregivers for companionship, meals, errands, and personal
                care. From a few hours a week to round-the-clock support.
              </p>
              <div className="comfortcare-hero-ctas">
                <a
                  href={QUOTE_URL}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="comfortcare-btn comfortcare-btn-primary comfortcare-btn-big"
                >
                  Get a Free Consultation
                  <ArrowRight size={22} aria-hidden="true" />
                </a>
                <a href={PHONE_TEL} className="comfortcare-btn comfortcare-btn-phone comfortcare-btn-big">
                  <Phone size={22} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
              <ul className="comfortcare-hero-points">
                <li>
                  <ShieldCheck size={20} aria-hidden="true" />
                  Background-checked caregivers
                </li>
                <li>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  No long-term contracts
                </li>
                <li>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  Flexible scheduling
                </li>
              </ul>
            </div>
            <div className="comfortcare-hero-photo">
              <div className="comfortcare-hero-frame">
                <img
                  src="https://images.unsplash.com/photo-1762955911431-4c44c7c3f408?auto=format&fit=crop&w=1600&q=80"
                  alt="A caregiver and an older woman smiling together at home"
                />
              </div>
              <div className="comfortcare-hero-badge">
                <ShieldCheck size={30} aria-hidden="true" />
                <div>
                  <strong>Vetted & insured</strong>
                  <span>Every caregiver, every visit</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="comfortcare-section" aria-labelledby="comfortcare-services-heading">
          <div className="comfortcare-container">
            <div className="comfortcare-section-head">
              <h2 id="comfortcare-services-heading">Help with the everyday things</h2>
              <p>
                Plain and simple: our caregivers pitch in wherever daily life could use a hand,
                always with warmth and respect.
              </p>
            </div>
            <div className="comfortcare-services-grid">
              {SERVICES.map((service) => (
                <article key={service.title} className="comfortcare-service-card">
                  <span className="comfortcare-service-icon" aria-hidden="true">
                    <service.icon size={32} />
                  </span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="comfortcare-section comfortcare-section-alt" aria-labelledby="comfortcare-hours-heading">
          <div className="comfortcare-container">
            <div className="comfortcare-section-head">
              <h2 id="comfortcare-hours-heading">Hours that fit your family</h2>
              <p>Pick a time of day to see what a visit can look like. Schedules can always change as needs do.</p>
            </div>
            <div className="comfortcare-hours">
              <div className="comfortcare-hours-chips" role="group" aria-label="Choose a time of day">
                {Object.entries(HOURS).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    className="comfortcare-chip"
                    aria-pressed={slot === key}
                    onClick={() => setSlot(key)}
                  >
                    <span className="comfortcare-chip-icon" aria-hidden="true">
                      <value.icon size={28} />
                    </span>
                    <span>
                      <strong>{value.label}</strong>
                      <span>{value.tag}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="comfortcare-hours-detail" aria-live="polite">
                <h3>{active.title}</h3>
                <p>{active.text}</p>
                <ul>
                  {active.points.map((point) => (
                    <li key={point}>
                      <CheckCircle2 size={20} aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="comfortcare-section" aria-labelledby="comfortcare-moments-heading">
          <div className="comfortcare-container">
            <div className="comfortcare-section-head">
              <h2 id="comfortcare-moments-heading">Care that feels like family</h2>
              <p>Little moments matter — a shared laugh, a favorite recipe, a hand to hold on a walk.</p>
            </div>
            <div className="comfortcare-photos-grid">
              <figure className="comfortcare-photo-card">
                <div className="comfortcare-photo-frame">
                  <img
                    src="https://images.unsplash.com/photo-1658314755707-1fbdf7c40145?auto=format&fit=crop&w=900&q=80"
                    alt="A caregiver sharing a happy conversation with an older adult"
                    loading="lazy"
                  />
                </div>
                <figcaption>
                  <h3>Good company, every visit</h3>
                  <p>Caregivers matched by personality, not just availability.</p>
                </figcaption>
              </figure>
              <figure className="comfortcare-photo-card">
                <div className="comfortcare-photo-frame">
                  <img
                    src="https://images.unsplash.com/photo-1587556930720-58ec521056a5?auto=format&fit=crop&w=900&q=80"
                    alt="An older couple enjoying time together at home"
                    loading="lazy"
                  />
                </div>
                <figcaption>
                  <h3>Support for couples too</h3>
                  <p>Help that lets partners keep enjoying life side by side.</p>
                </figcaption>
              </figure>
              <figure className="comfortcare-photo-card">
                <div className="comfortcare-photo-frame">
                  <img
                    src="https://images.unsplash.com/photo-1765896387387-0538bc9f997e?auto=format&fit=crop&w=900&q=80"
                    alt="A caregiver walking outdoors with an older gentleman"
                    loading="lazy"
                  />
                </div>
                <figcaption>
                  <h3>Out and about together</h3>
                  <p>Fresh air, errands, and outings with a steady arm nearby.</p>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="comfortcare-section comfortcare-section-alt">
          <div className="comfortcare-container">
            <div className="comfortcare-band">
              <h2>Not sure where to start? That's okay.</h2>
              <p>
                Most families begin with one friendly phone call. We'll listen first, then talk
                through what kind of help might fit.
              </p>
              <a
                href={QUOTE_URL}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="comfortcare-btn comfortcare-btn-primary comfortcare-btn-big"
              >
                Get a Free Consultation
                <ArrowRight size={22} aria-hidden="true" />
              </a>
              <br />
              <a href={PHONE_TEL} className="comfortcare-band-phone">
                <Phone size={30} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
              <p className="comfortcare-band-note">Real people answer, seven days a week.</p>
            </div>
          </div>
        </section>

        <section className="comfortcare-section" aria-labelledby="comfortcare-steps-heading">
          <div className="comfortcare-container">
            <div className="comfortcare-section-head">
              <h2 id="comfortcare-steps-heading">Getting started is simple</h2>
              <p>Three easy steps — and you can pause or adjust care whenever life changes.</p>
            </div>
            <div className="comfortcare-steps">
              {STEPS.map((step, index) => (
                <article key={step.title} className="comfortcare-step">
                  <span className="comfortcare-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="comfortcare-section comfortcare-section-alt">
          <div className="comfortcare-container">
            <div className="comfortcare-wide-photo">
              <img
                src="https://images.unsplash.com/photo-1567505599350-70d90e03a41b?auto=format&fit=crop&w=1600&q=80"
                alt="Hands gently held together, showing care and reassurance"
                loading="lazy"
              />
            </div>
            <div className="comfortcare-band" style={{ marginTop: "24px" }}>
              <h2>Ready when your family is</h2>
              <p>
                Call today for a free, no-pressure consultation. We'll help you figure out the
                right amount of care — even if that's just a little to start.
              </p>
              <a
                href={QUOTE_URL}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="comfortcare-btn comfortcare-btn-primary comfortcare-btn-big"
              >
                Get a Free Consultation
                <ArrowRight size={22} aria-hidden="true" />
              </a>
              <br />
              <a href={PHONE_TEL} className="comfortcare-band-phone">
                <Phone size={30} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
              <p className="comfortcare-band-note">Free consultation. No obligation. Kind answers to every question.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="comfortcare-footer">
        <div className="comfortcare-container">
          <span className="comfortcare-footer-brand">
            <HeartHandshake size={22} aria-hidden="true" />
            ComfortCare at Home
          </span>
          <p>
            Questions? Call <a href={PHONE_TEL}>{PHONE_DISPLAY}</a> — we're happy to help.
          </p>
          <p className="comfortcare-footer-disclaimer">Independent provider listing. Not medical advice.</p>
          <p>© {new Date().getFullYear()} ComfortCare at Home. A fictional brand shown for listing purposes.</p>
        </div>
      </footer>
    </div>
  );
}
