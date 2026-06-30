import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Smart Link | AltFTool",
    description:
      "AltFTool smart link redirect handler that routes visitors to the requested destination based on the selected mode.",
    path: "/smartlink",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
