import PageView from "./PageView";
import blogData from "../../../(data)/db.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  compactBrandedTitle,
  createArticleJsonLd,
  createBreadcrumbJsonLd,
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

/**
 * createArticleJsonLd hardcodes `author` as an Organization node. These posts
 * are bylined to people — the body renders "Written by {author}" over an
 * initial avatar — so passing a person's name through that helper published
 * "Riya Sharma" and six others as organizations. The helper is shared by every
 * article route on the site and is out of this workstream's scope to change,
 * so the Person node is substituted here, on the one family that has human
 * bylines. Nothing is invented: the name is the same string the page prints.
 */
function withPersonByline(articleNode, author) {
  if (!articleNode) return articleNode;
  const name = typeof author === "string" ? author.trim() : "";
  if (!name) return articleNode;
  return { ...articleNode, author: { "@type": "Person", name } };
}

export default async function Page(props) {
  const { slug, id } = await props.params;
  const post = findPost(slug, id);
  const path = `/exclusivedeals/e-blogs/${slug}/${id}`;

  return (
    <>
      {/* The body renders a full article — byline, hero image, sections — but
          described nothing. No datePublished: db.json stores relative strings
          ("3 days ago"), and turning those into a date would be invented. */}
      {post ? (
        <JsonLd
          id={`exclusive-deals-blog-schema-${slug}-${id}`}
          data={[
            withPersonByline(
              createArticleJsonLd({
                path,
                headline: post.heading,
                description: post.description,
                image: post.image,
                type: "BlogPosting",
              }),
              post.author,
            ),
            createBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Exclusive Deals", path: "/exclusivedeals" },
              { name: post.heading, path },
            ]),
          ]}
        />
      ) : null}
      <PageView {...props} />
    </>
  );
}
