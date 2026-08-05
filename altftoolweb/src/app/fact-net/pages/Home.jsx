import Link from "next/link";
import ArticleGrid from "../components/ArticleGrid";
import FactNetNav from "../components/FactNetNav";
import FeatureCarousel from "../components/FeatureCarousel";
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
import { absoluteUrl } from "@/platform/seo/generateMetadata";

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
  const carouselArticles = [
    ...featuredSeeds,
    ...latest.filter((article) => !featuredSeeds.some((item) => item.slug === article.slug)),
  ].map((article) => ({
    ...article,
    categoryLabel: shortCategory(article.primaryCategory),
    displayDate: formatDate(article.lastmod),
  }));
  const popular = getArticlesPage({ pageSize: 10, sort: "count" }).items;
  const randomFacts = getRandomFactPool(18);
  const columns = chunkArticles(latest, 5);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Fact-Net",
    description: homepage.description,
    url: absoluteUrl("/fact-net"),
    isPartOf: {
      "@id": `${absoluteUrl("/")}#website`,
    },
  };

  return (
    <main className="fn-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <FactNetNav />

      <section className="fn-home-section">
        <div className="fn-section-rule">
          <h1>Latest facts and original topic guides</h1>
        </div>

        <FeatureCarousel articles={carouselArticles} />

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
