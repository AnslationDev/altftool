import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("small-business-insurance");

export default function SmallBusinessInsurancePage() {
  return <InsuranceRoute slug="small-business-insurance" />;
}
