import { StudioShell } from "../components/studio/studio-shell";

export const metadata = {
  title: "Studio — Img Prompt | AltFTool",
  description: "Generate, score and optimize AI prompts across 30+ tools and 100+ categories.",
};

export default function StudioLayout({ children }) {
  return <StudioShell>{children}</StudioShell>;
}
