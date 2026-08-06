import MakerStudioClient from "./MakerStudioClient";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import {
  MAKER_STUDIO_DESCRIPTION,
  MAKER_STUDIO_NAME,
  MAKER_STUDIO_TOPICS,
} from "./seo";

/**
 * Server entry for /fodey-new. The studio itself is unchanged and now lives in
 * MakerStudioClient.jsx; this wrapper exists so the route can emit JSON-LD from
 * a server component.
 *
 * The nodes are here rather than in layout.jsx — which is where this route's
 * metadata lives — because layout.jsx also wraps /fodey-new/landing, and that
 * subroute is noindex (landing/layout.jsx). Schema belongs on the indexable
 * URL, not on the one that opted out of the index. Both files read the same
 * strings from ./seo, so the snippet and the schema stay in step.
 *
 * SoftwareApplication/WebApplication + BreadcrumbList.
 *
 * No ItemList of the six generators: components/TabNav.jsx switches them with
 * setActiveTab inside this one page, so none of them has a URL — every ListItem
 * would carry /fodey-new (the case /top10 documents). No rating, review or
 * download figure either: nothing on this route produces one.
 */
export default function Page() {
  return (
    <>
      <JsonLd
        id="fodey-new-schema"
        data={[
          createToolJsonLd({
            slug: "fodey-new",
            path: "/fodey-new",
            tool: {
              name: MAKER_STUDIO_NAME,
              description: MAKER_STUDIO_DESCRIPTION,
              category: ["Creative", "Generators"],
              topics: MAKER_STUDIO_TOPICS,
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: MAKER_STUDIO_NAME, path: "/fodey-new" },
          ]),
        ]}
      />
      <MakerStudioClient />
    </>
  );
}
