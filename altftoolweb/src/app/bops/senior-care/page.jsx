import BizCollection from "../components/BizCollection";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Senior Care — Assisted Living, Home Care & More",
  description:
    "Assisted living, in-home care, medical alert systems, stairlifts and memory care — compare trusted senior-care options.",
  path: "/bops/senior-care",
  keywords: ["senior care", "assisted living", "in-home care", "medical alert"],
});

export default function SeniorCarePage() {
  return <BizCollection slug="senior-care" />;
}
