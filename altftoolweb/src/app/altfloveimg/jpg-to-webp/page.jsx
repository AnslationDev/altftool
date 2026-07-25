import { createPageMetadata } from "@/platform/seo/generateMetadata";
import ConverterClient from "../components/shared/ConverterClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "JPG to WEBP Converter",
  description: "Convert JPG images to next-gen WEBP for dramatically smaller files. Adjust quality, batch convert and download. Free and private.",
  path: "/altfloveimg/jpg-to-webp",
});
}

export default function Page() {
  return (
    <>
      <ConverterClient slug="jpg-to-webp" to="webp" lossy={true} />
      <RelatedToolsBand slug="jpg-to-webp" />
    </>
  );
}
