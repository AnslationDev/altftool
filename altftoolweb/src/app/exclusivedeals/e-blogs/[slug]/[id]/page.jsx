import PageView from "./PageView";
import blogData from "../../../(data)/db.json";
import {
  compactBrandedTitle,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

function findPost(categorySlug, postSlug) {
  return (blogData.blog || []).find(
    (post) =>
      post.category?.toLowerCase() === String(categorySlug).toLowerCase() &&
      post.slug?.toLowerCase() === String(postSlug).toLowerCase(),
  );
}

export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  const post = findPost(slug, id);

  if (!post) {
    return {
      title: "Deals Blog Article Not Found – AltFTool",
      robots: { index: false, follow: true },
    };
  }

  const base = post.description || "";
  const category = (post.category || "").toLowerCase();

  // trimMetaDescription only passes a string through untouched when it is
  // shorter than 160; past that it back-clips to the last sentence end at
  // index >= 80, which silently discarded a longer padding tail and left four
  // of these posts below 120 characters. Keep the padded string under 160.
  const tail = category.includes("shopping")
    ? `A ${post.readTime} guide to smarter online shopping.`
    : `A ${post.readTime} guide to buying ${category} online.`;
  const description = base.length >= 120 ? base : `${base} ${tail}`.trim();

  // "Shopping shopping guide" is not a phrase anyone searches for, so only add
  // the qualifier when the category does not already contain the word.
  const categoryKeywords = category.includes("shopping")
    ? [`${post.category} deals`]
    : [`${post.category} deals`, `${post.category} shopping guide`];

  return createPageMetadata({
    title: compactBrandedTitle(post.heading),
    description,
    path: `/exclusivedeals/e-blogs/${slug}/${id}`,
    image: post.image,
    imageAlt: post.heading,
    keywords: [...(post.tags || []), ...categoryKeywords, "exclusive deals blog"],
    type: "article",
    authors: [post.author],
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
