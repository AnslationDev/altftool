import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "AltF Reflex Lab | Reaction, Memory and Typing Tests",
  description: "Practice reaction time, memory, typing, aim, and visual sequence challenges with private local score history.",
  path: "/human-benchmark",
  keywords: ["reaction time test", "memory test", "typing test", "human benchmark"],
  pageType: "interactive-experience",
});

export default function ReflexLabLayout({ children }) {
  return children;
}
