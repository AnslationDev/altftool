import ArticleDetail from "../../pages/ArticleDetail";
import { getArticleBySlug } from "../../data/factNetData";
import { toMetaDescription } from "../../data/metaDescription";
import {
  compactBrandedTitle,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return createPageMetadata({
      title: "Fact-Net topic not found | AltFTool",
      // Without this the omitted description falls back to siteConfig's, so the
      // 404 described the whole toolkit — measured live at 150 characters of
      // "AltFTool is your online tools website with free tools…".
      description:
        "That Fact Hub topic does not exist. Browse the full catalog of original AltFTool fact guides by category instead.",
      path: `/fact-net/articles/${slug}`,
      noindex: true,
      follow: false,
    });
  }

  // Every /fact-net page shipped unbranded — "Urban Rooftop Gardens - Original
  // Facts", 38 characters, no site name anywhere in it — because this section's
  // layout sets a plain-string title, which consumes the root layout's
  // "%s | AltFTool" template before the deeper segments can use it. Writing the
  // brand into the title makes resolveDocumentTitle mark it absolute, so it is
  // correct whether or not that template ever reaches here again.
  const branded = `${article.title} - Original Facts`;
  return createPageMetadata({
    // Keep the "- Original Facts" qualifier when the branded title still fits
    // in 60; otherwise brand the bare headline (compactBrandedTitle clips at a
    // word boundary rather than leaving a dangling "- Original").
    title:
      branded.length + 11 <= 60
        ? `${branded} | AltFTool`
        : compactBrandedTitle(article.title, 60),
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
