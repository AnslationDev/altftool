import PixelThoughtMeditation from './components/PixelThoughtMeditation'
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Pixel Thought Meditation – Clear Your Mind | AltFTool",
    description:
      "Take a calming 60-second meditation break with Pixel Thought on AltFTool. Release a worry and refocus your mind.",
    path: "/pixel-thought/meditation",
  });
}

export default function MeditationPage() {
  return <PixelThoughtMeditation />
}
