"use client";

import SectionManager from "../../components/SectionManager";
import { MODULE_SECTIONS } from "../../lib/schema";

export default function GrowvibeFooterAdminPage() {
  return (
    <SectionManager
      title="Footer"
      description="Manage footer description, contact details, socials and newsletter text."
      sectionKeys={MODULE_SECTIONS["footer"]}
    />
  );
}
