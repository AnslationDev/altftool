import { notFound } from "next/navigation";
import newsData from "../../../../public/data/newsdata.json";
import NewsArticleView from "./NewsArticleView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getNewsDataServer } from "../lib/getNewsDataServer";

export const revalidate = 600; // Cache news feed for 10 minutes

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function findArticle(slug) {
  // 1. Check local static news first
  let article = (newsData.news || []).find((n) => n.slug === slug);
  
  // 2. Fall back to remote fetched news feed
  if (!article) {
    const remoteNews = await getNewsDataServer();
    article = (remoteNews || []).find((n) => n.slug === slug);
  }

  return article ?? null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await findArticle(slug);

  if (!article) {
    return createPageMetadata({
      title: "News Article - AltFTool News",
      description: "Read latest technology and web tools news on AltFTool.",
      path: `/news/${slug}`,
    });
  }

  return createPageMetadata({
    title: `${article.headline} | AltFTool News`,
    description: article.summary || "Read the latest news update on AltFTool News.",
    path: `/news/${article.slug}`,
    image: article.image_url,
    keywords: [article.category, ...(article.tags || []), "AltFTool News"],
    type: "article",
  });
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  const article = await findArticle(slug);

  if (!article) {
    notFound();
  }

  // Related news is a selection of other local news articles
  const relatedNews = (newsData.news || [])
    .filter((n) => n.slug !== slug)
    .slice(0, 4);

  return (
    <>
      <JsonLd
        id={`news-schema-${article.slug}`}
        data={[
          createArticleJsonLd({
            path: `/news/${article.slug}`,
            headline: article.headline,
            description: article.summary,
            image: article.image_url,
            datePublished: article.published_at || new Date().toISOString(),
            author: article.source,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            {
              name: article.category || "General",
              path: article.category ? `/news/topics/${slugify(article.category)}` : "/news",
            },
            { name: article.headline, path: `/news/${article.slug}` },
          ]),
        ]}
      />
      <NewsArticleView article={article} relatedNews={relatedNews} />
    </>
  );
}
