import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("renters-insurance");

export default function RentersInsurancePage() {
  return <InsuranceRoute slug="renters-insurance" />;
}
