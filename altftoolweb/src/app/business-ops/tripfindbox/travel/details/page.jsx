import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Travel Details | TripFindBox",
    description: "Review your selected flight route, fare, and baggage details before continuing to booking on TripFindBox.",
    path: "/business-ops/tripfindbox/travel/details",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
