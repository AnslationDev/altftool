import { Info } from "lucide-react";
import styles from "./DemoBrandNotice.module.css";

/**
 * Up-front disclosure for the brand-style insurance landers.
 *
 * Those pages show an invented provider so the layout can be reviewed. That
 * makes the disclosure load-bearing: it states plainly that the company does
 * not exist, so nothing on the page can be mistaken for a real insurer, a real
 * price or real advice.
 */
export default function DemoBrandNotice({ brand }) {
  return (
    <p className={styles.notice} role="note">
      <Info size={17} aria-hidden="true" />
      <span>
        <strong>Design demonstration.</strong> {brand} is not a real company — it is an example
        layout. Nothing on this page is a quote, an offer of cover, or insurance advice, and there
        is no company here to contact.
      </span>
    </p>
  );
}
