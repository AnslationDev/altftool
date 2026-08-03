import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "All Mockup Templates – Mockly Generators | AltFTool",
    description:
      "Browse all 66 Mockly mockup generators and jump straight into the editor to design realistic social media and system screenshots.",
    path: "/prank-socialmedia/templates",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
