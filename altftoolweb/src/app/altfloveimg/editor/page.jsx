import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import EditorClient from "./EditorClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Image Editor — Brightness, Contrast & More",
  description:
    "Adjust brightness, contrast, saturation, exposure, blur and sharpen with a real-time preview. Free, private, in-browser image editing.",
  path: "/altfloveimg/editor",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-editor-jsonld" data={buildToolJsonLd("editor")} />
      <EditorClient />
      <ToolFacts slug="editor" />
      <RelatedToolsBand slug="editor" />
    </>
  );
}
