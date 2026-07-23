"use client";

import { useState } from "react";
import {
  Phone,
  HeartHandshake,
  ArrowRight,
  Check,
  ChevronDown,
  Scale,
  Users,
  Home,
  ShieldCheck,
  MessageCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import "./familyfirst-law.css";

const QUOTE_URL = "https://example.com/quote/familyfirst-law";
const PHONE_DISPLAY = "(877) 555-0443";
const PHONE_TEL = "tel:+18775550443";

const IMG = {
  hero: "https://images.unsplash.com/photo-1780733064275-d1ade9b83a3d?auto=format&fit=crop&w=1600&q=80",
  divorce: "https://images.unsplash.com/photo-1758519289200-384c7ef2d163?auto=format&fit=crop&w=900&q=80",
  custody: "https://images.unsplash.com/photo-1573496267526-08a69e46a409?auto=format&fit=crop&w=900&q=80",
  support: "https://images.unsplash.com/photo-1562564055-71e051d33c19?auto=format&fit=crop&w=900&q=80",
  why: "https://images.unsplash.com/photo-1642522029691-029b5a432954?auto=format&fit=crop&w=900&q=80",
};

const STEPS = [
  {
    title: "A calm first conversation",
    copy: "Your free case review is a listening session, not a sales pitch. Tell us what is happening, at your own pace.",
  },
  {
    title: "A plan in plain language",
    copy: "We walk you through your options, likely timelines and costs — no jargon, no pressure to decide on the spot.",
  },
  {
    title: "Steady guidance at each step",
    copy: "Filings, negotiations, mediation or court dates: you always know what comes next and who to call.",
  },
  {
    title: "Your family, moving forward",
    copy: "We aim for resolutions you can live with long after the paperwork is done — especially where children are involved.",
  },
];

const FAQS = [
  {
    q: "What happens during the free case review?",
    a: "A family lawyer listens to your situation, asks a few gentle questions and explains the paths available to you. It is confidential, there is no obligation, and you decide if and when to take the next step.",
  },
  {
    q: "How much does a family lawyer cost?",
    a: "Fees depend on how contested your matter is. Many matters are handled on flat fees or clear hourly rates explained up front, and flexible payment plans are often available. You will see the numbers before you commit to anything.",
  },
  {
    q: "Do I need a lawyer if my split is amicable?",
    a: "Often a light touch is enough — reviewing an agreement, preparing filings correctly, or mediating one sticking point. A short consultation helps you avoid paperwork mistakes that are costly to unwind later.",
  },
  {
    q: "How is child custody decided?",
    a: "Courts focus on the best interests of the child — stability, caregiving history and each parent's circumstances. A lawyer helps you present your role as a parent clearly and pursue a workable parenting plan.",
  },
  {
    q: "How long does a divorce take?",
    a: "Uncontested matters can conclude in a few months; contested ones take longer. In your case review we will give you an honest read on your likely timeline rather than a one-size-fits-all answer.",
  },
];

function CtaButton({ children, light }) {
  return (
    <a
      className={light ? "famfirst-btn famfirst-btn-light" : "famfirst-btn"}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

export default function FamilyFirstLawPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="famfirst-page">
      <header className="famfirst-nav">
        <div className="famfirst-nav-inner">
          <a className="famfirst-brand" href="#top">
            <span className="famfirst-brand-mark" aria-hidden="true">
              <HeartHandshake size={20} />
            </span>
            FamilyFirst Legal
          </a>
          <nav className="famfirst-nav-links" aria-label="Page sections">
            <a href="#practice">How we help</a>
            <a href="#expect">What to expect</a>
            <a href="#why">Why us</a>
            <a href="#faq">Questions</a>
          </nav>
          <a className="famfirst-nav-phone" href={PHONE_TEL}>
            <Phone size={17} aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
          <CtaButton>Free Case Review</CtaButton>
        </div>
      </header>

      <main id="top">
        <section className="famfirst-hero">
          <div className="famfirst-wrap famfirst-hero-grid">
            <div className="famfirst-hero-copy">
              <span className="famfirst-eyebrow">
                <Sparkles size={15} aria-hidden="true" />
                Family law · Divorce · Custody
              </span>
              <h1>Steady hands for unsteady times.</h1>
              <p className="famfirst-hero-sub">
                Divorce, custody and support touch everything you care about. Before you sign anything or
                agree to anything, talk it through with a family lawyer who listens first and explains
                everything in plain language.
              </p>
              <div className="famfirst-hero-ctas">
                <CtaButton>Free Case Review</CtaButton>
                <a className="famfirst-call-block" href={PHONE_TEL}>
                  <span className="famfirst-call-label">Or call us directly</span>
                  <span className="famfirst-call-number">
                    <Phone size={19} aria-hidden="true" />
                    {PHONE_DISPLAY}
                  </span>
                </a>
              </div>
              <ul className="famfirst-hero-notes">
                <li><Check size={16} aria-hidden="true" /> Confidential, no-obligation review</li>
                <li><Check size={16} aria-hidden="true" /> Evening and weekend consultations</li>
                <li><Check size={16} aria-hidden="true" /> Clear fees explained up front</li>
              </ul>
            </div>
            <figure className="famfirst-hero-figure">
              <img
                className="famfirst-hero-img"
                src={IMG.hero}
                alt="A family lawyer in a warm consultation with a client at a sunlit table"
              />
              <figcaption className="famfirst-hero-card">
                <MessageCircle size={26} aria-hidden="true" />
                <span>
                  <strong>Listening comes first</strong>
                  <span>Every matter starts with an unhurried conversation.</span>
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="famfirst-section famfirst-section-alt" id="practice">
          <div className="famfirst-wrap">
            <div className="famfirst-section-head">
              <span className="famfirst-eyebrow">How we help</span>
              <h2>Support for every chapter of a family matter</h2>
              <p>
                Whether your separation is amicable or complicated, you deserve counsel that keeps things
                as calm — and as fair — as possible.
              </p>
            </div>
            <div className="famfirst-cards">
              <article className="famfirst-card">
                <div className="famfirst-card-imgwrap">
                  <img
                    src={IMG.divorce}
                    alt="Two people reviewing separation paperwork together with an advisor"
                    loading="lazy"
                  />
                </div>
                <div className="famfirst-card-body">
                  <h3><Scale size={20} aria-hidden="true" /> Divorce &amp; separation</h3>
                  <p>From uncontested filings to complex disputes, handled with discretion and care.</p>
                  <ul className="famfirst-card-list">
                    <li><Check size={15} aria-hidden="true" /> Uncontested &amp; contested divorce</li>
                    <li><Check size={15} aria-hidden="true" /> Separation agreements</li>
                    <li><Check size={15} aria-hidden="true" /> Mediation-friendly approach</li>
                  </ul>
                </div>
              </article>
              <article className="famfirst-card">
                <div className="famfirst-card-imgwrap">
                  <img
                    src={IMG.custody}
                    alt="A parent and child spending relaxed time together at home"
                    loading="lazy"
                  />
                </div>
                <div className="famfirst-card-body">
                  <h3><Users size={20} aria-hidden="true" /> Custody &amp; parenting plans</h3>
                  <p>Workable arrangements that put your children&rsquo;s stability at the centre.</p>
                  <ul className="famfirst-card-list">
                    <li><Check size={15} aria-hidden="true" /> Custody &amp; visitation</li>
                    <li><Check size={15} aria-hidden="true" /> Parenting plan modifications</li>
                    <li><Check size={15} aria-hidden="true" /> Relocation questions</li>
                  </ul>
                </div>
              </article>
              <article className="famfirst-card">
                <div className="famfirst-card-imgwrap">
                  <img
                    src={IMG.support}
                    alt="A lawyer explaining documents to a client across a desk"
                    loading="lazy"
                  />
                </div>
                <div className="famfirst-card-body">
                  <h3><Home size={20} aria-hidden="true" /> Support &amp; property</h3>
                  <p>Clear-eyed guidance on the financial side, so nothing important is overlooked.</p>
                  <ul className="famfirst-card-list">
                    <li><Check size={15} aria-hidden="true" /> Child &amp; spousal support</li>
                    <li><Check size={15} aria-hidden="true" /> Division of property &amp; debt</li>
                    <li><Check size={15} aria-hidden="true" /> Agreement reviews</li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="famfirst-section" id="expect">
          <div className="famfirst-wrap">
            <div className="famfirst-section-head">
              <span className="famfirst-eyebrow">What to expect</span>
              <h2>A gentle, predictable path forward</h2>
              <p>No surprises, no pressure. Here is how working with a FamilyFirst lawyer unfolds.</p>
            </div>
            <ol className="famfirst-steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {STEPS.map((step, i) => (
                <li className="famfirst-step" key={step.title}>
                  <span className="famfirst-step-num" aria-hidden="true">{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="famfirst-section" style={{ paddingTop: 0 }}>
          <div className="famfirst-wrap">
            <div className="famfirst-band">
              <div>
                <h2>Not sure where to start? Start with a conversation.</h2>
                <p>
                  Ten minutes on the phone can bring more clarity than weeks of worrying. Calls are
                  confidential and carry no obligation.
                </p>
              </div>
              <div className="famfirst-band-actions">
                <a className="famfirst-band-phone" href={PHONE_TEL}>
                  <Phone size={24} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
                <CtaButton light>Free Case Review</CtaButton>
              </div>
            </div>
          </div>
        </section>

        <section className="famfirst-section famfirst-section-alt" id="why">
          <div className="famfirst-wrap famfirst-split">
            <img
              className="famfirst-split-img"
              src={IMG.why}
              alt="A calm, welcoming law office meeting room with soft natural light"
              loading="lazy"
            />
            <div>
              <span className="famfirst-eyebrow">Why FamilyFirst</span>
              <h2>Counsel that lowers the temperature</h2>
              <p className="famfirst-split-lede">
                Family matters are hard enough without a combative lawyer making them harder. Our approach
                is steady, practical and centred on the people involved — especially the smallest ones.
              </p>
              <ul className="famfirst-why-list">
                <li>
                  <span className="famfirst-why-icon"><ShieldCheck size={22} aria-hidden="true" /></span>
                  <span>
                    <strong>Family law is all we do</strong>
                    <span>Focused experience in divorce, custody and support matters, day in and day out.</span>
                  </span>
                </li>
                <li>
                  <span className="famfirst-why-icon"><MessageCircle size={22} aria-hidden="true" /></span>
                  <span>
                    <strong>Plain answers, honest expectations</strong>
                    <span>You will always know where things stand — including the hard parts.</span>
                  </span>
                </li>
                <li>
                  <span className="famfirst-why-icon"><Clock size={22} aria-hidden="true" /></span>
                  <span>
                    <strong>Reachable when it matters</strong>
                    <span>Evening and weekend consultations, and prompt replies while your matter is active.</span>
                  </span>
                </li>
              </ul>
              <CtaButton>Free Case Review</CtaButton>
            </div>
          </div>
        </section>

        <section className="famfirst-section" id="faq">
          <div className="famfirst-wrap">
            <div className="famfirst-section-head">
              <span className="famfirst-eyebrow">Common questions</span>
              <h2>Answers before you even ask</h2>
              <p>Gentle, honest answers to the questions we hear most often.</p>
            </div>
            <div className="famfirst-faq">
              {FAQS.map((item, i) => (
                <div className="famfirst-faq-item" key={item.q}>
                  <h3 style={{ margin: 0 }}>
                    <button
                      type="button"
                      className="famfirst-faq-q"
                      aria-expanded={openFaq === i}
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    >
                      {item.q}
                      <ChevronDown size={20} aria-hidden="true" />
                    </button>
                  </h3>
                  {openFaq === i && <p className="famfirst-faq-a">{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="famfirst-final">
          <div className="famfirst-wrap">
            <h2>When you are ready, we are here.</h2>
            <p>
              Take the first step at your own pace. A free, confidential case review with a family lawyer —
              by phone or online, whichever feels easier.
            </p>
            <div className="famfirst-final-actions">
              <a className="famfirst-final-phone" href={PHONE_TEL}>
                <Phone size={26} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
              <CtaButton light>Free Case Review</CtaButton>
            </div>
            <p className="famfirst-final-note">
              Confidential · No obligation · Where contingency or flat-fee arrangements apply, fees are
              explained clearly before you commit.
            </p>
          </div>
        </section>
      </main>

      <footer className="famfirst-footer">
        <div className="famfirst-wrap">
          <div className="famfirst-footer-inner">
            <div>
              <span className="famfirst-footer-brand">
                <HeartHandshake size={20} aria-hidden="true" />
                FamilyFirst Legal
              </span>
              <p>
                Steady, compassionate counsel for divorce, custody and support matters. Free case reviews by
                phone at <a href={PHONE_TEL}>{PHONE_DISPLAY}</a> or online, whenever you are ready.
              </p>
            </div>
            <CtaButton>Free Case Review</CtaButton>
          </div>
          <p className="famfirst-footer-legal">
            Independent provider listing. Not legal advice. Prior results do not guarantee similar outcomes.
            FamilyFirst Legal is a marketing name for participating family law professionals; availability
            varies by location. © {new Date().getFullYear()} FamilyFirst Legal.
          </p>
        </div>
      </footer>
    </div>
  );
}
