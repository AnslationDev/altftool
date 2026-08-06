"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Boxes,
  ClipboardCheck,
  Container,
  Home,
  Leaf,
  Package,
  Phone,
  Recycle,
  Sprout,
  Truck,
} from "lucide-react";
import "./packngo.css";

const PHONE_DISPLAY = "Demo only";
const PHONE_HREF = "#demo-only";

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Survey",
    text: "A move planner walks your home — in person or on video — counts every shelf, and locks a flat quote on the spot.",
  },
  {
    icon: Package,
    title: "Pack",
    text: "Our crew wraps, boxes, and labels room by room in recycled materials. You do not touch a single thing.",
  },
  {
    icon: Truck,
    title: "Move",
    text: "Air-ride trucks, blanket-wrapped furniture, and a live arrival window you can actually plan an afternoon around.",
  },
  {
    icon: Home,
    title: "Unpack",
    text: "We place furniture, unpack to surfaces, and leave with every empty box — flattened and headed back into rotation.",
  },
];

const MATERIALS = [
  {
    icon: Recycle,
    title: "Recycled boxes",
    text: "Double-walled cartons made from 90% post-consumer fibre, each one reused up to five moves before recycling.",
  },
  {
    icon: Sprout,
    title: "Biodegradable wrap",
    text: "Cornstarch cushioning instead of bubble wrap — just as protective in transit, gone in the compost within weeks.",
  },
  {
    icon: Container,
    title: "Reusable crates",
    text: "Hard-shell crates for kitchens, books, and glassware that go straight back into circulation, never to landfill.",
  },
];

const PLANS = [
  { name: "Studio", load: "Up to ~25 boxes", price: "$480" },
  { name: "2BHK", load: "Up to ~60 boxes", price: "$840" },
  { name: "Villa", load: "Up to ~120 boxes", price: "$1,450" },
];

function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const els = root.querySelectorAll(".packngo-reveal");
    if (!("IntersectionObserver" in window)) return undefined;
    root.classList.add("packngo-ready");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("packngo-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

function TimelineStep({ step, index }) {
  const Icon = step.icon;
  return (
    <li className="packngo-step packngo-reveal">
      <span className="packngo-step-dot" aria-hidden="true" />
      <span className="packngo-step-num" aria-hidden="true">
        0{index + 1}
      </span>
      <Icon className="packngo-step-icon" size={22} strokeWidth={1.5} aria-hidden="true" />
      <h3 className="packngo-h3">{step.title}</h3>
      <p className="packngo-body">{step.text}</p>
    </li>
  );
}

function MaterialCard({ item }) {
  const Icon = item.icon;
  return (
    <div className="packngo-material packngo-reveal">
      <span className="packngo-material-icon">
        <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h3 className="packngo-h3">{item.title}</h3>
      <p className="packngo-body">{item.text}</p>
    </div>
  );
}

function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form
      className="packngo-form packngo-reveal"
      aria-label="Request a callback"
      onSubmit={handleSubmit}
    >
      <div className="packngo-field">
        <label htmlFor="packngo-input-name">Name</label>
        <input
          id="packngo-input-name"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="off"
        />
      </div>
      <div className="packngo-field">
        <label htmlFor="packngo-input-phone">Phone</label>
        <input
          id="packngo-input-phone"
          name="phone"
          type="tel"
          placeholder="Demo only"
          autoComplete="off"
        />
      </div>
      <div className="packngo-field">
        <label htmlFor="packngo-input-size">Home size</label>
        <select id="packngo-input-size" name="size" defaultValue="2bhk">
          <option value="studio">Studio</option>
          <option value="2bhk">2BHK</option>
          <option value="villa">Villa</option>
        </select>
      </div>
      <button
        type="submit"
        className="packngo-btn packngo-btn-solid packngo-form-submit"
        disabled={submitted}
      >
        {submitted ? "Request sent" : "Request a callback"}
      </button>
      {submitted ? (
        <p className="packngo-form-note" role="status">
          Thanks! This is a demo form, so nothing was actually sent — call{" "}
          {PHONE_DISPLAY} for a real callback.
        </p>
      ) : (
        <p className="packngo-form-note">Demo form — nothing is sent anywhere.</p>
      )}
    </form>
  );
}

export default function PackNGoPage() {
  const rootRef = useRef(null);
  const [boxes, setBoxes] = useState(34);
  useReveal(rootRef);

  const MIN_BOXES = 8;
  const MAX_BOXES = 120;
  const fill = Math.round(((boxes - MIN_BOXES) / (MAX_BOXES - MIN_BOXES)) * 100);
  const sizeHint =
    boxes <= 25 ? "about a studio" : boxes <= 60 ? "about a 2BHK" : "villa territory";

  return (
    <div className="packngo-page" ref={rootRef}>
      <a href="#packngo-main" className="packngo-skip">
        Skip to content
      </a>

      <header className="packngo-nav">
        <div className="packngo-nav-inner">
          <a href="#packngo-main" className="packngo-wordmark">
            <Package size={18} strokeWidth={1.5} aria-hidden="true" />
            Pack<span className="packngo-wordmark-n">N</span>Go
          </a>
          <nav className="packngo-nav-links" aria-label="Primary">
            <a className="packngo-link" href="#packngo-process">
              Process
            </a>
            <a className="packngo-link" href="#packngo-pricing">
              Pricing
            </a>
            <a className="packngo-btn packngo-btn-outline" href="#quote">
              Get a quote
            </a>
          </nav>
        </div>
      </header>

      <main id="packngo-main">
        <section className="packngo-hero" aria-label="Introduction">
          <p className="packngo-eyebrow packngo-hero-item">Full-service packing &amp; moving</p>
          <h1 className="packngo-hero-title packngo-hero-item">
            You point. <em>We pack.</em>
          </h1>
          <p className="packngo-hero-sub packngo-hero-item">
            PackNGo surveys your home, packs every shelf in eco materials, moves it with
            care, and unpacks at the other end. You never lift a box.
          </p>
          <div className="packngo-estimate packngo-hero-item">
            <div className="packngo-estimate-top">
              <label className="packngo-estimate-label" htmlFor="packngo-box-slider">
                <Boxes size={16} strokeWidth={1.5} aria-hidden="true" />
                Slide to size your move
              </label>
              <output className="packngo-estimate-value" htmlFor="packngo-box-slider">
                ~{boxes} boxes
              </output>
            </div>
            <input
              id="packngo-box-slider"
              className="packngo-range"
              type="range"
              min={MIN_BOXES}
              max={MAX_BOXES}
              value={boxes}
              onChange={(event) => setBoxes(Number(event.target.value))}
              style={{ "--packngo-fill": `${fill}%` }}
              aria-describedby="packngo-estimate-hint"
            />
            <p id="packngo-estimate-hint" className="packngo-estimate-hint">
              That&rsquo;s {sizeHint}. A free survey confirms the exact count.
            </p>
          </div>
          <div className="packngo-hero-actions packngo-hero-item">
            <a className="packngo-btn packngo-btn-solid" href="#quote">
              Get a flat quote
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </a>
            <a className="packngo-link packngo-link-quiet" href="#packngo-process">
              See how it works
            </a>
          </div>
        </section>

        <section
          id="packngo-process"
          className="packngo-section"
          aria-labelledby="packngo-process-title"
        >
          <div className="packngo-section-head packngo-reveal">
            <p className="packngo-eyebrow">The process</p>
            <h2 id="packngo-process-title" className="packngo-h2">
              From shelves to settled
            </h2>
          </div>
          <ol className="packngo-timeline">
            {STEPS.map((step, index) => (
              <TimelineStep key={step.title} step={step} index={index} />
            ))}
          </ol>
        </section>

        <section className="packngo-section" aria-labelledby="packngo-materials-title">
          <div className="packngo-section-head packngo-reveal">
            <p className="packngo-eyebrow">
              <Leaf size={14} strokeWidth={1.5} aria-hidden="true" />
              Materials
            </p>
            <h2 id="packngo-materials-title" className="packngo-h2">
              Packed lighter on the planet
            </h2>
          </div>
          <div className="packngo-materials">
            {MATERIALS.map((item) => (
              <MaterialCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section
          id="packngo-pricing"
          className="packngo-section"
          aria-labelledby="packngo-pricing-title"
        >
          <div className="packngo-section-head packngo-reveal">
            <p className="packngo-eyebrow">Pricing</p>
            <h2 id="packngo-pricing-title" className="packngo-h2">
              One flat number
            </h2>
          </div>
          <div className="packngo-reveal">
            <table className="packngo-table">
              <caption className="packngo-sr-only">
                Flat moving prices by home size
              </caption>
              <thead>
                <tr>
                  <th scope="col">Home</th>
                  <th scope="col" className="packngo-load-col">
                    Typical load
                  </th>
                  <th scope="col" className="packngo-price-col">
                    Flat price
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLANS.map((plan) => (
                  <tr key={plan.name}>
                    <th scope="row">{plan.name}</th>
                    <td className="packngo-plan-load">{plan.load}</td>
                    <td className="packngo-plan-price">{plan.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="packngo-fineprint">
              Flat means flat — survey, materials, packing, transport, and unpacking
              included. No fuel, stair, or weekend surcharges.
            </p>
          </div>
        </section>

        <section className="packngo-quote-block" aria-label="Customer testimonial">
          <blockquote className="packngo-pullquote packngo-reveal">
            <p>
              They arrived at nine and by dusk our bookshelves were alphabetised in
              another city. I kept waiting for the catch. There wasn&rsquo;t one.
            </p>
            <footer className="packngo-pullquote-cite">
              — Dana W., moved a 2BHK, 400 miles
            </footer>
          </blockquote>
        </section>

        <section id="quote" className="packngo-cta" aria-labelledby="packngo-cta-title">
          <div className="packngo-cta-inner">
            <div className="packngo-cta-copy packngo-reveal">
              <p className="packngo-eyebrow">Get started</p>
              <h2 id="packngo-cta-title" className="packngo-h2">
                Point us at your shelves.
              </h2>
              <p className="packngo-body">
                Tell us a little about your move and a planner calls back within the
                hour — or skip the form and talk to a person right now.
              </p>
              <a className="packngo-phone" href={PHONE_HREF}>
                <Phone size={18} strokeWidth={1.5} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
              <p className="packngo-phone-caption">Mon–Sat, 8am–8pm. Real humans only.</p>
            </div>
            <QuoteForm />
          </div>
        </section>
      </main>

      <footer className="packngo-footer">
        <div className="packngo-footer-inner">
          <p className="packngo-footer-mark">
            Pack<span className="packngo-wordmark-n">N</span>Go
          </p>
          <nav className="packngo-footer-links" aria-label="Footer">
            <a className="packngo-link" href="#packngo-process">
              Process
            </a>
            <a className="packngo-link" href="#packngo-pricing">
              Pricing
            </a>
            <a className="packngo-link" href={PHONE_HREF}>
              {PHONE_DISPLAY}
            </a>
          </nav>
          <p className="packngo-footer-note">
            © 2026 PackNGo. A fictional brand shown in the AltFTool Housing Needs
            directory.
          </p>
        </div>
      </footer>
    </div>
  );
}
