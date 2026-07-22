import InsuranceRoute from "@/app/business-ops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/business-ops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("home-insurance");

export default function HomeInsurancePage() {
  return <InsuranceRoute slug="home-insurance" />;
}
