import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "WindowSwap Local Gift Draft Preview",
    description:
      "Save a private WindowSwap gift idea in this browser. No subscription, payment, email, or gift delivery is available.",
    path: "/windowswap/sendGift",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
