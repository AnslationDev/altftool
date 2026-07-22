import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Disclaimer",
    description:
      "Read the AltF Tools Disclaimer. Tools and content are provided for informational purposes only, on an as-is basis, with no professional advice and limited liability.",
    path: "/policypages/disclaimer",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
