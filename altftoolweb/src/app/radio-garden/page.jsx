import { createPageMetadata } from "@/platform/seo/generateMetadata";
import RadioGardenClient from "./RadioGardenClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "OpenAir Garden",
    description: "Explore live radio stations around the world on an interactive globe and tune in to broadcasts by location.",
    path: "/radio-garden",
  });
}

export default function RadioGardenPage() {
  return <RadioGardenClient />;
}
