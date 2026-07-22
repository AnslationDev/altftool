import LandingPage from "./pages/LandingPage.jsx";
import { buildServiceMetadata } from "../../_lib/seo";

export const metadata = buildServiceMetadata("plumbing", "plumber");

export default function PlumbingLandingPage() {
  return <LandingPage />;
}
