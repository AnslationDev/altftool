import AutoInsuranceClient from "./AutoInsuranceClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "./auto-insurance.css";

export const metadata = createPageMetadata({
  title: "Compare Auto Insurance Coverage and Costs",
  description:
    "Compare auto insurance coverage options, common discounts, cost factors, and quote considerations before choosing a policy.",
  path: "/bops/insurance/auto-insurance",
  keywords: [
    "auto insurance",
    "car insurance comparison",
    "auto insurance coverage",
    "car insurance costs",
  ],
  pageType: "business-ops-insurance",
});

export default function AutoInsurancePage() {
  return <AutoInsuranceClient />;
}
