import HousingServicesHub from "./_components/HousingServicesHub";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Housing Services — Home Service Providers by Category",
  description:
    "A directory of trusted home-service providers — roofing, plumbing, HVAC, security, moving and more. Pick a provider and get a free quote in minutes.",
  path: "/bops/housing-services",
  keywords: ["home services", "roofing contractor", "plumber", "hvac service", "movers"],
});

export default function HousingServicesPage() {
  return <HousingServicesHub />;
}
