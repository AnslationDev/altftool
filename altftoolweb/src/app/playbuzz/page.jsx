import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Fun Quizzes & Personality Tests",
    description:
      "Play fun quizzes and personality tests on AltFTool and discover something new about yourself with engaging, shareable results.",
    path: "/playbuzz",
    keywords: [
      "fun quizzes",
      "personality tests",
      "online quizzes",
      "trivia quiz",
      "quiz games",
      "shareable quiz results",
    ],
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
