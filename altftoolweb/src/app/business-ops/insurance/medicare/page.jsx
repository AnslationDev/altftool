import InsuranceRoute from "@/app/business-ops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/business-ops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("medicare");

export default function MedicarePage() {
  return <InsuranceRoute slug="medicare" />;
}
