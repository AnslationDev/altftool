import Personalitytestpage from "./pages/Personalitytestpage";

export async function generateMetadata() {
  return {
    title: "Personality Test – Discover Your Personality Type | AltFTool",
    description:
      "Take the Personality Test on AltFTool to discover your personality type, strengths, behavior patterns, communication style, and personal growth insights.",
  };
}

export default function Page() {
  return <Personalitytestpage />;
}