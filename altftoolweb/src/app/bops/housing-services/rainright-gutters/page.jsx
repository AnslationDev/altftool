"use client";

import "./rainright-gutters.css";
import {
  Droplet,
  Droplets,
  Mail,
  ShieldCheck,
  Leaf,
  Flower2,
  CloudRain,
  CheckCircle2,
  ArrowRight,
  Ruler,
  Wrench,
  Sparkles,
  Home,
} from "lucide-react";

// No quote partner and no phone line are live for this page, so every
// conversion CTA points at the site's real contact route.
const CONTACT_URL = "/policypages/contact";
const CONTACT_LABEL = "Contact us";

const IMG = {
  hero: "https://images.unsplash.com/photo-1567361808976-260065224468?auto=format&fit=crop&w=1600&q=80",
  seamless: "https://images.unsplash.com/photo-1569898773055-2f2b6e97e1ed?auto=format&fit=crop&w=900&q=80",
  guards: "https://images.unsplash.com/photo-1600093652298-e57ee8aba769?auto=format&fit=crop&w=900&q=80",
  downspouts: "https://images.unsplash.com/photo-1635359800970-90b35af94a4a?auto=format&fit=crop&w=900&q=80",
  crew: "https://images.unsplash.com/photo-1654531015087-8cc3d04d1b2d?auto=format&fit=crop&w=900&q=80",
  homeRain: "https://images.unsplash.com/photo-1675415782443-32685e238b1c?auto=format&fit=crop&w=900&q=80",
};

const SERVICES = [
  {
    icon: Ruler,
    title: "Seamless Gutters",
    img: IMG.seamless,
    alt: "Newly installed seamless aluminum gutter running along a clean roof edge",
    body: "Roll-formed on site to the exact length of your roofline — no mid-run seams to leak, sag, or streak your fascia. Available in 20+ baked-on colors.",
    cta: "Price my gutters",
  },
  {
    icon: Leaf,
    title: "Leaf Guards",
    img: IMG.guards,
    alt: "Close-up of a gutter leaf guard keeping autumn leaves out of the channel",
    body: "Micro-mesh covers that shed leaves, pine needles, and shingle grit while letting heavy rain pour through. Say goodbye to twice-a-year ladder scooping.",
    cta: "Price my guards",
  },
  {
    icon: Droplets,
    title: "Downspouts & Drainage",
    img: IMG.downspouts,
    alt: "Downspout directing rain runoff away from a home's foundation",
    body: "Oversized downspouts, splash blocks, and buried extensions that carry water well clear of your foundation — the cheapest basement waterproofing there is.",
    cta: "Price my drainage",
  },
];

const SEASONS = [
  {
    key: "spring",
    tagIcon: Flower2,
    tag: "Spring Tune-Up",
    title: "Ready for the Wet Season",
    img: IMG.homeRain,
    alt: "Rain falling on a well-kept suburban home with clear, free-flowing gutters",
    body: "Winter leaves behind grit, seed pods, and loosened hangers. We reset the whole system before spring storms arrive.",
    items: [
      "Flush gutters and downspouts of winter debris",
      "Re-secure loose hangers and re-pitch sagging runs",
      "Reseal end caps and miters before heavy rain",
    ],
  },
  {
    key: "fall",
    tagIcon: Leaf,
    tag: "Fall Clear-Out",
    title: "Beat the Leaf Drop & Freeze",
    img: IMG.crew,
    alt: "Technician clearing fallen leaves from a home's gutter before winter",
    body: "Clogged gutters in November become ice dams in January. Our fall visit clears the system and checks it for the freeze ahead.",
    items: [
      "Full leaf and needle removal, bagged and hauled away",
      "Downspout flow test to every discharge point",
      "Ice-dam risk inspection along eaves and valleys",
    ],
  },
];

const FEATURES = [
  {
    icon: Ruler,
    title: "Measured & Formed On Site",
    body: "Every run is rolled to length in your driveway for a seam-free, custom fit — never patched together from stock sections.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty-Backed Workmanship",
    body: "Materials and labor covered in writing. If a hanger pulls or a seam drips, we come back and make it right.",
  },
  {
    icon: Wrench,
    title: "Tidy, Respectful Crews",
    body: "Drop cloths under work areas, magnetic sweep for fasteners, and old material hauled off — your yard looks better than we found it.",
  },
  {
    icon: Sparkles,
    title: "Straightforward Pricing",
    body: "One clear quote before work begins. No trip fees, no surprise add-ons at the ladder.",
  },
];

const STATS = [
  ["4,200+", "Homes protected"],
  ["16 yrs", "Serving local homeowners"],
  ["1-day", "Typical install time"],
  ["4.9/5", "Average customer rating"],
];

function QuoteButton({ className = "rainright-btn rainright-btn-primary", children }) {
  return (
    <a className={className} href={CONTACT_URL}>
      {children || (
        <>
          Get a Free Quote <ArrowRight size={18} aria-hidden="true" />
        </>
      )}
    </a>
  );
}

function CtaBand({ heading, copy }) {
  return (
    <div className="rainright-band">
      <div>
        <h2>{heading}</h2>
        <p>{copy}</p>
      </div>
      <div className="rainright-band-ctas">
        <QuoteButton className="rainright-btn rainright-btn-light" />
        <a className="rainright-band-phone" href={CONTACT_URL}>
          <Mail size={19} aria-hidden="true" />
          {CONTACT_LABEL}
        </a>
      </div>
    </div>
  );
}

export default function RainRightGuttersPage() {
  return (
    <div className="rainright-page">
      {/* ---------- Nav ---------- */}
      <header className="rainright-nav">
        <div className="rainright-nav-inner">
          <a className="rainright-brand" href="#rainright-top" aria-label="RainRight Gutters home">
            <Droplet size={26} className="rainright-brand-drop" aria-hidden="true" />
            RainRight Gutters
          </a>
          <nav aria-label="Page sections">
            <ul className="rainright-nav-links">
              <li><a href="#services">Services</a></li>
              <li><a href="#seasonal">Seasonal Cleanup</a></li>
              <li><a href="#why-us">Why RainRight</a></li>
            </ul>
          </nav>
          <div className="rainright-nav-actions">
            <a className="rainright-nav-phone" href={CONTACT_URL}>
              <Mail size={17} aria-hidden="true" />
              <span>{CONTACT_LABEL}</span>
            </a>
            <QuoteButton className="rainright-btn rainright-btn-primary rainright-btn-sm" />
          </div>
        </div>
      </header>

      <main id="rainright-top">
        {/* ---------- Hero ---------- */}
        <section className="rainright-hero rainright-rainlines">
          <div className="rainright-container">
            <div className="rainright-hero-grid">
              <div className="rainright-hero-copy">
                <span className="rainright-eyebrow">
                  <Droplets size={15} aria-hidden="true" />
                  Seamless Gutters &amp; Leaf Guards
                </span>
                <h1>
                  Keep the Rain <em>Moving Right</em> — Off Your Roof, Away From Your Home
                </h1>
                <p className="rainright-hero-sub">
                  RainRight installs custom seamless gutters, clog-blocking leaf guards, and
                  properly pitched downspouts so every storm drains exactly where it should —
                  not into your foundation, siding, or flower beds.
                </p>
                <div className="rainright-hero-ctas">
                  <QuoteButton />
                  <a className="rainright-btn rainright-btn-ghost" href={CONTACT_URL}>
                    <Mail size={18} aria-hidden="true" />
                    {CONTACT_LABEL}
                  </a>
                </div>
                <ul className="rainright-hero-points">
                  <li><CheckCircle2 size={17} aria-hidden="true" /> Free on-site estimates</li>
                  <li><CheckCircle2 size={17} aria-hidden="true" /> Licensed &amp; insured crews</li>
                  <li><CheckCircle2 size={17} aria-hidden="true" /> Workmanship warranty</li>
                </ul>
              </div>
              <div className="rainright-hero-media">
                <div className="rainright-hero-frame">
                  <img
                    src={IMG.hero}
                    alt="Rainwater streaming off a residential roofline into a gutter during a downpour"
                  />
                </div>
                <div className="rainright-hero-badge">
                  <CloudRain size={30} aria-hidden="true" />
                  <div>
                    <strong>Storm-Ready</strong>
                    <span>Sized for heavy seasonal rainfall</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Stats ---------- */}
        <section className="rainright-section" aria-label="RainRight by the numbers">
          <div className="rainright-container">
            <div className="rainright-stats">
              {STATS.map(([value, label]) => (
                <div className="rainright-stat" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Services ---------- */}
        <section className="rainright-section rainright-section-alt rainright-rainlines" id="services">
          <div className="rainright-container">
            <div className="rainright-section-head">
              <h2>Gutter Services Done Right</h2>
              <p>
                From custom-fit seamless runs to guards that end ladder season for good, we
                handle the full rain-management system around your roofline.
              </p>
            </div>
            <div className="rainright-card-grid">
              {SERVICES.map(({ icon: Icon, title, img, alt, body, cta }) => (
                <article className="rainright-card" key={title}>
                  <div className="rainright-photo-frame">
                    <img src={img} alt={alt} loading="lazy" />
                  </div>
                  <div className="rainright-card-body">
                    <h3>
                      <Icon size={20} aria-hidden="true" />
                      {title}
                    </h3>
                    <p>{body}</p>
                    <a
                      className="rainright-card-link"
                      href={CONTACT_URL}
                    >
                      {cta} <ArrowRight size={15} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Mid-page CTA band ---------- */}
        <section className="rainright-section" aria-label="Request a quote">
          <div className="rainright-container">
            <CtaBand
              heading="Not sure what your gutters need?"
              copy="Request a free quote or call — we'll assess your roofline and give straight answers, no pressure."
            />
          </div>
        </section>

        {/* ---------- Seasonal split ---------- */}
        <section className="rainright-section rainright-section-alt rainright-rainlines" id="seasonal">
          <div className="rainright-container">
            <div className="rainright-section-head">
              <h2>Spring &amp; Fall Seasonal Cleanup</h2>
              <p>
                Two visits a year keep water flowing and warranties valid. Here&apos;s what
                each season&apos;s service covers.
              </p>
            </div>
            <div className="rainright-season-grid">
              {SEASONS.map(({ key, tagIcon: TagIcon, tag, title, img, alt, body, items }) => (
                <article className={`rainright-season rainright-season-${key}`} key={key}>
                  <div className="rainright-photo-frame">
                    <img src={img} alt={alt} loading="lazy" />
                  </div>
                  <div className="rainright-season-body">
                    <span className="rainright-season-tag">
                      <TagIcon size={15} aria-hidden="true" />
                      {tag}
                    </span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                    <ul className="rainright-season-list">
                      {items.map((item) => (
                        <li key={item}>
                          <CheckCircle2 size={17} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Why us ---------- */}
        <section className="rainright-section" id="why-us">
          <div className="rainright-container">
            <div className="rainright-why-grid">
              <div className="rainright-why-photos">
                <div className="rainright-photo-frame">
                  <img
                    src={IMG.seamless}
                    alt="Crisp seamless gutter line complementing a home's exterior trim"
                    loading="lazy"
                  />
                </div>
                <div className="rainright-photo-frame">
                  <img
                    src={IMG.downspouts}
                    alt="Neatly routed downspout installed flush against a house corner"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="rainright-why-copy">
                <h2>Why Homeowners Choose RainRight</h2>
                <p>
                  Gutters are easy to ignore until water is in the basement. We treat them as
                  what they are: your home&apos;s first line of defense against rain.
                </p>
                <ul className="rainright-feature-list">
                  {FEATURES.map(({ icon: Icon, title, body }) => (
                    <li key={title}>
                      <span className="rainright-feature-icon">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <h3>{title}</h3>
                        <p>{body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <QuoteButton />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Final CTA band ---------- */}
        <section className="rainright-section" aria-label="Final call to action">
          <div className="rainright-container">
            <CtaBand
              heading="Let's get your rain flowing right."
              copy="Free estimates, honest recommendations, and installs usually done in a single day. The next storm is coming — be ready for it."
            />
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="rainright-footer">
        <div className="rainright-container">
          <div className="rainright-footer-inner">
            <a className="rainright-brand" href="#rainright-top" aria-label="Back to top">
              <Droplet size={24} className="rainright-brand-drop" aria-hidden="true" />
              RainRight Gutters
            </a>
            <a className="rainright-footer-phone" href={CONTACT_URL}>
              <Mail size={17} aria-hidden="true" />
              {CONTACT_LABEL}
            </a>
          </div>
          <div className="rainright-footer-note">
            <span>
              <Home size={13} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 6 }} />
              Seamless gutters, leaf guards &amp; downspouts for your home.
            </span>
            <span>Independent service provider listing.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
