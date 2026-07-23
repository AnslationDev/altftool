import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("auto-loan");

export default function AutoLoanPage() {
  return <LoanRoute slug="auto-loan" />;
}
