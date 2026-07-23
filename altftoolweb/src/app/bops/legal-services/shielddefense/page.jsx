"use client";

import { useState } from "react";
import {
  Shield,
  Phone,
  ArrowRight,
  Lock,
  Clock,
  Scale,
  Car,
  FileText,
  ChevronDown,
  Check,
} from "lucide-react";
import "./shielddefense.css";

const QUOTE_URL = "https://example.com/quote/shielddefense";
const PHONE_TEL = "tel:+18775550432";
const PHONE_DISPLAY = "(877) 555-0432";

const IMG = {
  hero: "https://images.unsplash.com/photo-1667849921481-9e13c239ee3d?auto=format&fit=crop&w=1600&q=80",
  dui: "https://images.unsplash.com/photo-1627397159237-d2acb7f500af?auto=format&fit=crop&w=900&q=80",
  criminal: "https://images.unsplash.com/photo-1496361945947-d0250d31222a?auto=format&fit=crop&w=900&q=80",
  records: "https://images.unsplash.com/photo-1773433392027-2dff23126d86?auto=format&fit=crop&w=900&q=80",
  split: "https://images.unsplash.com/photo-1773544015678-58d09366ad6e?auto=format&fit=crop&w=900&q=80",
  final: "https://images.unsplash.com/photo-1496361945947-d0250d31222a?auto=format&fit=crop&w=1600&q=80",
};

const FAQS = [
  {
    q: "Is the case review really free and confidential?",
    a: "Yes. The initial consultation costs nothing and carries no obligation. What you share is treated as confidential from the first conversation, whether or not you decide to move forward.",
  },
  {
    q: "Should I talk to the police before speaking with an attorney?",
    a: "You have the right to remain silent and the right to counsel. Most defense attorneys advise speaking with a lawyer before giving any statement, so you understand your position first.",
  },
  {
    q: "How quickly can I speak with someone?",
    a: "The line is answered 24 hours a day, 7 days a week. Arrests and charges do not keep business hours, and early decisions in a case often matter most.",
  },
  {
    q: "What will representation cost?",
    a: "Fee structures vary by case type and are explained clearly before you commit to anything. The case review itself is free, and you will know the terms up front.",
  },
];

function FaqItem({ item, index, open, onToggle }) {
  return (
    <div className="shielddef-faq-item">
      <button
        type="button"
        className="shielddef-faq-q"
        aria-expanded={open}
        aria-controls={`shielddef-faq-panel-${index}`}
        onClick={onToggle}
      >
        {item.q}
        <ChevronDown size={20} aria-hidden="true" />
      </button>
      {open && (
        <div id={`shielddef-faq-panel-${index}`} className="shielddef-faq-a" role="region">
          <p>{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function ShieldDefensePage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="shielddef-page">
      <header className="shielddef-nav">
        <div className="shielddef-nav-inner">
          <a href="#shielddef-top" className="shielddef-brand" aria-label="Shield Defense home">
            <Shield size={26} strokeWidth={1.5} aria-hidden="true" />
            <span className="shielddef-brand-name">Shield Defense</span>
          </a>
          <div className="shielddef-nav-actions">
            <a href={PHONE_TEL} className="shielddef-nav-phone">
              <Phone size={17} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              href={QUOTE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="shielddef-btn shielddef-btn-solid"
            >
              Free Case Review
            </a>
          </div>
        </div>
      </header>

      <main id="shielddef-top">
        <section className="shielddef-hero">
          <div className="shielddef-hero-media" aria-hidden="true">
            <img src={IMG.hero} alt="" />
          </div>
          <div className="shielddef-hero-inner">
            <p className="shielddef-kicker">Criminal &amp; DUI Defense</p>
            <h1>
              Charged? <em>Every hour counts.</em>
            </h1>
            <p className="shielddef-hero-sub">
              A charge is not a conviction. Speak confidentially with an experienced
              defense attorney who will explain where you stand, protect your rights,
              and map the road ahead — before you say a word to anyone else.
            </p>
            <div className="shielddef-hero-ctas">
              <a
                href={QUOTE_URL}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="shielddef-btn shielddef-btn-solid"
              >
                Free Case Review <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a href={PHONE_TEL} className="shielddef-phone-lg">
                <Phone size={22} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        <div className="shielddef-strip" role="note">
          <div className="shielddef-strip-inner">
            <span className="shielddef-strip-item">
              <Lock size={15} aria-hidden="true" /> Confidential
            </span>
            <span className="shielddef-strip-item">
              <Clock size={15} aria-hidden="true" /> Answered 24/7
            </span>
            <span className="shielddef-strip-item">
              <Scale size={15} aria-hidden="true" /> Free Case Review
            </span>
          </div>
        </div>

        <section className="shielddef-section">
          <div className="shielddef-wrap">
            <p className="shielddef-kicker">Practice Areas</p>
            <h2 className="shielddef-h2">Serious charges deserve a serious defense.</h2>
            <p className="shielddef-lede">
              From a first DUI to felony allegations, the attorneys in this network focus
              on criminal defense — and on making sure every fact, procedure, and right
              in your case gets examined.
            </p>
            <div className="shielddef-cards">
              <article className="shielddef-card">
                <div className="shielddef-card-media">
                  <img src={IMG.dui} alt="Car keys and a glass on a bar counter at night" loading="lazy" />
                </div>
                <div className="shielddef-card-body">
                  <h3>
                    <Car size={18} aria-hidden="true" /> DUI / DWI
                  </h3>
                  <p>
                    License suspension, breath and blood testing, first offenses and
                    repeat charges. Deadlines to contest a suspension can be days, not
                    weeks — timing matters.
                  </p>
                </div>
              </article>
              <article className="shielddef-card">
                <div className="shielddef-card-media">
                  <img src={IMG.criminal} alt="Columns of a stone courthouse facade" loading="lazy" />
                </div>
                <div className="shielddef-card-body">
                  <h3>
                    <Scale size={18} aria-hidden="true" /> Criminal Charges
                  </h3>
                  <p>
                    Misdemeanors and felonies: assault, theft, drug offenses, weapons
                    charges and more. Understand the allegations and your options before
                    your first court date.
                  </p>
                </div>
              </article>
              <article className="shielddef-card">
                <div className="shielddef-card-media">
                  <img src={IMG.records} alt="Stacked legal case files and documents" loading="lazy" />
                </div>
                <div className="shielddef-card-body">
                  <h3>
                    <FileText size={18} aria-hidden="true" /> Records &amp; Expungement
                  </h3>
                  <p>
                    A past case can follow you into jobs, housing and licensing. Learn
                    whether sealing or expungement may be available for your record.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="shielddef-section shielddef-section-alt">
          <div className="shielddef-wrap">
            <p className="shielddef-kicker">How It Works</p>
            <h2 className="shielddef-h2">Three quiet steps. No pressure.</h2>
            <p className="shielddef-lede">
              You stay in control at every stage. Nothing is filed, shared or decided
              until you choose to move forward.
            </p>
            <div className="shielddef-steps">
              <div className="shielddef-step">
                <p className="shielddef-step-num" aria-hidden="true">01</p>
                <h3>Reach Out</h3>
                <p>
                  Call {PHONE_DISPLAY} any hour, or request a free case review online.
                  The conversation is confidential from the start.
                </p>
              </div>
              <div className="shielddef-step">
                <p className="shielddef-step-num" aria-hidden="true">02</p>
                <h3>Case Review</h3>
                <p>
                  A defense attorney reviews the charge, the evidence and the timeline,
                  then explains your position in plain language.
                </p>
              </div>
              <div className="shielddef-step">
                <p className="shielddef-step-num" aria-hidden="true">03</p>
                <h3>Decide Freely</h3>
                <p>
                  You get clear next steps and transparent fee terms. Whether you hire
                  counsel is entirely your call.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="shielddef-midcta">
          <h2 className="shielddef-h2">The sooner counsel is involved, the more options stay open.</h2>
          <p>
            Evidence fades, deadlines pass, and early statements are hard to take back.
            A brief, confidential conversation now can clarify everything.
          </p>
          <div className="shielddef-midcta-actions">
            <a
              href={QUOTE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="shielddef-btn shielddef-btn-solid"
            >
              Free Case Review <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href={PHONE_TEL} className="shielddef-phone-lg">
              <Phone size={22} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <section className="shielddef-section">
          <div className="shielddef-wrap">
            <div className="shielddef-split">
              <div>
                <p className="shielddef-kicker">Why Shield Defense</p>
                <h2 className="shielddef-h2">Discretion first. Preparation always.</h2>
                <ul className="shielddef-list">
                  <li>
                    <Check size={18} aria-hidden="true" />
                    <span>
                      <strong>Confidential by default.</strong> Your situation is
                      discussed with counsel — no one else.
                    </span>
                  </li>
                  <li>
                    <Check size={18} aria-hidden="true" />
                    <span>
                      <strong>Defense-focused attorneys.</strong> Lawyers who work in
                      criminal and DUI defense, familiar with local courts and procedure.
                    </span>
                  </li>
                  <li>
                    <Check size={18} aria-hidden="true" />
                    <span>
                      <strong>Transparent fees.</strong> Terms explained up front before
                      you commit to anything.
                    </span>
                  </li>
                  <li>
                    <Check size={18} aria-hidden="true" />
                    <span>
                      <strong>Answered around the clock.</strong> Nights, weekends,
                      holidays — the line is staffed 24/7.
                    </span>
                  </li>
                </ul>
                <a
                  href={QUOTE_URL}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="shielddef-btn shielddef-btn-ghost"
                >
                  Start a Free Case Review <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
              <div className="shielddef-split-media">
                <img
                  src={IMG.split}
                  alt="Attorney reviewing case documents at a desk"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="shielddef-section shielddef-section-alt">
          <div className="shielddef-wrap">
            <p className="shielddef-kicker">Questions</p>
            <h2 className="shielddef-h2">Asked quietly, answered plainly.</h2>
            <div className="shielddef-faq">
              {FAQS.map((item, i) => (
                <FaqItem
                  key={item.q}
                  item={item}
                  index={i}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="shielddef-final">
          <div className="shielddef-final-media" aria-hidden="true">
            <img src={IMG.final} alt="" loading="lazy" />
          </div>
          <div className="shielddef-final-inner">
            <h2>One confidential call can change how tomorrow looks.</h2>
            <p>
              Speak with a defense attorney now. Free case review, no obligation,
              answered 24/7.
            </p>
            <div className="shielddef-final-actions">
              <a
                href={QUOTE_URL}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="shielddef-btn shielddef-btn-solid"
              >
                Free Case Review <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a href={PHONE_TEL} className="shielddef-phone-lg">
                <Phone size={24} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="shielddef-footer">
        <div className="shielddef-wrap">
          <div className="shielddef-footer-top">
            <a href="#shielddef-top" className="shielddef-brand" aria-label="Back to top">
              <Shield size={22} strokeWidth={1.5} aria-hidden="true" />
              <span className="shielddef-brand-name">Shield Defense</span>
            </a>
            <a href={PHONE_TEL} className="shielddef-nav-phone">
              <Phone size={16} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
          </div>
          <p className="shielddef-footer-disc">
            Independent provider listing. Not legal advice. Prior results do not
            guarantee similar outcomes. Contacting this listing does not create an
            attorney-client relationship until an engagement is signed.
          </p>
          <p className="shielddef-footer-copy">
            &copy; {new Date().getFullYear()} Shield Defense. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
