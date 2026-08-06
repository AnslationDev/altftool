"use client";

import { useState } from "react";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Users,
  Home,
  KeyRound,
  FileText,
  BadgeCheck,
  ChevronDown,
  CheckCircle2,
  Landmark,
  Compass,
} from "lucide-react";
import "./homebridge-mortgage.css";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

const IMG = {
  hero: "https://images.unsplash.com/photo-1758523671413-cd178a883d6a?auto=format&fit=crop&w=1600&q=80",
  story: "https://images.unsplash.com/photo-1758523671819-06a0f1941520?auto=format&fit=crop&w=1600&q=80",
  card1: "https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?auto=format&fit=crop&w=900&q=80",
  card2: "https://images.unsplash.com/photo-1758523671391-c510afb87d19?auto=format&fit=crop&w=900&q=80",
  card3: "https://images.unsplash.com/photo-1758523670991-ee93bc48d81d?auto=format&fit=crop&w=900&q=80",
};

const LOANS = [
  {
    img: IMG.card1,
    alt: "Bright living room of a family home ready for new owners",
    title: "First-Time Buyer",
    desc: "A patient, step-by-step path for buyers making their very first move, with plain-English guidance at every turn.",
    points: ["Low down-payment options", "Homebuyer education included", "One advisor, start to finish"],
  },
  {
    img: IMG.card2,
    alt: "Elegant house exterior with a welcoming front entrance",
    title: "Purchase & Move-Up",
    desc: "Competitive fixed and adjustable options for growing households moving into the next chapter.",
    points: ["Fixed and adjustable terms", "Pre-approval letters, fast", "Rate-lock choices explained"],
  },
  {
    img: IMG.card3,
    alt: "Modern kitchen interior in a recently refinanced home",
    title: "Refinance",
    desc: "Review your current loan side by side with today's options and see whether a switch could make sense.",
    points: ["Clear break-even math", "Cash-out options reviewed", "No-pressure recommendations"],
  },
];

const PIERS = [
  {
    icon: FileText,
    title: "Application",
    desc: "Share your goals in one guided conversation. Your advisor maps the documents you will actually need — no scavenger hunt.",
  },
  {
    icon: BadgeCheck,
    title: "Approval",
    desc: "Underwriting with a named human on your side. We flag questions early so they never become last-minute surprises.",
  },
  {
    icon: Landmark,
    title: "Closing",
    desc: "A transparent fee sheet before you sign anything, and a closing date we treat as a promise, not a suggestion.",
  },
  {
    icon: KeyRound,
    title: "Keys",
    desc: "Move-in day, on schedule. Your advisor stays reachable after closing for servicing and payoff questions.",
  },
];

const ADVISORS = [
  {
    initials: "MR",
    name: "Maya Renwick",
    role: "Senior Loan Advisor",
    bio: "Fourteen years guiding first-time buyers. Known for turning stacks of paperwork into a single tidy checklist.",
  },
  {
    initials: "DO",
    name: "Daniel Okafor",
    role: "Refinance Specialist",
    bio: "Runs the break-even numbers before anything else. If a refinance does not help you, Daniel will say so plainly.",
  },
  {
    initials: "SL",
    name: "Sofia Lindqvist",
    role: "Closing Coordinator",
    bio: "Owns the calendar from clear-to-close to keys. Her closings run on time because her checklists run early.",
  },
];

const FAQS = [
  {
    q: "How fast can I get pre-approved?",
    a: "Many applicants receive a pre-approval decision within one to two business days once their documents are in. Your advisor will tell you exactly what is needed up front, and timelines can vary with the complexity of your finances.",
  },
  {
    q: "Will checking my options affect my credit score?",
    a: "An initial conversation and estimate can be based on the information you share. A formal application does involve a credit inquiry, and your advisor will walk you through when and why before anything is pulled.",
  },
  {
    q: "What fees should I expect?",
    a: "You receive an itemized fee sheet before you commit to anything. Typical costs include origination, appraisal and title services; the exact figures depend on your loan, property and location.",
  },
  {
    q: "Do I need a 20% down payment?",
    a: "No. Depending on the program and your qualifications, some options start with considerably less down. Your advisor will explain the trade-offs, including mortgage insurance, so you can decide with full information.",
  },
  {
    q: "Am I guaranteed to be approved?",
    a: "No lender can promise approval, and you should be cautious of any that do. All loans are subject to credit review, income verification and property appraisal. What we do promise is a clear answer, fast, with the reasons explained.",
  },
];

function CtaPair({ light }) {
  return (
    <>
      <a
        className={`homebridge-btn ${light ? "homebridge-btn-light" : "homebridge-btn-gold"}`}
        href={QUOTE_URL}
        target="_blank"
        rel="sponsored noopener noreferrer"
      >
        Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
      </a>
      <a className={light ? "homebridge-band-phone" : "homebridge-hero-phone"} href={PHONE_TEL}>
        <Phone size={17} aria-hidden="true" /> {PHONE_DISPLAY}
      </a>
    </>
  );
}

export default function HomeBridgeMortgagePage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="homebridge-page">
      <nav className="homebridge-nav" aria-label="Main navigation">
        <div className="homebridge-nav-inner">
          <a className="homebridge-brand" href="#top">
            <span className="homebridge-brand-mark" aria-hidden="true" />
            HomeBridge Mortgage
          </a>
          <ul className="homebridge-nav-links">
            <li><a href="#loans">Loan Options</a></li>
            <li><a href="#process">The Bridge</a></li>
            <li><a href="#advisors">Advisors</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="homebridge-nav-cta">
            <a className="homebridge-nav-phone" href={PHONE_TEL}>
              <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
            <a
              className="homebridge-btn homebridge-btn-gold homebridge-btn-sm"
              href={QUOTE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
            >
              Get a Free Quote
            </a>
          </div>
        </div>
      </nav>

      <header className="homebridge-hero" id="top">
        <div className="homebridge-wrap homebridge-hero-grid">
          <div className="homebridge-hero-copy">
            <span className="homebridge-eyebrow">Guided Home Loans</span>
            <h1>
              Mortgages, <em>minus the maze.</em>
            </h1>
            <p className="homebridge-hero-sub">
              One named advisor walks you from application to keys — with transparent
              fees, plain-English answers and closing dates we plan to keep. No call
              centers, no runaround, no surprises at the signing table.
            </p>
            <div className="homebridge-hero-actions">
              <CtaPair />
            </div>
          </div>
          <div className="homebridge-hero-media">
            <div className="homebridge-hero-frame">
              <img
                src={IMG.hero}
                alt="Couple standing at the doorway of their new home holding the keys"
              />
            </div>
            <aside className="homebridge-rate-card" aria-label="Illustrative rate snapshot">
              <h3>Sample Rate Snapshot</h3>
              <div className="homebridge-rate-row">
                <span>30-yr fixed</span>
                <strong>from 6.12%*</strong>
              </div>
              <div className="homebridge-rate-row">
                <span>15-yr fixed</span>
                <strong>from 5.38%*</strong>
              </div>
              <p className="homebridge-rate-note">
                *Illustrative only — not an offer. Your rate depends on credit,
                loan and property details.
              </p>
            </aside>
          </div>
        </div>
      </header>

      <div className="homebridge-arch" aria-hidden="true" />

      <section className="homebridge-section" aria-label="Why homeowners choose HomeBridge">
        <div className="homebridge-wrap">
          <div className="homebridge-stats">
            <div className="homebridge-stat">
              <Users size={26} color="#c9a24b" aria-hidden="true" />
              <strong>1 advisor</strong>
              <span>from first call to keys</span>
            </div>
            <div className="homebridge-stat">
              <Clock3 size={26} color="#c9a24b" aria-hidden="true" />
              <strong>96%</strong>
              <span>of recent closings on schedule</span>
            </div>
            <div className="homebridge-stat">
              <ShieldCheck size={26} color="#c9a24b" aria-hidden="true" />
              <strong>0 hidden fees</strong>
              <span>itemized sheet before you sign</span>
            </div>
            <div className="homebridge-stat">
              <Home size={26} color="#c9a24b" aria-hidden="true" />
              <strong>4,800+</strong>
              <span>households guided home</span>
            </div>
          </div>
        </div>
      </section>

      <section className="homebridge-section homebridge-section-deep" id="loans">
        <div className="homebridge-wrap">
          <div className="homebridge-section-head">
            <h2>Loan options for where you are heading</h2>
            <p>
              Every path is different. Your advisor helps you compare, in writing,
              before you commit to anything.
            </p>
            <hr className="homebridge-gold-rule" />
          </div>
          <div className="homebridge-card-grid">
            {LOANS.map((loan) => (
              <article className="homebridge-card" key={loan.title}>
                <div className="homebridge-card-media">
                  <img src={loan.img} alt={loan.alt} loading="lazy" />
                </div>
                <div className="homebridge-card-body">
                  <h3>{loan.title}</h3>
                  <p>{loan.desc}</p>
                  <ul className="homebridge-card-points">
                    {loan.points.map((pt) => (
                      <li key={pt}>
                        <CheckCircle2 size={16} aria-hidden="true" /> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="homebridge-section" id="process">
        <div className="homebridge-wrap">
          <div className="homebridge-section-head">
            <h2>Four piers from application to keys</h2>
            <p>
              Our bridge process keeps every step visible, so you always know what
              has happened and what comes next.
            </p>
            <hr className="homebridge-gold-rule" />
          </div>
          <ol className="homebridge-bridge">
            {PIERS.map((pier, i) => (
              <li className="homebridge-pier" key={pier.title}>
                <span className="homebridge-pier-num" aria-hidden="true">{i + 1}</span>
                <pier.icon size={26} color="#0f2a4a" aria-hidden="true" />
                <h3>{pier.title}</h3>
                <p>{pier.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="homebridge-section homebridge-section-deep" aria-label="Get a quote">
        <div className="homebridge-wrap">
          <div className="homebridge-band">
            <div>
              <h2>See your numbers, without the pressure.</h2>
              <p>
                A free quote takes minutes and comes with a real advisor's name on it.
              </p>
            </div>
            <div className="homebridge-band-actions">
              <CtaPair light />
            </div>
          </div>
        </div>
      </section>

      <section className="homebridge-section" aria-label="Our approach">
        <div className="homebridge-wrap homebridge-story">
          <div className="homebridge-story-media">
            <img
              src={IMG.story}
              alt="Family unpacking boxes together in the living room of their new house"
              loading="lazy"
            />
          </div>
          <div className="homebridge-story-copy">
            <span className="homebridge-eyebrow" style={{ color: "#c9a24b" }}>Why a Bridge?</span>
            <h2>Because the far side should never be out of sight</h2>
            <p style={{ color: "#5b6b7c" }}>
              Most mortgage stress comes from not knowing where you stand. We built
              HomeBridge around a simple idea: you should be able to see the whole
              crossing — every step, every fee, every date — from the moment you start.
            </p>
            <ul className="homebridge-story-list">
              <li>
                <Compass size={20} aria-hidden="true" />
                <span><strong>A named guide.</strong> The advisor who takes your first call is the one who hands over your keys.</span>
              </li>
              <li>
                <FileText size={20} aria-hidden="true" />
                <span><strong>Fees in writing, early.</strong> Your itemized estimate arrives before you commit, not at the closing table.</span>
              </li>
              <li>
                <Clock3 size={20} aria-hidden="true" />
                <span><strong>Dates we defend.</strong> Weekly status notes and a closing calendar your whole team works to.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="homebridge-section homebridge-section-deep" id="advisors">
        <div className="homebridge-wrap">
          <div className="homebridge-section-head">
            <h2>Meet the advisors who answer their own phones</h2>
            <p>Real people, direct lines, and calendars built around your closing date.</p>
            <hr className="homebridge-gold-rule" />
          </div>
          <div className="homebridge-advisor-grid">
            {ADVISORS.map((adv) => (
              <article className="homebridge-advisor" key={adv.name}>
                <span className="homebridge-advisor-avatar" aria-hidden="true">{adv.initials}</span>
                <h3>{adv.name}</h3>
                <p className="homebridge-advisor-role">{adv.role}</p>
                <p>{adv.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="homebridge-section" id="faq">
        <div className="homebridge-wrap">
          <div className="homebridge-section-head">
            <h2>Questions, answered plainly</h2>
            <p>If yours is not here, one call gets you a straight answer.</p>
            <hr className="homebridge-gold-rule" />
          </div>
          <div className="homebridge-faq">
            {FAQS.map((item, i) => (
              <div className="homebridge-faq-item" key={item.q}>
                <button
                  type="button"
                  className="homebridge-faq-q"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  {item.q}
                  <ChevronDown size={20} aria-hidden="true" />
                </button>
                {openFaq === i && <p className="homebridge-faq-a">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="homebridge-section" aria-label="Final call to action">
        <div className="homebridge-wrap">
          <div className="homebridge-band">
            <div>
              <h2>Ready to cross? Your advisor is ready to guide.</h2>
              <p>
                Get a free, no-obligation quote today — or talk it through with a
                human first.
              </p>
            </div>
            <div className="homebridge-band-actions">
              <CtaPair light />
            </div>
          </div>
        </div>
      </section>

      <footer className="homebridge-footer">
        <div className="homebridge-wrap">
          <div className="homebridge-footer-grid">
            <a className="homebridge-brand" href="#top">
              <span className="homebridge-brand-mark" aria-hidden="true" />
              HomeBridge Mortgage
            </a>
            <ul className="homebridge-footer-links">
              <li><a href="#loans">Loan Options</a></li>
              <li><a href="#process">The Bridge</a></li>
              <li><a href="#advisors">Advisors</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
            <a className="homebridge-footer-phone" href={PHONE_TEL}>
              <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
          </div>
          <p className="homebridge-footer-legal">
            HomeBridge Mortgage is a fictional brand presented for directory listing
            purposes. All loans are subject to credit approval, income verification
            and property appraisal; approval is never guaranteed. Sample rates shown
            are illustrative only and do not constitute an offer to lend. Program
            terms and availability vary by location and applicant profile.
          </p>
          <p className="homebridge-footer-legal">
            Independent provider listing. Not financial or insurance advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
