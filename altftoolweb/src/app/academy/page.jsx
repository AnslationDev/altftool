import AcademyClient from "./AcademyClient";


export async function generateMetadata() {
  return {
    title: "Academy – Learn Tools, Tech & Digital Skills",
    description:
      "Explore AltFTool Academy to learn digital tools, technology guides, and practical tutorials. Improve your productivity and skills with step-by-step learning resources.",
  };
}

export default function Page() {
  return <AcademyClient />;
}