import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltPinterest – Discover & Save Visual Inspiration",
    description:
      "Browse a masonry feed of AI tools, websites, prompts, and ideas on AltPinterest, then save, download, and share the pins you love.",
    path: "/altpintrest",
  });
}

// The whole microsite below this file is one "use client" tree, and until now
// the only h1 elements in it (PageView.jsx: the pin-detail title and "Your
// saved Ideas") lived behind post-click state, so the landing tree topped out
// at h2 and the route served zero h1. This heading is built in the server
// component and handed to the client tree as children, so it is in the HTML a
// crawler receives no matter what the Firestore pin/category subscriptions do.
// "AltF Pinboard" is the name packages/core/src/experienceCatalog.js publishes
// for this route on /labs and in site search; the visible wordmark and the
// title tag still say "AltPinterest" (see the report note).
//
// Only the text is passed down. Landing and feed each wrap it in their own
// container, because "Enter Feed" swaps the two branches client-side without a
// navigation and a wrapper baked in here would carry the wrong padding across.
function PageHeading() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        AltF Pinboard: discover and save visual inspiration
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        A masonry feed of AI tools, websites, prompts, and design ideas. Open a
        pin to see it full size, then save, download, or share it.
      </p>
    </>
  );
}

export default function Page(props) {
  return (
    <PageView {...props}>
      <PageHeading />
    </PageView>
  );
}
