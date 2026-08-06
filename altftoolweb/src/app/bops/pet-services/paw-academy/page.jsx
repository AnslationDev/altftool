"use client";

import "./paw-academy.css";
import {
  PawPrint, Phone, ArrowRight, Medal, Target, Megaphone, Trophy,
  GraduationCap, Users, ShieldCheck, Dog, Bone, BadgeCheck,
} from "lucide-react";

const QUOTE_URL = "#demo-only";
const TEL_HREF = "#demo-only";
const TEL_TEXT = "Demo only";

const HERO_IMG =
  "https://images.unsplash.com/photo-1620289052446-202137ffa876?auto=format&fit=crop&w=1600&q=80";
const WALL_IMG =
  "https://images.unsplash.com/photo-1640652663796-764e4eb5bc59?auto=format&fit=crop&w=1600&q=80";

const PROGRAMS = [
  {
    icon: Dog, title: "Puppy School", meta: "Example group-course card",
    text: "Illustrative copy showing where a provider could describe puppy-training topics and age guidance.",
    img: "https://images.unsplash.com/photo-1531531534025-0b78da954d21?auto=format&fit=crop&w=900&q=80",
    alt: "Licensed stock photo of a young puppy sitting attentively",
  },
  {
    icon: Megaphone, title: "Obedience Basics", meta: "Example format options",
    text: "Illustrative copy showing where a provider could describe foundational training topics.",
    img: "https://images.unsplash.com/photo-1581753418434-51c11169a3c1?auto=format&fit=crop&w=900&q=80",
    alt: "Licensed stock photo of a dog and handler outdoors",
  },
  {
    icon: Target, title: "Behaviour Support", meta: "Example individual-plan card",
    text: "Illustrative copy showing where a qualified provider could explain assessment and support boundaries.",
    img: "https://images.unsplash.com/photo-1599397101162-7305f6cf8db1?auto=format&fit=crop&w=900&q=80",
    alt: "Licensed stock photo of a person working with a dog",
  },
  {
    icon: Trophy, title: "Private Coaching", meta: "Example scheduling card",
    text: "Illustrative copy showing where a provider could describe individual sessions and locations.",
    img: "https://images.unsplash.com/photo-1596278852720-141ba859bbbf?auto=format&fit=crop&w=900&q=80",
    alt: "Licensed stock photo of a handler rewarding a dog",
  },
];

const LADDER = [
  { level: "Level 01", title: "Puppy", text: "Foundations: focus, handling, confidence and calm greetings." },
  { level: "Level 02", title: "Basics", text: "Core obedience: sit, down, stay, recall and lead manners." },
  { level: "Level 03", title: "Advanced", text: "Off-lead reliability, distance commands and distraction-proofing." },
  { level: "Level 04", title: "Champion", text: "Trick titles, agility starters and the PawAcademy Champion medal." },
];

const FEATURES = [
  { icon: BadgeCheck, title: "Credential Placeholder", text: "A real provider could publish verifiable qualifications and insurance details here." },
  { icon: Medal, title: "Example Curriculum", text: "This card illustrates how levels and progress notes could be explained." },
  { icon: Target, title: "Scope and Safety", text: "A qualified provider could state assessment methods, boundaries, and referral policies here." },
  { icon: Users, title: "Example Group Format", text: "This card demonstrates where verified class-size information could appear." },
  { icon: GraduationCap, title: "Example Owner Guidance", text: "Illustrative copy shows how practice instructions could be described." },
  { icon: ShieldCheck, title: "Policy Placeholder", text: "A real provider could publish documented cancellation or progress-support terms here; no guarantee is offered." },
];

function QuoteLink({ className, children }) {
  return (
    <a
      className={className}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children}
    </a>
  );
}

export default function PawAcademyPage() {
  return (
    <div className="pawacademy-page">
      <header className="pawacademy-nav">
        <div className="pawacademy-nav-inner">
          <a href="#pawacademy-top" className="pawacademy-logo pawacademy-hd">
            <span className="pawacademy-logo-paw" aria-hidden="true">
              <PawPrint size={24} />
            </span>
            PawAcademy
          </a>
          <nav aria-label="Page sections">
            <ul className="pawacademy-nav-links">
              <li><a href="#pawacademy-programs">Programs</a></li>
              <li><a href="#pawacademy-ladder">Levels</a></li>
              <li><a href="#pawacademy-why">Design Principles</a></li>
            </ul>
          </nav>
          <div className="pawacademy-nav-cta">
            <a className="pawacademy-tel" href={TEL_HREF}>
              <Phone size={16} aria-hidden="true" />
              {TEL_TEXT}
            </a>
            <QuoteLink className="pawacademy-btn pawacademy-btn-lime">
              Preview Quote CTA
            </QuoteLink>
          </div>
        </div>
      </header>

      <main id="pawacademy-top">
        <section className="pawacademy-hero">
          <div className="pawacademy-wrap pawacademy-hero-grid">
            <div>
              <p className="pawacademy-kicker">
                <Megaphone size={14} aria-hidden="true" />
                Fictional dog-training layout
              </p>
              <h1 className="pawacademy-hd pawacademy-hero-title">
                Train Hard. <em>Wag Harder.</em>
              </h1>
              <p className="pawacademy-hero-sub">
                A design demonstration showing how group, individual, puppy,
                obedience, and behaviour-support information could be organized
                for a verified provider.
              </p>
              <div className="pawacademy-hero-actions">
                <QuoteLink className="pawacademy-btn pawacademy-btn-lime">
                  Preview Quote CTA
                  <ArrowRight size={18} aria-hidden="true" />
                </QuoteLink>
                <a className="pawacademy-btn pawacademy-btn-ghost" href={TEL_HREF}>
                  <Phone size={18} aria-hidden="true" />
                  {TEL_TEXT}
                </a>
              </div>
              <ul className="pawacademy-stats">
                <li className="pawacademy-chip"><strong>{LADDER.length}</strong><span>Illustrative training levels</span></li>
              </ul>
            </div>
            <div className="pawacademy-hero-media">
              <div className="pawacademy-frame">
                <img
                  src={HERO_IMG}
                  alt="Licensed stock photo of a dog and handler on an outdoor field"
                />
                <span className="pawacademy-hero-badge">
                  <Medal size={16} aria-hidden="true" />
                  Credential placeholder
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="pawacademy-sec" id="pawacademy-programs">
          <div className="pawacademy-wrap">
            <div className="pawacademy-sec-head">
              <hr className="pawacademy-rule" />
              <h2 className="pawacademy-hd">Pick Your Program</h2>
              <p>
                Four illustrative cards demonstrate how program information
                could be presented. No assessment call or training is offered.
              </p>
            </div>
            <div className="pawacademy-cards">
              {PROGRAMS.map((p) => (
                <article className="pawacademy-card" key={p.title}>
                  <div className="pawacademy-frame">
                    <img src={p.img} alt={p.alt} loading="lazy" />
                  </div>
                  <div className="pawacademy-card-body">
                    <span className="pawacademy-card-icon" aria-hidden="true">
                      <p.icon size={20} />
                    </span>
                    <h3 className="pawacademy-hd">{p.title}</h3>
                    <p>{p.text}</p>
                    <span className="pawacademy-card-meta">{p.meta}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pawacademy-ladder-sec" id="pawacademy-ladder">
          <div className="pawacademy-wrap">
            <div className="pawacademy-sec-head">
              <hr className="pawacademy-rule" />
              <h2 className="pawacademy-hd">The PawAcademy Ladder</h2>
              <p>
                This fictional ladder demonstrates how progressive levels and
                assessment information could be presented.
              </p>
            </div>
            <ol className="pawacademy-ladder">
              {LADDER.map((step, i) => (
                <li
                  className={`pawacademy-step pawacademy-step-${i + 1}`}
                  key={step.title}
                >
                  <span className="pawacademy-medal" aria-hidden="true">
                    {i === 3 ? <Trophy size={20} /> : <Medal size={20} />}
                  </span>
                  <span className="pawacademy-step-num">{step.level}</span>
                  <h3 className="pawacademy-hd">{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="pawacademy-sec" id="pawacademy-why">
          <div className="pawacademy-wrap">
            <div className="pawacademy-sec-head">
              <hr className="pawacademy-rule" />
              <h2 className="pawacademy-hd">Training design principles</h2>
              <p>
                This fictional academy layout illustrates structured levels, reward-based practice,
                and clearly explained program options.
              </p>
            </div>
            <ul className="pawacademy-features">
              {FEATURES.map((f) => (
                <li className="pawacademy-feature" key={f.title}>
                  <span className="pawacademy-feature-icon" aria-hidden="true">
                    <f.icon size={22} />
                  </span>
                  <h3 className="pawacademy-hd">{f.title}</h3>
                  <p>{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="pawacademy-band">
          <div className="pawacademy-wrap pawacademy-band-inner">
            <div>
              <h2 className="pawacademy-hd">Preview a training-service CTA</h2>
              <p>This disabled component does not request a quote or contact a trainer.</p>
            </div>
            <div className="pawacademy-band-actions">
              <QuoteLink className="pawacademy-btn pawacademy-btn-navy">
                Preview Quote CTA
                <ArrowRight size={18} aria-hidden="true" />
              </QuoteLink>
              <a className="pawacademy-tel" href={TEL_HREF}>
                <Phone size={16} aria-hidden="true" />
                {TEL_TEXT}
              </a>
            </div>
          </div>
        </section>

        <section className="pawacademy-sec">
          <div className="pawacademy-wrap pawacademy-gradwall">
            <div className="pawacademy-frame">
              <img
                src={WALL_IMG}
                alt="Licensed stock photo of a dog used in an illustrative program layout"
                loading="lazy"
              />
            </div>
            <div>
              <div className="pawacademy-sec-head">
                <hr className="pawacademy-rule" />
                <h2 className="pawacademy-hd">Illustrative program image</h2>
              </div>
              <p>
                The photo is licensed stock imagery used only to demonstrate the page composition;
                it is not a real graduate, provider location, or customer result.
              </p>
            </div>
          </div>
        </section>

        <section className="pawacademy-final">
          <div className="pawacademy-wrap">
            <h2 className="pawacademy-hd">
              Preview an enrolment <em>call to action.</em>
            </h2>
            <p>
              This fictional page has no cohorts, availability, trainer matching,
              enrolment, or live academy line.
            </p>
            <div className="pawacademy-final-actions">
              <QuoteLink className="pawacademy-btn pawacademy-btn-lime">
                Preview Quote CTA
                <ArrowRight size={18} aria-hidden="true" />
              </QuoteLink>
              <a className="pawacademy-btn pawacademy-btn-ghost" href={TEL_HREF}>
                <Phone size={18} aria-hidden="true" />
                {TEL_TEXT}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="pawacademy-footer">
        <div className="pawacademy-wrap pawacademy-footer-inner">
          <span className="pawacademy-logo pawacademy-hd">
            <span className="pawacademy-logo-paw" aria-hidden="true">
              <Bone size={18} />
            </span>
            PawAcademy
          </span>
          <a className="pawacademy-tel" href={TEL_HREF}>
            <Phone size={14} aria-hidden="true" />
            {TEL_TEXT}
          </a>
          <p className="pawacademy-footer-note">
            Design demonstration, not a provider listing
          </p>
        </div>
      </footer>
    </div>
  );
}
