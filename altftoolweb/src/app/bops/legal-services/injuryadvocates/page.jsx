"use client";

import { useState } from "react";
import {
  Scale,
  Phone,
  ArrowRight,
  ShieldCheck,
  Clock,
  FileText,
  MessageSquare,
  Handshake,
  Car,
  HardHat,
  Stethoscope,
  CheckCircle2,
  ChevronDown,
  BadgeCheck,
  Gavel,
} from "lucide-react";
import "./injuryadvocates.css";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

const IMG = {
  heroScales:
    "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&w=1600&q=80",
  gavel:
    "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=900&q=80",
  consult:
    "https://images.unsplash.com/photo-1687289133469-b2a07a13b78b?auto=format&fit=crop&w=900&q=80",
  library:
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80",
  columns:
    "https://images.unsplash.com/photo-1706614882607-b2c9db79699f?auto=format&fit=crop&w=1600&q=80",
};

const FAQS = [
  {
    q: "How much does a case review cost?",
    a: "Nothing. Your case review is completely free, and there is no obligation to move forward. If you do proceed, injury claims are handled on a contingency-fee basis — you pay no attorney fee unless your case is won or settled.",
  },
  {
    q: "How long do I have to file a personal injury claim?",
    a: "Every state sets its own filing deadline, known as a statute of limitations, and some are as short as one year. Evidence also fades quickly after an accident, so it is wise to have your situation reviewed as soon as you are able.",
  },
  {
    q: "What should I bring to my free case review?",
    a: "Anything you have on hand helps: photos of the accident scene, medical records or bills, an accident or police report, insurance correspondence, and contact details for any witnesses. If you do not have these yet, that is fine — start with a conversation.",
  },
  {
    q: "Will my case go to trial?",
    a: "Many injury claims resolve through negotiation, but every case is different. During your review, an advocate will walk you through the possible paths for your specific situation so you always know what to expect.",
  },
];

export default function InjuryAdvocatesPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="injuryadv-page">
      {/* ---------- Nav ---------- */}
      <header className="injuryadv-nav">
        <div className="injuryadv-wrap injuryadv-nav-inner">
          <a href="#injuryadv-top" className="injuryadv-brand" aria-label="InjuryAdvocates home">
            <span className="injuryadv-scale-ring" aria-hidden="true">
              <Scale size={22} strokeWidth={1.8} />
            </span>
            <span className="injuryadv-brand-name">
              Injury<span>Advocates</span>
            </span>
          </a>
          <nav className="injuryadv-nav-links" aria-label="Primary">
            <a href="#injuryadv-practice">Practice Areas</a>
            <a href="#injuryadv-process">How It Works</a>
            <a href="#injuryadv-faq">FAQ</a>
          </nav>
          <a className="injuryadv-nav-phone" href={PHONE_TEL}>
            <Phone size={18} aria-hidden="true" />
            <span>{PHONE_DISPLAY}</span>
          </a>
          <a
            className="injuryadv-btn injuryadv-btn--gold injuryadv-btn--nav"
            href={QUOTE_URL}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            Free Case Review
          </a>
        </div>
      </header>

      <main id="injuryadv-top">
        {/* ---------- Hero ---------- */}
        <section className="injuryadv-hero">
          <div className="injuryadv-wrap injuryadv-hero-inner">
            <div>
              <p className="injuryadv-eyebrow">
                <Gavel size={15} aria-hidden="true" /> Personal Injury Advocates
              </p>
              <h1>
                Hurt in an accident that was not your fault? <em>You deserve to be heard.</em>
              </h1>
              <hr className="injuryadv-rule" />
              <p className="injuryadv-hero-sub">
                Insurance companies have adjusters and attorneys on their side. You should have an
                advocate on yours. Request a free, confidential case review today — with no fee
                unless your case is won.
              </p>
              <div className="injuryadv-hero-ctas">
                <a
                  className="injuryadv-btn injuryadv-btn--gold"
                  href={QUOTE_URL}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                >
                  Free Case Review <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a className="injuryadv-btn injuryadv-btn--outline" href={PHONE_TEL}>
                  <Phone size={18} aria-hidden="true" /> Call Now
                </a>
              </div>
              <p className="injuryadv-hero-phone">
                <a href={PHONE_TEL}>
                  {PHONE_DISPLAY}
                  <small>Available 24/7 — speak with a real person</small>
                </a>
              </p>
            </div>
            <figure className="injuryadv-hero-figure">
              <div className="injuryadv-hero-img">
                <img
                  src={IMG.heroScales}
                  alt="Scales of justice standing before law books in a courtroom setting"
                />
              </div>
              <div className="injuryadv-fee-badge">
                <BadgeCheck size={30} aria-hidden="true" />
                <span>
                  <strong>No Fee Unless You Win</strong>
                  <small>Contingency-fee representation</small>
                </span>
              </div>
            </figure>
          </div>
        </section>

        {/* ---------- Trust strip ---------- */}
        <div className="injuryadv-trust">
          <div className="injuryadv-wrap injuryadv-trust-inner">
            <span className="injuryadv-trust-item">
              <ShieldCheck size={18} aria-hidden="true" /> Free &amp; confidential review
            </span>
            <span className="injuryadv-trust-item">
              <Clock size={18} aria-hidden="true" /> Phones answered 24/7
            </span>
            <span className="injuryadv-trust-item">
              <Handshake size={18} aria-hidden="true" /> No fee unless you win
            </span>
            <span className="injuryadv-trust-item">
              <MessageSquare size={18} aria-hidden="true" /> Straight answers, plain English
            </span>
          </div>
        </div>

        {/* ---------- Practice areas ---------- */}
        <section id="injuryadv-practice" className="injuryadv-section injuryadv-marble">
          <div className="injuryadv-wrap">
            <div className="injuryadv-section-head">
              <h2>Injuries We Advocate For</h2>
              <hr className="injuryadv-rule injuryadv-rule--center" />
              <p>
                If someone else&rsquo;s negligence left you injured, your situation deserves a
                careful, honest look — whatever kind of accident it was.
              </p>
            </div>
            <div className="injuryadv-cards">
              <article className="injuryadv-card">
                <div className="injuryadv-card-img">
                  <img
                    src={IMG.gavel}
                    alt="Judge's gavel resting on a desk in a law office"
                    loading="lazy"
                  />
                </div>
                <div className="injuryadv-card-body">
                  <h3>Vehicle Accidents</h3>
                  <p>
                    Car, truck, motorcycle, rideshare and pedestrian collisions — including claims
                    involving uninsured or underinsured drivers.
                  </p>
                  <ul className="injuryadv-card-tags">
                    <li>
                      <Car size={13} aria-hidden="true" /> Auto &amp; truck
                    </li>
                    <li>
                      <CheckCircle2 size={13} aria-hidden="true" /> Rideshare
                    </li>
                  </ul>
                </div>
              </article>
              <article className="injuryadv-card">
                <div className="injuryadv-card-img">
                  <img
                    src={IMG.consult}
                    alt="Attorney reviewing case documents with a client during a consultation"
                    loading="lazy"
                  />
                </div>
                <div className="injuryadv-card-body">
                  <h3>Workplace &amp; Premises Injuries</h3>
                  <p>
                    Construction-site accidents, unsafe property conditions, slip-and-fall injuries
                    and third-party liability claims.
                  </p>
                  <ul className="injuryadv-card-tags">
                    <li>
                      <HardHat size={13} aria-hidden="true" /> Job site
                    </li>
                    <li>
                      <CheckCircle2 size={13} aria-hidden="true" /> Slip &amp; fall
                    </li>
                  </ul>
                </div>
              </article>
              <article className="injuryadv-card">
                <div className="injuryadv-card-img">
                  <img
                    src={IMG.library}
                    alt="Rows of legal volumes lining the shelves of a law library"
                    loading="lazy"
                  />
                </div>
                <div className="injuryadv-card-body">
                  <h3>Medical &amp; Serious Injury Claims</h3>
                  <p>
                    Medical negligence, defective products and catastrophic injuries that change
                    what everyday life looks like.
                  </p>
                  <ul className="injuryadv-card-tags">
                    <li>
                      <Stethoscope size={13} aria-hidden="true" /> Negligence
                    </li>
                    <li>
                      <CheckCircle2 size={13} aria-hidden="true" /> Product liability
                    </li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- 3-step process ---------- */}
        <section id="injuryadv-process" className="injuryadv-section injuryadv-steps">
          <div className="injuryadv-wrap">
            <div className="injuryadv-section-head">
              <h2>How Your Claim Works</h2>
              <hr className="injuryadv-rule injuryadv-rule--center" />
              <p>Three clear steps — and you are informed at every one of them.</p>
            </div>
            <div className="injuryadv-steps-grid">
              <div className="injuryadv-step">
                <span className="injuryadv-step-num" aria-hidden="true">
                  01
                </span>
                <h3>Tell Us What Happened</h3>
                <p>
                  Call or request your free case review. Share your story in plain terms — no legal
                  jargon required, and everything stays confidential.
                </p>
              </div>
              <div className="injuryadv-step">
                <span className="injuryadv-step-num" aria-hidden="true">
                  02
                </span>
                <h3>We Review &amp; Investigate</h3>
                <p>
                  An advocate evaluates your claim, gathers records and evidence, and explains your
                  options honestly — including whether a claim makes sense at all.
                </p>
              </div>
              <div className="injuryadv-step">
                <span className="injuryadv-step-num" aria-hidden="true">
                  03
                </span>
                <h3>We Pursue Your Claim</h3>
                <p>
                  Your advocate deals with the insurers and paperwork while you focus on recovery.
                  You pay no attorney fee unless your case is won or settled.
                </p>
              </div>
            </div>
            <div className="injuryadv-steps-cta">
              <a
                className="injuryadv-btn injuryadv-btn--gold"
                href={QUOTE_URL}
                target="_blank"
                rel="sponsored noopener noreferrer"
              >
                Start My Free Case Review <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="injuryadv-final-phone" href={PHONE_TEL}>
                <Phone size={22} aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        {/* ---------- Why choose ---------- */}
        <section className="injuryadv-section injuryadv-marble">
          <div className="injuryadv-wrap injuryadv-split">
            <div className="injuryadv-split-img">
              <img
                src={IMG.columns}
                alt="Classical stone columns of a courthouse facade in warm light"
                loading="lazy"
              />
            </div>
            <div>
              <h2>Steady Counsel When It Matters Most</h2>
              <hr className="injuryadv-rule" />
              <ul className="injuryadv-why-list">
                <li>
                  <ShieldCheck size={22} aria-hidden="true" />
                  <span>
                    <strong>You risk nothing to ask</strong>
                    <p>
                      The review is free and the fee is contingent — if there is no recovery, you
                      owe no attorney fee.
                    </p>
                  </span>
                </li>
                <li>
                  <FileText size={22} aria-hidden="true" />
                  <span>
                    <strong>Honest assessments, not sales pitches</strong>
                    <p>
                      If your claim is weak, you will hear it plainly. If it is strong, you will
                      understand exactly why.
                    </p>
                  </span>
                </li>
                <li>
                  <MessageSquare size={22} aria-hidden="true" />
                  <span>
                    <strong>You are kept in the loop</strong>
                    <p>
                      Regular updates in plain English, and a real person on the phone when you have
                      questions — day or night.
                    </p>
                  </span>
                </li>
                <li>
                  <Handshake size={22} aria-hidden="true" />
                  <span>
                    <strong>Your decisions stay yours</strong>
                    <p>
                      Advocates advise; you decide. No settlement is accepted without your
                      go-ahead.
                    </p>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section id="injuryadv-faq" className="injuryadv-section">
          <div className="injuryadv-wrap">
            <div className="injuryadv-section-head">
              <h2>Questions People Ask First</h2>
              <hr className="injuryadv-rule injuryadv-rule--center" />
            </div>
            <div className="injuryadv-faq">
              {FAQS.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={item.q}
                    className={`injuryadv-faq-item${open ? " injuryadv-faq-item--open" : ""}`}
                  >
                    <button
                      type="button"
                      className="injuryadv-faq-q"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : i)}
                    >
                      {item.q}
                      <ChevronDown size={20} aria-hidden="true" />
                    </button>
                    {open && (
                      <div className="injuryadv-faq-a">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="injuryadv-section injuryadv-final">
          <div className="injuryadv-wrap">
            <div className="injuryadv-final-ring" aria-hidden="true">
              <Scale size={32} strokeWidth={1.8} />
            </div>
            <h2>The Review Is Free. The Clock Is Not.</h2>
            <p>
              Filing deadlines apply to every injury claim, and evidence fades fast. Find out where
              you stand today — confidentially, and at no cost.
            </p>
            <div className="injuryadv-final-ctas">
              <a
                className="injuryadv-btn injuryadv-btn--gold"
                href={QUOTE_URL}
                target="_blank"
                rel="sponsored noopener noreferrer"
              >
                Free Case Review <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="injuryadv-final-phone" href={PHONE_TEL}>
                <Phone size={24} aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="injuryadv-footer">
        <div className="injuryadv-wrap">
          <div className="injuryadv-footer-top">
            <span className="injuryadv-brand">
              <span className="injuryadv-scale-ring" aria-hidden="true">
                <Scale size={20} strokeWidth={1.8} />
              </span>
              <span className="injuryadv-brand-name">
                Injury<span>Advocates</span>
              </span>
            </span>
            <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          </div>
          <p className="injuryadv-footer-disclaimer">
            Independent provider listing. Not legal advice. Prior results do not guarantee similar
            outcomes. Case reviews are provided free of charge and create no obligation.
            Contingency-fee arrangements mean no attorney fee is charged unless a recovery is made;
            court costs and case expenses may apply depending on the arrangement. InjuryAdvocates
            is a fictional brand presented for directory demonstration purposes.
          </p>
          <p>&copy; {new Date().getFullYear()} InjuryAdvocates. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
