import { createPageMetadata } from "@/platform/seo/generateMetadata";
import HomeClient from "./components/home/HomeClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFLoveImg — Free In-Browser Image Tools",
    description:
      "Compress, convert, resize, crop, rotate, watermark and edit images right in your browser. Private, fast and free image tools.",
    path: "/altfloveimg",
  });
}

export default function AltfLoveImgPage() {
  return <HomeClient />;
}
