import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "WindowSwap All-Access Preview – Not Yet Available",
    description:
      "Preview possible WindowSwap features. Memberships, billing, waitlists, and creator payouts are not available.",
    path: "/windowswap/pricing",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
