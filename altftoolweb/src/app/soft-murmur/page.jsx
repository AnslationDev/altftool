import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Soft Murmur – Ambient Sound Mixer | AltFTool",
    description:
      "Mix ambient background sounds like rain, waves, wind, and white noise to create your own calming soundscape for focus, relaxation, and sleep.",
    path: "/soft-murmur",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
