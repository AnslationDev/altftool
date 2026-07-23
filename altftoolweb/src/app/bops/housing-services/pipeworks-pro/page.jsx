"use client";

import "./pipeworks-pro.css";
import {
  Phone, Wrench, Clock, CheckCircle2, ChevronRight, Droplets, Flame,
  ShowerHead, Hammer, ShieldCheck, BadgeCheck, Truck, Star, AlertTriangle, ArrowRight,
} from "lucide-react";

const PHONE_DISPLAY = "(833) 555-0165";
const PHONE_TEL = "tel:+18335550165";
const QUOTE_URL = "https://example.com/quote/pipeworks-pro";

const IMG = {
  hero: "https://images.unsplash.com/photo-1526898943670-92bfa9f94c12?auto=format&fit=crop&w=1600&q=80",
  burst: "https://images.unsplash.com/photo-1551516116-27394c95a55f?auto=format&fit=crop&w=900&q=80",
  heater: "https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?auto=format&fit=crop&w=900&q=80",
  tools: "https://images.unsplash.com/photo-1620653713380-7a34b773fef8?auto=format&fit=crop&w=900&q=80",
  repipe: "https://images.unsplash.com/photo-1676210134188-4c05dd172f89?auto=format&fit=crop&w=900&q=80",
  tech: "https://images.unsplash.com/photo-1694827893591-af9b80361599?auto=format&fit=crop&w=900&q=80",
};

const SERVICES = [
  {
    icon: Droplets, title: "Burst Pipes & Leaks", img: IMG.burst,
    alt: "Water spraying from a burst copper pipe joint",
    text: "Immediate shut-off, damage containment, and permanent pipe repair — not a temporary patch. We bring pumps and drying gear on every emergency call.",
  },
  {
    icon: ShowerHead, title: "Blocked Drains & Sewers", img: IMG.tools,
    alt: "Plumbing tools and fittings laid out ready for a drain repair",
    text: "Hydro-jetting and camera inspection clear the toughest clogs — kitchens, mains, and sewer lines — with a video report showing exactly what we found.",
  },
  {
    icon: Flame, title: "Water Heater Repair", img: IMG.heater,
    alt: "Technician servicing a residential water heater unit",
    text: "No hot water at 11pm? We repair tank and tankless systems on the spot, and can install a new unit same-day if yours is beyond saving.",
  },
  {
    icon: Hammer, title: "Whole-Home Repiping", img: IMG.repipe,
    alt: "New PEX and copper piping installed in an open wall during a repipe",
    text: "Aging galvanized or polybutylene lines replaced with modern PEX or copper — most homes done in 2-3 days with walls patched before we leave.",
  },
];

const STEPS = [
  { title: `Call ${PHONE_DISPLAY}`, sub: "Real plumber answers, day or night" },
  { title: "Dispatched", sub: "Nearest stocked truck heads your way" },
  { title: "Fixed", sub: "Flat-rate quote approved before we start" },
];

const FEATURES = [
  {
    icon: Truck, title: "Trucks stationed across the metro",
    text: "GPS dispatch sends the nearest crew — that's how we hit the 45-minute promise.",
  },
  {
    icon: ShieldCheck, title: "Flat-rate pricing before work starts",
    text: "You approve the exact price up front. Nights, weekends, and holidays cost the same.",
  },
  {
    icon: BadgeCheck, title: "Licensed, background-checked plumbers",
    text: "Every technician is certified, insured, and backed by our 2-year workmanship warranty.",
  },
];

const GALLERY = [
  { img: IMG.burst, alt: "Emergency repair of a leaking supply line completed the same evening", caption: "Midnight burst-pipe repair — sealed in 90 minutes" },
  { img: IMG.heater, alt: "Newly installed high-efficiency water heater in a utility closet", caption: "Same-day tankless water heater swap" },
  { img: IMG.repipe, alt: "Completed whole-home repipe with clean new lines through the framing", caption: "Full repipe, 3 bathrooms — done in 2 days" },
];

const STATS = [
  { value: "45 min", label: "avg. arrival time" },
  { value: "12,400+", label: "emergencies resolved" },
  { value: "4.9/5", label: "customer rating" },
  { value: "24/7/365", label: "live dispatch" },
];

const REVIEWS = [
  {
    quote: "Pipe burst behind the laundry wall at 1:30am. Truck was in my driveway by 2:10, water off, pipe replaced, and they even mopped up. Unbelievable.",
    name: "Danielle R.", job: "Burst pipe — emergency call",
  },
  {
    quote: "Quoted a flat price over the phone for our dead water heater and stuck to it exactly. Hot showers again by dinner the same day.",
    name: "Marcus T.", job: "Water heater replacement",
  },
  {
    quote: "Three other companies said next week. PipeWorks jetted our main sewer line the same afternoon and showed us the camera footage. Worth every penny.",
    name: "Priya S.", job: "Main line blockage",
  },
];

function QuoteLink({ className, children }) {
  return (
    <a className={className} href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer">
      {children}
    </a>
  );
}

function Stars() {
  return (
    <div className="pipeworks-stars" aria-label="Rated 5 out of 5 stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={17} fill="currentColor" aria-hidden="true" />
      ))}
    </div>
  );
}

function Brand({ iconSize = 20 }) {
  return (
    <>
      <span className="pipeworks-brand-badge">
        <Wrench size={iconSize} aria-hidden="true" />
      </span>
      PipeWorks<span className="pipeworks-brand-pro">Pro</span>
    </>
  );
}

export default function PipeWorksProPage() {
  return (
    <div className="pipeworks-page">
      {/* Sticky emergency bar */}
      <div className="pipeworks-alertbar" role="banner">
        <div className="pipeworks-alertbar-inner">
          <p className="pipeworks-alertbar-msg">
            <AlertTriangle size={18} aria-hidden="true" />
            Burst pipe or flooding? Emergency crews are standing by right now.
          </p>
          <a className="pipeworks-alertbar-call" href={PHONE_TEL}>
            <Phone size={22} aria-hidden="true" /> Call {PHONE_DISPLAY}
          </a>
        </div>
      </div>

      {/* Nav */}
      <nav className="pipeworks-nav" aria-label="Main">
        <div className="pipeworks-nav-inner">
          <a className="pipeworks-brand" href="#top" aria-label="PipeWorks Pro home">
            <Brand />
          </a>
          <div className="pipeworks-nav-links">
            <a href="#services">Services</a>
            <a href="#why">Why Us</a>
            <a href="#work">Recent Work</a>
            <a href="#reviews">Reviews</a>
          </div>
          <QuoteLink className="pipeworks-btn pipeworks-btn-red">Get a Free Quote</QuoteLink>
        </div>
      </nav>

      <main id="top">
        {/* Hero */}
        <header className="pipeworks-hero">
          <div className="pipeworks-wrap pipeworks-hero-grid">
            <div>
              <p className="pipeworks-pulse-badge">
                <span className="pipeworks-pulse-dot" aria-hidden="true" />
                24/7 Emergency Response
              </p>
              <h1 className="pipeworks-hero-title">
                Plumbing emergency? <em>We&rsquo;re on-site in 45 minutes.</em>
              </h1>
              <p className="pipeworks-hero-sub">
                Burst pipes, blocked drains, dead water heaters — PipeWorks Pro
                dispatches licensed emergency plumbers around the clock, 365 days
                a year. One call and a fully stocked truck is on its way.
              </p>
              <div className="pipeworks-hero-ctas">
                <a className="pipeworks-btn pipeworks-btn-red pipeworks-hero-call" href={PHONE_TEL}>
                  <Phone size={20} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
                <QuoteLink className="pipeworks-btn pipeworks-btn-ghost">
                  Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
                </QuoteLink>
              </div>
              <ul className="pipeworks-hero-points">
                <li><CheckCircle2 size={17} aria-hidden="true" /> Licensed &amp; insured</li>
                <li><CheckCircle2 size={17} aria-hidden="true" /> Upfront flat-rate pricing</li>
                <li><CheckCircle2 size={17} aria-hidden="true" /> No overtime charges, ever</li>
              </ul>
            </div>
            <figure className="pipeworks-hero-figure">
              <div className="pipeworks-hero-imgbox">
                <img src={IMG.hero} alt="Professional plumber repairing pipework under a sink with a wrench" />
              </div>
              <div className="pipeworks-hero-eta">
                <Clock size={30} aria-hidden="true" />
                <div>
                  <strong>45-minute arrival</strong>
                  <span>average emergency response time</span>
                </div>
              </div>
            </figure>
          </div>
        </header>

        {/* Step strip */}
        <section className="pipeworks-steps" aria-label="How it works">
          <div className="pipeworks-wrap pipeworks-steps-row">
            {STEPS.map((step, i) => (
              <div key={step.title} style={{ display: "contents" }}>
                {i > 0 && <ChevronRight className="pipeworks-step-arrow" size={26} aria-hidden="true" />}
                <div className="pipeworks-step">
                  <span className="pipeworks-step-num">{i + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.sub}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="pipeworks-section" id="services">
          <div className="pipeworks-wrap">
            <p className="pipeworks-kicker">Emergency Services</p>
            <h2 className="pipeworks-h2">Whatever burst, blocked, or broke — we fix it tonight</h2>
            <p className="pipeworks-lede">
              Every PipeWorks Pro truck carries the parts to finish 9 out of 10
              jobs on the first visit. Call {PHONE_DISPLAY} and describe the
              problem — we&rsquo;ll tell you exactly what happens next.
            </p>
            <div className="pipeworks-cards">
              {SERVICES.map(({ icon: Icon, title, img, alt, text }) => (
                <article className="pipeworks-card" key={title}>
                  <div className="pipeworks-imgbox">
                    <img src={img} alt={alt} loading="lazy" />
                  </div>
                  <div className="pipeworks-card-body">
                    <h3 className="pipeworks-card-title">
                      <Icon size={22} aria-hidden="true" /> {title}
                    </h3>
                    <p>{text}</p>
                    <a className="pipeworks-card-call" href={PHONE_TEL}>
                      <Phone size={16} aria-hidden="true" /> Call {PHONE_DISPLAY}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why us */}
        <section className="pipeworks-section pipeworks-section-ice" id="why">
          <div className="pipeworks-wrap pipeworks-split">
            <div className="pipeworks-split-imgbox">
              <img
                src={IMG.tech}
                alt="Uniformed PipeWorks Pro technician arriving at a customer home"
                loading="lazy"
              />
            </div>
            <div>
              <p className="pipeworks-kicker">Why PipeWorks Pro</p>
              <h2 className="pipeworks-h2">The crew your neighbors call at 2am</h2>
              <ul className="pipeworks-feature-list">
                {FEATURES.map(({ icon: Icon, title, text }) => (
                  <li key={title}>
                    <span className="pipeworks-feature-ico"><Icon size={22} aria-hidden="true" /></span>
                    <div>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <a className="pipeworks-btn pipeworks-btn-red" href={PHONE_TEL}>
                <Phone size={18} aria-hidden="true" /> Call {PHONE_DISPLAY} Now
              </a>
            </div>
          </div>
        </section>

        {/* Mid-page CTA band */}
        <section className="pipeworks-section" aria-label="Request a quote">
          <div className="pipeworks-wrap">
            <div className="pipeworks-band">
              <div>
                <h2>Water where it shouldn&rsquo;t be?</h2>
                <p>Talk to a live dispatcher now — or get a free written quote in minutes.</p>
              </div>
              <div className="pipeworks-band-ctas">
                <a className="pipeworks-btn pipeworks-btn-red" href={PHONE_TEL}>
                  <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
                <QuoteLink className="pipeworks-btn pipeworks-btn-ghost">Get a Free Quote</QuoteLink>
              </div>
            </div>
          </div>
        </section>

        {/* Recent work gallery */}
        <section className="pipeworks-section pipeworks-section-ice" id="work">
          <div className="pipeworks-wrap">
            <p className="pipeworks-kicker">Recent Work</p>
            <h2 className="pipeworks-h2">Fixed right, photographed proud</h2>
            <p className="pipeworks-lede">
              A few jobs from the past month — every one dispatched, quoted, and
              completed within 24 hours of the first call to {PHONE_DISPLAY}.
            </p>
            <div className="pipeworks-gallery">
              {GALLERY.map(({ img, alt, caption }) => (
                <figure key={caption}>
                  <div className="pipeworks-imgbox">
                    <img src={img} alt={alt} loading="lazy" />
                  </div>
                  <figcaption>{caption}</figcaption>
                </figure>
              ))}
            </div>
            <div className="pipeworks-stats">
              {STATS.map(({ value, label }) => (
                <div className="pipeworks-stat" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="pipeworks-section" id="reviews">
          <div className="pipeworks-wrap">
            <p className="pipeworks-kicker">Reviews</p>
            <h2 className="pipeworks-h2">What callers say the morning after</h2>
            <p className="pipeworks-lede">Real emergencies, real clocks ticking. Here&rsquo;s how it went.</p>
            <div className="pipeworks-reviews">
              {REVIEWS.map(({ quote, name, job }) => (
                <article className="pipeworks-review" key={name}>
                  <Stars />
                  <blockquote>&ldquo;{quote}&rdquo;</blockquote>
                  <cite>{name} <span>{job}</span></cite>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pipeworks-final" aria-label="Call now">
          <div className="pipeworks-wrap">
            <p className="pipeworks-pulse-badge">
              <span className="pipeworks-pulse-dot" aria-hidden="true" />
              Dispatchers online now
            </p>
            <h2>Don&rsquo;t wait for the water to win.</h2>
            <p>
              One call gets a licensed plumber moving toward your door — on
              average, we&rsquo;re on-site in 45 minutes.
            </p>
            <div className="pipeworks-final-ctas">
              <a className="pipeworks-btn pipeworks-btn-red pipeworks-final-call" href={PHONE_TEL}>
                <Phone size={24} aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
              <QuoteLink className="pipeworks-btn pipeworks-btn-ghost pipeworks-final-call">
                Get a Free Quote
              </QuoteLink>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pipeworks-footer">
        <div className="pipeworks-wrap pipeworks-footer-inner">
          <span className="pipeworks-brand"><Brand iconSize={16} /></span>
          <a className="pipeworks-footer-phone" href={PHONE_TEL}>
            <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
          </a>
          <p className="pipeworks-footer-note">Independent service provider listing.</p>
        </div>
      </footer>
    </div>
  );
}
