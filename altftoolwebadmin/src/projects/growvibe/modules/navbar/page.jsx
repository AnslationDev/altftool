"use client";

import SectionManager from "../../components/SectionManager";
import { MODULE_SECTIONS } from "../../lib/schema";

export default function GrowvibeNavbarAdminPage() {
  return (
    <SectionManager
      title="Navbar"
      description="Manage menu links and the header CTA button of the GrowVibe website."
      sectionKeys={MODULE_SECTIONS["navbar"]}
    />
  );
}
