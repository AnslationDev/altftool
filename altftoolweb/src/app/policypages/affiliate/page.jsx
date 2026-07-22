import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Affiliate Disclosure",
    description:
      "Read the AltF Tools Affiliate Disclosure explaining how affiliate links and partnerships are used, with full editorial integrity and no extra cost to users.",
    path: "/policypages/affiliate",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
