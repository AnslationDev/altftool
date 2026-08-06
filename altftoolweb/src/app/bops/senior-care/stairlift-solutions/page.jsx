"use client";

import { useState } from "react";
import {
  Phone, ArrowRight, ShieldCheck, Clock, Wrench, Heart, CheckCircle2,
  ChevronDown, Armchair, Layers, Hand, Sparkles, ClipboardCheck,
} from "lucide-react";
import "./stairlift-solutions.css";

const QUOTE_URL = "#demo-only";
const PHONE_TEL = "#demo-only";
const PHONE_DISPLAY = "Demo only";

const IMG = {
  hero: "https://images.unsplash.com/photo-1766325941906-37298f6180be?auto=format&fit=crop&w=1600&q=80",
  wide: "https://images.unsplash.com/photo-1746491193434-b763c7060a1b?auto=format&fit=crop&w=1600&q=80",
  cardStairlift: "https://images.unsplash.com/photo-1780245997050-65240a81731b?auto=format&fit=crop&w=900&q=80",
  cardRamp: "https://images.unsplash.com/photo-1759774310270-da7eb867790a?auto=format&fit=crop&w=900&q=80",
  cardRails: "https://images.unsplash.com/photo-1774348696258-4eed85e72d47?auto=format&fit=crop&w=900&q=80",
};

const BENEFITS = [
  { icon: Armchair, title: "Stairlifts, straight or curved",
    text: "Illustrative copy showing where a provider could describe product types and controls." },
  { icon: Layers, title: "Modular ramps",
    text: "Illustrative copy showing where a provider could describe ramp options and assessment requirements." },
  { icon: Hand, title: "Grab rails & handrails",
    text: "Illustrative copy showing where placement, materials, and installation scope could be explained." },
  { icon: Clock, title: "Timeline placeholder",
    text: "A verified provider could publish assessment, manufacture, and installation timing here." },
  { icon: ShieldCheck, title: "Safety-policy placeholder",
    text: "A real provider could document applicable standards, checks, and handover procedures here." },
  { icon: Sparkles, title: "Home-care policy example",
    text: "This card demonstrates where site-protection and cleanup policies could appear." },
];

const SERVICES = [
  { img: IMG.cardStairlift, alt: "Licensed stock photo illustrating a seat near a home staircase", title: "Stairlifts",
    text: "Example copy showing where product configuration and property-assessment details could appear." },
  { img: IMG.cardRamp, alt: "Licensed stock photo illustrating an accessible home entryway", title: "Ramps",
    text: "Example copy showing where a provider could explain permanent and portable ramp options." },
  { img: IMG.cardRails, alt: "Licensed stock photo illustrating a handrail in a home hallway", title: "Grab rails",
    text: "Example copy showing where rail placement, finishes, and installation scope could appear." },
];

const TIMELINE = [
  { time: "Step 1", icon: ClipboardCheck, title: "Example assessment",
    text: "A verified provider could explain measurement and needs-assessment procedures here." },
  { time: "Step 2", icon: Wrench, title: "Example installation",
    text: "This card demonstrates where fitting scope and property-protection policies could appear." },
  { time: "Step 3", icon: CheckCircle2, title: "Example handover",
    text: "A provider could document applicable checks and user guidance here." },
  { time: "Step 4", icon: Heart, title: "Example follow-up",
    text: "This final step shows where support and maintenance information could be presented." },
];

const FAQS = [
  { q: "Will a stairlift fit my staircase?",
    a: "This demo cannot assess a property. A qualified mobility-equipment provider must inspect the staircase and the user's needs before recommending any product." },
  { q: "How long does fitting take?",
    a: "This demo does not promise a timeline. Assessment, product availability, customization, and installation timing vary by provider and property." },
  { q: "Will it damage my walls or carpets?",
    a: "Installation methods and property impact depend on the selected equipment and staircase. Ask a qualified installer for a written property-protection plan." },
  { q: "What if my needs change later?",
    a: "A qualified professional should reassess changing mobility needs. This page does not recommend equipment or arrange consultations." },
];

function StepsMotif({ className = "" }) {
  return (
    <div className={`stairlift-steps ${className}`.trim()} aria-hidden="true">
      <span /><span /><span /><span /><span />
    </div>
  );
}

function QuoteButton({ className = "stairlift-btn stairlift-btn-primary" }) {
  return (
    <a className={className} href={QUOTE_URL} target="_blank" rel="sponsored noopener noreferrer">
      Preview Consultation CTA
      <ArrowRight size={20} aria-hidden="true" />
    </a>
  );
}

function PhoneLink({ className = "stairlift-phone", iconSize = 22 }) {
  return (
    <a className={className} href={PHONE_TEL}>
      <Phone size={iconSize} aria-hidden="true" />
      {PHONE_DISPLAY}
    </a>
  );
}

export default function StairLiftSolutionsPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="stairlift-page">
      <header className="stairlift-header">
        <div className="stairlift-shell stairlift-nav">
          <a className="stairlift-brand" href="#top" aria-label="StairLift Solutions home">
            <StepsMotif className="stairlift-steps-logo" />
            <span className="stairlift-brand-name">StairLift <em>Solutions</em></span>
          </a>
          <nav aria-label="Main">
            <ul className="stairlift-nav-links">
              <li><a href="#benefits">Example details</a></li>
              <li><a href="#services">Product cards</a></li>
              <li><a href="#how">Example workflow</a></li>
              <li><a href="#faq">Questions</a></li>
            </ul>
          </nav>
          <div className="stairlift-nav-cta">
            <PhoneLink />
            <QuoteButton />
          </div>
        </div>
      </header>

      <main id="top">
        <section className="stairlift-hero" aria-labelledby="stairlift-hero-title">
          <div className="stairlift-shell stairlift-hero-grid">
            <div className="stairlift-hero-copy">
              <p className="stairlift-kicker">Stairlifts · Ramps · Grab Rails</p>
              <h1 id="stairlift-hero-title">
                Stay in the home <em>you love</em> — every floor of it.
              </h1>
              <p className="stairlift-hero-sub">
                A design demonstration showing how a verified mobility-equipment provider
                could organize product, assessment, installation, and support information.
              </p>
              <div className="stairlift-hero-actions">
                <QuoteButton />
                <PhoneLink className="stairlift-phone stairlift-phone-xl" iconSize={30} />
              </div>
              <ul className="stairlift-chips">
                <li><CheckCircle2 size={20} aria-hidden="true" /> Example assessment section</li>
                <li><CheckCircle2 size={20} aria-hidden="true" /> Disabled consultation control</li>
                <li><CheckCircle2 size={20} aria-hidden="true" /> Credential placeholder</li>
              </ul>
            </div>
            <div className="stairlift-hero-media">
              <img
                src={IMG.hero}
                alt="Licensed stock photo of a warm, sunlit home staircase"
              />
              <StepsMotif />
            </div>
          </div>
        </section>

        <section className="stairlift-trustbar" aria-label="Design demonstration overview">
          <div className="stairlift-shell stairlift-trustbar-grid">
            <div><strong>Options</strong><span>straight and curved stair layouts</span></div>
            <div><strong>Planning</strong><span>illustrative home-assessment flow</span></div>
            <div><strong>Demo</strong><span>quotes and provider matching disabled</span></div>
          </div>
        </section>

        <section id="benefits" className="stairlift-section" aria-labelledby="stairlift-benefits-title">
          <div className="stairlift-shell">
            <div className="stairlift-section-head">
              <p className="stairlift-kicker">Example information cards</p>
              <h2 id="stairlift-benefits-title">Preview a mobility-product overview</h2>
              <p>
                Illustrative content only; no product, fitting, credential, or suitability
                claim is made by this fictional page.
              </p>
            </div>
            <div className="stairlift-benefits-grid">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <article className="stairlift-card" key={title}>
                  <span className="stairlift-card-icon"><Icon size={34} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="stairlift-divider"><StepsMotif /></div>

        <section id="services" className="stairlift-section stairlift-section-alt" aria-labelledby="stairlift-services-title">
          <div className="stairlift-shell">
            <div className="stairlift-section-head">
              <p className="stairlift-kicker">Example product categories</p>
              <h2 id="stairlift-services-title">Three illustrative service cards</h2>
            </div>
            <div className="stairlift-services-grid">
              {SERVICES.map(({ img, alt, title, text }) => (
                <article className="stairlift-service" key={title}>
                  <div className="stairlift-service-imgwrap">
                    <img src={img} alt={alt} loading="lazy" />
                  </div>
                  <div className="stairlift-service-body">
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="stairlift-midband" aria-label="Preview consultation call to action">
          <div className="stairlift-shell">
            <h2>Preview a consultation call to action</h2>
            <p>No team, phone service, assessment, or provider matching is available from this demo.</p>
            <div className="stairlift-band-actions">
              <PhoneLink className="stairlift-phone stairlift-phone-xl" iconSize={32} />
              <QuoteButton className="stairlift-btn stairlift-btn-ghost" />
            </div>
          </div>
        </section>

        <section id="how" className="stairlift-section" aria-labelledby="stairlift-how-title">
          <div className="stairlift-shell">
            <div className="stairlift-section-head">
              <p className="stairlift-kicker">Example workflow</p>
              <h2 id="stairlift-how-title">Preview an assessment-to-follow-up flow</h2>
              <p>No installation timing or availability is promised.</p>
            </div>
            <ol className="stairlift-timeline">
              {TIMELINE.map(({ time, icon: Icon, title, text }) => (
                <li className="stairlift-step" key={time}>
                  <span className="stairlift-step-dot"><Icon size={30} aria-hidden="true" /></span>
                  <div className="stairlift-step-body">
                    <span className="stairlift-step-time">{time}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="stairlift-section stairlift-section-alt" aria-labelledby="stairlift-home-title">
          <div className="stairlift-shell stairlift-split">
            <div>
              <p className="stairlift-kicker">Why it matters</p>
              <h2 id="stairlift-home-title">The garden you planted. The kitchen you know by heart.</h2>
              <p>
                Home is more than an address — it&apos;s decades of memories in every room.
                The right equipment simply keeps those rooms easy to reach, so moving
                out never has to be the first option considered.
              </p>
              <ul className="stairlift-checklist">
                <li><CheckCircle2 size={22} aria-hidden="true" /> Keep your own bedroom, bathroom and routines</li>
                <li><CheckCircle2 size={22} aria-hidden="true" /> Welcome family upstairs and down, just as always</li>
                <li><CheckCircle2 size={22} aria-hidden="true" /> Compare suitability, disruption, and full costs with qualified professionals</li>
              </ul>
              <QuoteButton />
            </div>
            <div className="stairlift-split-media">
              <img
                src={IMG.wide}
                alt="Licensed stock photo of a couple relaxing in a bright living room"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section id="faq" className="stairlift-section" aria-labelledby="stairlift-faq-title">
          <div className="stairlift-shell">
            <div className="stairlift-section-head">
              <p className="stairlift-kicker">Good questions</p>
              <h2 id="stairlift-faq-title">Asked all the time</h2>
            </div>
            <div className="stairlift-faq-list">
              {FAQS.map(({ q, a }, i) => {
                const isOpen = openFaq === i;
                return (
                  <div className={`stairlift-faq-item ${isOpen ? "stairlift-faq-open" : ""}`.trim()} key={q}>
                    <h3>
                      <button
                        type="button"
                        className="stairlift-faq-q"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaq(isOpen ? -1 : i)}
                      >
                        {q}
                        <ChevronDown size={26} aria-hidden="true" />
                      </button>
                    </h3>
                    {isOpen && <p className="stairlift-faq-a">{a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="stairlift-band-dark" aria-label="Get started">
          <div className="stairlift-shell">
            <div className="stairlift-divider"><StepsMotif /></div>
            <h2>Preview the final consultation band</h2>
            <p>
              This disabled component does not book an assessment, contact a provider,
              or recommend mobility equipment.
            </p>
            <div className="stairlift-band-actions">
              <QuoteButton className="stairlift-btn stairlift-btn-cream" />
              <PhoneLink className="stairlift-phone stairlift-phone-xl" iconSize={34} />
            </div>
          </div>
        </section>
      </main>

      <footer className="stairlift-footer">
        <div className="stairlift-shell">
          <div className="stairlift-footer-top">
            <span className="stairlift-brand-name">StairLift <em>Solutions</em></span>
            <PhoneLink />
          </div>
          <div className="stairlift-footer-legal">
            <strong>Design demonstration, not a provider listing or medical advice.</strong>
            <span>
              StairLift Solutions is fictional and does not connect homeowners with
              fitters, collect enquiries, or offer products or consultations.
            </span>
            <span>© 2026 StairLift Solutions. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
