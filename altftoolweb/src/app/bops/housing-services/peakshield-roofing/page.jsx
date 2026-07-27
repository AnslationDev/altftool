"use client";

import "./peakshield-roofing.css";
import {
  Mail,
  ShieldCheck,
  Home,
  Layers,
  Mountain,
  FileCheck,
  Award,
  Clock,
  BadgeCheck,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

// No quote partner and no phone line are live for this page, so every
// conversion CTA points at the site's real contact route.
const CONTACT_URL = "/policypages/contact";
const CONTACT_LABEL = "Contact us";

const IMG = {
  hero: "https://images.unsplash.com/photo-1635424709961-f3a150459ad4?auto=format&fit=crop&w=1600&q=80",
  shingle: "https://images.unsplash.com/photo-1518736346281-76873166a64a?auto=format&fit=crop&w=900&q=80",
  metal: "https://images.unsplash.com/photo-1737739973200-61c2ae4d1272?auto=format&fit=crop&w=900&q=80",
  tile: "https://images.unsplash.com/photo-1690719095815-549c60090c9f?auto=format&fit=crop&w=900&q=80",
  damaged: "https://images.unsplash.com/photo-1562774909-a67585efb8b4?auto=format&fit=crop&w=900&q=80",
  replaced: "https://images.unsplash.com/photo-1726589004565-bedfba94d3a2?auto=format&fit=crop&w=900&q=80",
  crew: "https://images.unsplash.com/photo-1726589004565-bedfba94d3a2?auto=format&fit=crop&w=900&q=80",
};

function QuoteButton({ ghost = false, children = "Get a Free Quote" }) {
  return (
    <a
      className={`peakshield-btn ${ghost ? "peakshield-btn-ghost" : "peakshield-btn-primary"}`}
      href={CONTACT_URL}
    >
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}

export default function PeakShieldRoofingPage() {
  return (
    <div className="peakshield-page">
      {/* Urgency ribbon */}
      <p className="peakshield-ribbon">
        <AlertTriangle size={15} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: "0.4rem" }} />
        Storm damage? We handle the insurance claim —{" "}
        <a href={CONTACT_URL}>call {CONTACT_LABEL} now</a>
      </p>

      {/* Nav */}
      <header className="peakshield-nav">
        <div className="peakshield-container peakshield-nav-inner">
          <a className="peakshield-brand" href="#top" aria-label="PeakShield Roofing home">
            <span className="peakshield-brand-mark" aria-hidden="true">
              <Mountain size={22} />
            </span>
            Peak<em>Shield</em>
          </a>
          <nav aria-label="Primary">
            <ul className="peakshield-nav-links">
              <li><a href="#services">Services</a></li>
              <li><a href="#results">Results</a></li>
              <li><a href="#insurance">Insurance Help</a></li>
              <li><a href="#credentials">Credentials</a></li>
            </ul>
          </nav>
          <div className="peakshield-nav-actions">
            <a className="peakshield-nav-phone" href={CONTACT_URL}>
              <Mail size={17} aria-hidden="true" />
              <span>{CONTACT_LABEL}</span>
            </a>
            <QuoteButton />
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="peakshield-hero" aria-labelledby="peakshield-hero-title">
          <div className="peakshield-hero-media">
            <img
              src={IMG.hero}
              alt="Roofing crew replacing a storm-damaged asphalt shingle roof on a family home"
            />
          </div>
          <div className="peakshield-container">
            <div className="peakshield-hero-inner">
              <p className="peakshield-eyebrow">
                <ShieldCheck size={15} aria-hidden="true" />
                Storm-Damage Roof Replacement Specialists
              </p>
              <h1 id="peakshield-hero-title">
                When the Storm Hits, <span>PeakShield</span> Has You Covered
              </h1>
              <p className="peakshield-hero-sub">
                Hail, wind, or fallen limbs — our certified crews replace storm-damaged
                roofs fast, and our claims team works directly with your insurance
                company so you never fight the paperwork alone.
              </p>
              <div className="peakshield-hero-ctas">
                <QuoteButton />
                <a className="peakshield-btn peakshield-btn-ghost" href={CONTACT_URL}>
                  <Mail size={17} aria-hidden="true" />
                  {CONTACT_LABEL}
                </a>
              </div>
              <div className="peakshield-hero-stats">
                <div className="peakshield-stat">
                  <strong>4,200+</strong>
                  <span>Roofs replaced</span>
                </div>
                <div className="peakshield-stat">
                  <strong>24/7</strong>
                  <span>Storm response line</span>
                </div>
                <div className="peakshield-stat">
                  <strong>50-yr</strong>
                  <span>Material warranties</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="peakshield-section" id="services" aria-labelledby="peakshield-services-title">
          <div className="peakshield-container">
            <div className="peakshield-section-head">
              <p className="peakshield-kicker">What We Install</p>
              <h2 id="peakshield-services-title">Three Roofing Systems, One Standard: Built to Outlast the Weather</h2>
              <p>
                Every PeakShield roof is installed by manufacturer-certified crews and
                backed by workmanship coverage on top of the material warranty.
              </p>
            </div>
            <div className="peakshield-services-grid">
              <article className="peakshield-service-card">
                <div className="peakshield-card-media">
                  <img
                    src={IMG.shingle}
                    alt="Newly installed architectural asphalt shingle roof under a clear sky"
                    loading="lazy"
                  />
                </div>
                <div className="peakshield-card-body">
                  <h3><Home size={19} aria-hidden="true" /> Architectural Shingle</h3>
                  <p>
                    Class 4 impact-rated shingles engineered for hail country, in
                    dimensional profiles that lift curb appeal and resale value.
                  </p>
                </div>
              </article>
              <article className="peakshield-service-card">
                <div className="peakshield-card-media">
                  <img
                    src={IMG.metal}
                    alt="Standing-seam metal roof panels on a modern residential home"
                    loading="lazy"
                  />
                </div>
                <div className="peakshield-card-body">
                  <h3><Layers size={19} aria-hidden="true" /> Standing-Seam Metal</h3>
                  <p>
                    Concealed-fastener metal systems that shrug off 140&nbsp;mph winds,
                    shed snow and hail, and can last half a century with minimal upkeep.
                  </p>
                </div>
              </article>
              <article className="peakshield-service-card">
                <div className="peakshield-card-media">
                  <img
                    src={IMG.tile}
                    alt="Terracotta clay tile roof with classic barrel profile on a stucco home"
                    loading="lazy"
                  />
                </div>
                <div className="peakshield-card-body">
                  <h3><Mountain size={19} aria-hidden="true" /> Clay &amp; Concrete Tile</h3>
                  <p>
                    Timeless tile profiles installed over modern underlayment for
                    fire resistance, thermal comfort, and decades of Mediterranean style.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Before / after comparison */}
        <section className="peakshield-section peakshield-section-alt" id="results" aria-labelledby="peakshield-results-title">
          <div className="peakshield-container">
            <div className="peakshield-section-head">
              <p className="peakshield-kicker">Proof, Not Promises</p>
              <h2 id="peakshield-results-title">From Storm-Battered to Storm-Ready</h2>
              <p>
                A recent hail-claim replacement, completed in two days from adjuster
                approval to final magnetic nail sweep.
              </p>
            </div>
            <div className="peakshield-compare-grid">
              <figure className="peakshield-compare-item" style={{ margin: 0 }}>
                <div className="peakshield-compare-media">
                  <img
                    src={IMG.damaged}
                    alt="Aging roof with weathered, storm-damaged shingles before replacement"
                    loading="lazy"
                  />
                </div>
                <span className="peakshield-compare-tag peakshield-tag-before">
                  <AlertTriangle size={14} aria-hidden="true" /> Before
                </span>
                <figcaption className="peakshield-compare-caption">
                  <h3>Hail-Bruised &amp; Leaking</h3>
                  <p>
                    Granule loss, cracked mats, and exposed decking after a spring
                    hailstorm — documented for the carrier by our inspection team.
                  </p>
                </figcaption>
              </figure>
              <figure className="peakshield-compare-item" style={{ margin: 0 }}>
                <div className="peakshield-compare-media">
                  <img
                    src={IMG.replaced}
                    alt="Completed roof replacement with crisp new shingles and clean flashing lines"
                    loading="lazy"
                  />
                </div>
                <span className="peakshield-compare-tag peakshield-tag-after">
                  <BadgeCheck size={14} aria-hidden="true" /> After
                </span>
                <figcaption className="peakshield-compare-caption">
                  <h3>Replaced &amp; Warrantied</h3>
                  <p>
                    Full tear-off, ice-and-water shield at every eave and valley, and a
                    Class 4 shingle system — claim approved, deductible only.
                  </p>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Insurance process */}
        <section className="peakshield-section" id="insurance" aria-labelledby="peakshield-insurance-title">
          <div className="peakshield-container peakshield-process-wrap">
            <div>
              <div className="peakshield-section-head" style={{ marginBottom: 0 }}>
                <p className="peakshield-kicker">Insurance-Claim Help</p>
                <h2 id="peakshield-insurance-title">We Speak Adjuster, So You Don&rsquo;t Have To</h2>
                <p>
                  Most storm-damage roofs are covered by homeowner&rsquo;s insurance.
                  Our claims specialists document everything and meet your adjuster
                  on-site — you typically pay only your deductible.
                </p>
              </div>
              <ol className="peakshield-steps">
                <li className="peakshield-step">
                  <span className="peakshield-step-num" aria-hidden="true">1</span>
                  <div>
                    <h3>Free Storm Inspection</h3>
                    <p>
                      A certified inspector photographs and maps every point of hail or
                      wind damage — roof, gutters, vents, and siding.
                    </p>
                  </div>
                </li>
                <li className="peakshield-step">
                  <span className="peakshield-step-num" aria-hidden="true">2</span>
                  <div>
                    <h3>Adjuster Meeting, Handled</h3>
                    <p>
                      We meet your insurance adjuster on-site with the evidence file so
                      nothing gets missed or undervalued in the estimate.
                    </p>
                  </div>
                </li>
                <li className="peakshield-step">
                  <span className="peakshield-step-num" aria-hidden="true">3</span>
                  <div>
                    <h3>Replacement in Days</h3>
                    <p>
                      Once approved, our crew completes most replacements in one to two
                      days — full cleanup and magnetic nail sweep included.
                    </p>
                  </div>
                </li>
              </ol>
              <div className="peakshield-midcta">
                <QuoteButton>Start My Free Quote</QuoteButton>
                <a className="peakshield-btn peakshield-btn-ghost" href={CONTACT_URL}>
                  <Mail size={17} aria-hidden="true" />
                  {CONTACT_LABEL}
                </a>
              </div>
            </div>
            <div className="peakshield-process-media">
              <img
                src={IMG.crew}
                alt="PeakShield roofing crew finishing a replacement roof after an approved insurance claim"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="peakshield-section peakshield-section-alt" id="credentials" aria-labelledby="peakshield-credentials-title">
          <div className="peakshield-container">
            <div className="peakshield-section-head">
              <p className="peakshield-kicker">Why Homeowners Trust Us</p>
              <h2 id="peakshield-credentials-title">Certified, Insured, and Accountable</h2>
            </div>
            <ul className="peakshield-badge-row" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li className="peakshield-badge">
                <Award size={30} aria-hidden="true" />
                <h3>Manufacturer Certified</h3>
                <p>Top-tier installer status with leading shingle and metal brands.</p>
              </li>
              <li className="peakshield-badge">
                <ShieldCheck size={30} aria-hidden="true" />
                <h3>Licensed &amp; Insured</h3>
                <p>Fully licensed crews with liability and workers&rsquo; comp coverage.</p>
              </li>
              <li className="peakshield-badge">
                <FileCheck size={30} aria-hidden="true" />
                <h3>Claims Specialists</h3>
                <p>Dedicated team that manages storm-damage insurance paperwork.</p>
              </li>
              <li className="peakshield-badge">
                <Clock size={30} aria-hidden="true" />
                <h3>24/7 Storm Response</h3>
                <p>Emergency tarping and board-up within hours of your call.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Gallery */}
        <section className="peakshield-section" aria-labelledby="peakshield-gallery-title">
          <div className="peakshield-container">
            <div className="peakshield-section-head">
              <p className="peakshield-kicker">Recent Work</p>
              <h2 id="peakshield-gallery-title">Roofs We&rsquo;re Proud to Put Our Name On</h2>
            </div>
            <div className="peakshield-gallery-grid">
              <div className="peakshield-gallery-item">
                <img
                  src={IMG.shingle}
                  alt="Full shingle roof replacement on a two-story suburban home"
                  loading="lazy"
                />
                <span className="peakshield-gallery-label">Impact-rated shingle replacement</span>
              </div>
              <div className="peakshield-gallery-item">
                <img
                  src={IMG.metal}
                  alt="Charcoal standing-seam metal roof installation on a contemporary house"
                  loading="lazy"
                />
                <span className="peakshield-gallery-label">Standing-seam metal upgrade</span>
              </div>
              <div className="peakshield-gallery-item">
                <img
                  src={IMG.tile}
                  alt="Restored clay tile roofline with fresh ridge caps"
                  loading="lazy"
                />
                <span className="peakshield-gallery-label">Clay tile restoration</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA band */}
        <section className="peakshield-cta-band" aria-labelledby="peakshield-final-title">
          <div className="peakshield-container">
            <h2 id="peakshield-final-title">Don&rsquo;t Wait for the Next Storm to Find the Weak Spot</h2>
            <p>
              Free inspection, free quote, and a claims team in your corner. If your
              roof took a hit this season, the clock on your insurance claim is
              already running.
            </p>
            <div className="peakshield-cta-band-actions">
              <QuoteButton>Get My Free Quote</QuoteButton>
              <a className="peakshield-btn peakshield-btn-ghost" href={CONTACT_URL}>
                <Mail size={17} aria-hidden="true" />
                {CONTACT_LABEL}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="peakshield-footer">
        <div className="peakshield-container">
          <div className="peakshield-footer-inner">
            <a className="peakshield-brand" href="#top" aria-label="PeakShield Roofing — back to top">
              <span className="peakshield-brand-mark" aria-hidden="true">
                <Mountain size={22} />
              </span>
              Peak<em>Shield</em>
            </a>
            <a className="peakshield-footer-phone" href={CONTACT_URL}>
              <Mail size={16} aria-hidden="true" />
              {CONTACT_LABEL}
            </a>
          </div>
          <div className="peakshield-footer-meta">
            <span>&copy; {new Date().getFullYear()} PeakShield Roofing. All rights reserved.</span>
            <span>Independent service provider listing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
