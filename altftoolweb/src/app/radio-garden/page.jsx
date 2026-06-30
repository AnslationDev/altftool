import { createPageMetadata } from "@/platform/seo/generateMetadata";
import RadioGardenClient from "./RadioGardenClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "OpenAir Garden",
    description: "Explore live radio stations around the world on an interactive globe.",
    path: "/radio-garden",
  });
}

export default function RadioGardenPage() {
  return <RadioGardenClient />;
}
