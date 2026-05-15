import BlogArchivePage from "../../components/BlogArchivePage";
import JsonLd from "@/platform/seo/JsonLd";
import {
  blogTaxonomySlug,
  filterBlogsByTagSlug,
  getAllBlogs,
  getAllBlogTags,
  getBlogTagBySlug,
  mergeBlogPosts,
  sortBlogsByDate,
} from "../../data";
import { getFirebaseBlogCatalog } from "../../data/firebaseBlogs";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllBlogTags().map((tag) => ({ tag: blogTaxonomySlug(tag) }));
}

async function getMergedPosts() {
  const firebaseCatalog = await getFirebaseBlogCatalog().catch(() => ({
    posts: [],
  }));

  return mergeBlogPosts(getAllBlogs(), firebaseCatalog.posts);
}

async function getTagArchive(tagSlug) {
  const posts = await getMergedPosts();
  const tagLabel = getBlogTagBySlug(tagSlug, posts) || getBlogTagBySlug(tagSlug);
  const tagPosts = sortBlogsByDate(filterBlogsByTagSlug(posts, tagSlug));

  return {
    posts,
    tagLabel,
    tagPosts,
  };
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  const { tagLabel, tagPosts } = await getTagArchive(tag);

  return createPageMetadata({
    title: `${tagLabel} Blog Articles - AltFTool`,
    description: `Explore ${tagPosts.length || "curated"} AltFTool articles tagged ${tagLabel}, with practical tips, tools, and digital workflows.`,
    path: `/blogs/tag/${tag}`,
    image: tagPosts[0]?.image,
    keywords: [tagLabel, "AltFTool blog", `${tagLabel} articles`],
  });
}

export default async function BlogTagPage({ params }) {
  const { tag } = await params;
  const { posts, tagLabel, tagPosts } = await getTagArchive(tag);
  const tags = getAllBlogTags(posts);
  const path = `/blogs/tag/${tag}`;

  return (
    <>
      <JsonLd
        id={`blog-tag-schema-${tag}`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: `${tagLabel} Blog Articles`,
            description: `AltFTool blog archive for articles tagged ${tagLabel}.`,
          }),
          createItemListJsonLd({
            path,
            name: `${tagLabel} tagged articles`,
            items: tagPosts.slice(0, 24).map((post) => ({
              name: post.heading,
              path: `/blogs/${post.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
            { name: tagLabel, path },
          ]),
        ]}
      />
      <BlogArchivePage
        eyebrow="Blog tag"
        title={`${tagLabel} Articles`}
        description={`A focused AltFTool archive for ${tagLabel}. Use it to move between related guides without losing context.`}
        posts={tagPosts}
        activeLabel={tagLabel}
        archiveType="tag"
        relatedLabels={tags}
      />
    </>
  );
}
