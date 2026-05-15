import newsData from "../../../../public/data/newsdata.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

function findArticle(slug) {
  return (newsData.news || []).find((article) => article.slug === slug);
}

function articlePublishedAt(article) {
  if (!Number.isFinite(Number(article?.published_hours_ago))) return undefined;
  return new Date(Date.now() - Number(article.published_hours_ago) * 60 * 60 * 1000).toISOString();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = findArticle(slug);

  if (!article) {
    return {
      title: "News Article Not Found – AltFTool",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: `${article.headline} | AltFTool News`,
    description: article.summary,
    path: `/news/${article.slug}`,
    image: article.image_url,
    keywords: [article.category, article.location, article.source, "AltFTool News"],
    type: "article",
  });
}

export default async function NewsArticleLayout({ children, params }) {
  const { slug } = await params;
  const article = findArticle(slug);

  if (!article) return children;

  const path = `/news/${article.slug}`;

  return (
    <>
      <JsonLd
        id={`news-article-schema-${article.slug}`}
        data={[
          createArticleJsonLd({
            path,
            headline: article.headline,
            description: article.summary,
            image: article.image_url,
            datePublished: articlePublishedAt(article),
            author: article.source,
            type: "NewsArticle",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: article.headline, path },
          ]),
        ]}
      />
      {children}
    </>
  );
}
