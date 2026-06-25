import { AppHubFooter, AppHubHeader } from "./components/AppHubChrome";
import "../styles/landing.css";

export default function AppsLayout({ children }) {
  return (
    <div className="altf-home bg-[var(--background)] text-[var(--foreground)]">
      <AppHubHeader />
      {children}
      <AppHubFooter />
    </div>
  );
}
