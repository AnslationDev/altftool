"use client";

import SectionManager from "../../components/SectionManager";
import { MODULE_SECTIONS } from "../../lib/schema";

export default function GrowvibeHomeAdminPage() {
  return (
    <SectionManager
      title="Home Page"
      description="Manage every section of the GrowVibe homepage — hero, services, why us, process, stats, testimonials, FAQ and CTA."
      sectionKeys={MODULE_SECTIONS["home"]}
    />
  );
}
