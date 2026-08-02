import ArticleDetail from "../../pages/ArticleDetail";
import { getArticleBySlug } from "../../data/factNetData";
import { toMetaDescription } from "../../data/metaDescription";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return createPageMetadata({
      title: "Fact-Net topic not found",
      path: `/fact-net/articles/${slug}`,
      noindex: true,
      follow: false,
    });
  }

  return createPageMetadata({
    title: `${article.title} - Original Facts`,
    // A raw .slice(0, 155) cut every one of these mid-word, and the fragment
    // then picked up a period from trimMetaDescription.
    description: toMetaDescription(article.description),
    path: article.href || `/fact-net/articles/${slug}`,
    type: "article",
    image: article.image || undefined,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <ArticleDetail slug={slug} />;
}
