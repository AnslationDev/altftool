import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("personal-loan");

export default function PersonalLoanPage() {
  return <LoanRoute slug="personal-loan" />;
}
