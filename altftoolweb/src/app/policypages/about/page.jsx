import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "About AltF Tools | AltFTool",
    description:
      "Learn about AltF Tools — a focused collection of fast, browser-based developer microtools built for real productivity with no sign-ups, bloat, or tracking.",
    path: "/policypages/about",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
