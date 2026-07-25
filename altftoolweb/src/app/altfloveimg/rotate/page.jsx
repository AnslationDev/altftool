import { createPageMetadata } from "@/platform/seo/generateMetadata";
import RotateClient from "./RotateClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Rotate & Flip Image",
  description:
    "Rotate images by 90°, 180° or 270° and flip horizontally or vertically. Instant preview and download, fully in-browser.",
  path: "/altfloveimg/rotate",
});
}

export default function Page() {
  return (
    <>
      <RotateClient />
      <RelatedToolsBand slug="rotate" />
    </>
  );
}
