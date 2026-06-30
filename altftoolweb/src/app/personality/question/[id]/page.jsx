import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return createPageMetadata({
    title: `Personality Test Question ${id} | AltFTool`,
    description:
      "Answer this personality test question on AltFTool to continue your assessment and discover your personality type.",
    path: `/personality/question/${id}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
