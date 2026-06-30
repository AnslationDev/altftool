import { createPageMetadata } from "@/platform/seo/generateMetadata";
import FullscrnClient from "./FullscrnClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Fullscreen Text Display | AltFTool",
    description:
      "Type text and display it fullscreen with custom font size, colors, and alignment. A simple distraction-free fullscreen text and presentation tool.",
    path: "/fullscrn",
  });
}

export default function Page() {
  return (
    <main>
      <FullscrnClient />
    </main>
  );
}