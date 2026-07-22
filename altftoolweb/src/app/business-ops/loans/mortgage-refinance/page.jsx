import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("mortgage-refinance");

export default function MortgageRefinancePage() {
  return <LoanRoute slug="mortgage-refinance" />;
}
