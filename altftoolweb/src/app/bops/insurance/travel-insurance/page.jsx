import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("travel-insurance");

export default function TravelInsurancePage() {
  return <InsuranceRoute slug="travel-insurance" />;
}
