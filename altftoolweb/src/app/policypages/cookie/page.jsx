import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Cookie Policy | AltFTool",
    description:
      "Read the AltF Tools Cookie Policy explaining how cookies and similar technologies are used across our website, tools, and services, and how you can manage them.",
    path: "/policypages/cookie",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
