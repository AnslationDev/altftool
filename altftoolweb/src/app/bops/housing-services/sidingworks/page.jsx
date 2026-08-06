"use client";

import "./sidingworks.css";
import {
  Phone,
  ArrowUpRight,
  Ruler,
  Palette,
  Layers,
  ShieldCheck,
  PencilRuler,
  Hammer,
} from "lucide-react";

const QUOTE_URL = "#demo-only";
const TEL_HREF = "#demo-only";
const TEL_LABEL = "Demo only";

const IMG = {
  hero: "https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?auto=format&fit=crop&w=1600&q=80",
  cardA: "https://images.unsplash.com/photo-1722421492323-eaf9c401befe?auto=format&fit=crop&w=900&q=80",
  cardB: "https://images.unsplash.com/photo-1605018075968-b014b8d2e487?auto=format&fit=crop&w=900&q=80",
  cardC: "https://images.unsplash.com/photo-1712806383411-a4edbec75b17?auto=format&fit=crop&w=900&q=80",
  wide: "https://images.unsplash.com/photo-1760067537265-dc9f11824eda?auto=format&fit=crop&w=1600&q=80",
  tall: "https://images.unsplash.com/photo-1605018075968-b014b8d2e487?auto=format&fit=crop&w=900&q=80",
};

function QuoteButton({ variant = "", children = "Get a Free Quote" }) {
  return (
    <a
      className={`sidingworks-btn ${variant}`.trim()}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}

export default function SidingWorksPage() {
  return (
    <div className="sidingworks-root">
      <header className="sidingworks-nav">
        <div className="sidingworks-shell sidingworks-nav-inner">
          <a className="sidingworks-wordmark" href="#sidingworks-top">
            <span className="sidingworks-wordmark-block" aria-hidden="true" />
            <span className="sidingworks-wordmark-block sidingworks-wordmark-block--blue" aria-hidden="true" />
            SidingWorks Studio
          </a>
          <div className="sidingworks-nav-actions">
            <a className="sidingworks-nav-tel" href={TEL_HREF}>
              <Phone size={16} aria-hidden="true" />
              <span>{TEL_LABEL}</span>
            </a>
            <QuoteButton variant="sidingworks-btn--nav" />
          </div>
        </div>
      </header>

      <main id="sidingworks-top" className="sidingworks-gridfield">
        <section className="sidingworks-hero">
          <div className="sidingworks-shell">
            <div className="sidingworks-hero-grid">
              <div className="sidingworks-hero-copy">
                <span className="sidingworks-kicker">Design-led exterior cladding</span>
                <h1 className="sidingworks-h1">
                  Siding as <span className="sidingworks-h1-accent">form,</span>{" "}
                  colour <span className="sidingworks-h1-accent--blue">&amp; line.</span>
                </h1>
                <p className="sidingworks-lede">
                  SidingWorks Studio plans architectural siding the way a poster is
                  composed: colour studies first, material honesty always. Talk
                  through your facade with a specialist — quotes are free and
                  availability varies by region.
                </p>
                <div className="sidingworks-hero-ctas">
                  <QuoteButton />
                  <a className="sidingworks-btn sidingworks-btn--ghost" href={TEL_HREF}>
                    <Phone size={18} aria-hidden="true" />
                    {TEL_LABEL}
                  </a>
                </div>
              </div>
              <figure className="sidingworks-hero-figure">
                <img
                  src={IMG.hero}
                  alt="Modern home exterior with clean architectural siding lines"
                />
                <figcaption className="sidingworks-hero-chip">
                  Colour study no. 04
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <div className="sidingworks-bar" aria-hidden="true">
          <span /><span /><span /><span />
        </div>

        <section className="sidingworks-section" aria-labelledby="sidingworks-services-title">
          <div className="sidingworks-shell">
            <div className="sidingworks-section-head">
              <span className="sidingworks-outline-num" aria-hidden="true">01</span>
              <div>
                <h2 className="sidingworks-h2" id="sidingworks-services-title">
                  The studio programme
                </h2>
                <p className="sidingworks-section-sub">
                  Three disciplines, one facade. Scope and finishes are confirmed
                  during your consultation — no two elevations are treated alike.
                </p>
              </div>
            </div>
            <div className="sidingworks-cards">
              <article className="sidingworks-card">
                <div className="sidingworks-card-figure">
                  <img
                    src={IMG.cardA}
                    alt="House facade detail showing panel siding texture and colour"
                    loading="lazy"
                  />
                </div>
                <div className="sidingworks-card-body">
                  <span className="sidingworks-card-tag">Colour</span>
                  <h3 className="sidingworks-h3">Colour studies</h3>
                  <p className="sidingworks-card-text">
                    Palette sampling on your actual elevation and light conditions
                    before a single board is ordered, so the finished tone reads
                    true at street distance.
                  </p>
                </div>
              </article>
              <article className="sidingworks-card">
                <div className="sidingworks-card-figure">
                  <img
                    src={IMG.cardB}
                    alt="Exterior wall with vertical siding boards in even rhythm"
                    loading="lazy"
                  />
                </div>
                <div className="sidingworks-card-body">
                  <span className="sidingworks-card-tag sidingworks-card-tag--blue">Material</span>
                  <h3 className="sidingworks-h3">Architectural siding</h3>
                  <p className="sidingworks-card-text">
                    Fiber cement, engineered wood and metal profiles set out with
                    consistent reveals and honest junctions — installed by vetted
                    regional crews.
                  </p>
                </div>
              </article>
              <article className="sidingworks-card">
                <div className="sidingworks-card-figure">
                  <img
                    src={IMG.cardC}
                    alt="Residential exterior with contrasting cladding sections"
                    loading="lazy"
                  />
                </div>
                <div className="sidingworks-card-body">
                  <span className="sidingworks-card-tag sidingworks-card-tag--ink">Detail</span>
                  <h3 className="sidingworks-h3">Trim &amp; junctions</h3>
                  <p className="sidingworks-card-text">
                    Corners, soffits and window returns resolved on paper first.
                    The small lines are where a facade succeeds or fails.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <div className="sidingworks-midband">
          <div className="sidingworks-shell sidingworks-midband-inner">
            <h2 className="sidingworks-midband-title">
              A facade worth drawing? Start with a free quote.
            </h2>
            <div className="sidingworks-midband-ctas">
              <QuoteButton variant="sidingworks-btn--blue" />
              <a className="sidingworks-btn sidingworks-btn--ghost" href={TEL_HREF}>
                <Phone size={18} aria-hidden="true" />
                Call {TEL_LABEL}
              </a>
            </div>
          </div>
        </div>

        <section className="sidingworks-section" aria-labelledby="sidingworks-process-title">
          <div className="sidingworks-shell">
            <div className="sidingworks-section-head">
              <span className="sidingworks-outline-num" aria-hidden="true">02</span>
              <div>
                <h2 className="sidingworks-h2" id="sidingworks-process-title">
                  How a project runs
                </h2>
                <p className="sidingworks-section-sub">
                  A fixed sequence keeps decisions visible. Timelines depend on
                  material lead times and season.
                </p>
              </div>
            </div>
            <div className="sidingworks-steps">
              <div className="sidingworks-step">
                <span className="sidingworks-step-num" aria-hidden="true">A</span>
                <div>
                  <h3 className="sidingworks-h3">Site read &amp; measure</h3>
                  <p className="sidingworks-step-text">
                    A specialist walks the elevations, notes orientation and
                    weathering, and takes exact measurements for the study.
                  </p>
                </div>
                <Ruler className="sidingworks-step-icon" size={30} aria-hidden="true" />
              </div>
              <div className="sidingworks-step">
                <span className="sidingworks-step-num" aria-hidden="true">B</span>
                <div>
                  <h3 className="sidingworks-h3">Colour &amp; profile study</h3>
                  <p className="sidingworks-step-text">
                    You review board profiles and a short palette study — two or
                    three deliberate options, not an endless swatch fan.
                  </p>
                </div>
                <Palette className="sidingworks-step-icon" size={30} aria-hidden="true" />
              </div>
              <div className="sidingworks-step">
                <span className="sidingworks-step-num" aria-hidden="true">C</span>
                <div>
                  <h3 className="sidingworks-h3">Layered install</h3>
                  <p className="sidingworks-step-text">
                    Weather barrier, flashing and cladding go on in documented
                    layers, with photo checkpoints at each stage.
                  </p>
                </div>
                <Layers className="sidingworks-step-icon" size={30} aria-hidden="true" />
              </div>
              <div className="sidingworks-step">
                <span className="sidingworks-step-num" aria-hidden="true">D</span>
                <div>
                  <h3 className="sidingworks-h3">Walkthrough &amp; warranty</h3>
                  <p className="sidingworks-step-text">
                    A final line-by-line walkthrough, then manufacturer and
                    workmanship warranty terms in writing where applicable.
                  </p>
                </div>
                <ShieldCheck className="sidingworks-step-icon" size={30} aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section className="sidingworks-section" aria-labelledby="sidingworks-work-title">
          <div className="sidingworks-shell">
            <div className="sidingworks-section-head">
              <span className="sidingworks-outline-num" aria-hidden="true">03</span>
              <div>
                <h2 className="sidingworks-h2" id="sidingworks-work-title">
                  Recent compositions
                </h2>
                <p className="sidingworks-section-sub">
                  Representative work in the style of the studio. Every project is
                  scoped and priced individually.
                </p>
              </div>
            </div>
            <div className="sidingworks-gallery">
              <figure className="sidingworks-gallery-item">
                <img
                  src={IMG.wide}
                  alt="Contemporary house exterior with bold cladding composition"
                  loading="lazy"
                />
                <figcaption className="sidingworks-gallery-caption">
                  Study — horizontal rhythm
                </figcaption>
              </figure>
              <figure className="sidingworks-gallery-item sidingworks-gallery-item--tall">
                <img
                  src={IMG.tall}
                  alt="Close view of siding boards showing shadow lines and reveals"
                  loading="lazy"
                />
                <figcaption className="sidingworks-gallery-caption">
                  Detail — shadow line
                </figcaption>
              </figure>
              <figure className="sidingworks-gallery-item">
                <img
                  src={IMG.cardA}
                  alt="Finished home exterior with coordinated siding palette"
                  loading="lazy"
                />
                <figcaption className="sidingworks-gallery-caption">
                  Palette — primary block
                </figcaption>
              </figure>
            </div>

            <div className="sidingworks-facts" style={{ marginTop: 44 }}>
              <div className="sidingworks-fact">
                <div className="sidingworks-fact-value">2–3</div>
                <div className="sidingworks-fact-label">
                  Palette options per study — deliberate, not overwhelming
                </div>
              </div>
              <div className="sidingworks-fact">
                <div className="sidingworks-fact-value">
                  <PencilRuler size={36} aria-hidden="true" style={{ verticalAlign: "-6px" }} /> First
                </div>
                <div className="sidingworks-fact-label">
                  Drawn before built — junctions resolved on paper
                </div>
              </div>
              <div className="sidingworks-fact">
                <div className="sidingworks-fact-value">
                  <Hammer size={36} aria-hidden="true" style={{ verticalAlign: "-6px" }} /> Vetted
                </div>
                <div className="sidingworks-fact-label">
                  Regional installer network — availability varies by area
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sidingworks-final" aria-labelledby="sidingworks-final-title">
          <div className="sidingworks-shell sidingworks-final-inner">
            <h2 className="sidingworks-final-title" id="sidingworks-final-title">
              Put your facade on the drawing board.
            </h2>
            <p className="sidingworks-final-sub">
              Request a free, no-obligation quote or speak with a siding
              specialist. Service coverage and pricing depend on your location and
              project scope.
            </p>
            <div className="sidingworks-final-ctas">
              <QuoteButton variant="sidingworks-btn--yellow" />
              <a className="sidingworks-final-tel" href={TEL_HREF}>
                <Phone size={18} aria-hidden="true" />
                {TEL_LABEL}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="sidingworks-footer">
        <div className="sidingworks-shell sidingworks-footer-inner">
          <span>SidingWorks Studio — design-led cladding</span>
          <a href={TEL_HREF}>{TEL_LABEL}</a>
          <span className="sidingworks-footer-note">
            Independent service provider listing
          </span>
        </div>
      </footer>
    </div>
  );
}
