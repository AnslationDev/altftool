"use client";

import { useState } from "react";
import {
  PawPrint,
  Phone,
  MapPin,
  Camera,
  ShieldCheck,
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

function QuoteButton({ variant = "primary", children = "Preview Quote CTA" }) {
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
            <span className="happytails-eyebrow"><Sun size={16} aria-hidden="true" /> Fictional pet-service layout</span>
            <h1>Walks they&apos;ll <em>wag</em> about all day long</h1>
            <p>
              A design preview showing how walking, sitting, route-map, and photo-update features
              could be presented by a verified local provider.
            </p>
            <div className="happytails-hero-actions">
              <QuoteButton variant="sun">Preview Quote CTA</QuoteButton>
              <a className="happytails-btn happytails-btn-ghost" href={TEL}>
                <Phone size={18} aria-hidden="true" /> {PHONE}
              </a>
            </div>
            <div className="happytails-hero-trust">
              <span className="happytails-trust-item"><ShieldCheck size={18} aria-hidden="true" /> Credential placeholder</span>
              <span className="happytails-trust-item"><MapPin size={18} aria-hidden="true" /> Example route feature</span>
              <span className="happytails-trust-item"><Camera size={18} aria-hidden="true" /> Example update feature</span>
            </div>
          </div>
          <div className="happytails-hero-visual">
            <div className="happytails-hero-imgwrap">
              <img
                src={IMG.hero}
                alt="Licensed stock photo of a golden dog on a sunny outdoor walk"
                width="1600"
                height="1200"
              />
            </div>
            <div className="happytails-map" role="img" aria-label="Illustration of a sample GPS walk-map component">
              <div className="happytails-map-canvas">
                <span className="happytails-map-park" />
                <span className="happytails-map-pond" />
                <span className="happytails-map-route" />
                <span className="happytails-map-start" />
                <span className="happytails-map-pin"><PawPrint size={26} aria-hidden="true" /></span>
              </div>
              <div className="happytails-map-meta">
                <span className="happytails-map-stat">Example<small>distance</small></span>
                <span className="happytails-map-stat">Sample<small>duration</small></span>
                <span className="happytails-map-live">DEMO</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <PawTrail />

      <section className="happytails-section" id="happytails-services">
        <div className="happytails-wrap">
          <span className="happytails-kicker">Example service cards</span>
          <h2>Preview a pet-care service menu</h2>
          <p className="happytails-section-lead">
            These cards demonstrate information layout only; no walks, visits, or sitting services
            are offered through this fictional page.
          </p>
          <div className="happytails-cards">
            <article className="happytails-card">
              <div className="happytails-imgwrap">
                <img src={IMG.walking} alt="Licensed stock photo of a person walking a leashed dog" loading="lazy" width="900" height="600" />
              </div>
              <div className="happytails-card-body">
                <h3><Footprints size={20} aria-hidden="true" /> GPS-Tracked Walks</h3>
                <p>Example copy showing where a provider could describe walk formats and tracking policies.</p>
                <span className="happytails-card-price">Example price placement</span>
              </div>
            </article>
            <article className="happytails-card">
              <div className="happytails-imgwrap">
                <img src={IMG.sitting} alt="Licensed stock photo of a relaxed dog at home" loading="lazy" width="900" height="600" />
              </div>
              <div className="happytails-card-body">
                <h3><Home size={20} aria-hidden="true" /> In-Home Pet Sitting</h3>
                <p>Example copy showing where a provider could explain visit scope and care policies.</p>
                <span className="happytails-card-price">Example price placement</span>
              </div>
            </article>
            <article className="happytails-card">
              <div className="happytails-imgwrap">
                <img src={IMG.puppy} alt="Licensed stock photo of a young puppy looking up curiously" loading="lazy" width="900" height="600" />
              </div>
              <div className="happytails-card-body">
                <h3><Heart size={20} aria-hidden="true" /> Puppy Visits</h3>
                <p>Example copy showing where a provider could describe puppy-visit options.</p>
                <span className="happytails-card-price">Example price placement</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <PawTrail />

      <section className="happytails-section happytails-section-tint" id="happytails-how">
        <div className="happytails-wrap">
          <span className="happytails-kicker">Example workflow</span>
          <h2>Preview a three-step service flow</h2>
          <p className="happytails-section-lead">This illustrative sequence does not contact, book, or match a real walker.</p>
          <div className="happytails-steps">
            <div className="happytails-step">
              <h3><Phone size={19} aria-hidden="true" /> Preview an enquiry step</h3>
              <p>A real provider could explain what information is needed before offering availability.</p>
            </div>
            <div className="happytails-step">
              <h3><Heart size={19} aria-hidden="true" /> Preview a provider-introduction step</h3>
              <p>This demo does not arrange a meeting or match anyone with a walker.</p>
            </div>
            <div className="happytails-step">
              <h3><MapPin size={19} aria-hidden="true" /> Preview a route-update step</h3>
              <p>The map and update concepts are illustrative; no live route or pet data exists.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="happytails-section">
        <div className="happytails-wrap">
          <div className="happytails-band">
            <div>
              <h2>Preview a walking-service call to action</h2>
              <p>This disabled component does not request a quote or promise a response.</p>
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
          <span className="happytails-kicker">Illustrative gallery</span>
          <h2>Pet-care photo inspiration</h2>
          <p className="happytails-section-lead">Licensed stock images used to demonstrate this fictional service-page layout.</p>
          <div className="happytails-gallery">
            <figure>
              <div className="happytails-imgwrap">
                <img src={IMG.trail} alt="Licensed stock photo of a dog exploring an outdoor trail" loading="lazy" width="900" height="563" />
              </div>
              <figcaption><MapPin size={15} aria-hidden="true" /> Example outdoor-walk image</figcaption>
            </figure>
            <figure>
              <div className="happytails-imgwrap">
                <img src={IMG.cuddle} alt="Licensed stock photo of a dog resting indoors" loading="lazy" width="900" height="563" />
              </div>
              <figcaption><Heart size={15} aria-hidden="true" /> Example in-home care image</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <PawTrail />

      <section className="happytails-section">
        <div className="happytails-wrap">
          <div className="happytails-band">
            <div>
              <h2>Preview the final call-to-action band</h2>
              <p>
                <CheckCircle2 size={15} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 6 }} />
                Fictional provider, illustrative features, and disabled contact controls. No guarantee is offered.
              </p>
            </div>
            <div className="happytails-band-actions">
              <QuoteButton variant="sun" />
              <a className="happytails-btn happytails-btn-ghost" href={TEL}>
                <Phone size={18} aria-hidden="true" /> Demo Call
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
                Fictional dog-walking and pet-sitting page used to demonstrate layout and content structure.
              </p>
            </div>
            <div>
              <p>
                <Clock size={15} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 6 }} />
                No live provider hours &nbsp;·&nbsp; <a href={TEL}>{PHONE}</a>
              </p>
              <p><a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer">Preview Quote CTA →</a></p>
            </div>
          </div>
          <div className="happytails-footer-note">
            <span>© {new Date().getFullYear()} Happy Tails Pet Care. All tails reserved.</span>
            <span>Design demonstration, not a provider listing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
