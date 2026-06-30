import { createPageMetadata } from "@/platform/seo/generateMetadata";
import ConverterClient from "../components/shared/ConverterClient";

export async function generateMetadata() {
  return createPageMetadata({
  title: "JPG to PNG Converter",
  description: "Convert JPG images to lossless PNG in your browser. Batch convert and download a ZIP. Free and private.",
  path: "/altfloveimg/jpg-to-png",
});
}

export default function Page() {
  return <ConverterClient slug="jpg-to-png" to="png" lossy={false} />;
}
