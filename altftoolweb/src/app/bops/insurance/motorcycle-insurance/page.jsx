import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("motorcycle-insurance");

export default function MotorcycleInsurancePage() {
  return <InsuranceRoute slug="motorcycle-insurance" />;
}
