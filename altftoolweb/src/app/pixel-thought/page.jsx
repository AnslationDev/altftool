import PixelThoughtMeditation from './meditation/components/PixelThoughtMeditation'
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Pixel Thought – 60-Second Mindfulness Break",
    description:
      "Clear your mind with Pixel Thought on AltFTool, a calming 60-second mindfulness exercise to let go of a worry and refocus.",
    path: "/pixel-thought",
  });
}

export default function PixelThoughtPage() {
  return <PixelThoughtMeditation />
}
