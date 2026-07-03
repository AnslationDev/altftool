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
import { getDummyNewsData } from "../lib/dummyNewsData";

export const revalidate = 600;

const ALL_CATEGORIES = [
  "politics", "tech", "business", "science", "sports", "health", "world", "entertainment",
];

const AUTHORS = [
  { name: "Rohan Mehta", designation: "Senior Political Correspondent", avatar: "RM", bio: "Rohan Mehta covers national politics and policy with over 12 years of experience in investigative journalism." },
  { name: "Ananya Sharma", designation: "Technology Editor", avatar: "AS", bio: "Ananya Sharma reports on emerging tech, AI, and digital innovation. Previously at TechCrunch and The Verge." },
  { name: "James Carter", designation: "Business Analyst", avatar: "JC", bio: "James Carter specializes in global markets, economic policy, and business strategy with a decade of reporting experience." },
  { name: "Dr. Priya Nair", designation: "Science & Health Correspondent", avatar: "PN", bio: "Dr. Priya Nair brings a PhD in molecular biology to her reporting on health, science, and medical breakthroughs." },
  { name: "Vikram Joshi", designation: "Sports Journalist", avatar: "VJ", bio: "Vikram Joshi has covered major sporting events worldwide including the Olympics, World Cup, and Grand Slams." },
];

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function enrichArticle(article) {
  const author = pick(AUTHORS);
  const category = article.category || pick(ALL_CATEGORIES);
  const tags = article.tags?.length
    ? article.tags
    : [category, article.source?.toLowerCase().replace(/\s+/g, ""), "trending"].filter(Boolean);
  const readingTime = article.reading_time_minutes || Math.max(3, Math.ceil((article.summary?.length || 100) / 200) * 3 + 2);
  const content = article.content || [
    article.summary || "Detailed coverage of this developing story continues to unfold as new information emerges from official sources and eyewitness accounts.",
    "Authorities have confirmed that investigations are underway to determine the full circumstances surrounding the event. Multiple agencies are collaborating to ensure a thorough review of all available evidence.",
    "Local community leaders have called for transparency and accountability, emphasizing the need for clear communication between law enforcement agencies and the public they serve.",
    "This incident has sparked broader discussions about enforcement procedures and the importance of maintaining public trust while ensuring safety and security for all citizens.",
    "As the story develops, updates will be provided by official channels. Residents are encouraged to stay informed through verified news sources and official statements.",
  ];

  return {
    ...article,
    category,
    tags,
    reading_time_minutes: readingTime,
    content,
    author,
    subtitle: article.subtitle || `An in-depth look at ${article.headline?.toLowerCase() || "this developing story"}, exploring the key developments, reactions, and what comes next.`,
    highlights: article.highlights || [
      { label: "Key Development", description: article.summary?.slice(0, 100) || "Major developments continue to shape the narrative around this story." },
      { label: "Official Response", description: "Authorities have issued statements acknowledging the situation and promising a thorough investigation." },
      { label: "Community Impact", description: "Local communities are organizing response efforts and calling for greater transparency from officials." },
      { label: "What's Next", description: "Further updates are expected as investigations proceed and more information becomes available." },
    ],
    author_bio: article.author_bio || author.bio,
    author_avatar: article.author_avatar || author.avatar,
    author_designation: article.author_designation || author.designation,
    image_caption: article.image_caption || `${article.source || "News"} — A visual report on the ongoing developments.`,
  };
}

async function findArticle(slug) {
  let article = (newsData.news || []).find((n) => n.slug === slug);
  if (!article) {
    const remoteNews = await getNewsDataServer();
    article = (remoteNews || []).find((n) => n.slug === slug);
  }
  return article ? enrichArticle(article) : null;
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

  const allNewsData = await getNewsDataServer().catch(() => getDummyNewsData(50));
  const allArticles = Array.isArray(allNewsData) ? allNewsData : allNewsData.news || [];

  const relatedNews = (newsData.news || [])
    .filter((n) => n.slug !== slug)
    .slice(0, 4);

  const trendingArticles = [...allArticles]
    .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
    .slice(0, 5);

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
            author: article.author?.name || article.source,
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
      <NewsArticleView
        article={article}
        relatedNews={relatedNews}
        trendingArticles={trendingArticles}
      />
    </>
  );
}
