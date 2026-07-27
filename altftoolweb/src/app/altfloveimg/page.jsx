import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import HomeClient from "./components/home/HomeClient";
import { TOOLS } from "./data/tools";
import { buildHubJsonLd } from "./seo";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFLoveImg — Free In-Browser Image Tools",
    description: `Compress, resize, crop, rotate, convert, watermark and edit images with ${TOOLS.length} free tools that run in your browser. Nothing is uploaded and no account is needed.`,
    path: "/altfloveimg",
  });
}

export default function AltfLoveImgPage() {
  return (
    <>
      <JsonLd id="altfloveimg-hub-jsonld" data={buildHubJsonLd()} />
      <HomeClient />
    </>
  );
}
