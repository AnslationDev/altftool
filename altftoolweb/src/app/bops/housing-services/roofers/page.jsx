"use client";

import { useEffect, useMemo, useState } from "react";
import logoImage from "./Logo.png";
import "./styles.css";

const phoneNumber = "#demo-only";
const phoneDisplay = "Demo only";

const services = [
  {
    title: "Cedar Roofing",
    text: "Natural beauty, durability, and expert craftsmanship built to protect and impress.",
    image:
      "/assets/og-default.png",
    alt: "Cedar roofing project",
  },
  {
    title: "EPDM / TPO",
    text: "Durable, energy-efficient roofing systems designed for long-term protection.",
    image:
      "/assets/og-default.png",
    alt: "Workers on a rooftop",
  },
  {
    title: "Flat Roofing",
    text: "Dependable flat roofing systems for homes, buildings, and commercial properties.",
    image:
      "/assets/og-default.png",
    alt: "Flat roof with vents",
  },
  {
    title: "Metal Roofing",
    text: "Strong, modern, energy-efficient roofs with lasting performance and style.",
    image:
      "/assets/og-default.png",
    alt: "Modern metal roof",
  },
  {
    title: "Shingles",
    text: "Affordable and reliable shingle roofing installed with quality materials.",
    image:
      "/assets/og-default.png",
    alt: "Shingle roof project",
  },
  {
    title: "Slate",
    text: "Timeless natural protection with premium installation and restoration detail.",
    image:
      "/assets/og-default.png",
    alt: "Slate roof with trees",
  },
  {
    title: "Spanish Tile",
    text: "Mediterranean character, lasting durability, and carefully finished tile work.",
    image:
      "/assets/og-default.png",
    alt: "Spanish tile roof",
  },
];

const blogPosts = [
  {
    slug: "flat-roof-repair-nyc",
    title: "Flat Roof Repair in NYC: Signs You Should Not Ignore",
    excerpt:
      "Learn the early warning signs of flat roof damage before small leaks become expensive repairs.",
    image:
      "/assets/og-default.png",
    category: "Flat Roofing",
    description: [
      "Flat roofs are common across Queens, Brooklyn, Manhattan, and Long Island because they are practical for residential and commercial buildings. The challenge is that water, foot traffic, and weather changes can create hidden problems.",
      "Watch for ponding water, soft roof areas, bubbling membrane, interior stains, loose flashing, and repeated drain clogs. These signs usually mean the roof needs professional inspection before the damage spreads.",
      "A timely repair can extend the life of the roof, improve drainage, and protect the interior structure from moisture damage.",
    ],
  },
  {
    slug: "cedar-roof-maintenance",
    title: "How to Maintain a Cedar Roof for Long Lasting Beauty",
    excerpt:
      "Cedar roofing needs the right care plan to keep its natural character and weather resistance.",
    image:
      "/assets/og-default.png",
    category: "Cedar Roofing",
    description: [
      "Cedar roofs add warmth, texture, and curb appeal, but they need steady maintenance to perform well in New York weather.",
      "Keep valleys clear, trim branches away from the roof, check for cracked shakes, and schedule routine inspections after heavy storms. Proper ventilation is also important because trapped moisture can shorten the roof life.",
      "With professional cleaning, repair, and replacement of damaged pieces, cedar roofing can remain both protective and visually impressive.",
    ],
  },
  {
    slug: "epdm-tpo-commercial-roofs",
    title: "EPDM vs TPO: Choosing the Right Commercial Roof",
    excerpt:
      "Compare two popular single-ply roofing systems for durability, energy performance, and maintenance.",
    image:
      "/assets/og-default.png",
    category: "EPDM / TPO",
    description: [
      "EPDM and TPO are both strong choices for commercial flat roofs. EPDM is known for flexibility and proven long-term performance, while TPO is valued for heat reflection and energy efficiency.",
      "The right option depends on building use, budget, exposure, drainage, and maintenance expectations. Installation quality matters as much as the membrane itself.",
      "A roofing contractor can inspect the building and recommend the system that best fits the property and local conditions.",
    ],
  },
  {
    slug: "metal-roof-benefits",
    title: "Why Metal Roofing Is Becoming Popular in New York",
    excerpt:
      "Metal roofs offer clean style, strong protection, and long-term performance for modern properties.",
    image:
      "/assets/og-default.png",
    category: "Metal Roofing",
    description: [
      "Metal roofing is growing in popularity because it gives properties a sharp modern look while also delivering durability.",
      "It handles wind, rain, and seasonal temperature changes well. Many systems also reflect heat, which can help improve comfort and energy efficiency.",
      "A well-installed metal roof can be a smart long-term investment for homes, mixed-use buildings, and commercial spaces.",
    ],
  },
  {
    slug: "shingle-roof-replacement",
    title: "When Should You Replace a Shingle Roof?",
    excerpt:
      "Know the difference between a simple repair and a full roof replacement decision.",
    image:
      "/assets/og-default.png",
    category: "Shingles",
    description: [
      "Shingle roofs are reliable, affordable, and versatile, but every system has a service life. Missing shingles, granule loss, curled edges, and repeated leaks can point to replacement.",
      "If the roof is older and repairs are becoming frequent, replacement may be more cost-effective than patching one area at a time.",
      "A professional inspection helps determine whether repair or replacement is the better solution for the property.",
    ],
  },
  {
    slug: "slate-roof-restoration",
    title: "Slate Roof Restoration: Preserving a Premium Roof",
    excerpt:
      "Slate roofs need specialized repair methods to preserve their natural strength and timeless look.",
    image:
      "/assets/og-default.png",
    category: "Slate Roofing",
    description: [
      "Slate roofing is known for longevity and classic appearance. It is also a system that requires experienced handling because damaged tiles must be repaired carefully.",
      "Common issues include cracked slate, failing fasteners, damaged flashing, and improper repairs from previous work.",
      "Restoration protects the roof while preserving the architectural value of the property.",
    ],
  },
  {
    slug: "spanish-tile-roofing",
    title: "Spanish Tile Roofing: Style, Strength, and Care",
    excerpt:
      "Spanish tile adds distinct character and dependable protection when installed and maintained correctly.",
    image:
      "/assets/og-default.png",
    category: "Spanish Tile",
    description: [
      "Spanish tile roofing brings a warm, architectural look that stands out. It is also durable when the roof deck, underlayment, and flashing are installed properly.",
      "Tiles can crack from impact or foot traffic, so repairs should be handled by crews familiar with tile systems.",
      "Routine inspection helps keep the system watertight while preserving its visual character.",
    ],
  },
  {
    slug: "roof-waterproofing-guide",
    title: "Roof Waterproofing: Protecting Buildings From Moisture",
    excerpt:
      "Waterproofing can reduce leak risk and protect important structural details from long-term damage.",
    image:
      "/assets/og-default.png",
    category: "Waterproofing",
    description: [
      "Waterproofing is one of the most important parts of protecting a building in New York. Roofs, parapets, walls, and below-grade areas all need proper moisture control.",
      "A good waterproofing plan considers drainage, seams, flashing, penetrations, and material compatibility.",
      "Professional waterproofing helps prevent leaks, mold, interior damage, and expensive structural repairs.",
    ],
  },
  {
    slug: "facade-restoration-basics",
    title: "Facade Restoration Basics for NYC Properties",
    excerpt:
      "Facade issues can affect safety, curb appeal, and water protection for residential and commercial buildings.",
    image: "/assets/og-default.png",
    category: "Facade Restoration",
    description: [
      "Facade restoration improves building appearance and helps protect the structure from water intrusion. Cracks, damaged joints, and loose materials should be reviewed quickly.",
      "A complete restoration plan can include masonry repair, flashing correction, waterproofing, and surface preparation.",
      "The goal is to protect the property, improve safety, and maintain a clean exterior finish.",
    ],
  },
];

const clientLogosOne = [
  [
    "Acadia",
    "/assets/og-default.png",
  ],
  [
    "Adaptive",
    "/assets/og-default.png",
  ],
  [
    "Aiello Associates",
    "/assets/og-default.png",
  ],
  ["Autun", "/assets/og-default.png"],
  [
    "BAR Construction",
    "/assets/og-default.png",
  ],
  [
    "Consigli",
    "/assets/og-default.png",
  ],
  [
    "Cushman Wakefield",
    "/assets/og-default.png",
  ],
  [
    "DHI Construction",
    "/assets/og-default.png",
  ],
];

const clientLogosTwo = [
  [
    "Extra Space",
    "/assets/og-default.png",
  ],
  [
    "Gabrielli Truck",
    "/assets/og-default.png",
  ],
  [
    "Hudson Meridian",
    "/assets/og-default.png",
  ],
  ["Mega", "/assets/og-default.png"],
  [
    "Prologis",
    "/assets/og-default.png",
  ],
  [
    "Rimkus",
    "/assets/og-default.png",
  ],
  [
    "Triton",
    "/assets/og-default.png",
  ],
  [
    "Vornado",
    "/assets/og-default.png",
  ],
];

const mobileLinks = [
  "Home",
  "Services",
  "About Us",
  "Blogs",
  "Clients",
  "Contact",
];

function getSlideClass(index, activeIndex) {
  const total = services.length;
  const diff = (index - activeIndex + total) % total;

  if (diff === 0) return "service-slide active";
  if (diff === 1) return "service-slide next";
  if (diff === 2) return "service-slide far-next";
  if (diff === total - 1) return "service-slide prev";
  if (diff === total - 2) return "service-slide far-prev";
  return "service-slide";
}

function getSectionId(label) {
  if (label === "About Us") return "about";
  return label.toLowerCase().replace(/\s+/g, "-");
}

/* ========== MAIN APP ========== */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [view, setView] = useState("home");
  const [activeBlogSlug, setActiveBlogSlug] = useState(blogPosts[0].slug);

  const activeBlog = useMemo(
    () =>
      blogPosts.find((post) => post.slug === activeBlogSlug) || blogPosts[0],
    [activeBlogSlug],
  );

  const relatedBlogs = useMemo(
    () => blogPosts.filter((post) => post.slug !== activeBlog.slug).slice(0, 3),
    [activeBlog],
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % services.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );
    document
      .querySelectorAll(
        ".reveal, .about-image, .journey-line, .question-section",
      )
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [view, activeBlogSlug]);

  const directScroll = (sectionId) => {
    setView("home");
    setMenuOpen(false);
    window.setTimeout(() => {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }, 40);
  };

  const openBlogs = () => {
    setView("blogs");
    setMenuOpen(false);
    window.setTimeout(
      () => window.scrollTo({ top: 0, behavior: "smooth" }),
      20,
    );
  };

  const openBlog = (slug) => {
    setActiveBlogSlug(slug);
    setView("blog-detail");
    setMenuOpen(false);
    window.setTimeout(
      () => window.scrollTo({ top: 0, behavior: "smooth" }),
      20,
    );
  };

  const moveCarousel = (direction) => {
    setActiveIndex(
      (current) => (current + direction + services.length) % services.length,
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const lead = Object.fromEntries(new FormData(form).entries());
    try {
      const leads = JSON.parse(
        window.localStorage.getItem("roofers_leads") || "[]",
      );
      leads.push({ ...lead, submittedAt: new Date().toISOString() });
      window.localStorage.setItem("roofers_leads", JSON.stringify(leads));
    } catch {
      // Local storage can be unavailable in private browsing; the request still proceeds.
    }
    form.reset();
  };

  const handleMobileClick = (label) => {
    if (label === "Home") {
      directScroll("home");
      return;
    }

    if (label === "Blogs") {
      openBlogs();
      return;
    }

    const sectionId = getSectionId(label);
    directScroll(sectionId);
  };

  return (
    <div
      className={`roofing-page${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}`}
    >
      <header>
        <div className="topbar">
          <span>54-30 44th Street, Queens, NY 11378</span>
          <a className="topbar-phone" href={phoneNumber} aria-disabled="true" tabIndex={-1}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            {phoneDisplay}
          </a>
        </div>

        <nav className="navbar" aria-label="Primary navigation">
          <div className="nav-menu left">
            <div className="nav-item">
              <button
                className="nav-link"
                type="button"
                onClick={() => directScroll("home")}
              >
                Home
              </button>
            </div>
            <div className="nav-item">
              <button
                className="nav-link"
                type="button"
                onClick={() => directScroll("services")}
              >
                Services
              </button>
            </div>
          </div>

          <button
            className="logo-wrap"
            type="button"
            onClick={() => directScroll("home")}
            aria-label="CrestNova Roofing home"
          >
            <img src={logoImage.src} alt="CrestNova Roofing" />
          </button>

          <a className="mobile-contact-link" href={phoneNumber} aria-disabled="true" tabIndex={-1}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            <span>{phoneDisplay}</span>
          </a>

          <div className="nav-menu right">
            <div className="nav-item">
              <button
                className="nav-link"
                type="button"
                onClick={() => directScroll("about")}
              >
                About Us
              </button>
            </div>
            <div className="nav-item">
              <button className="nav-link" type="button" onClick={openBlogs}>
                Blogs
              </button>
              <div className="dropdown blog-dropdown">
                <button type="button" onClick={openBlogs}>
                  All Roofing Blogs
                </button>
                {blogPosts.slice(0, 4).map((post) => (
                  <button
                    key={post.slug}
                    type="button"
                    onClick={() => openBlog(post.slug)}
                  >
                    {post.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="nav-item">
              <button
                className="nav-link"
                type="button"
                onClick={() => directScroll("clients")}
              >
                Clients
              </button>
            </div>
            <div className="nav-item">
              <button
                className="nav-link"
                type="button"
                onClick={() => directScroll("contact")}
              >
                Contact
              </button>
            </div>
          </div>

          <button
            className="mobile-toggle"
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span>
          </button>
        </nav>

        <button
          className="mobile-overlay"
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        ></button>

        <div className="mobile-panel" aria-label="Mobile navigation">
          <div className="mobile-panel-header">
            <span>Navigation</span>
            <button
              className="mobile-panel-close"
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="mobile-panel-links">
            {mobileLinks.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => handleMobileClick(link)}
              >
                {link}
              </button>
            ))}
          </div>

          <div className="mobile-panel-address">
            <span>Visit Us</span>
            <strong>54-30 44th Street, Queens, NY 11378</strong>
          </div>
        </div>
      </header>

      <main>
        {view === "home" ? (
          <HomeContent
            activeIndex={activeIndex}
            moveCarousel={moveCarousel}
            handleSubmit={handleSubmit}
            onNavigate={directScroll}
          />
        ) : null}

        {view === "blogs" ? (
          <BlogList
            onOpenBlog={openBlog}
            onBackHome={() => directScroll("home")}
          />
        ) : null}

        {view === "blog-detail" ? (
          <BlogDetail
            blog={activeBlog}
            relatedBlogs={relatedBlogs}
            onOpenBlog={openBlog}
            onBackBlogs={openBlogs}
          />
        ) : null}
      </main>

      <footer className="footer">
        <span>54-30 44th Street, Queens, NY 11378</span>
        <span>(c) 2026 CrestNova Roofing. Landing page recreation.</span>
        <span className="footer-phone">Demo only</span>
      </footer>
    </div>
  );
}

/* ========== HOME CONTENT ========== */
function HomeContent({ activeIndex, moveCarousel, handleSubmit, onNavigate }) {
  return (
    <>
      <section className="hero" id="home">
        <div className="hero-bg" aria-hidden="true"></div>
        <div className="hero-content">
          <div className="brand-kicker">CrestNova Roofing</div>
          <span className="hero-eyebrow">Building with lasting impact</span>
          <h1>
            Excellence in
            <br />
            Every Detail
          </h1>
          <p>
            We bring expertise, precision, and quality to every residential and
            commercial roofing project across NYC and Long Island.
          </p>
          <div className="hero-actions">
            <button
              className="btn"
              type="button"
              onClick={() => onNavigate("contact")}
            >
              Get Free Estimate
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => onNavigate("services")}
            >
              View Services
            </button>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Company strengths">
        <div className="container feature-grid">
          <article className="feature reveal from-left">
            <h2>
              Quality
              <br />
              Craftsmanship
            </h2>
            <p>
              We deliver superior craftsmanship across Queens, Brooklyn,
              Manhattan, the Bronx, Staten Island, and Long Island. Every roof
              is built for durability, function, and curb appeal.
            </p>
          </article>
          <article className="feature reveal from-left delay-1">
            <h2>
              Precision &amp;
              <br />
              Performance.
            </h2>
            <p>
              Our team brings reliable service, careful installation, and
              long-lasting roofing solutions for replacements, repairs,
              restorations, and emergency work.
            </p>
          </article>
          <article className="feature reveal from-left delay-2">
            <h2>
              Innovative
              <br />
              Solutions
            </h2>
            <p>
              Modern methods, advanced waterproofing, sustainable materials, and
              professional equipment help every project move safely and
              efficiently.
            </p>
          </article>
        </div>
      </section>

      <section className="section services" id="services">
        <div className="container">
          <div className="section-head reveal">
            <span className="section-eyebrow">expert solutions</span>
            <h2 className="section-title">Our Services</h2>
            <p className="section-copy">
              Roofing installation, repair, and maintenance for shingle, slate,
              metal, flat, cedar, Spanish tile, waterproofing, and facade
              restoration projects.
            </p>
          </div>

          <div className="coverflow reveal" aria-label="Services carousel">
            {services.map((service, index) => (
              <article
                className={getSlideClass(index, activeIndex)}
                key={service.title}
              >
                <img src={service.image} alt={service.alt} />
                <div className="service-info">
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="carousel-controls reveal">
            <button
              className="carousel-btn"
              type="button"
              onClick={() => moveCarousel(-1)}
            >
              Prev
            </button>
            <button
              className="carousel-btn"
              type="button"
              onClick={() => moveCarousel(1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container about-grid">
          <div className="about-text reveal from-left">
            <div className="section-head">
              <span className="section-eyebrow">expert solutions</span>
              <h2 className="section-title">About Us</h2>
              <p className="section-copy">
                Built on integrity, driven by passion, and rooted in quality,
                trust, and years of experience.
              </p>
            </div>
            <p>
              <strong>CrestNova Roofing</strong> is a fully appointed
              waterproofing, roofing, sheet metal, and restoration contractor
              located in Queens, NY.
            </p>
            <p>
              We are licensed and insured to work throughout New York City,
              including Queens, Brooklyn, Manhattan, the Bronx, Staten Island,
              and Long Island.
            </p>
            <p>
              Our team handles projects of all sizes, from large-scale
              developments and renovations to new construction, smaller repairs,
              infrared imaging, site safety, remediation, and roof leak
              investigations.
            </p>
          </div>
          <figure className="about-image reveal from-right">
            <img
              src="/assets/og-default.png"
              alt="Modern building with service vehicles"
            />
          </figure>
        </div>
      </section>

      <section className="section journey">
        <div className="container journey-grid">
          <div className="reveal from-left">
            <span
              className="section-eyebrow"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              our journey
            </span>
            <h2 className="section-title">Trusted Since 1967</h2>
          </div>
          <div className="reveal from-right">
            <p>
              CrestNova Roofing has earned a reputation as one of the most
              trusted names in the building industry. Family owned and operated,
              the company is known for strong workmanship, reliable products,
              and a determination to finish each job correctly.
            </p>
            <div className="journey-line"></div>
            <div className="trusted">
              <div>
                <span>Trusted Expertise</span>
                <strong>Superior Construction</strong>
              </div>
              <div>
                <span>Trusted By</span>
                <strong>300+ Clients</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section clients" id="clients">
        <div className="container">
          <div className="section-head reveal">
            <span className="section-eyebrow">our clients</span>
            <h2 className="section-title">Trusted Brands</h2>
            <p className="section-copy">
              Clients trust our expertise, dedication, and quality services for
              durable results and long-term value.
            </p>
          </div>

          <LogoMarquee logos={clientLogosOne} label="Client logos row one" />
          <LogoMarquee
            logos={clientLogosTwo}
            label="Client logos row two"
            reverse
          />
        </div>
      </section>

      <QuestionSection handleSubmit={handleSubmit} />
    </>
  );
}

function LogoMarquee({ logos, label, reverse = false }) {
  return (
    <div className="logo-marquee reveal" aria-label={label}>
      <div className={`logo-track${reverse ? " reverse" : ""}`}>
        {[...logos, ...logos].map(([name, src], index) => (
          <img
            className="logo-item"
            src={src}
            alt={`${name} logo`}
            key={`${name}-${index}`}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionSection({ handleSubmit }) {
  const [sent, setSent] = useState(false);

  const onSubmit = (event) => {
    handleSubmit(event);
    setSent(true);
  };

  return (
    <section className="question-section" id="contact">
      <div className="question-header reveal">
        <span className="question-eyebrow">How can we help you?</span>
        <h2>Have a Question?</h2>
        <p>
          If you have any comments, suggestions or questions, please do not
          hesitate to contact us. Our high-quality office staff will help you
          and answer
        </p>
      </div>

      <div className="question-grid">
        <div className="map-wrap reveal from-left">
          <div className="flex h-full min-h-64 items-center justify-center bg-muted/40 p-6 text-center text-muted-foreground" role="note">
            Location map unavailable in this design demonstration.
          </div>
        </div>

        <div className="question-form-shell reveal from-right">
          <form className="question-form" onSubmit={onSubmit}>
            <input
              className="field"
              type="text"
              name="name"
              placeholder="Your Name"
              aria-label="Your Name"
              required
            />
            <div className="field-wrap">
              <svg
                className="mail-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6h16v12H4V6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                className="field with-icon"
                type="email"
                name="email"
                placeholder="Email*"
                aria-label="Email"
                required
              />
            </div>
            <input
              className="field"
              type="tel"
              name="phone"
              placeholder="Phone"
              aria-label="Phone"
            />
            <input
              className="field"
              type="text"
              name="city"
              placeholder="City*"
              aria-label="City"
              required
            />
            <textarea
              className="message-field"
              name="message"
              placeholder="Message"
              aria-label="Message"
            ></textarea>

            <label className="consent-row">
              <input type="checkbox" name="marketingConsent" />
              <span>
                I consent to receive marketing text messages, including
                promotional offers, seasonal discounts, service specials, and
                company updates from CrestNova Contracting Corp. at the phone
                number provided. Message frequency may vary. Message &amp; data
                rates may apply. Text HELP for assistance, reply STOP to opt
                out.
              </span>
            </label>

            <label className="consent-row">
              <input type="checkbox" name="serviceConsent" />
              <span>
                I consent to receive non-marketing text messages from CrestNova
                Contracting Corp. regarding appointment confirmations and
                reminders, scheduling notifications, project and service status
                updates, estimate follow-ups, and invoice notifications. Message
                frequency may vary. Message &amp; data rates may apply. Text
                HELP for assistance, reply STOP to opt out.
              </span>
            </label>

            <button className="send-button" type="submit">
              Send Message
            </button>
            {sent && (
              <p
                role="status"
                style={{ color: "#ffffff", fontSize: "12px", textAlign: "center", marginTop: "4px" }}
              >
                Saved on this device only — nothing was sent. Call us at {phoneDisplay} for a real response.
              </p>
            )}
            <div className="policy-links">
              <a href="#privacy">Privacy Policy</a> |{" "}
              <a href="#terms">Terms of Service</a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function BlogList({ onOpenBlog, onBackHome }) {
  return (
    <section className="blog-page">
      <div className="blog-hero reveal">
        <span className="section-eyebrow">roofing insights</span>
        <h1>Our Blogs</h1>
        <p>
          Helpful roofing guides for NYC and Long Island property owners,
          covering repairs, materials, waterproofing, and restoration.
        </p>
        <button className="text-link" type="button" onClick={onBackHome}>
          Back to landing page
        </button>
      </div>

      <div className="blog-grid">
        {blogPosts.map((post) => (
          <button
            className="blog-card reveal"
            key={post.slug}
            type="button"
            onClick={() => onOpenBlog(post.slug)}
          >
            <img src={post.image} alt={post.title} />
            <span>{post.category}</span>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function BlogDetail({ blog, relatedBlogs, onOpenBlog, onBackBlogs }) {
  return (
    <article className="blog-detail-page">
      <button className="text-link" type="button" onClick={onBackBlogs}>
        Back to all blogs
      </button>
      <div className="blog-detail-hero reveal">
        <img src={blog.image} alt={blog.title} />
        <div>
          <span className="section-eyebrow">{blog.category}</span>
          <h1>{blog.title}</h1>
          <p>{blog.excerpt}</p>
        </div>
      </div>

      <div className="blog-body reveal">
        {blog.description.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      <section className="related-blogs reveal" aria-label="Related blogs">
        <span className="section-eyebrow">related blogs</span>
        <h2>Keep Reading</h2>
        <div className="related-grid">
          {relatedBlogs.map((post) => (
            <button
              className="related-card"
              key={post.slug}
              type="button"
              onClick={() => onOpenBlog(post.slug)}
            >
              <img src={post.image} alt={post.title} />
              <span>{post.category}</span>
              <h3>{post.title}</h3>
            </button>
          ))}
        </div>
      </section>
    </article>
  );
}
