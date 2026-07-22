import "./tripfindbox.css";
import "@/app/_altf/altf-brand.css";
import AltfLauncher from "@/app/_altf/AltfLauncher";

export const metadata = {
  title: "TripFindBox",
  description: "Premium AI-powered travel search and booking experience.",
  icons: {
    icon: "/tripfindbox/tripfindbox_logo.png",
    shortcut: "/tripfindbox/tripfindbox_logo.png",
    apple: "/tripfindbox/tripfindbox_logo.png",
  },
};

// TripFindBox lives inside AltFTool as a self-contained route. The AltFTool root
// layout already provides <html>/<body> and the site providers; here we only load
// the TripFindBox stylesheet and render the section. AltFTool's header/footer are
// hidden for /business-ops/tripfindbox via ChromeGate in the root layout.
// The AltFTool brand bar and footer wrap the module rather than living inside
// it, so TripFindBox's own header/footer markup is untouched.
export default function TripFindBoxLayout({ children }) {
  return (
    <>
      <div className="tripfindbox-root">{children}</div>
      <AltfLauncher />
    </>
  );
}
