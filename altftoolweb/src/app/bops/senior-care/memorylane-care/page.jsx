"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Clock,
  Flower2,
  HeartHandshake,
  Home,
  Menu,
  Phone,
  Sun,
  Users,
  X,
} from "lucide-react";
import "./memorylane-care.css";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

const REASSURE = [
  { icon: Clock, title: "At your pace", text: "No rushed decisions. Explore options over days, weeks, or months." },
  { icon: HeartHandshake, title: "Dignity first", text: "Every provider we list is chosen for warmth and respect." },
  { icon: Users, title: "Family included", text: "You stay at the centre of your loved one's story, always." },
];

const ALBUM = [
  {
    src: "https://images.unsplash.com/photo-1596437398267-a5184cc54f57?auto=format&fit=crop&w=900&q=80",
    alt: "A caregiver and an older woman looking through a photo album together",
    caption: "Old photographs, and the stories they wake.",
  },
  {
    src: "https://images.unsplash.com/photo-1646663133945-db03f563076a?auto=format&fit=crop&w=900&q=80",
    alt: "An older man smiling during a gentle conversation with his companion",
    caption: "A familiar face makes every day easier.",
  },
  {
    src: "https://images.unsplash.com/photo-1585813597723-deb48af776dd?auto=format&fit=crop&w=900&q=80",
    alt: "Hands of an older adult and a younger family member gently held together",
    caption: "Held hands say what words sometimes can't.",
  },
];

const SUPPORT_CARDS = [
  {
    icon: Sun,
    title: "Gentle daily rhythms",
    text: "Care built around familiar routines — morning tea at the usual hour, the same songs, the same unhurried pace. Consistency brings comfort, and comfort comes first.",
  },
  {
    icon: BookOpen,
    title: "Life-story care",
    text: "Providers who take time to learn your loved one's story — the town they grew up in, the work they were proud of — so every day holds moments of recognition.",
  },
  {
    icon: Users,
    title: "Guidance for families",
    text: "A patient, judgment-free listener to help you understand what to look for in memory-care support and how to keep your own connection strong.",
  },
  {
    icon: Home,
    title: "Finding the right setting",
    text: "From in-home companionship to dedicated memory-care communities, we help you compare options calmly — at your pace, with no pressure and no obligation.",
  },
];

const RESOURCES = [
  {
    title: "Starting the conversation",
    text: "Gentle ways to talk with your family about memory-care support, and how to include your loved one in decisions wherever possible.",
  },
  {
    title: "Visiting with ease",
    text: "Simple ideas for warm, low-pressure visits — old photographs, favourite music, and the quiet reassurance of simply being there.",
  },
  {
    title: "Caring for the caregiver",
    text: "You matter too. Ideas for rest, respite, and sharing the load, so the love you give can be sustained for the long road ahead.",
  },
];

const QUESTIONS = [
  {
    q: "When is the right time to look into memory care?",
    a: "There is no single right moment, and looking early is simply a way of being prepared. Many families begin exploring options long before they need them, so that any future decision can be made calmly rather than in a hurry.",
  },
  {
    q: "Will my loved one be treated with dignity?",
    a: "Dignity is the standard we hold every listed provider to. That means being spoken to as an adult, having preferences honoured, and being known as a whole person with a rich life story — not defined by a diagnosis.",
  },
  {
    q: "Can we stay closely involved in their care?",
    a: "Yes. The providers we connect families with welcome involvement — regular visits, shared meals, and open conversations. Your presence is part of the care, not an interruption to it.",
  },
  {
    q: "What does a free consultation involve?",
    a: "A relaxed conversation, by phone or online, about your family's situation and what kind of support might fit. There is no cost, no obligation, and no pressure to decide anything on the call.",
  },
];

function QuoteButton({ children, invert }) {
  return (
    <a
      className={`memorylane-btn ${invert ? "memorylane-btn-invert" : "memorylane-btn-primary"}`}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children}
      <ArrowRight size={20} aria-hidden="true" />
    </a>
  );
}

function PhoneBandLink() {
  return (
    <a className="memorylane-band-phone" href={PHONE_TEL}>
      <Phone size={26} aria-hidden="true" />
      {PHONE_DISPLAY}
    </a>
  );
}

export default function MemoryLaneCarePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const pageRef = useRef(null);

  useEffect(() => {
    const nodes = pageRef.current?.querySelectorAll(".memorylane-reveal");
    if (!nodes || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("memorylane-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="memorylane-page" ref={pageRef}>
      <nav className="memorylane-nav" aria-label="Main">
        <div className="memorylane-wrap memorylane-nav-inner">
          <a className="memorylane-brand" href="#top">
            <Flower2 size={28} aria-hidden="true" />
            MemoryLane Care
          </a>
          <button
            className="memorylane-nav-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
          <div className={`memorylane-nav-links${menuOpen ? " memorylane-nav-open" : ""}`}>
            <a className="memorylane-nav-phone" href={PHONE_TEL}>
              <Phone size={22} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <QuoteButton>Get a Free Consultation</QuoteButton>
          </div>
        </div>
      </nav>

      <main id="top">
        <header className="memorylane-hero">
          <div className="memorylane-wrap memorylane-hero-grid">
            <div>
              <span className="memorylane-eyebrow">
                <HeartHandshake size={18} aria-hidden="true" />
                Memory &amp; dementia care support
              </span>
              <h1>They remember how you make them feel.</h1>
              <p className="memorylane-hero-lede">
                Memory changes, but love does not. MemoryLane Care connects your family with
                specialised, patient memory-care providers who honour who your loved one has
                always been — gently, and at your family&apos;s own pace.
              </p>
              <div className="memorylane-cta-row">
                <QuoteButton>Get a Free Consultation</QuoteButton>
                <a className="memorylane-btn memorylane-btn-phone" href={PHONE_TEL}>
                  <Phone size={22} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
              <p className="memorylane-hero-note">A kind voice answers, seven days a week. No pressure, ever.</p>
            </div>
            <figure className="memorylane-polaroid memorylane-hero-photo">
              <div className="memorylane-polaroid-img">
                <img
                  src="https://images.unsplash.com/photo-1593100126453-19b562a800c1?auto=format&fit=crop&w=1600&q=80"
                  alt="An adult daughter sitting close to her elderly mother, sharing a warm, unhurried moment together"
                />
              </div>
              <figcaption className="memorylane-polaroid-caption">Some afternoons need no words at all.</figcaption>
            </figure>
          </div>
        </header>

        <section className="memorylane-reassure" aria-label="Our promises">
          <div className="memorylane-wrap memorylane-reassure-grid">
            {REASSURE.map(({ icon: Icon, title, text }) => (
              <div className="memorylane-reassure-item" key={title}>
                <Icon size={30} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="memorylane-section" aria-labelledby="memorylane-album-title">
          <div className="memorylane-wrap">
            <div className="memorylane-section-head memorylane-reveal">
              <h2 id="memorylane-album-title">Every memory has a home here</h2>
              <p>
                Good memory care doesn&apos;t erase the hard days — it fills the ordinary ones
                with familiarity, patience, and small moments of joy.
              </p>
            </div>
            <div className="memorylane-album-grid">
              {ALBUM.map(({ src, alt, caption }) => (
                <figure className="memorylane-polaroid memorylane-reveal" key={src}>
                  <div className="memorylane-polaroid-img">
                    <img src={src} alt={alt} loading="lazy" />
                  </div>
                  <figcaption className="memorylane-polaroid-caption">{caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="memorylane-section memorylane-support" aria-labelledby="memorylane-support-title">
          <div className="memorylane-wrap">
            <div className="memorylane-section-head memorylane-reveal">
              <h2 id="memorylane-support-title">How we support your family</h2>
              <p>
                One free, unhurried conversation is all it takes to begin. We listen first —
                then help you find memory-care support that feels right.
              </p>
            </div>
            <div className="memorylane-support-grid">
              {SUPPORT_CARDS.map(({ icon: Icon, title, text }) => (
                <article className="memorylane-card memorylane-reveal" key={title}>
                  <span className="memorylane-card-icon">
                    <Icon size={28} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="memorylane-band" aria-label="Call us">
          <div className="memorylane-wrap memorylane-band-inner">
            <div>
              <h2>Talk it through with a kind, patient listener.</h2>
              <p>Free consultation. No obligation. Just a calm conversation about what&apos;s next.</p>
            </div>
            <div className="memorylane-band-actions">
              <PhoneBandLink />
              <QuoteButton invert>Get a Free Consultation</QuoteButton>
            </div>
          </div>
        </section>

        <section className="memorylane-section" aria-labelledby="memorylane-feel-title">
          <div className="memorylane-wrap memorylane-feel-grid">
            <figure className="memorylane-polaroid memorylane-feel-photo memorylane-reveal">
              <div className="memorylane-polaroid-img">
                <img
                  src="https://images.unsplash.com/photo-1748865829154-b7ebb33f9d2f?auto=format&fit=crop&w=1600&q=80"
                  alt="A family sharing a relaxed, happy moment with their elderly relative at home"
                  loading="lazy"
                />
              </div>
              <figcaption className="memorylane-polaroid-caption">The feeling of family stays, always.</figcaption>
            </figure>
            <div className="memorylane-feel-text memorylane-reveal">
              <h2 id="memorylane-feel-title">What remains is what matters most</h2>
              <blockquote className="memorylane-quote">
                &ldquo;They may not remember what you said. They remember how you make them feel.&rdquo;
              </blockquote>
              <p>
                That belief shapes everything on this page. The right memory-care support
                protects those feelings — safety, warmth, belonging — every single day, and
                gives your family more room for the moments that matter.
              </p>
              <QuoteButton>Get a Free Consultation</QuoteButton>
            </div>
          </div>
        </section>

        <section className="memorylane-section memorylane-support" aria-labelledby="memorylane-resources-title">
          <div className="memorylane-wrap">
            <div className="memorylane-section-head memorylane-reveal">
              <h2 id="memorylane-resources-title">Gentle guidance for families</h2>
              <p>Topics our advisors are always glad to talk through with you — free of charge.</p>
            </div>
            <div className="memorylane-resource-grid">
              {RESOURCES.map(({ title, text }) => (
                <article className="memorylane-resource memorylane-reveal" key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="memorylane-section" aria-labelledby="memorylane-faq-title">
          <div className="memorylane-wrap">
            <div className="memorylane-section-head memorylane-reveal">
              <h2 id="memorylane-faq-title">Questions families often ask</h2>
              <p>Asked softly, answered honestly.</p>
            </div>
            <div className="memorylane-faq">
              {QUESTIONS.map(({ q, a }, i) => (
                <div className="memorylane-faq-item" key={q}>
                  <button
                    className="memorylane-faq-q"
                    type="button"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    {q}
                    <ChevronDown size={24} aria-hidden="true" />
                  </button>
                  {openFaq === i && <p className="memorylane-faq-a">{a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="memorylane-band" aria-label="Get started">
          <div className="memorylane-wrap memorylane-band-inner">
            <div>
              <h2>Whenever you&apos;re ready, we&apos;re here.</h2>
              <p>Begin with one gentle conversation — today, or whenever the time feels right.</p>
            </div>
            <div className="memorylane-band-actions">
              <PhoneBandLink />
              <QuoteButton invert>Get a Free Consultation</QuoteButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="memorylane-footer">
        <div className="memorylane-wrap">
          <div className="memorylane-footer-grid">
            <div>
              <span className="memorylane-brand">
                <Flower2 size={26} aria-hidden="true" />
                MemoryLane Care
              </span>
              <p>Specialised memory &amp; dementia care support, offered with patience and heart.</p>
            </div>
            <a className="memorylane-footer-phone" href={PHONE_TEL}>
              <Phone size={24} aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
          </div>
          <div className="memorylane-footer-legal">
            <p>Independent provider listing. Not medical advice.</p>
            <p>&copy; {new Date().getFullYear()} MemoryLane Care. A fictional brand shown for the AltFTool senior-care directory.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
