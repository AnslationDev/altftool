import InsuranceRoute from "@/app/business-ops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/business-ops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("travel-insurance");

export default function TravelInsurancePage() {
  return <InsuranceRoute slug="travel-insurance" />;
}
