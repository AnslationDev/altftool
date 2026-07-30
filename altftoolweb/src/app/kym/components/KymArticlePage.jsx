import Header from "./Header";
import KymAdBanner, { kymBanners } from "./KymAdBanner";
import KymComments from "./KymComments";
import { contentGroups } from "./KymGenericPage";
import { roundupArticle } from "../data/articleData";
import { slugifyTitle } from "../data/slug";

function ArticleSidebar({ currentTitle }) {
  const related = contentGroups.filter((entry) => entry.title !== currentTitle).slice(0, 4);

  return (
    <aside className="kym-article-sidebar">
      <section>
        <h2>Related Entries</h2>
        <div className="kym-article-side-grid">
          {related.map((entry) => (
            <a href={entry.href || `/kym/${slugifyTitle(entry.title)}`} key={entry.title}>
              <img src={entry.image.src} alt="" />
              <strong>{entry.title}</strong>
            </a>
          ))}
        </div>
      </section>
      <div className="kym-sidebar-banners" aria-label="Sponsored banner">
        <KymAdBanner src={kymBanners.sidebarTall} variant="vertical" />
      </div>
    </aside>
  );
}

function MediaBlock({ image, tall = false }) {
  return (
    <figure className={`kym-article-media${tall ? " kym-article-media--tall" : ""}`}>
      <img src={image.src} alt="" />
    </figure>
  );
}

export default function KymArticlePage() {
  const article = roundupArticle;

  return (
    <div className="kym-page kym-article-page">
      <Header compact />
      <main className="kym-article-shell">
        <article className="kym-article">
          <p className="kym-article-kicker">{article.category}</p>
          <h1>{article.title}</h1>
          <img className="kym-article-hero" src={article.heroImage.src} alt="" />
          <div className="kym-article-meta">
            <span>By {article.author}</span>
            <span>{article.date}</span>

          </div>
          <p className="kym-article-lede">{article.intro}</p>

          <div className="kym-video-card">
            <img src={article.videoImage.src} alt="" />
            <div>
              <strong>He Tryna Ignore It</strong>
              <span>This week&#39;s top edit of the meme.</span>
            </div>
          </div>

          {article.sections.map((section, sectionIndex) => (
            <section className="kym-article-section" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              <div className="kym-article-image-stack">
                {section.images.map((image, index) => (
                  <MediaBlock
                    image={image}
                    key={`${section.title}-${image.src}-${index}`}
                    tall={sectionIndex === 0}
                  />
                ))}
              </div>
            </section>
          ))}

          <KymComments storageKey="kym-comments:weekly-meme-roundup" />
        </article>
        <ArticleSidebar currentTitle={article.title} />
      </main>
    </div>
  );
}
