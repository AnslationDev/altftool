// Route wrapper that pulls in the stylesheets for an insurance vertical, then
// renders the shared InsurancePage. Load order matters: the .hn-* design
// system first, then insurance.css so its overrides win, then the AltF brand
// lockup styles.
import "@/app/housingneeds/housingneeds.css";
import "../insurance.css";
import "@/app/_altf/altf-brand.css";
import InsurancePage from "./InsurancePage";

export default function InsuranceRoute({ slug }) {
  return <InsurancePage slug={slug} />;
}
