import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  FileText,
  Home,
  Mail,
  MessageCircle,
  Printer,
  UserRound,
} from "lucide-react";
import ArticleExportActions from "../components/ArticleExportActions";
import FactNetNav from "../components/FactNetNav";
import LocalFactImage from "../components/LocalFactImage";
import {
  formatDate,
  getArticleBySlug,
  getCategoryByPath,
  getFeaturedHomepageArticles,
  getNeighborArticles,
  getRelatedArticles,
} from "../data/factNetData";
import { absoluteUrl } from "@/platform/seo/generateMetadata";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

function jsonLd(data) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

function ShareRail({ path, title }) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(absoluteUrl(path));
  const encodedMessage = encodeURIComponent(`${title} ${absoluteUrl(path)}`);

  return (
    <aside className="fn-share-rail" aria-label="Share this article">
      <a className="fn-share-btn fn-share-facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}>
        f
      </a>
      <a className="fn-share-btn fn-share-twitter" href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}>
        x
      </a>
      <a className="fn-share-btn fn-share-pinterest" href={`https://www.pinterest.com/pin/create/button/?description=${encodedTitle}`}>
        p
      </a>
      <a className="fn-share-btn fn-share-whatsapp" href={`https://wa.me/?text=${encodedMessage}`}>
        <MessageCircle className="fn-icon" />
      </a>
      <a className="fn-share-btn fn-share-mail" href={`mailto:?subject=${encodedTitle}&body=${encodedMessage}`}>
        <Mail className="fn-icon" />
      </a>
    </aside>
  );
}

function FeaturedSidebar({ articles }) {
  return (
    <aside className="fn-featured-sidebar">
      <h2>Featured Facts</h2>
      <div className="fn-sidebar-list">
        {articles.map((article) => (
          <Link key={article.slug} href={article.href} className="fn-sidebar-item">
            <span className="fn-sidebar-thumb">
              <LocalFactImage article={article} fallbackLabel={article.title} />
            </span>
            <span>
              <small>{article.primaryCategory}</small>
              <strong>{article.title}</strong>
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export default function ArticleDetail({ slug }) {
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const category = getCategoryByPath(article.categoryPath);
  const related = getRelatedArticles(article, 5);
  const neighbors = getNeighborArticles(article);
  const featuredSidebar = getFeaturedHomepageArticles(8).filter((item) => item.slug !== article.slug).slice(0, 6);

  const relatedContentItems = getRelatedContentForPreset(
    {
      href: article.href,
      title: article.title,
      description: article.description,
      tags: [article.primaryCategory, category?.name].filter(Boolean),
      section: "news",
    },
    "editorial",
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: absoluteUrl(article.image),
    url: absoluteUrl(article.href),
    datePublished: article.lastmod,
    dateModified: article.lastmod,
    author: {
      "@type": "Organization",
      name: "AltFTool Editorial",
    },
    isPartOf: {
      "@type": "CollectionPage",
      name: "Fact-Net",
      url: absoluteUrl("/fact-net"),
    },
    publisher: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
  };

  return (
    <main className="fn-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <FactNetNav />

      <header className="fn-detail-hero" style={{ "--fn-hero-image": `url(${article.image || ""})` }}>
        <nav className="fn-breadcrumb" aria-label="Breadcrumb">
          <Link href="/fact-net">
            <Home className="fn-icon" />
            Home
          </Link>
          <ChevronRight className="fn-icon" />
          <Link href={category?.href || "/fact-net/categories"}>{category?.name || article.primaryCategory}</Link>
        </nav>
        <h1>{article.title}</h1>
      </header>

      <section className="fn-author-row">
        <div className="fn-author-avatar">
          <UserRound className="fn-icon" />
        </div>
        <p>
          Written By <strong>AltFTool Editorial</strong>
          <span aria-hidden="true">•</span>
          Published: <strong>{formatDate(article.lastmod)}</strong>
        </p>
        <span className="fn-verify-badge">
          <BadgeCheck className="fn-icon" />
          Original Content
        </span>
        <span className="fn-verify-badge">
          <BadgeCheck className="fn-icon" />
          Editorial Guidelines
        </span>
      </section>

      <div className="fn-detail-divider" />

      <div className="fn-article-layout">
        <ShareRail path={article.href} title={article.title} />

        <article className="fn-article-main">
          <figure className="fn-article-featured">
            <LocalFactImage article={article} fallbackLabel={article.title} />
          </figure>
          <p className="fn-source-note">Source: AltFTool original research and generated local artwork</p>

          <div className="fn-article-body">
            <p>
              <strong>{article.title.replace(/^\d+\s+Facts\s+About\s+/i, "What is ")}</strong>{" "}
              {article.description}
            </p>

            <section className="fn-article-facts">
              <h2>{article.factCount} Original Facts</h2>
              <ol>
                {article.facts.map((fact, index) => (
                  <li key={fact}>
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                    <span>{fact}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section className="fn-export-panel">
            <h2>Save This Fact List</h2>
            <p>Download the complete original topic list for offline reading or print it as a PDF.</p>
            <ArticleExportActions article={article} />
          </section>

          <nav className="fn-neighbor-nav" aria-label="Next and previous topics">
            {neighbors.previous ? (
              <Link href={neighbors.previous.href}>
                <FileText className="fn-icon" />
                Previous Topic
              </Link>
            ) : (
              <span>First Topic</span>
            )}
            {neighbors.next ? (
              <Link href={neighbors.next.href}>
                Next Topic
                <Printer className="fn-icon" />
              </Link>
            ) : (
              <span>Last Topic</span>
            )}
          </nav>
        </article>

        <div className="fn-detail-sidebar">
          <FeaturedSidebar articles={featuredSidebar.length ? featuredSidebar : related} />
          {related.length > 0 && (
            <aside className="fn-featured-sidebar fn-related-sidebar">
              <h2>Related Facts</h2>
              <div className="fn-sidebar-list">
                {related.map((item) => (
                  <Link key={item.slug} href={item.href} className="fn-sidebar-item">
                    <span className="fn-sidebar-thumb">
                      <LocalFactImage article={item} fallbackLabel={item.title} />
                    </span>
                    <span>
                      <small>{item.primaryCategory}</small>
                      <strong>{item.title}</strong>
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>

      <RelatedContentSection
        title="More from AltFTool"
        items={relatedContentItems}
        path={article.href}
        jsonLdName="More from AltFTool"
      />
    </main>
  );
}
