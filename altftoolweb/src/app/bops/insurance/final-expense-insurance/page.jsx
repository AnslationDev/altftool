import InsuranceRoute from "@/app/bops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/bops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("final-expense-insurance");

export default function FinalExpenseInsurancePage() {
  return <InsuranceRoute slug="final-expense-insurance" />;
}
