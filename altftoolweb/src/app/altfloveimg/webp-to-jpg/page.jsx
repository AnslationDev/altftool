import { createPageMetadata } from "@/platform/seo/generateMetadata";
import ConverterClient from "../components/shared/ConverterClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "WEBP to JPG Converter",
  description: "Convert WEBP images to widely supported JPG files in your browser. Batch convert, adjust quality and download. Free and private.",
  path: "/altfloveimg/webp-to-jpg",
});
}

export default function Page() {
  return (
    <>
      <ConverterClient slug="webp-to-jpg" to="jpg" lossy={true} />
      <RelatedToolsBand slug="webp-to-jpg" />
    </>
  );
}
