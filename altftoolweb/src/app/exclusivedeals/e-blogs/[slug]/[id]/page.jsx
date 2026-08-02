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

// compactBrandedTitle clips whatever it is given to fit, so a heading longer
// than 49 characters (the budget once " | AltFTool" is appended) shipped as a
// machine-cut fragment: "…Are Using Entertainment to | AltFTool",
// "…Changing Wellness | AltFTool". These are shorter titles for exactly those
// posts, so the tag ends on a whole phrase. The <h1> keeps the full heading;
// only the SERP title is condensed. Any post whose heading already fits is
// absent here and passes through unchanged.
const SEO_TITLES = {
  "top-fashion-trends-online-shopping": "Fashion Trends Shaping Online Shopping",
  "entertainment-ecommerce-growth": "How Entertainment Drives E-Commerce Sales",
  "ecommerce-growth-hacks": "E-Commerce Growth Hacks for Online Stores",
  "online-health-stores-wellness": "How Online Health Stores Changed Wellness",
  "online-grocery-shopping-future": "Why Online Grocery Is the Future of Food",
};

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
    title: compactBrandedTitle(SEO_TITLES[post.slug] || post.heading),
    description,
    path: `/exclusivedeals/e-blogs/${slug}/${id}`,
    image: post.image,
    imageAlt: post.heading,
    keywords: [...(post.tags || []), ...categoryKeywords, "exclusive deals blog"],
    type: "article",
    authors: [post.author],
  });
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
            createArticleJsonLd({
              path,
              headline: post.heading,
              description: post.description,
              image: post.image,
              author: post.author,
              type: "BlogPosting",
            }),
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
