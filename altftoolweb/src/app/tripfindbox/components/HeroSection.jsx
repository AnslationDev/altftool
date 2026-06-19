import Image from "next/image";
import Link from "next/link";
import {
  BadgePercent,
  CreditCard,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  Clock3,
  Mail,
  Globe2,
  HandCoins,
  Headphones,
  Luggage,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import FlightSearchBox from "./FlightSearchBox";
import CountryCodeSelect from "./CountryCodeSelect";
import FloatingCallIcon from "./FloatingCallIcon";
import MobileMenu from "./MobileMenu";
import { fetchBlogPosts } from "@/app/tripfindbox/lib/blogData";
import { fetchHomeContent, DEFAULT_HOME_CONTENT } from "@/app/tripfindbox/lib/homeContent";
import { tfbPath } from "@/app/tripfindbox/lib/tfbLink";

// Map of icon keys (stored in Firestore) to lucide-react components, so admins
// can pick an icon by name without storing React components in the database.
const ICONS = {
  BadgePercent,
  CreditCard,
  Globe2,
  HandCoins,
  Headphones,
  Luggage,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
};

function Icon({ name, ...props }) {
  const Cmp = ICONS[name] || Sparkles;
  return <Cmp {...props} />;
}

function telHref(phone) {
  return `tel:${(phone || "").replace(/[^\d+]/g, "")}`;
}

function destinationHref(city) {
  return tfbPath(`/flights-to-${city
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`);
}

function HeaderPhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M6.6 10.8c1.4 2.8 3.7 5 6.5 6.5l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.2.5 1.2 1.2v3.4c0 .7-.5 1.2-1.2 1.2C10.7 21.2 2.8 13.3 2.8 3.5c0-.7.5-1.2 1.2-1.2h3.4c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.8.6 4 .1.4 0 .9-.3 1.2l-2.3 2.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Header({ header }) {
  const navLinks = header.nav || [];
  return (
    <header className="nova-header">
      <a className="nova-brand" href="#top" aria-label="TripFindBox home">
        <Image
         src="/tripfindbox/tripfindbox_logo.png"
          alt={header.logoAlt}
          width={710}
          height={176}
          priority
        />
      </a>
      <nav className="nova-nav" aria-label="Primary navigation">
        {navLinks.map((link) => (
          <a key={link.href} href={tfbPath(link.href)}>{link.label}</a>
        ))}
      </nav>
      <a className="nova-call-cta" href={telHref(header.phone)} aria-label="Call TripFindBox for best deals">
        <span className="nova-call-icon"><HeaderPhoneIcon /></span>
        <span className="nova-call-copy">
          <strong>{header.phone}</strong>
          <small>{header.callSubtext}</small>
        </span>
      </a>
      <MobileMenu
        className="nova-menu"
        iconSize={21}
        links={navLinks.map((link) => ({ href: link.href, label: link.label }))}
      />
    </header>
  );
}

function Hero({ header, hero }) {
  const review = hero.reviewStrip || {};
  const filled = Number(review.filledStars) || 0;
  return (
    <section id="top" className="nova-hero">
      <div className="nova-glow nova-glow-one" />
      <div className="nova-glow nova-glow-two" />
      <div className="nova-orbit orbit-one"><Plane size={18} /></div>
      <div className="nova-orbit orbit-two"><Sparkles size={18} /></div>
      <Header header={header} />
      <div className="nova-hero-grid">
        <div className="nova-copy reveal-up">
          <p className="nova-eyebrow"><Sparkles size={16} /> {hero.eyebrow}</p>
          <h1>{hero.title}</h1>
          <p className="nova-lead">{hero.lead}</p>
          <div className="nova-trust">
            {(hero.trustBadges || []).map((badge, index) => (
              <span key={index}>
                <Icon name={badge.iconKey} size={17} fill={badge.iconKey === "Star" ? "currentColor" : undefined} /> {badge.label}
              </span>
            ))}
          </div>
        </div>
        <div className="nova-plane-visual reveal-up">
          <Image
            src="/tripfindbox/images/hero-plane.png"
            alt="Flying airplane"
            width={1774}
            height={887}
            priority
            sizes="(max-width: 900px) 90vw, 620px"
            quality={72}
          />
        </div>
      </div>
      <div className="nova-search-panel reveal-up">
        <FlightSearchBox compact />
      </div>
      <div className="nova-hero-review-strip" aria-label="TripFindBox customer trust rating">
        <p>Trusted by <strong>{review.trustedByCount}</strong> customers every year</p>
        <div>
          <span>{review.excellentLabel}</span>
          <span className="nova-review-stars" aria-label={`${review.reviewScore} out of 5 stars`}>
            {[0, 1, 2, 3, 4].map((index) => (
              <i key={index} className={index >= filled ? "is-muted" : undefined}>★</i>
            ))}
          </span>
          <span>({review.reviewScore}) {review.reviewCount} Reviews on</span>
          <strong className="nova-trustpilot-mark">★ Trustpilot</strong>
        </div>
      </div>
      <a className="home-mobile-callbar" href={telHref(header.phone)}>
        <span><FloatingCallIcon /></span>
        <b>{hero.mobileCallText}</b>
        <strong>{header.phone}</strong>
      </a>
    </section>
  );
}

function DestinationDiscovery({ destinations }) {
  const trendingItems = destinations.items || [];
  const carouselItems = [...trendingItems, ...trendingItems];

  return (
    <section id="discover" className="nova-section nova-discovery">
      <div className="nova-section-head" style={{ margin: "0 auto 46px", textAlign: "center" }}>
        <h2>{destinations.sectionTitle}</h2>
      </div>
      <div className="nova-destination-marquee" aria-label="Trending destination deals">
        <div className="nova-destination-track">
          {carouselItems.map(([city, price, description, image], index) => (
            <Link
              className="nova-destination-card"
              href={destinationHref(city)}
              key={`${city}-${index}`}
              aria-hidden={index >= trendingItems.length}
              tabIndex={index >= trendingItems.length ? -1 : undefined}
            >
              <Image
                src={image}
                alt={`${city} destination`}
                fill
                sizes="(max-width: 760px) 74vw, 280px"
                loading="lazy"
                quality={68}
              />
              <div>
                <strong>{city}</strong>
                <span>{price}</span>
                <p>{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutTripFindBox({ about }) {
  return (
    <section
      className="nova-section nova-about"
      style={{
        width: "min(1120px, calc(100% - 48px))",
        maxWidth: "1120px",
        marginInline: "auto",
        paddingBlock: "58px 46px",
        overflow: "visible",
      }}
    >
      <div className="nova-section-head" style={{ margin: "0 auto 46px", textAlign: "center" }}>

        <h2>{about.heading}</h2>
      </div>
      <div
        className="nova-about-story"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 0.78fr)",
          alignItems: "stretch",
          gap: "clamp(34px, 4vw, 58px)",
          width: "100%",
        }}
      >
        <div
          className="nova-about-text"
          style={{
            maxWidth: "720px",
            color: "#3b3944",
            fontSize: "clamp(15px, 0.95vw, 17px)",
            lineHeight: 1.62,
            fontWeight: 500,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignSelf: "stretch",
            minHeight: "clamp(360px, 34vw, 470px)",
          }}
        >
          {(about.paragraphs || []).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div
          className="nova-about-photo-wrap"
          style={{
            position: "relative",
            minHeight: "clamp(360px, 34vw, 470px)",
            isolation: "isolate",
          }}
        >
          <div
            className="nova-about-dot-pattern"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-34px",
              left: "-50px",
              zIndex: 0,
              width: "210px",
              height: "260px",
              opacity: 0.42,
              backgroundImage: "radial-gradient(circle, rgba(46, 49, 146, 0.45) 1.1px, transparent 1.2px)",
              backgroundSize: "11px 11px",
            }}
          />
          <div
            className="nova-about-photo-back"
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "44px -22px -26px 54px",
              zIndex: 0,
              borderRadius: "26px",
              background: "linear-gradient(135deg, #3145ff 0%, #2E3192 60%, #1f247a 100%)",
              boxShadow: "0 30px 64px rgba(46, 49, 146, 0.3)",
            }}
          />
          <div
            className="nova-about-photo"
            style={{
              position: "absolute",
              inset: "0 18px 0 0",
              zIndex: 2,
              overflow: "hidden",
              borderRadius: "26px",
              background: "#ffffff",
              boxShadow: "0 22px 58px rgba(40, 31, 100, 0.18)",
            }}
          >
            <img
              src={about.image}
              alt={about.imageAlt}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TravelBlogsSection({ posts }) {
  if (!posts.length) {
    return null;
  }

  const primaryPosts = posts.slice(0, 4);
  const primarySlugs = new Set(primaryPosts.map((post) => post.slug));
  const featuredPosts = posts.filter((post) => post.featured && !primarySlugs.has(post.slug)).slice(0, 4);
  const fallbackFeaturedPosts = posts.filter((post) => !primarySlugs.has(post.slug)).slice(0, 4);
  const visibleFeaturedPosts = featuredPosts.length ? featuredPosts : fallbackFeaturedPosts;

  const renderBlogCard = (post) => (
    <article className="nova-home-blog-card" key={post.slug}>
      <Link href={tfbPath(`/blogs/${post.slug}`)} className="nova-home-blog-image" aria-label={post.title}>
        <img src={post.image} alt={post.title} />
        <span>{post.category}</span>
      </Link>
      <div className="nova-home-blog-body">
        <div className="nova-home-blog-meta">
          <span>
            <CalendarDays size={13} />
            {post.date}
          </span>
          <span>
            <Clock3 size={13} />
            {post.readingTime}
          </span>
        </div>
        <h3>
          <Link href={tfbPath(`/blogs/${post.slug}`)}>{post.title}</Link>
        </h3>
        <p>{post.description}</p>
        <Link href={tfbPath(`/blogs/${post.slug}`)} className="nova-home-blog-link">
          Read More <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );

  return (
    <section id="blogs" className="nova-section nova-home-blog-section">
      <div className="nova-section-head" style={{ margin: "0 auto 46px", textAlign: "center" }}>

        <h2>Travel Blogs</h2>
      </div>
      <div className="nova-home-blog-grid">
        {primaryPosts.map(renderBlogCard)}
      </div>
      {visibleFeaturedPosts.length > 0 ? (
        <div className="nova-home-featured-blogs">
          <div className="nova-home-featured-blogs-head">
            <span>Featured Reads</span>
            <h3>Travel updates worth opening first</h3>
            <p>Fresh flight planning ideas, destination notes, and practical guides from live feeds.</p>
          </div>
          <div className="nova-home-blog-grid nova-home-featured-blog-grid">
            {visibleFeaturedPosts.map(renderBlogCard)}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Insights({ insights }) {
  return (
    <section id="insights" className="nova-section tripnest-value-strip" >
      <div className="tripnest-value-grid">
        {(insights || []).map((item, index) => (
          <article key={index}>
            <span className="tripnest-value-icon"><Icon name={item.iconKey} size={34} /></span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Newsletter({ newsletter }) {
  return (
    <section className="tripnest-newsletter-card" aria-labelledby="tripnest-newsletter-title">
      <div className="tripnest-newsletter-media">
        <Image
          src={newsletter.image}
          alt={newsletter.imageAlt}
          fill
          sizes="(max-width: 900px) 100vw, 34vw"
          loading="lazy"
          quality={75}
        />
      </div>

      <div className="tripnest-newsletter-content">
        <p className="tripnest-newsletter-kicker">{newsletter.kicker}</p>
        <h2 id="tripnest-newsletter-title">{newsletter.title} <span>{newsletter.titleHighlight}</span></h2>
        <p className="tripnest-newsletter-copy">{newsletter.copy}</p>

        <form className="tripnest-newsletter-form">
          <label>
            <Mail size={22} />
            <input type="email" placeholder={newsletter.placeholder} />
          </label>
          <button type="button">{newsletter.buttonText} <ArrowRight size={22} /></button>
        </form>

        <p className="tripnest-newsletter-proof"><ShieldCheck size={18} /> {newsletter.proof}</p>

        <div className="tripnest-newsletter-perks">
          {(newsletter.perks || []).map((perk, index) => (
            <article className="tripnest-newsletter-perk" key={index}>
              <span><Icon name={perk.iconKey} size={28} /></span>
              <strong>{perk.label}</strong>
              <p>{perk.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer({ footer }) {
  const data = footer || DEFAULT_HOME_CONTENT.footer;
  const footerColumns = data.columns || [];
  const social = data.social || {};

  return (
    <>
      <footer id="support" className="nova-footer">
        <div className="tripnest-footer-newsletter">
          <h2>{data.newsletterHeading}</h2>
          <p>{data.newsletterText}</p>
          <form>
            <input placeholder="Name" />
            <input placeholder="Email address" />
            <div className="tripnest-phone-field">
              <CountryCodeSelect />
              <input placeholder="Mobile number" />
            </div>
            <button type="button">Subscribe</button>
          </form>
          <small>{data.consentText} I have read and agree to the <Link href="/tripfindbox/terms-and-conditions">Terms and Conditions</Link> and <Link href="/tripfindbox/privacy-policy">Privacy Policy</Link>.</small>
        </div>

        <div className="tripnest-footer-grid">
          {footerColumns.map(({ title, items }) => (
            <div key={title}>
              <h3>{title}</h3>
              <ul>
                {(items || []).map((item) => (
                  <li key={typeof item === "string" ? item : item.label}>
                    {typeof item === "string" ? <span>{item}</span> : <Link href={tfbPath(item.href)}>{item.label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="tripnest-footer-social">
          <span>Follow us on</span>
          <div>
            <a className="social-facebook" href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a className="social-instagram" href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.4" />
                <circle cx="12" cy="12" r="3.7" />
                <circle cx="16.7" cy="7.3" r="1.05" />
              </svg>
            </a>
            <a className="social-x" href={social.x} target="_blank" rel="noreferrer" aria-label="Twitter X">X</a>
            <a className="social-linkedin" href={social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
          </div>
        </div>

        <p className="tripnest-footer-disclaimer">
          <strong>DISCLAIMER:</strong> {data.disclaimer}
        </p>
      </footer>
      <div className="tripnest-mobile-legal">
        {data.copyright} Use of this website signifies your agreement to the{" "}
        <Link href="/tripfindbox/terms-and-conditions">Terms of Use</Link>
      </div>
    </>
  );
}

export default async function HeroSection() {
  const [homepageBlogs, content] = await Promise.all([
    fetchBlogPosts(4),
    fetchHomeContent(),
  ]);

  return (
    <main className="nova-page">
      <Hero header={content.header} hero={content.hero} />
      <Insights insights={content.insights} />
      <DestinationDiscovery destinations={content.destinations} />
      <TravelBlogsSection posts={homepageBlogs} />
      <AboutTripFindBox about={content.about} />
      <Newsletter newsletter={content.newsletter} />
      <Footer footer={content.footer} />
    </main>
  );
}
