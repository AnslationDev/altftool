import { createPageMetadata } from "@/platform/seo/generateMetadata";

const DESCRIPTION =
  "Independent rankings for curious people, researched carefully and limited to eight.";

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const segments = Array.isArray(slug) ? slug : [slug];
  const suffix = segments
    .filter(Boolean)
    .map((segment) => encodeURIComponent(String(segment)))
    .join("/");

  return createPageMetadata({
    title: "TOP8 — Find less. Choose better.",
    description: DESCRIPTION,
    path: suffix ? `/top8/${suffix}` : "/top8",
    noindex: true,
    follow: true,
  });
}

export default function Top8CatchAllLayout({ children }) {
  return children;
}
