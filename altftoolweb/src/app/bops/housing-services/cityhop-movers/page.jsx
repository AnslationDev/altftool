"use client";

import "./cityhop-movers.css";
import { useState } from "react";
import {
  Phone,
  ArrowRight,
  Menu,
  X,
  Building2,
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

function QuoteButton({ className = "cityhop-btn", label = "Get a Free Quote" }) {
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={className}>
      {label}
      <ArrowRight size={18} className="cityhop-btn-arrow" aria-hidden="true" />
    </a>
  );
}

export default function CityHopMoversPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="cityhop-page">
      <a href="#cityhop-main" className="cityhop-skip">
        Skip to main content
      </a>

      <header className="cityhop-nav">
        <div className="cityhop-wrap cityhop-nav-inner">
          <a href="#cityhop-main" className="cityhop-brand">
            <span className="cityhop-roundel" aria-hidden="true">
              CH
            </span>
            <span className="cityhop-brand-name">
              CityHop Movers
              <span className="cityhop-brand-tag">Apartment &amp; City Moving</span>
            </span>
          </a>
          <nav className="cityhop-nav-links" aria-label="Primary">
            <a href="#cityhop-services">Services</a>
            <a href="#cityhop-how">How it works</a>
            <a href="#cityhop-why">Why CityHop</a>
          </nav>
          <div className="cityhop-nav-cta">
            <a href={PHONE_TEL} className="cityhop-nav-phone">
              <Phone size={16} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <QuoteButton className="cityhop-btn cityhop-btn--sm" />
            <button
              type="button"
              className="cityhop-menu-btn"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div className={`cityhop-mobile-menu${menuOpen ? " cityhop-mobile-menu--open" : ""}`}>
          <a href="#cityhop-services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#cityhop-how" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#cityhop-why" onClick={() => setMenuOpen(false)}>Why CityHop</a>
          <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" onClick={() => setMenuOpen(false)}>
            Get a Free Quote
          </a>
        </div>
      </header>

      <main id="cityhop-main">
        <section className="cityhop-hero">
          <div className="cityhop-wrap cityhop-hero-grid">
            <div>
              <div className="cityhop-chip-row">
                <span className="cityhop-chip">
                  <span className="cityhop-chip-dot cityhop-chip-dot--red">M1</span>
                  Walk-ups &amp; stairs
                </span>
                <span className="cityhop-chip">
                  <span className="cityhop-chip-dot cityhop-chip-dot--blue">M2</span>
                  Service elevators
                </span>
                <span className="cityhop-chip">
                  <span className="cityhop-chip-dot cityhop-chip-dot--green">M3</span>
                  Parking permits
                </span>
              </div>
              <h1>
                City moves that run <em>on schedule</em>.
              </h1>
              <p className="cityhop-hero-copy">
                CityHop crews specialize in apartment buildings: tight stairwells, elevator
                reservations, loading-zone permits and building COI paperwork. Tell us about your
                move and get a clear, no-obligation quote — availability and pricing vary by
                building, date and distance.
              </p>
              <div className="cityhop-hero-ctas">
                <QuoteButton />
                <a href={PHONE_TEL} className="cityhop-nav-phone">
                  <Phone size={16} aria-hidden="true" />
                  Call {PHONE_DISPLAY}
                </a>
              </div>
              <ul className="cityhop-hero-trust">
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Background-checked crews
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Licensed &amp; insured
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  No-obligation quotes
                </li>
              </ul>
            </div>
            <div className="cityhop-hero-media">
              <figure className="cityhop-figure">
                <img
                  src="https://images.unsplash.com/photo-1657049199023-87fb439d47c5?auto=format&fit=crop&w=1600&q=80"
                  alt="Professional movers carrying boxes into a city apartment building"
                />
              </figure>
            </div>
          </div>
        </section>

        <div className="cityhop-stripes" aria-hidden="true">
          <span /><span /><span /><span />
        </div>

        <section id="cityhop-services" className="cityhop-section">
          <div className="cityhop-wrap">
            <div className="cityhop-signhead">
              <span className="cityhop-linebadge cityhop-linebadge--red">M1</span>
              <span className="cityhop-signhead-label">Services</span>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
            <h2>Every kind of city move, one platform</h2>
            <p className="cityhop-section-intro">
              From studio hops across the neighborhood to full-floor relocations, crews are matched
              to your building type and access constraints.
            </p>
            <div className="cityhop-cards">
              <article className="cityhop-card">
                <figure className="cityhop-figure">
                  <img
                    src="https://images.unsplash.com/photo-1682973441491-6b41b7af1c6f?auto=format&fit=crop&w=900&q=80"
                    alt="Moving crew loading furniture into a truck on a city street"
                    loading="lazy"
                  />
                </figure>
                <div className="cityhop-card-body">
                  <h3>Studios &amp; one-bedrooms</h3>
                  <ul>
                    <li><CheckCircle2 size={16} aria-hidden="true" />Walk-up and elevator buildings</li>
                    <li><CheckCircle2 size={16} aria-hidden="true" />Same-neighborhood hops</li>
                    <li><CheckCircle2 size={16} aria-hidden="true" />Packing help available on request</li>
                  </ul>
                </div>
              </article>
              <article className="cityhop-card">
                <figure className="cityhop-figure">
                  <img
                    src="https://images.unsplash.com/photo-1585541867306-d564450f6fe6?auto=format&fit=crop&w=900&q=80"
                    alt="Labeled cardboard moving boxes packed and stacked for a move"
                    loading="lazy"
                  />
                </figure>
                <div className="cityhop-card-body">
                  <h3>Family-size apartments</h3>
                  <ul>
                    <li><CheckCircle2 size={16} aria-hidden="true" />Two crews for multi-floor days</li>
                    <li><CheckCircle2 size={16} aria-hidden="true" />Furniture disassembly &amp; wrap</li>
                    <li><CheckCircle2 size={16} aria-hidden="true" />Elevator reservation coordination</li>
                  </ul>
                </div>
              </article>
              <article className="cityhop-card">
                <figure className="cityhop-figure">
                  <img
                    src="https://images.unsplash.com/photo-1618324650237-31f5208b91bd?auto=format&fit=crop&w=900&q=80"
                    alt="High-rise apartment buildings along a busy city avenue"
                    loading="lazy"
                  />
                </figure>
                <div className="cityhop-card-body">
                  <h3>High-rise &amp; managed buildings</h3>
                  <ul>
                    <li><CheckCircle2 size={16} aria-hidden="true" />COI paperwork handled for you</li>
                    <li><CheckCircle2 size={16} aria-hidden="true" />Loading-dock time slots</li>
                    <li><CheckCircle2 size={16} aria-hidden="true" />Street parking permits where required</li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="cityhop-how" className="cityhop-section cityhop-section--tint">
          <div className="cityhop-wrap">
            <div className="cityhop-signhead">
              <span className="cityhop-linebadge cityhop-linebadge--blue">M2</span>
              <span className="cityhop-signhead-label">How it works</span>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
            <h2>Your move, stop by stop</h2>
            <p className="cityhop-section-intro">
              Four stations from first call to front door. Most quotes come back within one
              business day.
            </p>
            <ol className="cityhop-metroline">
              <li className="cityhop-station">
                <span className="cityhop-station-dot" aria-hidden="true" />
                <span className="cityhop-station-name">Quote St.</span>
                <h3>Tell us about your move</h3>
                <p>Rooms, floors, elevators, dates — two minutes online or by phone.</p>
              </li>
              <li className="cityhop-station">
                <span className="cityhop-station-dot" aria-hidden="true" />
                <span className="cityhop-station-name">Survey Ave.</span>
                <h3>Quick walk-through</h3>
                <p>A video or in-person survey confirms access, volume and pricing.</p>
              </li>
              <li className="cityhop-station">
                <span className="cityhop-station-dot" aria-hidden="true" />
                <span className="cityhop-station-name">Moving Day Ctr.</span>
                <h3>Crew arrives on time</h3>
                <p>Permits posted, elevator booked, floors and doorways protected.</p>
              </li>
              <li className="cityhop-station">
                <span className="cityhop-station-dot" aria-hidden="true" />
                <span className="cityhop-station-name">Home Terminus</span>
                <h3>Set up and signed off</h3>
                <p>Furniture placed, debris removed, final walk-through with you.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="cityhop-band">
          <div className="cityhop-wrap cityhop-band-inner">
            <div>
              <h2>Moving inside the city this month?</h2>
              <p>Peak dates fill fast at month-end. Lock in a crew and a firm arrival window early.</p>
            </div>
            <div className="cityhop-band-actions">
              <QuoteButton className="cityhop-btn cityhop-btn--light" />
              <a href={PHONE_TEL} className="cityhop-band-phone">
                <Phone size={18} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        <section id="cityhop-why" className="cityhop-section">
          <div className="cityhop-wrap">
            <div className="cityhop-signhead">
              <span className="cityhop-linebadge cityhop-linebadge--green">M3</span>
              <span className="cityhop-signhead-label">Why CityHop</span>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
            <h2>Built for buildings, not just boxes</h2>
            <div className="cityhop-why-grid">
              <figure className="cityhop-figure cityhop-figure--wide">
                <img
                  src="https://images.unsplash.com/photo-1772057593098-edb9b9429059?auto=format&fit=crop&w=1600&q=80"
                  alt="Mover securing packed and wrapped items inside a moving van"
                  loading="lazy"
                />
              </figure>
              <ul className="cityhop-feature-list">
                <li className="cityhop-feature">
                  <span className="cityhop-feature-icon"><Building2 size={22} aria-hidden="true" /></span>
                  <div>
                    <h3>Stairs &amp; elevators, planned</h3>
                    <p>Crews sized for your access: fifth-floor walk-ups or booked freight elevators.</p>
                  </div>
                </li>
                <li className="cityhop-feature">
                  <span className="cityhop-feature-icon"><MapPin size={22} aria-hidden="true" /></span>
                  <div>
                    <h3>Parking &amp; permits sorted</h3>
                    <p>Loading-zone permits and dock reservations arranged where your city requires them.</p>
                  </div>
                </li>
                <li className="cityhop-feature">
                  <span className="cityhop-feature-icon"><ShieldCheck size={22} aria-hidden="true" /></span>
                  <div>
                    <h3>Protection that holds up</h3>
                    <p>Floor runners, door jamb guards and furniture wrap included on every job.</p>
                  </div>
                </li>
                <li className="cityhop-feature">
                  <span className="cityhop-feature-icon"><Clock size={22} aria-hidden="true" /></span>
                  <div>
                    <h3>Real arrival windows</h3>
                    <p>Two-hour windows with a heads-up call when the truck is on its way.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="cityhop-stats">
              <div className="cityhop-stat">
                <strong>1 business day</strong>
                <span>Typical quote turnaround</span>
              </div>
              <div className="cityhop-stat">
                <strong>Stairs to high-rise</strong>
                <span>Crews trained for every building type</span>
              </div>
              <div className="cityhop-stat">
                <strong>COI-ready</strong>
                <span>Certificates for managed buildings on request</span>
              </div>
            </div>
            <p className="cityhop-finenote">
              Service availability, crew size and pricing depend on your buildings, date and route.
              All quotes are free and carry no obligation; final pricing is confirmed after the
              survey stop.
            </p>
          </div>
        </section>

        <section className="cityhop-band cityhop-band--dark">
          <div className="cityhop-wrap cityhop-band-inner">
            <div>
              <h2>Next stop: your new place.</h2>
              <p>Get a free, no-obligation quote in about two minutes — or talk to a real coordinator.</p>
            </div>
            <div className="cityhop-band-actions">
              <QuoteButton />
              <a href={PHONE_TEL} className="cityhop-band-phone">
                <Phone size={18} aria-hidden="true" />
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="cityhop-footer">
        <div className="cityhop-wrap cityhop-footer-inner">
          <a href="#cityhop-main" className="cityhop-brand">
            <span className="cityhop-roundel" aria-hidden="true">CH</span>
            <span className="cityhop-brand-name">CityHop Movers</span>
          </a>
          <div className="cityhop-footer-links">
            <a href="#cityhop-services">Services</a>
            <a href="#cityhop-how">How it works</a>
            <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          </div>
          <p className="cityhop-footer-note">Independent service provider listing</p>
        </div>
      </footer>
    </div>
  );
}
