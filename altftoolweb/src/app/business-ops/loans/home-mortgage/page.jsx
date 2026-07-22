import LoanRoute from "@/app/business-ops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/business-ops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("home-mortgage");

export default function HomeMortgagePage() {
  return <LoanRoute slug="home-mortgage" />;
}
