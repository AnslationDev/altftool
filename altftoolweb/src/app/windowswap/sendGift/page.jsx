import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Gift WindowSwap All-Access",
    description:
      "Send a WindowSwap All-Access gift subscription with a custom message and share calming window views from around the world with someone special.",
    path: "/windowswap/sendGift",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
