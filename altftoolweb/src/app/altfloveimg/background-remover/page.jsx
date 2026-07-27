import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import BackgroundRemoverClient from "./BackgroundRemoverClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Background Remover — Free Transparent PNG Maker",
  description:
    "Remove an image background and export a transparent PNG. The segmentation model runs on your device with WebAssembly, so your photo is never uploaded. Free.",
  path: "/altfloveimg/background-remover",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-background-remover-jsonld" data={buildToolJsonLd("background-remover")} />
      <BackgroundRemoverClient />
      <ToolFacts slug="background-remover" />
      <RelatedToolsBand slug="background-remover" />
    </>
  );
}
