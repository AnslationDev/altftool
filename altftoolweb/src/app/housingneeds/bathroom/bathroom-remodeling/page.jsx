import BathroomRemodelClient from "./BathroomRemodelClient";
import "./bathroom-remodel.css";
import { buildServiceMetadata } from "../../_lib/seo";

export const metadata = buildServiceMetadata("bathroom", "bathroom-remodeling");

export default function BathroomRemodelPage() {
  return <BathroomRemodelClient />;
}
