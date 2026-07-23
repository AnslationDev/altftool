import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Booking Review | TripFindBox",
    description: "Review your selected flight and continue securely through the TripFindBox booking flow.",
    path: "/bops/tripfindbox/booking",
    noindex: true,
    follow: false,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
