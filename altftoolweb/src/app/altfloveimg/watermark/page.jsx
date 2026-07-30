import { createPageMetadata } from "@/platform/seo/generateMetadata";
import WatermarkClient from "./WatermarkClient";
import RelatedToolsBand from "../components/RelatedToolsBand";
import ToolSchema from "../components/ToolSchema";

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
      <ToolSchema slug="watermark" />
      <WatermarkClient />
      <RelatedToolsBand slug="watermark" />
    </>
  );
}
