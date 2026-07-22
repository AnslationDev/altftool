import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Personality Test Result",
    description:
      "View your completed AltFTool personality test result, including how many questions you answered and your assessment completion rate.",
    path: "/personality/result",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
