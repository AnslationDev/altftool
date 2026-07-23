import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("life-insurance");

export default function LifeInsurancePage() {
  return <InsuranceRoute slug="life-insurance" />;
}
