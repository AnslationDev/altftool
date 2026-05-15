import Personalitytestpage from "./pages/Personalitytestpage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Personality Test – Discover Your Personality Type | AltFTool",
    description:
      "Take the Personality Test on AltFTool to discover your personality type, strengths, behavior patterns, communication style, and personal growth insights.",
    path: "/personality",
    keywords: ["personality test", "personality type", "self assessment"],
  });
}

export default function Page() {
  return <Personalitytestpage />;
}
