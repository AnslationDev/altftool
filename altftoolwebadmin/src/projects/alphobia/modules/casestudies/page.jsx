"use client";

import React from "react";
import CaseStudiesTab from "../editor/components/CaseStudiesTab";
import AlphobiaModuleLayout from "../../components/AlphobiaModuleLayout";

export default function CaseStudiesPage() {
  return (
    <AlphobiaModuleLayout
      title="Case Studies Configuration"
      subtitle="Expose proof sheets showing client results, growth achievements, and case report summaries."
    >
      <CaseStudiesTab />
    </AlphobiaModuleLayout>
  );
}
