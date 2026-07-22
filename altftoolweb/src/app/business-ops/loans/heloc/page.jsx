import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("heloc");

export default function HelocPage() {
  return <LoanRoute slug="heloc" />;
}
