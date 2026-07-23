"use client";

import { useState } from "react";
import {
  Phone, ArrowRight, CheckCircle2, ShieldCheck, Globe2, Compass, Briefcase, Home,
  Landmark, ChevronDown, FileText, Search, Send, MessageSquare, Flag, Scale, Languages, Clock3,
} from "lucide-react";
import "./visapath.css";

const QUOTE_URL = "https://example.com/quote/visapath";
const PHONE_TEL = "tel:+18775550454";
const PHONE_DISPLAY = "(877) 555-0454";

const IMG = {
  hero: "https://images.unsplash.com/photo-1581553673739-c4906b5d0de8?auto=format&fit=crop&w=1600&q=80",
  strip: "https://images.unsplash.com/photo-1532188142562-df556b861e6a?auto=format&fit=crop&w=1600&q=80",
  cardGreen: "https://images.unsplash.com/photo-1655722725332-9925c96dd627?auto=format&fit=crop&w=900&q=80",
  cardWork: "https://images.unsplash.com/photo-1454496406107-dc34337da8d6?auto=format&fit=crop&w=900&q=80",
  cardCitizen: "https://images.unsplash.com/photo-1581656702382-9ae90e68e7b7?auto=format&fit=crop&w=900&q=80",
};

function QuoteButton({ className = "visapath-btn visapath-btn-primary", children }) {
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={className}>
      {children || "Free Case Review"}
      <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}

function PathDivider() {
  return (
    <svg className="visapath-path-divider" viewBox="0 0 1200 96" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M-20 70 C 180 10, 340 88, 520 48 S 880 8, 1060 58 S 1180 80, 1240 40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="520" cy="48" r="6" fill="currentColor" />
      <circle cx="1060" cy="58" r="6" fill="currentColor" />
    </svg>
  );
}

const STEPS = [
  { icon: MessageSquare, title: "Free Case Review", text: "Share your story with an attorney and learn which paths may fit your situation." },
  { icon: Search, title: "Strategy Session", text: "Your attorney maps eligibility, documents and timing before anything is filed." },
  { icon: FileText, title: "Petition Prepared", text: "Forms, evidence and supporting letters assembled carefully and reviewed with you." },
  { icon: Send, title: "Filed & Tracked", text: "Your case is submitted to USCIS and monitored, with updates at every notice." },
  { icon: Flag, title: "Interview to Decision", text: "Thorough interview preparation and steady guidance through the final decision." },
];

const FAQS = [
  {
    q: "What happens during a free case review?",
    a: "You speak one-on-one with an immigration attorney about your goals, history and paperwork. You leave with a clear picture of the options that may apply to you and what each involves — no obligation and no pressure to sign anything.",
  },
  {
    q: "How much do immigration attorney services cost?",
    a: "Most matters are quoted as transparent flat fees, agreed in writing before work begins, so you always know the full cost up front. Government filing fees are itemized separately and explained during your review.",
  },
  {
    q: "How long does a green card or visa process take?",
    a: "Timelines vary widely by category, country of origin and current government processing volumes. During your case review, your attorney walks you through the realistic timeframes for your specific path — every case is different.",
  },
  {
    q: "Can you help if I've had a denial or complications before?",
    a: "Yes. Prior denials, lapses in status and complicated histories are common. An attorney reviews what happened, explains how it affects your options and lays out possible next steps candidly.",
  },
  {
    q: "Do you work with families and employers?",
    a: "Both. Attorneys in the network handle family-based petitions, employment sponsorship, adjustment of status and naturalization — often coordinating several family members' cases together.",
  },
];

export default function VisaPathPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="visapath-page">
      {/* ---------- Nav ---------- */}
      <header className="visapath-nav">
        <div className="visapath-wrap visapath-nav-inner">
          <a href="#top" className="visapath-brand">
            <span className="visapath-brand-mark"><Compass size={20} aria-hidden="true" /></span>
            VisaPath Immigration
          </a>
          <nav className="visapath-nav-links" aria-label="Page sections">
            <a href="#services">Services</a>
            <a href="#journey">Your Journey</a>
            <a href="#why">Why VisaPath</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="visapath-nav-actions">
            <a href={PHONE_TEL} className="visapath-phone-link">
              <Phone size={17} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
            <QuoteButton />
          </div>
        </div>
      </header>

      <main id="top">
        {/* ---------- Hero ---------- */}
        <section className="visapath-hero">
          <div className="visapath-wrap visapath-hero-grid">
            <div className="visapath-hero-copy">
              <span className="visapath-eyebrow">
                <Globe2 size={14} aria-hidden="true" /> Immigration Attorney Consultations
              </span>
              <h1>
                Your journey to America, <em>guided every step</em> of the way.
              </h1>
              <p className="visapath-hero-sub">
                Green cards, work visas and citizenship are life-changing — and the paperwork
                shouldn't stand between you and your future. Speak with a licensed immigration
                attorney who explains your options in plain language and walks the path with you.
              </p>
              <div className="visapath-hero-ctas">
                <QuoteButton />
                <a href={PHONE_TEL} className="visapath-hero-phone">
                  <span className="visapath-hero-phone-icon"><Phone size={20} aria-hidden="true" /></span>
                  <span>
                    <span className="visapath-hero-phone-num">{PHONE_DISPLAY}</span>
                    <span className="visapath-hero-phone-label">Call now — free case review</span>
                  </span>
                </a>
              </div>
              <ul className="visapath-hero-points">
                <li><CheckCircle2 size={16} aria-hidden="true" /> Free, confidential attorney case review</li>
                <li><CheckCircle2 size={16} aria-hidden="true" /> Transparent flat fees agreed in writing up front</li>
                <li><CheckCircle2 size={16} aria-hidden="true" /> Consultations available in multiple languages</li>
              </ul>
            </div>
            <div className="visapath-hero-media">
              <div className="visapath-hero-frame">
                <img
                  src={IMG.hero}
                  alt="Traveler holding a passport and travel documents, ready for the journey ahead"
                />
              </div>
              <span className="visapath-stamp visapath-stamp-1">Green Cards<small>family &amp; employment</small></span>
              <span className="visapath-stamp visapath-stamp-2">Work Visas<small>H-1B · L-1 · O-1</small></span>
              <span className="visapath-stamp visapath-stamp-3">Citizenship<small>naturalization</small></span>
            </div>
          </div>
        </section>

        {/* ---------- Trust strip ---------- */}
        <section className="visapath-trust" aria-label="Why families choose VisaPath">
          <div className="visapath-wrap visapath-trust-row">
            <div className="visapath-trust-item">
              <Scale size={26} aria-hidden="true" />
              <span><strong>Licensed attorneys</strong> for every consultation</span>
            </div>
            <div className="visapath-trust-item">
              <Languages size={26} aria-hidden="true" />
              <span><strong>Multilingual support</strong> for you and your family</span>
            </div>
            <div className="visapath-trust-item">
              <Clock3 size={26} aria-hidden="true" />
              <span><strong>Same-week reviews</strong> — evenings available</span>
            </div>
            <div className="visapath-trust-item">
              <ShieldCheck size={26} aria-hidden="true" />
              <span><strong>Confidential</strong> and pressure-free, always</span>
            </div>
          </div>
        </section>

        <PathDivider />

        {/* ---------- Services ---------- */}
        <section className="visapath-section" id="services">
          <div className="visapath-wrap">
            <div className="visapath-section-head">
              <h2>Three paths. One steady guide.</h2>
              <p>
                Whichever road brings you here, an attorney helps you understand where you stand
                and what the journey ahead looks like.
              </p>
            </div>
            <div className="visapath-cards">
              <article className="visapath-card">
                <div className="visapath-card-media">
                  <img src={IMG.cardGreen} alt="Family sharing a warm moment together at home" loading="lazy" />
                </div>
                <div className="visapath-card-body">
                  <h3><Home size={20} aria-hidden="true" /> Green Cards</h3>
                  <p>
                    Family-based and employment-based permanent residency, adjustment of status and
                    consular processing — with your documents prepared carefully and explained clearly.
                  </p>
                  <QuoteButton className="visapath-card-link">Start with a free review</QuoteButton>
                </div>
              </article>
              <article className="visapath-card">
                <div className="visapath-card-media">
                  <img src={IMG.cardWork} alt="Airplane wing above the clouds during a flight at sunrise" loading="lazy" />
                </div>
                <div className="visapath-card-body">
                  <h3><Briefcase size={20} aria-hidden="true" /> Work Visas</h3>
                  <p>
                    H-1B, L-1, O-1, TN and other employment visas for professionals and the companies
                    that sponsor them — timelines, caps and requirements laid out up front.
                  </p>
                  <QuoteButton className="visapath-card-link">Start with a free review</QuoteButton>
                </div>
              </article>
              <article className="visapath-card">
                <div className="visapath-card-media">
                  <img src={IMG.cardCitizen} alt="Person smiling with quiet confidence in warm natural light" loading="lazy" />
                </div>
                <div className="visapath-card-body">
                  <h3><Landmark size={20} aria-hidden="true" /> Citizenship</h3>
                  <p>
                    Naturalization from eligibility check to civics test preparation and your oath
                    ceremony — the final milestone of the journey, taken with a guide beside you.
                  </p>
                  <QuoteButton className="visapath-card-link">Start with a free review</QuoteButton>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- Milestone stepper ---------- */}
        <section className="visapath-section visapath-section-sand" id="journey">
          <div className="visapath-wrap">
            <div className="visapath-section-head">
              <h2>From petition to approval, milestone by milestone</h2>
              <p>A clear process means fewer surprises. Here's how the journey unfolds.</p>
            </div>
            <ol className="visapath-stepper" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <li className="visapath-step" key={step.title}>
                    <span className="visapath-step-dot"><Icon size={22} aria-hidden="true" /></span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="visapath-step-note">
              Every case is unique — steps and timelines vary by visa category and individual circumstances.
            </p>
          </div>
        </section>

        {/* ---------- Mid CTA band ---------- */}
        <section className="visapath-band">
          <div className="visapath-wrap visapath-band-inner">
            <div>
              <h2>Not sure which path fits your situation?</h2>
              <p>That's exactly what a free case review is for. Ten minutes can bring years of clarity.</p>
            </div>
            <div className="visapath-band-actions">
              <a href={PHONE_TEL} className="visapath-band-phone">
                <Phone size={22} aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
              <QuoteButton className="visapath-btn visapath-btn-sand" />
            </div>
          </div>
        </section>

        {/* ---------- Why VisaPath ---------- */}
        <section className="visapath-section" id="why">
          <div className="visapath-wrap visapath-journey">
            <div className="visapath-journey-media">
              <img
                src={IMG.strip}
                alt="Two people reviewing paperwork together across a desk in a bright office"
                loading="lazy"
              />
            </div>
            <div>
              <h2>Immigration law is complicated. Working with us isn't.</h2>
              <p style={{ color: "var(--vp-muted)" }}>
                Behind every petition is a family, a career, a future. The attorneys in the VisaPath
                network treat your case that way — with straight answers, steady communication and
                respect for what this journey means to you.
              </p>
              <ul className="visapath-journey-list">
                <li>
                  <span className="visapath-journey-ico"><FileText size={20} aria-hidden="true" /></span>
                  <div>
                    <strong>Plain-language guidance</strong>
                    <p>Your options, the trade-offs and the paperwork — explained without jargon.</p>
                  </div>
                </li>
                <li>
                  <span className="visapath-journey-ico"><ShieldCheck size={20} aria-hidden="true" /></span>
                  <div>
                    <strong>Honest assessments</strong>
                    <p>If a path is weak or risky, you'll hear it early — before you spend a dollar on it.</p>
                  </div>
                </li>
                <li>
                  <span className="visapath-journey-ico"><Compass size={20} aria-hidden="true" /></span>
                  <div>
                    <strong>One guide, start to finish</strong>
                    <p>A single point of contact who knows your file and answers when you call.</p>
                  </div>
                </li>
              </ul>
              <QuoteButton className="visapath-btn visapath-btn-outline" />
            </div>
          </div>
        </section>

        {/* ---------- Wide photo strip ---------- */}
        <div className="visapath-photostrip">
          <img
            src={IMG.hero}
            alt="Open passport resting on travel documents, the start of a new chapter"
            loading="lazy"
          />
          <p className="visapath-photostrip-caption">
            "Every great journey begins with a single, well-prepared step."
          </p>
        </div>

        {/* ---------- FAQ ---------- */}
        <section className="visapath-section visapath-section-sand" id="faq">
          <div className="visapath-wrap">
            <div className="visapath-section-head">
              <h2>Questions families ask us every day</h2>
              <p>Straight answers before you ever pick up the phone.</p>
            </div>
            <div className="visapath-faq">
              {FAQS.map((item, i) => (
                <div className="visapath-faq-item" data-open={openFaq === i} key={item.q}>
                  <button
                    type="button"
                    className="visapath-faq-q"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    {item.q}
                    <ChevronDown size={20} aria-hidden="true" />
                  </button>
                  {openFaq === i && <p className="visapath-faq-a">{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <PathDivider />

        {/* ---------- Final CTA ---------- */}
        <section className="visapath-final">
          <div className="visapath-wrap">
            <h2>Your next chapter is closer than you think.</h2>
            <p>
              Talk to a licensed immigration attorney today. The review is free, the conversation is
              confidential and the next step is entirely yours to take.
            </p>
            <div className="visapath-final-actions">
              <QuoteButton />
              <a href={PHONE_TEL} className="visapath-hero-phone">
                <span className="visapath-hero-phone-icon"><Phone size={20} aria-hidden="true" /></span>
                <span>
                  <span className="visapath-hero-phone-num">{PHONE_DISPLAY}</span>
                  <span className="visapath-hero-phone-label">Speak with someone today</span>
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="visapath-footer">
        <div className="visapath-wrap">
          <div className="visapath-footer-top">
            <a href="#top" className="visapath-brand">
              <span className="visapath-brand-mark"><Compass size={20} aria-hidden="true" /></span>
              VisaPath Immigration
            </a>
            <a href={PHONE_TEL} className="visapath-phone-link">
              <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
          </div>
          <p className="visapath-footer-disclaimer">
            Independent provider listing. Not legal advice. Prior results do not guarantee similar
            outcomes. Contacting VisaPath Immigration does not create an attorney-client relationship;
            attorney-client relationships are formed only through a signed written agreement. Free case
            reviews are provided by licensed attorneys; availability may vary by state and case type.
          </p>
          <p className="visapath-footer-copy">© {new Date().getFullYear()} VisaPath Immigration. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
