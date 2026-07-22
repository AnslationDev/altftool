import InsuranceRoute from "@/app/business-ops/insurance/_components/InsuranceRoute";
import { buildInsuranceMetadata } from "@/app/business-ops/insurance/_lib/metadata";

export const metadata = buildInsuranceMetadata("final-expense-insurance");

export default function FinalExpenseInsurancePage() {
  return <InsuranceRoute slug="final-expense-insurance" />;
}
