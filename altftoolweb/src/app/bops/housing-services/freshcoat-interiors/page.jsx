"use client";

import "./freshcoat-interiors.css";
import { useState } from "react";
import {
  Phone,
  Paintbrush,
  Palette,
  Sparkles,
  Star,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Droplets,
  Home,
  ShieldCheck,
  Clock,
} from "lucide-react";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

const IMG = {
  hero: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80",
  livingRoom: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80",
  bedroom: "https://images.unsplash.com/photo-1561111283-8eff0e921cf6?auto=format&fit=crop&w=900&q=80",
  kitchen: "https://images.unsplash.com/photo-1598718544285-7180f670198b?auto=format&fit=crop&w=900&q=80",
  hallway: "https://images.unsplash.com/photo-1523413307857-ef24c53571ae?auto=format&fit=crop&w=900&q=80",
  detail: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=900&q=80",
};

const RAINBOW = ["#f0473a", "#f5a623", "#e8c832", "#3e9e5f", "#2f8fc4", "#8055c9", "#e2568f"];

const NAV_LINKS = [
  { href: "#freshcoat-services", label: "Services" },
  { href: "#freshcoat-colours", label: "Colours" },
  { href: "#freshcoat-process", label: "Process" },
  { href: "#freshcoat-gallery", label: "Gallery" },
  { href: "#freshcoat-reviews", label: "Reviews" },
];

const SERVICES = [
  {
    icon: Home,
    title: "Whole-room repaints",
    img: IMG.livingRoom,
    alt: "Sunlit living room with soft neutral painted walls and a comfortable white sofa",
    text: "Walls, ceilings, trim and doors finished as one cohesive look — patched, sanded, primed and painted to a furniture-showroom standard.",
  },
  {
    icon: Palette,
    title: "Colour styling",
    img: IMG.bedroom,
    alt: "Cosy bedroom corner with a painted feature wall behind a neatly made bed",
    text: "Our stylist builds a palette around your light, furniture and mood board, then paints real test swatches so you choose with confidence.",
  },
  {
    icon: Droplets,
    title: "Cabinets & trim",
    img: IMG.kitchen,
    alt: "Freshly refinished kitchen cabinetry with smooth painted fronts and brass hardware",
    text: "Sprayed-smooth cabinet fronts, banisters and built-ins that look factory finished — a kitchen glow-up without the renovation bill.",
  },
];

const SWATCHES = [
  { hex: "#f0473a", name: "Coral Pop", note: "Front doors and feature walls" },
  { hex: "#f6c445", name: "Butter Toast", note: "Sunny kitchens and nooks" },
  { hex: "#9db97c", name: "Sage Whisper", note: "Calm bedrooms" },
  { hex: "#7fb5d5", name: "Sky Wash", note: "Bathrooms and studies" },
  { hex: "#a98bd4", name: "Lilac Haze", note: "Playful kids' rooms" },
  { hex: "#e7a2b4", name: "Blush Note", note: "Soft accent ceilings" },
];

const STEPS = [
  {
    color: "#f0473a",
    title: "Colour chat",
    text: "A 20-minute walkthrough of your rooms, light and mood. We bring the fan decks and the big swatch boards.",
  },
  {
    color: "#f5a623",
    title: "Honest quote",
    text: "One clear price covering prep, premium paint and cleanup. No surprise line items, ever.",
  },
  {
    color: "#3e9e5f",
    title: "Prep and paint",
    text: "Furniture wrapped, edges taped, floors protected. Then our crew lays down flawless, even coats.",
  },
  {
    color: "#8055c9",
    title: "The big reveal",
    text: "We walk every wall with you in daylight, touch up on the spot and leave your home spotless.",
  },
];

const GALLERY = [
  {
    img: IMG.hallway,
    alt: "Bright entry hallway of a home with clean freshly painted walls and natural light",
    caption: "Entryway refresh, day two",
    tilt: "freshcoat-tilt-left",
  },
  {
    img: IMG.detail,
    alt: "Styled interior corner showing a smooth painted wall, mirror and potted plant",
    caption: "“Sage Whisper” reading corner",
    tilt: "freshcoat-tilt-slight",
  },
  {
    img: IMG.bedroom,
    alt: "Finished bedroom with a calm painted accent wall and layered bedding",
    caption: "Main bedroom, before breakfast",
    tilt: "freshcoat-tilt-right",
  },
];

const REVIEWS = [
  {
    quote:
      "They colour-matched a cushion I loved and turned it into the most beautiful living room wall. Tidy, fast and genuinely fun to have around.",
    name: "Priya M., Maple Grove",
  },
  {
    quote:
      "Three bedrooms and a hallway in two days. The lines around the ceiling are so crisp my neighbour thought we had new crown moulding.",
    name: "Daniel R., Westbrook",
  },
  {
    quote:
      "I was terrified of picking the wrong colour. Their stylist tested three swatches on the wall and the winner was obvious by sunset.",
    name: "Alison T., Ferndale",
  },
];

function DotDivider() {
  return (
    <div className="freshcoat-divider" aria-hidden="true">
      {RAINBOW.map((hex) => (
        <span key={hex} style={{ background: hex }} />
      ))}
    </div>
  );
}

function QuoteBtn({ variant = "" }) {
  return (
    <a
      className={`freshcoat-btn ${variant}`.trim()}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

function PhoneBtn({ variant = "freshcoat-btn--ghost" }) {
  return (
    <a className={`freshcoat-btn ${variant}`} href={PHONE_TEL}>
      <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
    </a>
  );
}

function CtaBand({ headingId, title, text }) {
  return (
    <section className="freshcoat-band" aria-labelledby={headingId}>
      <div className="freshcoat-wrap freshcoat-band-inner">
        <div>
          <h2 id={headingId}>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="freshcoat-band-ctas">
          <QuoteBtn variant="freshcoat-btn--inverse" />
          <PhoneBtn />
        </div>
      </div>
    </section>
  );
}

export default function FreshCoatInteriorsPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="freshcoat-page">
      <header className="freshcoat-nav">
        <div className="freshcoat-nav-inner">
          <a className="freshcoat-logo" href="#freshcoat-top">
            <span className="freshcoat-logo-blob" aria-hidden="true">
              <Paintbrush size={18} />
            </span>
            FreshCoat Interiors
          </a>

          <nav aria-label="Page sections">
            <ul
              className={`freshcoat-nav-links${menuOpen ? " freshcoat-nav-links--open" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="freshcoat-nav-cta">
            <a className="freshcoat-nav-phone" href={PHONE_TEL}>
              <Phone size={17} aria-hidden="true" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              className="freshcoat-btn"
              href={QUOTE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
            >
              Get a Free Quote
            </a>
            <button
              type="button"
              className="freshcoat-menu-btn"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main id="freshcoat-top">
        <section className="freshcoat-hero">
          <div className="freshcoat-wrap freshcoat-hero-grid">
            <div className="freshcoat-hero-copy">
              <p className="freshcoat-eyebrow">
                <Sparkles size={15} aria-hidden="true" /> Interior painting &amp; colour styling
              </p>
              <h1>
                Walls that make you <span className="freshcoat-stroke">smile again</span>
              </h1>
              <p className="freshcoat-hero-lede">
                FreshCoat Interiors pairs meticulous painters with a friendly colour stylist, so
                every room lands somewhere between &ldquo;wow&rdquo; and &ldquo;why didn&rsquo;t we
                do this sooner?&rdquo; Crisp lines, honest quotes, zero drips on your sofa.
              </p>
              <div className="freshcoat-hero-ctas">
                <QuoteBtn />
                <PhoneBtn />
              </div>
              <ul className="freshcoat-hero-trust">
                <li><CheckCircle2 size={17} aria-hidden="true" /> Free colour consult</li>
                <li><CheckCircle2 size={17} aria-hidden="true" /> Low-VOC premium paints</li>
                <li><CheckCircle2 size={17} aria-hidden="true" /> 2-year finish warranty</li>
              </ul>
            </div>

            <div className="freshcoat-hero-art">
              <div className="freshcoat-hero-chips" aria-hidden="true">
                {RAINBOW.slice(0, 4).map((hex) => (
                  <span key={hex} className="freshcoat-chip" style={{ background: hex }} />
                ))}
              </div>
              <figure className="freshcoat-polaroid freshcoat-tilt-right">
                <div className="freshcoat-photo freshcoat-photo--wide">
                  <img
                    src={IMG.hero}
                    alt="Bright living room with freshly painted warm white walls, a rattan armchair and leafy plants"
                  />
                </div>
                <figcaption className="freshcoat-polaroid-caption">
                  The Hendersons&rsquo; lounge — &ldquo;Butter Toast&rdquo; with crisp white trim
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <DotDivider />

        <section className="freshcoat-section" id="freshcoat-services" aria-labelledby="freshcoat-services-h">
          <div className="freshcoat-wrap">
            <div className="freshcoat-section-head">
              <h2 id="freshcoat-services-h">Painting, but make it delightful</h2>
              <p>
                From single accent walls to whole-home refreshes, every job gets the same
                obsessive prep and playful eye for colour.
              </p>
            </div>
            <div className="freshcoat-services-grid">
              {SERVICES.map((service) => (
                <article className="freshcoat-service-card" key={service.title}>
                  <div className="freshcoat-photo freshcoat-photo--card">
                    <img src={service.img} alt={service.alt} loading="lazy" />
                  </div>
                  <div className="freshcoat-service-body">
                    <h3>
                      <service.icon size={20} aria-hidden="true" /> {service.title}
                    </h3>
                    <p>{service.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="freshcoat-section freshcoat-section--cream"
          id="freshcoat-colours"
          aria-labelledby="freshcoat-colours-h"
        >
          <div className="freshcoat-wrap">
            <div className="freshcoat-section-head">
              <h2 id="freshcoat-colours-h">This season&rsquo;s swatch wall</h2>
              <p>
                A taste of the palettes our stylist is loving right now. Every consult comes
                with painted samples on your actual walls.
              </p>
            </div>
            <div className="freshcoat-palette-row">
              {SWATCHES.map((swatch) => (
                <div className="freshcoat-swatch" key={swatch.name}>
                  <div className="freshcoat-swatch-color" style={{ background: swatch.hex }} />
                  <strong>{swatch.name}</strong>
                  <small>{swatch.note}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          headingId="freshcoat-midcta-h"
          title="Rooms this good start with a hello"
          text="Tell us about your space and get a straightforward quote — usually within one business day."
        />

        <section className="freshcoat-section" id="freshcoat-process" aria-labelledby="freshcoat-process-h">
          <div className="freshcoat-wrap">
            <div className="freshcoat-section-head">
              <h2 id="freshcoat-process-h">Four tidy steps, zero chaos</h2>
              <p>You&rsquo;ll always know what happens next — and when we&rsquo;ll be out of your hair.</p>
            </div>
            <div className="freshcoat-steps">
              {STEPS.map((step, index) => (
                <article className="freshcoat-step" key={step.title}>
                  <span className="freshcoat-step-num" style={{ background: step.color }}>
                    {index + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <DotDivider />

        <section
          className="freshcoat-section freshcoat-section--cream"
          id="freshcoat-gallery"
          aria-labelledby="freshcoat-gallery-h"
        >
          <div className="freshcoat-wrap">
            <div className="freshcoat-section-head">
              <h2 id="freshcoat-gallery-h">Fresh off the roller</h2>
              <p>Snapshots from recent projects — straight from our crew&rsquo;s camera roll.</p>
            </div>
            <div className="freshcoat-gallery">
              {GALLERY.map((shot) => (
                <figure className={`freshcoat-polaroid ${shot.tilt}`} key={shot.caption}>
                  <div className="freshcoat-photo freshcoat-photo--tall">
                    <img src={shot.img} alt={shot.alt} loading="lazy" />
                  </div>
                  <figcaption className="freshcoat-polaroid-caption">{shot.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="freshcoat-section" id="freshcoat-reviews" aria-labelledby="freshcoat-reviews-h">
          <div className="freshcoat-wrap">
            <div className="freshcoat-section-head">
              <h2 id="freshcoat-reviews-h">Neighbours say it best</h2>
              <p>Real rooms, real homeowners, really crisp cut lines.</p>
            </div>
            <div className="freshcoat-reviews">
              {REVIEWS.map((review) => (
                <article className="freshcoat-review" key={review.name}>
                  <div className="freshcoat-stars" aria-label="Rated 5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star key={star} size={17} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
                  <cite>{review.name}</cite>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          headingId="freshcoat-finalcta-h"
          title="Ready for the fresh-paint feeling?"
          text="Quotes are free, colour advice is included, and our calendar fills fast in repaint season. Let's get your project on the books."
        />
      </main>

      <footer className="freshcoat-footer">
        <div className="freshcoat-wrap">
          <div className="freshcoat-footer-inner">
            <a className="freshcoat-logo" href="#freshcoat-top">
              <span className="freshcoat-logo-blob" aria-hidden="true">
                <Paintbrush size={18} />
              </span>
              FreshCoat Interiors
            </a>
            <ul className="freshcoat-footer-links">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
            <a className="freshcoat-footer-phone" href={PHONE_TEL}>
              <Phone size={18} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
          </div>
          <div className="freshcoat-footer-fine">
            <span>
              <ShieldCheck size={13} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: "5px" }} />
              Independent service provider listing
            </span>
            <span>
              <Clock size={13} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: "5px" }} />
              Mon&ndash;Sat, 8am&ndash;6pm
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
