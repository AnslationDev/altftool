"use client";

import { useState } from "react";
import {
  PawPrint,
  Phone,
  MapPin,
  Camera,
  ShieldCheck,
  Star,
  Clock,
  Heart,
  Home,
  Dog,
  Footprints,
  Sun,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import "./happy-tails.css";

const QUOTE_URL = "#demo-only";
const TEL = "#demo-only";
const PHONE = "Demo only";

const IMG = {
  hero: "https://images.unsplash.com/photo-1530700131180-d43d9b8cc41f?auto=format&fit=crop&w=1600&q=80",
  walking: "https://images.unsplash.com/photo-1618946019619-9d7b7d86b48f?auto=format&fit=crop&w=900&q=80",
  sitting: "https://images.unsplash.com/photo-1569992274375-e56b14e234f1?auto=format&fit=crop&w=900&q=80",
  puppy: "https://images.unsplash.com/photo-1636998094055-ec16a40164f5?auto=format&fit=crop&w=900&q=80",
  trail: "https://images.unsplash.com/photo-1648304887391-a6c2cf2228e4?auto=format&fit=crop&w=900&q=80",
  cuddle: "https://images.unsplash.com/photo-1562263690-f1308e103a88?auto=format&fit=crop&w=900&q=80",
};

function QuoteButton({ variant = "primary", children = "Get a Free Quote" }) {
  return (
    <a
      className={`happytails-btn happytails-btn-${variant}`}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      <PawPrint size={18} aria-hidden="true" />
      {children}
    </a>
  );
}

function PawTrail() {
  return (
    <div className="happytails-pawtrail" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <span className="happytails-paw" key={i} />
      ))}
    </div>
  );
}

export default function HappyTailsPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="happytails-page">
      <nav className="happytails-nav" aria-label="Happy Tails">
        <div className="happytails-nav-inner">
          <a className="happytails-logo" href="#happytails-top">
            <span className="happytails-logo-badge"><Dog size={24} aria-hidden="true" /></span>
            Happy Tails
          </a>
          <ul className={`happytails-nav-links${menuOpen ? " happytails-nav-open" : ""}`}>
            <li><a href="#happytails-services" onClick={() => setMenuOpen(false)}>Services</a></li>
            <li><a href="#happytails-how" onClick={() => setMenuOpen(false)}>How It Works</a></li>
            <li><a href="#happytails-adventures" onClick={() => setMenuOpen(false)}>Adventures</a></li>
            <li><a href="#happytails-reviews" onClick={() => setMenuOpen(false)}>Reviews</a></li>
          </ul>
          <div className="happytails-nav-cta">
            <a className="happytails-nav-phone" href={TEL}>
              <Phone size={17} aria-hidden="true" /><span>{PHONE}</span>
            </a>
            <QuoteButton />
            <button
              className="happytails-menu-toggle"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      <header className="happytails-hero" id="happytails-top">
        <div className="happytails-wrap happytails-hero-grid">
          <div>
            <span className="happytails-eyebrow"><Sun size={16} aria-hidden="true" /> Sunshine-approved walks, rain or shine backup plans</span>
            <h1>Walks they&apos;ll <em>wag</em> about all day long</h1>
            <p>
              GPS-tracked adventures and loving in-home pet sitting from vetted, insured local
              walkers. You get live route maps and photo updates — they get the zoomies.
            </p>
            <div className="happytails-hero-actions">
              <QuoteButton variant="sun">Get a Free Quote</QuoteButton>
              <a className="happytails-btn happytails-btn-ghost" href={TEL}>
                <Phone size={18} aria-hidden="true" /> {PHONE}
              </a>
            </div>
            <div className="happytails-hero-trust">
              <span className="happytails-trust-item"><ShieldCheck size={18} aria-hidden="true" /> Vetted &amp; insured</span>
              <span className="happytails-trust-item"><MapPin size={18} aria-hidden="true" /> GPS on every walk</span>
              <span className="happytails-trust-item"><Camera size={18} aria-hidden="true" /> Photo updates</span>
            </div>
          </div>
          <div className="happytails-hero-visual">
            <div className="happytails-hero-imgwrap">
              <img
                src={IMG.hero}
                alt="A happy golden dog mid-stride on a sunny outdoor walk"
                width="1600"
                height="1200"
              />
            </div>
            <div className="happytails-map" role="img" aria-label="Illustration of a live GPS walk map showing a 2.4 kilometre route in progress">
              <div className="happytails-map-canvas">
                <span className="happytails-map-park" />
                <span className="happytails-map-pond" />
                <span className="happytails-map-route" />
                <span className="happytails-map-start" />
                <span className="happytails-map-pin"><PawPrint size={26} aria-hidden="true" /></span>
              </div>
              <div className="happytails-map-meta">
                <span className="happytails-map-stat">2.4 km<small>distance</small></span>
                <span className="happytails-map-stat">38 min<small>duration</small></span>
                <span className="happytails-map-live">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <PawTrail />

      <section className="happytails-section" id="happytails-services">
        <div className="happytails-wrap">
          <span className="happytails-kicker">Tail-wagging services</span>
          <h2>Every pup gets the VIP (Very Important Pup) treatment</h2>
          <p className="happytails-section-lead">
            From lunchtime leg-stretchers to overnight snuggle duty, pick the care that fits your
            crew — every visit ends with a full report card.
          </p>
          <div className="happytails-cards">
            <article className="happytails-card">
              <div className="happytails-imgwrap">
                <img src={IMG.walking} alt="A dog walker leading a leashed dog along a tree-lined path" loading="lazy" width="900" height="600" />
              </div>
              <div className="happytails-card-body">
                <h3><Footprints size={20} aria-hidden="true" /> GPS-Tracked Walks</h3>
                <p>30 or 60-minute solo strolls with live route tracking, sniff breaks included, and fresh water topped up before we leave.</p>
                <span className="happytails-card-price">From $19 / walk</span>
              </div>
            </article>
            <article className="happytails-card">
              <div className="happytails-imgwrap">
                <img src={IMG.sitting} alt="A relaxed dog lounging comfortably at home with its sitter nearby" loading="lazy" width="900" height="600" />
              </div>
              <div className="happytails-card-body">
                <h3><Home size={20} aria-hidden="true" /> In-Home Pet Sitting</h3>
                <p>Overnight or drop-in sitting in your pet&apos;s own kingdom — meals, meds, belly rubs, and mail brought in while you travel.</p>
                <span className="happytails-card-price">From $45 / night</span>
              </div>
            </article>
            <article className="happytails-card">
              <div className="happytails-imgwrap">
                <img src={IMG.puppy} alt="A young puppy looking up curiously during a home visit" loading="lazy" width="900" height="600" />
              </div>
              <div className="happytails-card-body">
                <h3><Heart size={20} aria-hidden="true" /> Puppy Visits</h3>
                <p>Short, frequent check-ins for the little ones — potty breaks, play sessions, and gentle leash practice to build big-dog confidence.</p>
                <span className="happytails-card-price">From $16 / visit</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <PawTrail />

      <section className="happytails-section happytails-section-tint" id="happytails-how">
        <div className="happytails-wrap">
          <span className="happytails-kicker">Easy as fetch</span>
          <h2>How Happy Tails works</h2>
          <p className="happytails-section-lead">Three quick steps between your pup and their new favourite human.</p>
          <div className="happytails-steps">
            <div className="happytails-step">
              <h3><Phone size={19} aria-hidden="true" /> Request a quote</h3>
              <p>Tap the quote button or call us — tell us about your pet&apos;s routine, quirks, and treat preferences.</p>
            </div>
            <div className="happytails-step">
              <h3><Heart size={19} aria-hidden="true" /> Meet your walker</h3>
              <p>Free meet-and-greet at home so tails and humans alike can approve the match before day one.</p>
            </div>
            <div className="happytails-step">
              <h3><MapPin size={19} aria-hidden="true" /> Watch the walk live</h3>
              <p>Follow the GPS route in real time, then swoon over the photo report and personalised pup notes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="happytails-section">
        <div className="happytails-wrap">
          <div className="happytails-band">
            <div>
              <h2>Fetch your free walking quote</h2>
              <p>Answers within one business day — zoomies guaranteed sooner.</p>
            </div>
            <div className="happytails-band-actions">
              <QuoteButton variant="sun" />
              <a className="happytails-btn happytails-btn-ghost" href={TEL}>
                <Phone size={18} aria-hidden="true" /> {PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="happytails-section" id="happytails-adventures">
        <div className="happytails-wrap">
          <span className="happytails-kicker">Fresh from the trail</span>
          <h2>Adventures in progress</h2>
          <p className="happytails-section-lead">Real moments from this week&apos;s walks and sits — straight from our walkers&apos; photo reports.</p>
          <div className="happytails-gallery">
            <figure>
              <div className="happytails-imgwrap">
                <img src={IMG.trail} alt="An energetic dog exploring an outdoor trail on a bright day" loading="lazy" width="900" height="563" />
              </div>
              <figcaption><MapPin size={15} aria-hidden="true" /> Morning trail loop, 2.4 km</figcaption>
            </figure>
            <figure>
              <div className="happytails-imgwrap">
                <img src={IMG.cuddle} alt="A content dog enjoying cuddle time during an in-home sitting visit" loading="lazy" width="900" height="563" />
              </div>
              <figcaption><Heart size={15} aria-hidden="true" /> Overnight sit, snuggle level: max</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <PawTrail />

      <section className="happytails-section happytails-section-tint" id="happytails-reviews">
        <div className="happytails-wrap happytails-center">
          <span className="happytails-kicker">Wags of approval</span>
          <h2>Loved by pets (and their people)</h2>
          <p className="happytails-section-lead">4.9 average from local pet parents across 2,300+ walks.</p>
          <div className="happytails-quotes">
            {[
              { q: "Biscuit sprints to the door when her walker arrives. The GPS map and photos make my workday so much brighter.", by: "Priya M. & Biscuit" },
              { q: "Our sitter sent updates every evening of our trip. We came home to a calm, happy dog and a spotless kitchen.", by: "Daniel R. & Mochi" },
              { q: "The puppy visits saved our floors and our sanity. Leash practice actually stuck — our vet noticed the difference.", by: "Sofia T. & Waffles" },
            ].map(({ q, by }) => (
              <div className="happytails-quote" key={by}>
                <div className="happytails-stars" aria-label="Rated 5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={17} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <blockquote>&ldquo;{q}&rdquo;</blockquote>
                <cite>{by}</cite>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="happytails-section">
        <div className="happytails-wrap">
          <div className="happytails-band">
            <div>
              <h2>Ready for happier tails?</h2>
              <p>
                <CheckCircle2 size={15} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 6 }} />
                Vetted walkers, GPS tracking, and a wag-back guarantee. Call {PHONE} or grab your quote.
              </p>
            </div>
            <div className="happytails-band-actions">
              <QuoteButton variant="sun" />
              <a className="happytails-btn happytails-btn-ghost" href={TEL}>
                <Phone size={18} aria-hidden="true" /> Call us
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="happytails-footer">
        <div className="happytails-wrap">
          <div className="happytails-footer-inner">
            <div>
              <span className="happytails-logo">
                <span className="happytails-logo-badge"><Dog size={24} aria-hidden="true" /></span>
                Happy Tails
              </span>
              <p>
                Dog walking and in-home pet sitting with GPS-tracked routes, photo updates, and
                walkers your pup will adore. Serving sunny neighbourhoods near you.
              </p>
            </div>
            <div>
              <p>
                <Clock size={15} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 6 }} />
                Mon–Sun, 7am–9pm &nbsp;·&nbsp; <a href={TEL}>{PHONE}</a>
              </p>
              <p><a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer">Get a Free Quote →</a></p>
            </div>
          </div>
          <div className="happytails-footer-note">
            <span>© {new Date().getFullYear()} Happy Tails Pet Care. All tails reserved.</span>
            <span>Independent service provider listing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
