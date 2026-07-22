import InsuranceRoute from "@/app/business-ops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/business-ops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("health-insurance");

export default function HealthInsurancePage() {
  return <InsuranceRoute slug="health-insurance" />;
}
