import { createPageMetadata } from "@/platform/seo/generateMetadata";
import BackgroundRemoverClient from "./BackgroundRemoverClient";
import RelatedToolsBand from "../components/RelatedToolsBand";
import ToolSchema from "../components/ToolSchema";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Background Remover — Transparent PNG",
  description:
    "Remove image backgrounds automatically on your device and export a transparent PNG. Private, no uploads, free.",
  path: "/altfloveimg/background-remover",
});
}

export default function Page() {
  return (
    <>
      <ToolSchema slug="background-remover" />
      <BackgroundRemoverClient />
      <RelatedToolsBand slug="background-remover" />
    </>
  );
}
