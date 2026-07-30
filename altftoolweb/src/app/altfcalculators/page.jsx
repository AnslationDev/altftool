import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Free Online Calculators — Finance, Health & Math",
    description:
      "A fast, fully private suite of 100+ free online calculators for loan and EMI, compound interest, BMI, percentage, unit conversion, date and time, and more.",
    path: "/altfcalculators",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
