"use client";

import SectionManager from "../../components/SectionManager";
import { MODULE_SECTIONS } from "../../lib/schema";

export default function GrowvibeServicesAdminPage() {
  return (
    <SectionManager
      title="Services"
      description="Manage all six service detail pages — names, descriptions, features, deliverables, stats and FAQs."
      sectionKeys={MODULE_SECTIONS["services"]}
    />
  );
}
