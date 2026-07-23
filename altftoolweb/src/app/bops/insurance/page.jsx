import BizCollection from "../components/BizCollection";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Insurance Guides and Coverage Comparisons",
  description:
    "Explore auto, home, health, life, travel, pet, and business insurance with clear coverage guides.",
  path: "/bops/insurance",
  keywords: ["insurance comparison", "auto insurance", "home insurance", "life insurance"],
});

export default function InsurancePage() {
  return <BizCollection slug="insurance" />;
}
