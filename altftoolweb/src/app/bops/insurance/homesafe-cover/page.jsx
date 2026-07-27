"use client";

import { useState } from "react";
import {
  Home,
  ArrowRight,
  ShieldCheck,
  Flame,
  Droplets,
  Wind,
  Lock,
  Sofa,
  BedDouble,
  Scale,
  Hammer,
  UserCheck,
  ClipboardCheck,
  Check,
  ChevronDown,
} from "lucide-react";
import DemoBrandNotice from "../_components/DemoBrandNotice";
import "./homesafe-cover.css";

const QUOTE_URL = "https://example.com/quote/homesafe-cover";

const IMG = {
  hero: "https://images.unsplash.com/photo-1733493520076-56882ea21085?auto=format&fit=crop&w=1600&q=80",
  band: "https://images.unsplash.com/photo-1686452287504-ca0b691ad04f?auto=format&fit=crop&w=1600&q=80",
  claims: "https://images.unsplash.com/photo-1673412919859-ff8a20acc354?auto=format&fit=crop&w=900&q=80",
  handler: "https://images.unsplash.com/photo-1707962244143-bcda1e70cb9e?auto=format&fit=crop&w=900&q=80",
  interior: "https://images.unsplash.com/photo-1704692945749-375dcb2a1770?auto=format&fit=crop&w=900&q=80",
};

const ROOMS = [
  { tag: "A-01", icon: Hammer, title: "Buildings & Rebuild Cost", body: "Cover assessed on what it would actually cost to rebuild your home — walls, roof, foundations, fitted kitchens and bathrooms." },
  { tag: "A-02", icon: Sofa, title: "Contents & Belongings", body: "Furniture, appliances, clothing and electronics covered at home, with optional cover for items you carry out and about." },
  { tag: "A-03", icon: Droplets, title: "Escape of Water", body: "Burst pipes and leaking appliances — including trace-and-access costs to find the source of a hidden leak." },
  { tag: "A-04", icon: Flame, title: "Fire & Smoke Damage", body: "Structural fire damage plus smoke damage to decor and contents, with professional restoration where possible." },
  { tag: "A-05", icon: Wind, title: "Storm & Weather", body: "Storm, wind and hail damage to your roof, guttering, fences within policy limits, and resulting internal damage." },
  { tag: "A-06", icon: Lock, title: "Theft & Vandalism", body: "Break-ins and malicious damage, including lock replacement when keys are stolen and boarding-up costs." },
  { tag: "A-07", icon: BedDouble, title: "Alternative Accommodation", body: "If a covered claim makes your home unliveable, we help pay for somewhere comparable to stay while repairs happen." },
  { tag: "A-08", icon: Scale, title: "Liability Protection", body: "Cover if a visitor is injured at your property or you accidentally damage a neighbour's home, up to policy limits." },
  { tag: "A-09", icon: ShieldCheck, title: "Optional Extras", body: "Accidental damage, home emergency call-outs and legal expenses can be added when you build your quote." },
];

const FAQS = [
  { q: "How is rebuild cost different from market value?", a: "Market value is what your home would sell for; rebuild cost is what it would take to reconstruct it from the ground up, including materials and labour. HomeSafe Cover policies are assessed on rebuild cost, so you are not paying to insure the value of your land." },
  { q: "What does a named claim handler actually mean?", a: "When you open a claim, one handler is assigned to it from first call to settlement. You get their direct line — no re-explaining your situation to a new person every time you phone." },
  { q: "Will my quote be affected by checking prices?", a: "No. Requesting a quote through our partner site is a soft check and does not affect your credit score. You only proceed if the price and cover work for you." },
  { q: "Are floods and accidental damage included as standard?", a: "Flood cover is included on most policies, subject to your property's risk profile and policy terms. Accidental damage is an optional extra you can add during the quote. Exclusions and excesses apply — full details are in the policy documents before you buy." },
  { q: "How fast are claims usually paid?", a: "Straightforward contents claims are often settled within days of documents being received. Complex buildings claims take longer because surveys and contractors are involved, but your handler keeps you updated at every stage." },
];

function QuoteButton({ ghost, invert, children }) {
  const cls = invert
    ? "homesafe-btn homesafe-btn-invert"
    : ghost
      ? "homesafe-btn homesafe-btn-ghost"
      : "homesafe-btn homesafe-btn-solid";
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={cls}>
      {children || "Get a Free Quote"}
      <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}

export default function HomeSafeCoverPage() {
  const [open, setOpen] = useState(0);

  return (
    <div className="homesafe-page">
      <header className="homesafe-nav">
        <div className="homesafe-nav-inner">
          <a href="#homesafe-top" className="homesafe-logo">
            <span className="homesafe-logo-mark"><Home size={19} aria-hidden="true" /></span>
            HomeSafe Cover
          </a>
          <nav className="homesafe-nav-links" aria-label="Page sections">
            <a href="#homesafe-coverage">Coverage</a>
            <a href="#homesafe-claims">Claims</a>
            <a href="#homesafe-faq">FAQ</a>
          </nav>
          <QuoteButton />
        </div>
      </header>

      <main id="homesafe-top">
        <DemoBrandNotice brand="HomeSafe Cover" />

        <section className="homesafe-hero homesafe-blueprint">
          <div className="homesafe-wrap homesafe-hero-grid">
            <div className="homesafe-hero-copy">
              <span className="homesafe-eyebrow">House &amp; Contents Cover</span>
              <h1>
                Cover drawn to the <em>last brick</em> of your home.
              </h1>
              <p className="homesafe-hero-sub">
                HomeSafe Cover is straight-talking home insurance: policies built on
                your home&apos;s true rebuild cost, claims handled by one named person,
                and plain-English documents you can actually read.
              </p>
              <div className="homesafe-cta-row">
                <QuoteButton />
              </div>
              <ul className="homesafe-checklist">
                <li><Check size={16} aria-hidden="true" /> Rebuild-cost assessed cover, not guesswork</li>
                <li><Check size={16} aria-hidden="true" /> One named claim handler, start to finish</li>
                <li><Check size={16} aria-hidden="true" /> No obligation — compare your quote in minutes</li>
              </ul>
            </div>
            <div className="homesafe-hero-visual">
              <div className="homesafe-frame homesafe-ticked">
                <img
                  src={IMG.hero}
                  alt="Modern detached family house with a clean brick facade and landscaped front garden"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="homesafe-coverage" className="homesafe-section homesafe-blueprint">
          <div className="homesafe-wrap">
            <div className="homesafe-section-head">
              <span className="homesafe-eyebrow">Plan of Coverage</span>
              <h2>What&apos;s covered, room by room</h2>
              <p>
                Think of your policy like a floor plan — every part of your home and
                the life inside it has its own clearly drawn cover. Limits, excesses
                and exclusions apply; full details are set out before you buy.
              </p>
            </div>
            <div className="homesafe-plan">
              {ROOMS.map((room) => (
                <article key={room.tag} className="homesafe-room">
                  <span className="homesafe-room-tag">{room.tag}</span>
                  <room.icon size={26} aria-hidden="true" />
                  <h3>{room.title}</h3>
                  <p>{room.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="homesafe-band">
          <img
            src={IMG.band}
            alt="Row of well-kept suburban homes photographed in warm evening light"
            loading="lazy"
          />
          <span className="homesafe-band-caption">Elevation B — homes we help protect</span>
        </div>

        <section id="homesafe-claims" className="homesafe-section">
          <div className="homesafe-wrap homesafe-claims-grid">
            <figure className="homesafe-photo-card homesafe-ticked">
              <img
                src={IMG.claims}
                alt="Contemporary house exterior with large windows viewed from the street"
                loading="lazy"
              />
              <figcaption>Fig. 02 — insured property, exterior</figcaption>
            </figure>
            <div>
              <span className="homesafe-eyebrow">Claims, Simplified</span>
              <div className="homesafe-section-head" style={{ marginBottom: 12 }}>
                <h2>Three steps. One person. No runaround.</h2>
              </div>
              <div className="homesafe-steps">
                <div className="homesafe-step">
                  <span className="homesafe-step-num">01</span>
                  <div>
                    <h3>Call or claim online, day or night</h3>
                    <p>The claims line runs 24/7. Tell us once what happened — you won&apos;t have to repeat it.</p>
                  </div>
                </div>
                <div className="homesafe-step">
                  <span className="homesafe-step-num">02</span>
                  <div>
                    <h3>Meet your named handler</h3>
                    <p>One person owns your claim and gives you their direct line, so updates come from a familiar voice.</p>
                  </div>
                </div>
                <div className="homesafe-step">
                  <span className="homesafe-step-num">03</span>
                  <div>
                    <h3>Repair, replace or settle</h3>
                    <p>Vetted trades for repairs, or a cash settlement where the policy allows — whichever gets you home faster.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="homesafe-wrap">
          <section className="homesafe-midcta homesafe-blueprint" aria-label="Quote call to action">
            <span className="homesafe-eyebrow">No forms to fill here</span>
            <h2>See your price on our secure partner site</h2>
            <p>
              A few details about your home and you&apos;ll have a personalised quote —
              no obligation, no effect on your credit score, no pushy follow-up calls.
            </p>
            <div className="homesafe-cta-row">
              <QuoteButton />
            </div>
          </section>
        </div>

        <section className="homesafe-section homesafe-handler">
          <div className="homesafe-wrap homesafe-handler-grid">
            <div>
              <span className="homesafe-eyebrow">The HomeSafe Difference</span>
              <div className="homesafe-section-head" style={{ marginBottom: 0 }}>
                <h2>A policy that knows what your home is worth to rebuild</h2>
              </div>
              <ul className="homesafe-handler-points">
                <li>
                  <ClipboardCheck size={19} aria-hidden="true" />
                  <span><strong>Rebuild-cost assessment.</strong> Cover is calculated on reconstruction cost, so you&apos;re less likely to be under- or over-insured.</span>
                </li>
                <li>
                  <UserCheck size={19} aria-hidden="true" />
                  <span><strong>Named claim handler.</strong> A single point of contact who knows your file, from first notification to final payment.</span>
                </li>
                <li>
                  <ShieldCheck size={19} aria-hidden="true" />
                  <span><strong>Plain-English documents.</strong> What&apos;s covered, what&apos;s not, and every excess — laid out before you pay a penny.</span>
                </li>
              </ul>
            </div>
            <figure className="homesafe-photo-card homesafe-ticked">
              <img
                src={IMG.handler}
                alt="Bright, tidy living room interior with a sofa and warm natural light"
                loading="lazy"
              />
              <figcaption>Fig. 03 — contents cover, interior</figcaption>
            </figure>
          </div>
        </section>

        <section id="homesafe-faq" className="homesafe-section homesafe-blueprint">
          <div className="homesafe-wrap">
            <div className="homesafe-section-head">
              <span className="homesafe-eyebrow">Common Questions</span>
              <h2>Asked before you ask</h2>
            </div>
            <div className="homesafe-faq-list">
              {FAQS.map((item, i) => (
                <div key={item.q} className="homesafe-faq-item homesafe-ticked" data-open={open === i}>
                  <button
                    type="button"
                    aria-expanded={open === i}
                    onClick={() => setOpen(open === i ? -1 : i)}
                  >
                    {item.q}
                    <ChevronDown size={19} aria-hidden="true" />
                  </button>
                  {open === i && (
                    <div className="homesafe-faq-body">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="homesafe-final">
          <h2>Ready to put your home on solid ground?</h2>
          <p>
            Get a personalised house and contents quote in minutes. No
            obligation either way.
          </p>
          <div className="homesafe-cta-row">
            <QuoteButton invert />
          </div>
        </section>
      </main>

      <footer className="homesafe-footer">
        <div className="homesafe-wrap">
          <div className="homesafe-footer-grid">
            <a href="#homesafe-top" className="homesafe-logo">
              <span className="homesafe-logo-mark"><Home size={19} aria-hidden="true" /></span>
              HomeSafe Cover
            </a>
            <div className="homesafe-footer-contact">
              <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer">
                Get a Free Quote <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
          <p className="homesafe-disclaimer">
            HomeSafe Cover is a fictional brand shown for directory listing purposes.
            Cover is subject to eligibility, underwriting criteria, policy terms,
            limits, excesses and exclusions. Quotes are provided by third-party
            partners and prices shown are illustrative examples only, not offers of
            cover. Independent provider listing. Not financial or insurance advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
