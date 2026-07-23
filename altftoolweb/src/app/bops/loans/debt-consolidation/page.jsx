import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("debt-consolidation");

export default function DebtConsolidationPage() {
  return <LoanRoute slug="debt-consolidation" />;
}
