import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { id } = await params;

  return {
    ...createPageMetadata({
      title: `Personality Test Question ${id}`,
      description: "Answer a short AltFTool personality test question and continue your private assessment.",
      path: `/personality/question/${id}`,
    }),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function PersonalityQuestionLayout({ children }) {
  return children;
}
