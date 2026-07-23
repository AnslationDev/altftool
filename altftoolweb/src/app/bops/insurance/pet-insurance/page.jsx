import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("pet-insurance");

export default function PetInsurancePage() {
  return <InsuranceRoute slug="pet-insurance" />;
}
