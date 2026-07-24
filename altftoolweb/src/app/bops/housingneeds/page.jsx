import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Clock,
  MapPin,
  PhoneCall,
  Scale,
  ShieldCheck,
  Star,
} from "lucide-react";
import HnHeader from "./_components/HnHeader";
import HnTrustBar from "./_components/HnTrustBar";
import HnFooter from "./_components/HnFooter";
import HnReveal from "./_components/HnReveal";
import HnImage from "./_components/HnImage";
import HnHeadline from "./_components/HnHeadline";
import HnEmailCapture from "./_components/HnEmailCapture";
import HnHeroOffer from "./_components/HnHeroOffer";
import HnSubscribedGate from "./_components/HnSubscribedGate";
import HnQuoteButton from "./_components/HnQuoteButton";
import HnQuoteForm from "./_components/HnQuoteForm";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import Link from "next/link";
import { ICONS } from "./_components/HnCard";
import { HN_CATEGORIES, getHnStats } from "./_data/categories";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import "./housingneeds.css";
import "@/app/_altf/altf-brand.css";

// The Housing Needs front door — a standalone, USA-focused lead-gen lander.
// Indexable: this is the brand's landing page, not an internal dashboard.
export const metadata = createPageMetadata({
  title: "Housing Needs — Free Home Improvement Quotes & Expert Guides",
  description:
    "America's one-stop home improvement resource. Compare roofing, plumbing, HVAC, electrical and more — read expert guides and get free quotes from licensed local pros.",
  path: "/bops/housingneeds",
  keywords: [
    "home improvement guides",
    "home service quotes",
    "roofing guide",
    "plumbing guide",
    "HVAC guide",
  ],
  pageType: "business-ops-guide",
});

const QUOTE = { mode: "cta", label: "Get a Free Quote", href: "#quote" };

const STEPS = [
  {
    icon: Scale,
    title: "Tell us the job",
    text: "Pick your project — roofing to restoration — and see exactly what the work involves before you spend a dime.",
  },
  {
    icon: BadgeCheck,
    title: "Get matched with vetted pros",
    text: "We connect you with licensed, insured professionals serving your area — no cold calls, no pressure.",
  },
  {
    icon: PhoneCall,
    title: "Compare free quotes",
    text: "Side-by-side quotes in minutes, so you hire with confidence and never overpay for good work.",
  },
];

export default function HousingNeedsLanding() {
  const stats = getHnStats();
  const jsonLd = [
    createCollectionPageJsonLd({
      path: "/bops/housingneeds",
      name: "Housing Needs",
      description:
        "Home improvement guides and quote starting points across roofing, plumbing, HVAC, electrical, and related services.",
    }),
    createItemListJsonLd({
      path: "/bops/housingneeds",
      name: "Housing Needs home improvement guides",
      items: HN_CATEGORIES.map((category) => ({
        name: category.name,
        path: category.pages[0]?.href || "/bops/housingneeds",
      })),
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Business Ops", path: "/bops" },
      { name: "Housing Needs", path: "/bops/housingneeds" },
    ]),
  ];

  return (
    <div className="hn-app hn-shell" data-accent="teal">
      <JsonLd id="housing-needs-hub-schema" data={jsonLd} />
      <HnHeader
        quoteAction={QUOTE}
        navItems={[
          { href: "#services", label: "Services" },
          { href: "#how", label: "How it works" },
          { href: "#newsletter", label: "Free calendar" },
        ]}
      />

      <main>
        {/* ---------- hero ---------- */}
        <section className="hn-hero" style={{ minHeight: "min(84vh, 760px)" }}>
          <div className="hn-hero-bg">
            <HnImage
              src="https://images.unsplash.com/photo-1760649004090-b70cea9cce39"
              alt=""
              sizes="100vw"
              priority
            />
          </div>
          <span className="hn-hero-scrim" aria-hidden="true" />
          <span className="hn-hero-tint" aria-hidden="true" />

          <HnHeroOffer
            pageKey="hub"
            source="hero-hub"
            heading="Free quotes + your home savings kit — today"
            subtext="Enter your email to unlock free quotes from licensed pros, our 12-month maintenance calendar, and exclusive limited-time local offers."
          >
            <p className="hn-hero-eyebrow">America&rsquo;s home improvement HQ</p>

            <h1>
              <HnHeadline
                text="Every home project, done right — without overpaying"
                accent="without overpaying"
              />
            </h1>

            <p className="hn-hero-sub">
              {stats.categories} home services. Expert guides. Free quotes from
              licensed, insured pros near you. One place for everything your
              house needs — coast to coast.
            </p>

            <ul className="hn-hero-points">
              <li>
                <ShieldCheck size={15} strokeWidth={2.4} />
                Licensed &amp; insured pros
              </li>
              <li>
                <Clock size={15} strokeWidth={2.4} />
                Free quotes in minutes
              </li>
              <li>
                <MapPin size={15} strokeWidth={2.4} />
                Serving all 50 states
              </li>
            </ul>

            <div className="hn-hero-actions">
              <HnQuoteButton
                href={QUOTE.href}
                label={QUOTE.label}
                mode={QUOTE.mode}
                size="hn-btn--lg"
              />
              <a className="hn-btn hn-btn--ghost hn-btn--lg" href="#services">
                Browse {stats.categories} services
              </a>
            </div>
          </HnHeroOffer>

          <span className="hn-hero-scroll" aria-hidden="true">
            <span />
          </span>
        </section>

        {/* ---------- trust bar ---------- */}
        <HnTrustBar />

        {/* ---------- how it works ---------- */}
        <section className="hn-section" id="how">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">How it works</p>
              <h2 className="hn-h2">From &ldquo;we should fix that&rdquo; to done</h2>
              <p className="hn-lede">
                No guesswork, no pressure, no cost to you — just the information
                and connections that move your project forward.
              </p>
            </HnReveal>

            <div className="hn-steps" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {STEPS.map((step, index) => (
                <HnReveal key={step.title} className="hn-step" delay={index * 80}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </HnReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- services browser ---------- */}
        <section className="hn-section hn-section--tint" id="services">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">Explore</p>
              <h2 className="hn-h2">What does your home need?</h2>
              <p className="hn-lede">
                {stats.categories} services, one guide each — what the job
                involves, what it costs, and how to get the best quote.
              </p>
            </HnReveal>

            <div className="hn-catgrid">
              {HN_CATEGORIES.map((category, index) => {
                const guide = category.pages[0];
                const Icon = ICONS[category.icon];
                return (
                  <HnReveal key={category.slug} delay={(index % 4) * 50}>
                    <Link
                      href={guide.href}
                      className="hn-cat-card"
                      data-accent={category.accent}
                      aria-label={`${category.name} — read the guide`}
                    >
                      <span className="hn-cat-ico" aria-hidden="true">
                        {Icon ? <Icon size={22} strokeWidth={2} /> : null}
                      </span>
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                      <span className="hn-cat-go">
                        Read the guide
                        <ArrowRight size={14} strokeWidth={2.4} />
                      </span>
                    </Link>
                  </HnReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- email capture beside benefits ----------
            Hidden once the visitor has already subscribed (band or hero offer). */}
        <HnSubscribedGate>
          <section className="hn-section" id="newsletter">
            <div className="hn-wrap">
              <HnReveal className="hn-email-band">
                <div>
                  <p className="hn-eyebrow">Free homeowner resource</p>
                  <h2>Own a home? Get ahead of it.</h2>
                  <p className="hn-lede" style={{ margin: "0.75rem 0 0" }}>
                    The average homeowner spends thousands on repairs they could
                    have prevented. Our free maintenance calendar tells you exactly
                    what to check, and when — so small problems never become big
                    bills. Grab it in seconds.
                  </p>
                </div>
                <HnEmailCapture source="hub-benefits" announce={false} />
              </HnReveal>
            </div>
          </section>
        </HnSubscribedGate>

        {/* ---------- social proof ---------- */}
        <section className="hn-section hn-section--tint">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">Homeowners like you</p>
              <h2 className="hn-h2">Why homeowners start here</h2>
            </HnReveal>

            <div className="hn-testimonials">
              {[
                {
                  quote:
                    "Read the roofing guide, knew what a fair price looked like, and saved real money on the quote we accepted.",
                  who: "Jennifer M. — North Carolina",
                },
                {
                  quote:
                    "Three plumbing quotes by the next morning. Picked the middle one and couldn't be happier.",
                  who: "David S. — Arizona",
                },
                {
                  quote:
                    "The maintenance calendar alone is worth it — it reminded us to service the furnace before winter.",
                  who: "Angela P. — Michigan",
                },
              ].map((t, index) => (
                <HnReveal key={t.who} className="hn-testimonial" delay={index * 60}>
                  <span className="hn-testimonial-stars" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={13} strokeWidth={0} fill="currentColor" />
                    ))}
                  </span>
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <footer>{t.who}</footer>
                </HnReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- vetting / trust ---------- */}
        <section className="hn-section">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">Peace of mind</p>
              <h2 className="hn-h2">Every pro, vetted before they reach you</h2>
              <p className="hn-lede">
                We do the background work so you don&rsquo;t have to — the pros
                you compare have already cleared the checks that matter.
              </p>
            </HnReveal>

            <div className="hn-vetting">
              {[
                {
                  icon: ClipboardCheck,
                  title: "License & insurance verified",
                  text: "We confirm every pro carries a valid license and insurance before they ever reach you.",
                },
                {
                  icon: ShieldCheck,
                  title: "Reputation-screened",
                  text: "Only established local pros with a solid track record make it into our network.",
                },
                {
                  icon: Star,
                  title: "Real homeowner reviews",
                  text: "Ratings come from real customers — so you hire with your eyes wide open.",
                },
                {
                  icon: BadgeCheck,
                  title: "Free & no pressure",
                  text: "Comparing quotes costs nothing, and you’re never obligated to hire anyone.",
                },
              ].map((v, index) => {
                const Icon = v.icon;
                return (
                  <HnReveal key={v.title} className="hn-vet-card" delay={index * 60}>
                    <span className="hn-vet-ico" aria-hidden="true">
                      <Icon size={24} strokeWidth={2} />
                    </span>
                    <h3>{v.title}</h3>
                    <p>{v.text}</p>
                  </HnReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- final cta ---------- */}
        <section className="hn-section hn-section--tint" id="quote">
          <div className="hn-wrap">
            <HnReveal className="hn-cta">
              <h2>Your project won&rsquo;t fix itself. Your quote is free.</h2>
              <p>
                Pick your service, leave your email, and compare free,
                no-obligation quotes from licensed pros near you — in minutes,
                not weeks.
              </p>
              <HnQuoteForm
                source="hub-cta"
                services={HN_CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }))}
              />
            </HnReveal>
          </div>
        </section>
      </main>

      <HnFooter />
      <AltfLauncher />
    </div>
  );
}
