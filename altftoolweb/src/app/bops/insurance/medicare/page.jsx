import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("medicare");

export default function MedicarePage() {
  return <InsuranceRoute slug="medicare" />;
}
