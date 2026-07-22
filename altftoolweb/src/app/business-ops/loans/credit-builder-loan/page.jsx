import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("credit-builder-loan");

export default function CreditBuilderLoanPage() {
  return <LoanRoute slug="credit-builder-loan" />;
}
