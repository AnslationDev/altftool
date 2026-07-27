"use client";

import { useState } from "react";
import {
  Moon,
  Mail,
  ArrowRight,
  Video,
  Radar,
  Siren,
  ShieldCheck,
  Clock3,
  Eye,
  BatteryCharging,
  ChevronDown,
  Crosshair,
  CheckCircle2,
} from "lucide-react";
import "./nightwatch-security.css";

// No quote partner and no phone line are live for this page, so every
// conversion CTA points at the site's real contact route.
const CONTACT_URL = "/policypages/contact";
const CONTACT_LABEL = "Contact us";

const IMG = {
  city: "https://images.unsplash.com/photo-1496368077930-c1e31b4e5b44",
  camera: "https://images.unsplash.com/photo-1585206031650-9e9a7c87dcfe",
  cctv: "https://images.unsplash.com/photo-1557597774-9d273605dfa9",
  panel: "https://images.unsplash.com/photo-1563920443079-783e5c786b83",
  skyline: "https://images.unsplash.com/photo-1481597262637-0545b18186ea",
};
const wide = (u) => `${u}?auto=format&fit=crop&w=1600&q=80`;
const cardImg = (u) => `${u}?auto=format&fit=crop&w=900&q=80`;

const SERVICES = [
  {
    icon: Video,
    title: "Night-Vision Camera Installs",
    text: "Infrared and low-light cameras positioned for dark approaches — driveways, side gates and rear entries — with local or cloud recording options.",
  },
  {
    icon: Radar,
    title: "Overnight Monitoring Window",
    text: "A dedicated 22:00–06:00 active watch window, when most residential break-in attempts occur. Alerts are reviewed by people, not just algorithms.",
  },
  {
    icon: Siren,
    title: "Overnight Response Coordination",
    text: "Verified alerts are escalated to local patrol partners and, where appropriate, emergency services. Response availability varies by service area.",
  },
  {
    icon: Eye,
    title: "Perimeter & Motion Zones",
    text: "Custom detection zones tuned to your property so a raccoon at 3 a.m. doesn't wake you, but a person at the gate does.",
  },
  {
    icon: BatteryCharging,
    title: "Power & Signal Backup",
    text: "Battery backup and cellular failover options so a cut line or outage doesn't take your overnight coverage down with it.",
  },
  {
    icon: ShieldCheck,
    title: "Daytime Coverage, Too",
    text: "Overnight is our specialty, not our limit — 24/7 monitoring plans are available if you want the watch to never clock out.",
  },
];

const STEPS = [
  {
    title: "Free Night Assessment",
    text: "We walk your property at your convenience, map dark zones and approach paths, and give you a written, no-obligation quote.",
  },
  {
    title: "Install & Calibration",
    text: "Most installs finish in a single visit. We aim and calibrate every camera after dark, because that's when it has to perform.",
  },
  {
    title: "The Watch Begins",
    text: "Your overnight window goes live. You get a clear escalation plan, app access and a direct line to the monitoring desk.",
  },
];

const FAQS = [
  {
    q: "What exactly happens during the 22:00-06:00 watch window?",
    a: "During the overnight window, motion and perimeter alerts from your system are prioritized for human review. If an alert is verified as a genuine concern, we follow the escalation plan you approved — typically a call to you first, then patrol partners or emergency services where appropriate.",
  },
  {
    q: "Do you guarantee a response time?",
    a: "No — and you should be wary of anyone who does. Response depends on your location, patrol partner availability and local emergency services. During your free assessment we'll tell you honestly what coverage looks like in your area.",
  },
  {
    q: "Can I keep my existing cameras?",
    a: "Often, yes. If your current hardware supports low-light capture and standard integrations, we can usually fold it into the monitored setup and only add what's missing.",
  },
  {
    q: "Is there a long-term contract?",
    a: "Plans are available month-to-month or annual. Equipment can be purchased outright or bundled. Your quote will show both paths with no pressure toward either.",
  },
];

const TICKER_ITEMS = [
  "Watching 22:00 – 06:00",
  "Night-vision calibrated after dark",
  "Human-reviewed overnight alerts",
  "Free on-site night assessment",
  "Battery + cellular backup options",
];

function Reticle() {
  return (
    <>
      <span className="nightwatch-corner nightwatch-corner--tl" aria-hidden="true" />
      <span className="nightwatch-corner nightwatch-corner--tr" aria-hidden="true" />
      <span className="nightwatch-corner nightwatch-corner--bl" aria-hidden="true" />
      <span className="nightwatch-corner nightwatch-corner--br" aria-hidden="true" />
    </>
  );
}

function QuoteButton({ ghost = false, children = "Get a Free Quote" }) {
  return (
    <a
      className={`nightwatch-btn ${ghost ? "nightwatch-btn--ghost" : "nightwatch-btn--solid"}`}
      href={CONTACT_URL}
    >
      {children} <ArrowRight size={16} aria-hidden="true" />
    </a>
  );
}

export default function NightWatchSecurityPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="nightwatch-page">
      <header className="nightwatch-header">
        <div className="nightwatch-wrap nightwatch-nav">
          <a className="nightwatch-brand" href="#nightwatch-top">
            <span className="nightwatch-brand-mark" aria-hidden="true">
              <Crosshair size={20} />
            </span>
            Night<em>Watch</em> Security
          </a>
          <nav className="nightwatch-nav-links" aria-label="Page sections">
            <a href="#nightwatch-services">Services</a>
            <a href="#nightwatch-process">How It Works</a>
            <a href="#nightwatch-coverage">Coverage</a>
            <a href="#nightwatch-faq">FAQ</a>
          </nav>
          <div className="nightwatch-nav-cta">
            <a className="nightwatch-nav-phone" href={CONTACT_URL}>
              <Mail size={15} aria-hidden="true" />
              <span>{CONTACT_LABEL}</span>
            </a>
            <QuoteButton />
          </div>
        </div>
      </header>

      <main id="nightwatch-top">
        <section className="nightwatch-hero">
          <div className="nightwatch-wrap nightwatch-hero-grid">
            <div>
              <p className="nightwatch-kicker">
                <Moon size={13} aria-hidden="true" /> Overnight monitoring specialists
              </p>
              <h1>
                Your home&apos;s quietest hours are our <span>loudest shift.</span>
              </h1>
              <p className="nightwatch-hero-copy">
                NightWatch installs night-vision cameras and staffs a dedicated overnight
                watch window — 22:00 to 06:00 — so the hours when most break-ins happen
                are the hours someone is actually paying attention. Honest quotes,
                no scare tactics.
              </p>
              <div className="nightwatch-hero-actions">
                <QuoteButton />
                <a className="nightwatch-btn nightwatch-btn--ghost" href={CONTACT_URL}>
                  <Mail size={16} aria-hidden="true" /> {CONTACT_LABEL}
                </a>
              </div>
              <div className="nightwatch-hero-chips">
                <span className="nightwatch-chip">
                  <Clock3 size={14} aria-hidden="true" /> 22:00–06:00 active watch
                </span>
                <span className="nightwatch-chip">
                  <Video size={14} aria-hidden="true" /> Infrared low-light cameras
                </span>
                <span className="nightwatch-chip">
                  <ShieldCheck size={14} aria-hidden="true" /> Licensed &amp; insured
                </span>
              </div>
            </div>
            <div className="nightwatch-frame nightwatch-frame--hero nightwatch-reticle">
              <Reticle />
              <span className="nightwatch-hud">
                <i aria-hidden="true" /> REC · NIGHT MODE
              </span>
              <img
                src={wide(IMG.city)}
                alt="Quiet residential street after dark, lit by scattered streetlights"
              />
            </div>
          </div>
        </section>

        <div className="nightwatch-ticker" aria-label="NightWatch status ticker">
          <div className="nightwatch-ticker-track">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                style={{ display: "flex", gap: "3.2rem" }}
                aria-hidden={copy === 1 ? "true" : undefined}
              >
                {TICKER_ITEMS.map((item) => (
                  <span key={item}>
                    <Crosshair size={12} aria-hidden="true" /> {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="nightwatch-section" id="nightwatch-services">
          <div className="nightwatch-wrap">
            <p className="nightwatch-eyebrow">What we do</p>
            <h2>Built for the dark hours</h2>
            <p className="nightwatch-section-lede">
              Every service below is scoped during a free assessment — you&apos;ll know
              exactly what&apos;s included, what it costs and what it can and can&apos;t do
              before you commit to anything.
            </p>
            <div className="nightwatch-cards">
              {SERVICES.map(({ icon: Icon, title, text }) => (
                <article className="nightwatch-card nightwatch-reticle" key={title}>
                  <Reticle />
                  <span className="nightwatch-card-icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="nightwatch-section nightwatch-section--alt" id="nightwatch-process">
          <div className="nightwatch-wrap">
            <p className="nightwatch-eyebrow">How it works</p>
            <h2>Three steps to a watched night</h2>
            <p className="nightwatch-section-lede">
              From first call to live monitoring, most homes are covered within a week
              — timelines confirmed in your written quote.
            </p>
            <div className="nightwatch-steps">
              {STEPS.map(({ title, text }) => (
                <article className="nightwatch-step" key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="nightwatch-band">
          <div className="nightwatch-wrap">
            <h2>Find out what the night shift costs</h2>
            <p>
              A quote takes minutes and commits you to nothing. Prefer to talk it
              through? The line is answered by installers, not a sales script.
            </p>
            <div className="nightwatch-band-actions">
              <QuoteButton />
              <a className="nightwatch-btn nightwatch-btn--ghost" href={CONTACT_URL}>
                <Mail size={16} aria-hidden="true" /> {CONTACT_LABEL}
              </a>
            </div>
          </div>
        </section>

        <section className="nightwatch-section" id="nightwatch-coverage">
          <div className="nightwatch-wrap nightwatch-split">
            <div className="nightwatch-frame nightwatch-frame--wide nightwatch-reticle">
              <Reticle />
              <span className="nightwatch-hud">
                <i aria-hidden="true" /> SECTOR 04 · CLEAR
              </span>
              <img
                src={wide(IMG.skyline)}
                alt="City skyline glowing under a dark evening sky"
                loading="lazy"
              />
            </div>
            <div>
              <p className="nightwatch-eyebrow">Coverage</p>
              <h2>What the watch window includes</h2>
              <ul className="nightwatch-checklist">
                <li>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  Human review of overnight alerts between 22:00 and 06:00 — daytime
                  alerts still reach your phone instantly.
                </li>
                <li>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  An escalation plan you approve in writing: who gets called, in what
                  order, under what conditions.
                </li>
                <li>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  Coordination with local patrol partners where available — we&apos;ll
                  confirm availability for your address before you sign.
                </li>
                <li>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  A monthly summary of overnight events, false-alarm tuning and any
                  recommended camera adjustments.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="nightwatch-section nightwatch-section--alt">
          <div className="nightwatch-wrap">
            <p className="nightwatch-eyebrow">Field views</p>
            <h2>The hardware, in its element</h2>
            <div className="nightwatch-gallery">
              <figure>
                <div className="nightwatch-frame nightwatch-frame--card nightwatch-reticle">
                  <Reticle />
                  <img
                    src={cardImg(IMG.camera)}
                    alt="Wall-mounted security camera watching over an entry point"
                    loading="lazy"
                  />
                </div>
                <figcaption>Entry-point cameras aimed and tested after dark</figcaption>
              </figure>
              <figure>
                <div className="nightwatch-frame nightwatch-frame--card nightwatch-reticle">
                  <Reticle />
                  <img
                    src={cardImg(IMG.cctv)}
                    alt="Outdoor surveillance camera mounted high on a building corner"
                    loading="lazy"
                  />
                </div>
                <figcaption>Perimeter coverage with tuned motion zones</figcaption>
              </figure>
              <figure>
                <div className="nightwatch-frame nightwatch-frame--card nightwatch-reticle">
                  <Reticle />
                  <img
                    src={cardImg(IMG.panel)}
                    alt="Home security keypad panel mounted beside a doorway"
                    loading="lazy"
                  />
                </div>
                <figcaption>Simple in-home control with backup power</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="nightwatch-section" id="nightwatch-faq">
          <div className="nightwatch-wrap">
            <p className="nightwatch-eyebrow">Straight answers</p>
            <h2>Questions we hear at 2 a.m.</h2>
            <div className="nightwatch-faq">
              {FAQS.map(({ q, a }, i) => {
                const open = openFaq === i;
                return (
                  <div
                    className={`nightwatch-faq-item${open ? " nightwatch-faq-item--open" : ""}`}
                    key={q}
                  >
                    <button
                      type="button"
                      className="nightwatch-faq-q"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : i)}
                    >
                      {q}
                      <ChevronDown size={18} aria-hidden="true" />
                    </button>
                    {open && <p className="nightwatch-faq-a">{a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="nightwatch-band">
          <div className="nightwatch-wrap">
            <h2>Sleep. We&apos;ve got the graveyard shift.</h2>
            <p>
              Get a written quote for night-vision cameras and overnight monitoring —
              free, fast and pressure-free.
            </p>
            <div className="nightwatch-band-actions">
              <QuoteButton>Get a Free Quote</QuoteButton>
              <a className="nightwatch-btn nightwatch-btn--ghost" href={CONTACT_URL}>
                <Mail size={16} aria-hidden="true" /> {CONTACT_LABEL}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="nightwatch-footer">
        <div className="nightwatch-wrap nightwatch-footer-row">
          <div>
            <a className="nightwatch-brand" href="#nightwatch-top">
              <span className="nightwatch-brand-mark" aria-hidden="true">
                <Crosshair size={18} />
              </span>
              Night<em>Watch</em> Security
            </a>
            <p>Night-vision installs and overnight monitoring. Watching 22:00–06:00.</p>
          </div>
          <div>
            <p>
              <a className="nightwatch-nav-phone" href={CONTACT_URL}>
                <Mail size={14} aria-hidden="true" /> {CONTACT_LABEL}
              </a>
            </p>
            <p className="nightwatch-footer-note">Independent service provider listing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
