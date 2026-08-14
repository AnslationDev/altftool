import {
  AlertTriangle,
  Check,
  CheckSquare,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Image from "next/image";
import EstimateForm from "./EstimateForm";
import NewsletterForm from "./NewsletterForm";
import "./styles.css";

const trustPoints = [
  {
    title: "Fictional concept",
    desc: "Kairos is a made-up brand used only to demonstrate a landing-page layout.",
  },
  {
    title: "Non-operational",
    desc: "This preview does not offer inspections, bookings, treatment or customer support.",
  },
  {
    title: "Privacy safe",
    desc: "No name, email, phone number, address or free-text enquiry is requested or stored.",
  },
  {
    title: "Claim-free preview",
    desc: "Ratings, testimonials, credentials, business history and commercial guarantees are intentionally omitted.",
  },
];

const reasons = [
  {
    title: "Warning-sign education",
    desc: "A content module can explain common signs without diagnosing a property or promising an outcome.",
    icon: Sparkles,
  },
  {
    title: "Provider comparison prompts",
    desc: "The template can remind visitors to compare official records, written scopes and safety guidance.",
    icon: Search,
  },
  {
    title: "Privacy-first conversion area",
    desc: "The form area remains visible as a design example, but every personal-data field and submission action is disabled.",
    icon: Shield,
  },
];

const steps = [
  {
    title: "Learn the warning signs",
    desc: "Review neutral educational information and avoid treating a web page as a property diagnosis.",
    time: "Step 1",
    details: ["Read neutral guidance", "Photograph visible signs", "Avoid disturbing damaged areas"],
  },
  {
    title: "Verify a real provider",
    desc: "Use official local records and request current documentation before sharing property details.",
    time: "Step 2",
    details: ["Official regulator lookup", "Current insurance evidence", "Independent contact verification"],
  },
  {
    title: "Compare the written plan",
    desc: "Ask a verified provider to explain the inspection method, safety instructions, price and terms in writing.",
    time: "Step 3",
    details: ["Method explained", "Safety steps documented", "Price and terms in writing"],
  },
];

const verificationItems = [
  {
    mark: "1",
    name: "Check official registration",
  },
  {
    mark: "2",
    name: "Request current insurance evidence",
  },
  {
    mark: "3",
    name: "Compare written scope and terms",
  },
];

export default function KairosPestControlPage() {
  return (
    <main className="kairos-page">
      <header className="kairos-header">
        <a className="kairos-logo" href="#top" aria-label="Kairos fictional UI preview home">
          <span className="kairos-logo-mark" aria-hidden="true">
            <ShieldCheck size={28} />
          </span>
          <span className="kairos-logo-copy">
            <strong>KAIROS</strong>
            <small>Fictional UI Preview</small>
          </span>
        </a>

        <nav className="kairos-nav" aria-label="Preview navigation">
          <a href="#why-us">Preview Details</a>
          <a href="#warning">Warning Signs</a>
          <a href="#process">Research Flow</a>
          <a href="#checklist">Safety Checklist</a>
        </nav>

        <div className="kairos-header-copy">
          <p>Fictional UI demonstration</p>
          <strong>No live business or contact</strong>
        </div>
      </header>

      <section className="kairos-hero" id="top">
        <div className="kairos-hero-inner">
          <div className="kairos-hero-copy">
            <div className="kairos-badge-pill">
              <Sparkles size={14} className="kairos-pill-icon" />
              <span>Fictional UI Preview — Non-Operational</span>
            </div>
            <h1>
              Explore a Pest-Service
              <br />
              <span>Landing Page Concept</span>
            </h1>
            <p>
              This design demonstrates how educational content and a provider-verification checklist could be presented. It does not represent an active company or offer pest-control services.
            </p>

            <div className="kairos-hero-metrics" aria-label="Preview safeguards">
              <div className="kairos-metric-box">
                <strong>Demo</strong>
                <span>Fictional concept</span>
              </div>
              <div className="kairos-metric-box">
                <strong>Zero</strong>
                <span>Personal-data fields</span>
              </div>
              <div className="kairos-metric-box">
                <strong>No</strong>
                <span>Provider claims</span>
              </div>
            </div>

            <p className="kairos-text-direct">
              Do not use this preview to request help. For a real concern, independently find and verify a local provider.
            </p>

            <div className="kairos-mobile-actions">
              <a className="kairos-outline-button" href="#checklist">
                VIEW SAFETY CHECKLIST
              </a>
              <a className="kairos-call-button" href="#contact">
                REVIEW DEMO LIMITS
              </a>
            </div>
          </div>

          <aside className="kairos-estimate-card" id="estimate">
            <h2>Disabled Form Preview</h2>
            <p>No enquiry can be entered, saved or sent from this fictional concept.</p>
            <EstimateForm />
          </aside>
        </div>
      </section>

      <section className="kairos-trust-strip" aria-label="Fictional preview safeguards">
        <div className="kairos-trust-inner">
          {trustPoints.map((item) => (
            <div className="kairos-trust-card" key={item.title}>
              <div className="kairos-trust-card-header">
                <CheckSquare size={16} className="kairos-trust-icon" aria-hidden="true" />
                <h3>{item.title}</h3>
              </div>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="kairos-warning-section" id="warning">
        <div className="kairos-warning-inner">
          <div className="kairos-warning-visual" aria-hidden="true">
            <Image
              src="https://images.unsplash.com/photo-1591735115730-4bf3a351cfe8?auto=format&fit=crop&w=1400&q=82"
              alt=""
              width={1448}
              height={1086}
              className="kairos-warning-generated-image"
            />
            <Image
              src="https://images.unsplash.com/photo-1527359443443-84a48aec73d2?auto=format&fit=crop&w=600&q=82"
              alt=""
              width={300}
              height={261}
              className="kairos-warning-badge"
            />
          </div>
          <div className="kairos-warning-copy">
            <div className="kairos-section-tag">
              <AlertTriangle size={14} />
              <span>General Education</span>
            </div>
            <h2>
              Possible Termite Warning Signs <span>Need Evaluation.</span>
            </h2>
            <p>
              Flying insects, mud-like tubes, discarded wings or hollow-sounding wood can have multiple causes. A verified local professional should evaluate the property before any treatment decision.
            </p>

            <ul className="kairos-warning-list">
              <li>
                <Check size={16} />
                <span>Mud-like tubes near foundations or subfloors</span>
              </li>
              <li>
                <Check size={16} />
                <span>Discarded wings near windows and doors</span>
              </li>
              <li>
                <Check size={16} />
                <span>Wood that sounds hollow or feels soft</span>
              </li>
              <li>
                <Check size={16} />
                <span>Small sand-like pellets near wood</span>
              </li>
            </ul>

            <a className="kairos-green-button" href="#checklist">
              VIEW PROVIDER CHECKLIST
            </a>
          </div>
        </div>
      </section>

      <section className="kairos-reasons" id="why-us">
        <div className="kairos-section-tag">
          <ShieldCheck size={14} />
          <span>Preview Capabilities</span>
        </div>
        <h2>
          What This <em>Fictional Template</em> Demonstrates
        </h2>
        <div className="kairos-reason-grid">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <article className="kairos-reason-card" key={reason.title}>
                <div className="kairos-feature-icon-wrapper">
                  <Icon size={24} />
                </div>
                <h3>{reason.title}</h3>
                <p>{reason.desc}</p>
              </article>
            );
          })}
        </div>
        <a className="kairos-green-button" href="#contact">
          REVIEW DEMO SAFEGUARDS
        </a>
      </section>

      <section className="kairos-process" id="process">
        <div className="kairos-section-tag">
          <Zap size={14} />
          <span>Example Research Flow</span>
        </div>
        <h2>
          A Safer Way to Evaluate a <em>Possible Pest Concern</em>
        </h2>
        <div className="kairos-process-grid">
          {steps.map((step) => (
            <article className="kairos-process-card" key={step.title}>
              <span className="kairos-step-num">{step.time}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <ul className="kairos-process-bullets">
                {step.details.map((detail) => (
                  <li key={detail}>
                    <Check size={12} />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <a className="kairos-green-button" href="#checklist">
          VIEW PROVIDER CHECKLIST
        </a>
      </section>

      <section className="kairos-certifications" id="checklist" aria-label="Provider verification checklist">
        <div className="kairos-section-tag">
          <ShieldCheck size={14} />
          <span>Before Hiring</span>
        </div>
        <h2>Verify Any Real Provider Independently</h2>
        <p>
          Kairos is not a provider, and no organization endorses this fictional preview. For real work, use official records and independently confirmed contact details before sharing personal or property information.
        </p>
        <div className="kairos-certification-grid">
          {verificationItems.map((item) => (
            <div className="kairos-certification-logo-card" key={item.mark}>
              <div className="kairos-certification-logo-inner">
                <CheckSquare size={32} aria-hidden="true" />
                <strong>{item.mark}</strong>
              </div>
              <span className="kairos-cert-name">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="kairos-bottom-form" id="contact">
        <div className="kairos-bottom-container">
          <div className="kairos-bottom-copy">
            <div className="kairos-section-tag">
              <ShieldCheck size={14} />
              <span>Demo Limits</span>
            </div>
            <h2>No Live Booking or Contact</h2>
            <p>
              This route is a fictional, non-operational interface preview. It does not accept enquiries, schedule visits, subscribe visitors or connect anyone to a service provider.
            </p>
            <div className="kairos-bottom-contact-details">
              <div className="kairos-detail-item">
                <div className="kairos-detail-icon-wrapper">
                  <ShieldCheck size={18} />
                </div>
                <div className="kairos-detail-text">
                  <strong>Preview status</strong>
                  <span>Fictional and non-operational</span>
                </div>
              </div>
              <div className="kairos-detail-item">
                <div className="kairos-detail-icon-wrapper">
                  <CheckSquare size={18} />
                </div>
                <div className="kairos-detail-text">
                  <strong>Personal data</strong>
                  <span>Not requested, stored or sent</span>
                </div>
              </div>
              <div className="kairos-detail-item">
                <div className="kairos-detail-icon-wrapper">
                  <Search size={18} />
                </div>
                <div className="kairos-detail-text">
                  <strong>Real-world action</strong>
                  <span>Find and verify a local provider</span>
                </div>
              </div>
            </div>
          </div>

          <div className="kairos-bottom-form-inner">
            <EstimateForm />
          </div>
        </div>
      </section>

      <footer className="kairos-footer">
        <div className="kairos-footer-top">
          <div className="kairos-footer-brand">
            <div className="kairos-footer-logo-wrapper">
              <span className="kairos-logo-mark" aria-hidden="true">
                <ShieldCheck size={28} />
              </span>
              <span className="kairos-logo-copy">
                <strong>KAIROS</strong>
                <small>Fictional UI Preview</small>
              </span>
            </div>
            <p className="kairos-footer-tagline">
              A non-operational interface concept in the ALTFTool Business Ops gallery. It has no provider affiliation and offers no services.
            </p>
            <div className="kairos-footer-license">
              <span>Demo only • No enquiries • No personal-data collection</span>
            </div>
          </div>

          <div className="kairos-footer-links">
            <h3>Preview Links</h3>
            <ul>
              <li><a href="#top">Fictional Preview</a></li>
              <li><a href="#warning">General Warning Signs</a></li>
              <li><a href="#process">Research Flow</a></li>
              <li><a href="#checklist">Provider Checklist</a></li>
              <li><a href="#contact">Demo Limits</a></li>
            </ul>
          </div>

          <div className="kairos-footer-contact">
            <h3>Preview Status</h3>
            <div className="kairos-footer-contact-item">
              <ShieldCheck size={16} className="kairos-contact-icon" />
              <p><strong>Business:</strong> Fictional</p>
            </div>
            <div className="kairos-footer-contact-item">
              <CheckSquare size={16} className="kairos-contact-icon" />
              <p><strong>Forms:</strong> Disabled</p>
            </div>
            <div className="kairos-footer-contact-item">
              <Search size={16} className="kairos-contact-icon" />
              <p><strong>Provider claims:</strong> None</p>
            </div>
          </div>

          <div className="kairos-footer-newsletter">
            <h3>Updates Unavailable</h3>
            <p>The newsletter area is disabled and does not request or store an email address.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="kairos-footer-bottom">
          <p className="kairos-copyright">Kairos fictional UI preview by ALTFTool. No provider affiliation.</p>
          <div className="kairos-footer-legal">
            <a href="#top">Preview disclaimer</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
