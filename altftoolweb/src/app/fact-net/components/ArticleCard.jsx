import Link from "next/link";
import { formatDate } from "../data/factNetData";
import LocalFactImage from "./LocalFactImage";

export default function ArticleCard({ article }) {
  const categoryLabel = article.primaryCategory || article.categoryPath;

  return (
    <article className="fn-card fn-article-card">
      <Link href={article.href} className="fn-card-media" aria-label={`Open ${article.title}`}>
        <LocalFactImage article={article} fallbackLabel={article.title} />
      </Link>

      <div className="fn-card-body">
        <div className="fn-card-meta-line">
          <span>{categoryLabel}</span>
          <i aria-hidden="true" />
          <time dateTime={article.lastmod}>{formatDate(article.lastmod)}</time>
        </div>
        <h3 className="fn-card-title">
          <Link href={article.href}>{article.title}</Link>
        </h3>
        <p className="fn-card-summary">{article.deck || article.description}</p>
      </div>
    </article>
  );
}
