import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import CropClient from "./CropClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Crop Image — Free & Social Media Presets",
  description:
    "Crop images freely or with Instagram, Facebook, LinkedIn and YouTube presets. Interactive crop frame, instant download, all in your browser.",
  path: "/altfloveimg/crop",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-crop-jsonld" data={buildToolJsonLd("crop")} />
      <CropClient />
      <ToolFacts slug="crop" />
      <RelatedToolsBand slug="crop" />
    </>
  );
}
