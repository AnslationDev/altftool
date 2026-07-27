import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import ConverterClient from "../components/shared/ConverterClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "JPG to PNG Converter — Free & In-Browser",
  description:
    "Convert JPG photos to lossless PNG files in your browser. Convert a batch at once and download them as a ZIP. Free, no account, nothing uploaded.",
  path: "/altfloveimg/jpg-to-png",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-jpg-to-png-jsonld" data={buildToolJsonLd("jpg-to-png")} />
      <ConverterClient slug="jpg-to-png" to="png" lossy={false} />
      <ToolFacts slug="jpg-to-png" />
      <RelatedToolsBand slug="jpg-to-png" />
    </>
  );
}
