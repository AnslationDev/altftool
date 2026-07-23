import BathroomRemodelClient from "./BathroomRemodelClient";
import "./bathroom-remodel.css";
import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("bathroom-remodeling");

export default function BathroomRemodelPage() {
  return <BathroomRemodelClient />;
}
