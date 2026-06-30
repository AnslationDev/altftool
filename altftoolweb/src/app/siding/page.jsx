import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Siding & Exterior Services | AltFTool",
    description:
      "Explore professional siding and home exterior services with project galleries, before-and-after results, customer testimonials, service areas, and free estimates.",
    path: "/siding",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
