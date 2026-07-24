import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Unsubscribe from Emails",
    description:
      "Unsubscribe from AltFTool email updates. Enter your email address to stop receiving newsletters and updates — no spam and no follow-ups.",
    path: "/unsubscribe",
    noindex: true,
    follow: false,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
