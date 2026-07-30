import { createPageMetadata } from "@/platform/seo/generateMetadata";
import ConverterClient from "../components/shared/ConverterClient";
import RelatedToolsBand from "../components/RelatedToolsBand";
import ToolSchema from "../components/ToolSchema";

export async function generateMetadata() {
  return createPageMetadata({
  title: "JPG to PNG Converter",
  description: "Convert JPG images to lossless PNG in your browser. Batch convert and download a ZIP. Free and private.",
  path: "/altfloveimg/jpg-to-png",
});
}

export default function Page() {
  return (
    <>
      <ToolSchema slug="jpg-to-png" />
      <ConverterClient slug="jpg-to-png" to="png" lossy={false} />
      <RelatedToolsBand slug="jpg-to-png" />
    </>
  );
}
