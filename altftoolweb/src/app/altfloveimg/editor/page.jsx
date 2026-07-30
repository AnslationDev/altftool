import { createPageMetadata } from "@/platform/seo/generateMetadata";
import EditorClient from "./EditorClient";
import RelatedToolsBand from "../components/RelatedToolsBand";
import ToolSchema from "../components/ToolSchema";

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
      <ToolSchema slug="editor" />
      <EditorClient />
      <RelatedToolsBand slug="editor" />
    </>
  );
}
