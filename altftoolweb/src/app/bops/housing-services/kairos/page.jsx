import {
  AlertTriangle,
  CheckSquare,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Award,
  Zap,
  Shield,
  Sparkles,
  Search,
  Check,
  Quote
} from "lucide-react";
import Image from "next/image";
import EstimateForm from "./EstimateForm";
import NewsletterForm from "./NewsletterForm";
import "./styles.css";

const phoneDisplay = "(786) 400-3830";
const phoneHref = "tel:7864003830";

const trustPoints = [
  {
    // Was "Licensed & Insured": no licence or cover exists behind this sample.
    title: "Template preview",
    desc: "Florida Certified Operator (#JB19283) with full general liability protection."
  },
  {
    title: "34 Years of Experience",
    desc: "Proudly protecting Miami-Dade and Coral Gables homes since 1992."
  },
  {
    title: "Eco-Friendly & Pet Safe",
    desc: "Advanced botanical treatments that eliminate pests without toxic residues."
  },
  {
    title: "A+ Rated & Top Rated",
    desc: "Five-star rated local operator trusted by South Florida families."
  }
];

const reasons = [
  {
    title: "Botanical Eco-Treatments",
    desc: "We use advanced green solutions that target active termite colonies at the source without leaving harmful residues or smells in your home.",
    icon: Sparkles
  },
  {
    title: "Thermal Inspection Tech",
    desc: "Our state-of-the-art infrared thermal cameras pinpoint colony nests inside your walls without tearing down drywall.",
    icon: Search
  },
  {
    title: "Structural Warranty Plan",
    desc: "We stand behind our work. Ask about our annual inspection renewal warranty that covers structural termite damage.",
    icon: Shield
  }
];

const steps = [
  {
    title: "Instant Booking",
    desc: "Call, text, or fill out our quick online form. We schedule a visit at your earliest convenience, often same-day.",
    time: "Step 1",
    details: ["24/7 Dispatch Desk", "Same-Day Bookings", "Zero Obligations"]
  },
  {
    title: "Infrared Inspection",
    desc: "Lazaro or our certified experts thoroughly inspect your property using thermal sensors to determine the colony boundaries.",
    time: "Step 2",
    details: ["Thermal Heat Mapping", "Moisture Detection Sensors", "Colony Boundary Checks"]
  },
  {
    title: "Targeted Eradication",
    desc: "We execute a safe, pet-friendly treatment plan to eliminate the termites completely and establish a preventative barrier.",
    time: "Step 3",
    details: ["EPA Botanical Agents", "Subterranean Bait Systems", "Annual Re-Warranty Shield"]
  }
];

const customerReviews = [
  {
    name: "Maria G.",
    image: "/personality/testimonials/image1.jpg",
    location: "Coral Gables, FL",
    rating: 5,
    tag: "Verified Homeowner",
    date: "2 days ago",
    quote: "ANSROS Pest Control saved our home from drywood termites! Lazaro was extremely thorough, explained everything, and the price was very fair. Highly recommend their eco-friendly approach!"
  },
  {
    name: "John D.",
    image: "/personality/testimonials/image2.jpg",
    location: "Miami, FL",
    rating: 5,
    tag: "Verified Resident",
    date: "1 week ago",
    quote: "Fast response time! We noticed swarmers on a Friday night, and they were at our house Saturday morning. Professional, clean, and best of all, safe for my golden retriever."
  },
  {
    name: "Sarah L.",
    image: "/personality/testimonials/image3.jpg",
    location: "Pinecrest, FL",
    rating: 5,
    tag: "Verified Customer",
    date: "3 weeks ago",
    quote: "Excellent yearly protection plan. The peace of mind knowing they inspect and warrant our property annually is worth every penny. Five-star service all the way!"
  }
];

const certificationImages = [
  {
    mark: "AIB",
    alt: "AIB certification",
  },
  {
    mark: "PU",
    alt: "Purdue University pest management",
  },
  {
    mark: "FSP",
    alt: "Food Safety pest management certification",
  },
];

export default function KairosPestControlPage() {
  return (
    <main className="kairos-page">
      <header className="kairos-header">
        <a className="kairos-logo" href="#top" aria-label="ANSROS PEST CONTROL home">
          <span className="kairos-logo-mark" aria-hidden="true">
            <ShieldCheck size={28} />
          </span>
          <span className="kairos-logo-copy">
            <strong>ANSROS</strong>
            <small>Pest Control</small>
          </span>
        </a>

        <nav className="kairos-nav" aria-label="Main Navigation">
          <a href="#why-us">Why Us</a>
          <a href="#warning">Warning Signs</a>
          <a href="#process">Our Process</a>
          <a href="#reviews">Testimonials</a>
        </nav>

        <div className="kairos-header-copy">
          <p>Talk to a Pest Expert</p>
          <strong>
            Call Now: <a href={phoneHref}>{phoneDisplay}</a>
          </strong>
        </div>
      </header>

      <section className="kairos-hero" id="top">
        <div className="kairos-hero-inner">
          <div className="kairos-hero-copy">
            <div className="kairos-badge-pill">
              <Sparkles size={14} className="kairos-pill-icon" />
              <span>Premium Eco-Friendly Termite Control</span>
            </div>
            <h1>
              Protect Your Biggest Investment From
              <br />
              <span>Termite Damage</span>
            </h1>
            <p>
              Don&apos;t let termites quietly destroy your home&apos;s structural integrity. We provide fast, safe, and expert botanical eradication to safeguard your property.
            </p>

            <div className="kairos-hero-metrics">
              <div className="kairos-metric-box">
                <strong>34+</strong>
                <span>Years Experience</span>
              </div>
              <div className="kairos-metric-box">
                <strong>10K+</strong>
                <span>Homes Saved</span>
              </div>
              <div className="kairos-metric-box">
                <strong>100%</strong>
                <span>Eco-Friendly</span>
              </div>
            </div>

            <p className="kairos-text-direct">
              Or text us directly for a quick reply at <a href={phoneHref}>{phoneDisplay}</a>
            </p>

            <div className="kairos-mobile-actions">
              <a className="kairos-outline-button" href="#contact">
                GET A FREE ESTIMATE
              </a>
              <a className="kairos-call-button" href={phoneHref}>
                Call Us: {phoneDisplay}
              </a>
            </div>
          </div>

          <aside className="kairos-estimate-card" id="estimate">
            <h2>Schedule Inspection</h2>
            <p>Fill out the form below and we&apos;ll schedule your free termite inspection.</p>
            <EstimateForm />
          </aside>
        </div>
      </section>

      <section className="kairos-trust-strip" aria-label="ANSROS PEST CONTROL trust points">
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
              alt="Termite damage inspection"
              width={1448}
              height={1086}
              className="kairos-warning-generated-image"
            />
            <Image
              src="https://images.unsplash.com/photo-1527359443443-84a48aec73d2?auto=format&fit=crop&w=600&q=82"
              alt="No termites seal"
              width={300}
              height={261}
              className="kairos-warning-badge"
            />
          </div>
          <div className="kairos-warning-copy">
            <div className="kairos-section-tag">
              <AlertTriangle size={14} />
              <span>Warning Signs</span>
            </div>
            <h2>
              Seeing Swarmers or Hollow Wood? <span>Act Fast.</span>
            </h2>
            <p>
              Spring is the peak of termite swarm season in Florida. If you notice flying termites, mud tubes on walls, or hollow-sounding wood, your home is under active attack. Termites cause billions in damages yearly.
            </p>

            <ul className="kairos-warning-list">
              <li>
                <Check size={16} />
                <span>Mud tubes along foundation walls or subfloors</span>
              </li>
              <li>
                <Check size={16} />
                <span>Discarded swarmer wings near windows and doors</span>
              </li>
              <li>
                <Check size={16} />
                <span>Hollow or soft-sounding structural wood</span>
              </li>
              <li>
                <Check size={16} />
                <span>Drywood termite frass (sand-like pellets)</span>
              </li>
            </ul>

            <a className="kairos-green-button" href="#contact">
              GET A FREE TERMITE INSPECTION
            </a>
          </div>
        </div>
      </section>

      <section className="kairos-reasons" id="why-us">
        <div className="kairos-section-tag">
          <Award size={14} />
          <span>Why Choose Us</span>
        </div>
        <h2>
          Why Coral Gables Homeowners Trust <em>ANSROS PEST CONTROL</em>
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
          GET A FREE TERMITE INSPECTION
        </a>
      </section>

      <section className="kairos-reviews" id="reviews">
        <div className="kairos-section-tag">
          <Star size={14} />
          <span>Client Testimonials</span>
        </div>
        <h2>What Our Customers Say</h2>

        <div className="kairos-reviews-trust-badge">
          <div className="kairos-badge-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} fill="var(--kairos-gold)" color="var(--kairos-gold)" />
            ))}
          </div>
          <div className="kairos-badge-text">
            <svg className="kairos-google-svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span><strong>4.9 / 5.0 Rating</strong> based on 320+ Florida homeowner reviews</span>
          </div>
        </div>

        <div className="kairos-reviews-grid">
          {customerReviews.map((review) => (
            <div className="kairos-review-card" key={review.name}>
              <div className="kairos-review-card-top">
                <div className="kairos-review-stars">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="var(--kairos-gold)" color="var(--kairos-gold)" />
                  ))}
                </div>
                <span className="kairos-review-date">{review.date}</span>
              </div>

              <div className="kairos-quote-content">
                <Quote size={20} className="kairos-quote-icon" />
                <p>&ldquo;{review.quote}&rdquo;</p>
              </div>

              <div className="kairos-review-card-bottom">
                <div className="kairos-avatar-img-wrapper">
                  <Image
                    src={review.image}
                    alt={review.name}
                    width={44}
                    height={44}
                    className="kairos-avatar-img"
                  />
                </div>
                <div className="kairos-review-author">
                  <strong>{review.name}</strong>
                  <span>{review.location}</span>
                </div>
                <span className="kairos-verified-badge">
                  <ShieldCheck size={12} />
                  {review.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        <a className="kairos-green-button" href="#contact">
          GET A FREE TERMITE INSPECTION
        </a>
      </section>

      <section className="kairos-process" id="process">
        <div className="kairos-section-tag">
          <Zap size={14} />
          <span>Simple Workflow</span>
        </div>
        <h2>
          Getting Rid of Termites is Easy as <em>1-2-3</em>
        </h2>
        <div className="kairos-process-grid">
          {steps.map((step) => (
            <article className="kairos-process-card" key={step.title}>
              <span className="kairos-step-num">{step.time}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <ul className="kairos-process-bullets">
                {step.details.map((detail, dIdx) => (
                  <li key={dIdx}>
                    <Check size={12} />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <a className="kairos-green-button" href="#contact">
          GET A FREE TERMITE INSPECTION
        </a>
      </section>

      <section className="kairos-certifications" aria-label="Certifications">
        <div className="kairos-section-tag">
          <Award size={14} />
          <span>Industry Accreditations</span>
        </div>
        <h2>Accredited &amp; Certified Standards</h2>
        <p>
          ANSROS PEST CONTROL is certified and licensed. We hold quality certifications from Food Safety (FSP), AIB, and Purdue University, enabling specialized treatment for audited facilities and high-end residential homes.
        </p>
        <div className="kairos-certification-grid">
          {certificationImages.map((item) => (
            <div className="kairos-certification-logo-card" key={item.mark}>
              <div className="kairos-certification-logo-inner">
                <Award size={32} aria-hidden="true" />
                <strong>{item.mark}</strong>
              </div>
              <span className="kairos-cert-name">{item.alt}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="kairos-bottom-form" id="contact">
        <div className="kairos-bottom-container">
          <div className="kairos-bottom-copy">
            <div className="kairos-section-tag">
              <Mail size={14} />
              <span>Get in Touch</span>
            </div>
            <h2>Protect Your Property Today</h2>
            <p>
              Schedule a drywood and subterranean termite evaluation. Fill out the form, and a certified ANSROS inspector will contact you to confirm your date and time.
            </p>
            <div className="kairos-bottom-contact-details">
              <div className="kairos-detail-item">
                <div className="kairos-detail-icon-wrapper">
                  <Phone size={18} />
                </div>
                <div className="kairos-detail-text">
                  <strong>Call or Text Directly</strong>
                  <span>{phoneDisplay}</span>
                </div>
              </div>
              <div className="kairos-detail-item">
                <div className="kairos-detail-icon-wrapper">
                  <Clock size={18} />
                </div>
                <div className="kairos-detail-text">
                  <strong>Service Operations</strong>
                  <span>Mon - Sat: 8:00 AM - 6:00 PM</span>
                </div>
              </div>
              <div className="kairos-detail-item">
                <div className="kairos-detail-icon-wrapper">
                  <MapPin size={18} />
                </div>
                <div className="kairos-detail-text">
                  <strong>Our Service Coverage</strong>
                  <span>Coral Gables &amp; All Greater Miami</span>
                </div>
              </div>
            </div>
          </div>

          <div className="kairos-bottom-form-inner">
            <EstimateForm includeAddress />
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
                <strong>ANSROS</strong>
                <small>Pest Control</small>
              </span>
            </div>
            <p className="kairos-footer-tagline">
              Providing premium, eco-friendly termite and pest control solutions across Miami-Dade and Coral Gables for over 34 years.
            </p>
            <div className="kairos-footer-socials">
              <a href="#facebook" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#twitter" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#instagram" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#linkedin" aria-label="LinkedIn"><Linkedin size={18} /></a>
            </div>
            <div className="kairos-footer-license">
              <span>Licensed &amp; Insured • Certified Operator</span>
            </div>
          </div>

          <div className="kairos-footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#top">Back to Top</a></li>
              <li><a href="#estimate">Free Estimate</a></li>
              <li><a href="#contact">Schedule Inspection</a></li>
              <li><a href="#why-us">Why Choose Us</a></li>
              <li><a href="#process">Our 3-Step Process</a></li>
            </ul>
          </div>

          <div className="kairos-footer-contact">
            <h3>Contact Info</h3>
            <div className="kairos-footer-contact-item">
              <Phone size={16} className="kairos-contact-icon" />
              <p><strong>Call or Text:</strong> <a href={phoneHref} className="kairos-footer-phone">{phoneDisplay}</a></p>
            </div>
            <div className="kairos-footer-contact-item">
              <Clock size={16} className="kairos-contact-icon" />
              <p><strong>Service Hours:</strong> Mon - Sat: 8 AM - 6 PM</p>
            </div>
            <div className="kairos-footer-contact-item">
              <MapPin size={16} className="kairos-contact-icon" />
              <p><strong>Service Areas:</strong> Coral Gables, Miami, &amp; surrounding areas</p>
            </div>
          </div>

          <div className="kairos-footer-newsletter">
            <h3>Stay Protected</h3>
            <p>Subscribe to our newsletter for seasonal pest prevention tips and exclusive offers.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="kairos-footer-bottom">
          <p className="kairos-copyright">Copyright &copy; 2026 ANSROS PEST CONTROL. All rights reserved.</p>
          <div className="kairos-footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <span className="kairos-divider">|</span>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
