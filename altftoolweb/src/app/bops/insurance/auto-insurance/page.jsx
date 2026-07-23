import AutoInsuranceClient from "./AutoInsuranceClient";
import "./auto-insurance.css";

export const metadata = {
  title: "Texas Auto Insurance Quotes | Save Up To $800 Per Year",
  description:
    "Compare auto insurance quotes from multiple top-rated carriers. Texas drivers can check potential savings in minutes with no obligation.",
  alternates: {
    canonical: "/Auto-Insurance",
  },
  openGraph: {
    title: "Texas Drivers Could Save Up To $800 Per Year On Auto Insurance",
    description:
      "Fast auto insurance comparison for Texas, Florida, and California drivers. Get a free quote and compare multiple carrier options.",
    type: "website",
  },
};

export default function AutoInsurancePage() {
  return <AutoInsuranceClient />;
}
