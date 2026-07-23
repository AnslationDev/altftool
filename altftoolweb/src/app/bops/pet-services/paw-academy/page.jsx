"use client";

import "./paw-academy.css";
import {
  PawPrint, Phone, ArrowRight, Medal, Target, Megaphone, Trophy,
  GraduationCap, Users, ShieldCheck, Dog, Bone, Star, BadgeCheck,
} from "lucide-react";

const QUOTE_URL = "https://example.com/quote/paw-academy";
const TEL_HREF = "tel:+18225550155";
const TEL_TEXT = "(822) 555-0155";

const HERO_IMG =
  "https://images.unsplash.com/photo-1620289052446-202137ffa876?auto=format&fit=crop&w=1600&q=80";
const WALL_IMG =
  "https://images.unsplash.com/photo-1640652663796-764e4eb5bc59?auto=format&fit=crop&w=1600&q=80";

const PROGRAMS = [
  {
    icon: Dog, title: "Puppy School", meta: "6-week group course",
    text: "Socialisation, name response, crate comfort and bite inhibition for pups aged 8 weeks to 6 months.",
    img: "https://images.unsplash.com/photo-1531531534025-0b78da954d21?auto=format&fit=crop&w=900&q=80",
    alt: "Young puppy sitting attentively during a training session",
  },
  {
    icon: Megaphone, title: "Obedience Basics", meta: "Group or private",
    text: "Sit, stay, recall and loose-lead walking drilled with positive reinforcement until they stick anywhere.",
    img: "https://images.unsplash.com/photo-1581753418434-51c11169a3c1?auto=format&fit=crop&w=900&q=80",
    alt: "Dog practising obedience commands with a trainer outdoors",
  },
  {
    icon: Target, title: "Behaviour Correction", meta: "One-on-one plans",
    text: "Structured plans for pulling, jumping, reactivity and separation stress — built around your dog.",
    img: "https://images.unsplash.com/photo-1599397101162-7305f6cf8db1?auto=format&fit=crop&w=900&q=80",
    alt: "Trainer working closely with a dog on focused behaviour exercises",
  },
  {
    icon: Trophy, title: "Private Coaching", meta: "Flexible scheduling",
    text: "Fast-track one-on-one sessions at your home or our field, tailored to your goals and schedule.",
    img: "https://images.unsplash.com/photo-1596278852720-141ba859bbbf?auto=format&fit=crop&w=900&q=80",
    alt: "Handler rewarding a well-behaved dog during a private lesson",
  },
];

const LADDER = [
  { level: "Level 01", title: "Puppy", text: "Foundations: focus, handling, confidence and calm greetings." },
  { level: "Level 02", title: "Basics", text: "Core obedience: sit, down, stay, recall and lead manners." },
  { level: "Level 03", title: "Advanced", text: "Off-lead reliability, distance commands and distraction-proofing." },
  { level: "Level 04", title: "Champion", text: "Trick titles, agility starters and the PawAcademy Champion medal." },
];

const FEATURES = [
  { icon: BadgeCheck, title: "Certified Trainers", text: "Every coach is accredited in force-free, reward-based methods and insured for group and in-home work." },
  { icon: Medal, title: "Graded Curriculum", text: "Dogs move through four clear levels with a report card after every session — no vague promises." },
  { icon: Target, title: "Behaviour Specialists", text: "Reactivity, anxiety and resource guarding handled with structured, humane protocols." },
  { icon: Users, title: "Small Groups", text: "Maximum six dogs per class so every handler gets real coaching time, not a lecture." },
  { icon: GraduationCap, title: "Owner Coaching", text: "We train you as much as the dog — every technique is demonstrated, practised and sent home in notes." },
  { icon: ShieldCheck, title: "Guaranteed Progress", text: "If your dog hasn't progressed a level by course end, the next block of sessions is on us." },
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
              <li><a href="#pawacademy-why">Why Us</a></li>
            </ul>
          </nav>
          <div className="pawacademy-nav-cta">
            <a className="pawacademy-tel" href={TEL_HREF}>
              <Phone size={16} aria-hidden="true" />
              {TEL_TEXT}
            </a>
            <QuoteLink className="pawacademy-btn pawacademy-btn-lime">
              Get a Free Quote
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
                Certified Dog Training Academy
              </p>
              <h1 className="pawacademy-hd pawacademy-hero-title">
                Train Hard. <em>Wag Harder.</em>
              </h1>
              <p className="pawacademy-hero-sub">
                From chaotic puppy to calm champion — PawAcademy's certified
                coaches run structured, reward-based programs in small groups
                or one-on-one. Puppy basics, obedience and behaviour fixes
                that actually hold up in the real world.
              </p>
              <div className="pawacademy-hero-actions">
                <QuoteLink className="pawacademy-btn pawacademy-btn-lime">
                  Get a Free Quote
                  <ArrowRight size={18} aria-hidden="true" />
                </QuoteLink>
                <a className="pawacademy-btn pawacademy-btn-ghost" href={TEL_HREF}>
                  <Phone size={18} aria-hidden="true" />
                  {TEL_TEXT}
                </a>
              </div>
              <ul className="pawacademy-stats">
                <li className="pawacademy-chip"><strong>98%</strong><span>Pass rate</span></li>
                <li className="pawacademy-chip"><strong>500+</strong><span>Graduates</span></li>
                <li className="pawacademy-chip"><strong>4</strong><span>Training levels</span></li>
              </ul>
            </div>
            <div className="pawacademy-hero-media">
              <div className="pawacademy-frame">
                <img
                  src={HERO_IMG}
                  alt="Focused dog training with a handler on an outdoor field"
                />
                <span className="pawacademy-hero-badge">
                  <Medal size={16} aria-hidden="true" />
                  Certified Coaches
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
                Four tracks, one goal: a dog you can take anywhere. Every
                program starts with a free assessment call.
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
                Dogs climb four graded levels. Each one ends with an
                assessment day — and a medal for the collar.
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
              <h2 className="pawacademy-hd">Why Handlers Choose Us</h2>
              <p>
                Sporty structure, science-based methods and zero shortcuts —
                that's how 500+ dogs made the grade.
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
              <h2 className="pawacademy-hd">Ready For A Better-Behaved Dog?</h2>
              <p>Tell us about your dog — quotes are free and zero pressure.</p>
            </div>
            <div className="pawacademy-band-actions">
              <QuoteLink className="pawacademy-btn pawacademy-btn-navy">
                Get a Free Quote
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
                alt="Happy graduate dog posing proudly after completing training"
                loading="lazy"
              />
            </div>
            <div>
              <div className="pawacademy-sec-head">
                <hr className="pawacademy-rule" />
                <h2 className="pawacademy-hd">Fresh Off The Grad Wall</h2>
              </div>
              <blockquote className="pawacademy-quote">
                <span
                  className="pawacademy-stars"
                  role="img"
                  aria-label="Rated 5 out of 5 stars"
                >
                  {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} />)}
                </span>
                <p>
                  "Biscuit went from dragging me down the street to a Level 3
                  off-lead recall in ten weeks. The graded levels kept us both
                  motivated."
                </p>
                <footer>— Priya M., Champion-level graduate</footer>
              </blockquote>
              <blockquote className="pawacademy-quote">
                <p>
                  "Small classes, real coaching, and homework that actually
                  works. Our rescue finally relaxes around other dogs."
                </p>
                <footer>— Daniel K., Behaviour Correction</footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="pawacademy-final">
          <div className="pawacademy-wrap">
            <h2 className="pawacademy-hd">
              Enrol Today. <em>Graduate Proud.</em>
            </h2>
            <p>
              Spots in each cohort are capped at six dogs. Grab a free quote
              or call the academy line and we'll match your dog to the right
              level.
            </p>
            <div className="pawacademy-final-actions">
              <QuoteLink className="pawacademy-btn pawacademy-btn-lime">
                Get a Free Quote
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
            Independent service provider listing
          </p>
        </div>
      </footer>
    </div>
  );
}
