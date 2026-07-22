import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("student-loan-refinance");

export default function StudentLoanRefinancePage() {
  return <LoanRoute slug="student-loan-refinance" />;
}
