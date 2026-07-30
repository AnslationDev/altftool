"use client";

import { useState } from "react";
import {
  PawPrint,
  Phone,
  HeartPulse,
  Stethoscope,
  Zap,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ShieldCheck,
  Smile,
} from "lucide-react";
import DemoBrandNotice from "../_components/DemoBrandNotice";
import "./pawcover.css";

const QUOTE_URL = "https://example.com/quote/pawcover";
const PHONE_DISPLAY = "(866) 555-0345";
const PHONE_TEL = "tel:+18665550345";

const IMG = {
  hero: "https://images.unsplash.com/photo-1613915588863-e6cc05fcaa16?auto=format&fit=crop&w=1600&q=80",
  cat: "https://images.unsplash.com/photo-1570824104629-1817c91f7d1d?auto=format&fit=crop&w=900&q=80",
  pup: "https://images.unsplash.com/photo-1736128081617-b468f8bf7920?auto=format&fit=crop&w=900&q=80",
  buddy: "https://images.unsplash.com/photo-1650903177650-6abbb380abaa?auto=format&fit=crop&w=900&q=80",
  friend: "https://images.unsplash.com/photo-1570117267998-63272030c1c3?auto=format&fit=crop&w=900&q=80",
};

const FAQS = [
  {
    q: "What does a PawCover plan typically include?",
    a: "Plans are built around accident and illness care — think broken bones, swallowed socks, infections, and chronic conditions that develop after enrollment. Exact coverage, limits, and waiting periods vary by plan and state, so review your policy documents for details.",
  },
  {
    q: "How fast are reimbursements?",
    a: "Most complete claims are processed within days, and many customers see reimbursement in under a week with direct deposit. Timing can vary depending on claim complexity and the records your vet provides.",
  },
  {
    q: "Can I keep my current vet?",
    a: "Yes. PawCover plans are designed to work with any licensed veterinarian, emergency hospital, or specialist in the U.S. You pay the vet, submit the invoice, and get reimbursed for covered care.",
  },
  {
    q: "Are pre-existing conditions covered?",
    a: "Like most pet insurance, conditions that showed symptoms before enrollment or during a waiting period generally are not covered. Enrolling while your pet is young and healthy usually means broader protection and lower premiums.",
  },
];

function QuoteButton({ ghost, small, children }) {
  const cls = [
    "pawcover-btn",
    ghost ? "pawcover-btn--ghost" : "",
    small ? "pawcover-btn--sm" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={cls}>
      <PawPrint size={18} aria-hidden="true" />
      {children || "Get a Free Quote"}
    </a>
  );
}

function PhoneLink({ label }) {
  return (
    <a href={PHONE_TEL} className="pawcover-phone">
      <Phone size={17} aria-hidden="true" />
      <span>{label || PHONE_DISPLAY}</span>
    </a>
  );
}

function PawStamp({ style }) {
  return (
    <span className="pawcover-paw-stamp" style={style} aria-hidden="true">
      <PawPrint style={{ width: "100%", height: "100%" }} />
    </span>
  );
}

function Polaroid({ src, alt, caption, left, eager }) {
  return (
    <figure className={left ? "pawcover-polaroid pawcover-polaroid--left" : "pawcover-polaroid"} style={{ margin: 0 }}>
      <div className="pawcover-polaroid-img">
        <img src={src} alt={alt} loading={eager ? undefined : "lazy"} />
      </div>
      <figcaption className="pawcover-polaroid-caption">{caption}</figcaption>
    </figure>
  );
}

export default function PawCoverPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="pawcover-root">
      <header className="pawcover-nav">
        <div className="pawcover-wrap pawcover-nav-inner">
          <a href="#pawcover-top" className="pawcover-logo">
            <span className="pawcover-logo-badge">
              <PawPrint size={22} aria-hidden="true" />
            </span>
            PawCover
          </a>
          <nav aria-label="Main">
            <ul className="pawcover-nav-links">
              <li><a href="#pawcover-coverage">Coverage</a></li>
              <li><a href="#pawcover-how">How It Works</a></li>
              <li><a href="#pawcover-rates">Sample Rates</a></li>
              <li><a href="#pawcover-faq">FAQ</a></li>
            </ul>
          </nav>
          <div className="pawcover-nav-cta">
            <PhoneLink />
            <QuoteButton small>Free Quote</QuoteButton>
          </div>
        </div>
      </header>

      <main id="pawcover-top">
        <DemoBrandNotice brand="PawCover" />

        <section className="pawcover-hero">
          <PawStamp style={{ top: 30, left: "4%", width: 54, height: 54, transform: "rotate(-18deg)" }} />
          <PawStamp style={{ bottom: 40, right: "6%", width: 70, height: 70, transform: "rotate(14deg)" }} />
          <PawStamp style={{ top: "48%", left: "46%", width: 38, height: 38, transform: "rotate(30deg)" }} />
          <div className="pawcover-wrap pawcover-hero-grid">
            <div>
              <span className="pawcover-kicker">Dogs &amp; cats, all breeds welcome to apply</span>
              <h1>
                Vet bills happen. <em>Panic doesn&apos;t have to.</em>
              </h1>
              <p className="pawcover-hero-sub">
                PawCover keeps pet insurance simple: accident and illness plans with plain-English
                terms, no surprise exclusions buried in fine print, and reimbursements that
                typically land within days — not weeks.
              </p>
              <div className="pawcover-hero-ctas">
                <QuoteButton>Get a Free Quote</QuoteButton>
                <PhoneLink label={`Call ${PHONE_DISPLAY}`} />
              </div>
              <ul className="pawcover-hero-points">
                <li><CheckCircle2 size={17} aria-hidden="true" /> Use any licensed U.S. vet</li>
                <li><CheckCircle2 size={17} aria-hidden="true" /> Up to 90% reimbursement options</li>
                <li><CheckCircle2 size={17} aria-hidden="true" /> Cancel anytime</li>
              </ul>
            </div>
            <div className="pawcover-hero-photo">
              <Polaroid
                src={IMG.hero}
                alt="Happy golden-coated dog looking up with bright eyes"
                caption="Milo, insured &amp; muddy since 2024"
                eager
              />
            </div>
          </div>
        </section>

        <section className="pawcover-section pawcover-section--tint" id="pawcover-coverage">
          <div className="pawcover-wrap">
            <div className="pawcover-section-head">
              <h2>Coverage that actually covers</h2>
              <p>
                One straightforward accident + illness plan, with optional extras. Here&apos;s the
                kind of care PawCover plans are built for.
              </p>
            </div>
            <div className="pawcover-cards">
              <article className="pawcover-card">
                <span className="pawcover-card-icon"><Zap size={26} aria-hidden="true" /></span>
                <h3>Accidents</h3>
                <p>
                  Swallowed toys, torn ligaments, bite wounds, broken bones — emergency exams,
                  surgery, and hospitalization for covered injuries.
                </p>
              </article>
              <article className="pawcover-card">
                <span className="pawcover-card-icon"><Stethoscope size={26} aria-hidden="true" /></span>
                <h3>Illnesses</h3>
                <p>
                  From ear infections to cancer care: diagnostics, prescriptions, specialist
                  visits, and ongoing treatment for eligible conditions that arise after enrollment.
                </p>
              </article>
              <article className="pawcover-card">
                <span className="pawcover-card-icon"><HeartPulse size={26} aria-hidden="true" /></span>
                <h3>Fast Reimbursement</h3>
                <p>
                  Snap a photo of your vet invoice, submit in the app, and most complete claims are
                  reimbursed by direct deposit within days.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="pawcover-section" id="pawcover-how">
          <div className="pawcover-wrap">
            <div className="pawcover-section-head">
              <h2>How it works — three easy steps</h2>
              <p>No jargon, no runaround. Just a simple path from quote to covered.</p>
            </div>
            <div className="pawcover-steps">
              <article className="pawcover-step">
                <span className="pawcover-step-num" aria-hidden="true">1</span>
                <h3>Check your rate</h3>
                <p>
                  Tap &ldquo;Get a Free Quote&rdquo; and answer a few quick questions about your pet
                  on the secure quote site. It takes about two minutes.
                </p>
              </article>
              <article className="pawcover-step">
                <span className="pawcover-step-num" aria-hidden="true">2</span>
                <h3>Pick your plan</h3>
                <p>
                  Choose your deductible, reimbursement level, and annual limit. Adjust until the
                  monthly price feels right for your budget.
                </p>
              </article>
              <article className="pawcover-step">
                <span className="pawcover-step-num" aria-hidden="true">3</span>
                <h3>Visit any vet</h3>
                <p>
                  Keep the vet you love. Pay the bill, snap the invoice, and get reimbursed for
                  covered care — usually within days.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="pawcover-section pawcover-section--tint">
          <div className="pawcover-wrap">
            <div className="pawcover-section-head">
              <h2>Meet the PawCover pack</h2>
              <p>Real-life goofballs, chaos gremlins, and couch potatoes — all part of the family.</p>
            </div>
            <div className="pawcover-gallery">
              <Polaroid
                src={IMG.cat}
                alt="Tabby cat lounging comfortably and gazing at the camera"
                caption="Biscuit — professional napper"
                left
              />
              <Polaroid
                src={IMG.pup}
                alt="Small dog with perked ears sitting attentively"
                caption="Pepper — sock enthusiast"
              />
              <Polaroid
                src={IMG.buddy}
                alt="Playful dog outdoors enjoying the fresh air"
                caption="Waffles — zoomies champion"
                left
              />
              <Polaroid
                src={IMG.friend}
                alt="Curious dog resting its head and watching calmly"
                caption="Noodle — treat negotiator"
              />
            </div>
          </div>
        </section>

        <section className="pawcover-section" id="pawcover-rates">
          <PawStamp style={{ top: 24, right: "8%", width: 60, height: 60, transform: "rotate(-12deg)" }} />
          <div className="pawcover-wrap pawcover-rate">
            <div className="pawcover-rate-copy">
              <h2>What might it cost?</h2>
              <p>
                Every pet is different — age, breed, and zip code all shape your rate. The examples
                here are illustrative starting points only, not offers of coverage. Your actual
                quote takes about two minutes on the secure quote site.
              </p>
              <div className="pawcover-hero-ctas">
                <QuoteButton>See My Real Rate</QuoteButton>
                <PhoneLink label={`Or call ${PHONE_DISPLAY}`} />
              </div>
            </div>
            <div className="pawcover-rate-card" role="img" aria-label="Illustrative sample monthly rates: young dog from about 24 dollars, adult cat from about 14 dollars, senior dog from about 41 dollars">
              <h3>Sample monthly rates</h3>
              <p className="pawcover-rate-note">Illustrative examples only — your quote may differ.</p>
              <div className="pawcover-rate-row"><span>Young dog (2 yrs, mixed breed)</span><strong>from ~$24/mo</strong></div>
              <div className="pawcover-rate-row"><span>Adult cat (4 yrs, indoor)</span><strong>from ~$14/mo</strong></div>
              <div className="pawcover-rate-row"><span>Senior dog (8 yrs, large breed)</span><strong>from ~$41/mo</strong></div>
            </div>
          </div>
        </section>

        <section className="pawcover-section pawcover-section--tint" id="pawcover-faq">
          <div className="pawcover-wrap">
            <div className="pawcover-section-head">
              <h2>Fair questions, straight answers</h2>
              <p>The stuff pet parents actually ask before they enroll.</p>
            </div>
            <div className="pawcover-faq">
              {FAQS.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q} className={open ? "pawcover-faq-item pawcover-faq-item--open" : "pawcover-faq-item"}>
                    <button
                      type="button"
                      className="pawcover-faq-q"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : i)}
                    >
                      {item.q}
                      <ChevronDown size={20} aria-hidden="true" />
                    </button>
                    {open && <p className="pawcover-faq-a">{item.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pawcover-band">
          <PawStamp style={{ top: 20, left: "6%", width: 64, height: 64, transform: "rotate(-20deg)" }} />
          <PawStamp style={{ bottom: 24, right: "7%", width: 80, height: 80, transform: "rotate(16deg)" }} />
          <div className="pawcover-wrap">
            <h2>Their tail is wagging. Your budget can relax.</h2>
            <p>
              Check your pet&apos;s rate in about two minutes — no obligation, no pushy calls, and
              you can adjust the plan until the price fits.
            </p>
            <div className="pawcover-band-ctas">
              <QuoteButton>Get a Free Quote</QuoteButton>
              <PhoneLink label={`Call ${PHONE_DISPLAY}`} />
            </div>
          </div>
        </section>
      </main>

      <footer className="pawcover-footer">
        <div className="pawcover-wrap">
          <div className="pawcover-footer-brand">
            <PawPrint size={16} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 6 }} />
            PawCover
          </div>
          <p>
            <ShieldCheck size={14} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 4 }} />
            Coverage subject to plan terms, waiting periods, limits, and state availability.
            <Clock3 size={14} aria-hidden="true" style={{ verticalAlign: "-2px", margin: "0 4px 0 10px" }} />
            Reimbursement times vary by claim.
            <Smile size={14} aria-hidden="true" style={{ verticalAlign: "-2px", margin: "0 4px 0 10px" }} />
            PawCover is a fictional demonstration brand.
          </p>
          <p className="pawcover-footer-disclaimer">
            Independent provider listing. Not financial or insurance advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
