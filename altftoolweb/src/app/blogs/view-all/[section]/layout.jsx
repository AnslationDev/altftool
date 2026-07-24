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
    description: `Browse more ${label.toLowerCase()} guides and articles from the AltFTool editorial library.`,
    path,
    noindex: true,
    follow: true,
    pageType: "blog-archive",
  });
}

export default function BlogArchiveLayout({ children }) {
  return children;
}
