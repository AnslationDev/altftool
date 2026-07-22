import InsuranceRoute from "@/app/business-ops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/business-ops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("life-insurance");

export default function LifeInsurancePage() {
  return <InsuranceRoute slug="life-insurance" />;
}
