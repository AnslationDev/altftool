import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return createPageMetadata({
    title: `Personality Test Question ${id}`,
    description:
      "Answer one question in AltFTool's four-question reflection and continue toward four directional trait scores.",
    path: `/personality/question/${id}`,
    noindex: true,
    follow: true,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
