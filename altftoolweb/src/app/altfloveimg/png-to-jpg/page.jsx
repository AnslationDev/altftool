import { createPageMetadata } from "@/platform/seo/generateMetadata";
import ConverterClient from "../components/shared/ConverterClient";

export const metadata = createPageMetadata({
  title: "PNG to JPG Converter",
  description: "Convert PNG images to compact JPG files in your browser. Adjust quality, batch convert and download. Free and private.",
  path: "/altfloveimg/png-to-jpg",
});

export default function Page() {
  return <ConverterClient slug="png-to-jpg" to="jpg" lossy={true} />;
}
