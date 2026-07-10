"use client";

import SectionManager from "../../components/SectionManager";
import { MODULE_SECTIONS } from "../../lib/schema";

export default function GrowvibePagesAdminPage() {
  return (
    <SectionManager
      title="Pages"
      description="Manage About, Pricing and Contact page content."
      sectionKeys={MODULE_SECTIONS["pages"]}
    />
  );
}
