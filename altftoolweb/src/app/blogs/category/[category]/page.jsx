import BlogArchivePage from "../../components/BlogArchivePage";
import JsonLd from "@/platform/seo/JsonLd";
import {
  blogTaxonomySlug,
  filterBlogsByCategorySlug,
  getAllBlogs,
  getBlogCategories,
  getBlogCategoryBySlug,
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
  return getBlogCategories()
    .filter((category) => category !== "All")
    .map((category) => ({ category: blogTaxonomySlug(category) }));
}

async function getMergedPosts() {
  const firebaseCatalog = await getFirebaseBlogCatalog().catch(() => ({
    posts: [],
  }));

  return mergeBlogPosts(getAllBlogs(), firebaseCatalog.posts);
}

async function getCategoryArchive(categorySlug) {
  const posts = await getMergedPosts();
  const categoryLabel =
    getBlogCategoryBySlug(categorySlug, posts) || getBlogCategoryBySlug(categorySlug);
  const categoryPosts = sortBlogsByDate(
    filterBlogsByCategorySlug(posts, categorySlug),
  );

  return {
    posts,
    categoryLabel,
    categoryPosts,
  };
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const { categoryLabel, categoryPosts } = await getCategoryArchive(category);

  return createPageMetadata({
    title: `${categoryLabel} Articles - AltFTool Blog`,
    description: `Read ${categoryPosts.length || "curated"} AltFTool blog articles about ${categoryLabel}, including practical guides, comparisons, and digital workflows.`,
    path: `/blogs/category/${category}`,
    image: categoryPosts[0]?.image,
    keywords: [categoryLabel, "AltFTool blog", `${categoryLabel} guides`],
  });
}

export default async function BlogCategoryPage({ params }) {
  const { category } = await params;
  const { posts, categoryLabel, categoryPosts } = await getCategoryArchive(category);
  const categories = getBlogCategories(posts).filter((item) => item !== "All");
  const path = `/blogs/category/${category}`;

  return (
    <>
      <JsonLd
        id={`blog-category-schema-${category}`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: `${categoryLabel} Articles`,
            description: `AltFTool blog archive for ${categoryLabel}.`,
          }),
          createItemListJsonLd({
            path,
            name: `${categoryLabel} blog articles`,
            items: categoryPosts.slice(0, 24).map((post) => ({
              name: post.heading,
              path: `/blogs/${post.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
            { name: categoryLabel, path },
          ]),
        ]}
      />
      <BlogArchivePage
        eyebrow="Blog category"
        title={`${categoryLabel} Articles`}
        description={`Browse practical AltFTool reads in ${categoryLabel}. These articles are organized for faster discovery and stronger internal navigation.`}
        posts={categoryPosts}
        activeLabel={categoryLabel}
        relatedLabels={categories}
      />
    </>
  );
}
