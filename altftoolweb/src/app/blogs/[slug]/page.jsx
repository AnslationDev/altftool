import BlogDetailClient from "./BlogDetailClient";
import {
  BLOG_REMOTE_LIMIT,
  getAllBlogs,
  getBlogBySlug,
  getRelatedBlogs,
  getRelatedBlogsForPost,
  mergeBlogPosts,
  stripHtml,
} from "../data";
import {
  fetchFirebaseBlogBySlug,
  fetchFirebaseBlogsPage,
} from "../data/firebaseBlogs";
import JsonLd from "@/platform/seo/JsonLd";
import { getRelatedToolsForBlog } from "../utils/relatedTools";
import {
  createBlogPostingJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllBlogs().map((blog) => ({ slug: blog.slug }));
}

function getBlogDescription(blog) {
  return (
    blog?.seoDescription ||
    blog?.excerpt ||
    stripHtml(blog?.description || blog?.content || "").slice(0, 160) ||
    "Read practical AltFTool guides, tool tutorials, and digital productivity articles."
  );
}

function decodeHtmlEntities(value = "") {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanFaqText(value = "") {
  return decodeHtmlEntities(stripHtml(value).replace(/\s+/g, " ").trim());
}

function normalizeFaqItems(value) {
  const source = Array.isArray(value) ? value : [];

  return source
    .map((item) => ({
      question: cleanFaqText(item?.question || item?.q || item?.title || ""),
      answer: cleanFaqText(item?.answer || item?.a || item?.description || ""),
    }))
    .filter((item) => item.question.length > 4 && item.answer.length > 12)
    .slice(0, 8);
}

function extractFaqsFromHtml(html = "") {
  const source = String(html || "");
  if (!source) return [];

  const blockMatch = source.match(/<!--\s*FAQ Start\s*-->([\s\S]*?)<!--\s*FAQ End\s*-->/i);
  const faqSource = blockMatch?.[1] || source;
  const itemPattern = /<div[^>]*class=["'][^"']*FAQ_ITEM[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  const items = [];
  let itemMatch = itemPattern.exec(faqSource);

  while (itemMatch) {
    const itemHtml = itemMatch[1] || "";
    const question = itemHtml.match(/<button[^>]*class=["'][^"']*FAQ_Q[^"']*["'][^>]*>([\s\S]*?)<\/button>/i)?.[1] || "";
    const answer = itemHtml.match(/<div[^>]*class=["'][^"']*FAQ_A[^"']*["'][^>]*>([\s\S]*?)$/i)?.[1] || "";
    const normalized = {
      question: cleanFaqText(question),
      answer: cleanFaqText(answer),
    };

    if (normalized.question.length > 4 && normalized.answer.length > 12) {
      items.push(normalized);
    }

    itemMatch = itemPattern.exec(faqSource);
  }

  return items.slice(0, 8);
}

async function getInitialRelatedBlogs(blog, slug) {
  if (!blog) return getRelatedBlogs(slug, 6);

  try {
    const firebasePosts = await fetchFirebaseBlogsPage({
      pageSize: BLOG_REMOTE_LIMIT,
    });
    const candidates = mergeBlogPosts(getAllBlogs(), firebasePosts);
    return getRelatedBlogsForPost(blog, candidates, 6);
  } catch {
    return getRelatedBlogs(slug, 6);
  }
}

function buildBlogFaq(blog) {
  if (!blog) return [];

  const authoredFaqs = [
    ...normalizeFaqItems(blog.faq),
    ...normalizeFaqItems(blog.faqs),
    ...normalizeFaqItems(blog.faqItems),
    ...normalizeFaqItems(blog.faq?.items),
    ...extractFaqsFromHtml(blog.description || blog.content || blog.body || ""),
  ].reduce((acc, item) => {
    const key = item.question.toLowerCase();
    if (!acc.some((existing) => existing.question.toLowerCase() === key)) {
      acc.push(item);
    }
    return acc;
  }, []);

  if (authoredFaqs.length) return authoredFaqs;

  const title = blog.heading || blog.title || "this AltFTool article";
  const category = blog.category || "AltFTool guides";
  const readTime = blog.readTime || `${blog.readTimeMinutes || 2} min read`;
  const readingDuration = String(readTime).replace(/\s*read$/i, "");

  return [
    {
      question: `What is ${title} about?`,
      answer: getBlogDescription(blog),
    },
    {
      question: `How long does it take to read ${title}?`,
      answer: `This article takes about ${readingDuration} to read.`,
    },
    {
      question: `Where can I find more ${category} articles?`,
      answer: `Browse the ${category} archive on AltFTool for more related guides, tips, and tool workflows.`,
    },
  ];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = (await fetchFirebaseBlogBySlug(slug).catch(() => null)) || getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "AltFTool Blog Article",
      description: "Read practical AltFTool guides, tool tutorials, and digital productivity articles.",
    };
  }

  const title = blog.seoTitle || `${blog.heading} - AltFTool Blog`;
  const description = getBlogDescription(blog);
  const tags = Array.isArray(blog.tags) ? blog.tags.filter(Boolean) : [];
  const metadata = createPageMetadata({
    title,
    description,
    path: `/blogs/${slug}`,
    image: `/blogs/${slug}/opengraph-image`,
    keywords: [
      "AltFTool blog",
      blog.category,
      blog.tool,
      ...tags,
    ],
    type: "article",
  });

  return {
    ...metadata,
    authors: [{ name: blog.author || "AltFTool Editorial" }],
    openGraph: {
      ...metadata.openGraph,
      title,
      description,
      type: "article",
      publishedTime: blog.date,
      modifiedTime: blog.updatedAt || blog.date,
      authors: [blog.author || "AltFTool Editorial"],
      tags,
    },
    twitter: {
      ...metadata.twitter,
      title,
      description,
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const initialBlog = (await fetchFirebaseBlogBySlug(slug).catch((error) => {
    console.error("BlogDetailPage Firebase detail failed:", error);
    return null;
  })) || getBlogBySlug(slug);
  const initialRelated = await getInitialRelatedBlogs(initialBlog, slug);
  const initialRelatedTools = getRelatedToolsForBlog(initialBlog, 6);

  return (
    <>
      <JsonLd
        id={`blog-schema-${slug}`}
        data={[
          createBlogPostingJsonLd(initialBlog),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
            { name: initialBlog?.heading || initialBlog?.title || "Article", path: `/blogs/${slug}` },
          ]),
          createFaqJsonLd({
            path: `/blogs/${slug}`,
            questions: buildBlogFaq(initialBlog),
          }),
          createItemListJsonLd({
            path: `/blogs/${slug}`,
            name: "Related AltFTool resources",
            items: [
              ...initialRelated.slice(0, 4).map((post) => ({
                name: post.heading || post.title,
                path: `/blogs/${post.slug}`,
              })),
              ...initialRelatedTools.slice(0, 4).map((tool) => ({
                name: tool.name,
                path: tool.href,
              })),
            ],
          }),
        ]}
      />
      <BlogDetailClient
        slug={slug}
        initialBlog={initialBlog}
        initialRelated={initialRelated}
        initialRelatedTools={initialRelatedTools}
      />
    </>
  );
}
