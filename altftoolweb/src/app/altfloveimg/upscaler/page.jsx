import { createPageMetadata } from "@/platform/seo/generateMetadata";
import UpscalerClient from "./UpscalerClient";

export const metadata = createPageMetadata({
  title: "AI Image Upscaler — Enhance & Enlarge",
  description:
    "Upscale and sharpen images up to 4× on your device. Compare before and after, then download. Private, no uploads, free.",
  path: "/altfloveimg/upscaler",
});

export default function Page() {
  return <UpscalerClient />;
}
