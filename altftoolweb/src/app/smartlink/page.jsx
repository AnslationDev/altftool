import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

// This route is retired: it no longer redirects anywhere and has no content of
// its own, so it stays noindex/nofollow here and remains deliberately absent
// from src/app/sitemap.js.
export async function generateMetadata() {
  return createPageMetadata({
    title: "Smart Link",
    description:
      "This AltFTool smart link is no longer active.",
    path: "/smartlink",
    noindex: true,
    follow: false,
  });
}

export default function Page() {
  return <PageView />;
}
