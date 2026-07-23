import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Flight Search Results | TripFindBox",
    description: "Compare flight options, fares, and routes from your TripFindBox search and select the best trip.",
    path: "/bops/tripfindbox/search/results",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
