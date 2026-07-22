import InsuranceRoute from "@/app/business-ops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/business-ops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("pet-insurance");

export default function PetInsurancePage() {
  return <InsuranceRoute slug="pet-insurance" />;
}
