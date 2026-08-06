"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Feather,
  FileSignature,
  HeartPulse,
  Landmark,
  Phone,
  Scale,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import "./legacywills.css";

const QUOTE_URL = "#demo-only";
const PHONE_HREF = "#demo-only";
const PHONE_LABEL = "Demo only";

const IMG = {
  hero: "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?auto=format&fit=crop&w=1600&q=80",
  study: "https://images.unsplash.com/photo-1666018215790-867b14fe4822?auto=format&fit=crop&w=1600&q=80",
  family: "https://images.unsplash.com/photo-1564846824194-346b7871b855?auto=format&fit=crop&w=900&q=80",
  desk: "https://images.unsplash.com/photo-1611619899256-5e61d4c46df9?auto=format&fit=crop&w=900&q=80",
  counsel: "https://images.unsplash.com/photo-1682343195427-526edae3cdbc?auto=format&fit=crop&w=900&q=80",
};

const DOCUMENTS = [
  {
    icon: ScrollText,
    title: "Last Will & Testament",
    copy: "The cornerstone document. It records who inherits, who administers, and who cares for those who depend on you.",
    points: ["Name your executor", "Direct who inherits what", "Appoint guardians for minor children"],
  },
  {
    icon: Landmark,
    title: "Revocable Living Trust",
    copy: "For many families, a trust keeps the estate out of probate court and keeps private matters private.",
    points: ["Help assets pass outside probate", "Plan for incapacity in advance", "Keep family affairs confidential"],
  },
  {
    icon: FileSignature,
    title: "Power of Attorney",
    copy: "If you cannot act for yourself, this decides who manages your finances — you choose, not a court.",
    points: ["Choose who manages your finances", "Set limits on that authority", "Avoid court-appointed control"],
  },
  {
    icon: HeartPulse,
    title: "Healthcare Directive",
    copy: "Your medical wishes, written down while you are well — so loved ones never have to guess.",
    points: ["Record your treatment wishes", "Name a trusted healthcare agent", "Give doctors clear instructions"],
  },
];

const CHAPTERS = [
  {
    img: IMG.family,
    alt: "A multigenerational family gathered together at home",
    title: "Young families",
    copy: "Guardianship for children, life insurance directed sensibly, and a will that grows as your family does.",
  },
  {
    img: IMG.desk,
    alt: "A tidy desk with estate documents, a ledger and reading glasses",
    title: "Homeowners & savers",
    copy: "Homes, retirement accounts and savings, organised into a plan that passes cleanly and quietly.",
  },
  {
    img: IMG.counsel,
    alt: "An attorney speaking calmly with an older couple across a desk",
    title: "Retirees & elders",
    copy: "Updated documents, powers of attorney and healthcare directives, reviewed with unhurried care.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Free case review",
    copy: "A short, unhurried conversation about your family, your assets and your wishes. No obligation, no jargon.",
  },
  {
    num: "02",
    title: "Drafting & review",
    copy: "A licensed attorney prepares your documents, then walks you through every clause in plain English.",
  },
  {
    num: "03",
    title: "Signing & safekeeping",
    copy: "Properly witnessed, notarised where required, and stored so the right people can find them when it matters.",
  },
];

const FAQS = [
  {
    q: "Do I really need a will if my estate is modest?",
    a: "Yes. Without a will, state law decides who inherits and a court decides who administers — regardless of the size of the estate. A will also names guardians for minor children, which no bank balance can do.",
  },
  {
    q: "What is the difference between a will and a living trust?",
    a: "A will takes effect at death and usually passes through probate. A revocable living trust can hold assets during your lifetime, help them pass outside probate, and provide for management if you become incapacitated. Many plans use both.",
  },
  {
    q: "How much does an estate plan cost?",
    a: "Fees are flat and agreed in writing before any drafting begins, based on the documents your situation calls for. Your free case review includes a clear, no-obligation quote — there are no hourly surprises.",
  },
  {
    q: "Can I update my documents later?",
    a: "Yes. Wills and trusts are living documents. Marriages, births, moves and new assets are all good reasons to revisit them, and amendments are typically far simpler than starting over.",
  },
  {
    q: "What happens on the free case review call?",
    a: "An estate planning professional listens to your situation, explains which documents apply and why, and sets out the flat fee. You decide, in your own time, whether to proceed.",
  },
];

export default function LegacyWillsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const quoteBtn = (extra = "") => (
    <a
      href={QUOTE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`legacywills-btn legacywills-btn--primary ${extra}`.trim()}
    >
      Free Case Review <ArrowRight size={18} aria-hidden="true" />
    </a>
  );

  return (
    <div className="legacywills-page" id="top">
      <header className={`legacywills-nav ${scrolled ? "legacywills-nav--scrolled" : ""}`.trim()}>
        <div className="legacywills-wrap legacywills-nav-inner">
          <a href="#top" className="legacywills-brand" aria-label="LegacyWills home">
            <span className="legacywills-brand-seal" aria-hidden="true">LW</span>
            <span className="legacywills-brand-name">LegacyWills</span>
          </a>
          <nav className="legacywills-nav-links" aria-label="Primary">
            <a href="#documents">Documents</a>
            <a href="#chapters">Who we help</a>
            <a href="#process">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="legacywills-nav-cta">
            <a href={PHONE_HREF} className="legacywills-phone-link">
              <Phone size={18} aria-hidden="true" />
              <span>{PHONE_LABEL}</span>
            </a>
            {quoteBtn()}
          </div>
        </div>
      </header>

      <main>
        <section className="legacywills-hero" aria-label="Introduction">
          <div className="legacywills-wrap legacywills-hero-inner">
            <div className="legacywills-hero-copy">
              <p className="legacywills-eyebrow">Wills · Trusts · Powers of Attorney</p>
              <h1>Your wishes, set down properly. Your family, spared the guesswork.</h1>
              <p className="legacywills-hero-lede">
                LegacyWills connects you with licensed estate planning attorneys who draft wills,
                trusts and powers of attorney with the care a family document deserves — in plain
                English, at a flat, agreed fee.
              </p>
              <div className="legacywills-hero-actions">
                {quoteBtn()}
                <a href={PHONE_HREF} className="legacywills-hero-phone">
                  <Phone size={22} aria-hidden="true" />
                  <span>
                    <small>Or speak with someone now</small>
                    <strong>{PHONE_LABEL}</strong>
                  </span>
                </a>
              </div>
              <ul className="legacywills-hero-points">
                <li><Check size={16} aria-hidden="true" /><span>Flat, agreed fees — approved before drafting begins</span></li>
                <li><Check size={16} aria-hidden="true" /><span>Every clause reviewed with a licensed attorney</span></li>
                <li><Check size={16} aria-hidden="true" /><span>Properly witnessed, executed and stored</span></li>
              </ul>
            </div>
            <div className="legacywills-hero-media">
              <figure className="legacywills-hero-frame">
                <div className="legacywills-figure">
                  <img
                    src={IMG.hero}
                    alt="Hands signing a last will and testament with a fountain pen"
                  />
                </div>
              </figure>
              <div className="legacywills-seal" aria-hidden="true">
                <span className="legacywills-seal-mono">LW</span>
                <span className="legacywills-seal-text">Sealed &amp; Witnessed</span>
              </div>
            </div>
          </div>
        </section>

        <section className="legacywills-strip" aria-label="Why families choose LegacyWills">
          <div className="legacywills-wrap legacywills-strip-inner">
            <div className="legacywills-strip-item">
              <Scale size={26} aria-hidden="true" />
              <div>
                <h3>Licensed estate attorneys</h3>
                <p>Every plan is prepared and reviewed by a licensed attorney — never a fill-in-the-blank template.</p>
              </div>
            </div>
            <div className="legacywills-strip-item">
              <Feather size={26} aria-hidden="true" />
              <div>
                <h3>Flat, agreed fees</h3>
                <p>You approve the fee in writing before drafting begins. No hourly billing, no surprises.</p>
              </div>
            </div>
            <div className="legacywills-strip-item">
              <ShieldCheck size={26} aria-hidden="true" />
              <div>
                <h3>Properly executed</h3>
                <p>Witnessed, notarised where required, and stored so your documents hold up when they are needed.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="documents" className="legacywills-docs">
          <div className="legacywills-wrap">
            <div className="legacywills-sec-head">
              <p className="legacywills-eyebrow">The estate plan checklist</p>
              <h2>Four documents. One complete plan.</h2>
              <p>Most families need all four. Your free case review confirms exactly which apply to you.</p>
            </div>
            <div className="legacywills-doc-grid">
              {DOCUMENTS.map(({ icon: Icon, title, copy, points }) => (
                <article className="legacywills-doc-card" key={title}>
                  <div className="legacywills-doc-icon">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <ul className="legacywills-doc-points">
                    {points.map((point) => (
                      <li key={point}>
                        <Check size={15} aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="legacywills-band" aria-label="Speak with an estate planner">
          <div className="legacywills-wrap legacywills-band-inner">
            <div>
              <h2>Questions are free. So is the first conversation.</h2>
              <p>
                Call and talk it through with an estate planning professional — no obligation,
                no pressure, and no documents drafted until you say so.
              </p>
            </div>
            <div className="legacywills-band-cta">
              <a href={PHONE_HREF} className="legacywills-band-phone">
                <Phone size={28} aria-hidden="true" />
                {PHONE_LABEL}
              </a>
              <a
                href={QUOTE_URL}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="legacywills-btn legacywills-btn--cream"
              >
                Free Case Review <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section id="chapters" className="legacywills-chapters">
          <div className="legacywills-wrap">
            <div className="legacywills-sec-head">
              <p className="legacywills-eyebrow">Who we help</p>
              <h2>Planning for every chapter of life</h2>
              <p>Whatever stage you are at, the right documents bring the same quiet reassurance.</p>
            </div>
            <div className="legacywills-chapter-grid">
              {CHAPTERS.map(({ img, alt, title, copy }) => (
                <article className="legacywills-chapter-card" key={title}>
                  <figure className="legacywills-chapter-figure">
                    <img src={img} alt={alt} loading="lazy" />
                  </figure>
                  <div className="legacywills-chapter-body">
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="legacywills-split">
          <div className="legacywills-wrap legacywills-split-inner">
            <figure className="legacywills-split-media">
              <div className="legacywills-figure">
                <img
                  src={IMG.study}
                  alt="A quiet law office study lined with bound legal volumes"
                  loading="lazy"
                />
              </div>
            </figure>
            <div className="legacywills-split-copy">
              <p className="legacywills-eyebrow">How it works</p>
              <h2>Three quiet steps to a finished plan</h2>
              <ol className="legacywills-steps">
                {STEPS.map(({ num, title, copy }) => (
                  <li key={num}>
                    <span className="legacywills-step-num" aria-hidden="true">{num}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="legacywills-split-actions">
                {quoteBtn()}
                <a href={PHONE_HREF} className="legacywills-phone-link">
                  <Phone size={18} aria-hidden="true" />
                  <span>{PHONE_LABEL}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="legacywills-faq">
          <div className="legacywills-wrap">
            <div className="legacywills-sec-head">
              <p className="legacywills-eyebrow">Common questions</p>
              <h2>Asked quietly, answered plainly</h2>
            </div>
            <div className="legacywills-faq-list">
              {FAQS.map((faq, i) => (
                <div
                  className={`legacywills-faq-item ${openFaq === i ? "legacywills-faq-item--open" : ""}`.trim()}
                  key={faq.q}
                >
                  <h3 className="legacywills-faq-q">
                    <button
                      type="button"
                      aria-expanded={openFaq === i}
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={18} aria-hidden="true" />
                    </button>
                  </h3>
                  {openFaq === i && <p className="legacywills-faq-a">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="legacywills-band legacywills-band--final" aria-label="Get started">
          <div className="legacywills-wrap">
            <h2>Put it in writing — properly.</h2>
            <p>
              A finished estate plan is one conversation away. Start with a free case review,
              or simply pick up the phone.
            </p>
            <div className="legacywills-band-cta">
              <a href={PHONE_HREF} className="legacywills-band-phone">
                <Phone size={30} aria-hidden="true" />
                {PHONE_LABEL}
              </a>
              {quoteBtn()}
              <p className="legacywills-band-note">Free case review · Flat, agreed fees · No obligation</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="legacywills-footer">
        <div className="legacywills-wrap">
          <div className="legacywills-footer-grid">
            <div className="legacywills-footer-brand">
              <a href="#top" className="legacywills-brand" aria-label="Back to top">
                <span className="legacywills-brand-seal" aria-hidden="true">LW</span>
                <span className="legacywills-brand-name">LegacyWills</span>
              </a>
              <p>
                Wills, trusts and powers of attorney, drafted properly and explained plainly —
                so your wishes are honoured and your family is spared the guesswork.
              </p>
            </div>
            <div className="legacywills-footer-contact">
              <a href={PHONE_HREF} className="legacywills-phone-link">
                <Phone size={20} aria-hidden="true" />
                <span>{PHONE_LABEL}</span>
              </a>
              {quoteBtn()}
            </div>
          </div>
          <div className="legacywills-footer-legal">
            <p>Independent provider listing. Not legal advice. Prior results do not guarantee similar outcomes.</p>
            <p>© 2026 LegacyWills · An AltFTool Legal Services listing. LegacyWills is a service brand name.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
