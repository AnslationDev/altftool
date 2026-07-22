import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Play Quiz – Playbuzz",
    description:
      "Answer the questions and play your Playbuzz quiz to reveal fun, shareable personality results on AltFTool.",
    path: "/playbuzz/quiz-play",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
