import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import ConverterClient from "../components/shared/ConverterClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "JPG to WEBP Converter — Free & In-Browser",
  description: "Convert JPG images to next-gen WEBP for dramatically smaller files. Adjust quality, batch convert and download. Free and private.",
  path: "/altfloveimg/jpg-to-webp",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-jpg-to-webp-jsonld" data={buildToolJsonLd("jpg-to-webp")} />
      <ConverterClient slug="jpg-to-webp" to="webp" lossy={true} />
      <ToolFacts slug="jpg-to-webp" />
      <RelatedToolsBand slug="jpg-to-webp" />
    </>
  );
}
