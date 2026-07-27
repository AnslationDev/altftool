import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

// This route serves a crawler a "Loading..." shell while sending a real visitor
// to a third-party ad network (see PageView.jsx). That asymmetry is cloaking,
// so the page must never be offered to search engines: it is noindex/nofollow
// here and is deliberately absent from src/app/sitemap.js.
export async function generateMetadata() {
  return createPageMetadata({
    title: "Smart Link",
    description:
      "AltFTool smart link redirect handler that routes visitors to the requested destination based on the selected mode.",
    path: "/smartlink",
    noindex: true,
    follow: false,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
