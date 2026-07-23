"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Calculator,
  ChevronDown,
  FileText,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Users,
  X,
  Zap,
} from "lucide-react";

const phoneDisplay = "(888) 123-4567";
const phoneHref = "tel:18881234567";

const steps = [
  {
    title: "Step 1",
    label: "Enter your ZIP code",
    text: "Start by entering your ZIP to surface personalized quotes from carriers in your area.",
    icon: MapPin,
  },
  {
    title: "Step 2",
    label: "Compare custom rates",
    text: "View real carrier rates side-by-side so you know exactly what you're choosing.",
    icon: Calculator,
  },
  {
    title: "Step 3",
    label: "Choose your best plan",
    text: "Pick coverage that fits your life, not just the cheapest number on the page.",
    icon: BadgeCheck,
  },
  {
    title: "Step 4",
    label: "Start saving money",
    text: "Lock in your new policy and keep more in your pocket — up to $800 back every year.",
    icon: Zap,
  },
];

const whyCards = [
  {
    icon: Users,
    title: "Team based & focused",
    text: "Licensed agents work exclusively for your best interests, not for any single carrier.",
  },
  {
    icon: Star,
    title: "5-star customer service",
    text: "Award-winning support from first quote to annual renewal, every step of the way.",
  },
  {
    icon: FileText,
    title: "No hidden fees, ever",
    text: "The price you see is the price you pay. No processing fees, no surprises at checkout.",
  },
  {
    icon: Lock,
    title: "Secure & confidential",
    text: "256-bit SSL encryption protects every detail. Your data is never sold to third parties.",
  },
];

const reviews = [
  {
    name: "Sarah Miller",
    state: "Austin, TX",
    savings: "$960/year",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBX8Rod-WJUFvDB0P9--NvBORsSM9AZBPWo-OfJqJY4aaitPloAtua1m5ZukeF2Mo1nW1dnqjIZV1DsilLR0kSkYzdVNSmcQpTAAakJlD05Ps-rCMKxxvy_w0wyI5feDnZSiWns-2RBBxI6ddW4PlOMWM8YjsErixooTm9j02Pd4BQC8YkpYPGoEQjMsyMKyu5uNoerDAFyZpKc4cP4JZB4CyBqBBk9TAljXL6uwOFr6UAgSEAYAEwaiMKkkZgkdnR929BW4zRQOBGv",
    text: "Saving $80 a month was the best decision I made this year. The process took me literally four minutes.",
  },
  {
    name: "Robert Garcia",
    state: "Houston, TX",
    savings: "$680/year",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbNSjk9QYLl1l8lnXuwcdXyTD2ZBzV-OSQbb_l9FfdywVCSm-vCiiMND08U_JMlvlbhGsu09hX2Kjidd4Wm4J_9xOiQN0uB8AFgEnhCcA-bSCh2W7N5WGnjFcN3OA4l61L6C3c42yzY10wzYDVVWURQ0pWnSrLccNp--pe_quTtHuLfKfuiyz8Hu-sBEsmsd1ysWQgzE_XWg6k6xuEaq42_apOLrwkx5lMl_I07LCT9zbUwqmIVltV3w4zccCogPrk-QOiHvdQTG5K",
    text: "Finally a company that gets Texas drivers. Switched from my 8-year carrier and haven't looked back.",
  },
  {
    name: "Emma Thompson",
    state: "Dallas, TX",
    savings: "$740/year",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDB68jnHLCmadyVH24SpLHVg_9Z-HZR17M8ue0QoGjEFo8GhX3phh3a2MSM8BcVpNQtR3SfKuCQtJBpi_KhYeo0jOvh5YSSd-HE15tUKOLLs_arR0NUhkWgRIRj7gIHdEt664KsX_1IGUP99NraLHjud6oKsl38yfaMqRcwVFzGj2qBeF-mLQmJveiOnRX7PDl5ztPwyjO1AB4MStsDxiUnaXd7r6YfbryIwBRxN25Pm-_TXPdaNfNUyLhNaHdvpV2lnYrgNXetdKWS",
    text: "The support team walked me through every option. Better coverage at a lower price.",
  },
];

const faqs = [
  {
    question: "How do I get a quote?",
    answer: "Most users complete the initial request in under two minutes. Enter your details and we instantly match you with top national carrier rates tailored to your state and vehicle.",
  },
  {
    question: "Is my information secure?",
    answer: "We use 256-bit SSL encryption to ensure your data is always protected and never shared with unauthorized third parties.",
  },
  {
    question: "What carriers does Anster work with?",
    answer: "We compare rates from top national carriers including Progressive, Allstate, Liberty Mutual, GEICO, Nationwide, Farmers, and more.",
  },
  {
    question: "How much can I actually save?",
    answer: "Many Texas drivers find savings of up to $800 per year by switching. Actual savings depend on your age, driving record, and current policy structure.",
  },
  {
    question: "Is there any obligation when I request a quote?",
    answer: "No, our rate comparison service is 100% free with absolutely zero obligation to purchase.",
  },
];

const vehicleTypes = ["SUV", "Sedan", "Truck", "Van", "Coupe", "Other"];
const states = ["Texas", "Florida", "California", "Arizona", "Georgia", "North Carolina", "Other"];

function estimateSavings(age, state, premium) {
  const monthlyPremium = Number(premium) || 0;
  const parsedAge = Number(age) || 35;
  const stateFactor =
    state === "Florida" ? 0.19 : state === "California" ? 0.15 : state === "Texas" ? 0.17 : 0.14;
  const ageFactor = parsedAge < 25 ? 0.1 : parsedAge > 55 ? 0.18 : 0.15;
  const highPremiumBoost = monthlyPremium > 260 ? 0.08 : monthlyPremium > 180 ? 0.04 : 0;
  const monthlySavings = Math.max(18, Math.min(95, monthlyPremium * (stateFactor + ageFactor + highPremiumBoost)));
  return Math.round(monthlySavings * 12);
}

export default function AutoInsuranceClient() {
  const [calc, setCalc] = useState({
    age: 42,
    state: "Texas",
    premium: 218,
  });
  const [lead, setLead] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    zip: "",
    vehicleType: "SUV",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [showExit, setShowExit] = useState(false);
  const [exitDismissed, setExitDismissed] = useState(false);

  const savings = useMemo(
    () => estimateSavings(calc.age, calc.state, calc.premium),
    [calc.age, calc.state, calc.premium]
  );

  useEffect(() => {
    const handleMouseLeave = (event) => {
      if (event.clientY <= 12 && !exitDismissed) {
        setShowExit(true);
      }
    };

    const timer = window.setTimeout(() => {
      if (!exitDismissed) setShowExit(true);
    }, 38000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [exitDismissed]);

  const updateLead = (key, value) => {
    setLead((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const dismissExit = () => {
    setShowExit(false);
    setExitDismissed(true);
  };

  return (
    <div className="auto-insurance-page lp">

      {/* NAV */}
      <nav className="nav">
        <div className="logo">
          <div className="logo-icon">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="logo-text">ANSTER</span>
        </div>
        <div className="nav-links">
          <a href="#how-it-works">How it Works</a>
          <a href="#savings">Savings</a>
          <a href="#faq">FAQ</a>
          <a href="#quote-form" className="nav-cta">Get Free Quote</a>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero-section-wrapper" id="top">
        <div className="hero">
          <div className="hero-left">
            <div className="hero-badge">
              <ShieldCheck className="text-[#3B82F6]" size={12} />
              Licensed auto insurance comparison
            </div>
            <h1>Texas Drivers Save Up To <span className="accent">$800</span><br />Per <span className="accent2">Year</span></h1>
            <p className="hero-sub">ANSTER compares top national carriers in minutes. Know you&apos;re getting the best rate — not just a decent one.</p>
            <div className="hero-actions">
              <a href="#savings" className="btn-primary">
                Get My Free Quote <ArrowRight size={14} />
              </a>
              <div className="btn-call">
                <span>Or Call Us</span>
                <strong>
                  <a href={phoneHref} style={{ color: "#ffffff" }}>{phoneDisplay}</a>
                </strong>
              </div>
            </div>
            <div className="trust-pills">
              <div className="trust-pill"><Zap className="text-[#F59E0B]" size={14} /> Compare in minutes</div>
              <div className="trust-pill"><Award className="text-[#F59E0B]" size={14} /> A-Rated carriers</div>
              <div className="trust-pill"><Lock className="text-[#F59E0B]" size={14} /> 256-bit encrypted</div>
              <div className="trust-pill"><MapPin className="text-[#F59E0B]" size={14} /> Texas expertise</div>
            </div>
          </div>
        </div>
        <div className="trust-bar-integrated">
          <ShieldCheck className="text-[#1A56DB]" size={15} />
          <span>Comparing rates from:</span>
          <span>Progressive</span><span className="trust-sep">·</span>
          <span>Allstate</span><span className="trust-sep">·</span>
          <span>Liberty Mutual</span><span className="trust-sep">·</span>
          <span>GEICO</span><span className="trust-sep">·</span>
          <span>Nationwide</span><span className="trust-sep">·</span>
          <span>Farmers</span>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="py-16 bg-gradient-to-b from-white to-[#F8FAFC]" id="how-it-works">
        <div className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="section-eyebrow">Simple process</div>
          <div className="section-title">How it works</div>
          <div className="steps-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="step-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                    <div className="step-icon-wrapper">
                      <Icon size={22} />
                    </div>
                    <span className="step-num">{step.title}</span>
                  </div>
                  <div className="step-title">{step.label}</div>
                  <div className="step-text">{step.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SAVINGS CALCULATOR */}
      <div className="calc-section" id="savings">
        <div className="calc-inner">
          <div className="section-eyebrow" style={{ marginBottom: "6px" }}>Personalized estimate</div>
          <div className="section-title">How much could you save?</div>
          <div className="calc-card">
            <div className="calc-left" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="slider-group">
                <div className="slider-label">
                  <span>Current monthly premium</span>
                  <span>${calc.premium}/mo</span>
                </div>
                <div className="slider-container">
                  <div className="slider-bar">
                    <div className="slider-fill" style={{ width: `${((calc.premium - 50) / 850) * 100}%` }}></div>
                    <div className="slider-thumb" style={{ left: `calc(${((calc.premium - 50) / 850) * 100}% - 11px)` }}></div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="900"
                    value={calc.premium}
                    onChange={(e) => setCalc((curr) => ({ ...curr, premium: parseInt(e.target.value) }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    style={{ zIndex: 10 }}
                  />
                </div>
                <div className="slider-bounds">
                  <span>$50</span>
                  <span>$900</span>
                </div>
              </div>

              <div className="slider-group slider-group-blue">
                <div className="slider-label">
                  <span>Driver age</span>
                  <span>{calc.age} years</span>
                </div>
                <div className="slider-container">
                  <div className="slider-bar">
                    <div className="slider-fill" style={{ width: `${((calc.age - 16) / 74) * 100}%` }}></div>
                    <div className="slider-thumb" style={{ left: `calc(${((calc.age - 16) / 74) * 100}% - 11px)` }}></div>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="90"
                    value={calc.age}
                    onChange={(e) => setCalc((curr) => ({ ...curr, age: parseInt(e.target.value) }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    style={{ zIndex: 10 }}
                  />
                </div>
                <div className="slider-bounds">
                  <span>16 yrs</span>
                  <span>90 yrs</span>
                </div>
              </div>

              <div className="state-group">
                <div className="state-select-label">Your state</div>
                <select
                  className="state-select"
                  value={calc.state}
                  onChange={(e) => setCalc((curr) => ({ ...curr, state: e.target.value }))}
                >
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="calc-right">
              <div className="calc-lbl">Estimated annual savings</div>
              <div className="calc-num">${savings.toLocaleString()}</div>
              <div className="calc-sub">
                <span className="calc-sub-badge">≈ ${Math.round(savings / 12)} saved each month</span>
              </div>
              <div className="calc-divider"></div>
              <div className="calc-note">Based on state, age & current premium.<br />Actual savings vary by driver profile.</div>
              <a href="#quote-form" className="btn-calc">Claim My Savings <ArrowRight size={14} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* WHY ANSTER */}
      <div style={{ padding: "64px 0", background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)", borderTop: "1px solid #E2E8F0" }}>
        <div className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="section-eyebrow">Our promise</div>
          <div className="section-title">Why choose Anster?</div>
          <div className="why-grid">
            {whyCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="why-card">
                  <div className="why-icon-wrapper">
                    <Icon size={22} />
                  </div>
                  <div className="why-card-content">
                    <div className="why-title">{card.title}</div>
                    <div className="why-text">{card.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="testimonials-section" id="reviews">
        <div className="testimonials-inner">
          <div className="section-eyebrow" style={{ textAlign: "left", marginBottom: "6px" }}>Our story</div>
          <div className="testimonials-trust">
            <div>
              <div style={{ fontSize: "24px", fontWeight: "850", color: "#0F172A", letterSpacing: 0, marginBottom: "10px" }}>Built for Texas drivers</div>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.7, marginBottom: "14px" }}>ANSTER has spent decades building carrier relationships that translate into real savings. We don&apos;t take commissions from insurers — our only job is to find you the best rate.</p>
              <div className="trust-stats">
                <div className="stat-card"><div className="stat-num">40+</div><div className="stat-lbl">Years in Texas</div></div>
                <div className="stat-card"><div className="stat-num">6+</div><div className="stat-lbl">Carriers compared</div></div>
                <div className="stat-card"><div className="stat-num">$800</div><div className="stat-lbl">Max annual savings</div></div>
              </div>
              <div className="ceo">
                <div className="ceo-avatar">D</div>
                <div><div className="ceo-name">David Richardson</div><div className="ceo-role">CEO, Anster Insurance</div></div>
              </div>
            </div>
            <div className="trust-img overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDsFoNmlB1gzfKzgFN8ygRY0qU2QEoKXccgz7qALrHhEjz-cH6wcvcnNKRsMfBp3l0V1y_3jOwi9ZOjYUnCLvbzoKjCCidO-uuO8L8U3skbyIckuynesS0TAgcsue_77CVy5Vtz5gtE840hp6wLnSDdNXTuUGesEjiCwSf33U0faFyvxHiiLEwtegNQQXVW0lbjoyMaVBkGJTcHLu3rz8aPzrtEFexPeSCowu-tvtg9QfG3p2Ekc-GHT5EClSrj8J1dD9AXmkl6hQq"
                alt="David Richardson family"
                className="w-full h-full object-cover"
                width={500}
                height={310}
              />
            </div>
          </div>

          <div className="section-title" style={{ textAlign: "left", fontSize: "20px", marginBottom: "16px" }}>What our customers say</div>
          <div className="reviews-grid">
            {reviews.map((review, idx) => (
              <div key={idx} className="review-card">
                <div>
                  <div className="stars">★★★★★</div>
                  <div className="review-text">&ldquo;{review.text}&rdquo;</div>
                </div>
                <div className="review-footer">
                  <div className="review-person">
                    <div className="review-avatar">
                      {review.image ? (
                        <Image
                          src={review.image}
                          alt={review.name}
                          width={38}
                          height={38}
                          className="object-cover"
                        />
                      ) : (
                        review.name.split(" ").map(n => n[0]).join("")
                      )}
                    </div>
                    <div><div className="review-name">{review.name}</div><div className="review-loc">{review.state}</div></div>
                  </div>
                  <div className="savings-badge">{review.savings}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: "#F7F9FC", borderTop: "0.5px solid #E2E8F0", padding: "48px 0" }} id="faq">
        <div className="faq-section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="section-eyebrow">Got questions?</div>
          <div className="section-title">Frequently asked questions</div>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div className="faq-item" key={index}>
                <div
                  className={`faq-q ${isOpen ? "open" : ""}`}
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                >
                  {faq.question}
                  <ChevronDown
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-[#1A56DB]" : "text-[#94A3B8]"}`}
                    size={18}
                  />
                </div>
                {isOpen && (
                  <div className="faq-a">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>



      {/* FOOTER */}
      <div className="footer">
        <div className="footer-inner">
          <div className="footer-brand footer-col">
            <div className="logo" style={{ marginBottom: 0 }}>
              <div className="logo-icon">A</div>
              <span className="logo-text">ANSTER</span>
            </div>
            <p>Leading auto insurance comparison for Texas, Florida, and California drivers since 1984.</p>
          </div>
          <div className="footer-col">
            <h5>Quick links</h5>
            <ul>
              <li><a href="#top">About us</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#quote-form">Careers</a></li>
              <li><a href="#top">Blog</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><a href="#quote-form">Privacy policy</a></li>
              <li><a href="#quote-form">Terms of service</a></li>
              <li><a href="#quote-form">Cookies policy</a></li>
              <li><a href="#quote-form">Security</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <ul>
              <li><a href="#quote-form">123 Houston St, Suite 400<br />Dallas, TX 75201</a></li>
              <li><a href={phoneHref}>{phoneDisplay}</a></li>
              <li><a href="mailto:support@anster.com">support@anster.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">© 2026 ANSTER Insurance Agency. All Rights Reserved. Licensed in TX, FL & CA.</div>
      </div>

      {/* MOBILE BAR (sticky call to action) */}
      <div className="mob-bar">
        <a href={phoneHref} className="mob-call"><Phone size={14} /> Call now</a>
        <a href="#quote-form" className="mob-quote">Get free quote <ArrowRight size={14} /></a>
      </div>

      {/* BEGIN: Exit Popup */}
      {showExit && (
        <div className="exit-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="exit-title">
          <div className="exit-dialog">
            <button
              className="exit-close"
              type="button"
              onClick={dismissExit}
              aria-label="Close popup"
            >
              <X size={14} />
            </button>
            <span className="exit-badge">
              Before you go
            </span>
            <h2 id="exit-title">
              Still paying last year&apos;s rate?
            </h2>
            <p>
              Compare today&apos;s options before your next renewal. The request takes less than 2 minutes.
            </p>
            <div className="exit-actions">
              <a
                className="exit-btn-cta"
                href="#quote-form"
                onClick={dismissExit}
              >
                Check My Savings
              </a>
              <button
                type="button"
                className="exit-btn-cancel"
                onClick={dismissExit}
              >
                No thanks, I prefer to pay more
              </button>
            </div>
          </div>
        </div>
      )}
      {/* END: Exit Popup */}
    </div>
  );
}
