import { createPageMetadata } from "@/platform/seo/generateMetadata";
import CropClient from "./CropClient";
import RelatedToolsBand from "../components/RelatedToolsBand";
import ToolSchema from "../components/ToolSchema";

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
      <ToolSchema slug="crop" />
      <CropClient />
      <RelatedToolsBand slug="crop" />
    </>
  );
}
