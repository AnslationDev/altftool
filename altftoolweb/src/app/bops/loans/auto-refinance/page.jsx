import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("auto-refinance");

export default function AutoRefinancePage() {
  return <LoanRoute slug="auto-refinance" />;
}
