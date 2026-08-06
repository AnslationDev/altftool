import BathroomRemodelClient from "./BathroomRemodelClient";
import "./bathroom-remodel.css";
import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export async function generateMetadata() {
  const metadata = await buildHousingServiceMetadata("bathroom-remodeling");
  const description =
    "Design demonstration for a fictional bathroom-remodeling service page; no contractor, quote, consultation, credential, or service is offered.";

  return {
    ...metadata,
    description,
    openGraph: { ...metadata.openGraph, description },
    twitter: { ...metadata.twitter, description },
  };
}

export default function BathroomRemodelPage() {
  return <BathroomRemodelClient />;
}
