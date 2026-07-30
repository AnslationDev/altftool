import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Disclaimer",
    description:
      "The AltF Tools disclaimer: our tools, calculators and articles are published for general information only, on an as-is basis, and are not professional advice.",
    path: "/policypages/disclaimer",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
