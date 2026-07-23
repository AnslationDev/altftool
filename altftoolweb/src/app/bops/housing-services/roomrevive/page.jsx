"use client";

import "./roomrevive.css";
import { useState } from "react";
import { ArrowUpRight, Check, Menu, Phone, Sparkles, X } from "lucide-react";

const QUOTE_URL = "https://example.com/quote/roomrevive";
const PHONE_TEL = "tel:+18555550287";
const PHONE_DISPLAY = "(855) 555-0287";

const IMG = {
  hero: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1600&q=80",
  palette: "https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?auto=format&fit=crop&w=1600&q=80",
  texture: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1600&q=80",
  living: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=80",
  bedroom: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=900&q=80",
};

const PALETTES = [
  { name: "Sage & Cream", swatches: ["#9caf88", "#faf6ee", "#46583a"] },
  { name: "Blush & Clay", swatches: ["#e8c4b8", "#c9906f", "#6e3a27"] },
  { name: "Ink & Linen", swatches: ["#3a3f4a", "#e9e4d8", "#9caf88"] },
];

function QuoteLink({ variant = "solid", children = "Get a Free Quote" }) {
  return (
    <a
      className={`roomrevive-btn roomrevive-btn--${variant}`}
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}

export default function RoomRevivePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [palette, setPalette] = useState(0);

  return (
    <div className="roomrevive-page">
      <header className="roomrevive-nav">
        <div className="roomrevive-shell">
          <div className="roomrevive-nav-inner">
            <a className="roomrevive-wordmark" href="#roomrevive-top">
              Room<em>Revive</em>
            </a>
            <nav aria-label="Primary">
              <ul className="roomrevive-nav-links">
                <li><a href="#roomrevive-approach">Approach</a></li>
                <li><a href="#roomrevive-rooms">Rooms</a></li>
                <li><a href="#roomrevive-process">Process</a></li>
              </ul>
            </nav>
            <div className="roomrevive-nav-cta">
              <a
                className="roomrevive-nav-phone roomrevive-nav-phone--desktop"
                href={PHONE_TEL}
              >
                <Phone size={16} aria-hidden="true" />
                {PHONE_DISPLAY}
              </a>
              <QuoteLink variant="solid" />
              <button
                type="button"
                className="roomrevive-menu-toggle"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>
          {menuOpen && (
            <nav className="roomrevive-mobile-menu" aria-label="Mobile">
              <a href="#roomrevive-approach" onClick={() => setMenuOpen(false)}>Approach</a>
              <a href="#roomrevive-rooms" onClick={() => setMenuOpen(false)}>Rooms</a>
              <a href="#roomrevive-process" onClick={() => setMenuOpen(false)}>Process</a>
              <a href={PHONE_TEL}>Call {PHONE_DISPLAY}</a>
            </nav>
          )}
        </div>
      </header>

      <main id="roomrevive-top">
        <section className="roomrevive-hero">
          <div className="roomrevive-shell">
            <div className="roomrevive-hero-grid">
              <div className="roomrevive-hero-copy">
                <span className="roomrevive-label">Issue No. 12 — The Whole-Room Edit</span>
                <h1 className="roomrevive-h1">
                  Rooms that finally <em>feel</em> like you.
                </h1>
                <p className="roomrevive-lede">
                  RoomRevive plans whole-room makeovers around palette, texture,
                  and styling — then connects you with a coordinator for a free,
                  no-obligation quote. Availability and pricing vary by area and
                  project scope.
                </p>
                <div className="roomrevive-hero-actions">
                  <QuoteLink variant="solid" />
                  <a className="roomrevive-btn roomrevive-btn--ghost" href={PHONE_TEL}>
                    <Phone size={16} aria-hidden="true" />
                    {PHONE_DISPLAY}
                  </a>
                </div>
              </div>
              <div className="roomrevive-hero-art">
                <span className="roomrevive-stamp">free quotes · no obligation</span>
                <figure className="roomrevive-figure roomrevive-hero-figure">
                  <img
                    src={IMG.hero}
                    alt="Sunlit living room styled with a neutral sofa, layered textiles, and plants"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>

        <div className="roomrevive-ticker" aria-hidden="true">
          <div className="roomrevive-shell">
            <div className="roomrevive-ticker-row">
              <span>palettes</span>
              <span>textures</span>
              <span>styling</span>
              <span>lighting</span>
              <span>layout</span>
            </div>
          </div>
        </div>

        <section id="roomrevive-approach" className="roomrevive-shell">
          <div className="roomrevive-split">
            <figure className="roomrevive-figure roomrevive-split-figure">
              <img
                src={IMG.palette}
                alt="Modern living room with a green velvet sofa against a warm neutral wall"
                loading="lazy"
              />
            </figure>
            <div className="roomrevive-split-copy">
              <span className="roomrevive-label">The Method</span>
              <h2 className="roomrevive-h2">
                The palette comes <em>first</em>.
              </h2>
              <p className="roomrevive-body">
                Before a single cushion moves, your makeover starts with a color
                story — three tones that set the mood and keep every later
                choice easy. Tap a direction to see how a story is built.
              </p>
              <div className="roomrevive-chips" role="group" aria-label="Example palettes">
                {PALETTES.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    className="roomrevive-chip"
                    aria-pressed={palette === index}
                    onClick={() => setPalette(index)}
                  >
                    <span className="roomrevive-swatches" aria-hidden="true">
                      {item.swatches.map((color) => (
                        <i key={color} style={{ background: color }} />
                      ))}
                    </span>
                    {item.name}
                  </button>
                ))}
              </div>
              <p className="roomrevive-body">
                Now reading: <strong>{PALETTES[palette].name}</strong> — one
                grounding tone, one soft neutral, one accent.
              </p>
              <QuoteLink variant="ghost">Start with a Free Quote</QuoteLink>
            </div>
          </div>

          <hr className="roomrevive-rule" />

          <div className="roomrevive-split roomrevive-split--flip">
            <div className="roomrevive-split-copy">
              <span className="roomrevive-label">Layer Two</span>
              <h2 className="roomrevive-h2">
                Texture is the quiet <em>luxury</em>.
              </h2>
              <p className="roomrevive-body">
                Linen against wood, bouclé against stone. Layered texture is
                what makes a room photograph well and live even better — and it
                rarely requires replacing your big pieces.
              </p>
              <ul className="roomrevive-checks">
                {[
                  "Work with what you own first; buy only what earns its place",
                  "Textiles, rugs, and window treatments matched to the palette",
                  "Lighting layered at three heights for evening warmth",
                ].map((line) => (
                  <li key={line}>
                    <Check size={17} aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
              <QuoteLink variant="ghost">Price My Room</QuoteLink>
            </div>
            <figure className="roomrevive-figure roomrevive-split-figure">
              <img
                src={IMG.texture}
                alt="Bedroom layered with soft neutral bedding, textured throws, and warm lamplight"
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        <section className="roomrevive-pullquote">
          <blockquote>
            A makeover should not erase a room's history — it should edit it,
            the way a good magazine edits a story down to the lines that matter.
          </blockquote>
          <cite className="roomrevive-label">The RoomRevive Field Notes</cite>
        </section>

        <section className="roomrevive-band">
          <div className="roomrevive-shell">
            <div className="roomrevive-band-inner">
              <div className="roomrevive-band-copy">
                <span className="roomrevive-label">Midway Checkpoint</span>
                <h2 className="roomrevive-h2">
                  Curious what your room <em>could</em> be?
                </h2>
                <p>
                  Quotes are free and carry no obligation. A coordinator reviews
                  your room, scope, and budget range before any recommendation
                  is made.
                </p>
              </div>
              <div className="roomrevive-band-actions">
                <QuoteLink variant="blush" />
                <a className="roomrevive-band-phone" href={PHONE_TEL}>
                  <Phone size={20} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="roomrevive-rooms" className="roomrevive-rooms">
          <div className="roomrevive-shell">
            <div className="roomrevive-rooms-head">
              <div>
                <span className="roomrevive-label">In This Issue</span>
                <h2 className="roomrevive-h2">
                  Three rooms, three <em>rewrites</em>.
                </h2>
              </div>
              <QuoteLink variant="ghost">Get a Free Quote</QuoteLink>
            </div>
            <div className="roomrevive-cards">
              <article className="roomrevive-card">
                <figure className="roomrevive-figure roomrevive-card-figure">
                  <img
                    src={IMG.living}
                    alt="Bright living area with a neutral sectional and minimal styling"
                    loading="lazy"
                  />
                </figure>
                <div className="roomrevive-card-body">
                  <span className="roomrevive-label">Living Rooms</span>
                  <h3 className="roomrevive-h3">The gathering edit</h3>
                  <p className="roomrevive-body">
                    Seating rebalanced for conversation, a defined palette, and
                    styling that survives real life.
                  </p>
                </div>
              </article>
              <article className="roomrevive-card">
                <figure className="roomrevive-figure roomrevive-card-figure">
                  <img
                    src={IMG.bedroom}
                    alt="Calm bedroom with layered bedding and soft natural light"
                    loading="lazy"
                  />
                </figure>
                <div className="roomrevive-card-body">
                  <span className="roomrevive-label">Bedrooms</span>
                  <h3 className="roomrevive-h3">The rest edit</h3>
                  <p className="roomrevive-body">
                    Muted tones, blackout-friendly layers, and bedside styling
                    tuned for actual sleep.
                  </p>
                </div>
              </article>
              <article className="roomrevive-card roomrevive-card-note">
                <div>
                  <span className="roomrevive-label">Editor's Note</span>
                  <h3 className="roomrevive-h3">
                    <Sparkles size={18} aria-hidden="true" /> Every room qualifies
                  </h3>
                  <p>
                    Dining rooms, nurseries, home offices — if it has four walls
                    and a mood problem, it belongs in the quote.
                  </p>
                </div>
                <QuoteLink variant="solid">Quote My Space</QuoteLink>
              </article>
            </div>
          </div>
        </section>

        <section id="roomrevive-process" className="roomrevive-process">
          <div className="roomrevive-shell">
            <span className="roomrevive-label">How It Works</span>
            <h2 className="roomrevive-h2">
              From first call to final <em>styling</em>.
            </h2>
            <ol className="roomrevive-steps">
              {[
                ["Free quote", "Share your room and rough budget online or by phone. No obligation, no pressure — just a clear starting number."],
                ["Palette session", "A coordinator walks the space with you and locks the three-tone color story everything else will follow."],
                ["The sourcing edit", "Existing pieces are kept where they work; new textiles, lighting, and accents fill only the true gaps."],
                ["Reveal day", "Placement, layering, and final styling — typically wrapped in a single day per room, scope permitting."],
              ].map(([title, copy]) => (
                <li key={title}>
                  <h3 className="roomrevive-h3">{title}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="roomrevive-band roomrevive-band--final">
          <div className="roomrevive-shell">
            <div className="roomrevive-band-inner">
              <div className="roomrevive-band-copy">
                <span className="roomrevive-label">Last Page</span>
                <h2 className="roomrevive-h2">
                  Your room's next <em>issue</em> starts here.
                </h2>
                <p>
                  Request a free quote online or call to talk through your space.
                  Service availability, timelines, and pricing depend on your
                  location and project scope.
                </p>
              </div>
              <div className="roomrevive-band-actions">
                <QuoteLink variant="blush" />
                <a className="roomrevive-band-phone" href={PHONE_TEL}>
                  <Phone size={20} aria-hidden="true" />
                  {PHONE_DISPLAY}
                </a>
                <p className="roomrevive-band-fineprint">
                  Free quotes. No obligation. Coordinated through vetted local
                  providers where available.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="roomrevive-footer">
        <div className="roomrevive-shell">
          <hr className="roomrevive-rule" />
          <div className="roomrevive-footer-inner">
            <a className="roomrevive-wordmark" href="#roomrevive-top">
              Room<em>Revive</em>
            </a>
            <ul className="roomrevive-footer-links">
              <li><a href="#roomrevive-approach">Approach</a></li>
              <li><a href="#roomrevive-rooms">Rooms</a></li>
              <li><a href="#roomrevive-process">Process</a></li>
              <li><a href={PHONE_TEL}>{PHONE_DISPLAY}</a></li>
            </ul>
            <p className="roomrevive-footnote">
              Independent service provider listing. RoomRevive is a service
              brand shown for discovery purposes; quotes are fulfilled by
              participating providers where available.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
