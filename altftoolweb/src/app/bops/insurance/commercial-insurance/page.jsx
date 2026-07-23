import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("commercial-insurance");

export default function CommercialInsurancePage() {
  return <InsuranceRoute slug="commercial-insurance" />;
}
