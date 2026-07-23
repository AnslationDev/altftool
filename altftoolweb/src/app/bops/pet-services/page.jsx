import BizCollection from "../components/BizCollection";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Pet Services — Grooming, Vets, Walking & More",
  description:
    "Find trusted local pet pros — grooming, mobile vet visits, dog walking, boarding and training — and get a free quote in minutes.",
  path: "/bops/pet-services",
  keywords: ["pet grooming", "mobile vet", "dog walking", "pet boarding", "dog training"],
});

export default function PetServicesPage() {
  return <BizCollection slug="pet-services" />;
}
