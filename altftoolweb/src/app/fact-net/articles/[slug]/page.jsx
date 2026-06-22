import ArticleDetail from "../../pages/ArticleDetail";
import { getArticleBySlug } from "../../data/factNetData";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Fact-Net topic not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${article.title} - Original Facts`,
    description: article.description.slice(0, 155),
    alternates: {
      canonical: article.href,
    },
    openGraph: {
      title: article.title,
      description: article.description.slice(0, 155),
      type: "article",
      images: article.image ? [{ url: article.image }] : [],
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <ArticleDetail slug={slug} />;
}
