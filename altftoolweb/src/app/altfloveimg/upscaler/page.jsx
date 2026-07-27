import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import UpscalerClient from "./UpscalerClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  // Not billed as "AI": the engine is canvas resampling + an unsharp pass
  // (see ../lib/aiEngines.js), not a super-resolution model.
  title: "Image Upscaler — Enlarge Images 2×, 3× or 4×",
  description:
    "Enlarge images 2×, 3× or 4× in your browser with high-quality resampling and adjustable sharpening. Compare before and after, then download. Free, no uploads.",
  path: "/altfloveimg/upscaler",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-upscaler-jsonld" data={buildToolJsonLd("upscaler")} />
      <UpscalerClient />
      <ToolFacts slug="upscaler" />
      <RelatedToolsBand slug="upscaler" />
    </>
  );
}
