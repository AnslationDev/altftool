import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Contact Us",
    description:
      "Get in touch with AltF Tools. Send questions, feedback, bug reports, or feature requests — most messages are answered within 24–48 hours.",
    path: "/policypages/contact",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
