import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import WatermarkClient from "./WatermarkClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Watermark Image — Text & Logo",
  description:
    "Add text or image watermarks with full control over position, size, opacity and rotation. Tile or place precisely. In-browser and free.",
  path: "/altfloveimg/watermark",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-watermark-jsonld" data={buildToolJsonLd("watermark")} />
      <WatermarkClient />
      <ToolFacts slug="watermark" />
      <RelatedToolsBand slug="watermark" />
    </>
  );
}
