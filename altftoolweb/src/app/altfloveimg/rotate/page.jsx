import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import RotateClient from "./RotateClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Rotate & Flip Image — Free Online Tool",
  description:
    "Rotate images by 90°, 180° or 270° and flip them horizontally or vertically. Instant preview and download, fully in your browser with no uploads. Free.",
  path: "/altfloveimg/rotate",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-rotate-jsonld" data={buildToolJsonLd("rotate")} />
      <RotateClient />
      <ToolFacts slug="rotate" />
      <RelatedToolsBand slug="rotate" />
    </>
  );
}
