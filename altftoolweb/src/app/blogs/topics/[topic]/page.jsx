import { notFound } from "next/navigation";
import BlogArchivePage from "../../components/BlogArchivePage";
import JsonLd from "@/platform/seo/JsonLd";
import {
  BLOG_TOPIC_CLUSTER_CONFIG,
  blogTaxonomySlug,
  getAllBlogs,
  getBlogTopicClusterBySlug,
  getBlogTopicClusters,
  mergeBlogPosts,
} from "../../data";
import { getFirebaseBlogCatalog } from "../../data/firebaseBlogs";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const revalidate = 3600;

export function generateStaticParams() {
  return BLOG_TOPIC_CLUSTER_CONFIG.map((cluster) => ({ topic: cluster.slug }));
}

async function getMergedPosts() {
  const firebaseCatalog = await getFirebaseBlogCatalog().catch(() => ({
    posts: [],
  }));

  return mergeBlogPosts(getAllBlogs(), firebaseCatalog.posts);
}

async function getTopicArchive(topicSlug) {
  const posts = await getMergedPosts();
  const cluster = getBlogTopicClusterBySlug(topicSlug, posts);
  const clusters = getBlogTopicClusters(posts);

  return {
    cluster,
    clusters,
  };
}

function getTopicHubFaqs(cluster) {
  if (!cluster) return [];

  const leadTitle = cluster.leadPost?.heading || `${cluster.title} guides`;
  const topCategory = cluster.relatedCategories?.[0] || cluster.title;

  return [
    {
      question: `What is the ${cluster.title} topic hub for?`,
      answer: `${cluster.description} It groups related AltFTool articles so readers can move through the same workflow without searching from scratch.`,
    },
    {
      question: `Where should I start in ${cluster.title}?`,
      answer: `Start with ${leadTitle}, then continue through the related reads and tags shown in this hub.`,
    },
    {
      question: `How are ${cluster.title} articles selected?`,
      answer: `Articles are matched by category, tags, tool topics, keyword overlap, and freshness signals from the AltFTool blog catalog.`,
    },
    {
      question: `Can I filter this hub by ${topCategory}?`,
      answer: `Yes. Use the related topic chips and blog filters to narrow this cluster by category, tag, freshness, and reading intent.`,
    },
  ];
}

export async function generateMetadata({ params }) {
  const { topic } = await params;
  const { cluster } = await getTopicArchive(topic);

  if (!cluster) {
    return createPageMetadata({
      title: "Blog Topic Cluster - AltFTool",
      description: "Browse AltFTool blog topic clusters.",
      path: `/blogs/topics/${topic}`,
    });
  }

  return createPageMetadata({
    title: `${cluster.title} Guides - AltFTool Blog`,
    description: `${cluster.description} Browse ${cluster.postCount || "curated"} connected AltFTool articles in this topic cluster.`,
    path: `/blogs/topics/${cluster.slug}`,
    image: cluster.leadPost?.image,
    keywords: [cluster.title, "AltFTool topic cluster", ...cluster.keywords],
  });
}

export default async function BlogTopicClusterPage({ params }) {
  const { topic } = await params;
  const { cluster, clusters } = await getTopicArchive(topic);

  if (!cluster) notFound();

  const path = `/blogs/topics/${cluster.slug}`;
  const topicFaqs = getTopicHubFaqs(cluster);
  const primaryTag = cluster.relatedTags?.[0];
  const primaryCategory = cluster.relatedCategories?.[0];
  const hubHighlights = [
    cluster.leadPost
      ? {
          kind: "article",
          label: "Start here",
          title: cluster.leadPost.heading,
          caption: cluster.leadPost.excerpt || "The strongest first read in this topic path.",
          href: `/blogs/${cluster.leadPost.slug}`,
        }
      : null,
    primaryTag
      ? {
          kind: "topic",
          label: "Narrow by tag",
          title: primaryTag,
          caption: `See articles tagged ${primaryTag} across the blog catalog.`,
          href: `/blogs/tag/${blogTaxonomySlug(primaryTag)}`,
        }
      : null,
    {
      kind: "tool",
      label: "Try matching tools",
      title: `${cluster.title} tools`,
      caption: `Open the tools catalog with ${cluster.title.toLowerCase()} context.`,
      href: `/tools/all?search=${encodeURIComponent(primaryCategory || cluster.title)}`,
    },
  ].filter(Boolean);
  const relatedLabels = clusters
    .filter((item) => item.postCount > 0)
    .map((item) => ({
      label: item.title,
      href: `/blogs/topics/${item.slug}`,
    }));

  return (
    <>
      <JsonLd
        id={`blog-topic-schema-${cluster.slug}`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: `${cluster.title} Guides`,
            description: cluster.description,
          }),
          createFaqJsonLd({
            path,
            questions: topicFaqs,
          }),
          createItemListJsonLd({
            path,
            name: `${cluster.title} topic cluster articles`,
            items: cluster.posts.slice(0, 24).map((post) => ({
              name: post.heading,
              path: `/blogs/${post.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
            { name: "Topic Clusters", path: "/blogs/topics" },
            { name: cluster.title, path },
          ]),
        ]}
      />
      <BlogArchivePage
        eyebrow={cluster.eyebrow}
        title={`${cluster.title} Guides`}
        description={`${cluster.description} This hub connects the strongest related reads so readers can continue the same workflow across multiple articles.`}
        posts={cluster.posts}
        activeLabel={cluster.title}
        archiveType="topic"
        relatedLabels={relatedLabels}
        hubHighlights={hubHighlights}
        faqItems={topicFaqs}
      />
    </>
  );
}
