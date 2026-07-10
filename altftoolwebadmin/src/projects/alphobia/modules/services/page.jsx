"use client";

import React from "react";
import ServicesTab from "../editor/components/ServicesTab";
import AlphobiaModuleLayout from "../../components/AlphobiaModuleLayout";

export default function ServicesPage() {
  return (
    <AlphobiaModuleLayout
      title="Services & FAQs Configuration"
      subtitle="Edit core services definitions, progress counters, comparison tiers, and frequently asked question items."
    >
      <ServicesTab />
    </AlphobiaModuleLayout>
  );
}
