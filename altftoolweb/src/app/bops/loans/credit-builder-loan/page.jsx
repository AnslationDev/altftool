import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("credit-builder-loan");

export default function CreditBuilderLoanPage() {
  return <LoanRoute slug="credit-builder-loan" />;
}
