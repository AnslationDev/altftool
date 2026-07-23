import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("student-loan-refinance");

export default function StudentLoanRefinancePage() {
  return <LoanRoute slug="student-loan-refinance" />;
}
