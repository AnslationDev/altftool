import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import HnHeader from "./_components/HnHeader";
import HnFooter from "./_components/HnFooter";
import HnReveal from "./_components/HnReveal";
import HnIcon from "./_components/HnIcon";
import HnImage from "./_components/HnImage";
import HnHeadline from "./_components/HnHeadline";
import HnTabs from "./_components/HnTabs";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import { VERTICALS } from "./_data/verticals";
import { HN_BASE, HN_BRAND, HN_TAGLINE } from "./_data/site";

export const metadata = {
  title: "HousingNeeds",
  description:
    "Home improvement services explained — roofing, siding, gutters, windows, solar, plumbing and interiors.",
  alternates: { canonical: HN_BASE },
  openGraph: {
    title: `${HN_BRAND} | AltFTool`,
    description:
      "Home improvement services explained — roofing, siding, gutters, windows, solar, plumbing and interiors.",
    url: HN_BASE,
    type: "website",
  },
};

export default async function HousingNeedsHub({ searchParams }) {
  const params = await searchParams;
  const initialCategory =
    typeof params?.category === "string" ? params.category : undefined;

  return (
    <div className="hn-app hn-shell" data-accent="teal">
      {/* The hub IS a navigation page, so here the nav lists the verticals. */}
      <HnHeader
        navItems={VERTICALS.map((vertical) => ({
          href: `${HN_BASE}/${vertical.slug}`,
          label: vertical.name,
        }))}
      />

      <main>
        <section className="hn-hero">
          <div className="hn-hero-bg">
            <HnImage
              src="https://images.unsplash.com/photo-1570129477492-45c003edd2be"
              alt=""
              sizes="100vw"
              priority
            />
          </div>
          <span className="hn-hero-scrim" aria-hidden="true" />
          <span className="hn-hero-tint" aria-hidden="true" />

          <div className="hn-hero-inner">
            <p className="hn-hero-eyebrow">{HN_BRAND}</p>

            <h1>
              <HnHeadline
                text="Home improvement work, explained properly"
                accent="explained properly"
              />
            </h1>

            <p className="hn-hero-sub">{HN_TAGLINE}</p>

            <ul className="hn-hero-points">
              {["Seven trades covered", "Options compared honestly", "What drives the cost"].map(
                (point) => (
                  <li key={point}>
                    <Home size={15} strokeWidth={2.4} />
                    {point}
                  </li>
                ),
              )}
            </ul>

            <div className="hn-hero-actions">
              <a className="hn-btn hn-btn--primary hn-btn--lg" href="#services">
                Browse services
              </a>
            </div>
          </div>

          <span className="hn-hero-scroll" aria-hidden="true">
            <span />
          </span>
        </section>

        <section className="hn-section" id="services">
          <div className="hn-wrap">
            <div className="hn-grid hn-grid--3" style={{ marginTop: 0 }}>
              {VERTICALS.map((vertical, index) => {
                return (
                  <HnReveal key={vertical.slug} delay={index * 55}>
                    <Link
                      href={`${HN_BASE}/${vertical.slug}`}
                      className="hn-hub-card hn-hub-card--media"
                      data-accent={vertical.accent}
                      aria-label={`${vertical.name} — ${vertical.eyebrow}`}
                    >
                      <HnImage
                        src={vertical.images?.hero?.src}
                        /* Decorative: the card's own heading and copy already
                           name the vertical, so alt text here would just be
                           repeated by screen readers. */
                        alt=""
                        ratio="landscape"
                        sizes="(max-width: 700px) 100vw, 33vw"
                        /* First row sits above the fold — eager-load it so the
                           LCP candidate isn't gated behind lazy-load. */
                        priority={index < 3}
                        className="hn-hub-thumb"
                      >
                        <span className="hn-img-badge" aria-hidden="true">
                          <HnIcon name={vertical.icon} size={20} strokeWidth={2} />
                        </span>
                      </HnImage>

                      <h2>{vertical.name}</h2>
                      <p>{vertical.subheadline}</p>

                      <span className="hn-hub-more">
                        Explore {vertical.name.toLowerCase()}
                        <ArrowRight size={15} strokeWidth={2.3} className="hn-hub-arrow" />
                      </span>
                    </Link>
                  </HnReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="hn-section hn-section--tint" id="service-experiences">
          <div className="hn-wrap">
            <div className="hn-head--center">
              <span className="hn-eyebrow">Focused service experiences</span>
              <h2 className="hn-h2">Explore every home-service route</h2>
              <p className="hn-lede">
                Switch categories to open specialist guides and service experiences
                without losing your place in the HousingNeeds directory.
              </p>
            </div>
            <div className="mt-10">
              <HnTabs initialCategory={initialCategory} />
            </div>
          </div>
        </section>
      </main>

      <HnFooter />
      <AltfLauncher />
    </div>
  );
}
