import { createPageMetadata } from "@/platform/seo/generateMetadata";
import UpscalerClient from "./UpscalerClient";
import RelatedToolsBand from "../components/RelatedToolsBand";
import ToolSchema from "../components/ToolSchema";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Image Upscaler — Enhance & Enlarge",
  description:
    "Upscale and sharpen images up to 4× on your device. Compare before and after, then download. Private, no uploads, free.",
  path: "/altfloveimg/upscaler",
});
}

export default function Page() {
  return (
    <>
      <ToolSchema slug="upscaler" />
      <UpscalerClient />
      <RelatedToolsBand slug="upscaler" />
    </>
  );
}
