import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { TOOLS } from "./toolsData";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Online PDF Converter — Free PDF Tools",
    description:
      "Easily convert to and from PDF in seconds. Merge, split, compress, rotate, protect and unlock PDFs online for free.",
    path: "/altflovepdf",
  });
}

export default function Page(props) {
  // The hub listed every tool on screen but described itself to a crawler as an
  // undifferentiated page — no CollectionPage, no ItemList — while its own
  // /altflovepdf/[toolSlug] detail routes have emitted SoftwareApplication and
  // BreadcrumbList all along. The item list is built from TOOLS in
  // ./toolsData, the same array the detail routes resolve against, so the
  // markup cannot drift from what the page actually links to.
  const items = TOOLS.map((tool) => ({
    name: tool.name,
    path: `/altflovepdf/${tool.slug}`,
    description: tool.desc,
  }));

  return (
    <>
      <JsonLd
        id="altflovepdf-hub-schema"
        data={[
          createCollectionPageJsonLd({
            name: "Free Online PDF Tools",
            description: "Every PDF tool on AltFTool, covering merge, split, convert, compress, and page and metadata editing.",
            path: "/altflovepdf",
          }),
          createItemListJsonLd({ path: "/altflovepdf", items }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Free Online PDF Tools", path: "/altflovepdf" },
          ]),
        ]}
      />
      <PageView {...props} />
    </>
  );
}
