"use client";

import SectionManager from "../../components/SectionManager";
import { MODULE_SECTIONS } from "../../lib/schema";

export default function GrowvibeBlogAdminPage() {
  return (
    <SectionManager
      title="Blog"
      description="Manage blog page content and all articles — titles, images, bodies and categories."
      sectionKeys={MODULE_SECTIONS["blog"]}
    />
  );
}
