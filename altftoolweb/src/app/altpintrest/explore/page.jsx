import PageView from "../PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Explore Pins – AltPinterest",
    description:
      "Explore and discover visual inspiration, AI tools, designs, and ideas on AltPinterest.",
    path: "/altpintrest/explore",
  });
}

export default function ExplorePage(props) {
  return (
    <>
      {/* Same gap as /altpintrest: the explore feed renders no heading of its
          own, so the route supplies the document's single H1 server-side. */}
      <h1 className="sr-only">Explore pins — visual ideas, tools and designs</h1>
      <PageView {...props} defaultView="explore" />
    </>
  );
}
