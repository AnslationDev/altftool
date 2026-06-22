import { AppHubFooter, AppHubHeader } from "./components/AppHubChrome";

export default function AppsLayout({ children }) {
  return (
    <div className="bg-white">
      <AppHubHeader />
      {children}
      <AppHubFooter />
    </div>
  );
}
