import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("home-insurance");

export default function HomeInsurancePage() {
  return <InsuranceRoute slug="home-insurance" />;
}
