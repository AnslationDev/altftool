"use client";

import { useState } from "react";
import {
  Leaf,
  Phone,
  ShieldCheck,
  Sprout,
  PawPrint,
  Bug,
  Home,
  SearchCheck,
  Recycle,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import "./greenguard-pest.css";

const QUOTE_URL = "#demo-only";
const PHONE_DISPLAY = "Demo only";
const PHONE_TEL = "#demo-only";

const IMG = {
  hero: "https://images.unsplash.com/photo-1724556295094-62d093eddd87?auto=format&fit=crop&w=1600&q=80",
  garden: "https://images.unsplash.com/photo-1684867430779-e66e779a19b7?auto=format&fit=crop&w=900&q=80",
  home: "https://images.unsplash.com/photo-1769927954927-13ffa6b7756c?auto=format&fit=crop&w=900&q=80",
  family: "https://images.unsplash.com/photo-1780328868147-3ea01594b692?auto=format&fit=crop&w=900&q=80",
  tech: "https://images.unsplash.com/photo-1759496607068-f2892afdaf23?auto=format&fit=crop&w=900&q=80",
};

const services = [
  {
    icon: Bug,
    title: "General Pest Defense",
    body: "Quarterly perimeter treatments using botanical, plant-derived formulas that target ants, roaches, spiders and earwigs where they nest.",
  },
  {
    icon: Home,
    title: "Exclusion & Sealing",
    body: "We hunt down entry points first — gaps, vents, weep holes — and seal them, so fewer treatments are needed in the first place.",
  },
  {
    icon: Sprout,
    title: "Garden-Safe Barriers",
    body: "Bed and lawn perimeter care designed to leave pollinators, beds and edible gardens undisturbed while pests stay out.",
  },
];

const steps = [
  {
    title: "Walk-through inspection",
    body: "A licensed technician inspects your home inside and out, mapping activity, entry points and moisture sources before recommending anything.",
  },
  {
    title: "Seal-first plan",
    body: "We prioritize physical exclusion — sealing and screening — then apply targeted plant-based treatments only where they're actually needed.",
  },
  {
    title: "Seasonal follow-up",
    body: "Scheduled visits refresh barriers as seasons change, with clear reports on what was done and what we found each time.",
  },
];

const faqs = [
  {
    q: "Are plant-based treatments actually effective?",
    a: "For most common household pests, yes — botanical formulas paired with exclusion work are effective for typical ant, spider and roach pressure. Severe infestations may call for additional targeted methods, which your technician will discuss openly before any work begins.",
  },
  {
    q: "Is it safe for my pets and kids?",
    a: "Our default products are chosen for reduced toxicity, and technicians follow re-entry guidance for each formula — typically a short drying window. We'll walk you through exactly what's applied and where before treating.",
  },
  {
    q: "Do I have to sign a long contract?",
    a: "No. Plans are offered on a recurring seasonal basis, but you can request one-time service and cancel recurring plans without early-termination penalties.",
  },
  {
    q: "What pests do you not handle?",
    a: "We're upfront about limits: large wildlife removal and fumigation-level termite jobs are referred to specialty partners. Ask during your free quote and we'll tell you honestly whether we're the right fit.",
  },
];

function QuoteButton({ big, ghost, children }) {
  return (
    <a
      className={`greenguard-btn ${ghost ? "greenguard-btn--ghost" : "greenguard-btn--solid"}${big ? " greenguard-btn--big" : ""}`}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children || "Get a Free Quote"}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

function PhoneLink() {
  return (
    <a className="greenguard-nav-phone" href={PHONE_TEL}>
      <Phone size={17} aria-hidden="true" />
      <span>{PHONE_DISPLAY}</span>
    </a>
  );
}

export default function GreenGuardPestPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="greenguard-page">
      {/* NAV */}
      <header className="greenguard-nav">
        <div className="greenguard-wrap greenguard-nav-inner">
          <div className="greenguard-logo">
            <span className="greenguard-logo-mark">
              <Leaf size={20} aria-hidden="true" />
            </span>
            GreenGuard Exterminators
          </div>
          <div className="greenguard-nav-actions">
            <PhoneLink />
            <QuoteButton />
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="greenguard-hero">
          <span className="greenguard-leaf greenguard-leaf--tl" aria-hidden="true" />
          <span className="greenguard-leaf greenguard-leaf--br greenguard-leaf--sm" aria-hidden="true" />
          <div className="greenguard-wrap greenguard-hero-grid">
            <div>
              <span className="greenguard-eyebrow">
                <Sprout size={15} aria-hidden="true" /> Eco-first pest control
              </span>
              <h1>
                Pests out. <em>Chemicals down.</em> Home protected.
              </h1>
              <p>
                GreenGuard starts with sealing pests out, not spraying everything
                in sight. Plant-based treatments, honest inspections, and
                seasonal barriers that respect your family, pets and garden.
              </p>
              <div className="greenguard-hero-ctas">
                <QuoteButton big />
                <a className="greenguard-btn greenguard-btn--ghost greenguard-btn--big" href={PHONE_TEL}>
                  <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
              <p className="greenguard-hero-note">
                Free quotes. No obligation. Licensed &amp; insured technicians.
              </p>
            </div>
            <div className="greenguard-photo-frame">
              <span className="greenguard-badge greenguard-badge--a">
                <Sprout size={13} aria-hidden="true" /> Plant-based
              </span>
              <span className="greenguard-badge greenguard-badge--b">
                <PawPrint size={13} aria-hidden="true" /> Pet-safe options
              </span>
              <div className="greenguard-photo">
                <img
                  src={IMG.hero}
                  alt="Sunlit home exterior surrounded by healthy green landscaping"
                />
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <div className="greenguard-strip">
          <div className="greenguard-wrap greenguard-strip-inner">
            <span className="greenguard-strip-item">
              <ShieldCheck size={18} aria-hidden="true" /> Licensed &amp; insured
            </span>
            <span className="greenguard-strip-item">
              <Recycle size={18} aria-hidden="true" /> Reduced-toxicity formulas
            </span>
            <span className="greenguard-strip-item">
              <SearchCheck size={18} aria-hidden="true" /> Inspection before treatment
            </span>
            <span className="greenguard-strip-item">
              <Leaf size={18} aria-hidden="true" /> Pollinator-conscious methods
            </span>
          </div>
        </div>

        {/* SERVICES */}
        <section className="greenguard-section">
          <span className="greenguard-leaf greenguard-leaf--br" aria-hidden="true" />
          <div className="greenguard-wrap">
            <p className="greenguard-kicker">What we do</p>
            <h2>Protection that starts with prevention</h2>
            <p className="greenguard-section-lead">
              Most pest problems are entry problems. Our exclusion-first approach
              means fewer treatments, better results, and a lighter footprint on
              your home and yard.
            </p>
            <div className="greenguard-cards">
              {services.map(({ icon: Icon, title, body }) => (
                <article className="greenguard-card" key={title}>
                  <span className="greenguard-card-icon">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SPLIT FEATURES */}
        <section className="greenguard-section greenguard-section--paper">
          <span className="greenguard-leaf greenguard-leaf--tl greenguard-leaf--sm" aria-hidden="true" />
          <div className="greenguard-wrap">
            <div className="greenguard-split">
              <div className="greenguard-split-copy">
                <p className="greenguard-kicker">Why plant-based</p>
                <h3>Botanical formulas your garden can live with</h3>
                <p>
                  Our default treatments are derived from plant oils and
                  minerals, selected for effectiveness against common household
                  pests while reducing exposure risks for the things you care
                  about most.
                </p>
                <ul className="greenguard-checklist">
                  <li>
                    <CheckCircle2 size={19} aria-hidden="true" />
                    Reduced-toxicity products chosen by default, not on request
                  </li>
                  <li>
                    <CheckCircle2 size={19} aria-hidden="true" />
                    Clear re-entry guidance for kids and pets after every visit
                  </li>
                  <li>
                    <CheckCircle2 size={19} aria-hidden="true" />
                    Applications kept away from blooms and pollinator paths
                  </li>
                </ul>
              </div>
              <div className="greenguard-split-media">
                <div className="greenguard-photo-frame greenguard-photo-frame--flip">
                  <span className="greenguard-badge greenguard-badge--a">
                    <Leaf size={13} aria-hidden="true" /> Garden-friendly
                  </span>
                  <div className="greenguard-photo">
                    <img
                      src={IMG.garden}
                      alt="Close-up of thriving green plants in a well-kept garden bed"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="greenguard-split greenguard-split--rev">
              <div className="greenguard-split-media">
                <div className="greenguard-photo-frame">
                  <span className="greenguard-badge greenguard-badge--b">
                    <Home size={13} aria-hidden="true" /> Seal-first
                  </span>
                  <div className="greenguard-photo">
                    <img
                      src={IMG.home}
                      alt="Well-maintained residential home exterior with tidy siding and trim"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
              <div className="greenguard-split-copy">
                <p className="greenguard-kicker">Exclusion first</p>
                <h3>We seal the door before we set the guard</h3>
                <p>
                  Spraying alone treats symptoms. GreenGuard technicians map how
                  pests are getting in — foundation gaps, utility penetrations,
                  torn screens — and close those routes as the first line of
                  defense.
                </p>
                <ul className="greenguard-checklist">
                  <li>
                    <CheckCircle2 size={19} aria-hidden="true" />
                    Documented entry-point map with photos after inspection
                  </li>
                  <li>
                    <CheckCircle2 size={19} aria-hidden="true" />
                    Sealing, screening and door-sweep work included in plans
                  </li>
                  <li>
                    <CheckCircle2 size={19} aria-hidden="true" />
                    Treatments applied only where activity is confirmed
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* MID CTA */}
        <section className="greenguard-section">
          <div className="greenguard-wrap">
            <div className="greenguard-midcta">
              <span className="greenguard-leaf greenguard-leaf--tl" aria-hidden="true" />
              <span className="greenguard-leaf greenguard-leaf--br greenguard-leaf--sm" aria-hidden="true" />
              <div>
                <h2>Curious what greener pest control costs?</h2>
                <p>Get a straightforward quote for your home — no pressure, no obligation.</p>
              </div>
              <div className="greenguard-midcta-actions">
                <QuoteButton big />
                <a className="greenguard-nav-phone" href={PHONE_TEL}>
                  <Phone size={17} aria-hidden="true" />
                  <span>{PHONE_DISPLAY}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="greenguard-section greenguard-section--deep">
          <span className="greenguard-leaf greenguard-leaf--br" aria-hidden="true" />
          <div className="greenguard-wrap">
            <p className="greenguard-kicker">How it works</p>
            <h2>Three visits from bugged to guarded</h2>
            <p className="greenguard-section-lead">
              A simple, transparent process — you'll know what we found, what we
              did, and what to expect next, every single time.
            </p>
            <div className="greenguard-steps">
              {steps.map(({ title, body }) => (
                <article className="greenguard-step" key={title}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAMILY / REASSURANCE */}
        <section className="greenguard-section">
          <div className="greenguard-wrap">
            <div className="greenguard-split">
              <div className="greenguard-split-copy">
                <p className="greenguard-kicker">Peace of mind</p>
                <h3>A home that feels good to come back to</h3>
                <p>
                  Pest control shouldn't mean clearing the house for a day or
                  worrying about what's on the baseboards. Our technicians
                  explain every product used, and most treatments allow normal
                  activity after a short drying period.
                </p>
                <ul className="greenguard-checklist">
                  <li>
                    <CheckCircle2 size={19} aria-hidden="true" />
                    Written service report after every visit
                  </li>
                  <li>
                    <CheckCircle2 size={19} aria-hidden="true" />
                    Free re-service between visits if covered pests return
                  </li>
                  <li>
                    <CheckCircle2 size={19} aria-hidden="true" />
                    No long-term contracts — cancel recurring plans anytime
                  </li>
                </ul>
              </div>
              <div className="greenguard-split-media">
                <div className="greenguard-photo-frame greenguard-photo-frame--flip">
                  <span className="greenguard-badge greenguard-badge--a">
                    <PawPrint size={13} aria-hidden="true" /> Pet-safe options
                  </span>
                  <div className="greenguard-photo">
                    <img
                      src={IMG.family}
                      alt="Bright, comfortable living space inside a family home"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="greenguard-section greenguard-section--paper">
          <span className="greenguard-leaf greenguard-leaf--tl greenguard-leaf--sm" aria-hidden="true" />
          <div className="greenguard-wrap">
            <p className="greenguard-kicker">Straight answers</p>
            <h2>Frequently asked questions</h2>
            <div className="greenguard-faq">
              {faqs.map(({ q, a }, i) => {
                const open = openFaq === i;
                return (
                  <div
                    className={`greenguard-faq-item${open ? " greenguard-faq-item--open" : ""}`}
                    key={q}
                  >
                    <button
                      type="button"
                      className="greenguard-faq-q"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : i)}
                    >
                      {q}
                      <ChevronDown size={19} aria-hidden="true" />
                    </button>
                    {open && <p className="greenguard-faq-a">{a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="greenguard-final">
          <span className="greenguard-leaf greenguard-leaf--tl" aria-hidden="true" />
          <span className="greenguard-leaf greenguard-leaf--br" aria-hidden="true" />
          <div className="greenguard-wrap">
            <h2>Ready for a greener kind of guard?</h2>
            <p>
              Tell us about your pest problem and get a free, honest quote —
              we'll let you know exactly what we can handle and how we'd do it.
            </p>
            <div className="greenguard-final-actions">
              <QuoteButton big />
              <a className="greenguard-btn greenguard-btn--ghost greenguard-btn--big" href={PHONE_TEL}>
                <Phone size={18} aria-hidden="true" /> Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="greenguard-footer">
        <div className="greenguard-wrap greenguard-footer-inner">
          <span>
            © {new Date().getFullYear()} GreenGuard Exterminators. All rights reserved.
          </span>
          <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          <span className="greenguard-footer-note">Independent service provider listing</span>
        </div>
      </footer>
    </div>
  );
}
