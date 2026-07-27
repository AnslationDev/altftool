import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import CompressClient from "./CompressClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Compress Image — JPG, PNG & WEBP",
  description:
    "Compress JPG, PNG and WEBP images in your browser. Adjust quality, batch process and download a ZIP. Private, fast and free.",
  path: "/altfloveimg/compress",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-compress-jsonld" data={buildToolJsonLd("compress")} />
      <CompressClient />
      <ToolFacts slug="compress" />
      <RelatedToolsBand slug="compress" />
    </>
  );
}
