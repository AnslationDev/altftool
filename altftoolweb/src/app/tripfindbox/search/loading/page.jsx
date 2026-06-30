import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Searching Flights | TripFindBox",
    description: "TripFindBox is scanning live airline availability to build your best route options.",
    path: "/tripfindbox/search/loading",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
