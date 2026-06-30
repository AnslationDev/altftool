import { createPageMetadata } from "@/platform/seo/generateMetadata";
import EditorClient from "./EditorClient";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Image Editor — Brightness, Contrast & More",
  description:
    "Adjust brightness, contrast, saturation, exposure, blur and sharpen with a real-time preview. Free, private, in-browser image editing.",
  path: "/altfloveimg/editor",
});
}

export default function Page() {
  return <EditorClient />;
}
