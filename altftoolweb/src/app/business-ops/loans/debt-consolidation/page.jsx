import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("debt-consolidation");

export default function DebtConsolidationPage() {
  return <LoanRoute slug="debt-consolidation" />;
}
