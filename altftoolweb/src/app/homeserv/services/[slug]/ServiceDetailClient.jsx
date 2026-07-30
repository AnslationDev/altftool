"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Accessibility,
  AirVent,
  ArrowRight,
  Archive,
  Bath,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  CircuitBoard,
  Clock3,
  DoorOpen,
  Droplets,
  DollarSign,
  Fan,
  Flame,
  Gauge,
  Hammer,
  Home,
  LayoutGrid,
  Lightbulb,
  LoaderCircle,
  MapPin,
  Paintbrush,
  PanelTop,
  PackageCheck,
  PhoneCall,
  Plug,
  ShieldCheck,
  ShowerHead,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Star,
  ThermometerSun,
  TrendingUp,
  Warehouse,
  Wind,
  Wrench,
  X,
} from "lucide-react";
import Footer from "@/platform/navigation/Footer";
import { SiteHeader } from "../../components/SiteHeader";
import { services } from "../../services-data";

const iconMap = {
  hammer: Hammer,
  bath: Bath,
  snowflake: Snowflake,
  wrench: Wrench,
};

const insightIcons = [DollarSign, Home, Clock3, Sparkles];

const titleIconMap = {
  "Boost Value": TrendingUp,
  "Custom Layout": LayoutGrid,
  "More Storage": Boxes,
  "Vetted Pros": BadgeCheck,
  "Waterproof First": Droplets,
  "Better Storage": Archive,
  "Fixture Refresh": Sparkles,
  "Cleaner Install": ShieldCheck,
  "Fast Diagnostics": Gauge,
  "Right-Sized Systems": SlidersHorizontal,
  "Cleaner Airflow": Wind,
  "Maintenance Help": ShieldCheck,
  "One Clear Start": PackageCheck,
  "Less Phone Tag": Clock3,
  "Bundled Fixes": Boxes,
  "Practical Scope": Wrench,
  "Full Remodel": Hammer,
  "Cabinets & Storage": Archive,
  Countertops: PanelTop,
  "Flooring & Tile": LayoutGrid,
  "Lighting Plan": Lightbulb,
  "Island Upgrades": Warehouse,
  "Walk-In Shower": ShowerHead,
  "Vanity & Storage": Bath,
  "Tile & Flooring": LayoutGrid,
  Accessibility,
  "Tub Replacement": Bath,
  Ventilation: Fan,
  "AC Repair": Snowflake,
  "Furnace Service": Flame,
  "Heat Pumps": ThermometerSun,
  Ductwork: AirVent,
  Thermostats: CircuitBoard,
  "Seasonal Tune-Up": Gauge,
  "Drywall & Paint": Paintbrush,
  "Plumbing Fixes": Droplets,
  "Roof & Exterior": Home,
  "Door & Trim": DoorOpen,
  "Fixture Installs": Plug,
  "Punch Lists": PackageCheck,
};

const zipLocations = {
  "00501": "Holtsville, NY",
  "10001": "New York, NY",
  "30301": "Atlanta, GA",
  "33101": "Miami, FL",
  "60601": "Chicago, IL",
  "75201": "Dallas, TX",
  "77002": "Houston, TX",
  "85001": "Phoenix, AZ",
  "90001": "Los Angeles, CA",
  "98101": "Seattle, WA",
};

function getTitleIcon(title) {
  return titleIconMap[title] ?? CheckCircle2;
}

function isValidUsZip(zip) {
  return /^\d{5}$/.test(zip);
}

function isLikelyRealUsZip(zip) {
  if (!isValidUsZip(zip)) return false;

  const value = Number(zip);
  const prefix = Number(zip.slice(0, 3));
  const validPrefixRanges = [
    [5, 5],
    [6, 9],
    [10, 99],
    [100, 149],
    [150, 199],
    [200, 246],
    [247, 268],
    [270, 299],
    [300, 399],
    [400, 427],
    [430, 499],
    [500, 528],
    [530, 567],
    [570, 588],
    [590, 599],
    [600, 693],
    [700, 729],
    [730, 799],
    [800, 865],
    [870, 884],
    [889, 898],
    [900, 961],
    [967, 969],
    [970, 994],
    [995, 999],
  ];

  return value >= 501 && value <= 99950 && validPrefixRanges.some(([start, end]) => prefix >= start && prefix <= end);
}

function getFallbackLocation(zip) {
  if (zipLocations[zip]) return zipLocations[zip];
  const first = zip[0];
  if (first === "0" || first === "1") return "your Northeast area";
  if (first === "2" || first === "3") return "your Southeast area";
  if (first === "4" || first === "5") return "your Midwest area";
  if (first === "6" || first === "7") return "your South Central area";
  if (first === "8" || first === "9") return "your Western area";
  return "your area";
}

async function getRealZipLocation(zip) {
  if (!isLikelyRealUsZip(zip)) return null;
  if (zipLocations[zip]) return zipLocations[zip];

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      cache: "no-store",
    });

    if (response.status === 404) return null;
    if (!response.ok) return getFallbackLocation(zip);

    const data = await response.json();
    const place = data.places?.[0];

    if (!place?.["place name"] || !place?.["state abbreviation"]) {
      return getFallbackLocation(zip);
    }

    return `${place["place name"]}, ${place["state abbreviation"]}`;
  } catch {
    return getFallbackLocation(zip);
  }
}

export function ServiceDetailClient({ service }) {
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState("");
  const [isCheckingZip, setIsCheckingZip] = useState(false);
  const [flowState, setFlowState] = useState("form");
  const [matchedLocation, setMatchedLocation] = useState("");
  const [callModalPro, setCallModalPro] = useState("");

  const ServiceIcon = iconMap[service.icon];
  const heroStepIcons = [LayoutGrid, SlidersHorizontal, MapPin, CheckCircle2];
  const otherServices = services.filter((item) => item.slug !== service.slug).slice(0, 2);
  const savingsRows = [...service.savingsRows, ...service.savingsRows];

  async function handleZipSubmit(event) {
    event.preventDefault();
    const normalizedZip = zip.trim();

    if (!isLikelyRealUsZip(normalizedZip)) {
      setZipError("Please enter a valid 5-digit US ZIP code.");
      setFlowState("form");
      return;
    }

    setIsCheckingZip(true);
    const realLocation = await getRealZipLocation(normalizedZip);
    setIsCheckingZip(false);

    if (!realLocation) {
      setZipError("Please enter a real US ZIP code.");
      setFlowState("form");
      return;
    }

    setZipError("");
    setMatchedLocation(realLocation);
    setFlowState("loading");
    window.setTimeout(() => {
      setFlowState("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1300);
  }

  if (flowState === "loading") {
    return (
      <main className="hs-detail-page hs-match-page">
        <SiteHeader />
        <section className="hs-match-loader" aria-live="polite" aria-busy="true">
          <LoaderCircle size={58} />
          <h1>
            Finding {service.shortTitle} pros in {matchedLocation}...
          </h1>
        </section>
        <Footer />
      </main>
    );
  }

  if (flowState === "results") {
    return (
      <main className="hs-detail-page hs-match-page">
        <SiteHeader />
        <section className="hs-match-results">
          <div className="hs-heading hs-heading-center">
            <span className="hs-eyebrow">
              <ShieldCheck size={18} />
              Example listings
            </span>
            <h1>
              {service.shortTitle} pro directory — sample results
            </h1>
            <p>
              We don&rsquo;t yet have a live, location-matched partner network for {matchedLocation}. The
              listings below are example placeholders showing what a match would look like, not real
              local businesses.
            </p>
          </div>
          <div className="hs-match-grid">
            {service.resultPros.map((pro) => (
              <article className="hs-match-card" key={pro.name}>
                <h2>{pro.name}</h2>
                <div className="hs-match-stars" aria-label={`${pro.rating} star rating`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={20} fill="currentColor" />
                  ))}
                  <strong>{pro.rating}</strong>
                  <span>({pro.reviews})</span>
                </div>
                <p>
                  {pro.years} • {pro.hires}
                </p>
                <span className="hs-verified-pill">
                  <CheckCircle2 size={18} />
                  Sample listing
                </span>
                <span className="hs-local-badge">
                  {pro.badge}
                </span>
                <button type="button" onClick={() => setCallModalPro(pro.name)}>
                  Compare Free Quotes
                </button>
              </article>
            ))}
          </div>
        </section>
        {callModalPro ? (
          <div className="hs-modal-backdrop" role="presentation" onClick={() => setCallModalPro("")}>
            <div
              className="hs-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="call-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button className="hs-modal-close" type="button" aria-label="Close call details" onClick={() => setCallModalPro("")}>
                <X size={20} />
              </button>
              <span className="hs-caller-pulse" aria-hidden="true">
                <PhoneCall size={42} />
              </span>
              <span className="hs-eyebrow">Call to compare quotes</span>
              <h2 id="call-modal-title">{callModalPro}</h2>
              <a className="hs-call-number" href="tel:+18884520194">
                (888) 452-0194
              </a>
              <p className="hs-modal-disclaimer">
                Sample listing for demonstration only — not a real local business or call center.
              </p>
              <p>Speak with a quote specialist to review local availability and next steps.</p>
            </div>
          </div>
        ) : null}
        <Footer />
      </main>
    );
  }

  return (
    <main className="hs-detail-page">
      <SiteHeader />

      <section className="hs-detail-hero" id="quote-start">
        <div className="hs-detail-shell">
          <div className="hs-detail-copy">
            <Link href="/homeserv#services" className="hs-back-link">
              <ArrowRight size={16} />
              All services
            </Link>
            <span className="hs-eyebrow">
              <ShieldCheck size={18} />
              {service.category} near you
            </span>
            <h1>{service.headline}</h1>
            <p>{service.subhead}</p>

            <form
              className="hs-zip-form"
              aria-label={`Find ${service.title} pros by ZIP code`}
              onSubmit={handleZipSubmit}
              style={{ marginBottom: 12 }}
            >
              <label style={{ border: zipError ? "2px solid rgba(182, 59, 41, 0.55)" : "2px solid transparent" }}>
                <span>Zip code</span>
                <input
                  inputMode="numeric"
                  maxLength={5}
                  pattern="[0-9]{5}"
                  placeholder="Enter your ZIP"
                  aria-label="Zip code"
                  aria-invalid={zipError ? "true" : "false"}
                  aria-describedby={zipError ? "zip-error" : undefined}
                  value={zip}
                  onChange={(event) => {
                    setZip(event.target.value.replace(/\D/g, "").slice(0, 5));
                    if (zipError) setZipError("");
                  }}
                />
              </label>
              <button type="submit" disabled={isCheckingZip}>
                {isCheckingZip ? "Checking ZIP" : "Continue"}
                {isCheckingZip ? <LoaderCircle size={19} /> : <ArrowRight size={19} />}
              </button>
            </form>
            <small className="hs-zip-error" id="zip-error" aria-live="polite">
              {zipError || " "}
            </small>

            <ul className="hs-bullets">
              {service.bullets.map((bullet) => (
                <li key={bullet}>
                  <CheckCircle2 size={18} />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <aside className="hs-summary-card" aria-label={`${service.title} quote summary`}>
            <img src={service.projects[0].image} alt={`${service.title} project preview`} />
            <div className="hs-summary-overlay">
              <p className="hs-summary-label">How it works</p>
              <ol className="hs-summary-steps" aria-label={`${service.title} quote process`}>
                {service.howItWorks.map((step, index) => {
                  const StepIcon = heroStepIcons[index] ?? CheckCircle2;
                  return (
                    <li key={step}>
                      <span>
                        <StepIcon size={18} />
                      </span>
                      <div>
                        <strong>Step {index + 1}</strong>
                        <small>{step}</small>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      <section className="hs-detail-strip" aria-label={`${service.title} benefits`}>
        {service.benefits.map((benefit) => {
          const BenefitIcon = getTitleIcon(benefit.title);
          return (
            <article key={benefit.title}>
              <span>
                <BenefitIcon size={20} />
              </span>
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="hs-section" style={{ paddingTop: 64 }}>
        <div className="hs-heading hs-heading-center">
          <span className="hs-eyebrow">Project paths</span>
          <h2>Choose the kind of {service.shortTitle.toLowerCase()} help you need</h2>
        </div>
        <div className="hs-project-grid">
          {service.projects.map((project) => (
            <article key={project.title}>
              <div>
                <h3>{project.title}</h3>
                <p>{project.text}</p>
                <a href="#quote-start">
                  {project.cta}
                  <ArrowRight size={16} />
                </a>
              </div>
              <div className="hs-project-visual">
                <img src={project.image} alt={`${project.title} example for ${service.title}`} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="hs-section hs-quote-card" style={{ paddingTop: 42 }}>
        <div className="hs-heading hs-heading-center">
          <span className="hs-eyebrow">Quote coverage</span>
          <h2>Receive no-obligation quotes from local pros</h2>
          <p>Every service page uses the same flow, but the project options and guidance update dynamically.</p>
        </div>
        <div className="hs-quote-grid">
          {service.quoteTypes.map((type) => {
            const QuoteIcon = getTitleIcon(type.title);
            return (
              <article key={type.title}>
                <span>
                  <QuoteIcon size={22} />
                </span>
                <div>
                  <h3>{type.title}</h3>
                  <p>{type.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="hs-section hs-savings-section">
        <div className="hs-heading hs-heading-center">
          <span className="hs-eyebrow">Quote comparison</span>
          <h2>Real homeowner savings examples</h2>
        </div>
        <div className="hs-savings-table" role="table" aria-label={`${service.title} savings examples`}>
          <div className="hs-savings-row hs-savings-head" role="row">
            <span role="columnheader">City</span>
            <span role="columnheader">{service.shortTitle} Job</span>
            <span role="columnheader">Lowest Quote</span>
            <span role="columnheader">Highest Quote</span>
            <span role="columnheader">Saved</span>
          </div>
          <div className="hs-savings-scroll">
            <div className="hs-savings-body">
              {savingsRows.map((row, index) => (
                <div
                  className="hs-savings-row"
                  role="row"
                  key={`${row.city}-${row.job}-${index}`}
                  aria-hidden={index >= service.savingsRows.length ? true : undefined}
                >
                  <span role="cell">{row.city}</span>
                  <span role="cell">{row.job}</span>
                  <span role="cell">{row.low}</span>
                  <span role="cell">{row.high}</span>
                  <strong role="cell">{row.saved}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hs-section hs-insight-list">
        {service.insights.map((insight, index) => {
          const InsightIcon = insightIcons[index % insightIcons.length];
          return (
            <article key={insight.title}>
              <span>
                <InsightIcon size={28} />
              </span>
              <div>
                <h3>{insight.title}</h3>
                <p>{insight.text}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="hs-section hs-alternate">
        <h2>Looking for a different project?</h2>
        <div className="hs-alternate-grid">
          {otherServices.map((item) => {
            const OtherIcon = iconMap[item.icon];
            return (
              <Link href={`/homeserv/services/${item.slug}`} key={item.slug}>
                <OtherIcon size={25} />
                {item.title}
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
