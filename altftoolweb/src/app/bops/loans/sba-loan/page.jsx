import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("sba-loan");

export default function SbaLoanPage() {
  return <LoanRoute slug="sba-loan" />;
}
