import { Play } from "lucide-react";
import Header from "./Header";
import KymAdBanner, { kymBanners } from "./KymAdBanner";
import KymComments from "./KymComments";
import { articleSidebar, roundupArticle } from "../data/articleData";

function ArticleSidebar() {
  return (
    <aside className="kym-article-sidebar">
      <section>
        <h2>Related Entries</h2>
        <div className="kym-article-side-grid">
          {articleSidebar.map((item) => (
            <a href="#" key={item.title}>
              <img src={item.image.src} alt="" />
              <strong>{item.title}</strong>
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
            <span>{article.date}</span>

          </div>
          <p className="kym-article-lede">{article.intro}</p>

          <div className="kym-video-card">
            <img src={article.videoImage.src} alt="" />
            <button aria-label="Play video">
              <Play size={20} fill="currentColor" />
            </button>
            <div>
              <strong>He Tryna Ignore It</strong>
              <span>Watch the meme spread through this week&#39;s edits.</span>
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
        <ArticleSidebar />
      </main>
    </div>
  );
}
