"use client";

import { useState } from "react";
import {
  Phone, ArrowRight, ShieldCheck, Clock, Wrench, Heart, CheckCircle2,
  ChevronDown, Armchair, Layers, Hand, Sparkles, ClipboardCheck,
} from "lucide-react";
import "./stairlift-solutions.css";

const QUOTE_URL = "https://example.com/quote/stairlift-solutions";
const PHONE_TEL = "tel:+18885550543";
const PHONE_DISPLAY = "(888) 555-0543";

const IMG = {
  hero: "https://images.unsplash.com/photo-1766325941906-37298f6180be?auto=format&fit=crop&w=1600&q=80",
  wide: "https://images.unsplash.com/photo-1746491193434-b763c7060a1b?auto=format&fit=crop&w=1600&q=80",
  cardStairlift: "https://images.unsplash.com/photo-1780245997050-65240a81731b?auto=format&fit=crop&w=900&q=80",
  cardRamp: "https://images.unsplash.com/photo-1759774310270-da7eb867790a?auto=format&fit=crop&w=900&q=80",
  cardRails: "https://images.unsplash.com/photo-1774348696258-4eed85e72d47?auto=format&fit=crop&w=900&q=80",
};

const BENEFITS = [
  { icon: Armchair, title: "Stairlifts, straight or curved",
    text: "Slim-profile seats that fold away neatly, with gentle starts and stops and simple, easy-to-reach controls." },
  { icon: Layers, title: "Modular ramps",
    text: "Sturdy, slip-resistant ramps for porches, thresholds and garden steps — sized to your doorway, not the other way round." },
  { icon: Hand, title: "Grab rails & handrails",
    text: "Solidly anchored rails exactly where a steady hand helps most: bathrooms, hallways, entrances and stairs." },
  { icon: Clock, title: "Fitted in a day",
    text: "Most straight-stair installations are measured, fitted and demonstrated within a single visit." },
  { icon: ShieldCheck, title: "Safety-checked installs",
    text: "Every fitting is load-tested and walked through with you before our fitters pack up a single tool." },
  { icon: Sparkles, title: "Tidy, respectful fitters",
    text: "Dust sheets down, shoes covered, furniture back where it was. Your home is treated like our own." },
];

const SERVICES = [
  { img: IMG.cardStairlift, alt: "A comfortable armchair-style seat beside a sunlit home staircase", title: "Stairlifts",
    text: "Rail-mounted seats fitted to the stair treads — no wall damage — so both floors of home stay yours to enjoy." },
  { img: IMG.cardRamp, alt: "A gently sloped accessible entryway leading to a home's front door", title: "Ramps",
    text: "Permanent or portable ramps with grippy surfaces and guarded edges, matched to the entrance you use every day." },
  { img: IMG.cardRails, alt: "A sturdy handrail fixed along a bright home hallway wall", title: "Grab rails",
    text: "Discreet, well-made rails in finishes that suit your décor — support that doesn't shout about itself." },
];

const TIMELINE = [
  { time: "9:00 AM", icon: ClipboardCheck, title: "Friendly walk-through",
    text: "A local surveyor measures your stairs and listens to how you actually use your home." },
  { time: "10:30 AM", icon: Wrench, title: "Careful installation",
    text: "The rail and seat are fitted to your stair treads. Dust sheets stay down the whole time." },
  { time: "2:00 PM", icon: CheckCircle2, title: "Test & demonstration",
    text: "We run full safety checks, then show you every control until it feels like second nature." },
  { time: "By evening", icon: Heart, title: "Home, as you like it",
    text: "Kettle on, feet up — the whole house within easy reach again, the very same day." },
];

const FAQS = [
  { q: "Will a stairlift fit my staircase?",
    a: "Almost certainly. Straight, curved, narrow and split-level staircases can all be fitted with the right rail. A free home visit confirms the exact fit before you decide anything." },
  { q: "How long does fitting take?",
    a: "Most straight-stair fittings are completed in a single day. Curved rails are made to measure and usually fitted within a couple of weeks of your survey." },
  { q: "Will it damage my walls or carpets?",
    a: "No. Stairlift rails mount to the stair treads rather than the wall, and our fitters protect carpets and banisters throughout the installation." },
  { q: "What if my needs change later?",
    a: "Equipment can be adjusted, added to or removed as life changes. Your consultation covers options for the future as well as today, with no obligation either way." },
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
      Get a Free Consultation
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
              <li><a href="#benefits">Why us</a></li>
              <li><a href="#services">What we fit</a></li>
              <li><a href="#how">Fitted in a day</a></li>
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
                Thoughtfully fitted stairlifts, ramps and grab rails that keep the whole
                house comfortable and within reach. Measured, fitted and demonstrated —
                often in a single day.
              </p>
              <div className="stairlift-hero-actions">
                <QuoteButton />
                <PhoneLink className="stairlift-phone stairlift-phone-xl" iconSize={30} />
              </div>
              <ul className="stairlift-chips">
                <li><CheckCircle2 size={20} aria-hidden="true" /> Free home assessment</li>
                <li><CheckCircle2 size={20} aria-hidden="true" /> No-obligation quote</li>
                <li><CheckCircle2 size={20} aria-hidden="true" /> Local, vetted fitters</li>
              </ul>
            </div>
            <div className="stairlift-hero-media">
              <img
                src={IMG.hero}
                alt="A warm, sunlit staircase with a wooden banister in a welcoming family home"
              />
              <StepsMotif />
            </div>
          </div>
        </section>

        <section className="stairlift-trustbar" aria-label="Why families choose us">
          <div className="stairlift-shell stairlift-trustbar-grid">
            <div><strong>12,000+</strong><span>homes fitted</span></div>
            <div><strong>1 day</strong><span>typical straight-stair fit</span></div>
            <div><strong>4.9 / 5</strong><span>average family rating</span></div>
            <div><strong>Free</strong><span>home assessment &amp; quote</span></div>
          </div>
        </section>

        <section id="benefits" className="stairlift-section" aria-labelledby="stairlift-benefits-title">
          <div className="stairlift-shell">
            <div className="stairlift-section-head">
              <p className="stairlift-kicker">Practical reassurance</p>
              <h2 id="stairlift-benefits-title">Small changes, whole home back</h2>
              <p>
                No pressure and no jargon — just well-made equipment, fitted properly,
                so familiar routines stay exactly that.
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
              <p className="stairlift-kicker">What we fit</p>
              <h2 id="stairlift-services-title">Three ways to make home easier</h2>
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

        <section className="stairlift-midband" aria-label="Call for a free consultation">
          <div className="stairlift-shell">
            <h2>Prefer to talk it through?</h2>
            <p>Our friendly team answers seven days a week — real people, happy to take their time.</p>
            <div className="stairlift-band-actions">
              <PhoneLink className="stairlift-phone stairlift-phone-xl" iconSize={32} />
              <QuoteButton className="stairlift-btn stairlift-btn-ghost" />
            </div>
          </div>
        </section>

        <section id="how" className="stairlift-section" aria-labelledby="stairlift-how-title">
          <div className="stairlift-shell">
            <div className="stairlift-section-head">
              <p className="stairlift-kicker">Fitted in a day</p>
              <h2 id="stairlift-how-title">From first knock to feet up</h2>
              <p>A typical straight-stair fitting, start to finish.</p>
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
                Home is more than an address — it's decades of memories in every room.
                The right equipment simply keeps those rooms easy to reach, so moving
                out never has to be the first option considered.
              </p>
              <ul className="stairlift-checklist">
                <li><CheckCircle2 size={22} aria-hidden="true" /> Keep your own bedroom, bathroom and routines</li>
                <li><CheckCircle2 size={22} aria-hidden="true" /> Welcome family upstairs and down, just as always</li>
                <li><CheckCircle2 size={22} aria-hidden="true" /> A fraction of the upheaval — and cost — of moving house</li>
              </ul>
              <QuoteButton />
            </div>
            <div className="stairlift-split-media">
              <img
                src={IMG.wide}
                alt="A senior couple relaxing together at home in a bright, comfortable living room"
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
            <h2>Ready when you are — no rush, no pressure.</h2>
            <p>
              Book a free consultation online, or call and chat with a real person
              about what would suit your home.
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
            <strong>Independent provider listing. Not medical advice.</strong>
            <span>
              StairLift Solutions connects homeowners with local mobility-equipment
              fitters. Availability, products and timelines vary by area and home layout.
            </span>
            <span>© 2026 StairLift Solutions. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
