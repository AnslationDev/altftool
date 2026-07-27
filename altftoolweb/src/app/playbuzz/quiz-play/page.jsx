import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Play a Quiz – Fun Quizzes & Personality Tests",
    description:
      "Answer the questions and play your quiz to reveal fun, shareable personality results on AltFTool.",
    path: "/playbuzz/quiz-play",
    keywords: [
      "play quiz online",
      "personality test",
      "fun quiz",
      "quiz results",
    ],
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
