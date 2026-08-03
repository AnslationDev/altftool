import "./top11.css";
import Top11Shell from "./components/Top11Shell";

/**
 * Section layout. Top11 ships its own header, footer and mobile bar, so
 * AltFTool's global chrome is suppressed for these routes — see the "/top11"
 * entry in platform/navigation/GlobalChromeGate.
 *
 * Mounting the shell here (rather than inside each page) keeps the header and
 * the search palette alive across client navigations instead of remounting them
 * on every route change.
 */
export default function Top11Layout({ children }) {
  return <Top11Shell>{children}</Top11Shell>;
}
