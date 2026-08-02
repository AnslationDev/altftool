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

// Same reason as /altpintrest: PageView is a client tree whose only h1 elements
// sit behind a pin click or the Saved tab, so the feed a crawler actually
// fetches carried none. Built here in the server component and passed down as
// children, and worded for the feed rather than the landing page so the two
// routes do not share one heading. Name per experienceCatalog.js.
function PageHeading() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Explore pins on AltF Pinboard
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        Filter the feed by category or search it, then save the pins worth
        coming back to.
      </p>
    </>
  );
}

export default function ExplorePage(props) {
  return (
    <PageView {...props} defaultView="explore">
      <PageHeading />
    </PageView>
  );
}
