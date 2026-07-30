import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Siding & Exterior Services",
    description:
      "Professional siding and home exterior services: browse project galleries and before-and-after results, read customer reviews and request a free estimate.",
    path: "/siding",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
