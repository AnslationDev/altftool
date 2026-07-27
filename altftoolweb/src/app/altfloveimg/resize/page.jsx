import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import ResizeClient from "./ResizeClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Resize Image — Custom Dimensions & Scale",
  description:
    "Resize images by exact width and height, scale by percentage, or lock the aspect ratio. Live preview, instant download, fully in-browser.",
  path: "/altfloveimg/resize",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-resize-jsonld" data={buildToolJsonLd("resize")} />
      <ResizeClient />
      <ToolFacts slug="resize" />
      <RelatedToolsBand slug="resize" />
    </>
  );
}
