import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Free Online Calculators — Finance, Health, Math & More",
    description:
      "A clean, fast and fully private suite of online calculators: loan/EMI, compound interest, BMI, percentage, unit conversion, date & time and more. Runs entirely in your browser.",
    path: "/altfcalculators",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
