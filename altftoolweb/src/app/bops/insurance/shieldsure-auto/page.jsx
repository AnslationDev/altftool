"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Phone,
  Smartphone,
  Zap,
  Clock,
  Car,
  CheckCircle2,
  Star,
  ChevronDown,
  ArrowRight,
  Gauge,
  Users,
  Wrench,
} from "lucide-react";
import "./shieldsure-auto.css";

const QUOTE_URL = "https://example.com/quote/shieldsure-auto";
const PHONE_TEL = "tel:+18665550301";
const PHONE_DISPLAY = "(866) 555-0301";

const COVERAGE_CARDS = [
  {
    img: "https://images.unsplash.com/photo-1618298363483-e31a31f1a1e2?auto=format&fit=crop&w=900&q=80",
    alt: "Sleek modern car photographed against a dramatic dark backdrop",
    icon: Car,
    title: "Liability & Collision",
    copy: "Core protection for the road ahead — bodily injury, property damage and collision repair, tuned to your state's requirements.",
    points: ["State-minimum to premium limits", "Collision repair at vetted shops", "New-car replacement available"],
  },
  {
    img: "https://images.unsplash.com/photo-1678733519667-3f117361e0fc?auto=format&fit=crop&w=900&q=80",
    alt: "Driver's hands on the steering wheel of a car on an open road",
    icon: Shield,
    title: "Comprehensive Cover",
    copy: "Beyond collisions: theft, glass, weather, fire and animal strikes — the stuff you can't see coming from the driver's seat.",
    points: ["Theft & vandalism protection", "Full glass options", "Hail and storm damage"],
  },
  {
    img: "https://images.unsplash.com/photo-1634055739897-b6a98a80114a?auto=format&fit=crop&w=900&q=80",
    alt: "Car parked on a scenic roadside ready for a long journey",
    icon: Wrench,
    title: "Roadside & Rental",
    copy: "Flat tire at midnight or a fender-bender before a big trip — stay moving with 24/7 roadside help and rental reimbursement.",
    points: ["24/7 towing & jump-starts", "Rental car reimbursement", "Trip interruption cover"],
  },
];

const WHY_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Accident Forgiveness",
    copy: "Qualifying safe drivers can keep their rate after a first at-fault accident. Eligibility varies by state and driving history.",
  },
  {
    icon: Gauge,
    title: "Safe-Driver Savings",
    copy: "Optional telematics can reward smooth, low-mileage driving with discounts at renewal — you choose whether to opt in.",
  },
  {
    icon: Smartphone,
    title: "App-First Claims",
    copy: "Snap photos, file and track your claim from your phone. Many straightforward claims are reviewed within days, not weeks.",
  },
  {
    icon: Users,
    title: "Real Human Agents",
    copy: "Licensed agents on the phone when you want a person, not a bot — for quotes, coverage questions or claim support.",
  },
];

const TAPS = [
  { title: "Snap the scene", copy: "Photograph the damage and the surroundings. The app guides your shots so nothing important is missed." },
  { title: "Describe & submit", copy: "Answer a few quick prompts about what happened. Your claim is filed the moment you hit submit." },
  { title: "Track your payout", copy: "Watch every step in real time — review, approval, repair scheduling and payment — without chasing anyone." },
];

const FAQS = [
  {
    q: "How fast can I actually get a quote?",
    a: "Most drivers see an estimated rate in about three minutes after clicking through to the secure quote page. Final pricing depends on your driving record, vehicle, location and the coverage you select.",
  },
  {
    q: "What is accident forgiveness and do I qualify?",
    a: "Accident forgiveness means a first at-fault accident may not raise your premium at renewal. It is typically available to drivers with a clean recent record, and availability varies by state — an agent can confirm your eligibility.",
  },
  {
    q: "Can I really handle a claim entirely from my phone?",
    a: "For most common claims, yes — photos, damage description, status tracking and payout updates all happen in the app. Complex claims may involve an adjuster visit, and you can always call a human at any point.",
  },
  {
    q: "Will switching insurers leave me with a coverage gap?",
    a: "No — you pick your new policy's start date first, then cancel the old one once the new coverage is active. An agent can walk you through the timing so there is never a day without protection.",
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="shieldsure-faq-item" data-open={open}>
      <button type="button" className="shieldsure-faq-q" onClick={onToggle} aria-expanded={open}>
        {item.q}
        <ChevronDown size={19} aria-hidden="true" />
      </button>
      {open && <p className="shieldsure-faq-a">{item.a}</p>}
    </div>
  );
}

function QuoteButton({ children }) {
  return (
    <a
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="shieldsure-btn shieldsure-btn-primary"
    >
      {children}
    </a>
  );
}

export default function ShieldSureAutoPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="shieldsure-page">
      {/* ---------- Nav ---------- */}
      <header className="shieldsure-nav">
        <nav className="shieldsure-nav-inner" aria-label="Main">
          <a href="#shieldsure-top" className="shieldsure-logo">
            <span className="shieldsure-logo-badge" aria-hidden="true"><Shield size={19} /></span>
            ShieldSure Auto
          </a>
          <ul className="shieldsure-nav-links">
            <li><a href="#shieldsure-coverage">Coverage</a></li>
            <li><a href="#shieldsure-claims">Claims</a></li>
            <li><a href="#shieldsure-why">Why Us</a></li>
            <li><a href="#shieldsure-faq">FAQ</a></li>
          </ul>
          <div className="shieldsure-nav-cta">
            <a href={PHONE_TEL} className="shieldsure-nav-phone">
              <Phone size={16} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <QuoteButton>Get a Free Quote</QuoteButton>
          </div>
        </nav>
      </header>

      <main id="shieldsure-top">
        {/* ---------- Hero ---------- */}
        <section className="shieldsure-hero">
          <div className="shieldsure-wrap shieldsure-hero-grid">
            <div>
              <span className="shieldsure-eyebrow"><Zap size={14} aria-hidden="true" /> Instant online quotes</span>
              <h1>
                Auto cover, <em>reimagined</em> for the fast lane.
              </h1>
              <p className="shieldsure-hero-sub">
                Get an estimated rate in about three minutes, protect your record with accident
                forgiveness for qualifying drivers, and file claims right from your phone.
                Modern insurance that keeps up with you.
              </p>
              <div className="shieldsure-hero-actions">
                <QuoteButton>
                  Get a Free Quote <ArrowRight size={17} aria-hidden="true" />
                </QuoteButton>
                <a href={PHONE_TEL} className="shieldsure-btn shieldsure-btn-ghost">
                  <Phone size={17} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
              <div className="shieldsure-hero-trust">
                {/*
                  Was "4.8/5 from surveyed drivers" and "Licensed agents". No
                  drivers were surveyed and no agent holds a licence — insurance
                  licensing is a regulated claim, so it is the one that mattered
                  most here.
                */}
                <span><ShieldCheck size={15} aria-hidden="true" /> Sample provider page</span>
                <span><Clock size={15} aria-hidden="true" /> 24/7 claims line</span>
              </div>
            </div>
            <div className="shieldsure-hero-visual">
              <div className="shieldsure-hero-frame">
                <img
                  src="https://images.unsplash.com/photo-1612709060421-596380268eaf?auto=format&fit=crop&w=1600&q=80"
                  alt="Modern car cruising down an open road, safeguarded and confident"
                />
              </div>
              <div className="shieldsure-rate-chip" aria-label="Sample rate illustration">
                <small>Sample rate — 2021 sedan, clean record</small>
                <strong>from $68/mo*</strong>
                <small>*Illustrative only. Your rate depends on your profile.</small>
              </div>
            </div>
          </div>
        </section>

        <hr className="shieldsure-chrome-line" />

        {/* ---------- Stats ---------- */}
        <section className="shieldsure-stats" aria-label="ShieldSure at a glance">
          <div className="shieldsure-wrap shieldsure-stats-row">
            <div className="shieldsure-stat"><strong>~3 min</strong><span>average time to an online rate estimate</span></div>
            <div className="shieldsure-stat"><strong>24/7</strong><span>claims hotline and in-app filing</span></div>
            <div className="shieldsure-stat"><strong>3 taps</strong><span>to start a claim from your phone</span></div>
          </div>
        </section>

        <hr className="shieldsure-chrome-line" />

        {/* ---------- Coverage ---------- */}
        <section className="shieldsure-section" id="shieldsure-coverage">
          <div className="shieldsure-wrap">
            <p className="shieldsure-kicker">Coverage built around you</p>
            <h2>Protection that fits how you drive</h2>
            <p className="shieldsure-section-lede">
              Mix and match coverage the way you spec a car — start with the essentials, add the
              extras that matter, skip the ones that don't. An agent can help you tune it.
            </p>
            <div className="shieldsure-card-grid">
              {COVERAGE_CARDS.map((card) => (
                <article className="shieldsure-card" key={card.title}>
                  <div className="shieldsure-card-media">
                    <img src={card.img} alt={card.alt} loading="lazy" />
                  </div>
                  <div className="shieldsure-card-body">
                    <h3><card.icon size={20} aria-hidden="true" /> {card.title}</h3>
                    <p>{card.copy}</p>
                    <ul className="shieldsure-card-list">
                      {card.points.map((pt) => (
                        <li key={pt}><CheckCircle2 size={15} aria-hidden="true" /> {pt}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Claim in 3 taps ---------- */}
        <section className="shieldsure-section shieldsure-section-dark" id="shieldsure-claims">
          <div className="shieldsure-wrap">
            <p className="shieldsure-kicker">Claims, simplified</p>
            <h2>Claim in 3 taps — right from your phone</h2>
            <p className="shieldsure-section-lede">
              Fender-benders are stressful enough. Our app turns the paperwork into a few taps,
              with a live status tracker and a human on the line whenever you want one.
            </p>
            <div className="shieldsure-taps-strip">
              {TAPS.map((tap, i) => (
                <div className="shieldsure-phone-chip" key={tap.title}>
                  <span className="shieldsure-tap-num" aria-hidden="true">{i + 1}</span>
                  <h3>{tap.title}</h3>
                  <p>{tap.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Mid CTA ---------- */}
        <section className="shieldsure-mid-cta">
          <div className="shieldsure-mid-cta-img" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1536317203120-03881cb89d41?auto=format&fit=crop&w=1600&q=80"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="shieldsure-mid-cta-overlay" aria-hidden="true" />
          <div className="shieldsure-mid-cta-inner">
            <h2>See your rate before your coffee cools</h2>
            <p>
              A few quick questions on our secure quote page and you'll have an estimated rate in
              minutes — no obligation, no pressure, no phone tag unless you want to talk.
            </p>
            <div className="shieldsure-hero-actions">
              <QuoteButton>
                Get a Free Quote <ArrowRight size={17} aria-hidden="true" />
              </QuoteButton>
              <a href={PHONE_TEL} className="shieldsure-btn shieldsure-btn-ghost">
                <Phone size={17} aria-hidden="true" /> Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        {/* ---------- Why ShieldSure ---------- */}
        <section className="shieldsure-section" id="shieldsure-why">
          <div className="shieldsure-wrap">
            <p className="shieldsure-kicker">Why drivers switch</p>
            <h2>Built like a shield. Drives like an app.</h2>
            <p className="shieldsure-section-lede">
              We took the parts of insurance people actually value — fair pricing, fast claims,
              real people — and stripped out the rest.
            </p>
            <div className="shieldsure-why-grid">
              {WHY_ITEMS.map((item) => (
                <div className="shieldsure-why-item" key={item.title}>
                  <item.icon size={26} aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="shieldsure-chrome-line" />

        {/* ---------- FAQ ---------- */}
        <section className="shieldsure-section" id="shieldsure-faq">
          <div className="shieldsure-wrap">
            <p className="shieldsure-kicker">Good questions</p>
            <h2>Frequently asked questions</h2>
            <p className="shieldsure-section-lede">
              Straight answers, no fine-print gymnastics. Still curious? Call {PHONE_DISPLAY} and
              ask a licensed agent anything.
            </p>
            <div className="shieldsure-faq-list">
              {FAQS.map((item, i) => (
                <FaqItem
                  key={item.q}
                  item={item}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="shieldsure-final">
          <div className="shieldsure-wrap">
            <h2>Ready to reimagine your auto cover?</h2>
            <p>
              Check your rate in about three minutes, or talk it through with a licensed agent.
              Either way, you're minutes from smarter coverage.
            </p>
            <div className="shieldsure-final-actions">
              <QuoteButton>
                Get a Free Quote <ArrowRight size={17} aria-hidden="true" />
              </QuoteButton>
              <a href={PHONE_TEL} className="shieldsure-btn shieldsure-btn-ghost">
                <Phone size={17} aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="shieldsure-footer">
        <div className="shieldsure-wrap">
          <div className="shieldsure-footer-row">
            <span className="shieldsure-logo">
              <span className="shieldsure-logo-badge" aria-hidden="true"><Shield size={16} /></span>
              ShieldSure Auto
            </span>
            <a href={PHONE_TEL}>
              <Phone size={14} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: "6px" }} />
              {PHONE_DISPLAY}
            </a>
          </div>
          <p className="shieldsure-footer-fine">
            Independent provider listing. Not financial or insurance advice. ShieldSure Auto is a
            fictional brand shown for directory illustration purposes. Coverage availability,
            discounts, accident forgiveness and rates vary by state, driver profile, vehicle and
            eligibility; sample rates are illustrative only and not an offer of coverage. All
            policies are subject to underwriting review, terms, conditions and exclusions.
            &copy; {new Date().getFullYear()} ShieldSure Auto.
          </p>
        </div>
      </footer>
    </div>
  );
}
