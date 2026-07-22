import { buildServiceMetadata } from "../../_lib/seo";

const serviceMetadata = buildServiceMetadata("pest-control", "kairos");

export const metadata = {
  ...serviceMetadata,
  title: { absolute: "Termite Service Experience Preview | AltFTool" },
  description: "Preview an inspection-first termite service flow within AltFTool HousingNeeds.",
};

export default function KairosPestControlLayout({ children }) {
  return children;
}
