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
  Star,
  Heart,
  ShieldCheck,
  Clock,
  Bone,
  Sun,
} from "lucide-react";

const QUOTE_URL = "#demo-only";
const PHONE_DISPLAY = "Demo only";
const PHONE_HREF = "#demo-only";

function QuoteButton({ className = "furrystay-btn furrystay-btn-solid", label = "Get a Free Quote" }) {
  return (
    <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer" className={className}>
      {label} <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

const AMENITIES = {
  boarding: [
    { icon: Moon, title: "Overnight staff, always awake", text: "A caregiver stays on-site all night, so someone is steps away at 3 a.m." },
    { icon: Camera, title: "Live suite cameras", text: "Peek in on your pup anytime from the lodge's streaming cams." },
    { icon: Heart, title: "Cage-free cabin suites", text: "Cozy bedded rooms with lodge warmth — never wire crates or concrete runs." },
    { icon: ClipboardCheck, title: "Evening report card", text: "Meals, naps, play minutes and mood — texted to you before bedtime." },
  ],
  daycare: [
    { icon: Sun, title: "Half-acre play yards", text: "Small, temperament-matched groups romp on turf and shaded decks." },
    { icon: ShieldCheck, title: "Certified play supervisors", text: "One trained handler for every eight dogs, pet-CPR certified." },
    { icon: Clock, title: "Structured nap breaks", text: "Every zoomie session is balanced with quiet den time to recharge." },
    { icon: Bone, title: "Enrichment stations", text: "Sniff walls, puzzle feeders and splash pools rotate through the day." },
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
              alt="Happy golden retriever relaxing in a warm, sunlit boarding lodge"
            />
          </div>
          <div className="furrystay-wrap">
            <div className="furrystay-hero-inner">
              <div>
                <p className="furrystay-hero-kicker"><PawPrint size={15} aria-hidden="true" /> Cage-free boarding &amp; daycare</p>
                <h1 id="furrystay-hero-title">
                  A cozy lodge stay for the <em>goodest</em> guests in town
                </h1>
                <p className="furrystay-hero-sub">
                  Cabin-style suites, half-acre play yards, live cameras and a daily report card —
                  so your best friend vacations while you do.
                </p>
                <div className="furrystay-hero-ctas">
                  <QuoteButton />
                  <a href={PHONE_HREF} className="furrystay-btn furrystay-btn-ghost">
                    <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
                  </a>
                </div>
                <p className="furrystay-hero-note">Free meet-and-sniff tours daily · Overnight staff on-site</p>
              </div>
              <div className="furrystay-report" aria-label="Sample daily report card">
                <div className="furrystay-report-head">
                  <div>
                    <div className="furrystay-report-title">Biscuit&rsquo;s Report Card</div>
                    <div className="furrystay-report-date">Golden Retriever · Today</div>
                  </div>
                  <span className="furrystay-live"><span className="furrystay-live-dot" aria-hidden="true" /> LIVE</span>
                </div>
                <div className="furrystay-report-row">
                  <span className="furrystay-report-check"><Check size={15} aria-hidden="true" /></span> Played 2h in the maple yard
                </div>
                <div className="furrystay-report-row">
                  <span className="furrystay-report-check"><Check size={15} aria-hidden="true" /></span> Ate well — cleaned the bowl
                </div>
                <div className="furrystay-report-row">
                  <span className="furrystay-report-check"><Check size={15} aria-hidden="true" /></span> Nap 90min by the fireplace
                </div>
                <p className="furrystay-report-foot">Sent to your phone every evening, tail-wag guaranteed.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="furrystay-section" aria-label="FurryStay at a glance" style={{ paddingBottom: 0 }}>
          <div className="furrystay-wrap">
            <div className="furrystay-stats">
              <div className="furrystay-stat"><div className="furrystay-stat-num">100%</div><div className="furrystay-stat-label">Cage-free suites</div></div>
              <div className="furrystay-stat"><div className="furrystay-stat-num">24/7</div><div className="furrystay-stat-label">Overnight staff</div></div>
              <div className="furrystay-stat"><div className="furrystay-stat-num">1:8</div><div className="furrystay-stat-label">Handler-to-dog ratio</div></div>
              <div className="furrystay-stat"><div className="furrystay-stat-num">4.9★</div><div className="furrystay-stat-label">Average pet-parent rating</div></div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="furrystay-section" aria-labelledby="furrystay-services-title">
          <div className="furrystay-wrap">
            <p className="furrystay-eyebrow"><Bone size={15} aria-hidden="true" /> What we do</p>
            <h2 className="furrystay-h2" id="furrystay-services-title">Boarding, daycare and everything in between</h2>
            <p className="furrystay-lede">
              Whether it&rsquo;s one wiggly afternoon or a two-week getaway, every guest gets lodge-level comfort and a full itinerary of fun.
            </p>
            <div className="furrystay-grid-3">
              <article className="furrystay-card">
                <div className="furrystay-card-media">
                  <img
                    src="https://images.unsplash.com/photo-1558929996-da64ba858215?auto=format&fit=crop&w=900&q=80"
                    alt="Dogs playing together in an open grass play yard"
                    loading="lazy"
                  />
                </div>
                <div className="furrystay-card-body">
                  <h3><Sun size={19} aria-hidden="true" /> Play-all-day daycare</h3>
                  <p>Temperament-matched playgroups, splash pools and enrichment stations, with structured naps so pups come home happy — not frazzled.</p>
                </div>
              </article>
              <article className="furrystay-card">
                <div className="furrystay-card-media">
                  <img
                    src="https://images.unsplash.com/photo-1689202067146-7854a4d4ba41?auto=format&fit=crop&w=900&q=80"
                    alt="Contented dog snuggled into soft bedding in a cabin suite"
                    loading="lazy"
                  />
                  <span className="furrystay-card-badge furrystay-live"><span className="furrystay-live-dot" aria-hidden="true" /> LIVE</span>
                </div>
                <div className="furrystay-card-body">
                  <h3><Moon size={19} aria-hidden="true" /> Cage-free boarding</h3>
                  <p>Cabin suites with real beds, bedtime biscuits and an awake overnight caregiver. Watch your pup snooze on our live suite cameras.</p>
                </div>
              </article>
              <article className="furrystay-card">
                <div className="furrystay-card-media">
                  <img
                    src="https://images.unsplash.com/photo-1518882174711-1de40238921b?auto=format&fit=crop&w=900&q=80"
                    alt="Caregiver gently brushing a relaxed dog during a spa session"
                    loading="lazy"
                  />
                </div>
                <div className="furrystay-card-body">
                  <h3><Heart size={19} aria-hidden="true" /> Cuddle &amp; care add-ons</h3>
                  <p>Fireside cuddle sessions, brush-outs, sniffari walks and medication care — tailored to seniors, shy pups and puppies alike.</p>
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
                <p className="furrystay-eyebrow"><Camera size={15} aria-hidden="true" /> Inside the lodge</p>
                <h2 className="furrystay-h2" id="furrystay-lodge-title">Watch the wag from anywhere</h2>
                <p className="furrystay-lede">Pick a stay style to see what&rsquo;s included — every option comes with live cameras and a nightly report card.</p>
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
                  alt="Dog looking toward the camera inside a warm, wood-toned lodge suite"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials + photo */}
        <section className="furrystay-section" aria-labelledby="furrystay-tails-title">
          <div className="furrystay-wrap">
            <p className="furrystay-eyebrow"><Star size={15} aria-hidden="true" /> Happy tails</p>
            <h2 className="furrystay-h2" id="furrystay-tails-title">Pet parents rest easy too</h2>
            <p className="furrystay-lede">Real notes from the humans who check the live cams a little too often.</p>
            <div className="furrystay-grid-3">
              <blockquote className="furrystay-quote">
                <div className="furrystay-quote-stars" aria-label="5 out of 5 stars">
                  <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                </div>
                <p>&ldquo;The nightly report card is my favorite text of the day. Biscuit comes home tired, happy and smelling like cedar.&rdquo;</p>
                <footer>— Priya M., boards monthly</footer>
              </blockquote>
              <blockquote className="furrystay-quote">
                <div className="furrystay-quote-stars" aria-label="5 out of 5 stars">
                  <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                </div>
                <p>&ldquo;Our anxious rescue actually pulls toward the door at drop-off now. The small playgroups made all the difference.&rdquo;</p>
                <footer>— Daniel R., daycare regular</footer>
              </blockquote>
              <div className="furrystay-card">
                <div className="furrystay-card-media" style={{ aspectRatio: "4 / 5" }}>
                  <img
                    src="https://images.unsplash.com/photo-1645910155173-888eef2f2ade?auto=format&fit=crop&w=900&q=80"
                    alt="Joyful dog mid-play outdoors at the FurryStay play yard"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA band */}
        <section className="furrystay-section" aria-labelledby="furrystay-cta-title" style={{ paddingTop: 0 }}>
          <div className="furrystay-wrap">
            <div className="furrystay-cta-band furrystay-wood">
              <div>
                <h2 id="furrystay-cta-title">Ready for their best sleepover yet?</h2>
                <p>Get a personalized stay quote in minutes — no account, no obligation, lots of tail wags.</p>
              </div>
              <div className="furrystay-cta-actions">
                <QuoteButton />
                <a href={PHONE_HREF} className="furrystay-btn furrystay-btn-ghost">
                  <Phone size={18} aria-hidden="true" /> Call {PHONE_DISPLAY}
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
              <a href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer">Get a Free Quote</a>
            </div>
          </div>
          <p className="furrystay-fineprint">
            FurryStay is a fictional brand shown for illustration. Independent service provider listing.
            © {new Date().getFullYear()} FurryStay Lodge. All tails reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
