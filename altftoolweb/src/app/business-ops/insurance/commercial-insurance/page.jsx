import InsuranceRoute from "@/app/business-ops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/business-ops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("commercial-insurance");

export default function CommercialInsurancePage() {
  return <InsuranceRoute slug="commercial-insurance" />;
}
