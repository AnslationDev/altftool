"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Droplets,
  Phone,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import "./gutterflow-pros.css";

const QUOTE_URL = "https://example.com/quote/gutterflow-pros";
const PHONE_DISPLAY = "(855) 555-0232";
const PHONE_TEL = "tel:+18555550232";

const IMG = {
  hero: "https://images.unsplash.com/photo-1620385019253-b051a26048ce?auto=format&fit=crop&w=1600&q=80",
  installs:
    "https://images.unsplash.com/photo-1634853982486-c06f0e17940f?auto=format&fit=crop&w=900&q=80",
  guards:
    "https://images.unsplash.com/photo-1685430996137-b92678138c0b?auto=format&fit=crop&w=900&q=80",
  cleanouts:
    "https://images.unsplash.com/photo-1691265690307-47c9a0cffb0a?auto=format&fit=crop&w=900&q=80",
  process:
    "https://images.unsplash.com/photo-1744044155829-610dded4cead?auto=format&fit=crop&w=1600&q=80",
};

function QuoteButton({ small, children }) {
  return (
    <a
      className={`gutterflow-btn${small ? " gutterflow-btn--small" : ""}`}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children || "Get a Free Quote"}
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  );
}

function PhoneLink({ className }) {
  return (
    <a className={className} href={PHONE_TEL}>
      <Phone size={15} aria-hidden="true" />
      {PHONE_DISPLAY}
    </a>
  );
}

export default function GutterFlowProsPage() {
  const [solidNav, setSolidNav] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolidNav(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="gutterflow-root">
      <header
        className="gutterflow-nav"
        style={solidNav ? { boxShadow: "0 6px 24px rgba(0,0,0,0.35)" } : undefined}
      >
        <div className="gutterflow-shell gutterflow-nav-inner">
          <a className="gutterflow-brand" href="#top">
            <span className="gutterflow-brand-dot" aria-hidden="true" />
            GutterFlow Pros
          </a>
          <nav className="gutterflow-nav-links" aria-label="Sections">
            <a href="#installs">Installs</a>
            <a href="#guards">Guards</a>
            <a href="#cleanouts">Cleanouts</a>
            <a href="#process">Process</a>
          </nav>
          <PhoneLink className="gutterflow-nav-phone" />
          <QuoteButton small />
        </div>
      </header>

      <main id="top">
        <section className="gutterflow-hero" aria-label="Introduction">
          <div className="gutterflow-shell">
            <div className="gutterflow-hero-grid">
              <div>
                <p className="gutterflow-eyebrow">Seamless gutters · Guards · Cleanouts</p>
                <h1>
                  Water where it <span className="gutterflow-accent">belongs</span>.
                  Every storm.
                </h1>
                <p className="gutterflow-hero-lede">
                  GutterFlow Pros measures your roofline, runs seamless aluminum on
                  site and pitches every foot toward the downspout — so rain leaves
                  your fascia, foundation and landscaping alone. Quotes are free and
                  carry no obligation.
                </p>
                <div className="gutterflow-cta-row">
                  <QuoteButton />
                  <PhoneLink className="gutterflow-btn gutterflow-btn--ghost" />
                </div>
              </div>
              <figure className="gutterflow-hero-figure">
                <img
                  src={IMG.hero}
                  alt="Rainwater streaming off a residential roof edge during a storm"
                />
              </figure>
            </div>
          </div>
          <div className="gutterflow-ticker" aria-hidden="true">
            <div className="gutterflow-ticker-track">
              <span>Seamless aluminum</span>
              <span>Micro-mesh guards</span>
              <span>Downspout rerouting</span>
              <span>Seasonal cleanouts</span>
              <span>Fascia-safe hangers</span>
              <span>Seamless aluminum</span>
              <span>Micro-mesh guards</span>
              <span>Downspout rerouting</span>
              <span>Seasonal cleanouts</span>
              <span>Fascia-safe hangers</span>
            </div>
          </div>
        </section>

        <section className="gutterflow-band" id="installs" aria-labelledby="gf-installs-h">
          <span className="gutterflow-numeral" aria-hidden="true">
            01
          </span>
          <div className="gutterflow-shell gutterflow-split">
            <div>
              <p className="gutterflow-eyebrow">Seamless installs</p>
              <h2 id="gf-installs-h">
                One run. <span className="gutterflow-accent">Zero</span> mid-span
                seams.
              </h2>
              <p className="gutterflow-copy">
                Sectional gutters leak where they join. We roll-form each run to the
                exact length of your roofline, on site, so the only joints are at the
                corners — and those get sealed and screwed, not snapped together.
              </p>
              <ul className="gutterflow-checklist">
                <li>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  K-style and half-round profiles in standard and oversized widths
                </li>
                <li>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Hidden hangers fastened into rafter tails, not bare fascia
                </li>
                <li>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Pitch checked with a level on every run before we leave
                </li>
              </ul>
              <QuoteButton />
            </div>
            <figure className="gutterflow-figure gutterflow-figure--tall gutterflow-split-media">
              <img
                src={IMG.installs}
                alt="Installer working along a house roofline on a ladder"
                loading="lazy"
              />
              <figcaption>On-site roll forming</figcaption>
            </figure>
          </div>
        </section>

        <section
          className="gutterflow-band gutterflow-band--dark"
          id="guards"
          aria-labelledby="gf-guards-h"
        >
          <span className="gutterflow-numeral" aria-hidden="true">
            02
          </span>
          <div className="gutterflow-shell gutterflow-split gutterflow-split--flip">
            <div>
              <p className="gutterflow-eyebrow">Gutter guards</p>
              <h2 id="gf-guards-h">
                Keep the <span className="gutterflow-accent">leaves</span> out. Let
                the water in.
              </h2>
              <p className="gutterflow-copy">
                Micro-mesh guards sized to your tree cover and roof pitch. Honest
                caveat: no guard is maintenance-free — heavy pine needles and shingle
                grit still call for an occasional rinse — but a fitted guard turns
                two ladder days a year into a quick hose-down.
              </p>
              <ul className="gutterflow-checklist">
                <li>
                  <ShieldCheck size={18} aria-hidden="true" />
                  Stainless micro-mesh over an aluminum frame, no adhesives
                </li>
                <li>
                  <ShieldCheck size={18} aria-hidden="true" />
                  Fitted under the first shingle course without breaking the seal
                </li>
                <li>
                  <ShieldCheck size={18} aria-hidden="true" />
                  Retrofits onto sound existing gutters — we tell you if yours are not
                </li>
              </ul>
              <QuoteButton />
            </div>
            <figure className="gutterflow-figure gutterflow-split-media">
              <img
                src={IMG.guards}
                alt="Close view of a gutter and roof edge protected from falling debris"
                loading="lazy"
              />
              <figcaption>Micro-mesh, fitted</figcaption>
            </figure>
          </div>
        </section>

        <section className="gutterflow-ctaband" aria-label="Free quote">
          <div className="gutterflow-shell gutterflow-ctaband-inner">
            <div>
              <h2>
                Rain is on the <span className="gutterflow-accent">calendar</span>.
                Are your gutters?
              </h2>
              <p>
                A short call is enough to scope most homes. Availability varies by
                region — we will say so up front if we cannot serve yours.
              </p>
            </div>
            <div className="gutterflow-cta-row">
              <QuoteButton />
              <PhoneLink className="gutterflow-btn gutterflow-btn--ghost" />
            </div>
          </div>
        </section>

        <section className="gutterflow-band" id="cleanouts" aria-labelledby="gf-clean-h">
          <span className="gutterflow-numeral" aria-hidden="true">
            03
          </span>
          <div className="gutterflow-shell gutterflow-split">
            <div>
              <p className="gutterflow-eyebrow">Cleanouts &amp; maintenance</p>
              <h2 id="gf-clean-h">
                Clogged gutters are just <span className="gutterflow-accent">slow</span>{" "}
                leaks.
              </h2>
              <p className="gutterflow-copy">
                An overflowing gutter dumps water straight down your siding and into
                the soil at your foundation. Our cleanout crews clear runs and
                downspouts, flush-test every outlet and photograph anything that
                needs attention — no upsell, just the pictures and a straight answer.
              </p>
              <ul className="gutterflow-checklist">
                <li>
                  <Droplets size={18} aria-hidden="true" />
                  Full clear of runs, outlets and underground drains where accessible
                </li>
                <li>
                  <Droplets size={18} aria-hidden="true" />
                  Flush test with photos of before and after
                </li>
                <li>
                  <Wrench size={18} aria-hidden="true" />
                  Minor re-pitching and hanger tightening handled on the spot
                </li>
              </ul>
              <QuoteButton />
            </div>
            <figure className="gutterflow-figure gutterflow-figure--tall gutterflow-split-media">
              <img
                src={IMG.cleanouts}
                alt="Technician clearing debris from a residential gutter run"
                loading="lazy"
              />
              <figcaption>Cleared and flush-tested</figcaption>
            </figure>
          </div>
        </section>

        <section
          className="gutterflow-band gutterflow-band--dark"
          id="process"
          aria-labelledby="gf-process-h"
        >
          <span className="gutterflow-numeral" aria-hidden="true">
            04
          </span>
          <div className="gutterflow-shell">
            <p className="gutterflow-eyebrow">How it works</p>
            <h2 id="gf-process-h">
              Three steps. No <span className="gutterflow-accent">surprises</span>.
            </h2>
            <div className="gutterflow-steps">
              <div className="gutterflow-step">
                <span className="gutterflow-step-no">Step 01</span>
                <h3>Measure &amp; quote</h3>
                <p>
                  We walk the roofline, measure every run and hand you a written,
                  itemized quote. It is free, and it does not expire the moment we
                  drive away.
                </p>
              </div>
              <div className="gutterflow-step">
                <span className="gutterflow-step-no">Step 02</span>
                <h3>Install day</h3>
                <p>
                  Most single-family homes are done in a day. We form the runs on
                  site, set the pitch and haul off your old gutters and debris.
                </p>
              </div>
              <div className="gutterflow-step">
                <span className="gutterflow-step-no">Step 03</span>
                <h3>Water test</h3>
                <p>
                  Before we call it done, we run water through every outlet and show
                  you the flow. If something is off, we fix it then — not on a
                  callback.
                </p>
              </div>
            </div>
            <figure className="gutterflow-wide-figure">
              <img
                src={IMG.process}
                alt="Completed home exterior with clean rooflines after gutter work"
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        <section className="gutterflow-band" aria-labelledby="gf-honest-h">
          <div className="gutterflow-shell">
            <p className="gutterflow-eyebrow">The fine print, up front</p>
            <h2 id="gf-honest-h">
              What we <span className="gutterflow-accent">will</span> tell you
            </h2>
            <div className="gutterflow-notes">
              <div className="gutterflow-note">
                <h3>Coverage varies</h3>
                <p>
                  Crews operate regionally. If your address is outside our service
                  area, we say so on the first call instead of stringing you along.
                </p>
              </div>
              <div className="gutterflow-note">
                <h3>Licensed where required</h3>
                <p>
                  Work is performed by crews licensed and insured as required in
                  their jurisdiction. Ask for documentation — you should, from
                  anyone.
                </p>
              </div>
              <div className="gutterflow-note">
                <h3>No guard is magic</h3>
                <p>
                  Guards cut maintenance dramatically; they do not eliminate it. We
                  quote based on your actual tree cover, not a brochure promise.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="gutterflow-ctaband" aria-label="Final call to action">
          <div className="gutterflow-shell gutterflow-ctaband-inner">
            <div>
              <h2>
                Get your <span className="gutterflow-accent">free</span> gutter quote
              </h2>
              <p>
                Written, itemized and yours to keep. Or talk to a person right now at{" "}
                {PHONE_DISPLAY}.
              </p>
            </div>
            <div className="gutterflow-cta-row">
              <QuoteButton />
              <PhoneLink className="gutterflow-btn gutterflow-btn--ghost" />
            </div>
          </div>
        </section>
      </main>

      <footer className="gutterflow-footer">
        <div className="gutterflow-shell gutterflow-footer-inner">
          <span>GutterFlow Pros — seamless installs, guards &amp; cleanouts.</span>
          <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          <span className="gutterflow-footer-note">
            Independent service provider listing.
          </span>
        </div>
      </footer>
    </div>
  );
}
