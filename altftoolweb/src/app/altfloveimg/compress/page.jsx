import { createPageMetadata } from "@/platform/seo/generateMetadata";
import CompressClient from "./CompressClient";
import RelatedToolsBand from "../components/RelatedToolsBand";
import ToolSchema from "../components/ToolSchema";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Compress Image — JPG, PNG & WEBP",
  description:
    "Compress JPG, PNG and WEBP images in your browser. Adjust quality, batch process and download a ZIP. Private, fast and free.",
  path: "/altfloveimg/compress",
});
}

export default function Page() {
  return (
    <>
      <ToolSchema slug="compress" />
      <CompressClient />
      <RelatedToolsBand slug="compress" />
    </>
  );
}
