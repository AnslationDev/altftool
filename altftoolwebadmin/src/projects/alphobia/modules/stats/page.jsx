"use client";

import React from "react";
import StatsTab from "../editor/components/StatsTab";
import AlphobiaModuleLayout from "../../components/AlphobiaModuleLayout";

export default function StatsPage() {
  return (
    <AlphobiaModuleLayout
      title="Stats Configuration"
      subtitle="Configure the headline performance counters (impressions, ad spend, ROI) shown across the site."
    >
      <StatsTab />
    </AlphobiaModuleLayout>
  );
}
