import { AppHubFooter, AppHubHeader } from "./components/AppHubChrome";
import "../styles/landing.css";

import AltfLauncher from "@/app/_altf/AltfLauncher";
import "@/app/_altf/altf-brand.css";
export default function AppsLayout({ children }) {
  return (
    <div className="altf-home bg-[var(--background)] text-[var(--foreground)]">
      <AppHubHeader />
      {children}
      <AppHubFooter />
      <AltfLauncher />
    </div>
  );
}
