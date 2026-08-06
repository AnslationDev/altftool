"use client";

import "./furry-stay.css";
import { useState } from "react";
import {
  PawPrint,
  Phone,
  ArrowRight,
  Camera,
  ClipboardCheck,
  Moon,
  Check,
  Heart,
  ShieldCheck,
  Clock,
  Bone,
  Sun,
} from "lucide-react";

const QUOTE_URL = "#demo-only";
const PHONE_DISPLAY = "Demo only";
const PHONE_HREF = "#demo-only";

function QuoteButton({ className = "furrystay-btn furrystay-btn-solid", label = "Preview Quote CTA" }) {
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={className}>
      {label} <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

const AMENITIES = {
  boarding: [
    { icon: Moon, title: "Example overnight-care detail", text: "A real provider could explain staffing coverage and supervision policies here." },
    { icon: Camera, title: "Example camera feature", text: "This card demonstrates where verified camera access and privacy terms could appear." },
    { icon: Heart, title: "Example suite description", text: "Illustrative copy shows how accommodation details could be organized." },
    { icon: ClipboardCheck, title: "Example report card", text: "A provider could document what an update contains and how it is delivered." },
  ],
  daycare: [
    { icon: Sun, title: "Example play-area detail", text: "Illustrative copy shows where a real facility could describe its spaces." },
    { icon: ShieldCheck, title: "Credential placeholder", text: "A verified provider could publish current training, staffing, and safety credentials here." },
    { icon: Clock, title: "Example daily schedule", text: "This item demonstrates how activity and rest periods could be explained." },
    { icon: Bone, title: "Example enrichment detail", text: "A real provider could list verified activities and supervision policies here." },
  ],
};

export default function FurryStayPage() {
  const [tab, setTab] = useState("boarding");

  return (
    <div className="furrystay-page">
      {/* Nav */}
      <header className="furrystay-nav furrystay-wood">
        <div className="furrystay-nav-inner">
          <a href="#furrystay-top" className="furrystay-logo">
            <span className="furrystay-logo-badge"><PawPrint size={22} aria-hidden="true" /></span>
            FurryStay
          </a>
          <div className="furrystay-nav-actions">
            <a href={PHONE_HREF} className="furrystay-nav-phone">
              <Phone size={17} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
            <QuoteButton className="furrystay-btn furrystay-btn-solid furrystay-btn-sm" />
          </div>
        </div>
      </header>

      <main id="furrystay-top">
        {/* Hero */}
        <section className="furrystay-hero" aria-labelledby="furrystay-hero-title">
          <div className="furrystay-hero-media">
            <img
              src="https://images.unsplash.com/photo-1597046835715-16f81ac132c0?auto=format&fit=crop&w=1600&q=80"
              alt="Licensed stock photo of a golden retriever in a warm indoor setting"
            />
          </div>
          <div className="furrystay-wrap">
            <div className="furrystay-hero-inner">
              <div>
                <p className="furrystay-hero-kicker"><PawPrint size={15} aria-hidden="true" /> Fictional boarding &amp; daycare layout</p>
                <h1 id="furrystay-hero-title">
                  A cozy lodge stay for the <em>goodest</em> guests in town
                </h1>
                <p className="furrystay-hero-sub">
                  A design demonstration showing how suites, play areas, cameras, and pet updates
                  could be presented by a verified provider.
                </p>
                <div className="furrystay-hero-ctas">
                  <QuoteButton />
                  <a href={PHONE_HREF} className="furrystay-btn furrystay-btn-ghost">
                    <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
                  </a>
                </div>
                <p className="furrystay-hero-note">Preview content only · No tours, bookings, or live facility</p>
              </div>
              <div className="furrystay-report" aria-label="Sample daily report card">
                <div className="furrystay-report-head">
                  <div>
                    <div className="furrystay-report-title">Biscuit&rsquo;s Report Card</div>
                    <div className="furrystay-report-date">Sample pet · Example date</div>
                  </div>
                  <span className="furrystay-live"><span className="furrystay-live-dot" aria-hidden="true" /> SAMPLE</span>
                </div>
                <div className="furrystay-report-row">
                  <span className="furrystay-report-check"><Check size={15} aria-hidden="true" /></span> Example activity update
                </div>
                <div className="furrystay-report-row">
                  <span className="furrystay-report-check"><Check size={15} aria-hidden="true" /></span> Example meal update
                </div>
                <div className="furrystay-report-row">
                  <span className="furrystay-report-check"><Check size={15} aria-hidden="true" /></span> Example rest update
                </div>
                <p className="furrystay-report-foot">Illustrative report-card component; nothing is sent or stored.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="furrystay-section" aria-label="FurryStay at a glance" style={{ paddingBottom: 0 }}>
          <div className="furrystay-wrap">
            <div className="furrystay-stats">
              <div className="furrystay-stat"><div className="furrystay-stat-num">Suites</div><div className="furrystay-stat-label">Illustrative accommodation copy</div></div>
              <div className="furrystay-stat"><div className="furrystay-stat-num">Staffing</div><div className="furrystay-stat-label">Placeholder policy area</div></div>
              <div className="furrystay-stat"><div className="furrystay-stat-num">Safety</div><div className="furrystay-stat-label">Placeholder credential area</div></div>
              <div className="furrystay-stat"><div className="furrystay-stat-num">Demo</div><div className="furrystay-stat-label">Fictional brand page</div></div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="furrystay-section" aria-labelledby="furrystay-services-title">
          <div className="furrystay-wrap">
            <p className="furrystay-eyebrow"><Bone size={15} aria-hidden="true" /> Example service cards</p>
            <h2 className="furrystay-h2" id="furrystay-services-title">Illustrative boarding and daycare layout</h2>
            <p className="furrystay-lede">
              These cards demonstrate page structure; they do not describe bookable stays or an operating facility.
            </p>
            <div className="furrystay-grid-3">
              <article className="furrystay-card">
                <div className="furrystay-card-media">
                  <img
                    src="https://images.unsplash.com/photo-1558929996-da64ba858215?auto=format&fit=crop&w=900&q=80"
                    alt="Licensed stock photo of dogs playing in an open grass area"
                    loading="lazy"
                  />
                </div>
                <div className="furrystay-card-body">
                  <h3><Sun size={19} aria-hidden="true" /> Play-all-day daycare</h3>
                  <p>Example copy showing where a provider could describe supervised play, rest, and enrichment.</p>
                </div>
              </article>
              <article className="furrystay-card">
                <div className="furrystay-card-media">
                  <img
                    src="https://images.unsplash.com/photo-1689202067146-7854a4d4ba41?auto=format&fit=crop&w=900&q=80"
                    alt="Licensed stock photo of a dog resting on soft bedding"
                    loading="lazy"
                  />
                  <span className="furrystay-card-badge furrystay-live"><span className="furrystay-live-dot" aria-hidden="true" /> SAMPLE</span>
                </div>
                <div className="furrystay-card-body">
                  <h3><Moon size={19} aria-hidden="true" /> Cage-free boarding</h3>
                  <p>Example copy showing where accommodation, supervision, and optional camera policies could appear.</p>
                </div>
              </article>
              <article className="furrystay-card">
                <div className="furrystay-card-media">
                  <img
                    src="https://images.unsplash.com/photo-1518882174711-1de40238921b?auto=format&fit=crop&w=900&q=80"
                    alt="Licensed stock photo of a relaxed dog being brushed"
                    loading="lazy"
                  />
                </div>
                <div className="furrystay-card-body">
                  <h3><Heart size={19} aria-hidden="true" /> Cuddle &amp; care add-ons</h3>
                  <p>Example copy showing where a verified provider could describe optional care services.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Dark amenities split */}
        <section className="furrystay-section furrystay-section-dark furrystay-wood" aria-labelledby="furrystay-lodge-title">
          <div className="furrystay-wrap">
            <div className="furrystay-split">
              <div>
                <p className="furrystay-eyebrow"><Camera size={15} aria-hidden="true" /> Example amenity selector</p>
                <h2 className="furrystay-h2" id="furrystay-lodge-title">Preview two service-detail states</h2>
                <p className="furrystay-lede">Switch between illustrative boarding and daycare content; no live service is offered.</p>
                <div className="furrystay-hero-ctas" role="group" aria-label="Choose a stay style" style={{ marginBottom: 28 }}>
                  <button
                    type="button"
                    className={`furrystay-btn furrystay-btn-sm ${tab === "boarding" ? "furrystay-btn-solid" : "furrystay-btn-ghost"}`}
                    aria-pressed={tab === "boarding"}
                    onClick={() => setTab("boarding")}
                  >
                    <Moon size={16} aria-hidden="true" /> Overnight boarding
                  </button>
                  <button
                    type="button"
                    className={`furrystay-btn furrystay-btn-sm ${tab === "daycare" ? "furrystay-btn-solid" : "furrystay-btn-ghost"}`}
                    aria-pressed={tab === "daycare"}
                    onClick={() => setTab("daycare")}
                  >
                    <Sun size={16} aria-hidden="true" /> Play daycare
                  </button>
                </div>
                <ul className="furrystay-amenities">
                  {AMENITIES[tab].map(({ icon: Icon, title, text }) => (
                    <li key={title}>
                      <span className="furrystay-amenity-icon"><Icon size={17} aria-hidden="true" /></span>
                      <div><strong>{title}</strong><span>{text}</span></div>
                    </li>
                  ))}
                </ul>
                <QuoteButton />
              </div>
              <div className="furrystay-photo-frame">
                <img
                  src="https://images.unsplash.com/photo-1717616729494-10c4c47c1e23?auto=format&fit=crop&w=900&q=80"
                  alt="Licensed stock photo of a dog in a warm indoor setting"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA band */}
        <section className="furrystay-section" aria-labelledby="furrystay-cta-title" style={{ paddingTop: 0 }}>
          <div className="furrystay-wrap">
            <div className="furrystay-cta-band furrystay-wood">
              <div>
                <h2 id="furrystay-cta-title">Preview a pet-service call to action</h2>
                <p>This disabled component does not request a quote, create an account, or contact a provider.</p>
              </div>
              <div className="furrystay-cta-actions">
                <QuoteButton />
                <a href={PHONE_HREF} className="furrystay-btn furrystay-btn-ghost">
                  <Phone size={18} aria-hidden="true" /> Demo Call · {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="furrystay-footer">
        <div className="furrystay-wrap">
          <div className="furrystay-footer-inner">
            <a href="#furrystay-top" className="furrystay-logo">
              <span className="furrystay-logo-badge"><PawPrint size={20} aria-hidden="true" /></span>
              FurryStay
            </a>
            <div className="furrystay-footer-links">
              <a href={PHONE_HREF}><Phone size={14} aria-hidden="true" style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />{PHONE_DISPLAY}</a>
              <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer">Preview Quote CTA</a>
            </div>
          </div>
          <p className="furrystay-fineprint">
            FurryStay is a fictional brand shown for illustration, not a provider listing.
            © {new Date().getFullYear()} FurryStay Lodge. All tails reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
