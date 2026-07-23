import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("health-insurance");

export default function HealthInsurancePage() {
  return <InsuranceRoute slug="health-insurance" />;
}
