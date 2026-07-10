"use client";

import React from "react";
import HomeTab from "../editor/components/HomeTab";
import AlphobiaModuleLayout from "../../components/AlphobiaModuleLayout";

export default function HomePage() {
  return (
    <AlphobiaModuleLayout
      title="Home Page Configuration"
      subtitle="Edit hero banner fields, trusted corporate logos, capabilities highlights, execution milestones, and marketing copy rows."
    >
      <HomeTab />
    </AlphobiaModuleLayout>
  );
}
