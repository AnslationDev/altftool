import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("business-loan");

export default function BusinessLoanPage() {
  return <LoanRoute slug="business-loan" />;
}
