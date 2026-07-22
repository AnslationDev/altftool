import InsuranceRoute from "@/app/business-ops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/business-ops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("renters-insurance");

export default function RentersInsurancePage() {
  return <InsuranceRoute slug="renters-insurance" />;
}
