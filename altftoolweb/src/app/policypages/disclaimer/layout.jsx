import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "Disclaimer",
    description:
      "Read the AltFTool disclaimer covering the accuracy, intended use, and limitations of the information, tools, and recommendations provided on our website.",
    path: "/policypages/disclaimer",
  });
}

export default function DisclaimerPolicyLayout({ children }) {
  return children;
}
