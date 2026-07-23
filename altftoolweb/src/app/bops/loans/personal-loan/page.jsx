import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("personal-loan");

export default function PersonalLoanPage() {
  return <LoanRoute slug="personal-loan" />;
}
