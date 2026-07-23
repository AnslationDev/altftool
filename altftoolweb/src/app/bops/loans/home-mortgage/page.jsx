import LoanRoute from "@/app/bops/loans/_components/LoanRoute";
import { buildLoanMetadata } from "@/app/bops/loans/_lib/metadata";

export const metadata = buildLoanMetadata("home-mortgage");

export default function HomeMortgagePage() {
  return <LoanRoute slug="home-mortgage" />;
}
