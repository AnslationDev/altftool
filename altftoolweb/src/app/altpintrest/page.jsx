import PageView from "./PageView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

// One source for the metadata and the JSON-LD so the snippet and the schema
// cannot describe the page differently.
const TITLE = "AltPinterest – Discover & Save Visual Inspiration";
const DESCRIPTION =
  "Browse a masonry feed of AI tools, websites, prompts, and ideas on AltPinterest, then save pins locally, download their images, or copy the AltPinterest page link.";

export async function generateMetadata() {
  return createPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/altpintrest",
  });
}

function PageHeading() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Discover and save visual inspiration with AltF Pinboard
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        Browse ideas, tools and designs, then save the pins worth revisiting.
      </p>
    </>
  );
}

export default function Page(props) {
  // CollectionPage + BreadcrumbList only. The client can read Firestore and
  // falls back to local starter pins, so the server cannot truthfully publish
  // a fixed ItemList. Pins open in a modal over this same page.
  return (
    <>
      <JsonLd
        id="altpintrest-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/altpintrest",
            name: "AltF Pinboard",
            description: DESCRIPTION,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "AltPinterest", path: "/altpintrest" },
          ]),
        ]}
      />
      <PageView {...props}>
        <PageHeading />
      </PageView>
    </>
  );
}
