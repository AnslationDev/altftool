import BizCollection from "../components/BizCollection";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Legal Services — Free Case Reviews & Attorneys",
  description:
    "From injury claims to immigration and estate planning — get a free, no-obligation case review from the right legal help.",
  path: "/bops/legal-services",
  keywords: ["legal help", "personal injury lawyer", "free case review", "immigration attorney"],
});

export default function LegalServicesPage() {
  return <BizCollection slug="legal-services" />;
}
