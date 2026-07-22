import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { SIGNAL_CATALOG } from "@altftool/core/signals";
import SignalsExplorer from "./SignalsExplorer";

const description =
  "Explore worldwide product demand, momentum, competition, and opportunity research with practical next steps and connected AltFTool utilities.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltF Signals - Worldwide Product and Search Opportunities",
    description,
    path: "/signals",
    keywords: ["product trends", "search demand", "startup opportunities", "market signals"],
  });
}

export default function SignalsPage() {
  return (
    <>
      <JsonLd
        id="altf-signals-schema"
        data={[
          createCollectionPageJsonLd({ path: "/signals", name: "AltF Signals", description }),
          createItemListJsonLd({
            path: "/signals",
            name: "AltF Signals opportunity research",
            items: SIGNAL_CATALOG.map((signal) => ({ name: signal.name, path: `/signals/${signal.slug}` })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Signals", path: "/signals" },
          ]),
        ]}
      />
      <SignalsExplorer />
    </>
  );
}
