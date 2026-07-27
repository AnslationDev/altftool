import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileText,
  Landmark,
  Layers,
  PhoneCall,
  Scale,
  ShieldCheck,
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
  title: "Home Improvement Guides: Roofing, HVAC, Plumbing & More",
  description:
    "AltFTool's home improvement library: in-depth guides to roofing, plumbing, HVAC, electrical and more — what each job involves, and what drives the cost.",
  path: "/bops/housingneeds",
  keywords: [
    "home improvement guides",
    "home maintenance guide",
    "roofing guide",
    "plumbing guide",
    "HVAC guide",
  ],
  pageType: "business-ops-guide",
});

const QUOTE = { mode: "cta", label: "Get a Free Quote", href: "#quote" };

// What a reader actually does here. The earlier version promised matching with
// licensed, insured professionals in their area; HousingNeeds runs no such
// network, so the steps now describe reading a guide and taking it to a real
// local pro.
const STEPS = [
  {
    icon: Scale,
    title: "Find the job you are planning",
    text: "Pick your project — roofing to restoration — and read what the work involves, start to finish, before you call anyone.",
  },
  {
    icon: BadgeCheck,
    title: "Learn what moves the price",
    text: "Every guide lists the variables that explain most of the gap between two estimates, so a quote reads as information rather than a number.",
  },
  {
    icon: PhoneCall,
    title: "Take the questions to a local pro",
    text: "Bring the guide's questions to a licensed professional near you, and confirm permit and code requirements with your building department.",
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
            heading="Get the free home maintenance calendar"
            subtext="Leave your email and we will send AltFTool's 12-month home maintenance calendar, plus new HousingNeeds guides as they are published."
          >
            <p className="hn-hero-eyebrow">America&rsquo;s home improvement HQ</p>

            <h1>
              <HnHeadline
                text="Every home project, done right — without overpaying"
                accent="without overpaying"
              />
            </h1>

            {/* Answer-first: the paragraph directly under the h1 says what this
                page is, in full, without needing anything else on the page. */}
            <p className="hn-hero-sub">
              HousingNeeds is AltFTool&rsquo;s home improvement library —{" "}
              {stats.categories} in-depth guides covering roofing, plumbing, HVAC,
              electrical and the rest, each explaining what the work involves, how
              the common options compare, and which variables actually move a quote.
              It publishes information only: AltFTool is not a contractor and quotes
              no prices.
            </p>

            <ul className="hn-hero-points">
              <li>
                <Layers size={15} strokeWidth={2.4} />
                {stats.categories} in-depth service guides
              </li>
              <li>
                <ShieldCheck size={15} strokeWidth={2.4} />
                Independent — not a contractor
              </li>
              <li>
                <FileText size={15} strokeWidth={2.4} />
                Free to read, no account
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

            {/* Ordered list: these steps only mean anything in sequence. */}
            <ol className="hn-steps" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {STEPS.map((step, index) => (
                <HnReveal as="li" key={step.title} className="hn-step" delay={index * 80}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </HnReveal>
              ))}
            </ol>
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
                  {/* Previously opened with an invented statistic about what the
                      average homeowner spends. Removed — the calendar is a real
                      enough reason on its own. */}
                  <p className="hn-lede" style={{ margin: "0.75rem 0 0" }}>
                    Most of what goes wrong in a house runs on a schedule —
                    gutters before the autumn rain, the furnace before winter,
                    seals and filters on their own cycle. Our free maintenance
                    calendar lists what to check, and when.
                  </p>
                </div>
                <HnEmailCapture source="hub-benefits" announce={false} />
              </HnReveal>
            </div>
          </section>
        </HnSubscribedGate>

        {/* ---------- what this is ----------
            Replaces two sections that could not be backed: a testimonial strip
            with invented quotes, names and star ratings, and a "every pro,
            vetted before they reach you" band claiming license and insurance
            verification, reputation screening and real homeowner reviews.
            HousingNeeds has no pro network, so all of it was fiction. What is
            left is the part a reader can check. */}
        <section className="hn-section hn-section--tint" id="about">
          <div className="hn-wrap">
            <HnReveal className="hn-head--center">
              <p className="hn-eyebrow">Before you start</p>
              <h2 className="hn-h2">What HousingNeeds is, and what it is not</h2>
              <p className="hn-lede">
                Knowing the limits of a source is part of using it well — so here
                they are, stated plainly.
              </p>
            </HnReveal>

            <div className="hn-vetting">
              {[
                {
                  icon: ClipboardCheck,
                  title: "Guides, written to be read end to end",
                  text: `${stats.categories} services, one long-form guide each: the jobs involved, how the main options compare on typical service life, the usual order of work, and the cost factors.`,
                },
                {
                  icon: ShieldCheck,
                  title: "Not a contractor, not a network",
                  text: "AltFTool does not perform, quote, or supervise any of the work described, and does not maintain a roster of vetted local pros.",
                },
                {
                  icon: FileText,
                  title: "Cost factors, not price tags",
                  text: "The guides name the variables that move an estimate rather than a dollar figure, because size, access, and local labor make national averages misleading.",
                },
                {
                  icon: Landmark,
                  title: "Verify locally before you commit",
                  text: "Code, permit and inspection requirements come from your building department; condition and scope come from a licensed professional who has seen the house.",
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
              <h2>Know the job before you call a contractor.</h2>
              <p>
                Pick the service you are planning and we will carry it through to
                the contact form. HousingNeeds publishes guides — it does not
                perform, quote, or supervise the work described on these pages.
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
