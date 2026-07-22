// Route wrapper that pulls in the stylesheets for a loan vertical, then
// renders the shared LoanPage. Load order matters: the .hn-* design system
// first, then loans.css so its image-free-hero overrides win, then the AltF
// brand lockup styles.
import "@/app/housingneeds/housingneeds.css";
import "../loans.css";
import "@/app/_altf/altf-brand.css";
import LoanPage from "./LoanPage";

export default function LoanRoute({ slug }) {
  return <LoanPage slug={slug} />;
}
