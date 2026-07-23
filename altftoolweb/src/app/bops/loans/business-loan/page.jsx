import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("business-loan");

export default function BusinessLoanPage() {
  return <LoanRoute slug="business-loan" />;
}
