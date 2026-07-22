import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("bad-credit-loan");

export default function BadCreditLoanPage() {
  return <LoanRoute slug="bad-credit-loan" />;
}
