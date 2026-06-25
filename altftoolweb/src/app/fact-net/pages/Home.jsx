import Link from "next/link";
import ArticleGrid from "../components/ArticleGrid";
import FactNetNav from "../components/FactNetNav";
import LocalFactImage from "../components/LocalFactImage";
import RandomFactWidget from "../components/RandomFactWidget";
import SearchForm from "../components/SearchForm";
import {
  formatCount,
  formatDate,
  getAllCategories,
  getArticlesPage,
  getFeaturedHomepageArticles,
  getHomepageSnapshot,
  getInventoryStats,
  getLatestArticles,
  getRandomFactPool,
  getSearchSuggestions,
} from "../data/factNetData";

function jsonLd(data) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

function chunkArticles(articles, count) {
  return Array.from({ length: count }, (_, index) =>
    articles.filter((_, articleIndex) => articleIndex % count === index),
  );
}

function shortCategory(label = "") {
  return label
    .replace("Sports Culture", "Sports")
    .replace("Future Living", "Lifestyle")
    .replace("Science & Nature", "Science")
    .replace("Digital Culture", "Culture")
    .replace("Design & Wellness", "Wellness");
}

export default function Home() {
  const stats = getInventoryStats();
  const homepage = getHomepageSnapshot();
  const categories = getAllCategories();
  const suggestions = getSearchSuggestions();
  const latest = getLatestArticles(30);
  const featuredSeeds = getFeaturedHomepageArticles(6);
  const featured = [
    ...featuredSeeds,
    ...latest.filter((article) => !featuredSeeds.some((item) => item.slug === article.slug)),
  ].slice(0, 6);
  const popular = getArticlesPage({ pageSize: 10, sort: "count" }).items;
  const randomFacts = getRandomFactPool(18);
  const columns = chunkArticles(latest, 5);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Fact-Net",
    description: homepage.description,
    url: "/fact-net",
    isPartOf: {
      "@type": "WebSite",
      name: "AltFTool",
      url: "https://altftool.com",
    },
  };

  return (
    <main className="fn-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <FactNetNav />

      <section className="fn-home-section">
        <div className="fn-section-rule">
          <h1>Latest Facts</h1>
        </div>

        <div className="fn-latest-wrap">
          <button type="button" className="fn-carousel-arrow fn-carousel-arrow-left" aria-label="Previous facts">
            <span aria-hidden="true">‹</span>
          </button>

          <div className="fn-feature-strip">
            {featured.map((article) => (
              <Link key={article.slug} href={article.href} className="fn-feature-card">
                <span className="fn-feature-image">
                  <LocalFactImage article={article} fallbackLabel={article.title} />
                </span>
                <span className="fn-feature-meta">
                  <strong>{shortCategory(article.primaryCategory)}</strong>
                  <i aria-hidden="true" />
                  <time dateTime={article.lastmod}>{formatDate(article.lastmod)}</time>
                </span>
                <span className="fn-feature-title">{article.title}</span>
              </Link>
            ))}
          </div>

          <button type="button" className="fn-carousel-arrow fn-carousel-arrow-right" aria-label="Next facts">
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className="fn-link-columns">
          {columns.map((items, index) => (
            <div key={`home-column-${index}`} className="fn-link-column">
              {items.map((article) => (
                <Link key={article.slug} href={article.href} className="fn-mini-link">
                  <strong>{article.primaryCategory}</strong>
                  <span>{article.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="fn-home-section fn-search-panel">
        <div>
          <div className="fn-section-rule">
            <h2>Find A Topic</h2>
          </div>
          <p>
            Search {formatCount(stats.postCount)} owned topic guides across {formatCount(stats.categoryCount)} original categories.
          </p>
        </div>
        <SearchForm action="/fact-net/search" categories={categories} suggestions={suggestions} compact />
      </section>

      <section className="fn-home-section">
        <div className="fn-section-rule">
          <h2>Random Fact</h2>
        </div>
        <RandomFactWidget facts={randomFacts} />
      </section>

      <section className="fn-home-section">
        <div className="fn-section-rule">
          <h2>Popular Facts</h2>
        </div>
        <ArticleGrid articles={popular} />
      </section>
    </main>
  );
}
