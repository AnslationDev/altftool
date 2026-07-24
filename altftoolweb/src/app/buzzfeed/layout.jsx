import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "AltF Pulse | Stories, Quizzes and Culture",
  description: "Browse quick stories, playful quizzes, and culture picks in the AltF Pulse editorial feed.",
  path: "/buzzfeed",
  keywords: ["culture stories", "online quizzes", "internet culture", "AltF Pulse"],
  pageType: "editorial",
});

export default function AltFPulseLayout({ children }) {
  return children;
}
