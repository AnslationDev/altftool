import { createPageMetadata } from "@/platform/seo/generateMetadata";

function titleCase(value = "") {
  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function generateMetadata({ params }) {
  const { section } = await params;
  const label = titleCase(section || "guides");
  const path = `/blogs/view-all/${section}`;

  return createPageMetadata({
    title: `${label} Blog Archive`,
    // The old wording appended a noun that the section label already ends with:
    // "tool-guides" rendered "Browse more tool guides guides and articles" and
    // "trending-articles" rendered "...trending articles and articles". Naming
    // the label once and calling the page an archive works for every section.
    // No ordering claim: only "latest-blogs" and the default branch sort by
    // createdAt desc. "tool-guides" has no orderBy at all and
    // "trending-articles" sorts by view count (see ./page.jsx), so "newest
    // first" would be false on two of the three sections.
    description: `Browse the ${label.toLowerCase()} archive: every post AltFTool has published in this section of the blog, in one place.`,
    path,
    noindex: true,
    follow: true,
    pageType: "blog-archive",
  });
}

export default function BlogArchiveLayout({ children }) {
  return children;
}
