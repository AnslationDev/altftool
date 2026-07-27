"use client";

import { useState } from "react";
import {
  Mail,
  Star,
  Plus,
  Check,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import "./aqualux-baths.css";

// No quote partner and no phone line are live for this page, so every
// conversion CTA points at the site's real contact route.
const CONTACT_URL = "/policypages/contact";
const CONTACT_LABEL = "Contact us";

const IMG = {
  hero: "https://images.unsplash.com/photo-1756079664354-34944e001f6d?auto=format&fit=crop&w=1600&q=80",
  shower:
    "https://images.unsplash.com/photo-1754522711595-84428937b07a?auto=format&fit=crop&w=900&q=80",
  tub: "https://images.unsplash.com/photo-1641870538417-c83e621d1425?auto=format&fit=crop&w=900&q=80",
  marble:
    "https://images.unsplash.com/photo-1717497043540-d45bf85e5d38?auto=format&fit=crop&w=900&q=80",
  galleryA:
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=900&q=80",
  galleryB:
    "https://images.unsplash.com/photo-1754574741164-a41418029cfb?auto=format&fit=crop&w=900&q=80",
};

const SERVICES = [
  {
    img: IMG.shower,
    alt: "Frameless glass walk-in shower with rainfall fixture and natural stone tile",
    title: "Walk-In Showers",
    copy: "Frameless glass, rainfall heads and curbless entries — a shower that feels less like a fixture and more like a private retreat.",
    points: ["Curbless, barrier-free entries", "Rainfall and body-spray systems", "Heated flooring options"],
  },
  {
    img: IMG.tub,
    alt: "Freestanding soaking tub beside a large window in a serene spa bathroom",
    title: "Freestanding Tubs",
    copy: "Sculptural soaking tubs placed like furniture — the centerpiece of a room designed for slow evenings and deep quiet.",
    points: ["Stone-resin and acrylic soakers", "Floor-mounted brushed-gold fillers", "Overflow and comfort-depth designs"],
  },
  {
    img: IMG.marble,
    alt: "Book-matched marble slab wall and vanity in a light-filled bathroom",
    title: "Marble & Stone",
    copy: "Book-matched slabs, honed vanities and hand-set mosaic floors — natural stone selected in person, veined to your room.",
    points: ["Slab walls and shower surrounds", "Custom vanities and ledges", "Sealed, low-maintenance finishes"],
  },
];

const STEPS = [
  {
    n: "01",
    title: "Design Consultation",
    copy: "A designer visits your home, measures the space and listens — no pressure, no obligation.",
  },
  {
    n: "02",
    title: "Material Selection",
    copy: "Choose stone, glass and fixtures from curated palettes in our studio or from your sofa.",
  },
  {
    n: "03",
    title: "Master Installation",
    copy: "Licensed, background-checked craftsmen complete most remodels in five to nine working days.",
  },
  {
    n: "04",
    title: "The Reveal",
    copy: "A white-glove walkthrough, lifetime workmanship warranty and a bathroom you will not want to leave.",
  },
];

const QUOTES = [
  {
    text: "The marble work is museum quality. Our primary bath went from builder-grade to the calmest room in the house.",
    name: "Elena R., Scottsdale",
  },
  {
    text: "Nine days, zero surprises. The crew treated our home like their own and the walk-in shower is stunning.",
    name: "Marcus T., Denver",
  },
  {
    text: "From the first sketch to the final polish, everything felt considered. Worth every penny.",
    name: "Priya S., Austin",
  },
];

const FAQS = [
  {
    q: "How long does a full remodel take?",
    a: "Most AquaLux remodels are completed in five to nine working days once materials arrive. Complex slab work or layout changes may extend the schedule slightly — your designer will give you a firm timeline before work begins.",
  },
  {
    q: "Is the in-home consultation really free?",
    a: "Yes. The design visit, measurements and itemized estimate are complimentary and carry no obligation. You will never be asked to sign anything on the first visit.",
  },
  {
    q: "Do you handle plumbing and electrical?",
    a: "Every project is completed by licensed plumbers and electricians on our own crews — never day labor. Permits, inspections and haul-away are all included in your quote.",
  },
  {
    q: "What warranty do you offer?",
    a: "A lifetime workmanship warranty on installation, alongside the full manufacturer warranties on tubs, glass and fixtures. If something is not right, we return and make it right.",
  },
];

function QuoteButton({ variant = "", small = false, children = "Get a Free Quote" }) {
  return (
    <a
      className={`aqualux-btn ${variant} ${small ? "aqualux-btn--small" : ""}`}
      href={CONTACT_URL}
    >
      {children}
      <ArrowRight size={15} aria-hidden="true" />
    </a>
  );
}

export default function AquaLuxBathsPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="aqualux-root">
      {/* ---------- Nav ---------- */}
      <header className="aqualux-nav">
        <div className="aqualux-nav-inner">
          <a className="aqualux-brand" href="#top">
            Aqua<em>Lux</em> Baths
          </a>
          <nav aria-label="Primary">
            <ul className="aqualux-nav-links">
              <li><a href="#services">Services</a></li>
              <li><a href="#gallery">Gallery</a></li>
              <li><a href="#process">Process</a></li>
              <li><a href="#reviews">Reviews</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </nav>
          <div className="aqualux-nav-actions">
            <a className="aqualux-nav-phone" href={CONTACT_URL}>
              <Mail size={15} aria-hidden="true" />
              <span>{CONTACT_LABEL}</span>
            </a>
            <QuoteButton variant="aqualux-btn--gold" small />
          </div>
        </div>
      </header>

      <main id="top">
        {/* ---------- Hero ---------- */}
        <section className="aqualux-hero" aria-labelledby="aqualux-hero-heading">
          <div className="aqualux-hero-copy">
            <p className="aqualux-eyebrow">Spa-Grade Bathroom Remodeling</p>
            <h1 id="aqualux-hero-heading">
              The bath, elevated to <em>a daily ritual</em>
            </h1>
            <hr className="aqualux-hairline" aria-hidden="true" />
            <p className="aqualux-hero-lede">
              Walk-in showers, freestanding tubs and hand-set marble — designed,
              built and finished by one dedicated AquaLux crew, usually in under
              two weeks.
            </p>
            <div className="aqualux-hero-ctas">
              <QuoteButton />
              <a className="aqualux-hero-phone" href={CONTACT_URL}>
                <Mail size={18} aria-hidden="true" />
                {CONTACT_LABEL}
              </a>
            </div>
          </div>
          <div className="aqualux-hero-figure">
            <div className="aqualux-frame aqualux-frame--hero">
              <img
                src={IMG.hero}
                alt="Serene spa-style bathroom with freestanding tub, marble surfaces and soft natural light"
              />
            </div>
            <p className="aqualux-hero-caption">Recent remodel &middot; 8 days</p>
          </div>
        </section>

        {/* ---------- Credentials strip ---------- */}
        <div className="aqualux-strip" role="presentation">
          <div className="aqualux-strip-inner">
            <span className="aqualux-strip-item">
              <ShieldCheck size={17} aria-hidden="true" /> Licensed &amp; Insured
            </span>
            <span className="aqualux-strip-item">
              <Award size={17} aria-hidden="true" /> Lifetime Workmanship Warranty
            </span>
            <span className="aqualux-strip-item">
              <Clock size={17} aria-hidden="true" /> Most Projects: 5&ndash;9 Days
            </span>
            <span className="aqualux-strip-item">
              <Sparkles size={17} aria-hidden="true" /> 2,400+ Baths Completed
            </span>
          </div>
        </div>

        {/* ---------- Services ---------- */}
        <section className="aqualux-section" id="services" aria-labelledby="aqualux-services-heading">
          <div className="aqualux-container">
            <div className="aqualux-section-head">
              <h2 id="aqualux-services-heading">Three crafts, one calm result</h2>
              <hr className="aqualux-hairline" aria-hidden="true" />
              <p>
                Every AquaLux remodel is built around the pieces that matter most
                — water, stone and light.
              </p>
            </div>
            <div className="aqualux-services-grid">
              {SERVICES.map((s) => (
                <article className="aqualux-service-card" key={s.title}>
                  <div className="aqualux-frame aqualux-frame--card">
                    <img src={s.img} alt={s.alt} loading="lazy" />
                  </div>
                  <div className="aqualux-service-body">
                    <h3>{s.title}</h3>
                    <p>{s.copy}</p>
                    <ul className="aqualux-service-list">
                      {s.points.map((p) => (
                        <li key={p}>
                          <Check size={14} aria-hidden="true" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Gallery band ---------- */}
        <section id="gallery" aria-label="Recent project gallery">
          <div className="aqualux-gallery">
            <div className="aqualux-frame">
              <img
                src={IMG.galleryA}
                alt="Minimal bathroom vanity with warm wood, white stone counter and soft morning light"
                loading="lazy"
              />
            </div>
            <div className="aqualux-frame">
              <img
                src={IMG.galleryB}
                alt="Deep freestanding bathtub framed by neutral plaster walls in a completed remodel"
                loading="lazy"
              />
            </div>
            <div className="aqualux-frame">
              <img
                src={IMG.shower}
                alt="Glass-enclosed walk-in shower detail with polished fixtures"
                loading="lazy"
              />
            </div>
            <div className="aqualux-frame">
              <img
                src={IMG.marble}
                alt="Veined marble surfaces and brass hardware in a finished AquaLux bathroom"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* ---------- Craft split ---------- */}
        <section className="aqualux-section" aria-labelledby="aqualux-craft-heading">
          <div className="aqualux-container aqualux-split">
            <div className="aqualux-frame aqualux-frame--tall">
              <img
                src={IMG.tub}
                alt="Craftsman-finished soaking tub installation beside floor-to-ceiling windows"
                loading="lazy"
              />
            </div>
            <div>
              <p className="aqualux-eyebrow">The AquaLux Standard</p>
              <h2 id="aqualux-craft-heading">Quiet luxury, built to last decades</h2>
              <hr className="aqualux-hairline" aria-hidden="true" />
              <p>
                We are not a franchise and we do not subcontract. Each project is
                assigned a single master installer who stays from demolition to
                the final polish — the same face at your door every morning.
              </p>
              <p>
                Stone is sealed twice. Glass is measured after tile, never
                before. Valves are pressure-tested overnight before a single
                panel closes. It is slower our way, and it is why our work
                carries a lifetime warranty.
              </p>
              <div className="aqualux-split-stats">
                <div className="aqualux-stat">
                  <strong>2,400+</strong>
                  <span>Remodels</span>
                </div>
                <div className="aqualux-stat">
                  <strong>4.9</strong>
                  <span>Avg. rating</span>
                </div>
                <div className="aqualux-stat">
                  <strong>18 yrs</strong>
                  <span>In business</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Mid CTA ---------- */}
        <section className="aqualux-cta-band" aria-labelledby="aqualux-midcta-heading">
          <h2 id="aqualux-midcta-heading">See your bathroom, before we build it</h2>
          <hr className="aqualux-hairline" aria-hidden="true" />
          <p>
            Every consultation includes a rendered concept of your finished space
            and an itemized, fixed-price estimate — free, and yours to keep.
          </p>
          <div className="aqualux-cta-band-actions">
            <QuoteButton variant="aqualux-btn--ivory" />
            <a className="aqualux-cta-band-phone" href={CONTACT_URL}>
              <Mail size={18} aria-hidden="true" />
              {CONTACT_LABEL}
            </a>
          </div>
        </section>

        {/* ---------- Process ---------- */}
        <section className="aqualux-section aqualux-section--tint" id="process" aria-labelledby="aqualux-process-heading">
          <div className="aqualux-container">
            <div className="aqualux-section-head">
              <h2 id="aqualux-process-heading">From first sketch to first soak</h2>
              <hr className="aqualux-hairline" aria-hidden="true" />
              <p>A considered process, refined over eighteen years and 2,400 bathrooms.</p>
            </div>
            <div className="aqualux-process-grid">
              {STEPS.map((step) => (
                <div className="aqualux-step" key={step.n}>
                  <span className="aqualux-step-number" aria-hidden="true">
                    {step.n}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Testimonials ---------- */}
        <section className="aqualux-section" id="reviews" aria-labelledby="aqualux-reviews-heading">
          <div className="aqualux-container">
            <div className="aqualux-section-head">
              <h2 id="aqualux-reviews-heading">Words from quiet mornings</h2>
              <hr className="aqualux-hairline" aria-hidden="true" />
              <p>Homeowners on what changed after the dust settled.</p>
            </div>
            <div className="aqualux-quotes-grid">
              {QUOTES.map((q) => (
                <figure className="aqualux-quote" key={q.name}>
                  <div className="aqualux-quote-stars" aria-label="Rated 5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={15} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>&ldquo;{q.text}&rdquo;</blockquote>
                  <figcaption>
                    <cite>{q.name}</cite>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="aqualux-section aqualux-section--tint" id="faq" aria-labelledby="aqualux-faq-heading">
          <div className="aqualux-container">
            <div className="aqualux-section-head">
              <h2 id="aqualux-faq-heading">Considered questions</h2>
              <hr className="aqualux-hairline" aria-hidden="true" />
              <p>The details homeowners ask about most, answered plainly.</p>
            </div>
            <div className="aqualux-faq-list">
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div className="aqualux-faq-item" key={f.q}>
                    <h3>
                      <button
                        type="button"
                        className="aqualux-faq-question"
                        aria-expanded={open}
                        aria-controls={`aqualux-faq-panel-${i}`}
                        onClick={() => setOpenFaq(open ? -1 : i)}
                      >
                        {f.q}
                        <Plus size={18} aria-hidden="true" />
                      </button>
                    </h3>
                    {open && (
                      <div
                        className="aqualux-faq-answer"
                        id={`aqualux-faq-panel-${i}`}
                        role="region"
                        aria-label={f.q}
                      >
                        <p>{f.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="aqualux-final" aria-labelledby="aqualux-final-heading">
          <h2 id="aqualux-final-heading">
            Begin with a <em>free design visit</em>
          </h2>
          <hr className="aqualux-hairline" aria-hidden="true" />
          <p>
            A designer, a tape measure and an honest conversation — then a
            fixed-price quote with no obligation and no follow-up pressure.
          </p>
          <div className="aqualux-final-actions">
            <QuoteButton variant="aqualux-btn--ivory" />
            <a className="aqualux-final-phone" href={CONTACT_URL}>
              <Mail size={20} aria-hidden="true" />
              {CONTACT_LABEL}
            </a>
          </div>
          <p className="aqualux-final-note">Mon&ndash;Sat &middot; 8am to 7pm &middot; Free consultations</p>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="aqualux-footer">
        <div className="aqualux-footer-inner">
          <span className="aqualux-footer-brand">
            Aqua<em>Lux</em> Baths
          </span>
          <a className="aqualux-footer-phone" href={CONTACT_URL}>
            {CONTACT_LABEL}
          </a>
          <span className="aqualux-footer-legal">
            Independent service provider listing
          </span>
        </div>
      </footer>
    </div>
  );
}
