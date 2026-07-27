import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import { TOOLS } from "./toolsData";
import { buildHubJsonLd } from "./seo";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Online PDF Converter — Free PDF Tools",
    description: `Merge, split, compress, convert, protect and edit PDFs with ${TOOLS.length} free tools that run in your browser. No upload, no account, no watermark.`,
    path: "/altflovepdf",
  });
}

export default function Page(props) {
  return (
    <>
      <JsonLd id="altflovepdf-hub-jsonld" data={buildHubJsonLd()} />
      <PageView {...props} />
    </>
  );
}
