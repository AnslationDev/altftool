import ArticleDetail from "../../pages/ArticleDetail";
import { getArticleBySlug } from "../../data/factNetData";
import { toMetaSnippet } from "../../metaSnippet";
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
    // Not `.slice(0, 155)` — that cut mid-word and trimMetaDescription then
    // welded a period onto the fragment ("... This orig.", "... a ca.").
    description: toMetaSnippet(article.description),
    path: article.href || `/fact-net/articles/${slug}`,
    type: "article",
    image: article.image || undefined,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <ArticleDetail slug={slug} />;
}
