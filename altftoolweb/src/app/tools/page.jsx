import MicrotoolClient from "./MicrotoolClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Micro Tools – 100+ Free Daily Use Online Tools",
    description:
      "Access 100+ free micro tools for everyday tasks including calculators, converters, generators, and productivity utilities on AltFTool.",
    path: "/tools",
  });
}

export default function Page() {
  return <MicrotoolClient />;
}
