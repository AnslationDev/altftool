import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "No Flights Found | TripFindBox",
    description: "No matching flights were found. Modify your search or contact TripFindBox agents for help finding the best route.",
    path: "/bops/tripfindbox/search/no-results",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
