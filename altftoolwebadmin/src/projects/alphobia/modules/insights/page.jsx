"use client";

import React from "react";
import InsightsTab from "../editor/components/InsightsTab";
import AlphobiaModuleLayout from "../../components/AlphobiaModuleLayout";

export default function InsightsPage() {
  return (
    <AlphobiaModuleLayout
      title="Insights & Guides Configuration"
      subtitle="Edit industry articles, tag labels, author bios, and main analytical copy text segments."
    >
      <InsightsTab />
    </AlphobiaModuleLayout>
  );
}
