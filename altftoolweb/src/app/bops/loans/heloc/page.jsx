import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("heloc");

export default function HelocPage() {
  return <LoanRoute slug="heloc" />;
}
