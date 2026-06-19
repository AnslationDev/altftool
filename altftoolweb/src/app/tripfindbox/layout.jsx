import "./tripfindbox.css";

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
// hidden for /tripfindbox via ChromeGate in the root layout.
export default function TripFindBoxLayout({ children }) {
  return <div className="tripfindbox-root">{children}</div>;
}
