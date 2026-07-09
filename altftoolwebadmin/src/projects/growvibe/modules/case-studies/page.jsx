"use client";

import SectionManager from "../../components/SectionManager";
import { MODULE_SECTIONS } from "../../lib/schema";

export default function GrowvibeCaseStudiesAdminPage() {
  return (
    <SectionManager
      title="Case Studies"
      description="Manage the case studies page hero, impact stats and every case study."
      sectionKeys={MODULE_SECTIONS["case-studies"]}
    />
  );
}
