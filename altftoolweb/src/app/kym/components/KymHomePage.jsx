import { MessageCircle, Megaphone, Play } from "lucide-react";
import Header from "./Header";
import KymAdBanner, { kymBanners } from "./KymAdBanner";
import KymTrendingImages from "./KymTrendingImages";
import {
  editorials,
  episodes,
  explainers,
  freshEntries,
  latest,
  spotlightCards,
  topEntries,
  topMemes,
  trendingImages,
} from "../data/kymData";
import { slugifyTitle } from "../data/slug";

function cardHref(item) {
  return item.href || `/kym/${slugifyTitle(item.title)}`;
}

function ImageCard({ item, variant = "standard" }) {
  return (
    <a className={`kym-card kym-card--${variant} kym-surface-card`} href={cardHref(item)}>
      <img src={item.image.src} alt="" />
      <div className="kym-card__content">
        {item.category ? <span>{item.category}</span> : null}
        <h3>{item.title}</h3>
        {item.meta ? <p>{item.meta}</p> : null}
      </div>
    </a>
  );
}

function EntryRow({ item }) {
  return (
    <a className="kym-entry-row kym-surface-card" href={cardHref(item)}>
      <img src={item.image.src} alt="" />
      <div>
        <span>Meme</span>
        <h3>{item.title}</h3>
        <p>{item.meta}</p>
      </div>
    </a>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <h2 className="kym-section-title">
      {icon ? <span className="kym-section-title__icon">{icon}</span> : null}
      <span className="kym-section-title__text">{children}</span>
    </h2>
  );
}

function MainColumn() {
  return (
    <article className="kym-main-column">
      <div className="kym-alert kym-reveal" role="status">
        <Megaphone size={16} strokeWidth={2.25} aria-hidden="true" />
        <span>Cast Your Vote For May 2026&apos;s Meme Of The Month!</span>
      </div>

      <section className="kym-section kym-reveal">
        <SectionTitle>Today In Internet Culture</SectionTitle>
        <div className="kym-top-grid">
          {spotlightCards.map((item) => (
            <ImageCard
              key={item.title}
              item={item}
              variant={item.size === "large" ? "feature" : "standard"}
            />
          ))}
        </div>
      </section>

      <section className="kym-section kym-reveal">
        <SectionTitle>Fresh Entries</SectionTitle>
        <div className="kym-entry-list">
          {freshEntries.map((item) => (
            <EntryRow item={item} key={item.title} />
          ))}
        </div>
      </section>

      <section className="kym-section kym-reveal">
        <SectionTitle icon={<MessageCircle size={16} strokeWidth={2.25} />}>
          Latest Explainers
        </SectionTitle>
        <div className="kym-explainer-stack">
          {explainers.map((item) => (
            <ImageCard item={item} key={item.title} variant="wide" />
          ))}
        </div>
      </section>

      <section className="kym-section kym-reveal">
        <SectionTitle icon={<Play size={15} fill="currentColor" strokeWidth={2.25} />}>
          Latest Episodes
        </SectionTitle>
        <div className="kym-episode-grid">
          {episodes.map((item) => (
            <ImageCard item={item} key={item.title} />
          ))}
        </div>

      </section>

      <section className="kym-section kym-reveal">
        <SectionTitle>News & Editorials</SectionTitle>
        <div className="kym-editorial-grid">
          {editorials.map((item) => (
            <ImageCard item={item} key={item.title} />
          ))}
        </div>

      </section>

      <section className="kym-section kym-reveal">
        <SectionTitle>Latest</SectionTitle>
        <div className="kym-latest-feed">
          {latest.map((item) => (
            <EntryRow item={item} key={item.title} />
          ))}
        </div>

      </section>
    </article>
  );
}

function Sidebar() {
  return (
    <aside className="kym-sidebar">
      <section className="kym-side-block kym-surface-card kym-reveal">
        <h2>Top Entries This Month</h2>
        <div className="kym-side-list">
          {topEntries.map((item, index) => (
            <a href={cardHref(item)} key={item.title}>
              <img src={item.image.src} alt="" />
              <span>{index + 1}</span>
              <p>{item.title}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="kym-side-block kym-surface-card kym-reveal">
        <h2>Trending Images</h2>
        <KymTrendingImages images={trendingImages} />
      </section>



      <section className="kym-side-block kym-top-memes kym-surface-card kym-reveal">
        <h2>Top 5 Memes</h2>
        <p>From the last week</p>
        {topMemes.map((item, index) => (
          <a href={cardHref(item)} key={item.title}>
            <img src={item.image.src} alt="" />
            <span>{index + 1}</span>
            <strong>{item.title}</strong>
          </a>
        ))}
      </section>

      <div className="kym-home-sidebar-banner" aria-label="Sponsored banner">
        <KymAdBanner src={kymBanners.sidebarTall} variant="vertical" />
      </div>
    </aside>
  );
}

export default function KymHomePage() {
  return (
    <div className="kym-page">
      <Header />
      <main className="kym-shell">
        <MainColumn />
        <Sidebar />
      </main>
    </div>
  );
}
