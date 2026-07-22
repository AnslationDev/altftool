import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("auto-refinance");

export default function AutoRefinancePage() {
  return <LoanRoute slug="auto-refinance" />;
}
