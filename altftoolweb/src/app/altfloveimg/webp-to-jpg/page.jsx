import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import ConverterClient from "../components/shared/ConverterClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "WEBP to JPG Converter — Free & In-Browser",
  description: "Convert WEBP images to widely supported JPG files in your browser. Batch convert, adjust quality and download. Free and private.",
  path: "/altfloveimg/webp-to-jpg",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-webp-to-jpg-jsonld" data={buildToolJsonLd("webp-to-jpg")} />
      <ConverterClient slug="webp-to-jpg" to="jpg" lossy={true} />
      <ToolFacts slug="webp-to-jpg" />
      <RelatedToolsBand slug="webp-to-jpg" />
    </>
  );
}
