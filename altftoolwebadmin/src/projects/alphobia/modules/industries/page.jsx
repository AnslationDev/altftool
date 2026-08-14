"use client";

import React from "react";
import IndustriesTab from "../editor/components/IndustriesTab";
import AlphobiaModuleLayout from "../../components/AlphobiaModuleLayout";

export default function IndustriesPage() {
  return (
    <AlphobiaModuleLayout
      title="Industries Served"
      subtitle="Manage the industry/vertical cards referenced on the homepage and about page."
    >
      <IndustriesTab />
    </AlphobiaModuleLayout>
  );
}
