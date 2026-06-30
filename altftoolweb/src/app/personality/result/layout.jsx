import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return {
    ...(await createPageMetadata({
      title: "Personality Test Result",
      description: "View your private AltFTool personality test completion summary and next steps.",
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
