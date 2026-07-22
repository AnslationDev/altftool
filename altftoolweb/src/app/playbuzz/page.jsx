import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Playbuzz – Fun Quizzes & Personality Tests",
    description:
      "Play fun quizzes and personality tests on Playbuzz and discover something new about yourself with engaging, shareable results.",
    path: "/playbuzz",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
