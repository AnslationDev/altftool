"use client";

import { useState } from "react";
import {
  Clock,
  Phone,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Scale,
  ShieldCheck,
  FileText,
  Camera,
  ClipboardList,
  Stethoscope,
  MicOff,
  Siren,
  Timer,
  Gavel,
  BadgeCheck,
} from "lucide-react";
import "./crashclaim.css";

const QUOTE_URL = "https://example.com/quote/crashclaim";
const PHONE_DISPLAY = "(877) 555-0421";
const PHONE_TEL = "tel:+18775550421";

const CHECKLIST = [
  {
    icon: Siren,
    title: "Get to safety and call 911",
    text: "Move out of traffic if you can, check on passengers, and request police and medical response. The official report matters later.",
  },
  {
    icon: Camera,
    title: "Photograph everything",
    text: "Vehicles, plates, skid marks, signals, weather, and your visible injuries. Scene evidence disappears fast — your phone preserves it.",
  },
  {
    icon: ClipboardList,
    title: "Exchange information",
    text: "Driver's license, insurance, and contact details for every driver — plus names and numbers of any witnesses nearby.",
  },
  {
    icon: Stethoscope,
    title: "See a doctor promptly",
    text: "Some crash injuries surface days later. Early medical records connect your injuries to the collision and protect your claim.",
  },
  {
    icon: MicOff,
    title: "Decline recorded statements",
    text: "You must report the crash to your insurer, but you are not required to give the other side a recorded statement. Politely decline.",
  },
  {
    icon: PhoneCall,
    title: "Call CrashClaim Law",
    text: "Before you accept any offer, get a free review of your claim. We respond within 24 hours, and the consultation costs nothing.",
  },
];

const CASES = [
  {
    img: "https://images.unsplash.com/photo-1767793817785-822767f6941d?auto=format&fit=crop&w=900&q=80",
    alt: "Damaged car at an intersection after a traffic collision",
    title: "Rear-end and intersection crashes",
    text: "Distracted drivers, red-light runners, and failure-to-yield collisions — the most common crashes, and the ones insurers move fastest to minimize.",
  },
  {
    img: "https://images.unsplash.com/photo-1767310621246-b4efebd6ba88?auto=format&fit=crop&w=900&q=80",
    alt: "Commercial truck traveling on a highway",
    title: "Commercial and rideshare vehicles",
    text: "Trucks, delivery vans, and rideshare crashes involve layered insurance policies. Sorting out who pays takes experienced counsel.",
  },
  {
    img: "https://images.unsplash.com/photo-1714875153033-8e2aabb469ae?auto=format&fit=crop&w=900&q=80",
    alt: "Night road scene with vehicle headlights in motion",
    title: "Hit-and-run and uninsured drivers",
    text: "Even when the at-fault driver flees or carries no coverage, your own policy may still hold options worth reviewing.",
  },
];

const STEPS = [
  {
    time: "Hour 0",
    icon: PhoneCall,
    title: "You reach out",
    text: "Call or request your free review online. Tell us what happened in your own words — no paperwork, no obligation.",
  },
  {
    time: "By hour 12",
    icon: FileText,
    title: "An attorney reviews your claim",
    text: "A licensed car-accident attorney examines the facts: fault, coverage, injuries, and the insurer's likely playbook.",
  },
  {
    time: "Within 24 hours",
    icon: Timer,
    title: "You get clear next steps",
    text: "We call you back with a straight assessment of your options — whether that means representation or simple guidance.",
  },
];

const FAQS = [
  {
    q: "How much does a case review cost?",
    a: "Nothing. The claim review is completely free, and if we take your case we work on contingency — no fee unless we win. You never pay out of pocket to get started.",
  },
  {
    q: "How long do I have to file a claim?",
    a: "Every state sets its own filing deadline (statute of limitations), often two to three years — but evidence and witness memories fade much sooner. The earlier your claim is reviewed, the more options stay open.",
  },
  {
    q: "The insurer already made me an offer. Should I take it?",
    a: "Do not sign anything until your claim has been reviewed. First offers are frequently calculated before the full extent of your injuries and losses is known. A free review costs you nothing and takes one call.",
  },
  {
    q: "Will my case go to court?",
    a: "Many claims resolve through negotiation, but every case is different. If a fair resolution is not offered, we prepare each case as if it will be tried — and we will explain your options at every stage.",
  },
  {
    q: "What if I was partly at fault?",
    a: "Partial fault does not automatically end a claim. Most states allow recovery that is adjusted for your share of responsibility. It is exactly the kind of question a free review is built to answer.",
  },
];

function CtaButtons({ ghostPhone }) {
  return (
    <div className="crashclaim-hero-ctas">
      <a
        className="crashclaim-btn"
        href={QUOTE_URL}
        target="_blank"
        rel="sponsored noopener noreferrer"
      >
        Free Case Review <ArrowRight size={18} aria-hidden="true" />
      </a>
      <a
        className={ghostPhone ? "crashclaim-btn crashclaim-btn--ghost" : "crashclaim-phone-link"}
        href={PHONE_TEL}
      >
        <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
      </a>
    </div>
  );
}

export default function CrashClaimPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="crashclaim-page">
      {/* Nav */}
      <header className="crashclaim-nav">
        <div className="crashclaim-nav-inner">
          <a className="crashclaim-logo" href="#top" aria-label="CrashClaim Law home">
            <span className="crashclaim-logo-badge">
              <Clock size={20} aria-hidden="true" />
            </span>
            <span className="crashclaim-logo-name">
              Crash<span>Claim</span> Law
            </span>
          </a>
          <nav className="crashclaim-nav-links" aria-label="Page sections">
            <a href="#checklist">After a Crash</a>
            <a href="#cases">Cases We Handle</a>
            <a href="#process">24-Hour Review</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a className="crashclaim-phone-link crashclaim-nav-phone" href={PHONE_TEL}>
            <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
          </a>
          <a
            className="crashclaim-btn"
            href={QUOTE_URL}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            Free Case Review
          </a>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="crashclaim-hero">
          <div className="crashclaim-hero-grid">
            <div>
              <span className="crashclaim-kicker">
                <Timer size={15} aria-hidden="true" /> Free claim review — response within 24 hours
              </span>
              <h1>
                Crashed? The insurer already has a lawyer. <em>Now you do too.</em>
              </h1>
              <p className="crashclaim-hero-sub">
                After a car accident, the clock starts running — on evidence, on deadlines, and on
                the insurance company's playbook. Get your claim reviewed by a car-accident attorney
                before you sign anything.
              </p>
              <ul className="crashclaim-hero-points">
                <li>
                  <CheckCircle2 size={18} aria-hidden="true" /> Free, no-obligation claim review
                </li>
                <li>
                  <CheckCircle2 size={18} aria-hidden="true" /> No fee unless we win — contingency only
                </li>
                <li>
                  <CheckCircle2 size={18} aria-hidden="true" /> A response from our team within 24 hours
                </li>
              </ul>
              <CtaButtons ghostPhone />
            </div>
            <figure className="crashclaim-hero-figure">
              <div className="crashclaim-hero-img">
                <img
                  src="https://images.unsplash.com/photo-1762012762479-a106ec46363c?auto=format&fit=crop&w=1600&q=80"
                  alt="Attorney reviewing accident claim documents at a desk"
                />
              </div>
              <div className="crashclaim-clock-badge">
                <Clock size={30} aria-hidden="true" />
                <div>
                  <div className="crashclaim-clock-num">24 HRS</div>
                  <div className="crashclaim-clock-label">Review response time</div>
                </div>
              </div>
            </figure>
          </div>
          <div className="crashclaim-hazard" aria-hidden="true" />
        </section>

        {/* Stats */}
        <section className="crashclaim-stats" aria-label="Firm highlights">
          <div className="crashclaim-stats-grid">
            <div className="crashclaim-stat">
              <strong>24 hrs</strong>
              <span>Claim review response</span>
            </div>
            <div className="crashclaim-stat">
              <strong>$0</strong>
              <span>Upfront — no fee unless we win</span>
            </div>
            <div className="crashclaim-stat">
              <strong>25+ yrs</strong>
              <span>Combined attorney experience</span>
            </div>
            <div className="crashclaim-stat">
              <strong>1,000s</strong>
              <span>Of claims reviewed</span>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="crashclaim-section" id="checklist">
          <div className="crashclaim-wrap">
            <div className="crashclaim-section-head">
              <span className="crashclaim-eyebrow">Keep this list</span>
              <h2>What to do after a crash</h2>
              <p>
                The minutes and days after a collision shape everything that follows. Six steps that
                protect your health — and your claim.
              </p>
            </div>
            <ol className="crashclaim-checklist" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {CHECKLIST.map((item, i) => (
                <li className="crashclaim-check-item" key={item.title}>
                  <span className="crashclaim-check-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Cases */}
        <section className="crashclaim-section crashclaim-section--tint" id="cases">
          <div className="crashclaim-wrap">
            <div className="crashclaim-section-head">
              <span className="crashclaim-eyebrow">Practice focus</span>
              <h2>Cases we handle</h2>
              <p>
                CrashClaim Law focuses on one thing: car-accident injury claims. That focus is the
                point.
              </p>
            </div>
            <div className="crashclaim-cards">
              {CASES.map((c) => (
                <article className="crashclaim-card" key={c.title}>
                  <div className="crashclaim-card-img">
                    <img src={c.img} alt={c.alt} loading="lazy" />
                  </div>
                  <div className="crashclaim-card-body">
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-page CTA band */}
        <div className="crashclaim-hazard" aria-hidden="true" />
        <section className="crashclaim-band" aria-label="Call for a free review">
          <div className="crashclaim-band-inner">
            <div>
              <h2>Talking to us is free. Waiting is not.</h2>
              <p>
                Evidence fades and deadlines run. One call starts your free claim review — an
                attorney responds within 24 hours.
              </p>
            </div>
            <div className="crashclaim-band-actions">
              <a className="crashclaim-phone-link crashclaim-band-phone" href={PHONE_TEL}>
                <PhoneCall size={24} aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
              <a
                className="crashclaim-btn"
                href={QUOTE_URL}
                target="_blank"
                rel="sponsored noopener noreferrer"
              >
                Free Case Review <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
        <div className="crashclaim-hazard" aria-hidden="true" />

        {/* 24-hour process */}
        <section className="crashclaim-section" id="process">
          <div className="crashclaim-wrap">
            <div className="crashclaim-section-head">
              <span className="crashclaim-eyebrow">The 24-hour review</span>
              <h2>From first call to clear answers in one day</h2>
            </div>
            <div className="crashclaim-steps">
              {STEPS.map((s) => (
                <div className="crashclaim-step" key={s.time}>
                  <span className="crashclaim-step-time">
                    <s.icon size={18} aria-hidden="true" /> {s.time}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="crashclaim-section crashclaim-section--tint">
          <div className="crashclaim-wrap crashclaim-split">
            <div className="crashclaim-split-img">
              <img
                src="https://images.unsplash.com/photo-1738346229456-3718abb7da96?auto=format&fit=crop&w=900&q=80"
                alt="Legal team discussing a client case around a conference table"
                loading="lazy"
              />
            </div>
            <div>
              <span className="crashclaim-eyebrow">Why CrashClaim Law</span>
              <h2 style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.4rem)" }}>
                Steady counsel when the pressure is on
              </h2>
              <ul className="crashclaim-why-list">
                <li>
                  <span className="crashclaim-why-icon">
                    <Scale size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>Car accidents only</h3>
                    <p>
                      We do not dabble. Our attorneys handle motor-vehicle injury claims every day,
                      against the same insurers, on the same issues.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="crashclaim-why-icon">
                    <ShieldCheck size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>You pay nothing upfront</h3>
                    <p>
                      Contingency representation means our fee comes only from a recovery. No fee
                      unless we win — that is the arrangement, in writing.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="crashclaim-why-icon">
                    <Gavel size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>Prepared for trial from day one</h3>
                    <p>
                      Insurers track which firms actually try cases. Every claim we accept is built
                      as if a jury will see it.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="crashclaim-why-icon">
                    <BadgeCheck size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>Straight answers, fast</h3>
                    <p>
                      Within 24 hours you will know where your claim stands and what your options
                      are — even if the honest answer is that you do not need a lawyer.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="crashclaim-section" id="faq">
          <div className="crashclaim-wrap">
            <div className="crashclaim-section-head" style={{ margin: "0 auto 44px", textAlign: "center", maxWidth: "640px" }}>
              <span className="crashclaim-eyebrow">Questions</span>
              <h2>Before you call</h2>
            </div>
            <div className="crashclaim-faq">
              {FAQS.map((f, i) => (
                <div className="crashclaim-faq-item" data-open={openFaq === i} key={f.q}>
                  <button
                    type="button"
                    className="crashclaim-faq-q"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    {f.q}
                    <ChevronDown size={20} aria-hidden="true" />
                  </button>
                  {openFaq === i && <div className="crashclaim-faq-a">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="crashclaim-hazard" aria-hidden="true" />
        <section className="crashclaim-band" aria-label="Start your free case review">
          <div className="crashclaim-band-inner">
            <div>
              <h2>Your free case review starts now</h2>
              <p>
                No cost. No obligation. No fee unless we win. Call {PHONE_DISPLAY} or request your
                review online — an attorney responds within 24 hours.
              </p>
            </div>
            <CtaButtons ghostPhone />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="crashclaim-footer">
        <div className="crashclaim-wrap">
          <div className="crashclaim-footer-top">
            <a className="crashclaim-logo" href="#top" aria-label="Back to top">
              <span className="crashclaim-logo-badge">
                <Clock size={20} aria-hidden="true" />
              </span>
              <span className="crashclaim-logo-name">
                Crash<span>Claim</span> Law
              </span>
            </a>
            <a className="crashclaim-phone-link" href={PHONE_TEL}>
              <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
          </div>
          <p className="crashclaim-footer-disclaimer">
            Independent provider listing. Not legal advice. Prior results do not guarantee similar
            outcomes. CrashClaim Law is a fictional brand presented for directory purposes.
            Contacting this firm does not create an attorney-client relationship. Free case review
            refers to an initial consultation at no charge; contingency fees and case costs are
            explained before any engagement. &copy; {new Date().getFullYear()} CrashClaim Law. All
            rights reserved.
          </p>
        </div>
      </footer>

      {/* Sticky call bar */}
      <div className="crashclaim-callbar" role="complementary" aria-label="Quick contact">
        <div className="crashclaim-callbar-inner">
          <span className="crashclaim-callbar-label">
            <Timer size={18} aria-hidden="true" /> Free review — 24-hour response
          </span>
          <a className="crashclaim-phone-link crashclaim-callbar-phone" href={PHONE_TEL}>
            <PhoneCall size={22} aria-hidden="true" /> {PHONE_DISPLAY}
          </a>
          <a
            className="crashclaim-btn"
            href={QUOTE_URL}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            Free Case Review
          </a>
        </div>
      </div>
    </div>
  );
}
