import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import ConverterClient from "../components/shared/ConverterClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "PNG to JPG Converter — Free & In-Browser",
  description:
    "Convert PNG images to compact JPG files in your browser. Transparency is flattened onto a background, quality is adjustable, and batches download as a ZIP.",
  path: "/altfloveimg/png-to-jpg",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-png-to-jpg-jsonld" data={buildToolJsonLd("png-to-jpg")} />
      <ConverterClient slug="png-to-jpg" to="jpg" lossy={true} />
      <ToolFacts slug="png-to-jpg" />
      <RelatedToolsBand slug="png-to-jpg" />
    </>
  );
}
