import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Terms & Conditions",
    description:
      "The AltF Tools terms and conditions covering access to our website, microtools and related services, including eligibility, acceptable use and liability.",
    path: "/policypages/termsandconditions",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
