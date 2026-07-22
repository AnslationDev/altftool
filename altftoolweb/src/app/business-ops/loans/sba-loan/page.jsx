import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("sba-loan");

export default function SbaLoanPage() {
  return <LoanRoute slug="sba-loan" />;
}
