"use client";

import { useState } from "react";
import {
  Phone,
  ArrowRight,
  Check,
  Star,
  Ruler,
  ClipboardCheck,
  Hammer,
  ShieldCheck,
  Layers,
} from "lucide-react";
import "./cladco-exteriors.css";

const QUOTE_URL = "https://example.com/quote/cladco-exteriors";
const PHONE_DISPLAY = "(833) 555-0121";
const PHONE_TEL = "tel:+18335550121";

const IMG = {
  hero: "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?auto=format&fit=crop&w=1600&q=80",
  vinyl:
    "https://images.unsplash.com/photo-1575397205849-f5e0a03323a3?auto=format&fit=crop&w=900&q=80",
  fiberCement:
    "https://images.unsplash.com/photo-1643733901610-53f7ef2e9f7f?auto=format&fit=crop&w=900&q=80",
  engineeredWood:
    "https://images.unsplash.com/photo-1684841761246-bd116e0bf94c?auto=format&fit=crop&w=900&q=80",
  mosaicWide:
    "https://images.unsplash.com/photo-1591926164531-2bbccbbb0443?auto=format&fit=crop&w=1600&q=80",
  mosaicCard:
    "https://images.unsplash.com/photo-1646640381839-02748ae8ddf0?auto=format&fit=crop&w=900&q=80",
};

const MATERIALS = [
  {
    id: "vinyl",
    label: "Vinyl",
    chip: "#8fa8c4",
    title: "Insulated Vinyl Siding",
    blurb:
      "The workhorse of modern re-sides: color-through panels that never need paint, backed with rigid foam for a straighter wall and a quieter home.",
    points: [
      "Lifetime limited manufacturer warranties",
      "Foam-backed panels rated to 180+ mph winds",
      "Dozens of fade-resistant factory colors",
      "Lowest maintenance of any cladding we install",
    ],
    img: IMG.vinyl,
    alt: "Two-story suburban home freshly clad in light vinyl siding under a clear sky",
  },
  {
    id: "fiber-cement",
    label: "Fiber cement",
    chip: "#7d8a99",
    title: "Fiber-Cement Board & Panel",
    blurb:
      "Cement-and-cellulose boards that shrug off hail, flame and rot. The premium look of painted wood with none of the seasonal upkeep.",
    points: [
      "Class A fire rating and hail-impact resistance",
      "Crisp shadow lines in lap, shake and panel profiles",
      "Factory-baked finishes with 15-year color warranties",
      "Ideal for coastal and storm-prone exposures",
    ],
    img: IMG.fiberCement,
    alt: "Modern home exterior finished with smooth fiber-cement panel siding and dark trim",
  },
  {
    id: "engineered-wood",
    label: "Engineered wood",
    chip: "#a9855c",
    title: "Engineered-Wood Lap & Shake",
    blurb:
      "Real wood strand, resin-fused for stability. Deep authentic grain that takes rich colors — without the cupping and checking of raw lumber.",
    points: [
      "Authentic cedar-grain texture, straighter boards",
      "Treated against termites and fungal decay",
      "Up to 50-year prorated substrate warranties",
      "Warmer curb appeal for craftsman-style homes",
    ],
    img: IMG.engineeredWood,
    alt: "Craftsman house with warm engineered-wood lap siding and a covered front porch",
  },
];

const STEPS = [
  {
    icon: Ruler,
    title: "Measure & Quote",
    text: "A senior estimator walks every elevation, checks the substrate and hands you a fixed line-item price. No allowances, no surprises.",
  },
  {
    icon: ClipboardCheck,
    title: "Design & Order",
    text: "Pick profiles, colors and trim in our sample van at your curb. We handle permits and order material to the board.",
  },
  {
    icon: Hammer,
    title: "Tear-Off & Install",
    text: "Dedicated crews strip to sheathing, correct rot, wrap, flash and hang your new cladding — most homes in 4 to 6 working days.",
  },
  {
    icon: ShieldCheck,
    title: "Inspect & Warranty",
    text: "A project manager walks the finished job with you, magnet-sweeps the yard and registers every manufacturer warranty in your name.",
  },
];

const REVIEWS = [
  {
    quote:
      "They stripped 40-year-old cedar, fixed the rot they found underneath and had fiber cement hung in five days. The line-item quote never moved a dollar.",
    name: "Marta G. — Full Re-Side",
  },
  {
    quote:
      "Three bids, and CladCo was the only crew that talked about housewrap, flashing and ventilation before talking color. That told me everything.",
    name: "Devon R. — Insulated Vinyl",
  },
  {
    quote:
      "The site was cleaner when they left than when they arrived. Two winters in, the engineered wood still looks like the day it went up.",
    name: "Priya & Sam K. — Engineered Wood",
  },
];

function QuoteButton({ className = "cladco-btn cladco-btn-solid", children }) {
  return (
    <a
      className={className}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children || "Get a Free Quote"}
      <ArrowRight size={16} aria-hidden="true" />
    </a>
  );
}

export default function CladCoExteriorsPage() {
  const [active, setActive] = useState(MATERIALS[0].id);
  const material = MATERIALS.find((m) => m.id === active) || MATERIALS[0];

  return (
    <div className="cladco-page">
      <nav className="cladco-nav" aria-label="Primary">
        <div className="cladco-shell cladco-nav-inner">
          <a className="cladco-brand" href="#top">
            <span className="cladco-brand-mark" aria-hidden="true">
              <Layers size={18} />
            </span>
            CladCo Exteriors
          </a>
          <ul className="cladco-nav-links">
            <li><a href="#materials">Materials</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#process">Process</a></li>
            <li><a href="#reviews">Reviews</a></li>
          </ul>
          <div className="cladco-nav-cta">
            <a className="cladco-nav-phone" href={PHONE_TEL}>
              <Phone size={16} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <QuoteButton />
          </div>
        </div>
      </nav>

      <main id="top">
        <header className="cladco-hero">
          <div className="cladco-shell cladco-hero-grid">
            <div className="cladco-hero-copy">
              <span className="cladco-kicker">Siding Installation Specialists</span>
              <h1>Siding installed straight, flashed right, warrantied in writing.</h1>
              <p className="cladco-hero-sub">
                CladCo Exteriors re-sides homes in vinyl, fiber cement and
                engineered wood — with factory-certified crews, fixed line-item
                pricing and a project manager on every job.
              </p>
              <div className="cladco-hero-actions">
                <QuoteButton />
                <a className="cladco-btn cladco-btn-ghost" href={PHONE_TEL}>
                  <Phone size={16} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
              <div className="cladco-hero-stats">
                <div className="cladco-stat">
                  <strong>2,400+</strong>
                  <span>Homes re-sided</span>
                </div>
                <div className="cladco-stat">
                  <strong>18 yrs</strong>
                  <span>In business</span>
                </div>
                <div className="cladco-stat">
                  <strong>4.9/5</strong>
                  <span>Homeowner rating</span>
                </div>
              </div>
            </div>
            <div className="cladco-hero-media">
              <div className="cladco-frame cladco-frame-hero">
                <img
                  src={IMG.hero}
                  alt="Freshly re-sided two-story home with crisp new cladding and clean trim lines"
                />
              </div>
              <span className="cladco-hero-tag">Recent full re-side</span>
            </div>
          </div>
        </header>

        <section id="materials" className="cladco-section" aria-labelledby="cladco-materials-h">
          <div className="cladco-shell">
            <div className="cladco-section-head">
              <h2 id="cladco-materials-h">Three proven claddings. One certified crew.</h2>
              <p>
                We install the three systems we would put on our own homes —
                and we will tell you plainly which one fits your budget,
                exposure and architecture.
              </p>
            </div>
            <div className="cladco-swatch-row" role="tablist" aria-label="Siding materials">
              {MATERIALS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={m.id === active}
                  className={`cladco-swatch${m.id === active ? " cladco-active" : ""}`}
                  onClick={() => setActive(m.id)}
                >
                  <span
                    className="cladco-swatch-chip"
                    style={{ background: m.chip }}
                    aria-hidden="true"
                  />
                  {m.label}
                </button>
              ))}
            </div>
            <div className="cladco-material-panel" key={material.id}>
              <div className="cladco-material-copy">
                <h3>{material.title}</h3>
                <p>{material.blurb}</p>
                <ul className="cladco-check-list">
                  {material.points.map((point) => (
                    <li key={point}>
                      <Check size={16} aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="cladco-material-media">
                <div className="cladco-frame">
                  <img src={material.img} alt={material.alt} loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="cladco-section cladco-section-alt" aria-labelledby="cladco-projects-h">
          <div className="cladco-shell">
            <div className="cladco-section-head">
              <h2 id="cladco-projects-h">Recent installs across the metro</h2>
              <p>
                Every project below was measured, torn off, flashed and hung by
                CladCo employees — never brokered out.
              </p>
            </div>
            <div className="cladco-mosaic">
              <figure className="cladco-mosaic-item cladco-span-2">
                <div className="cladco-frame">
                  <img
                    src={IMG.mosaicWide}
                    alt="Wide view of a finished home exterior with new siding, updated trim and landscaping"
                    loading="lazy"
                  />
                </div>
                <figcaption className="cladco-mosaic-label">Full exterior — fiber cement</figcaption>
              </figure>
              <figure className="cladco-mosaic-item">
                <div className="cladco-frame">
                  <img
                    src={IMG.mosaicCard}
                    alt="Close-up of new lap siding courses meeting freshly wrapped window trim"
                    loading="lazy"
                  />
                </div>
                <figcaption className="cladco-mosaic-label">Trim & flashing detail</figcaption>
              </figure>
              <figure className="cladco-mosaic-item">
                <div className="cladco-frame">
                  <img
                    src={IMG.fiberCement}
                    alt="Contemporary facade re-clad in smooth fiber-cement panels with dark accents"
                    loading="lazy"
                  />
                </div>
                <figcaption className="cladco-mosaic-label">Modern panel re-clad</figcaption>
              </figure>
              <figure className="cladco-mosaic-item">
                <div className="cladco-frame">
                  <img
                    src={IMG.vinyl}
                    alt="Suburban home after an insulated vinyl siding installation in a light neutral tone"
                    loading="lazy"
                  />
                </div>
                <figcaption className="cladco-mosaic-label">Insulated vinyl</figcaption>
              </figure>
              <figure className="cladco-mosaic-item">
                <div className="cladco-frame">
                  <img
                    src={IMG.engineeredWood}
                    alt="Craftsman-style home finished in warm engineered-wood lap siding"
                    loading="lazy"
                  />
                </div>
                <figcaption className="cladco-mosaic-label">Engineered wood</figcaption>
              </figure>
              <div className="cladco-mosaic-cta">
                <h3>Your home could anchor this grid.</h3>
                <QuoteButton className="cladco-btn cladco-btn-invert" />
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="cladco-section" aria-labelledby="cladco-process-h">
          <div className="cladco-shell">
            <div className="cladco-section-head">
              <h2 id="cladco-process-h">A fixed process, start to swept yard</h2>
              <p>
                Four numbered stages, one accountable project manager, zero
                change-order games.
              </p>
            </div>
            <ol className="cladco-rail">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="cladco-step">
                    <span className="cladco-step-num" aria-hidden="true">{i + 1}</span>
                    <h3>
                      <Icon size={16} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 8 }} />
                      {step.title}
                    </h3>
                    <p>{step.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="cladco-band" aria-label="Request a quote">
          <div className="cladco-shell cladco-band-inner">
            <div>
              <h2>Siding season books out fast.</h2>
              <p>
                Free in-person measure, sample boards at your door and a fixed
                written price within 48 hours.
              </p>
            </div>
            <div className="cladco-band-actions">
              <a className="cladco-band-phone" href={PHONE_TEL}>
                <Phone aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
              <QuoteButton className="cladco-btn cladco-btn-invert" />
            </div>
          </div>
        </section>

        <section id="reviews" className="cladco-section" aria-labelledby="cladco-reviews-h">
          <div className="cladco-shell">
            <div className="cladco-section-head">
              <h2 id="cladco-reviews-h">What homeowners say after the dumpster leaves</h2>
              <p>
                Unedited themes from post-project walkthroughs: straight
                courses, clean sites, prices that held.
              </p>
            </div>
            <div className="cladco-review-grid">
              {REVIEWS.map((review) => (
                <figure key={review.name} className="cladco-review">
                  <div className="cladco-stars" aria-label="Rated 5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} size={15} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>{review.quote}</blockquote>
                  <figcaption>{review.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="cladco-final" aria-label="Final call to action">
          <div className="cladco-shell">
            <h2>Ready to stop painting and start living?</h2>
            <p>
              Tell us about your home and get a fixed, line-item siding quote —
              free, in writing, no obligation. Or call and talk to an estimator
              today.
            </p>
            <div className="cladco-final-actions">
              <QuoteButton className="cladco-btn cladco-btn-invert" />
              <a className="cladco-btn cladco-btn-outline-light" href={PHONE_TEL}>
                <Phone size={16} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="cladco-footer">
        <div className="cladco-shell cladco-footer-inner">
          <a className="cladco-brand" href="#top">
            <span className="cladco-brand-mark" aria-hidden="true">
              <Layers size={18} />
            </span>
            CladCo Exteriors
          </a>
          <a className="cladco-nav-phone" href={PHONE_TEL}>
            <Phone size={16} aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
          <p className="cladco-footer-note">
            Independent service provider listing. CladCo Exteriors is a
            fictional brand shown for directory purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
