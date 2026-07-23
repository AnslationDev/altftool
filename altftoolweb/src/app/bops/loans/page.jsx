import BizCollection from "../components/BizCollection";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Loan Guides and Comparisons",
  description:
    "Compare personal, mortgage, auto, business, and student loan options with clear borrowing guides.",
  path: "/bops/loans",
  keywords: ["loan comparison", "personal loans", "mortgage guide", "business loans"],
});

export default function LoansPage() {
  return <BizCollection slug="loans" />;
}
