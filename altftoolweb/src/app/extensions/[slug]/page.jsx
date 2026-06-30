import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return createPageMetadata({
    title: "Chrome Extension Details & Features | AltFTool Extensions",
    description:
      "View Chrome extension details, features, and information on AltFTool. Discover useful browser add-ons for productivity and more.",
    path: `/extensions/${slug}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
