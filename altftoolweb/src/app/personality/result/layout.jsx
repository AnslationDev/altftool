import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "../personality.css";

export async function generateMetadata() {
  return {
    ...(await createPageMetadata({
      title: "Personality Test Result",
      description: "View four locally calculated directional scores from AltFTool's four-question self-reflection exercise.",
      path: "/personality/result",
    })),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function PersonalityResultLayout({ children }) {
  return children;
}
