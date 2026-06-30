import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Privacy Policy | AltFTool",
    description:
      "Read the AltF Tools Privacy Policy to learn how information is collected, used, and safeguarded across our website, tools, blogs, and related services.",
    path: "/policypages/privacy",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
