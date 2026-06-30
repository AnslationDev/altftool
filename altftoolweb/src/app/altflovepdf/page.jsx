import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Online PDF Converter — Free PDF Tools",
    description:
      "Easily convert to and from PDF in seconds. Merge, split, compress, rotate, protect and unlock PDFs online for free.",
    path: "/altflovepdf",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
