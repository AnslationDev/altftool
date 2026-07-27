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
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

export const revalidate = 600;

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * These are real news stories about real people, aggregated from third-party
 * feeds. We only ever render what the feed actually gave us.
 *
 * Do NOT reintroduce synthesised fields here — no invented bylines, no
 * generated body paragraphs, no "official response" highlights, no image
 * captions, no fabricated publish dates. If a field is missing it must stay
 * missing so the UI and the structured data omit it.
 */
async function findArticle(slug) {
  let article = (newsData.news || []).find((n) => n.slug === slug);
  if (!article) {
    const remoteNews = await getNewsDataServer();
    article = (remoteNews || []).find((n) => n.slug === slug);
  }
  return article || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await findArticle(slug);

  if (!article) {
    return createPageMetadata({
      title: "News Article - AltFTool News",
      description: "Read latest technology and web tools news on AltFTool.",
      path: `/news/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${article.headline} | AltFTool News`,
    description: article.summary || "Read the latest news update on AltFTool News.",
    path: `/news/${article.slug}`,
    image: article.image_url,
    keywords: [article.category, ...(article.tags || []), "AltFTool News"].filter(Boolean),
    type: "article",
    // The reporting belongs to the original publisher, so this page carries
    // only their headline and summary — it must not compete with them in
    // search. follow stays on so the outbound source link still counts.
    noindex: true,
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

  // Records that carry real provenance: either a link back to the publisher
  // (RSS-normalised items) or a curated publisher_type (bundled newsdata.json).
  // Placeholder records from the dummy fallback have neither.
  const hasKnownPublisher = Boolean(
    article.source && (article.external_url || article.publisher_type)
  );

  const relatedContentItems = getRelatedContentForPreset(
    {
      href: `/news/${slug}`,
      title: article.headline || article.title,
      description: article.summary,
      tags: [article.source, article.location, ...(article.tags || [])].filter(Boolean),
      section: "news",
    },
    "editorial"
  );

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
            // Never claim a publish date we do not have — an absent value is
            // dropped from the JSON-LD rather than stamped with "now".
            datePublished: article.published_at || undefined,
            // The originating publisher, never an invented byline.
            author: article.source || undefined,
          }),
          createBreadcrumbJsonLd(
            [
              { name: "Home", path: "/" },
              { name: "News", path: "/news" },
              article.category
                ? { name: article.category, path: `/news/topics/${slugify(article.category)}` }
                : null,
              { name: article.headline, path: `/news/${article.slug}` },
            ].filter(Boolean)
          ),
        ]}
      />
      <NewsArticleView
        article={article}
        relatedNews={relatedNews}
        trendingArticles={trendingArticles}
      />

      {/* Honest attribution: this page carries a headline and summary only,
          the reporting belongs to the original publisher. Only claim a
          publisher for records that actually carry provenance — placeholder
          fallback records must never be attributed to a real newsroom. */}
      {hasKnownPublisher && (
        <section className="mx-auto w-full max-w-[1360px] px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Reported by {article.source}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {article.external_url
                ? "AltFTool News shows the headline and summary from the original report. Read the full story at the publisher."
                : "AltFTool News shows the headline and summary from the original report. The full story is published by the source above."}
            </p>
            {article.external_url && (
              <a
                href={article.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)]
                  px-4 py-2.5 text-sm font-semibold text-[var(--primary)] transition
                  hover:bg-[var(--muted)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
                  focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                "
              >
                Read the full story at {article.source}
                <span aria-hidden="true">&rarr;</span>
              </a>
            )}
          </div>
        </section>
      )}

      <RelatedContentSection
        title="Tools & guides from AltFTool"
        items={relatedContentItems}
        path={`/news/${article.slug}`}
        jsonLdName="Tools & guides from AltFTool"
      />
    </>
  );
}
