import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("bad-credit-loan");

export default function BadCreditLoanPage() {
  return <LoanRoute slug="bad-credit-loan" />;
}
