import "./globals.css";

export const metadata = {
  title: "QuoteNest Pros | Home Service Quotes",
  description:
    "Compare trusted local pros for kitchen, bath, HVAC, roofing, and home repairs.",
};

export default function HomeservLayout({ children }) {
  return <div className="homeserv-app">{children}</div>;
}
