import InsuranceRoute from "@/app/business-ops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/business-ops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("motorcycle-insurance");

export default function MotorcycleInsurancePage() {
  return <InsuranceRoute slug="motorcycle-insurance" />;
}
