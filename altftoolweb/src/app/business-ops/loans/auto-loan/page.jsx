import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("auto-loan");

export default function AutoLoanPage() {
  return <LoanRoute slug="auto-loan" />;
}
